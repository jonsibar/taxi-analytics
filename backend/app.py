import sys
import os
import duckdb
import joblib
import pandas as pd
import traceback
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', 'data', 'taxi.duckdb')
MODEL_PATH = os.path.join(BASE_DIR, 'trip_duration_model.pkl')
sys.path.append(BASE_DIR)
try:
    import taxi_utils
except ImportError:
    print("[WARNING] 'taxi_utils.py' is empty or missing. Prediction endpoint will fail.")
    taxi_utils = None
app = FastAPI(
    title="NYC Taxi Analytics API",
    description="API for exploring taxi trips and predicting duration.",
    version="1.0.0",
    root_path="/api"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)
model = None
@app.on_event("startup")
async def load_model():
    """Loads the ML model into memory once when the server starts."""
    global model
    if os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 0:
        try:
            model = joblib.load(MODEL_PATH)
            print(f"[INFO] Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"[ERROR] Failed to load model: {e}")
    else:
        print(f"[WARNING] Model file not found or empty at {MODEL_PATH}")
def get_db_connection():
    """Connects to DuckDB in read-only mode to prevent file locks."""
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Database file not found. Run ETL first.")
    return duckdb.connect(DB_PATH, read_only=True)
class TripResponse(BaseModel):
    vendor_id: int
    pickup_datetime: str
    passenger_count: int
    trip_duration: int
class PredictionInput(BaseModel):
    vendor_id: int
    passenger_count: int
    pickup_longitude: float
    pickup_latitude: float
    dropoff_longitude: float
    dropoff_latitude: float
    store_and_fwd_flag: str
    pickup_datetime: str 
@app.get("/")
def health_check():
    return {"status": "active", "db_path": DB_PATH}
@app.get("/trips")
def get_trips(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=5000, description="Items per page"),
    vendor_id: Optional[int] = Query(None, description="Filter by Vendor ID"),
    passenger_count: Optional[int] = Query(None, description="Filter by Passenger Count"),
    pickup_day: Optional[int] = Query(None, ge=0, le=6, description="0=Monday, 6=Sunday"),
    min_duration: Optional[int] = Query(None, description="Minimum duration in seconds"),
    max_duration: Optional[int] = Query(None, description="Maximum duration in seconds")
):
    offset = (page - 1) * limit
    conn = get_db_connection()
    try:
        where_clauses = ["1=1"]
        params = []
        if vendor_id is not None:
            where_clauses.append("vendor_id = ?")
            params.append(vendor_id)
        if passenger_count is not None:
            where_clauses.append("passenger_count = ?")
            params.append(passenger_count)
        if pickup_day is not None:
            where_clauses.append("dayofweek(pickup_datetime) = ?")
            params.append(pickup_day)
        if min_duration is not None:
            where_clauses.append("trip_duration >= ?")
            params.append(min_duration)
        if max_duration is not None:
            where_clauses.append("trip_duration <= ?")
            params.append(max_duration)
        where_str = " AND ".join(where_clauses)
        data_query = f"""
            SELECT * FROM trips 
            WHERE {where_str}
            ORDER BY pickup_datetime DESC
            LIMIT ? OFFSET ?
        """
        df = conn.execute(data_query, params + [limit, offset]).fetch_df()
        count_query = f"SELECT COUNT(*) FROM trips WHERE {where_str}"
        total_rows = conn.execute(count_query, params).fetchone()[0]
        return {
            "data": df.to_dict(orient="records"),
            "pagination": {
                "page": page,
                "limit": limit,
                "total_rows": total_rows,
                "total_pages": (total_rows // limit) + 1
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
@app.post("/predict")
def predict_duration(input_data: PredictionInput):
    """
    Predicts trip duration using the loaded XGBoost model.
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    if not taxi_utils:
         raise HTTPException(status_code=500, detail="taxi_utils module missing.")
    try:
        data = input_data.dict()
        flag_val = data.get('store_and_fwd_flag', 'N')
        data['store_and_fwd_flag'] = 1 if flag_val == 'Y' else 0
        if 'pickup_datetime' in data:
            dt = pd.to_datetime(data['pickup_datetime'])
            data['pickup_year'] = dt.year
            data['pickup_month'] = dt.month
            data['pickup_day'] = dt.day
            data['pickup_hour'] = dt.hour
            data['pickup_minute'] = dt.minute
            data['pickup_second'] = dt.second
            del data['pickup_datetime']
        df = pd.DataFrame([data])
        prediction = taxi_utils.predict_xgb(model, df)
        print(f"DEBUG: Prediction Type: {type(prediction)}")
        print(f"DEBUG: Prediction Shape: {getattr(prediction, 'shape', 'N/A')}")
        print(f"DEBUG: Prediction Value: \n{prediction}")
        val = 0.0
        if isinstance(prediction, pd.DataFrame):
            val = prediction.iloc[0, 0]
        elif isinstance(prediction, pd.Series):
            val = prediction.iloc[0]
        else:
            val = np.array(prediction).flatten()[0]
        return {"predicted_trip_duration": float(val)}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")
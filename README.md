# 🚖 Taxi Trip Analytics & Prediction Platform

An end-to-end data engineering and web application solution designed to analyze high-volume NYC taxi trip data. This platform combines a high-performance columnar data warehouse, a robust REST API, and a modern geospatial dashboard to provide historical insights and real-time ML travel time predictions.

![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20DuckDB-cyan)

## 🛠 Tech Stack

* **Frontend:** Next.js, Tailwind CSS, Leaflet (Maps)
* **Backend:** FastAPI, Uvicorn, Pandas
* **Database:** DuckDB (Columnar OLAP)
* **Machine Learning:** XGBoost, Scikit-Learn
* **Infrastructure:** Docker & Docker Compose

## 🏗️ Pipeline Architecture

**`[Raw CSV] -> [Python ETL] -> [DuckDB Storage] -> [FastAPI Service] -> [Next.js Dashboard]`**

1.  **Ingestion Layer (ETL):** A Python script reads the raw NYC Taxi CSV, sanitizes the data (removing invalid trips), and loads it into a persistent **DuckDB** file (`taxi.duckdb`).
2.  **Storage Layer:** **DuckDB** serves as the embedded analytical engine, allowing for sub-second aggregations on millions of rows without the overhead of a dedicated SQL server.
3.  **Backend Layer (API):** **FastAPI** exposes REST endpoints. It handles database queries and loads the pre-trained **XGBoost** model (`.pkl`) into memory for real-time inference.
4.  **Frontend Layer (UI):** **Next.js** provides a reactive interface. It uses **Leaflet** for mapping and **Tailwind CSS** for a responsive, high-density layout.

---


## 📂 Project Structure

```text
taxi-analytics/
├── backend/                # Python FastAPI Service
│   ├── app.py              # Main API Server
│   ├── etl/                # Data Ingestion Scripts
│   │   └── ingest.py       # ETL Logic
│   ├── taxi_utils.py       # ML Utility Helper
│   └── trip_duration_model.pkl # Pre-trained Model
├── frontend/               # Next.js Web Application
│   ├── components/         # Map & Layout Components
│   ├── pages/              # Dashboard & Predict Pages
│   └── services/           # API Client
├── data/                   # Data Storage (Git Ignored)
│   ├── raw/                # Place train.csv here
│   └── taxi.duckdb         # Generated DB
└── compose.yml             # Docker Orchestration
```

## 🚀 Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/jonsibar/taxi-analytics.git
cd taxi-analytics
```

### 2. Prepare Data

> ⚠️ **Note:** The dataset is not included.

1.  Download the `train.zip` from [Kaggle - NYC Taxi Trip Duration](https://www.kaggle.com/c/nyc-taxi-trip-duration/data).
2.  Extract `train.csv`.
3.  Place it in the project folder at: `data/raw/train.csv`.

### 3. Run ETL Pipeline

Before starting the app, you must generate the database file. We use a temporary Docker container to run the ingestion script.

```bash
docker compose run --rm backend python etl/ingest.py
```

### 4. Launch the Application

Once the database is ready, start the services.

```bash
docker compose up --build
````

### 5\. Access the Platform

  * **Frontend Dashboard:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
  * **Backend API Docs:** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)

-----

## 📡 API Documentation

The backend exposes two primary endpoints.

### 1\. Trip Explorer

Retrieves paginated historical trip data with optional filtering.

  * **Endpoint:** `GET /trips`
  * **Parameters:** `page`, `limit`, `vendor_id`, `passenger_count`, `min_duration`, `max_duration`.

**Example Request:**

```http
GET /trips?page=1&limit=5&vendor_id=2
```

**Example Response:**

```json
{
  "data": [
    {
      "vendor_id": 2,
      "pickup_datetime": "2016-03-14 17:24:55",
      "passenger_count": 1,
      "trip_duration": 400,
      "pickup_longitude": -73.98,
      "pickup_latitude": 40.75
    }
  ],
  "pagination": {
    "page": 1,
    "total_pages": 29173,
    "total_rows": 1458644
  }
}
```

### 2\. ML Prediction

Predicts trip duration using the XGBoost model.

  * **Endpoint:** `POST /predict`
  * **Body:** JSON object containing trip features.

**Example Request:**

```json
{
  "vendor_id": 1,
  "passenger_count": 1,
  "pickup_longitude": -73.9851,
  "pickup_latitude": 40.7589,
  "dropoff_longitude": -73.9900,
  "dropoff_latitude": 40.7400,
  "store_and_fwd_flag": "N",
  "pickup_datetime": "2016-06-01 12:00:00"
}
```

**Example Response:**

```json
{
  "predicted_trip_duration": 450.5
}
```

-----

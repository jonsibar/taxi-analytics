import duckdb
import os
import time
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(script_dir, '../../'))
csv_path = os.path.join(project_root, 'data', 'raw', 'train.csv')
db_path = os.path.join(project_root, 'data', 'taxi.duckdb')
def run_etl():
    print(f"--- Starting ETL Pipeline ---")
    print(f"Looking for data at: {csv_path}")
    if not os.path.exists(csv_path):
        print(f"\n[ERROR] File not found: {csv_path}")
        print("Please move 'train.csv' to the 'taxi-analytics/data/raw/' folder.")
        return
    start_time = time.time()
    print(f"Connecting to database at: {db_path}")
    conn = duckdb.connect(db_path)
    print("Ingesting and cleaning data (this may take 30-60 seconds)...")
    query = f"""
    CREATE OR REPLACE TABLE trips AS 
    SELECT 
        id,
        vendor_id,
        pickup_datetime,
        dropoff_datetime,
        passenger_count,
        pickup_longitude,
        pickup_latitude,
        dropoff_longitude,
        dropoff_latitude,
        store_and_fwd_flag,
        trip_duration
    FROM read_csv('{csv_path}', header=True, auto_detect=True)
    WHERE trip_duration > 60 AND passenger_count > 0;
    """
    try:
        conn.execute(query)
        print("Creating indexes for faster querying...")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_pickup ON trips(pickup_datetime);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_vendor ON trips(vendor_id);")
        row_count = conn.execute("SELECT COUNT(*) FROM trips").fetchone()[0]
        print(f"\n[SUCCESS] Loaded {row_count:,} rows into {db_path}")
    except Exception as e:
        print(f"\n[ERROR] ETL Failed: {e}")
    finally:
        conn.close()
    elapsed = time.time() - start_time
    print(f"--- Finished in {elapsed:.2f} seconds ---")
if __name__ == "__main__":
    run_etl()
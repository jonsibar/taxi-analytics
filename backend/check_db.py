import duckdb
import os
import pandas as pd
DB_PATH = '../data/taxi.duckdb'
def inspect_db():
    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        return
    print(f"--- Inspecting {DB_PATH} ---")
    conn = duckdb.connect(DB_PATH, read_only=True)
    try:
        print("\n[Table Schema]")
        schema = conn.execute("DESCRIBE trips;").fetch_df()
        print(schema[['column_name', 'column_type']])
        count = conn.execute("SELECT COUNT(*) FROM trips").fetchone()[0]
        print(f"\n[Total Rows]: {count:,}")
        print("\n[Sample Data - First 3 Rows]")
        df = conn.execute("SELECT * FROM trips LIMIT 3").fetch_df()
        print(df)
    except Exception as e:
        print(f"Error reading database: {e}")
    finally:
        conn.close()
if __name__ == "__main__":
    inspect_db()
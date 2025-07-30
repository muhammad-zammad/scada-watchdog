# main.py
import pyodbc
import time
import logging
from supabase import create_client, Client

# ---------- CONFIGURATION ---------- #

access_db_path = r"D:\\SCADA\\LiveData.accdb"  # Update this path
SUPABASE_URL = "https://your-project.supabase.co"  # Replace with actual
SUPABASE_KEY = "your-secret-key"
TABLE_NAME = "scada_data"
poll_interval = 1  # seconds

# ---------- LOGGING ---------- #
logging.basicConfig(
    filename="scada_sync.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# ---------- DATABASE CONNECTIONS ---------- #

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

conn_str = (
    r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
    f'DBQ={access_db_path};'
)

conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# ---------- POLLING LOOP ---------- #

last_uploaded_id = None

print("⏳ Monitoring Access DB and uploading to Supabase...")

while True:
    try:
        cursor.execute("SELECT * FROM LiveTable ORDER BY ID DESC")
        row = cursor.fetchone()

        if row:
            current_id = row.ID

            if current_id != last_uploaded_id:
                data = {
                    "id": row.ID,
                    "tag": row.Tag,
                    "value": row.Value,
                    "timestamp": row.Timestamp
                }
                supabase.table(TABLE_NAME).insert(data).execute()
                print(f"✅ Uploaded new row: {data}")
                logging.info(f"Uploaded: {data}")
                last_uploaded_id = current_id

        time.sleep(poll_interval)

    except Exception as e:
        logging.error(f"Error: {e}")
        print(f"❌ Error: {e}")
        time.sleep(5)

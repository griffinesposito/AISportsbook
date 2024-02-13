import psycopg2
from psycopg2 import pool

# Define the connection pool
connection_pool = psycopg2.pool.SimpleConnectionPool(
    1, # Minimum number of connections
    10, # Maximum number of connections
    user="espositogriffin",
    password="xqjY0Udl4aFf",
    host="ep-old-sky-a5vq08oi-pooler.us-east-2.aws.neon.tech",
    port="5432",
    database="ai-sportsbook-db",
    sslmode="require"
)

try:
    # Get a connection from the pool
    conn = connection_pool.getconn()
    if conn:
        print("Successfully received a connection from the connection pool ")
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print("Database version:", version)
        cur.close()
        # Put the connection back in the pool
        connection_pool.putconn(conn)
except (Exception, psycopg2.DatabaseError) as error:
    print("Error while connecting to PostgreSQL", error)
finally:
    # Close the connection pool
    connection_pool.closeall()
    print("PostgreSQL connection pool is closed")
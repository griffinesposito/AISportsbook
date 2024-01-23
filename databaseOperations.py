
import psycopg2.pool
import os

# Create a connection pool with a min_size of 0 and a max_size of 80
# Use the `DATABASE_URL` environment variable we provide to connect to the Database
# It is included in your Replit environment automatically (no need to set it up)
database_url = os.getenv('DATABASE_URL')
pool = psycopg2.pool.SimpleConnectionPool(0, 80, database_url)


def check_table_and_create(tableName):
    # SQL query to check for the existence of the table
    check_table_query = f"""
    SELECT EXISTS (
        SELECT FROM 
            pg_catalog.pg_class c
        JOIN 
            pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE 
            n.nspname = 'public' AND 
            c.relname = '{tableName}' AND 
            c.relkind = 'r'
    );
    """

    # SQL query to create the table
    create_table_query = f"""
    CREATE TABLE {tableName} (
        id SERIAL PRIMARY KEY,
        column1 VARCHAR(255),
        column2 INT
        -- Add more columns as needed
    );
    """
    # Get a connection from the pool
    conn = pool.getconn()
    # Create a cursor using the connection
    cursor = conn.cursor()
    # Check if the table exists
    cursor.execute(check_table_query)
    if not cursor.fetchone()[0]:
        # If the table does not exist, create it
        cursor.execute(create_table_query)
        conn.commit()

    cursor.close()
    conn.close()

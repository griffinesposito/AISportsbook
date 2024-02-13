

def create_team_table(cursor, conn, tableName):
    """
    Creates a team table.
    """
    # SQL query to create the team table
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {tableName} (
        id SERIAL PRIMARY KEY,
        teamName VARCHAR(255),
        fullName VARCHAR(255),
        teamId VARCHAR(255) UNIQUE,
        href VARCHAR(255)
        -- Add more columns as needed
    );
    """
    cursor.execute(create_table_query)
    conn.commit()

def create_player_table(cursor, conn, tableName, teamTableName):
    """
    Creates a player table with a foreign key linking to the team table.
    """
    # SQL query to create the player table
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {tableName} (
        id SERIAL PRIMARY KEY,
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        displayName VARCHAR(255),
        position VARCHAR(255),
        teamId VARCHAR(255),
        playerId VARCHAR(255) UNIQUE,
        href VARCHAR(255),
        FOREIGN KEY (teamId) REFERENCES {teamTableName}(teamId)
        -- Add more columns as needed
    );
    """
    cursor.execute(create_table_query)
    conn.commit()

def openConnectionPool():
    import psycopg2
    from psycopg2 import pool

    # Define the connection pool
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        1, # Minimum number of connections
        800, # Maximum number of connections
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
            return connection_pool
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error while connecting to PostgreSQL", error)
        

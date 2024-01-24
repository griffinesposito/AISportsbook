

def create_player_table(cursor,conn,tableName):
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
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        displayName VARCHAR(255),
        position VARCHAR(255),
        teamId   VARCHAR(255),
        playerId VARCHAR(255)
        -- Add more columns as needed
    );
    """
    # Check if the table exists
    cursor.execute(check_table_query)
    if not cursor.fetchone()[0]:
        # If the table does not exist, create it
        cursor.execute(create_table_query)
        conn.commit()

def create_team_table(cursor,conn,tableName):
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
        teamName VARCHAR(255),
        fullName VARCHAR(255),
        teamId   VARCHAR(255)
        -- Add more columns as needed
    );
    """
    # Check if the table exists
    cursor.execute(check_table_query)
    if not cursor.fetchone()[0]:
        # If the table does not exist, create it
        cursor.execute(create_table_query)
        conn.commit()
        

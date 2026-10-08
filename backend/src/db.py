import pymysql

def get_connection(db_config):
    return pymysql.connect(**db_config)
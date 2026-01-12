import psycopg2
import os

# Configuración de conexión
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'proyecto_gestion_pedidos')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'YmVzFstF')

# Consulta para obtener los CREATE TABLE
QUERY = """
SELECT 'CREATE TABLE ' || tablename || E' (\n' ||
  string_agg('    ' || column_name || ' ' || type ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
    CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END, ',\n')
  || E'\n);' as create_table_sql
FROM (
  SELECT c.relname as tablename, a.attname as column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) as type,
    CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END as is_nullable,
    pg_get_expr(ad.adbin, ad.adrelid) as column_default
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid
  LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
  WHERE c.relkind = 'r' AND n.nspname = 'public' AND a.attnum > 0
  ORDER BY c.relname, a.attnum
) t
GROUP BY tablename
ORDER BY tablename;
"""

def main():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cur = conn.cursor()
    cur.execute(QUERY)
    results = cur.fetchall()
    with open('esquema_creado_postgres.sql', 'w', encoding='utf-8') as f:
        for row in results:
            f.write(row[0] + '\n\n')
    print('✅ Esquema exportado a esquema_creado_postgres.sql')
    cur.close()
    conn.close()

if __name__ == '__main__':
    main()

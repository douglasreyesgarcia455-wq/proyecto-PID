"""
Script para inspeccionar la base de datos PostgreSQL existente.
Genera un reporte detallado de todas las tablas, columnas, tipos y relaciones.
"""
import psycopg2
from psycopg2 import sql
import json

# Configuración de conexión
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'proyecto_gestion_pedidos',
    'user': 'postgres',
    'password': 'YmVzFstF'
}

def inspect_database():
    """Conecta y analiza la estructura de la base de datos"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("=" * 80)
        print("INSPECCIÓN DE BASE DE DATOS: proyecto_gestion_pedidos")
        print("=" * 80)
        
        # Obtener listado de tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        if not tables:
            print("\n⚠️  No se encontraron tablas en la base de datos.")
            print("La base de datos existe pero está vacía.")
            return
        
        print(f"\n📊 TABLAS ENCONTRADAS: {len(tables)}")
        print("-" * 80)
        
        db_structure = {}
        
        for (table_name,) in tables:
            print(f"\n🗂️  TABLA: {table_name}")
            print("=" * 80)
            
            # Obtener columnas y tipos
            cursor.execute("""
                SELECT 
                    column_name, 
                    data_type, 
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = %s
                ORDER BY ordinal_position;
            """, (table_name,))
            
            columns = cursor.fetchall()
            db_structure[table_name] = {
                'columns': [],
                'primary_keys': [],
                'foreign_keys': []
            }
            
            print("\n📋 COLUMNAS:")
            for col_name, data_type, max_length, is_nullable, col_default in columns:
                length_info = f"({max_length})" if max_length else ""
                nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                default = f"DEFAULT {col_default}" if col_default else ""
                
                print(f"  • {col_name:30} {data_type}{length_info:15} {nullable:10} {default}")
                
                db_structure[table_name]['columns'].append({
                    'name': col_name,
                    'type': data_type,
                    'length': max_length,
                    'nullable': is_nullable == "YES",
                    'default': col_default
                })
            
            # Obtener claves primarias
            cursor.execute("""
                SELECT a.attname
                FROM pg_index i
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE i.indrelid = %s::regclass AND i.indisprimary;
            """, (table_name,))
            
            primary_keys = cursor.fetchall()
            if primary_keys:
                print("\n🔑 CLAVES PRIMARIAS:")
                for (pk,) in primary_keys:
                    print(f"  • {pk}")
                    db_structure[table_name]['primary_keys'].append(pk)
            
            # Obtener claves foráneas
            cursor.execute("""
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                  AND tc.table_name = %s;
            """, (table_name,))
            
            foreign_keys = cursor.fetchall()
            if foreign_keys:
                print("\n🔗 CLAVES FORÁNEAS:")
                for col, ref_table, ref_col in foreign_keys:
                    print(f"  • {col} → {ref_table}({ref_col})")
                    db_structure[table_name]['foreign_keys'].append({
                        'column': col,
                        'references_table': ref_table,
                        'references_column': ref_col
                    })
            
            print("-" * 80)
        
        # Guardar estructura en JSON
        with open('db_structure.json', 'w', encoding='utf-8') as f:
            json.dump(db_structure, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Inspección completada. Estructura guardada en: db_structure.json")
        
        cursor.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ ERROR DE CONEXIÓN:")
        print(f"   {e}")
        print("\n🔧 Verifica:")
        print("   1. PostgreSQL está corriendo")
        print("   2. La base de datos 'proyecto_gestion_pedidos' existe")
        print("   3. Las credenciales son correctas")
        print("   4. El puerto 5432 está disponible")
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {e}")

if __name__ == "__main__":
    inspect_database()

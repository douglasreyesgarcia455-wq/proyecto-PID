"""
Inspección simple de la base de datos para obtener estructura
"""
import psycopg2
from psycopg2 import sql

def conectar():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="proyecto_gestion_pedidos",
        user="postgres",
        password="YmVzFstF"
    )

def obtener_tablas():
    conn = conectar()
    cur = conn.cursor()
    
    # Obtener todas las tablas
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    
    tablas = [row[0] for row in cur.fetchall()]
    
    resultado = {}
    
    for tabla in tablas:
        # Obtener columnas
        cur.execute("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = %s
            ORDER BY ordinal_position
        """, (tabla,))
        
        columnas = []
        for col in cur.fetchall():
            columnas.append({
                'nombre': col[0],
                'tipo': col[1],
                'nullable': col[2] == 'YES',
                'default': col[3]
            })
        
        # Obtener claves foráneas
        cur.execute("""
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
            AND tc.table_name = %s
        """, (tabla,))
        
        fks = []
        for fk in cur.fetchall():
            fks.append({
                'columna': fk[0],
                'tabla_referenciada': fk[1],
                'columna_referenciada': fk[2]
            })
        
        # Obtener primary key
        cur.execute("""
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_name = %s
        """, (tabla,))
        
        pks = [row[0] for row in cur.fetchall()]
        
        resultado[tabla] = {
            'columnas': columnas,
            'primary_keys': pks,
            'foreign_keys': fks
        }
    
    cur.close()
    conn.close()
    
    return resultado

if __name__ == "__main__":
    import json
    tablas = obtener_tablas()
    
    print("=== ESTRUCTURA DE BASE DE DATOS ===\n")
    
    for tabla, info in tablas.items():
        print(f"\nTabla: {tabla}")
        print(f"  Primary Keys: {', '.join(info['primary_keys']) if info['primary_keys'] else 'Ninguna'}")
        print("  Columnas:")
        for col in info['columnas']:
            pk_marker = " [PK]" if col['nombre'] in info['primary_keys'] else ""
            nullable_marker = "" if col['nullable'] else " NOT NULL"
            print(f"    - {col['nombre']}: {col['tipo']}{pk_marker}{nullable_marker}")
        
        if info['foreign_keys']:
            print("  Foreign Keys:")
            for fk in info['foreign_keys']:
                print(f"    - {fk['columna']} -> {fk['tabla_referenciada']}.{fk['columna_referenciada']}")
    
    # Guardar en JSON para uso posterior
    with open("estructura_bd.json", "w", encoding="utf-8") as f:
        json.dump(tablas, f, indent=2, ensure_ascii=False)
    
    print("\n\nEstructura guardada en estructura_bd.json")

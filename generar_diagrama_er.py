"""
Generador de Diagrama ER para Draw.io basado en la estructura de la BD
"""
import json

def generar_diagrama_er():
    with open("estructura_bd.json", "r", encoding="utf-8") as f:
        estructura = json.load(f)
    
    # Dimensiones y posiciones
    ancho_tabla = 200
    alto_fila = 25
    margen_x = 50
    margen_y = 50
    espacio_x = 250
    espacio_y = 100
    
    # Organizarlas tablas principales en cuadrícula
    tablas_principales = [
        'usuarios', 'clientes', 'productos', 'pedidos',
        'detalles_pedido', 'pagos', 'devoluciones', 'proveedores',
        'compras', 'detalles_compra', 'contactos_clientes', 'logs_acciones'
    ]
    
    # Calcular posiciones
    columnas = 4
    posiciones = {}
    for i, tabla in enumerate(tablas_principales):
        if tabla in estructura:
            fila = i // columnas
            col = i % columnas
            x = margen_x + col * (ancho_tabla + espacio_x)
            y = margen_y + fila * (200 + espacio_y)
            posiciones[tabla] = (x, y)
    
    # Generar XML Draw.io
    xml = '''<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="65bd71144e">
  <diagram id="ER" name="Diagrama ER">
    <mxGraphModel dx="1500" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="1000" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        
'''
    
    cell_id = 100
    
    # Generar tablas
    for tabla, (x, y) in posiciones.items():
        if tabla not in estructura:
            continue
            
        info = estructura[tabla]
        columnas = info['columnas']
        alto_tabla = alto_fila + len(columnas) * alto_fila
        
        # Rectángulo de la tabla
        xml += f'''        <!-- Tabla: {tabla} -->
        <mxCell id="{cell_id}" value="{tabla.upper()}" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="{x}" y="{y}" width="{ancho_tabla}" height="{alto_tabla}" as="geometry"/>
        </mxCell>
'''
        cell_id += 1
        tabla_id = cell_id - 1
        
        # Columnas
        for col in columnas:
            nombre = col['nombre']
            tipo = col['tipo']
            es_pk = nombre in info['primary_keys']
            es_fk = any(fk['columna'] == nombre for fk in info['foreign_keys'])
            
            # Icono
            if es_pk:
                icono = "🔑 "
            elif es_fk:
                icono = "🔗 "
            else:
                icono = ""
            
            # Formato
            tipo_corto = tipo.replace('character varying', 'varchar').replace('timestamp without time zone', 'timestamp').replace('integer', 'int')
            
            label = f"{icono}{nombre}: {tipo_corto}"
            if es_pk or not col['nullable']:
                font_style = "fontStyle=1"  # Bold
            else:
                font_style = "fontStyle=0"
            
            xml += f'''        <mxCell id="{cell_id}" value="{label}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=10;{font_style}" vertex="1" parent="{tabla_id}">
          <mxGeometry y="{26 + columnas.index(col) * alto_fila}" width="{ancho_tabla}" height="{alto_fila}" as="geometry"/>
        </mxCell>
'''
            cell_id += 1
    
    # Generar relaciones (Foreign Keys)
    for tabla, (x, y) in posiciones.items():
        if tabla not in estructura:
            continue
            
        info = estructura[tabla]
        
        for fk in info['foreign_keys']:
            tabla_ref = fk['tabla_referenciada']
            if tabla_ref not in posiciones:
                continue
            
            # Buscar IDs de las tablas
            tabla_source = None
            tabla_target = None
            
            for t, (tx, ty) in posiciones.items():
                if t == tabla:
                    tabla_source = t
                if t == tabla_ref:
                    tabla_target = t
            
            if tabla_source and tabla_target:
                xml += f'''        <!-- FK: {tabla}.{fk['columna']} -> {tabla_ref}.{fk['columna_referenciada']} -->
        <mxCell id="{cell_id}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=ERmany;startArrow=ERone;startFill=0;endFill=0;strokeWidth=2;strokeColor=#6c8ebf;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="{posiciones[tabla_source][0] + ancho_tabla}" y="{posiciones[tabla_source][1] + 50}" as="sourcePoint"/>
            <mxPoint x="{posiciones[tabla_target][0]}" y="{posiciones[tabla_target][1] + 50}" as="targetPoint"/>
          </mxGeometry>
        </mxCell>
'''
                cell_id += 1
    
    xml += '''      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''
    
    with open("diagrama_er.drawio", "w", encoding="utf-8") as f:
        f.write(xml)
    
    print("✅ Diagrama ER generado: diagrama_er.drawio")
    return "diagrama_er.drawio"

if __name__ == "__main__":
    generar_diagrama_er()

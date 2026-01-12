#!/usr/bin/env python
"""
Script para exportar diagrama Draw.io a PNG.
"""
import subprocess
import os

drawio_exe = r"C:\Program Files\draw.io\draw.io.exe"
input_file = r"diagramas_analisis\diagrama_er_completo.drawio"
output_file = r"diagramas_analisis\diagrama_er_completo.png"

if not os.path.exists(drawio_exe):
    print(f"❌ Draw.io no encontrado en: {drawio_exe}")
    exit(1)

if not os.path.exists(input_file):
    print(f"❌ Archivo de entrada no encontrado: {input_file}")
    exit(1)

print(f"📤 Exportando diagrama ER a PNG...")
print(f"   Input:  {input_file}")
print(f"   Output: {output_file}")

try:
    result = subprocess.run(
        [
            drawio_exe,
            "--export",
            "--format", "png",
            "--output", output_file,
            input_file,
            "--width", "2400",
            "--transparent"
        ],
        capture_output=True,
        text=True,
        timeout=30
    )
    
    if result.returncode == 0:
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file) / 1024
            print(f"✅ Diagrama exportado exitosamente")
            print(f"   Tamaño: {file_size:.1f} KB")
        else:
            print("⚠️ El comando terminó pero no se encontró el archivo PNG")
    else:
        print(f"❌ Error en la exportación (código: {result.returncode})")
        if result.stderr:
            print(f"   Error: {result.stderr}")
        if result.stdout:
            print(f"   Output: {result.stdout}")
            
except subprocess.TimeoutExpired:
    print("❌ Timeout: La exportación tardó más de 30 segundos")
except Exception as e:
    print(f"❌ Error inesperado: {e}")

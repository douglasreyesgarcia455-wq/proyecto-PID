"""
Security check script - Verify security configuration before running the app
"""
import os
import sys
from pathlib import Path


def check_security():
    """Run security checks"""
    print("=" * 80)
    print("🔒 VERIFICACIÓN DE SEGURIDAD")
    print("=" * 80)
    
    issues = []
    warnings = []
    
    # Check 1: .env file exists
    print("\n1️⃣  Verificando archivo .env...")
    env_file = Path(".env")
    if not env_file.exists():
        issues.append("❌ Archivo .env NO existe. Copia .env.example a .env")
    else:
        print("   ✅ Archivo .env encontrado")
        
        # Check 2: .env has required variables
        print("\n2️⃣  Verificando variables requeridas...")
        required_vars = [
            "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD",
            "SECRET_KEY"
        ]
        
        env_content = env_file.read_text()
        for var in required_vars:
            if f"{var}=" not in env_content:
                issues.append(f"❌ Variable {var} no encontrada en .env")
            else:
                print(f"   ✅ {var} configurado")
        
        # Check 3: SECRET_KEY is not default
        print("\n3️⃣  Verificando SECRET_KEY...")
        if "CHANGE_THIS" in env_content or "change-this" in env_content:
            issues.append("❌ SECRET_KEY usa valor por defecto. Genera uno nuevo con: openssl rand -hex 32")
        elif "your-secret-key" in env_content or "your_secret_key" in env_content:
            issues.append("❌ SECRET_KEY usa valor de ejemplo. Genera uno nuevo con: openssl rand -hex 32")
        else:
            print("   ✅ SECRET_KEY parece personalizado")
        
        # Check 4: DB_PASSWORD is set
        print("\n4️⃣  Verificando DB_PASSWORD...")
        if "DB_PASSWORD=" in env_content:
            lines = [l for l in env_content.split('\n') if l.startswith('DB_PASSWORD=')]
            if lines:
                password_line = lines[0]
                if "your_secure_password_here" in password_line or "CHANGE" in password_line:
                    issues.append("❌ DB_PASSWORD usa valor por defecto. Configura tu contraseña real")
                elif "DB_PASSWORD=" == password_line.strip() or "DB_PASSWORD=''" in password_line:
                    issues.append("❌ DB_PASSWORD está vacío")
                else:
                    print("   ✅ DB_PASSWORD está configurado")
    
    # Check 5: .gitignore includes .env
    print("\n5️⃣  Verificando .gitignore...")
    gitignore = Path(".gitignore")
    if not gitignore.exists():
        issues.append("❌ Archivo .gitignore NO existe")
    else:
        gitignore_content = gitignore.read_text()
        if ".env" not in gitignore_content:
            issues.append("❌ .env NO está en .gitignore - RIESGO DE EXPOSICIÓN")
        else:
            print("   ✅ .env está protegido en .gitignore")
    
    # Check 6: No credentials in source code
    print("\n6️⃣  Verificando código fuente...")
    suspicious_patterns = [
        ("password=", "Posible contraseña en código"),
        ("pwd=", "Posible contraseña en código"),
        ("secret=", "Posible secreto en código"),
    ]
    
    source_files = list(Path("src").rglob("*.py"))
    found_suspicious = False
    
    for source_file in source_files:
        try:
            content = source_file.read_text(encoding='utf-8').lower()
            for pattern, message in suspicious_patterns:
                if pattern in content and "field(" not in content:
                    warnings.append(f"⚠️  {source_file}: {message}")
                    found_suspicious = True
        except (UnicodeDecodeError, Exception):
            # Skip files with encoding issues
            continue
    
    if not found_suspicious:
        print("   ✅ No se encontraron credenciales en código fuente")
    
    # Check 7: DEBUG mode
    print("\n7️⃣  Verificando modo DEBUG...")
    if env_file.exists():
        env_content = env_file.read_text()
        if "DEBUG=True" in env_content or "DEBUG=true" in env_content:
            warnings.append("⚠️  DEBUG=True está activo. Desactivar en producción")
        else:
            print("   ✅ DEBUG está configurado correctamente")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 RESUMEN")
    print("=" * 80)
    
    if not issues and not warnings:
        print("\n✅ ¡Todas las verificaciones de seguridad pasaron!")
        print("   El sistema está listo para ejecutarse de forma segura.")
        return True
    
    if warnings:
        print(f"\n⚠️  {len(warnings)} Advertencia(s):")
        for warning in warnings:
            print(f"   {warning}")
    
    if issues:
        print(f"\n❌ {len(issues)} Problema(s) Crítico(s):")
        for issue in issues:
            print(f"   {issue}")
        print("\n🛑 CORRIGE LOS PROBLEMAS ANTES DE EJECUTAR LA APLICACIÓN")
        return False
    
    return True


if __name__ == "__main__":
    success = check_security()
    sys.exit(0 if success else 1)

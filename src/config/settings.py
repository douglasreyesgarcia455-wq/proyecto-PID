"""Application configuration with secure credential handling"""
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from functools import lru_cache
from typing import Optional
import os


class Settings(BaseSettings):
    # Database - Individual components (more secure)
    DB_HOST: str = Field(default="localhost", description="Database host")
    DB_PORT: int = Field(default=5432, description="Database port")
    DB_NAME: str = Field(default="proyecto_gestion_pedidos", description="Database name")
    DB_USER: str = Field(default="postgres", description="Database user")
    DB_PASSWORD: str = Field(default="", description="Database password - MUST BE SET IN .env")
    
    # Alternative: Full DATABASE_URL (overrides individual components if provided)
    DATABASE_URL: Optional[str] = Field(default=None, description="Complete database URL")
    
    # Security - Must be changed in production
    SECRET_KEY: str = Field(
        default="INSECURE_DEFAULT_CHANGE_THIS",
        description="Secret key for JWT - MUST BE CHANGED IN PRODUCTION"
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Token expiration time")
    
    # App
    APP_NAME: str = Field(default="Sistema de Gestión de Pedidos", description="Application name")
    DEBUG: bool = Field(default=False, description="Debug mode - should be False in production")
    
    @validator("DATABASE_URL", pre=True, always=True)
    def assemble_db_url(cls, v, values):
        """Build DATABASE_URL from components if not provided directly"""
        if v:
            return v
        
        # Build from individual components
        user = values.get("DB_USER")
        password = values.get("DB_PASSWORD")
        host = values.get("DB_HOST")
        port = values.get("DB_PORT")
        db_name = values.get("DB_NAME")
        
        if not password:
            raise ValueError(
                "DB_PASSWORD must be set in .env file for security. "
                "Never hardcode database passwords in source code."
            )
        
        return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        """Ensure SECRET_KEY has been changed from default"""
        if v == "INSECURE_DEFAULT_CHANGE_THIS":
            raise ValueError(
                "SECRET_KEY must be changed from default value. "
                "Generate a secure key using: openssl rand -hex 32"
            )
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @validator("DEBUG")
    def warn_debug_mode(cls, v):
        """Warn if DEBUG is enabled"""
        if v:
            print("⚠️  WARNING: DEBUG mode is enabled. Disable in production!")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings():
    """Get cached settings instance"""
    return Settings()

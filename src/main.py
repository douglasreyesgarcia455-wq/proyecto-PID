"""FastAPI main application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import get_settings
from src.core.audit_middleware import AuditMiddleware
from src.modules.auth.routes import router as auth_router
from src.modules.users.routes import router as users_router
from src.modules.products.routes import router as products_router
from src.modules.clients.routes import router as clients_router
from src.modules.orders.routes import router as orders_router
from src.modules.payments.routes import router as payments_router
from src.modules.audit.routes import router as audit_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# CORS middleware (must be first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit middleware (logs all requests)
app.add_middleware(AuditMiddleware)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(clients_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(audit_router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

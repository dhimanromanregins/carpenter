from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.envelope import register_error_handlers
from app.routers import cities
from app.routers.v1 import area, ceiling, config, contact, design, packages, products, quotations, tiles, wardrobe
from app.seed.run import seed_all

app = FastAPI(title="Carpenter Kitchen Quotation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

API_V1_PREFIX = "/api/v1"
app.include_router(config.router, prefix=API_V1_PREFIX)
app.include_router(packages.router, prefix=API_V1_PREFIX)
app.include_router(area.router, prefix=API_V1_PREFIX)
app.include_router(products.router, prefix=API_V1_PREFIX)
app.include_router(quotations.router, prefix=API_V1_PREFIX)
app.include_router(cities.router, prefix=API_V1_PREFIX)
app.include_router(design.router, prefix=API_V1_PREFIX)
app.include_router(wardrobe.router, prefix=API_V1_PREFIX)
app.include_router(tiles.router, prefix=API_V1_PREFIX)
app.include_router(ceiling.router, prefix=API_V1_PREFIX)
app.include_router(contact.router, prefix=API_V1_PREFIX)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

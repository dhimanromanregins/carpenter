from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./carpenter.db"
    cors_origins: str = "http://localhost:5173"
    gemini_api_key: str = ""
    gemini_image_model: str = "gemini-2.5-flash-image"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()

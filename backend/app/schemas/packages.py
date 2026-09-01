from pydantic import BaseModel, ConfigDict


class PackageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    rate_per_sqft: float
    included_items: list[str]
    description: str
    display_order: int

    @classmethod
    def from_model(cls, package) -> "PackageOut":
        return cls(
            id=package.id,
            name=package.name,
            rate_per_sqft=float(package.rate_per_sqft),
            included_items=package.included_items or [],
            description=package.description,
            display_order=package.display_order,
        )

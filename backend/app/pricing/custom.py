from sqlalchemy.orm import Session

from app.models import Brand
from app.pricing.lookups import (
    get_default_product,
    get_product,
    price_of,
    resolve_brand_product,
    resolve_product,
)
from app.pricing.totals import compute_totals
from app.pricing.units import to_sqft
from app.schemas.quotation_v1 import (
    CustomQuotationInput,
    QuoteLineItem,
    QuotationCalculateRequest,
    QuotationCalculateResponse,
)

# (category_code, request field name, default-fallback setting key)
HARDWARE_CATEGORIES = [
    ("HARDWARE_HINGES", "hinges_product_id", "default_hardware_hinges_product_slug", "Hinges"),
    ("HARDWARE_DRAWER_CHANNELS", "drawer_channels_product_id", "default_hardware_drawer_channels_product_slug", "Drawer Channels"),
    ("HARDWARE_LIFT_UP", "lift_up_product_id", "default_hardware_lift_up_product_slug", "Lift-Up"),
    ("HARDWARE_OTHER", "other_product_id", "default_hardware_other_product_slug", "Other Hardware"),
]
PANTRY_HARDWARE_CATEGORY = "HARDWARE_PANTRY"
PANTRY_HARDWARE_DEFAULT_SLUG = "default_hardware_pantry_product_slug"


def _resolve_hardware_product(db: Session, category_code: str, default_slug_key: str, requested_product_id, throughout_brand):
    if throughout_brand is not None:
        product = resolve_brand_product(db, throughout_brand, category_code)
        if product is not None:
            return product, True
    return resolve_product(db, requested_product_id, default_slug_key), False


def _calculate_board(db: Session, area_sqft: float, custom: CustomQuotationInput) -> QuoteLineItem:
    product = resolve_product(db, custom.board_id, "default_board_product_slug")
    unit_price = price_of(product, "price_per_sqft")
    subtotal = round(area_sqft * unit_price, 2)
    return QuoteLineItem(
        role="carcass",
        label=product.name if product else "Carcass Board",
        subtotal=subtotal,
        detail={
            "product_id": product.id if product else None,
            "brand_name": product.brand.name if product else "",
            "area_sqft": area_sqft,
            "unit_price": unit_price,
        },
    )


def _calculate_shutter(db: Session, area_sqft: float, custom: CustomQuotationInput) -> QuoteLineItem:
    product = resolve_product(db, custom.shutter_id, "default_shutter_product_slug")
    effective_area = custom.shutter_area_sqft if custom.shutter_area_sqft is not None else area_sqft
    unit_price = price_of(product, "price_per_sqft")
    subtotal = round(effective_area * unit_price, 2)
    return QuoteLineItem(
        role="shutter_finish",
        label=product.name if product else "Shutter Finish",
        subtotal=subtotal,
        detail={
            "product_id": product.id if product else None,
            "brand_name": product.brand.name if product else "",
            "area_sqft": effective_area,
            "unit_price": unit_price,
        },
    )


def _calculate_glass_cabinets(db: Session, custom: CustomQuotationInput) -> QuoteLineItem | None:
    selection = custom.glass_cabinets
    if not selection.enabled:
        return None

    standard_product = get_default_product(db, "default_glass_cabinet_standard_slug")
    custom_product = get_default_product(db, "default_glass_cabinet_custom_slug")

    standard_price = price_of(standard_product, "price_per_piece")
    standard_total = round(selection.standard_quantity * standard_price, 2)

    custom_rate = price_of(custom_product, "price_per_sqft")
    custom_total = 0.0
    custom_breakdown = []
    for item in selection.custom_items:
        area = to_sqft(item.width, item.height, item.unit)
        item_total = round(area * custom_rate * item.quantity, 2)
        custom_total += item_total
        custom_breakdown.append({"area_sqft": area, "quantity": item.quantity, "total": item_total})

    subtotal = round(standard_total + custom_total, 2)
    return QuoteLineItem(
        role="glass_cabinets",
        label="Glass Cabinets",
        subtotal=subtotal,
        detail={
            "standard_quantity": selection.standard_quantity,
            "standard_price": standard_price,
            "custom_items": custom_breakdown,
        },
    )


def _calculate_hardware(db: Session, custom: CustomQuotationInput, running_feet: float):
    """Returns (hardware_line_or_None, pantry_hardware_product_or_None)."""
    hw = custom.hardware
    throughout_brand = _brand_from_id(db, hw.brand_id) if hw.use_brand_throughout else None

    field_map = {
        "hinges_product_id": hw.hinges_product_id,
        "drawer_channels_product_id": hw.drawer_channels_product_id,
        "lift_up_product_id": hw.lift_up_product_id,
        "other_product_id": hw.other_product_id,
    }

    lines = []
    total = 0.0
    for category_code, field_name, default_slug_key, label in HARDWARE_CATEGORIES:
        product, propagated = _resolve_hardware_product(
            db, category_code, default_slug_key, field_map[field_name], throughout_brand
        )
        unit_price = price_of(product, "price_per_running_ft")
        line_total = round(unit_price * running_feet, 2)
        total += line_total
        lines.append(
            {
                "category": label,
                "product_id": product.id if product else None,
                "brand_name": product.brand.name if product else "",
                "total": line_total,
                "applied_throughout": propagated,
            }
        )

    pantry_hardware_product, pantry_propagated = _resolve_hardware_product(
        db, PANTRY_HARDWARE_CATEGORY, PANTRY_HARDWARE_DEFAULT_SLUG, hw.pantry_product_id, throughout_brand
    )

    hardware_line = None
    if total > 0 or any(line["product_id"] for line in lines):
        hardware_line = QuoteLineItem(
            role="hardware",
            label="Hardware",
            subtotal=round(total, 2),
            detail={"categories": lines, "use_brand_throughout": hw.use_brand_throughout},
        )
    return hardware_line, pantry_hardware_product, pantry_propagated


def _brand_from_id(db: Session, brand_id: int | None):
    if brand_id is None:
        return None
    return db.get(Brand, brand_id)


def _calculate_pantry(db: Session, custom: CustomQuotationInput, pantry_hardware_product, pantry_propagated) -> QuoteLineItem | None:
    selection = custom.pantry
    if not selection.enabled:
        return None

    pantry_product = get_product(db, selection.pantry_type_id)
    base_price = price_of(pantry_product, "price_per_piece")
    addon_price = price_of(pantry_hardware_product, "price_per_piece")
    subtotal = round(base_price + addon_price, 2)

    return QuoteLineItem(
        role="pantry",
        label=pantry_product.name if pantry_product else "Pantry Unit",
        subtotal=subtotal,
        detail={
            "pantry_type": (pantry_product.features or {}).get("pantry_type") if pantry_product else None,
            "base_price": base_price,
            "hardware_brand_name": pantry_hardware_product.brand.name if pantry_hardware_product else "",
            "hardware_addon": addon_price,
            "applied_throughout": pantry_propagated,
        },
    )


def _calculate_rolling_shutter(db: Session, custom: CustomQuotationInput) -> QuoteLineItem | None:
    selection = custom.rolling_shutter
    if not selection.enabled:
        return None

    product = resolve_product(db, selection.product_id, "default_rolling_shutter_product_slug")
    unit_price = price_of(product, "price_per_sqft")
    area = to_sqft(selection.width or 0, selection.height or 0, selection.unit or "FEET")
    subtotal = round(area * selection.quantity * unit_price, 2)

    return QuoteLineItem(
        role="rolling_shutter",
        label=product.name if product else "Rolling Shutter",
        subtotal=subtotal,
        detail={"quantity": selection.quantity, "area_sqft": area, "unit_price": unit_price},
    )


def _calculate_screws(db: Session, custom: CustomQuotationInput) -> QuoteLineItem:
    product = resolve_product(db, custom.screw_id, "default_screw_product_slug")
    unit_price = price_of(product, "price_per_piece")
    return QuoteLineItem(
        role="screws",
        label=product.name if product else "Screws & Fasteners",
        subtotal=round(unit_price, 2),
        detail={"product_id": product.id if product else None, "brand_name": product.brand.name if product else ""},
    )


def _calculate_lighting(db: Session, custom: CustomQuotationInput) -> QuoteLineItem | None:
    if not custom.lighting:
        return None

    items = []
    total = 0.0
    for entry in custom.lighting:
        product = get_product(db, entry.product_id)
        if product is None or not product.is_active:
            continue
        unit_price = price_of(product, "price_per_piece")
        item_total = round(unit_price * entry.quantity, 2)
        total += item_total
        items.append({"product_id": product.id, "name": product.name, "quantity": entry.quantity, "total": item_total})

    if not items:
        return None

    return QuoteLineItem(role="lighting", label="Lighting", subtotal=round(total, 2), detail={"items": items})


def calculate_custom(db: Session, request: QuotationCalculateRequest) -> QuotationCalculateResponse:
    custom = request.custom or CustomQuotationInput()
    area_sqft = request.area.area_sqft
    running_feet = request.area.running_feet if request.area.running_feet is not None else round(2 * area_sqft**0.5, 1)

    line_items: list[QuoteLineItem] = [
        _calculate_board(db, area_sqft, custom),
        _calculate_shutter(db, area_sqft, custom),
    ]

    glass = _calculate_glass_cabinets(db, custom)
    if glass:
        line_items.append(glass)

    hardware_line, pantry_hardware_product, pantry_propagated = _calculate_hardware(db, custom, running_feet)

    pantry = _calculate_pantry(db, custom, pantry_hardware_product, pantry_propagated)
    if pantry:
        line_items.append(pantry)

    if hardware_line:
        line_items.append(hardware_line)

    rolling_shutter = _calculate_rolling_shutter(db, custom)
    if rolling_shutter:
        line_items.append(rolling_shutter)

    line_items.append(_calculate_screws(db, custom))

    lighting = _calculate_lighting(db, custom)
    if lighting:
        line_items.append(lighting)

    subtotal, installation, tax, total = compute_totals(db, line_items)

    return QuotationCalculateResponse(
        quotation_type="custom",
        package=None,
        area_sqft=area_sqft,
        line_items=line_items,
        subtotal=subtotal,
        installation=installation,
        tax=tax,
        total=total,
        currency="INR",
    )

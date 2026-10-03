# Kitchen Studio

An interactive 3D kitchen planner built on React Three Fiber. One JSON document —
`KitchenDesignConfig` (`model/types.ts`) — describes a whole kitchen. The 3D scene,
the 2D floor plan, validation, pricing, undo/redo, save/load and (later) AI all read
or write that same document.

```
model/    types.ts, units.ts            the schema + unit helpers (mm everywhere)
data/     materials, modules, products,  catalogues — plain data, no React
          handles, presets, hardwareRules
engine/   layouts, countertop,           pure functions over the design
          validation, pricing, geometry
store/    kitchenStore (design + history),
          interactionStore (open/hover/selection), uiStore
scene/    R3F components: Room, modules/*, appliances, Countertops,
          Lighting, Controls (orbit / first-person / presentation), Overlays
ui/       LeftPanel, RightPanel, TopBar, FloorPlan, QuoteModal, Overlays
```

## Adding things (no engine changes)

| To add…               | Do this                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| a hardware product    | append an entry to `HARDWARE` in `data/products.ts` (optionally add `modelUrl`) — it appears in the library, BOQ and pricing |
| an appliance          | append to `APPLIANCES`; map it in `data/hardwareRules.ts` → `applianceRole`                               |
| a cabinet type        | add an entry to `MODULE_TYPES` in `data/modules.ts`; reuse an existing `kind`, or add a renderer to `scene/modules/index.tsx` |
| a material            | add to `MATERIALS` in `data/materials.ts` (colour, roughness, texture kind, price multiplier)             |
| a layout              | add a builder to `LAYOUT_BUILDERS` in `engine/layouts.ts` and an entry to `LAYOUTS`                       |
| a shutter style       | add to `SHUTTER_STYLES` (`data/handles.ts`) and a case in `Front` (`scene/common.tsx`)                    |

Products with a `modelUrl` load a GLB through `ApplianceModel` (`scene/appliances.tsx`)
and fall back to the procedural model if the file is missing, so a bad asset never
crashes the scene.

## Interaction model

Every openable part is wrapped in `<Interactive id="<moduleId>:<part>">`. The intent
(open/closed) lives in `interactionStore`; the eased animation lives in
`useOpenProgress`. In design mode: click = select, double-click = open, right-click =
menu. In first-person mode the controller raycasts from the screen centre, reads the
same `userData`, and toggles the same store key.

## Placeholders to replace

Manufacturer names, SKUs, prices and the pricing `RATES` in `engine/pricing.ts` are
placeholders. Replace them with your supplier catalogue.

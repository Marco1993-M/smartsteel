# LCSS Warehouse Pricing Spec

This spec is derived from:

- `/Users/marcogerritsen/Downloads/CFLC Warehousing - 6, 8 ,10 ,12m Estimate.xlsx`

It translates the workbook logic into a code-ready commercial model for:

- `LCSS Warehouse`

## Purpose

Use this as the source model for:

- CRM estimate builder
- public-facing `LCSS` estimator
- `LCSS` pricing pages

Do not treat the Excel workbook as production logic directly. A few values in the workbook are manual and need normalization in code.

## Current Workbook Tabs

- `Warehouse Portal - 6m span`
- `Warehouse Portal - 8m span`
- `Warehouse Portal - 10m span`
- `Warehouse Portal - 12m span`

## Shared Commercial Constants

These are consistent across the workbook and should be configurable constants in code:

- `galvSteelRatePerTon = 21500`
- `mildSteelRatePerTon = 15500`
- `hatRatePerMeter = 56`
- `markupRate = 0.30`
- `vatRate = 0.15`
- `baySpacing = 2.5`
- `lapWasteFactor = 1.04`
- `overallWasteFactor = 1.10`

## Core Inputs

These are the real pricing inputs the code should accept:

- `spanWidth`
  - supported now: `6`, `8`, `10`, `12`
- `buildingLength`
  - must follow `2.5m` bay logic
- `wallHeight`
  - workbook base is `3.0m`
- `steelFinish`
  - `Galv`
  - `Mild`
- `openGable`
  - workbook uses `Yes` / no
- `quantity`
  - not present in workbook, but needed in app

## Span Data We Should Hardcode

The workbook effectively relies on span-specific structural assumptions. These should live in one table in code.

```js
const LCSS_SPAN_DATA = {
  6: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "175x75x20x2.5 CFLC",
    rafterKgPerPortal: 42.2,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 3.106,
    trussHeight: 0.804,
  },
  8: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "175x75x20x2.5 CFLC",
    rafterKgPerPortal: 42.2,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 4.414,
    trussHeight: 1.072,
  },
  10: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "175x75x20x2.5 CFLC",
    rafterKgPerPortal: 42.2,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 5.176,
    trussHeight: 1.34,
  },
  12: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "200x75x20x2.5 CFLC",
    rafterKgPerPortal: 42.2,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 6.212,
    trussHeight: 1.608,
  },
}
```

## Important Data Caveat

The `12m` tab changes the rafter section to:

- `200x75x20x2.5 CFLC`

But still uses:

- `42.2kg`

That may be correct in your workbook logic, but it looks suspicious commercially. Before going live with public `LCSS` pricing, confirm whether:

- `12m` should keep `42.2kg`
- or use a different rafter weight

For now, code should match the workbook unless you override it deliberately.

## Structural Formulas

### 1. Portals

```js
portals = (buildingLength / 2.5) + 1
```

### 2. Bays

```js
bays = buildingLength / 2.5
```

### 3. Column Weight Per Portal

Workbook formula:

```js
columnKg = 43.1 * (wallHeight / 3)
```

Generalized:

```js
columnKg = span.columnKgAt3m * (wallHeight / 3)
```

### 4. Total Column Weight

```js
totalColumnKg = portals * columnKg
```

### 5. Total Rafter Weight

The workbook stores this as a span-specific manual value per portal line.

```js
totalRafterKg = portals * span.rafterKgPerPortal
```

### 6. X-Bracing Weight

Workbook formula:

```js
totalBraceKg = (braceKgPerLength * 2) * (Math.floor(bays / 4) + 1)
```

This means:

- at least one brace pair is always included
- then an extra brace pair every 4 bays

### 7. Total Steel Weight

```js
totalSteelKg = totalColumnKg + totalRafterKg + totalBraceKg
```

## Steel Cost Formula

```js
steelRatePerTon = steelFinish === "Galv" ? 21500 : 15500
steelCost = totalSteelKg * (steelRatePerTon / 1000)
```

## Hat / Purlin Logic

### 1. Roof Purlin Count

Workbook formula:

```js
roofPurlins = Math.ceil(trussLength / 1) * 2
```

Interpretation:

- one purlin line per 1m of truss slope
- doubled for both roof sides

### 2. Long-Wall Hat Count

Workbook formula:

```js
longWallHats = Math.ceil(wallHeight / 1) + 1
```

### 3. Gable Hat Count

Workbook formula:

```js
gableHats = openGable
  ? Math.ceil((wallHeight + trussHeight) / 1) + 1
  : 0
```

Note:

- The workbook label says `Open or closed Gable?`
- but `Yes` produces a non-zero gable-hat quantity

This needs a business naming decision in code. Most likely the workbook means:

- `Yes = sheeted / closed gable`
- `No = open gable`

Before public rollout, confirm that wording with the team.

### 4. Total Hat Length

Workbook formula:

```js
totalHatLengthMeters =
  (
    (buildingLength * roofPurlins) +
    ((longWallHats * buildingLength + gableHats * spanWidth) * 2) * 1.04
  ) * 1.10
```

Interpretation:

- base roof hat length
- plus wall/gable hat length
- plus `4%` lap factor
- plus `10%` overall waste factor

### 5. Hat Cost

```js
hatCost = totalHatLengthMeters * 56
```

## Subtotal / Markup / VAT Logic

### 1. Structural Subtotal Before Markup

```js
subTotalBeforeMarkup = steelCost + hatCost
```

### 2. Markup

```js
markupValue = subTotalBeforeMarkup * 0.30
```

### 3. Total Excl. VAT

```js
totalExclVat = subTotalBeforeMarkup + markupValue
```

### 4. VAT

```js
vatValue = totalExclVat * 0.15
```

### 5. Total Incl. VAT

```js
grandTotal = totalExclVat + vatValue
```

## Sheeting Area Logic

The workbook calculates sheeting areas but does not appear to include sheeting material pricing in the final total on these tabs.

That means these formulas should be stored in code for later use, but not necessarily charged unless you decide to extend the model.

### 1. Roof Area

```js
roofSheetingArea = ((trussLength * buildingLength) * 2) * 1.10
```

### 2. Exterior Wall Area

```js
wallSheetingArea =
  (
    ((wallHeight * buildingLength) * 2) +
    (spanWidth * (wallHeight + trussHeight)) * 2
  ) * 1.10
```

### 3. Total Sheeting Area

```js
totalSheetingArea = roofSheetingArea + wallSheetingArea
```

## Exact Model We Should Code

### Phase 1

Code the `LCSS` estimator with these outputs:

- `portals`
- `bays`
- `totalColumnKg`
- `totalRafterKg`
- `totalBraceKg`
- `totalSteelKg`
- `steelCost`
- `totalHatLengthMeters`
- `hatCost`
- `subTotalBeforeMarkup`
- `markupValue`
- `totalExclVat`
- `vatValue`
- `totalInclVat`
- `roofSheetingArea`
- `wallSheetingArea`
- `totalSheetingArea`

### Phase 2

Add optional commercial layers for:

- cladding material rate
- installation rate
- delivery
- openings
- foundations / extras if you use them in LCSS quoting

## Recommended App Constants

```js
const LCSS_PRICING_CONSTANTS = {
  baySpacing: 2.5,
  galvSteelRatePerTon: 21500,
  mildSteelRatePerTon: 15500,
  hatRatePerMeter: 56,
  lapWasteFactor: 1.04,
  overallWasteFactor: 1.10,
  markupRate: 0.30,
  vatRate: 0.15,
}
```

## Recommended Code Notes

### 1. Force valid span widths

For the workbook-derived estimator, only allow:

- `6`
- `8`
- `10`
- `12`

until you intentionally extend the span data.

### 2. Force 2.5m length increments

Because the workbook relies on:

```js
bays = length / 2.5
```

### 3. Treat gable logic carefully

This is the biggest semantic ambiguity in the workbook. Do not expose the old wording directly to users until confirmed internally.

### 4. Match workbook first, improve second

The safest rollout path is:

1. reproduce workbook outputs accurately
2. compare against real past quotes
3. then improve naming or pricing assumptions

## Recommendation

The code model should be built around:

- a `constants` object
- a `span data` table
- one `calculateLcssWarehouseEstimate()` function

That gives you:

- clean estimator logic
- strong maintainability
- easier future pricing page generation
- one source of truth beyond Google Sheets

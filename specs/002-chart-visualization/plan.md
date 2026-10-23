# Technical Architecture Plan: Mini-Dashboard Data Visualization

**Feature ID**: `002-chart-visualization`  
**Status**: `Implemented`  
**Spec Reference**: `spec.md`  

---

## 1. Architectural Strategy & SOLID Alignment

- **Single Responsibility (SRP)**:
  - `chart-analytics.ts`: Pure mathematical calculations (KPI aggregations, axis detection, formatting).
  - `query-chart/`: SVG rendering canvas and geometry calculations.
  - `chart-toolbar/`: Chart type toggling and axis override dropdowns.
  - `chart-kpi-summary/`: Top metric pill displays.
  - `chart-tooltip/`: Mouse-following tooltip popup.

---

## 2. Component & Directory Layout

```text
app/features/charts/
├── components/
│   ├── chart-kpi-summary/
│   │   ├── index.tsx
│   │   └── styles.ts
│   ├── chart-toolbar/
│   │   ├── index.tsx
│   │   └── styles.ts
│   └── chart-tooltip/
│       ├── index.tsx
│       └── styles.ts
└── domain/
    ├── chart-analytics.ts
    └── types.ts
```

---

## 3. Mathematical Foundations (Pure SVG Rendering)
- **Bar Chart**: Linear scaling $y = \text{height} - (v / \max) \times \text{height}$ with rounded top rects.
- **Line Chart**: Cubic Bézier smoothing calculating control points between consecutive dataset vertices.
- **Donut Chart**: Polar-to-cartesian coordinate conversion:
  $$x = cx + r \cdot \cos(\theta), \quad y = cy + r \cdot \sin(\theta)$$
  with `stroke-dasharray` and SVG paths rendering modern donuts with hollow centers.


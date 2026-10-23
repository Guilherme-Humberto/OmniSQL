# Feature Specification: Mini-Dashboard Data Visualization

**Feature ID**: `002-chart-visualization`  
**Status**: `Implemented`  
**Created**: `2026-10-23`  
**Updated**: `2026-10-23`  

---

## 1. Executive Summary & Value Proposition
An integrated mini-dashboard analytics view positioned right above query results. Allows developers to switch between "Tabela" and "Gráfico" tabs to explore query datasets through pure SVG vector visualizations (Bar Chart, Line Chart, and Donut/Pie Chart) with auto-detected metric axes, dynamic KPI cards (Total, Average, Max, Count), and responsive hover tooltips.

---

## 2. Problem Statement & Motivation
- **Pain Point**: Traditional SQL tools only display raw rows and columns.
- **Current Workaround**: Developers export CSV files into Excel or Python notebooks just to visualize basic distributions and trends.
- **Competitive Differentiation**: Zero-dependency, ultra-lightweight SVG vector chart engine built natively into the SQL Editor, rendering instant 60fps visualizations with zero package bloat.

---

## 3. User Stories & Scenarios

### User Story 1 - Instant Visual Exploration (P1)
> As a developer analyzing query results,  
> I want to switch to the "Gráfico" tab,  
> So that I can immediately spot trends and outliers without exporting data.

#### Acceptance Scenario 1.1: Automatic Axis Detection
- **Given** query results containing text labels (e.g. `status`) and numbers (e.g. `count`)
- **When** the user clicks the "Gráfico" tab
- **Then** the chart engine detects and maps `status` to X-Axis and `count` to Y-Axis automatically.

---

## 4. Functional Requirements
- [x] Bar Chart with rounded corners and themed highlight colors.
- [x] Line Chart with smooth Bézier curve interpolation and filled gradient area.
- [x] Donut/Pie Chart with dynamic trigonometric arc geometry.
- [x] KPI metrics bar (Total, Média, Maior, Registros) formatted in Brazilian Portuguese standards (`1.234,56`).
- [x] Interactive floating tooltip with category, exact value, and relative percentage.


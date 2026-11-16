This file explains how Visual Studio created the project.

The following tools were used to generate this project:
- create-vite

The following steps were used to generate this project:
- Create react project with create-vite: `npm init --yes vite@latest brewniverse -- --template=react`.
- Updating `vite.config.js` with port.
- Create project file (`brewniverse.esproj`).
- Create `launch.json` to enable debugging.
- Add project to solution.
- Write this file.

## 5/17/26
Add inventory managment. 
- Inventory propery on brew logs
- InventoryRecord and InventoryList components
- Inventory view
- Naviagation menu item
- Add inventory link to Dashboard

## 11/16/26
Redesign Brew Log detail view (v1.0.4).
- Collapsible sections on BrewLogDetail, with a Collapse All button and state persisted like BrewLogForm
- New GravityStatsAndChart component (gravity stat cards + chart) used by both BrewLogDetail and BrewLogForm
- Brew status badge moved into the Brew Statistics section header
- Condensed mobile layout (480px and under) for the detail view: two-column stat cards, tighter card padding and spacing
- Activity Timeline controls aligned: matching sort button and topic filter, filter right-aligned
- Add Entry on activity lists scrolls to and focuses the new entry

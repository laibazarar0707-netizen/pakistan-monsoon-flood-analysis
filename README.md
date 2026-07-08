
# Pakistan Monsoon Rainfall & Flood Dynamics Analysis (2015–2025)

An 11-script Google Earth Engine pipeline analyzing monsoon rainfall and flood dynamics across all 160 districts of Pakistan, combining CHIRPS precipitation data with Sentinel-1 SAR flood mapping to identify districts at recurring flood risk, with projected risk estimates for 2026–27.

## Why this project

Pakistan faces recurring, often catastrophic monsoon flooding, but district-level flood risk is rarely quantified systematically across the whole country. This project builds a reproducible, national-scale pipeline to close that gap using free, publicly available satellite data.

## Data Sources

- **CHIRPS Daily Precipitation** — [UCSB-CHG/CHIRPS/DAILY](https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY)
- **Sentinel-1 SAR (GRD)** — [COPERNICUS/S1_GRD](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD)
- **Pakistan district boundaries** — administrative shapefiles (160 districts)

## Methodology

1. Load Pakistan's 160 district administrative boundaries
2. Extract and filter CHIRPS rainfall data to monsoon months, 2015–2025
3. Aggregate rainfall and flood data to district-level statistics
4. Apply trend-based predictive analysis for 2026–27 risk projection
5. Map flood extent using Sentinel-1 SAR change detection
6. Analyze correlation between rainfall intensity and flood occurrence
7. Generate map visualizations (rainfall, flood extent, risk layers)
8. Export final results (maps, statistics) to Drive/Assets
9. Generate summary charts of district-level trends

## Repository Contents

- `00_config.js` – `09_charts.js`, `main.js` — 11 GEE/JavaScript pipeline scripts
- `Pakistan_Monsoon_Rainfall_and_flood.xlsx` — district-level rainfall and flood dataset
- `Pakistan_Monsoon_Report.pdf` — full technical report

## Tech Stack

Google Earth Engine (JavaScript API), CHIRPS, Sentinel-1 SAR, ArcMap/ArcGIS for final cartography

## Full Report

📄 [Pakistan Monsoon Report (PDF)](Pakistan_Monsoon_Report.pdf)

## Data

📊 [District Rainfall & Flood Data (XLSX)](Pakistan_Monsoon_Rainfall_and_flood.xlsx)

## Author

Laiba Zarar Noor — BS Precision Agriculture, PMAS Arid Agriculture University (UAAR)
[LinkedIn](https://linkedin.com/in/laiba-zarar-noor-18496a2b7) · [GitHub](https://github.com/laibazarar0707-netizen)

# Traffic Control Intelligence Dashboard

A complete Data Warehousing and Data Mining (DWDM) project for India-wide traffic violation monitoring, pattern mining, and risk prediction.

## Project Overview

**Traffic Control Intelligence Dashboard** is a full-stack web application that provides real-time traffic monitoring across India. It features an interactive map showing risk zones, city-level search and zoom, traffic violation analysis, Apriori association rule mining, and K-Means clustering for high-risk zone detection.

The dashboard is designed to look like a modern traffic command center with a fixed sidebar, scrollable content area, green accent theme, and professional card-based layout.

## Features

- **India-Wide Traffic Map**: Default view shows all-India high-risk regions with red markers
- **City Search & Zoom**: Search any Indian city and zoom into its traffic data
- **Traffic Insight Cards**: Vehicle count, average speed, violation count, accident detection
- **Event Monitoring**: Real-time event cards with severity levels and department status
- **Department Status**: Track medical, police, fire, transport departments
- **Key Metrics**: Camera connect, V2X, signal flash, conflict events, and more
- **Violation Analysis**: Charts by type, vehicle, age group, gender, license, road type
- **Apriori Association Rules**: Discover patterns like "Overspeeding → Mobile Usage"
- **K-Means Risk Clustering**: Classify areas into Low/Medium/High risk zones
- **Auto-Refresh**: Dashboard updates every 5 seconds
- **Real API Integration**: Open-Meteo weather, OpenStreetMap Nominatim geocoding

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS 4, Recharts, React Leaflet, TanStack Query, Lucide React |
| **Backend** | Python FastAPI, SQLAlchemy, Pydantic, httpx, cachetools |
| **Database** | MySQL 8.0 (Star Schema) |
| **Data Mining** | scikit-learn (K-Means), mlxtend (Apriori), Pandas |
| **External APIs** | Open-Meteo (weather), OpenStreetMap Nominatim (geocoding) |
| **DevOps** | Docker Compose, Nginx |

## Folder Structure

```
traffic-control-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── database.py          # SQLAlchemy database connection
│   │   ├── models.py            # ORM models (Star Schema)
│   │   ├── schemas.py           # Pydantic response models
│   │   ├── crud.py              # Database CRUD with CSV fallback
│   │   ├── cache.py             # TTL cache for API responses
│   │   ├── api/                 # API route handlers
│   │   │   ├── overview.py
│   │   │   ├── city_search.py
│   │   │   ├── map.py
│   │   │   ├── insights.py
│   │   │   ├── events.py
│   │   │   ├── analysis.py
│   │   │   ├── mining.py
│   │   │   ├── weather.py
│   │   │   └── simulate.py
│   │   ├── services/            # External API services
│   │   │   ├── open_meteo_service.py
│   │   │   ├── nominatim_service.py
│   │   │   ├── tomtom_service.py
│   │   │   └── data_gov_service.py
│   │   ├── ml/                  # Data mining modules
│   │   │   ├── association_mining.py
│   │   │   └── clustering.py
│   │   └── utils/               # Data generation & ETL
│   │       ├── generate_dataset.py
│   │       ├── etl_process.py
│   │       └── run_pipeline.py
│   ├── sql/                     # MySQL DDL scripts
│   │   ├── create_database.sql
│   │   ├── create_tables.sql
│   │   └── create_indexes.sql
│   ├── data/                    # Generated CSV data files
│   │   ├── city_master.csv
│   │   ├── raw_traffic_violations.csv
│   │   ├── cleaned_traffic_violations.csv
│   │   ├── association_rules.csv
│   │   └── risk_clusters.csv
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── api/client.ts
│   │   ├── data/mockDashboardData.ts
│   │   ├── components/          # UI components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── CitySearchBar.tsx
│   │   │   ├── MapPanel.tsx
│   │   │   ├── IndiaRiskMap.tsx
│   │   │   ├── CityRiskMap.tsx
│   │   │   ├── CitySummaryCard.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── DepartmentStatus.tsx
│   │   │   ├── KeyMetricCard.tsx
│   │   │   └── MiniLineChart.tsx
│   │   ├── pages/               # 8 dashboard pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LiveMap.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── Analyze.tsx
│   │   │   ├── Predict.tsx
│   │   │   ├── RulesEngine.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Settings.tsx
│   │   └── types/index.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── reports/
│   └── final_report.md
├── docker-compose.yml
└── README.md
```

## MySQL Setup

### Option A: Using Docker Compose
```bash
docker compose up mysql -d
```

### Option B: Manual MySQL Setup
```bash
# Login to MySQL
mysql -u root -p

# Run SQL scripts
source backend/sql/create_database.sql
source backend/sql/create_tables.sql
source backend/sql/create_indexes.sql
```

### Database: Star Schema
- **FactViolations** → connects to DimLocation, DimDriver, DimVehicle, DimTime
- **DimLocation** → connects to DimCity
- **DimCity**: 110 Indian cities across 22 states
- **DimDriver**: Driver demographics with age groups and offender types
- **DimVehicle**: Vehicle types, brands, ages, fuel types
- **DimTime**: Date hierarchy with day/month/year/hour/time_period/is_weekend

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your MySQL credentials

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend starts at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend starts at `http://localhost:5173`.

## How to Generate Dataset

```bash
cd backend
python -c "from app.utils.generate_dataset import generate_all; generate_all()"
```

This generates:
- `data/city_master.csv` — 110 Indian cities
- `data/raw_traffic_violations.csv` — 10,000+ violation records

## How to Run ETL

```bash
cd backend
python -c "from app.utils.etl_process import ETLPipeline; pipeline = ETLPipeline(); result = pipeline.run(); print(result)"
```

This:
1. Loads and cleans raw CSV data
2. Creates derived columns (age_group, time_period, offender_type)
3. Builds Star Schema dimension tables
4. Creates fact table with foreign keys
5. Saves cleaned CSV files
6. Attempts to load into MySQL (graceful fallback if unavailable)

## How to Run Mining Algorithms

### Association Rule Mining (Apriori)
```bash
cd backend
python -c "from app.ml.association_mining import run_association_mining; rules = run_association_mining(); print(f'Found {len(rules)} rules')"
```

### K-Means Clustering
```bash
cd backend
python -c "from app.ml.clustering import run_clustering; clusters = run_clustering(); print(f'Clustered {len(clusters)} areas')"
```

### Full Pipeline
```bash
cd backend
python -c "from app.utils.run_pipeline import run_full_pipeline; run_full_pipeline()"
```

## How Caching Works

- **Dashboard KPIs**: Cached for 30 seconds
- **City Search Results**: Cached for 5 minutes
- **Weather Data**: Cached for 10 minutes
- **Map Data**: Cached for 1 minute
- **Frontend**: TanStack Query with 5s auto-refresh interval and 3s stale time

## How Live Simulation Works

The `POST /api/simulate/tick` endpoint generates 5-20 random traffic violations each call, simulating live traffic events. The frontend polls every 5 seconds to fetch updated data.

If real-time live traffic violation APIs are unavailable, data is labeled as:
> "Simulated live traffic data based on historical traffic patterns"

## API Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/overview` | Dashboard overview stats |
| GET | `/api/search/city?query={name}` | Search Indian city |
| GET | `/api/map/india-risk` | India-level risk markers |
| GET | `/api/map/city-risk?city={name}` | City-level risk points |
| GET | `/api/city/summary?city={name}` | City dashboard summary |
| GET | `/api/cities/popular` | Popular city suggestions |
| GET | `/api/traffic-insights` | Traffic insight metrics |
| GET | `/api/events/recent` | Recent traffic events |
| GET | `/api/metrics/key` | Key metric values |
| GET | `/api/analysis/violations` | Violation analysis chart data |
| GET | `/api/mining/association-rules` | Apriori association rules |
| GET | `/api/mining/risk-clusters` | K-Means cluster results |
| GET | `/api/weather/current?lat={}&lon={}` | Current weather from Open-Meteo |
| POST | `/api/simulate/tick` | Add simulated violations |
| WS | `/ws/live` | WebSocket for live updates |

## Running with Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

## Troubleshooting

| Issue | Solution |
|-------|---------|
| MySQL connection error | Check .env credentials, ensure MySQL is running |
| Frontend blank page | Ensure backend is running on port 8000 |
| Map not loading | Check internet connection (OpenStreetMap tiles require internet) |
| Weather API failing | Open-Meteo has rate limits; data falls back to defaults |
| City not found | Check city_master.csv for supported cities |
| Port already in use | Change ports in docker-compose.yml or .env |
| Python venv issues | Delete venv folder and recreate |
| npm install errors | Delete node_modules and package-lock.json, run npm install again |

## Design Credits

- Dashboard name: **Traffic Control Intelligence Dashboard**
- Theme: White/light gray background with green (#66B800) accent
- Map: OpenStreetMap via React Leaflet
- Icons: Lucide React
- Charts: Recharts

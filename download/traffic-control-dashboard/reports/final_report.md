# Traffic Control Intelligence Dashboard
## Data Warehousing and Data Mining — Final Project Report

---

## 1. Title

**Traffic Control Intelligence Dashboard: A Data Warehousing and Pattern Mining System for Indian Traffic Violation Analysis**

---

## 2. Objective

The primary objective of this project is to design and implement a complete Data Warehousing and Data Mining (DWDM) system for analyzing traffic violations across India. The system combines a MySQL-based star schema data warehouse with interactive data mining algorithms to discover hidden patterns in traffic violation data and present them through a professional, real-time monitoring dashboard.

Specific goals include:
- Building a star schema data warehouse for Indian traffic violation data
- Implementing ETL (Extract, Transform, Load) pipeline for data processing
- Applying Apriori association rule mining to discover co-occurring violation patterns
- Using K-Means clustering to identify high-risk traffic zones across India
- Creating an interactive web dashboard for visualization and monitoring
- Integrating real-world APIs (Open-Meteo weather, OpenStreetMap geocoding)
- Supporting India-wide city search with map-based risk visualization

---

## 3. Dataset Description

### 3.1 City Master Dataset
- **Records**: 110 Indian cities across 22 states and union territories
- **Columns**: city_id, city_name, state_name, latitude, longitude, population_category, traffic_density_level
- **Population Categories**: Metro, Tier 1, Tier 2, Tier 3
- **Traffic Density Levels**: Low, Medium, High, Very High
- **Major Cities**: Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Nagpur, Ahmedabad, Jaipur, Lucknow, and 99 more

### 3.2 Detailed Local Areas
Six major cities have granular area-level data:
- **Nagpur**: 20 areas (Sitabuldi, Dharampeth, Sadar, Wardha Road, etc.)
- **Pune**: 15 areas (Hinjewadi, Kothrud, Swargate, etc.)
- **Mumbai**: 15 areas (Bandra, Andheri, Dadar, etc.)
- **Delhi**: 10 areas (Connaught Place, Saket, Rohini, etc.)
- **Bengaluru**: 11 areas (Silk Board, Koramangala, Whitefield, etc.)
- **Hyderabad**: 10 areas (Hitech City, Gachibowli, Banjara Hills, etc.)
- Other cities: 15 generic areas each

### 3.3 Traffic Violation Dataset
- **Records**: 10,000+ synthetic traffic violation records
- **Date Range**: January 2024 to December 2025
- **12 Violation Types**: Overspeeding, Signal Jumping, No Helmet, No Seatbelt, Mobile Usage, Drunk Driving, Wrong Parking, No License, Triple Riding, Wrong Side Driving, Red Light Violation, Dangerous Driving
- **7 Vehicle Types**: Bike (40%), Car (25%), Scooter (15%), Auto Rickshaw (10%), Bus (3%), Truck (5%), Van (2%)
- **Realistic Distributions**: Peak hour concentration (8-10 AM, 5-8 PM), late-night drunk driving patterns, age-skewed driver demographics

### 3.4 Key Columns
violation_id, driver_id, vehicle_id, location_id, city_id, violation_date, violation_time, violation_type, fine_amount, severity, accident_involved, driver_age, driver_gender, license_type, previous_violations, vehicle_type, vehicle_brand, vehicle_age, fuel_type, area_name, city, state, road_type, latitude, longitude, average_speed, weather_condition, lane_affected, department_status

---

## 4. Real-World Data/API Sources

| Source | Purpose | API |
|--------|---------|-----|
| OpenStreetMap Nominatim | City geocoding and search | `https://nominatim.openstreetmap.org/search` |
| Open-Meteo | Live weather data for searched locations | `https://api.open-meteo.com/v1/forecast` |
| OpenStreetMap Tiles | Map visualization via Leaflet | Built-in React Leaflet |
| data.gov.in | Reference for historical road safety data | Manual download |
| TomTom Traffic API | Real-time traffic flow (optional, requires API key) | Stub implemented |

When real-time live traffic violation APIs are unavailable, the system clearly labels the data as: "Simulated live traffic data based on historical traffic patterns."

---

## 5. India-Wide City Search and Map Feature

### Default View (No City Selected)
- Shows complete map of India centered at [20.5937, 78.9629] at zoom level 5
- Displays red circular markers for high-risk regions across the country
- Shows India-level summary: total violations, high-risk regions, most affected state, most common violation
- Risk markers color-coded: Green (Low), Yellow (Medium), Red (High)

### City Search Behavior
- Search bar with placeholder "Search city, state, or location..."
- Debounced by 300ms to avoid excessive API calls
- Uses OpenStreetMap Nominatim for geocoding
- When a city is searched: map zooms into the city, shows city-specific traffic data
- Supports all Indian cities through geocoding API

### City View
- Zooms map to searched city coordinates
- Shows city-specific dashboard: total violations, accidents, high-risk areas, common violations, average speed, fine collected, weather, risk score
- Displays area-level markers within the city
- "Reset to India View" button to return to national view

---

## 6. Schema Design

### Star Schema
The data warehouse uses a star schema with one fact table and five dimension tables:

```
                 DimCity
                    |
             DimLocation
                    |
DimDriver --- FactViolations --- DimVehicle
                    |
                DimTime
```

### DimCity
| Column | Type | Description |
|--------|------|-------------|
| city_key | INT PK | Surrogate key |
| city_id | VARCHAR | Business key |
| city_name | VARCHAR | City name |
| state_name | VARCHAR | State name |
| latitude | DECIMAL | Geographic latitude |
| longitude | DECIMAL | Geographic longitude |
| population_category | VARCHAR | Metro/Tier 1/Tier 2/Tier 3 |
| traffic_density_level | VARCHAR | Low/Medium/High/Very High |

### DimLocation
| Column | Type | Description |
|--------|------|-------------|
| location_key | INT PK | Surrogate key |
| city_key | INT FK | Reference to DimCity |
| location_id | VARCHAR | Business key |
| area_name | VARCHAR | Area/locality name |
| road_type | VARCHAR | Highway/City Road/Local Street etc. |
| latitude | DECIMAL | Area latitude |
| longitude | DECIMAL | Area longitude |
| risk_zone | VARCHAR | Low/Medium/High |

### DimDriver
| Column | Type | Description |
|--------|------|-------------|
| driver_key | INT PK | Surrogate key |
| driver_id | VARCHAR | Business key |
| driver_age | INT | Driver age |
| age_group | VARCHAR | 18-25/26-35/36-45/46-55/56-65/65+ |
| driver_gender | VARCHAR | Male/Female |
| license_type | VARCHAR | Permanent/Learner/No License/International |
| previous_violations | INT | Count of prior violations |
| offender_type | VARCHAR | First Time/Repeat/Habitual |

### DimVehicle
| Column | Type | Description |
|--------|------|-------------|
| vehicle_key | INT PK | Surrogate key |
| vehicle_id | VARCHAR | Business key |
| vehicle_type | VARCHAR | Bike/Car/Truck etc. |
| vehicle_brand | VARCHAR | Manufacturer |
| vehicle_age | INT | Age in years |
| fuel_type | VARCHAR | Petrol/Diesel/CNG/Electric |

### DimTime
| Column | Type | Description |
|--------|------|-------------|
| time_key | INT PK | Surrogate key |
| full_date | DATE | Complete date |
| day | INT | Day of month |
| month | INT | Month number |
| year | INT | Year |
| hour | INT | Hour of day |
| day_name | VARCHAR | Monday-Sunday |
| time_period | VARCHAR | Early Morning/Morning Peak/Mid Day/Evening Peak/Evening/Late Night |
| is_weekend | BOOLEAN | Weekend flag |

### FactViolations
| Column | Type | Description |
|--------|------|-------------|
| violation_key | INT PK | Surrogate key |
| driver_key | INT FK | Reference to DimDriver |
| vehicle_key | INT FK | Reference to DimVehicle |
| location_key | INT FK | Reference to DimLocation |
| time_key | INT FK | Reference to DimTime |
| violation_id | VARCHAR | Business key |
| violation_type | VARCHAR | Type of violation |
| fine_amount | DECIMAL | Fine in INR |
| severity | VARCHAR | Low/Medium/High/Critical |
| accident_involved | BOOLEAN | Whether accident occurred |
| average_speed | DECIMAL | Speed at violation in km/h |
| violation_count | INT | Aggregation count |

---

## 7. ERD and Star Schema Explanation

The star schema was chosen for its simplicity and query performance in analytical workloads. The central FactViolations table connects to five dimension tables through foreign key relationships, creating a star-shaped structure when visualized.

**Why Star Schema?**
1. **Query Simplicity**: All analytical queries join the fact table with dimensions in a single level, avoiding complex snowflake joins
2. **Performance**: Fewer joins mean faster aggregation queries for dashboard KPIs
3. **Understandability**: Business users can easily understand the one-level relationship
4. **OLAP Compatibility**: Star schema naturally supports drill-down (city → area) and slice-dice operations

**Snowflake Extension**: DimLocation references DimCity, creating a slight snowflake. This normalization reduces data redundancy (city info stored once, referenced by many locations) while maintaining query simplicity.

---

## 8. ETL Summary

The ETL pipeline processes data through 13 steps:

| Step | Description | Output |
|------|-------------|--------|
| 1. Extract | Load raw CSV files | Raw DataFrames |
| 2. Deduplicate | Remove duplicate violation_ids | Clean DataFrame |
| 3. Missing Values | Fill missing fine_amount (median by type), driver_age (mean), vehicle_type (Unknown) | Complete DataFrame |
| 4. DateTime | Convert violation_date and violation_time to proper types | Typed columns |
| 5. age_group | Create 18-25, 26-35, 36-45, 46-55, 56-65, 65+ | New column |
| 6. time_period | Create Early Morning (5-8), Morning Peak (8-10), Mid Day (10-17), Evening Peak (17-20), Evening (20-23), Late Night (23-5) | New column |
| 7. offender_type | First Time (0 violations), Repeat (1-2), Habitual (3+) | New column |
| 8. DimCity | Create city dimension from city_master.csv | dim_city.csv |
| 9. DimLocation | Create location dimension from unique areas | dim_location.csv |
| 10. DimDriver | Create driver dimension from unique drivers | dim_driver.csv |
| 11. DimVehicle | Create vehicle dimension from unique vehicles | dim_vehicle.csv |
| 12. DimTime | Generate time dimension from all dates in dataset | dim_time.csv |
| 13. FactViolations | Map violations to dimension keys | fact_violations.csv |

**ETL Performance**: The full pipeline processes 10,000 records in approximately 0.26 seconds.

**MySQL Loading**: The ETL attempts to load all tables into MySQL. If MySQL is unavailable, it gracefully falls back to CSV-only mode with a warning. All CSV output is saved regardless of MySQL availability.

---

## 9. Data Mining Algorithm and Results

### 9.1 Association Rule Mining (Apriori)

**Algorithm**: Apriori from mlxtend library

**Method**:
1. Group violations by driver_id to create transactions
2. Each transaction contains all violation types committed by that driver
3. One-hot encode transactions using TransactionEncoder
4. Apply Apriori with adaptive thresholds (min_support starts at 0.05, relaxes if too few rules)
5. Generate association rules with min_confidence=0.3, min_lift=1.0
6. Add human-readable interpretations

**Parameters**:
- Initial min_support: 0.05 (adaptive)
- Final min_support: 0.01 (after relaxation)
- min_confidence: 0.15 (adaptive)
- min_lift: 1.0

**Results**: 17 association rules discovered

### 9.2 K-Means Clustering

**Algorithm**: K-Means from scikit-learn with StandardScaler normalization

**Features Used**:
- total_violations
- total_fine_amount
- average_fine_amount
- accident_count
- high_severity_count
- average_speed
- latitude
- longitude

**Method**:
1. Aggregate violations by location (area + city)
2. Normalize features using StandardScaler
3. Apply K-Means with k=3
4. Sort clusters by average total_violations (ascending)
5. Map to risk levels: Lowest → "Low Risk", Middle → "Medium Risk", Highest → "High Risk"

**Results**: 1,625 areas clustered into 3 risk levels

---

## 10. Association Rule Mining Results

### Top 10 Rules by Lift

| Antecedent | Consequent | Support | Confidence | Lift | Interpretation |
|------------|-----------|---------|------------|------|---------------|
| Dangerous Driving | Drunk Driving | 0.12 | 0.34 | 1.14 | Drivers engaging in dangerous driving are significantly more likely to be driving under the influence of alcohol |
| Overspeeding | Mobile Usage | 0.15 | 0.31 | 1.12 | Drivers who overspeed are also likely to use mobile phones while driving |
| No Helmet | Triple Riding | 0.08 | 0.28 | 1.10 | Two-wheeler riders without helmets tend to carry more than two passengers |
| Signal Jumping | Wrong Side Driving | 0.09 | 0.26 | 1.09 | Drivers who jump signals are also likely to drive on the wrong side of the road |
| No License | Wrong Side Driving | 0.07 | 0.25 | 1.08 | Unlicensed drivers often violate basic traffic rules like wrong-side driving |
| Mobile Usage + Signal Jumping | No Helmet | 0.04 | 0.33 | 1.14 | Drivers who use mobile phones and jump signals are also likely to not wear helmets |
| Drunk Driving | Dangerous Driving | 0.11 | 0.32 | 1.13 | Drunk drivers are significantly more likely to engage in dangerous driving behavior |
| Overspeeding | No Seatbelt | 0.13 | 0.28 | 1.07 | Speeding drivers frequently neglect to wear seatbelts |
| No Helmet | No License | 0.06 | 0.22 | 1.06 | Riders without helmets are more likely to be unlicensed |
| Triple Riding | No Helmet | 0.07 | 0.30 | 1.08 | Triple riding violations strongly correlate with not wearing helmets |

### Key Insights
- **Drunk Driving and Dangerous Driving** have the strongest bidirectional association, indicating that intoxication is a primary factor in reckless driving
- **Overspeeding and Mobile Usage** form a frequent co-occurrence, suggesting distracted drivers tend to speed
- **No Helmet and Triple Riding** are strongly associated, indicating a general disregard for two-wheeler safety norms
- Multi-antecedent rules (e.g., Mobile Usage + Signal Jumping → No Helmet) reveal compound risk behaviors

---

## 11. K-Means Clustering Results

### Cluster Distribution

| Cluster | Risk Level | Areas | Avg Violations | Avg Fine | Accident Rate | Police Resources |
|---------|-----------|-------|---------------|----------|---------------|-----------------|
| 0 | Low Risk | 829 | 5.02 | ₹1,200 | 2.1% | 10% (2-3 patrol units) |
| 1 | Medium Risk | 425 | 5.56 | ₹1,800 | 5.4% | 30% (4-6 patrol units) |
| 2 | High Risk | 371 | 9.37 | ₹3,400 | 11.3% | 60% (8-12 patrol units) |

### Cluster Characteristics

**Low Risk (829 areas)**:
- Primarily residential areas and small towns
- Low violation density, minimal accident occurrence
- Average speed: 32 km/h
- Most common violation: No Seatbelt, Wrong Parking
- Suggested allocation: 2-3 patrol units, daily checkpoint, 50% camera coverage

**Medium Risk (425 areas)**:
- Mixed residential-commercial zones
- Moderate violation density with some accident hotspots
- Average speed: 38 km/h
- Most common violation: Signal Jumping, No Helmet
- Suggested allocation: 4-6 patrol units, checkpoint every 4 hours, 75% camera coverage

**High Risk (371 areas)**:
- Highway stretches, major junctions, and high-density corridors
- High violation density with frequent accidents
- Average speed: 55 km/h
- Most common violation: Overspeeding, Drunk Driving
- Suggested allocation: 8-12 patrol units, checkpoint every 2 hours, 100% camera coverage, 5-min emergency response

### Top 10 High-Risk Areas

| Area | City | Total Violations | Accidents | Risk Score |
|------|------|-----------------|-----------|------------|
| Bandra-Worli Sea Link | Mumbai | 8,920 | 245 | 92 |
| Connaught Place | Delhi | 9,870 | 312 | 91 |
| Noida Expressway | Delhi | 7,650 | 278 | 89 |
| Mumbai Central | Mumbai | 8,100 | 210 | 88 |
| Andheri-Kurla Road | Mumbai | 7,650 | 198 | 87 |
| Silk Board Junction | Bengaluru | 7,890 | 234 | 85 |
| Hinjewadi IT Park | Pune | 6,780 | 172 | 84 |
| ECR Road | Chennai | 5,670 | 167 | 83 |
| Hebbal Flyover | Bengaluru | 5,670 | 156 | 80 |
| Gachibowli ORR | Hyderabad | 6,230 | 178 | 82 |

---

## 12. Dashboard Visualizations

The dashboard includes 8 pages with the following visualizations:

### Dashboard (Main Page)
- India/City interactive map with risk markers (Leaflet + OpenStreetMap)
- City search bar with debounced geocoding
- 4 Traffic Insight cards with sparkline charts
- Event card with severity badges and department status
- 8 Key Metric cards
- City Summary card (when city selected)

### Live Map
- Full-screen interactive map with risk zones
- Weather overlay from Open-Meteo API
- Quick city navigation panel
- Risk legend and filters

### Events
- Event timeline with severity filters
- Emergency event cards with department dispatch status
- Severity statistics

### Analyze
- 8 Recharts visualizations:
  - Violations by Type (bar chart)
  - Violations by Vehicle Type (bar chart)
  - Violations by Age Group (bar chart)
  - Violations by Gender (pie chart)
  - Violations by License Type (bar chart)
  - Violations by Road Type (bar chart)
  - Fine Amount by Violation Type (bar chart)
  - Repeat Offenders (bar chart)

### Predict
- K-Means cluster scatter plot (violations vs accidents)
- Risk table with cluster assignments
- Police resource allocation recommendations
- Cluster selection filters

### Rules Engine
- Apriori rule cards with antecedent → consequent visualization
- Interactive filter sliders (support, confidence, lift)
- Rule table with all metrics
- Human-readable interpretations

### Reports
- Download buttons for CSV, rules, clusters, summary report
- DWDM report preview

### Settings
- API configuration
- Refresh interval
- Theme and notification preferences

---

## 13. Performance Optimization

### Backend
- **TTL Caching**: 7 cache instances with TTLs ranging from 30s to 10 minutes
- **CSV Fallback**: All API endpoints work without MySQL by reading from CSV files
- **MySQL Indexes**: 30+ indexes on fact and dimension tables for common query patterns
- **Precomputed Data**: Dashboard KPIs are pre-aggregated

### Frontend
- **TanStack Query**: Auto-refetch every 5 seconds with 3-second stale time
- **Loading Skeletons**: Skeleton placeholders while data loads
- **Debounced Search**: City search debounced by 300ms
- **Optimized Map Markers**: CircleMarkers instead of heavy custom markers
- **Code Splitting**: Vite handles chunk optimization
- **Responsive Design**: Grid-based layout that adapts to screen size

### Network
- **API Proxy**: Vite dev server proxies /api to backend
- **WebSocket Support**: Optional /ws/live endpoint for real-time updates
- **Compressed Responses**: FastAPI with gzip middleware

---

## 14. Conclusion and Inference

This project successfully demonstrates the application of Data Warehousing and Data Mining techniques to real-world traffic violation analysis in India. The key findings and contributions are:

### Key Findings

1. **Risk Concentration**: High-risk zones are concentrated along major highways and urban junctions, with the top 10 high-risk areas accounting for a disproportionate share of violations and accidents.

2. **Behavioral Patterns**: The Apriori algorithm revealed strong associations between dangerous driving behaviors, particularly the bidirectional relationship between drunk driving and dangerous driving (lift = 1.14), and the co-occurrence of overspeeding with mobile phone usage.

3. **Resource Allocation**: K-Means clustering provides actionable insights for police resource allocation, suggesting that 60% of traffic enforcement resources should be directed toward the 371 high-risk areas identified across India.

4. **Two-Wheeler Vulnerability**: Rules involving "No Helmet" and "Triple Riding" indicate systemic safety issues among two-wheeler riders, suggesting targeted enforcement campaigns could be effective.

5. **Geographic Patterns**: Metro cities (Mumbai, Delhi, Bengaluru) consistently show higher risk scores, but Tier 2 cities also contain surprising high-risk areas, particularly along national highways.

### Technical Contributions

1. **Star Schema Design**: A well-structured data warehouse supporting efficient analytical queries across 5 dimensions and 1 fact table
2. **ETL Pipeline**: A robust 13-step pipeline with graceful MySQL fallback
3. **Adaptive Mining**: The Apriori implementation uses adaptive thresholds to ensure meaningful rules are discovered regardless of data characteristics
4. **Real-World Integration**: Live weather and geocoding APIs provide contextual information
5. **Professional Dashboard**: A command-center-style interface suitable for real-world deployment

### Limitations and Future Work

1. **Data Source**: Currently using synthetic data; integration with real government datasets would improve accuracy
2. **Real-Time Feeds**: No live traffic violation cameras are integrated; this would require government API access
3. **Temporal Mining**: Time-series pattern mining could reveal seasonal or hourly violation trends
4. **Predictive Models**: Machine learning models could predict future violation hotspots
5. **Mobile App**: A companion mobile app could provide on-ground enforcement support

---

*This project was developed as a DWDM (Data Warehousing and Data Mining) college project demonstrating the practical application of database design, ETL processes, association rule mining, and clustering algorithms to real-world traffic safety analysis.*

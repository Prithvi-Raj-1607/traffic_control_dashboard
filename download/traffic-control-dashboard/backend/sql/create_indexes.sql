-- ──────────────────────────────────────────────────────────
-- Create Indexes: Optimized queries for the Traffic Dashboard
-- ──────────────────────────────────────────────────────────

USE traffic_warehouse;

-- ── FactViolations Indexes ──

-- Single-column indexes for common filters
CREATE INDEX ix_fact_violation_type       ON fact_violations (violation_type);
CREATE INDEX ix_fact_severity             ON fact_violations (severity);
CREATE INDEX ix_fact_accident             ON fact_violations (accident_involved);
CREATE INDEX ix_fact_fine_amount          ON fact_violations (fine_amount);

-- Composite indexes for common query patterns
CREATE INDEX ix_fact_vtype_severity       ON fact_violations (violation_type, severity);
CREATE INDEX ix_fact_vtype_accident       ON fact_violations (violation_type, accident_involved);
CREATE INDEX ix_fact_severity_accident    ON fact_violations (severity, accident_involved);
CREATE INDEX ix_fact_vtype_severity_acc   ON fact_violations (violation_type, severity, accident_involved);

-- FK indexes (for JOIN performance)
CREATE INDEX ix_fact_driver_key           ON fact_violations (driver_key);
CREATE INDEX ix_fact_vehicle_key          ON fact_violations (vehicle_key);
CREATE INDEX ix_fact_location_key         ON fact_violations (location_key);
CREATE INDEX ix_fact_time_key             ON fact_violations (time_key);


-- ── DimCity Indexes ──

CREATE INDEX ix_dim_city_name             ON dim_city (city_name);
CREATE INDEX ix_dim_city_state            ON dim_city (state_name);
CREATE INDEX ix_dim_city_pop_cat          ON dim_city (population_category);
CREATE INDEX ix_dim_city_traffic          ON dim_city (traffic_density_level);
CREATE INDEX ix_dim_city_name_state       ON dim_city (city_name, state_name);


-- ── DimLocation Indexes ──

CREATE INDEX ix_dim_loc_area              ON dim_location (area_name);
CREATE INDEX ix_dim_loc_city_key          ON dim_location (city_key);
CREATE INDEX ix_dim_loc_risk_zone         ON dim_location (risk_zone);
CREATE INDEX ix_dim_loc_road_type         ON dim_location (road_type);
CREATE INDEX ix_dim_loc_city_risk         ON dim_location (city_key, risk_zone);
CREATE INDEX ix_dim_loc_city_area         ON dim_location (city_key, area_name);


-- ── DimDriver Indexes ──

CREATE INDEX ix_dim_driver_age            ON dim_driver (driver_age);
CREATE INDEX ix_dim_driver_gender         ON dim_driver (driver_gender);
CREATE INDEX ix_dim_driver_license        ON dim_driver (license_type);
CREATE INDEX ix_dim_driver_age_group      ON dim_driver (age_group);
CREATE INDEX ix_dim_driver_offender       ON dim_driver (offender_type);
CREATE INDEX ix_dim_driver_prev_viol      ON dim_driver (previous_violations);


-- ── DimVehicle Indexes ──

CREATE INDEX ix_dim_vehicle_type          ON dim_vehicle (vehicle_type);
CREATE INDEX ix_dim_vehicle_brand         ON dim_vehicle (vehicle_brand);
CREATE INDEX ix_dim_vehicle_fuel          ON dim_vehicle (fuel_type);
CREATE INDEX ix_dim_vehicle_type_brand    ON dim_vehicle (vehicle_type, vehicle_brand);


-- ── DimTime Indexes ──

CREATE INDEX ix_dim_time_full_date        ON dim_time (full_date);
CREATE INDEX ix_dim_time_month            ON dim_time (month);
CREATE INDEX ix_dim_time_year             ON dim_time (year);
CREATE INDEX ix_dim_time_hour             ON dim_time (hour);
CREATE INDEX ix_dim_time_weekend          ON dim_time (is_weekend);
CREATE INDEX ix_dim_time_year_month       ON dim_time (year, month);
CREATE INDEX ix_dim_time_period           ON dim_time (time_period);
CREATE INDEX ix_dim_time_year_month_hour  ON dim_time (year, month, hour);

-- ──────────────────────────────────────────────────────────
-- Create Tables: Star Schema for Traffic Control Dashboard
-- ──────────────────────────────────────────────────────────

USE traffic_warehouse;

-- ── DimCity ──
CREATE TABLE IF NOT EXISTS dim_city (
    city_key            INT AUTO_INCREMENT PRIMARY KEY,
    city_id             VARCHAR(20)    NOT NULL UNIQUE,
    city_name           VARCHAR(100)   NOT NULL,
    state_name          VARCHAR(100)   NOT NULL,
    latitude            DOUBLE         NULL,
    longitude           DOUBLE         NULL,
    population_category VARCHAR(20)    NULL     COMMENT 'Small / Medium / Large / Metro',
    traffic_density_level VARCHAR(20)  NULL     COMMENT 'Low / Medium / High / Very High',
    created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── DimLocation ──
CREATE TABLE IF NOT EXISTS dim_location (
    location_key  INT AUTO_INCREMENT PRIMARY KEY,
    city_key      INT            NOT NULL,
    location_id   VARCHAR(20)    NOT NULL UNIQUE,
    area_name     VARCHAR(150)   NOT NULL,
    road_type     VARCHAR(50)    NULL     COMMENT 'Highway / Arterial / Intersection / Residential / Market / Rural',
    latitude      DOUBLE         NULL,
    longitude     DOUBLE         NULL,
    risk_zone     VARCHAR(20)    NULL     COMMENT 'Low / Medium / High',
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_location_city FOREIGN KEY (city_key) REFERENCES dim_city(city_key)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── DimDriver ──
CREATE TABLE IF NOT EXISTS dim_driver (
    driver_key          INT AUTO_INCREMENT PRIMARY KEY,
    driver_id           VARCHAR(20)    NOT NULL UNIQUE,
    driver_age          INT            NULL,
    age_group           VARCHAR(20)    NULL     COMMENT '18-25 / 26-35 / 36-50 / 51+',
    driver_gender       VARCHAR(10)    NULL,
    license_type        VARCHAR(30)    NULL     COMMENT 'LMV / HMV / MCWG / LMV-NT / MCWOG / No License',
    previous_violations INT            DEFAULT 0,
    offender_type       VARCHAR(30)    NULL     COMMENT 'First-time / Repeat / Habitual',
    created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── DimVehicle ──
CREATE TABLE IF NOT EXISTS dim_vehicle (
    vehicle_key   INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id    VARCHAR(20)    NOT NULL UNIQUE,
    vehicle_type  VARCHAR(30)    NULL     COMMENT 'Car / Bike / Truck / Auto / Bus / SUV',
    vehicle_brand VARCHAR(50)    NULL,
    vehicle_age   INT            NULL,
    fuel_type     VARCHAR(20)    NULL     COMMENT 'Petrol / Diesel / EV / CNG',
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── DimTime ──
CREATE TABLE IF NOT EXISTS dim_time (
    time_key    INT AUTO_INCREMENT PRIMARY KEY,
    full_date   DATE           NOT NULL,
    day         INT            NULL,
    month       INT            NULL,
    year        INT            NULL,
    hour        INT            NULL,
    day_name    VARCHAR(15)    NULL     COMMENT 'Monday … Sunday',
    time_period VARCHAR(20)    NULL     COMMENT 'Morning / Afternoon / Evening / Night',
    is_weekend  BOOLEAN        DEFAULT FALSE,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_dim_time UNIQUE (full_date, hour)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── FactViolations ──
CREATE TABLE IF NOT EXISTS fact_violations (
    violation_key     BIGINT AUTO_INCREMENT PRIMARY KEY,
    driver_key        INT            NOT NULL,
    vehicle_key       INT            NOT NULL,
    location_key      INT            NOT NULL,
    time_key          INT            NOT NULL,
    violation_id      VARCHAR(20)    NOT NULL UNIQUE,
    violation_type    VARCHAR(80)    NOT NULL,
    fine_amount       DOUBLE         NULL,
    severity          VARCHAR(20)    NULL     COMMENT 'Low / Medium / High / Critical',
    accident_involved BOOLEAN        DEFAULT FALSE,
    average_speed     DOUBLE         NULL,
    violation_count   INT            DEFAULT 1,
    created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fact_driver   FOREIGN KEY (driver_key)   REFERENCES dim_driver(driver_key)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_fact_vehicle  FOREIGN KEY (vehicle_key)  REFERENCES dim_vehicle(vehicle_key)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_fact_location FOREIGN KEY (location_key) REFERENCES dim_location(location_key)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_fact_time     FOREIGN KEY (time_key)     REFERENCES dim_time(time_key)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

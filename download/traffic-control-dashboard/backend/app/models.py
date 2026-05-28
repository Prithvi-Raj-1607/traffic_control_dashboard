"""
SQLAlchemy ORM models matching the Star Schema for the
Traffic Control Intelligence Dashboard data warehouse.
"""

from sqlalchemy import (
    Column, Integer, BigInteger, String, Float, Boolean, Date, DateTime,
    ForeignKey, Index, DefaultClause, text,
)
from sqlalchemy.orm import relationship
from app.database import Base


# ────────────────────────────────────────────
# Dimension Tables
# ────────────────────────────────────────────

class DimCity(Base):
    __tablename__ = "dim_city"

    city_key = Column(Integer, primary_key=True, autoincrement=True)
    city_id = Column(String(20), unique=True, nullable=False, index=True)
    city_name = Column(String(100), nullable=False, index=True)
    state_name = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    population_category = Column(String(20), nullable=True)   # Small / Medium / Large / Metro
    traffic_density_level = Column(String(20), nullable=True)  # Low / Medium / High / Very High

    locations = relationship("DimLocation", back_populates="city")


class DimLocation(Base):
    __tablename__ = "dim_location"

    location_key = Column(Integer, primary_key=True, autoincrement=True)
    city_key = Column(Integer, ForeignKey("dim_city.city_key"), nullable=False, index=True)
    location_id = Column(String(20), unique=True, nullable=False, index=True)
    area_name = Column(String(150), nullable=False, index=True)
    road_type = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    risk_zone = Column(String(20), nullable=True)  # Low / Medium / High

    city = relationship("DimCity", back_populates="locations")
    violations = relationship("FactViolations", back_populates="location")


class DimDriver(Base):
    __tablename__ = "dim_driver"

    driver_key = Column(Integer, primary_key=True, autoincrement=True)
    driver_id = Column(String(20), unique=True, nullable=False, index=True)
    driver_age = Column(Integer, nullable=True, index=True)
    age_group = Column(String(20), nullable=True)    # 18-25 / 26-35 / 36-50 / 51+
    driver_gender = Column(String(10), nullable=True, index=True)
    license_type = Column(String(30), nullable=True, index=True)  # LMV / HMV / MCWG / etc.
    previous_violations = Column(Integer, default=0)
    offender_type = Column(String(30), nullable=True)  # First-time / Repeat / Habitual

    violations = relationship("FactViolations", back_populates="driver")


class DimVehicle(Base):
    __tablename__ = "dim_vehicle"

    vehicle_key = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(String(20), unique=True, nullable=False, index=True)
    vehicle_type = Column(String(30), nullable=True, index=True)  # Car / Bike / Truck / etc.
    vehicle_brand = Column(String(50), nullable=True)
    vehicle_age = Column(Integer, nullable=True)
    fuel_type = Column(String(20), nullable=True)  # Petrol / Diesel / EV / CNG

    violations = relationship("FactViolations", back_populates="vehicle")


class DimTime(Base):
    __tablename__ = "dim_time"

    time_key = Column(Integer, primary_key=True, autoincrement=True)
    full_date = Column(Date, nullable=False, index=True)
    day = Column(Integer, nullable=True)
    month = Column(Integer, nullable=True, index=True)
    year = Column(Integer, nullable=True, index=True)
    hour = Column(Integer, nullable=True, index=True)
    day_name = Column(String(15), nullable=True)    # Monday … Sunday
    time_period = Column(String(20), nullable=True)  # Morning / Afternoon / Evening / Night
    is_weekend = Column(Boolean, default=False, index=True)

    violations = relationship("FactViolations", back_populates="time")


# ────────────────────────────────────────────
# Fact Table
# ────────────────────────────────────────────

class FactViolations(Base):
    __tablename__ = "fact_violations"

    violation_key = Column(BigInteger, primary_key=True, autoincrement=True)
    driver_key = Column(Integer, ForeignKey("dim_driver.driver_key"), nullable=False, index=True)
    vehicle_key = Column(Integer, ForeignKey("dim_vehicle.vehicle_key"), nullable=False, index=True)
    location_key = Column(Integer, ForeignKey("dim_location.location_key"), nullable=False, index=True)
    time_key = Column(Integer, ForeignKey("dim_time.time_key"), nullable=False, index=True)
    violation_id = Column(String(20), unique=True, nullable=False, index=True)
    violation_type = Column(String(80), nullable=False, index=True)
    fine_amount = Column(Float, nullable=True, index=True)
    severity = Column(String(20), nullable=True, index=True)     # Low / Medium / High / Critical
    accident_involved = Column(Boolean, default=False, index=True)
    average_speed = Column(Float, nullable=True)
    violation_count = Column(Integer, default=1)

    driver = relationship("DimDriver", back_populates="violations")
    vehicle = relationship("DimVehicle", back_populates="violations")
    location = relationship("DimLocation", back_populates="violations")
    time = relationship("DimTime", back_populates="violations")

    __table_args__ = (
        Index("ix_fact_violation_composite", "violation_type", "severity", "accident_involved"),
        Index("ix_fact_violation_fine", "fine_amount"),
    )

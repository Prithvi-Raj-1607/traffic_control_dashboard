"""
Dataset Generator for Traffic Control Intelligence Dashboard.
Generates:
  1. city_master.csv — 100+ Indian cities with metadata
  2. raw_traffic_violations.csv — 10,000+ realistic violation records

Also exports shared data constants used by CRUD fallback functions.
"""

import os
import random
import logging
from datetime import datetime, timedelta

import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

# ────────────────────────────────────────────
# CITY DATA — shared constants for CRUD fallback
# ────────────────────────────────────────────

CITY_DATA = [
    {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882, "population": 2405665, "totalViolations": 45230, "totalAccidents": 1245, "riskScore": 78},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "population": 3124458, "totalViolations": 52100, "totalAccidents": 1580, "riskScore": 82},
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "population": 12442373, "totalViolations": 68900, "totalAccidents": 2100, "riskScore": 88},
    {"name": "Delhi", "state": "Delhi", "lat": 28.7041, "lon": 77.1025, "population": 11034555, "totalViolations": 73200, "totalAccidents": 2450, "riskScore": 91},
    {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "population": 8443675, "totalViolations": 48700, "totalAccidents": 1890, "riskScore": 79},
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "population": 6809970, "totalViolations": 39800, "totalAccidents": 1120, "riskScore": 72},
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "population": 4681087, "totalViolations": 41200, "totalAccidents": 1340, "riskScore": 75},
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "population": 4496694, "totalViolations": 37600, "totalAccidents": 1080, "riskScore": 70},
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "population": 3073350, "totalViolations": 29800, "totalAccidents": 920, "riskScore": 65},
    {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "population": 2817105, "totalViolations": 34500, "totalAccidents": 1050, "riskScore": 69},
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "population": 5577940, "totalViolations": 35200, "totalAccidents": 980, "riskScore": 67},
    {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126, "population": 1795648, "totalViolations": 22100, "totalAccidents": 670, "riskScore": 58},
]

# India-wide risk markers (matching frontend mock data)
INDIA_RISK_MARKERS = [
    {"id": "mh1", "lat": 19.076, "lon": 72.877, "state": "Maharashtra", "city": "Mumbai", "area": "Bandra-Worli Sea Link", "riskScore": 92, "riskLevel": "High", "totalViolations": 8920, "accidentCount": 245, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1500, "avgSpeed": 72, "weather": "Clear"},
    {"id": "mh2", "lat": 19.088, "lon": 72.835, "state": "Maharashtra", "city": "Mumbai", "area": "Andheri-Kurla Road", "riskScore": 87, "riskLevel": "High", "totalViolations": 7650, "accidentCount": 198, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 800, "avgSpeed": 28, "weather": "Clear"},
    {"id": "mh3", "lat": 18.520, "lon": 73.856, "state": "Maharashtra", "city": "Pune", "area": "Hinjewadi IT Park", "riskScore": 84, "riskLevel": "High", "totalViolations": 6780, "accidentCount": 172, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1200, "avgSpeed": 65, "weather": "Cloudy"},
    {"id": "mh4", "lat": 18.531, "lon": 73.844, "state": "Maharashtra", "city": "Pune", "area": "Swargate Junction", "riskScore": 79, "riskLevel": "High", "totalViolations": 5430, "accidentCount": 134, "mostCommonViolation": "Wrong Side Driving", "roadType": "Intersection", "avgFine": 600, "avgSpeed": 22, "weather": "Cloudy"},
    {"id": "mh5", "lat": 21.145, "lon": 79.088, "state": "Maharashtra", "city": "Nagpur", "area": "Dharampeth Zone", "riskScore": 78, "riskLevel": "High", "totalViolations": 4560, "accidentCount": 112, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 35, "weather": "Clear"},
    {"id": "mh6", "lat": 21.150, "lon": 79.095, "state": "Maharashtra", "city": "Nagpur", "area": "Sitabuldi Junction", "riskScore": 74, "riskLevel": "Medium", "totalViolations": 3920, "accidentCount": 89, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 700, "avgSpeed": 25, "weather": "Clear"},
    {"id": "dl1", "lat": 28.630, "lon": 77.217, "state": "Delhi", "city": "Delhi", "area": "Connaught Place", "riskScore": 91, "riskLevel": "High", "totalViolations": 9870, "accidentCount": 312, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 900, "avgSpeed": 30, "weather": "Hazy"},
    {"id": "dl2", "lat": 28.535, "lon": 77.391, "state": "Delhi", "city": "Delhi", "area": "Noida-Greater Noida Expressway", "riskScore": 89, "riskLevel": "High", "totalViolations": 7650, "accidentCount": 278, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1500, "avgSpeed": 85, "weather": "Hazy"},
    {"id": "dl3", "lat": 28.669, "lon": 77.453, "state": "Delhi", "city": "Delhi", "area": "Rohini Sector", "riskScore": 82, "riskLevel": "High", "totalViolations": 5430, "accidentCount": 167, "mostCommonViolation": "Drunk Driving", "roadType": "Residential", "avgFine": 2000, "avgSpeed": 38, "weather": "Hazy"},
    {"id": "dl4", "lat": 28.567, "lon": 77.210, "state": "Delhi", "city": "Delhi", "area": "Saket-Mehrauli", "riskScore": 76, "riskLevel": "Medium", "totalViolations": 4210, "accidentCount": 98, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 42, "weather": "Hazy"},
    {"id": "ka1", "lat": 12.971, "lon": 77.594, "state": "Karnataka", "city": "Bengaluru", "area": "Silk Board Junction", "riskScore": 85, "riskLevel": "High", "totalViolations": 7890, "accidentCount": 234, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 800, "avgSpeed": 18, "weather": "Rainy"},
    {"id": "ka2", "lat": 12.935, "lon": 77.624, "state": "Karnataka", "city": "Bengaluru", "area": "Koramangala", "riskScore": 72, "riskLevel": "Medium", "totalViolations": 4320, "accidentCount": 112, "mostCommonViolation": "Wrong Side Driving", "roadType": "Residential", "avgFine": 600, "avgSpeed": 32, "weather": "Rainy"},
    {"id": "ka3", "lat": 13.035, "lon": 77.597, "state": "Karnataka", "city": "Bengaluru", "area": "Hebbal Flyover", "riskScore": 80, "riskLevel": "High", "totalViolations": 5670, "accidentCount": 156, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1200, "avgSpeed": 68, "weather": "Rainy"},
    {"id": "ts1", "lat": 17.385, "lon": 78.486, "state": "Telangana", "city": "Hyderabad", "area": "Hitech City Junction", "riskScore": 78, "riskLevel": "High", "totalViolations": 5670, "accidentCount": 145, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 1000, "avgSpeed": 55, "weather": "Clear"},
    {"id": "ts2", "lat": 17.440, "lon": 78.348, "state": "Telangana", "city": "Hyderabad", "area": "Gachibowli ORR", "riskScore": 82, "riskLevel": "High", "totalViolations": 6230, "accidentCount": 178, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1500, "avgSpeed": 90, "weather": "Clear"},
    {"id": "tn1", "lat": 13.082, "lon": 80.270, "state": "Tamil Nadu", "city": "Chennai", "area": "Anna Salai", "riskScore": 76, "riskLevel": "Medium", "totalViolations": 4890, "accidentCount": 123, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 700, "avgSpeed": 35, "weather": "Rainy"},
    {"id": "tn2", "lat": 13.047, "lon": 80.243, "state": "Tamil Nadu", "city": "Chennai", "area": "ECR Road", "riskScore": 83, "riskLevel": "High", "totalViolations": 5670, "accidentCount": 167, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1400, "avgSpeed": 78, "weather": "Rainy"},
    {"id": "wb1", "lat": 22.572, "lon": 88.363, "state": "West Bengal", "city": "Kolkata", "area": "Park Street", "riskScore": 70, "riskLevel": "Medium", "totalViolations": 3450, "accidentCount": 87, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 28, "weather": "Humid"},
    {"id": "wb2", "lat": 22.540, "lon": 88.340, "state": "West Bengal", "city": "Kolkata", "area": "Howrah Bridge Approach", "riskScore": 74, "riskLevel": "Medium", "totalViolations": 4120, "accidentCount": 105, "mostCommonViolation": "Wrong Side Driving", "roadType": "Bridge", "avgFine": 600, "avgSpeed": 22, "weather": "Humid"},
    {"id": "rj1", "lat": 26.912, "lon": 75.787, "state": "Rajasthan", "city": "Jaipur", "area": "MI Road", "riskScore": 65, "riskLevel": "Medium", "totalViolations": 2870, "accidentCount": 72, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 40, "weather": "Clear"},
    {"id": "rj2", "lat": 26.850, "lon": 75.760, "state": "Rajasthan", "city": "Jaipur", "area": "Ajmer Road Highway", "riskScore": 71, "riskLevel": "Medium", "totalViolations": 3450, "accidentCount": 98, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1100, "avgSpeed": 75, "weather": "Clear"},
    {"id": "up1", "lat": 26.846, "lon": 80.946, "state": "Uttar Pradesh", "city": "Lucknow", "area": "Hazratganj", "riskScore": 69, "riskLevel": "Medium", "totalViolations": 3120, "accidentCount": 84, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 700, "avgSpeed": 32, "weather": "Foggy"},
    {"id": "up2", "lat": 26.780, "lon": 80.890, "state": "Uttar Pradesh", "city": "Lucknow", "area": "Amar Shaheed Path", "riskScore": 73, "riskLevel": "Medium", "totalViolations": 3780, "accidentCount": 102, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1000, "avgSpeed": 68, "weather": "Foggy"},
    {"id": "up3", "lat": 28.613, "lon": 77.209, "state": "Uttar Pradesh", "city": "Agra", "area": "Taj Expressway", "riskScore": 77, "riskLevel": "High", "totalViolations": 4560, "accidentCount": 134, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1500, "avgSpeed": 95, "weather": "Foggy"},
    {"id": "gj1", "lat": 23.022, "lon": 72.571, "state": "Gujarat", "city": "Ahmedabad", "area": "SG Highway", "riskScore": 67, "riskLevel": "Medium", "totalViolations": 3240, "accidentCount": 78, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1000, "avgSpeed": 72, "weather": "Clear"},
    {"id": "gj2", "lat": 22.307, "lon": 73.181, "state": "Gujarat", "city": "Vadodara", "area": "NH-48 Bypass", "riskScore": 62, "riskLevel": "Medium", "totalViolations": 2560, "accidentCount": 65, "mostCommonViolation": "No Helmet", "roadType": "Highway", "avgFine": 500, "avgSpeed": 60, "weather": "Clear"},
    {"id": "mp1", "lat": 23.259, "lon": 77.412, "state": "Madhya Pradesh", "city": "Bhopal", "area": "Habibganj Junction", "riskScore": 58, "riskLevel": "Medium", "totalViolations": 2130, "accidentCount": 52, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 600, "avgSpeed": 35, "weather": "Clear"},
    {"id": "kl1", "lat": 9.931, "lon": 76.267, "state": "Kerala", "city": "Kochi", "area": "NH-66 Edappally", "riskScore": 71, "riskLevel": "Medium", "totalViolations": 3560, "accidentCount": 94, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 900, "avgSpeed": 55, "weather": "Rainy"},
    {"id": "kl2", "lat": 8.524, "lon": 76.936, "state": "Kerala", "city": "Thiruvananthapuram", "area": "MG Road", "riskScore": 63, "riskLevel": "Medium", "totalViolations": 2340, "accidentCount": 58, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 38, "weather": "Rainy"},
    {"id": "br1", "lat": 25.609, "lon": 85.137, "state": "Bihar", "city": "Patna", "area": "Gandhi Maidan Area", "riskScore": 72, "riskLevel": "Medium", "totalViolations": 3780, "accidentCount": 108, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 400, "avgSpeed": 30, "weather": "Foggy"},
    {"id": "pb1", "lat": 30.900, "lon": 75.857, "state": "Punjab", "city": "Ludhiana", "area": "GT Road", "riskScore": 68, "riskLevel": "Medium", "totalViolations": 2890, "accidentCount": 76, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 800, "avgSpeed": 62, "weather": "Foggy"},
    {"id": "as1", "lat": 26.144, "lon": 91.736, "state": "Assam", "city": "Guwahati", "area": "GS Road", "riskScore": 60, "riskLevel": "Medium", "totalViolations": 1980, "accidentCount": 48, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 400, "avgSpeed": 35, "weather": "Rainy"},
    {"id": "od1", "lat": 20.296, "lon": 85.824, "state": "Odisha", "city": "Bhubaneswar", "area": "NH-16", "riskScore": 64, "riskLevel": "Medium", "totalViolations": 2450, "accidentCount": 62, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 700, "avgSpeed": 58, "weather": "Clear"},
    {"id": "ts3", "lat": 17.360, "lon": 78.560, "state": "Telangana", "city": "Hyderabad", "area": "Charminar Zone", "riskScore": 69, "riskLevel": "Medium", "totalViolations": 2890, "accidentCount": 76, "mostCommonViolation": "Wrong Side Driving", "roadType": "Residential", "avgFine": 500, "avgSpeed": 22, "weather": "Clear"},
]

# City local areas (for city-level risk markers)
CITY_AREAS = {
    "Nagpur": [
        {"id": "ngp1", "lat": 21.1458, "lon": 79.0882, "state": "Maharashtra", "city": "Nagpur", "area": "Dharampeth", "riskScore": 78, "riskLevel": "High", "totalViolations": 3450, "accidentCount": 89, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 800, "avgSpeed": 45, "weather": "Clear"},
        {"id": "ngp2", "lat": 21.1500, "lon": 79.0950, "state": "Maharashtra", "city": "Nagpur", "area": "Sitabuldi", "riskScore": 74, "riskLevel": "Medium", "totalViolations": 2980, "accidentCount": 72, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 600, "avgSpeed": 28, "weather": "Clear"},
        {"id": "ngp3", "lat": 21.1200, "lon": 79.0750, "state": "Maharashtra", "city": "Nagpur", "area": "Wardha Road", "riskScore": 82, "riskLevel": "High", "totalViolations": 4120, "accidentCount": 105, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1200, "avgSpeed": 68, "weather": "Clear"},
        {"id": "ngp4", "lat": 21.1600, "lon": 79.1000, "state": "Maharashtra", "city": "Nagpur", "area": "Civil Lines", "riskScore": 55, "riskLevel": "Medium", "totalViolations": 1560, "accidentCount": 34, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 32, "weather": "Clear"},
        {"id": "ngp5", "lat": 21.1000, "lon": 79.0600, "state": "Maharashtra", "city": "Nagpur", "area": "Hingna Industrial", "riskScore": 71, "riskLevel": "Medium", "totalViolations": 2340, "accidentCount": 58, "mostCommonViolation": "Drunk Driving", "roadType": "Industrial", "avgFine": 1500, "avgSpeed": 42, "weather": "Clear"},
        {"id": "ngp6", "lat": 21.1800, "lon": 79.1100, "state": "Maharashtra", "city": "Nagpur", "area": "Kamptee Road", "riskScore": 76, "riskLevel": "High", "totalViolations": 3120, "accidentCount": 84, "mostCommonViolation": "Wrong Side Driving", "roadType": "Arterial", "avgFine": 600, "avgSpeed": 35, "weather": "Clear"},
        {"id": "ngp7", "lat": 21.1300, "lon": 79.1200, "state": "Maharashtra", "city": "Nagpur", "area": "Manewada", "riskScore": 68, "riskLevel": "Medium", "totalViolations": 2180, "accidentCount": 52, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 30, "weather": "Clear"},
        {"id": "ngp8", "lat": 21.0900, "lon": 79.0500, "state": "Maharashtra", "city": "Nagpur", "area": "Wadi Junction", "riskScore": 73, "riskLevel": "Medium", "totalViolations": 2670, "accidentCount": 67, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 700, "avgSpeed": 25, "weather": "Clear"},
        {"id": "ngp9", "lat": 21.1700, "lon": 79.0800, "state": "Maharashtra", "city": "Nagpur", "area": "Koradi Road", "riskScore": 65, "riskLevel": "Medium", "totalViolations": 1890, "accidentCount": 45, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 38, "weather": "Clear"},
        {"id": "ngp10", "lat": 21.1100, "lon": 79.0900, "state": "Maharashtra", "city": "Nagpur", "area": "Itwari Bazaar", "riskScore": 70, "riskLevel": "Medium", "totalViolations": 2450, "accidentCount": 62, "mostCommonViolation": "Wrong Side Driving", "roadType": "Market", "avgFine": 500, "avgSpeed": 18, "weather": "Clear"},
        {"id": "ngp11", "lat": 21.0800, "lon": 79.0700, "state": "Maharashtra", "city": "Nagpur", "area": "Automotive Square", "riskScore": 80, "riskLevel": "High", "totalViolations": 3780, "accidentCount": 98, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1100, "avgSpeed": 72, "weather": "Clear"},
        {"id": "ngp12", "lat": 21.1900, "lon": 79.0600, "state": "Maharashtra", "city": "Nagpur", "area": "Kdk Road", "riskScore": 62, "riskLevel": "Medium", "totalViolations": 1780, "accidentCount": 41, "mostCommonViolation": "No Seatbelt", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 40, "weather": "Clear"},
        {"id": "ngp13", "lat": 21.1550, "lon": 79.0400, "state": "Maharashtra", "city": "Nagpur", "area": "Lakshmi Nagar", "riskScore": 58, "riskLevel": "Medium", "totalViolations": 1450, "accidentCount": 32, "mostCommonViolation": "Signal Jumping", "roadType": "Residential", "avgFine": 600, "avgSpeed": 28, "weather": "Clear"},
        {"id": "ngp14", "lat": 21.1050, "lon": 79.1050, "state": "Maharashtra", "city": "Nagpur", "area": "Bajaj Nagar", "riskScore": 66, "riskLevel": "Medium", "totalViolations": 2010, "accidentCount": 48, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 34, "weather": "Clear"},
        {"id": "ngp15", "lat": 21.1350, "lon": 79.0500, "state": "Maharashtra", "city": "Nagpur", "area": "Pratap Nagar", "riskScore": 54, "riskLevel": "Low", "totalViolations": 1120, "accidentCount": 22, "mostCommonViolation": "No Seatbelt", "roadType": "Residential", "avgFine": 500, "avgSpeed": 30, "weather": "Clear"},
        {"id": "ngp16", "lat": 21.1650, "lon": 79.0300, "state": "Maharashtra", "city": "Nagpur", "area": "Mankapur", "riskScore": 52, "riskLevel": "Low", "totalViolations": 980, "accidentCount": 18, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 28, "weather": "Clear"},
        {"id": "ngp17", "lat": 21.0700, "lon": 79.0900, "state": "Maharashtra", "city": "Nagpur", "area": "Jaripatka", "riskScore": 64, "riskLevel": "Medium", "totalViolations": 1890, "accidentCount": 44, "mostCommonViolation": "Triple Riding", "roadType": "Market", "avgFine": 500, "avgSpeed": 20, "weather": "Clear"},
        {"id": "ngp18", "lat": 21.1400, "lon": 79.1300, "state": "Maharashtra", "city": "Nagpur", "area": "Gittikhadan", "riskScore": 59, "riskLevel": "Medium", "totalViolations": 1560, "accidentCount": 36, "mostCommonViolation": "Wrong Side Driving", "roadType": "Residential", "avgFine": 500, "avgSpeed": 26, "weather": "Clear"},
        {"id": "ngp19", "lat": 21.2000, "lon": 79.0900, "state": "Maharashtra", "city": "Nagpur", "area": "Khapri", "riskScore": 48, "riskLevel": "Low", "totalViolations": 780, "accidentCount": 12, "mostCommonViolation": "No Helmet", "roadType": "Rural", "avgFine": 400, "avgSpeed": 35, "weather": "Clear"},
        {"id": "ngp20", "lat": 21.1250, "lon": 79.0400, "state": "Maharashtra", "city": "Nagpur", "area": "Sonegaon", "riskScore": 50, "riskLevel": "Low", "totalViolations": 890, "accidentCount": 15, "mostCommonViolation": "No Seatbelt", "roadType": "Residential", "avgFine": 500, "avgSpeed": 32, "weather": "Clear"},
    ],
    "Pune": [
        {"id": "pune1", "lat": 18.5204, "lon": 73.8567, "state": "Maharashtra", "city": "Pune", "area": "Hinjewadi", "riskScore": 84, "riskLevel": "High", "totalViolations": 6780, "accidentCount": 172, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1200, "avgSpeed": 65, "weather": "Cloudy"},
        {"id": "pune2", "lat": 18.5310, "lon": 73.8440, "state": "Maharashtra", "city": "Pune", "area": "Swargate", "riskScore": 79, "riskLevel": "High", "totalViolations": 5430, "accidentCount": 134, "mostCommonViolation": "Wrong Side Driving", "roadType": "Intersection", "avgFine": 600, "avgSpeed": 22, "weather": "Cloudy"},
        {"id": "pune3", "lat": 18.5590, "lon": 73.8210, "state": "Maharashtra", "city": "Pune", "area": "Aundh", "riskScore": 62, "riskLevel": "Medium", "totalViolations": 2340, "accidentCount": 56, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 30, "weather": "Cloudy"},
        {"id": "pune4", "lat": 18.5000, "lon": 73.8700, "state": "Maharashtra", "city": "Pune", "area": "Katraj", "riskScore": 75, "riskLevel": "Medium", "totalViolations": 3890, "accidentCount": 92, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1000, "avgSpeed": 58, "weather": "Cloudy"},
        {"id": "pune5", "lat": 18.5600, "lon": 73.7800, "state": "Maharashtra", "city": "Pune", "area": "Bavdhan", "riskScore": 58, "riskLevel": "Medium", "totalViolations": 1670, "accidentCount": 38, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 600, "avgSpeed": 35, "weather": "Cloudy"},
        {"id": "pune6", "lat": 18.4900, "lon": 73.8200, "state": "Maharashtra", "city": "Pune", "area": "Hadapsar", "riskScore": 71, "riskLevel": "Medium", "totalViolations": 3120, "accidentCount": 78, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 38, "weather": "Cloudy"},
        {"id": "pune7", "lat": 18.5700, "lon": 73.8400, "state": "Maharashtra", "city": "Pune", "area": "Pashan", "riskScore": 54, "riskLevel": "Low", "totalViolations": 1230, "accidentCount": 28, "mostCommonViolation": "No Seatbelt", "roadType": "Residential", "avgFine": 500, "avgSpeed": 32, "weather": "Cloudy"},
        {"id": "pune8", "lat": 18.5400, "lon": 73.8900, "state": "Maharashtra", "city": "Pune", "area": "Kharadi", "riskScore": 68, "riskLevel": "Medium", "totalViolations": 2560, "accidentCount": 62, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 800, "avgSpeed": 45, "weather": "Cloudy"},
        {"id": "pune9", "lat": 18.5100, "lon": 73.8300, "state": "Maharashtra", "city": "Pune", "area": "Shivajinagar", "riskScore": 73, "riskLevel": "Medium", "totalViolations": 2980, "accidentCount": 74, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 700, "avgSpeed": 24, "weather": "Cloudy"},
        {"id": "pune10", "lat": 18.5800, "lon": 73.8100, "state": "Maharashtra", "city": "Pune", "area": "Wakad", "riskScore": 66, "riskLevel": "Medium", "totalViolations": 2180, "accidentCount": 52, "mostCommonViolation": "Triple Riding", "roadType": "Residential", "avgFine": 500, "avgSpeed": 28, "weather": "Cloudy"},
    ],
    "Mumbai": [
        {"id": "mum1", "lat": 19.076, "lon": 72.877, "state": "Maharashtra", "city": "Mumbai", "area": "Bandra-Worli", "riskScore": 92, "riskLevel": "High", "totalViolations": 8920, "accidentCount": 245, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1500, "avgSpeed": 72, "weather": "Clear"},
        {"id": "mum2", "lat": 19.088, "lon": 72.835, "state": "Maharashtra", "city": "Mumbai", "area": "Andheri-Kurla", "riskScore": 87, "riskLevel": "High", "totalViolations": 7650, "accidentCount": 198, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 800, "avgSpeed": 28, "weather": "Clear"},
        {"id": "mum3", "lat": 19.017, "lon": 72.850, "state": "Maharashtra", "city": "Mumbai", "area": "Lower Parel", "riskScore": 78, "riskLevel": "High", "totalViolations": 5430, "accidentCount": 134, "mostCommonViolation": "Wrong Side Driving", "roadType": "Arterial", "avgFine": 600, "avgSpeed": 22, "weather": "Clear"},
        {"id": "mum4", "lat": 18.950, "lon": 72.820, "state": "Maharashtra", "city": "Mumbai", "area": "Marine Drive", "riskScore": 74, "riskLevel": "Medium", "totalViolations": 4120, "accidentCount": 98, "mostCommonViolation": "Overspeeding", "roadType": "Coastal", "avgFine": 1000, "avgSpeed": 55, "weather": "Clear"},
        {"id": "mum5", "lat": 19.120, "lon": 72.890, "state": "Maharashtra", "city": "Mumbai", "area": "Goregaon", "riskScore": 69, "riskLevel": "Medium", "totalViolations": 3450, "accidentCount": 82, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 32, "weather": "Clear"},
        {"id": "mum6", "lat": 19.200, "lon": 72.970, "state": "Maharashtra", "city": "Mumbai", "area": "Thane GB Road", "riskScore": 76, "riskLevel": "High", "totalViolations": 4980, "accidentCount": 118, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1100, "avgSpeed": 62, "weather": "Clear"},
        {"id": "mum7", "lat": 19.040, "lon": 72.860, "state": "Maharashtra", "city": "Mumbai", "area": "Dadar Junction", "riskScore": 83, "riskLevel": "High", "totalViolations": 6230, "accidentCount": 167, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 800, "avgSpeed": 20, "weather": "Clear"},
        {"id": "mum8", "lat": 18.990, "lon": 72.830, "state": "Maharashtra", "city": "Mumbai", "area": "Nariman Point", "riskScore": 62, "riskLevel": "Medium", "totalViolations": 2180, "accidentCount": 48, "mostCommonViolation": "No Seatbelt", "roadType": "Commercial", "avgFine": 500, "avgSpeed": 28, "weather": "Clear"},
        {"id": "mum9", "lat": 19.060, "lon": 72.920, "state": "Maharashtra", "city": "Mumbai", "area": "Chembur", "riskScore": 72, "riskLevel": "Medium", "totalViolations": 3780, "accidentCount": 88, "mostCommonViolation": "Drunk Driving", "roadType": "Arterial", "avgFine": 1500, "avgSpeed": 35, "weather": "Clear"},
        {"id": "mum10", "lat": 19.150, "lon": 72.840, "state": "Maharashtra", "city": "Mumbai", "area": "Borivali", "riskScore": 58, "riskLevel": "Medium", "totalViolations": 1890, "accidentCount": 42, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 30, "weather": "Clear"},
    ],
    "Delhi": [
        {"id": "del1", "lat": 28.630, "lon": 77.217, "state": "Delhi", "city": "Delhi", "area": "Connaught Place", "riskScore": 91, "riskLevel": "High", "totalViolations": 9870, "accidentCount": 312, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 900, "avgSpeed": 30, "weather": "Hazy"},
        {"id": "del2", "lat": 28.535, "lon": 77.391, "state": "Delhi", "city": "Delhi", "area": "Noida Expressway", "riskScore": 89, "riskLevel": "High", "totalViolations": 7650, "accidentCount": 278, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1500, "avgSpeed": 85, "weather": "Hazy"},
        {"id": "del3", "lat": 28.669, "lon": 77.453, "state": "Delhi", "city": "Delhi", "area": "Rohini", "riskScore": 82, "riskLevel": "High", "totalViolations": 5430, "accidentCount": 167, "mostCommonViolation": "Drunk Driving", "roadType": "Residential", "avgFine": 2000, "avgSpeed": 38, "weather": "Hazy"},
        {"id": "del4", "lat": 28.567, "lon": 77.210, "state": "Delhi", "city": "Delhi", "area": "Saket", "riskScore": 76, "riskLevel": "Medium", "totalViolations": 4210, "accidentCount": 98, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 42, "weather": "Hazy"},
        {"id": "del5", "lat": 28.613, "lon": 77.229, "state": "Delhi", "city": "Delhi", "area": "India Gate Area", "riskScore": 72, "riskLevel": "Medium", "totalViolations": 3560, "accidentCount": 84, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 1000, "avgSpeed": 48, "weather": "Hazy"},
        {"id": "del6", "lat": 28.482, "lon": 77.510, "state": "Delhi", "city": "Delhi", "area": "Greater Noida", "riskScore": 80, "riskLevel": "High", "totalViolations": 5120, "accidentCount": 142, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1400, "avgSpeed": 92, "weather": "Hazy"},
        {"id": "del7", "lat": 28.704, "lon": 77.102, "state": "Delhi", "city": "Delhi", "area": "Pitampura", "riskScore": 68, "riskLevel": "Medium", "totalViolations": 2890, "accidentCount": 72, "mostCommonViolation": "Signal Jumping", "roadType": "Residential", "avgFine": 600, "avgSpeed": 34, "weather": "Hazy"},
        {"id": "del8", "lat": 28.635, "lon": 77.282, "state": "Delhi", "city": "Delhi", "area": "Laxmi Nagar", "riskScore": 74, "riskLevel": "Medium", "totalViolations": 3670, "accidentCount": 92, "mostCommonViolation": "Wrong Side Driving", "roadType": "Market", "avgFine": 600, "avgSpeed": 22, "weather": "Hazy"},
        {"id": "del9", "lat": 28.590, "lon": 77.050, "state": "Delhi", "city": "Delhi", "area": "Dwarka", "riskScore": 63, "riskLevel": "Medium", "totalViolations": 2340, "accidentCount": 56, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 38, "weather": "Hazy"},
        {"id": "del10", "lat": 28.650, "lon": 77.230, "state": "Delhi", "city": "Delhi", "area": "Karol Bagh", "riskScore": 71, "riskLevel": "Medium", "totalViolations": 3120, "accidentCount": 78, "mostCommonViolation": "Triple Riding", "roadType": "Market", "avgFine": 500, "avgSpeed": 20, "weather": "Hazy"},
    ],
    "Bengaluru": [
        {"id": "blr1", "lat": 12.971, "lon": 77.594, "state": "Karnataka", "city": "Bengaluru", "area": "Silk Board", "riskScore": 85, "riskLevel": "High", "totalViolations": 7890, "accidentCount": 234, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 800, "avgSpeed": 18, "weather": "Rainy"},
        {"id": "blr2", "lat": 12.935, "lon": 77.624, "state": "Karnataka", "city": "Bengaluru", "area": "Koramangala", "riskScore": 72, "riskLevel": "Medium", "totalViolations": 4320, "accidentCount": 112, "mostCommonViolation": "Wrong Side Driving", "roadType": "Residential", "avgFine": 600, "avgSpeed": 32, "weather": "Rainy"},
        {"id": "blr3", "lat": 13.035, "lon": 77.597, "state": "Karnataka", "city": "Bengaluru", "area": "Hebbal Flyover", "riskScore": 80, "riskLevel": "High", "totalViolations": 5670, "accidentCount": 156, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1200, "avgSpeed": 68, "weather": "Rainy"},
        {"id": "blr4", "lat": 12.970, "lon": 77.640, "state": "Karnataka", "city": "Bengaluru", "area": "Whitefield", "riskScore": 76, "riskLevel": "High", "totalViolations": 4980, "accidentCount": 128, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 900, "avgSpeed": 52, "weather": "Rainy"},
        {"id": "blr5", "lat": 12.910, "lon": 77.560, "state": "Karnataka", "city": "Bengaluru", "area": "JP Nagar", "riskScore": 64, "riskLevel": "Medium", "totalViolations": 2450, "accidentCount": 58, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 30, "weather": "Rainy"},
        {"id": "blr6", "lat": 12.980, "lon": 77.570, "state": "Karnataka", "city": "Bengaluru", "area": "Indiranagar", "riskScore": 69, "riskLevel": "Medium", "totalViolations": 3120, "accidentCount": 76, "mostCommonViolation": "Drunk Driving", "roadType": "Arterial", "avgFine": 1500, "avgSpeed": 28, "weather": "Rainy"},
        {"id": "blr7", "lat": 13.020, "lon": 77.630, "state": "Karnataka", "city": "Bengaluru", "area": "Manyata Tech Park", "riskScore": 73, "riskLevel": "Medium", "totalViolations": 3560, "accidentCount": 88, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 800, "avgSpeed": 45, "weather": "Rainy"},
        {"id": "blr8", "lat": 12.890, "lon": 77.590, "state": "Karnataka", "city": "Bengaluru", "area": "Electronic City", "riskScore": 78, "riskLevel": "High", "totalViolations": 4560, "accidentCount": 112, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1100, "avgSpeed": 58, "weather": "Rainy"},
        {"id": "blr9", "lat": 12.950, "lon": 77.550, "state": "Karnataka", "city": "Bengaluru", "area": "Basavanagudi", "riskScore": 56, "riskLevel": "Medium", "totalViolations": 1560, "accidentCount": 34, "mostCommonViolation": "Signal Jumping", "roadType": "Residential", "avgFine": 600, "avgSpeed": 24, "weather": "Rainy"},
        {"id": "blr10", "lat": 13.010, "lon": 77.580, "state": "Karnataka", "city": "Bengaluru", "area": "Malleshwaram", "riskScore": 61, "riskLevel": "Medium", "totalViolations": 1980, "accidentCount": 42, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 26, "weather": "Rainy"},
    ],
    "Hyderabad": [
        {"id": "hyd1", "lat": 17.385, "lon": 78.486, "state": "Telangana", "city": "Hyderabad", "area": "Hitech City", "riskScore": 78, "riskLevel": "High", "totalViolations": 5670, "accidentCount": 145, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 1000, "avgSpeed": 55, "weather": "Clear"},
        {"id": "hyd2", "lat": 17.440, "lon": 78.348, "state": "Telangana", "city": "Hyderabad", "area": "Gachibowli ORR", "riskScore": 82, "riskLevel": "High", "totalViolations": 6230, "accidentCount": 178, "mostCommonViolation": "Overspeeding", "roadType": "Highway", "avgFine": 1500, "avgSpeed": 90, "weather": "Clear"},
        {"id": "hyd3", "lat": 17.360, "lon": 78.560, "state": "Telangana", "city": "Hyderabad", "area": "Charminar", "riskScore": 69, "riskLevel": "Medium", "totalViolations": 2890, "accidentCount": 76, "mostCommonViolation": "Wrong Side Driving", "roadType": "Residential", "avgFine": 500, "avgSpeed": 22, "weather": "Clear"},
        {"id": "hyd4", "lat": 17.410, "lon": 78.440, "state": "Telangana", "city": "Hyderabad", "area": "Banjara Hills", "riskScore": 65, "riskLevel": "Medium", "totalViolations": 2340, "accidentCount": 56, "mostCommonViolation": "Signal Jumping", "roadType": "Arterial", "avgFine": 600, "avgSpeed": 32, "weather": "Clear"},
        {"id": "hyd5", "lat": 17.460, "lon": 78.520, "state": "Telangana", "city": "Hyderabad", "area": "Secunderabad", "riskScore": 73, "riskLevel": "Medium", "totalViolations": 3450, "accidentCount": 88, "mostCommonViolation": "No Helmet", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 35, "weather": "Clear"},
        {"id": "hyd6", "lat": 17.320, "lon": 78.480, "state": "Telangana", "city": "Hyderabad", "area": "LB Nagar", "riskScore": 71, "riskLevel": "Medium", "totalViolations": 3120, "accidentCount": 78, "mostCommonViolation": "Overspeeding", "roadType": "Arterial", "avgFine": 800, "avgSpeed": 42, "weather": "Clear"},
        {"id": "hyd7", "lat": 17.380, "lon": 78.380, "state": "Telangana", "city": "Hyderabad", "area": "Kukatpally", "riskScore": 67, "riskLevel": "Medium", "totalViolations": 2670, "accidentCount": 62, "mostCommonViolation": "Drunk Driving", "roadType": "Residential", "avgFine": 1500, "avgSpeed": 30, "weather": "Clear"},
        {"id": "hyd8", "lat": 17.500, "lon": 78.400, "state": "Telangana", "city": "Hyderabad", "area": "Miyapur", "riskScore": 60, "riskLevel": "Medium", "totalViolations": 1890, "accidentCount": 44, "mostCommonViolation": "No Helmet", "roadType": "Residential", "avgFine": 500, "avgSpeed": 28, "weather": "Clear"},
        {"id": "hyd9", "lat": 17.340, "lon": 78.420, "state": "Telangana", "city": "Hyderabad", "area": "Mehdipatnam", "riskScore": 74, "riskLevel": "Medium", "totalViolations": 3560, "accidentCount": 92, "mostCommonViolation": "Signal Jumping", "roadType": "Intersection", "avgFine": 700, "avgSpeed": 24, "weather": "Clear"},
        {"id": "hyd10", "lat": 17.470, "lon": 78.560, "state": "Telangana", "city": "Hyderabad", "area": "Uppal", "riskScore": 62, "riskLevel": "Medium", "totalViolations": 2120, "accidentCount": 50, "mostCommonViolation": "Wrong Side Driving", "roadType": "Arterial", "avgFine": 500, "avgSpeed": 34, "weather": "Clear"},
    ],
}

CITY_SUMMARIES = {
    "Nagpur": {"city": "Nagpur", "state": "Maharashtra", "totalViolations": 45230, "totalAccidents": 1245, "highRiskAreas": 8, "mostCommonViolation": "Overspeeding", "avgSpeed": 38, "totalFineCollected": 34250000, "weather": "Clear", "riskScore": 78, "temperature": 32, "humidity": 45},
    "Pune": {"city": "Pune", "state": "Maharashtra", "totalViolations": 52100, "totalAccidents": 1580, "highRiskAreas": 10, "mostCommonViolation": "Overspeeding", "avgSpeed": 42, "totalFineCollected": 42180000, "weather": "Cloudy", "riskScore": 82, "temperature": 28, "humidity": 65},
    "Mumbai": {"city": "Mumbai", "state": "Maharashtra", "totalViolations": 68900, "totalAccidents": 2100, "highRiskAreas": 14, "mostCommonViolation": "Signal Jumping", "avgSpeed": 32, "totalFineCollected": 58760000, "weather": "Clear", "riskScore": 88, "temperature": 30, "humidity": 72},
    "Delhi": {"city": "Delhi", "state": "Delhi", "totalViolations": 73200, "totalAccidents": 2450, "highRiskAreas": 16, "mostCommonViolation": "Overspeeding", "avgSpeed": 38, "totalFineCollected": 65420000, "weather": "Hazy", "riskScore": 91, "temperature": 34, "humidity": 55},
    "Bengaluru": {"city": "Bengaluru", "state": "Karnataka", "totalViolations": 48700, "totalAccidents": 1890, "highRiskAreas": 12, "mostCommonViolation": "Signal Jumping", "avgSpeed": 35, "totalFineCollected": 39870000, "weather": "Rainy", "riskScore": 79, "temperature": 26, "humidity": 80},
    "Hyderabad": {"city": "Hyderabad", "state": "Telangana", "totalViolations": 39800, "totalAccidents": 1120, "highRiskAreas": 9, "mostCommonViolation": "Overspeeding", "avgSpeed": 40, "totalFineCollected": 32140000, "weather": "Clear", "riskScore": 72, "temperature": 35, "humidity": 40},
    "Chennai": {"city": "Chennai", "state": "Tamil Nadu", "totalViolations": 41200, "totalAccidents": 1340, "highRiskAreas": 11, "mostCommonViolation": "Overspeeding", "avgSpeed": 36, "totalFineCollected": 33450000, "weather": "Rainy", "riskScore": 75, "temperature": 33, "humidity": 78},
    "Kolkata": {"city": "Kolkata", "state": "West Bengal", "totalViolations": 37600, "totalAccidents": 1080, "highRiskAreas": 8, "mostCommonViolation": "No Helmet", "avgSpeed": 28, "totalFineCollected": 28970000, "weather": "Humid", "riskScore": 70, "temperature": 34, "humidity": 85},
    "Jaipur": {"city": "Jaipur", "state": "Rajasthan", "totalViolations": 29800, "totalAccidents": 920, "highRiskAreas": 6, "mostCommonViolation": "No Helmet", "avgSpeed": 44, "totalFineCollected": 21340000, "weather": "Clear", "riskScore": 65, "temperature": 38, "humidity": 25},
    "Lucknow": {"city": "Lucknow", "state": "Uttar Pradesh", "totalViolations": 34500, "totalAccidents": 1050, "highRiskAreas": 7, "mostCommonViolation": "Signal Jumping", "avgSpeed": 36, "totalFineCollected": 25780000, "weather": "Foggy", "riskScore": 69, "temperature": 30, "humidity": 60},
}


# ────────────────────────────────────────────
# EXTENDED CITY MASTER (100+ cities)
# ────────────────────────────────────────────

EXTENDED_CITIES = [
    # Maharashtra
    {"city_name": "Mumbai", "state_name": "Maharashtra", "latitude": 19.0760, "longitude": 72.8777, "population": 12442373},
    {"city_name": "Pune", "state_name": "Maharashtra", "latitude": 18.5204, "longitude": 73.8567, "population": 3124458},
    {"city_name": "Nagpur", "state_name": "Maharashtra", "latitude": 21.1458, "longitude": 79.0882, "population": 2405665},
    {"city_name": "Thane", "state_name": "Maharashtra", "latitude": 19.2183, "longitude": 72.9781, "population": 1841450},
    {"city_name": "Nashik", "state_name": "Maharashtra", "latitude": 19.9975, "longitude": 73.7898, "population": 1486050},
    {"city_name": "Aurangabad", "state_name": "Maharashtra", "latitude": 19.8762, "longitude": 75.3433, "population": 1189060},
    {"city_name": "Navi Mumbai", "state_name": "Maharashtra", "latitude": 19.0330, "longitude": 73.0297, "population": 1120540},
    {"city_name": "Solapur", "state_name": "Maharashtra", "latitude": 17.6599, "longitude": 75.9064, "population": 951600},
    {"city_name": "Kolhapur", "state_name": "Maharashtra", "latitude": 16.7050, "longitude": 74.2433, "population": 561800},
    {"city_name": "Amravati", "state_name": "Maharashtra", "latitude": 20.9320, "longitude": 77.7523, "population": 647060},
    {"city_name": "Sangli", "state_name": "Maharashtra", "latitude": 16.8524, "longitude": 74.5815, "population": 436600},
    {"city_name": "Jalgaon", "state_name": "Maharashtra", "latitude": 21.0077, "longitude": 75.5626, "population": 460400},
    {"city_name": "Akola", "state_name": "Maharashtra", "latitude": 20.7000, "longitude": 77.0000, "population": 425800},
    # Delhi
    {"city_name": "Delhi", "state_name": "Delhi", "latitude": 28.7041, "longitude": 77.1025, "population": 11034555},
    # Karnataka
    {"city_name": "Bengaluru", "state_name": "Karnataka", "latitude": 12.9716, "longitude": 77.5946, "population": 8443675},
    {"city_name": "Mysuru", "state_name": "Karnataka", "latitude": 12.2958, "longitude": 76.6394, "population": 920550},
    {"city_name": "Hubli-Dharwad", "state_name": "Karnataka", "latitude": 15.3647, "longitude": 75.1240, "population": 943800},
    {"city_name": "Mangaluru", "state_name": "Karnataka", "latitude": 12.9141, "longitude": 74.8560, "population": 488900},
    {"city_name": "Belagavi", "state_name": "Karnataka", "latitude": 15.8523, "longitude": 74.4977, "population": 488300},
    {"city_name": "Gulbarga", "state_name": "Karnataka", "latitude": 17.3297, "longitude": 76.8343, "population": 533600},
    # Telangana
    {"city_name": "Hyderabad", "state_name": "Telangana", "latitude": 17.3850, "longitude": 78.4867, "population": 6809970},
    {"city_name": "Warangal", "state_name": "Telangana", "latitude": 17.9784, "longitude": 79.5941, "population": 704600},
    {"city_name": "Nizamabad", "state_name": "Telangana", "latitude": 18.6730, "longitude": 78.0941, "population": 311700},
    # Tamil Nadu
    {"city_name": "Chennai", "state_name": "Tamil Nadu", "latitude": 13.0827, "longitude": 80.2707, "population": 4681087},
    {"city_name": "Coimbatore", "state_name": "Tamil Nadu", "latitude": 11.0168, "longitude": 76.9558, "population": 1050720},
    {"city_name": "Madurai", "state_name": "Tamil Nadu", "latitude": 9.9252, "longitude": 78.1198, "population": 1017860},
    {"city_name": "Salem", "state_name": "Tamil Nadu", "latitude": 11.6643, "longitude": 78.1460, "population": 829570},
    {"city_name": "Tiruchirappalli", "state_name": "Tamil Nadu", "latitude": 10.7905, "longitude": 78.7047, "population": 916700},
    {"city_name": "Tirunelveli", "state_name": "Tamil Nadu", "latitude": 8.7139, "longitude": 77.7567, "population": 474800},
    {"city_name": "Vellore", "state_name": "Tamil Nadu", "latitude": 12.9165, "longitude": 79.1325, "population": 481900},
    # West Bengal
    {"city_name": "Kolkata", "state_name": "West Bengal", "latitude": 22.5726, "longitude": 88.3639, "population": 4496694},
    {"city_name": "Howrah", "state_name": "West Bengal", "latitude": 22.5760, "longitude": 88.2634, "population": 1072300},
    {"city_name": "Durgapur", "state_name": "West Bengal", "latitude": 23.5204, "longitude": 87.3119, "population": 566500},
    {"city_name": "Asansol", "state_name": "West Bengal", "latitude": 23.6840, "longitude": 86.9524, "population": 563000},
    {"city_name": "Siliguri", "state_name": "West Bengal", "latitude": 26.7271, "longitude": 88.3955, "population": 513400},
    # Rajasthan
    {"city_name": "Jaipur", "state_name": "Rajasthan", "latitude": 26.9124, "longitude": 75.7873, "population": 3073350},
    {"city_name": "Jodhpur", "state_name": "Rajasthan", "latitude": 26.2389, "longitude": 73.0243, "population": 1039900},
    {"city_name": "Udaipur", "state_name": "Rajasthan", "latitude": 24.5854, "longitude": 73.7125, "population": 451100},
    {"city_name": "Kota", "state_name": "Rajasthan", "latitude": 25.1800, "longitude": 75.8645, "population": 764100},
    {"city_name": "Ajmer", "state_name": "Rajasthan", "latitude": 26.4499, "longitude": 74.6399, "population": 542600},
    # Uttar Pradesh
    {"city_name": "Lucknow", "state_name": "Uttar Pradesh", "latitude": 26.8467, "longitude": 80.9462, "population": 2817105},
    {"city_name": "Kanpur", "state_name": "Uttar Pradesh", "latitude": 26.4499, "longitude": 80.3319, "population": 2765340},
    {"city_name": "Agra", "state_name": "Uttar Pradesh", "latitude": 27.1767, "longitude": 78.0081, "population": 1576000},
    {"city_name": "Varanasi", "state_name": "Uttar Pradesh", "latitude": 25.3176, "longitude": 83.0103, "population": 1198700},
    {"city_name": "Allahabad", "state_name": "Uttar Pradesh", "latitude": 25.4358, "longitude": 81.8463, "population": 1170000},
    {"city_name": "Meerut", "state_name": "Uttar Pradesh", "latitude": 28.9845, "longitude": 77.7064, "population": 1024000},
    {"city_name": "Bareilly", "state_name": "Uttar Pradesh", "latitude": 28.3670, "longitude": 79.4304, "population": 903600},
    {"city_name": "Aligarh", "state_name": "Uttar Pradesh", "latitude": 27.8974, "longitude": 78.0887, "population": 672600},
    {"city_name": "Moradabad", "state_name": "Uttar Pradesh", "latitude": 28.8389, "longitude": 78.7768, "population": 887800},
    {"city_name": "Ghaziabad", "state_name": "Uttar Pradesh", "latitude": 28.6692, "longitude": 77.4538, "population": 1632300},
    {"city_name": "Noida", "state_name": "Uttar Pradesh", "latitude": 28.5355, "longitude": 77.3910, "population": 642400},
    # Gujarat
    {"city_name": "Ahmedabad", "state_name": "Gujarat", "latitude": 23.0225, "longitude": 72.5714, "population": 5577940},
    {"city_name": "Surat", "state_name": "Gujarat", "latitude": 21.1702, "longitude": 72.8311, "population": 4467000},
    {"city_name": "Vadodara", "state_name": "Gujarat", "latitude": 22.3072, "longitude": 73.1812, "population": 1791200},
    {"city_name": "Rajkot", "state_name": "Gujarat", "latitude": 22.3039, "longitude": 70.8022, "population": 1283000},
    {"city_name": "Bhavnagar", "state_name": "Gujarat", "latitude": 21.7645, "longitude": 72.1539, "population": 593800},
    {"city_name": "Jamnagar", "state_name": "Gujarat", "latitude": 22.4707, "longitude": 70.0577, "population": 479900},
    # Madhya Pradesh
    {"city_name": "Bhopal", "state_name": "Madhya Pradesh", "latitude": 23.2599, "longitude": 77.4126, "population": 1795648},
    {"city_name": "Indore", "state_name": "Madhya Pradesh", "latitude": 22.7196, "longitude": 75.8577, "population": 1964000},
    {"city_name": "Jabalpur", "state_name": "Madhya Pradesh", "latitude": 23.1815, "longitude": 79.9864, "population": 1055000},
    {"city_name": "Gwalior", "state_name": "Madhya Pradesh", "latitude": 26.2183, "longitude": 78.1828, "population": 1069300},
    {"city_name": "Ujjain", "state_name": "Madhya Pradesh", "latitude": 23.1793, "longitude": 75.7684, "population": 515200},
    # Kerala
    {"city_name": "Kochi", "state_name": "Kerala", "latitude": 9.9312, "longitude": 76.2673, "population": 602000},
    {"city_name": "Thiruvananthapuram", "state_name": "Kerala", "latitude": 8.5241, "longitude": 76.9366, "population": 744900},
    {"city_name": "Kozhikode", "state_name": "Kerala", "latitude": 11.2588, "longitude": 75.7804, "population": 431500},
    {"city_name": "Thrissur", "state_name": "Kerala", "latitude": 10.5276, "longitude": 76.2144, "population": 315600},
    {"city_name": "Kollam", "state_name": "Kerala", "latitude": 8.8813, "longitude": 76.5847, "population": 349000},
    # Bihar
    {"city_name": "Patna", "state_name": "Bihar", "latitude": 25.6093, "longitude": 85.1376, "population": 1684200},
    {"city_name": "Gaya", "state_name": "Bihar", "latitude": 24.7955, "longitude": 84.9999, "population": 470900},
    {"city_name": "Muzaffarpur", "state_name": "Bihar", "latitude": 26.1220, "longitude": 85.3910, "population": 354000},
    {"city_name": "Bhagalpur", "state_name": "Bihar", "latitude": 25.2437, "longitude": 86.9719, "population": 350100},
    # Punjab
    {"city_name": "Ludhiana", "state_name": "Punjab", "latitude": 30.9000, "longitude": 75.8573, "population": 1419000},
    {"city_name": "Amritsar", "state_name": "Punjab", "latitude": 31.6340, "longitude": 74.8723, "population": 1132400},
    {"city_name": "Jalandhar", "state_name": "Punjab", "latitude": 31.3260, "longitude": 75.5762, "population": 862900},
    # Haryana
    {"city_name": "Faridabad", "state_name": "Haryana", "latitude": 28.4089, "longitude": 77.3178, "population": 1404650},
    {"city_name": "Gurugram", "state_name": "Haryana", "latitude": 28.4595, "longitude": 77.0266, "population": 876900},
    {"city_name": "Panipat", "state_name": "Haryana", "latitude": 29.3909, "longitude": 76.9635, "population": 442300},
    # Assam
    {"city_name": "Guwahati", "state_name": "Assam", "latitude": 26.1445, "longitude": 91.7362, "population": 957400},
    {"city_name": "Silchar", "state_name": "Assam", "latitude": 24.8333, "longitude": 92.7789, "population": 172900},
    # Odisha
    {"city_name": "Bhubaneswar", "state_name": "Odisha", "latitude": 20.2961, "longitude": 85.8245, "population": 837700},
    {"city_name": "Cuttack", "state_name": "Odisha", "latitude": 20.4625, "longitude": 85.8830, "population": 606000},
    {"city_name": "Rourkela", "state_name": "Odisha", "latitude": 22.2604, "longitude": 84.8536, "population": 273700},
    # Chhattisgarh
    {"city_name": "Raipur", "state_name": "Chhattisgarh", "latitude": 21.2514, "longitude": 81.6296, "population": 1013000},
    {"city_name": "Bhilai", "state_name": "Chhattisgarh", "latitude": 21.2167, "longitude": 81.4333, "population": 625700},
    # Jharkhand
    {"city_name": "Ranchi", "state_name": "Jharkhand", "latitude": 23.3441, "longitude": 85.3096, "population": 1073400},
    {"city_name": "Jamshedpur", "state_name": "Jharkhand", "latitude": 22.8015, "longitude": 86.2029, "population": 631400},
    # Uttarakhand
    {"city_name": "Dehradun", "state_name": "Uttarakhand", "latitude": 30.3165, "longitude": 78.0322, "population": 578400},
    {"city_name": "Haridwar", "state_name": "Uttarakhand", "latitude": 29.9457, "longitude": 78.1642, "population": 228800},
    # Himachal Pradesh
    {"city_name": "Shimla", "state_name": "Himachal Pradesh", "latitude": 31.1048, "longitude": 77.1734, "population": 169600},
    {"city_name": "Dharamshala", "state_name": "Himachal Pradesh", "latitude": 32.2190, "longitude": 76.3234, "population": 53500},
    # Jammu & Kashmir
    {"city_name": "Srinagar", "state_name": "Jammu & Kashmir", "latitude": 34.0837, "longitude": 74.7973, "population": 1180600},
    {"city_name": "Jammu", "state_name": "Jammu & Kashmir", "latitude": 32.7266, "longitude": 74.8570, "population": 502100},
    # Chandigarh
    {"city_name": "Chandigarh", "state_name": "Chandigarh", "latitude": 30.7333, "longitude": 76.7794, "population": 961800},
    # Goa
    {"city_name": "Panaji", "state_name": "Goa", "latitude": 15.4909, "longitude": 73.8278, "population": 114600},
    {"city_name": "Margao", "state_name": "Goa", "latitude": 15.2993, "longitude": 74.0563, "population": 87000},
    # Meghalaya
    {"city_name": "Shillong", "state_name": "Meghalaya", "latitude": 25.5788, "longitude": 91.8933, "population": 143300},
    # Tripura
    {"city_name": "Agartala", "state_name": "Tripura", "latitude": 23.8315, "longitude": 91.2868, "population": 400000},
    # Manipur
    {"city_name": "Imphal", "state_name": "Manipur", "latitude": 24.8170, "longitude": 93.9368, "population": 268200},
    # Andhra Pradesh
    {"city_name": "Visakhapatnam", "state_name": "Andhra Pradesh", "latitude": 17.6868, "longitude": 83.2185, "population": 2036000},
    {"city_name": "Vijayawada", "state_name": "Andhra Pradesh", "latitude": 16.5062, "longitude": 80.6480, "population": 1034000},
    {"city_name": "Guntur", "state_name": "Andhra Pradesh", "latitude": 16.3067, "longitude": 80.4365, "population": 647500},
    {"city_name": "Tirupati", "state_name": "Andhra Pradesh", "latitude": 13.6288, "longitude": 79.4192, "population": 374300},
    # Sikkim
    {"city_name": "Gangtok", "state_name": "Sikkim", "latitude": 27.3389, "longitude": 88.6065, "population": 100700},
    # Nagaland
    {"city_name": "Kohima", "state_name": "Nagaland", "latitude": 25.6751, "longitude": 94.1086, "population": 99000},
]


def generate_city_master(output_dir: str = DATA_DIR) -> str:
    """Generate city_master.csv with 100+ Indian cities."""
    random.seed(42)

    rows = []
    for i, city in enumerate(EXTENDED_CITIES):
        pop = city["population"]
        if pop > 5000000:
            pop_cat = "Metro"
            traffic = "Very High"
        elif pop > 1000000:
            pop_cat = "Large"
            traffic = "High"
        elif pop > 300000:
            pop_cat = "Medium"
            traffic = "Medium"
        else:
            pop_cat = "Small"
            traffic = "Low"

        rows.append({
            "city_id": f"CITY{str(i+1).zfill(3)}",
            "city_name": city["city_name"],
            "state_name": city["state_name"],
            "latitude": city["latitude"],
            "longitude": city["longitude"],
            "population": pop,
            "population_category": pop_cat,
            "traffic_density_level": traffic,
        })

    df = pd.DataFrame(rows)
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, "city_master.csv")
    df.to_csv(path, index=False)
    logger.info("Generated %s with %d cities", path, len(df))
    return path


def generate_raw_violations(
    output_dir: str = DATA_DIR,
    num_records: int = 12000,
) -> str:
    """Generate raw_traffic_violations.csv with realistic violation records."""
    random.seed(42)
    np.random.seed(42)

    violation_types = ["Overspeeding", "Signal Jumping", "No Helmet", "Wrong Side Driving",
                       "Drunk Driving", "No Seatbelt", "Triple Riding", "Using Mobile",
                       "Document Expired", "Illegal Parking"]
    violation_weights = [0.22, 0.16, 0.15, 0.10, 0.08, 0.07, 0.06, 0.06, 0.05, 0.05]

    vehicle_types = ["Bike", "Car", "Truck", "Auto", "Bus", "SUV"]
    vehicle_weights = [0.38, 0.28, 0.11, 0.09, 0.07, 0.07]

    vehicle_brands = {
        "Bike": ["Honda", "Hero", "Bajaj", "Royal Enfield", "TVS", "KTM"],
        "Car": ["Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra"],
        "Truck": ["Tata", "Ashok Leyland", "BharatBenz", "Eicher", "Mahindra"],
        "Auto": ["Bajaj", "Piaggio", "TVS"],
        "Bus": ["Tata", "Ashok Leyland", "Eicher"],
        "SUV": ["Mahindra", "Tata", "Hyundai", "Toyota", "Honda"],
    }

    road_types = ["Highway", "Arterial", "Intersection", "Residential", "Market", "Rural"]
    severities = ["Low", "Medium", "High", "Critical"]
    severity_weights = [0.25, 0.40, 0.25, 0.10]

    license_types = ["LMV", "MCWG", "HMV", "LMV-NT", "MCWOG", "No License"]
    fuel_types = ["Petrol", "Diesel", "EV", "CNG"]
    genders = ["Male", "Female"]

    fine_map = {
        "Overspeeding": (1000, 2000), "Signal Jumping": (500, 1000),
        "No Helmet": (200, 1000), "Wrong Side Driving": (300, 1000),
        "Drunk Driving": (2000, 5000), "No Seatbelt": (200, 1000),
        "Triple Riding": (200, 1000), "Using Mobile": (500, 2000),
        "Document Expired": (200, 500), "Illegal Parking": (100, 500),
    }

    speed_map = {
        "Highway": (50, 110), "Arterial": (20, 60), "Intersection": (5, 35),
        "Residential": (15, 45), "Market": (5, 25), "Rural": (30, 80),
    }

    # City-area mapping for realistic locations
    city_areas = {}
    for city_data in CITY_DATA:
        city_name = city_data["name"]
        city_areas[city_name] = []
        if city_name in CITY_AREAS:
            for area in CITY_AREAS[city_name]:
                city_areas[city_name].append({
                    "area": area.get("area", city_name),
                    "lat": area["lat"],
                    "lon": area["lon"],
                    "road_type": area.get("roadType", random.choice(road_types)),
                })

    cities = list(city_areas.keys())

    # Date range: 2024-01-01 to 2025-12-31
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2025, 12, 31)
    date_range_days = (end_date - start_date).days

    records = []
    for i in range(num_records):
        city_name = random.choice(cities)
        areas = city_areas.get(city_name, [])
        if areas:
            loc = random.choice(areas)
        else:
            loc = {"area": city_name, "lat": 20.0, "lon": 78.0, "road_type": random.choice(road_types)}

        violation_type = random.choices(violation_types, weights=violation_weights, k=1)[0]
        vehicle_type = random.choices(vehicle_types, weights=vehicle_weights, k=1)[0]
        severity = random.choices(severities, weights=severity_weights, k=1)[0]
        road_type = loc["road_type"]

        driver_age = random.randint(18, 70)
        if driver_age <= 25:
            age_group = "18-25"
        elif driver_age <= 35:
            age_group = "26-35"
        elif driver_age <= 50:
            age_group = "36-50"
        else:
            age_group = "51+"

        violation_date = start_date + timedelta(
            days=random.randint(0, date_range_days),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
        )

        hour = violation_date.hour
        if 6 <= hour < 12:
            time_period = "Morning"
        elif 12 <= hour < 17:
            time_period = "Afternoon"
        elif 17 <= hour < 21:
            time_period = "Evening"
        else:
            time_period = "Night"

        day_name = violation_date.strftime("%A")
        is_weekend = day_name in ("Saturday", "Sunday")

        fine_low, fine_high = fine_map.get(violation_type, (200, 1000))
        fine_amount = round(random.uniform(fine_low, fine_high), 2)

        speed_low, speed_high = speed_map.get(road_type, (20, 60))
        avg_speed = round(random.uniform(speed_low, speed_high), 1)

        accident = random.random() < 0.05
        prev_violations = random.choices([0, 1, 2, 3, 4, 5, 6, 7, 8], weights=[0.45, 0.20, 0.12, 0.08, 0.06, 0.04, 0.02, 0.02, 0.01], k=1)[0]

        if prev_violations == 0:
            offender_type = "First-time"
        elif prev_violations <= 3:
            offender_type = "Repeat"
        else:
            offender_type = "Habitual"

        brand = random.choice(vehicle_brands.get(vehicle_type, ["Unknown"]))
        vehicle_age = random.randint(0, 15)
        license_type = random.choice(license_types)
        fuel = random.choice(fuel_types)
        gender = random.choices(genders, weights=[0.82, 0.18], k=1)[0]

        records.append({
            "violation_id": f"V{str(i+1).zfill(6)}",
            "violation_type": violation_type,
            "fine_amount": fine_amount,
            "severity": severity,
            "accident_involved": accident,
            "average_speed": avg_speed,
            "violation_date": violation_date.strftime("%Y-%m-%d"),
            "violation_time": violation_date.strftime("%H:%M:%S"),
            "hour": hour,
            "day_name": day_name,
            "month": violation_date.month,
            "year": violation_date.year,
            "time_period": time_period,
            "is_weekend": is_weekend,
            "driver_id": f"D{random.randint(1, 5000):05d}",
            "driver_age": driver_age,
            "age_group": age_group,
            "driver_gender": gender,
            "license_type": license_type,
            "previous_violations": prev_violations,
            "offender_type": offender_type,
            "vehicle_id": f"VH{random.randint(1, 8000):05d}",
            "vehicle_type": vehicle_type,
            "vehicle_brand": brand,
            "vehicle_age": vehicle_age,
            "fuel_type": fuel,
            "city_name": city_name,
            "state_name": next((c["state"] for c in CITY_DATA if c["name"] == city_name), "India"),
            "area_name": loc["area"],
            "road_type": road_type,
            "latitude": loc["lat"] + random.uniform(-0.01, 0.01),
            "longitude": loc["lon"] + random.uniform(-0.01, 0.01),
            "risk_zone": severity if severity in ("High", "Critical") else random.choice(["Low", "Medium", "High"]),
        })

    df = pd.DataFrame(records)
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, "raw_traffic_violations.csv")
    df.to_csv(path, index=False)
    logger.info("Generated %s with %d records", path, len(df))
    return path


def generate_all(output_dir: str = DATA_DIR):
    """Generate both city_master.csv and raw_traffic_violations.csv."""
    city_path = generate_city_master(output_dir)
    violations_path = generate_raw_violations(output_dir)
    return city_path, violations_path


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    generate_all()
    print("Dataset generation complete!")

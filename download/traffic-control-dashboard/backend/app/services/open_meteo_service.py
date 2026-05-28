"""
Open-Meteo Weather Service
Async function to call the Open-Meteo API for current weather data.
"""

import os
import logging
from typing import Optional

import httpx
from dotenv import load_dotenv

from app.schemas import WeatherResponse

load_dotenv()

logger = logging.getLogger(__name__)

OPEN_METEO_URL = os.getenv("OPEN_METEO_URL", "https://api.open-meteo.com/v1/forecast")

# WMO weather code → human-readable condition
WMO_CODES = {
    0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing Rime Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    66: "Freezing Rain", 67: "Heavy Freezing Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers",
    85: "Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm + Hail", 99: "Thunderstorm + Heavy Hail",
}


async def get_current_weather(lat: float, lon: float) -> WeatherResponse:
    """
    Fetch current weather from Open-Meteo for given coordinates.
    Returns a WeatherResponse with temperature, humidity, condition, wind speed, visibility.
    Falls back to default values if the API is unavailable.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current", {})
        temp = current.get("temperature_2m", 28.0)
        humidity = current.get("relative_humidity_2m", 55.0)
        wmo_code = current.get("weather_code", 0)
        wind = current.get("wind_speed_10m", 12.0)

        condition = WMO_CODES.get(wmo_code, "Clear")

        # Map to simplified conditions used by the dashboard
        simplified = _simplify_condition(condition)

        return WeatherResponse(
            temperature=round(float(temp), 1),
            humidity=round(float(humidity), 1),
            condition=simplified,
            windSpeed=round(float(wind), 1),
            visibility=10.0,  # Open-Meteo doesn't provide visibility in free tier
        )

    except httpx.HTTPStatusError as exc:
        logger.warning("Open-Meteo HTTP error: %s", exc)
    except httpx.RequestError as exc:
        logger.warning("Open-Meteo request error: %s", exc)
    except Exception as exc:
        logger.warning("Open-Meteo unexpected error: %s", exc)

    return WeatherResponse(
        temperature=28.0, humidity=55.0,
        condition="Clear", windSpeed=12.0, visibility=10.0,
    )


def _simplify_condition(condition: str) -> str:
    """Map detailed conditions to dashboard's simplified set."""
    c = condition.lower()
    if any(w in c for w in ("clear", "mainly clear")):
        return "Clear"
    if any(w in c for w in ("cloud", "overcast")):
        return "Cloudy"
    if any(w in c for w in ("rain", "drizzle", "shower")):
        return "Rainy"
    if any(w in c for w in ("fog", "rime")):
        return "Foggy"
    if any(w in c for w in ("snow", "grain")):
        return "Snowy"
    if "thunder" in c:
        return "Thunderstorm"
    if "humid" in c:
        return "Humid"
    if "hazy" in c:
        return "Hazy"
    return "Clear"

"""
TTL cache implementation using cachetools.
Provides per-endpoint caching with configurable TTLs.
"""

from cachetools import TTLCache
import threading

# ── Cache instances ──
# Dashboard KPIs – 30 seconds
dashboard_cache = TTLCache(maxsize=64, ttl=30)

# City search – 5 minutes
city_search_cache = TTLCache(maxsize=256, ttl=300)

# Weather data – 10 minutes
weather_cache = TTLCache(maxsize=128, ttl=600)

# Map data – 1 minute
map_cache = TTLCache(maxsize=64, ttl=60)

# Violation analysis – 2 minutes
analysis_cache = TTLCache(maxsize=32, ttl=120)

# ML results – 5 minutes
ml_cache = TTLCache(maxsize=16, ttl=300)

# Events – 10 seconds
events_cache = TTLCache(maxsize=32, ttl=10)

# Thread-safe lock for write operations
_lock = threading.Lock()


def cache_get(cache: TTLCache, key: str):
    """Thread-safe cache read."""
    try:
        return cache.get(key)
    except Exception:
        return None


def cache_set(cache: TTLCache, key: str, value):
    """Thread-safe cache write."""
    try:
        with _lock:
            cache[key] = value
    except Exception:
        pass


def clear_all_caches():
    """Clear every cache."""
    for c in (dashboard_cache, city_search_cache, weather_cache,
              map_cache, analysis_cache, ml_cache, events_cache):
        with _lock:
            c.clear()


def clear_dashboard_cache():
    with _lock:
        dashboard_cache.clear()


def clear_map_cache():
    with _lock:
        map_cache.clear()


def clear_weather_cache():
    with _lock:
        weather_cache.clear()


def clear_city_search_cache():
    with _lock:
        city_search_cache.clear()

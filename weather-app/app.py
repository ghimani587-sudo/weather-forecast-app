"""
Weather Forecast App — Flask Backend
======================================
Production-ready weather app with full forecast data.
Integrated with Open-Meteo API for current and forecast weather.

Setup:
    pip install -r requirements.txt
    python app.py
"""

import os
import logging
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests

# ── App Setup ──────────────────────────────────────────────────────────────────

app = Flask(__name__)

# Enable CORS for all routes (needed for frontend integration)
CORS(app)

# Configure simple logging for debugging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Config ─────────────────────────────────────────────────────────────────────

# Using Open-Meteo API (free, no API key required)
GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"


# ── Helper ─────────────────────────────────────────────────────────────────────
def get_weather_description(code):
    weather_codes = {
        0: "Clear Sky ☀️",
        1: "Mainly Clear 🌤️",
        2: "Partly Cloudy ⛅",
        3: "Overcast ☁️",
        45: "Fog 🌫️",
        48: "Dense Fog 🌫️",
        51: "Light Drizzle 🌦️",
        53: "Moderate Drizzle 🌦️",
        55: "Dense Drizzle 🌧️",
        61: "Light Rain 🌧️",
        63: "Moderate Rain 🌧️",
        65: "Heavy Rain ⛈️",
        71: "Light Snow 🌨️",
        73: "Moderate Snow ❄️",
        75: "Heavy Snow ❄️",
        80: "Rain Showers 🌦️",
        81: "Moderate Showers 🌦️",
        82: "Heavy Showers ⛈️",
        95: "Thunderstorm ⚡"
    }
    return weather_codes.get(code, "Unknown Weather")
def fetch_weather_forecast(city: str) -> dict:
    """
    Fetch complete weather data (current + forecast) for *city*.
    Uses Open-Meteo API which provides hourly and daily forecasts with WMO codes.

    Returns a normalised dict on success, or raises a descriptive
    ValueError / RuntimeError that callers can surface to the user.
    """
    
    # Step 1: Geocode city name to coordinates
    try:
        geo_resp = requests.get(
            GEO_API_URL,
            params={
                "name": city,
                "count": 1,
                "language": "en",
                "format": "json"
            },
            timeout=8
        )
        geo_resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Could not reach the geocoding service: {str(e)}")

    geo_data = geo_resp.json()
    if not geo_data.get("results") or len(geo_data["results"]) == 0:
        raise ValueError(f"City \"{city}\" not found. Please check the spelling and try again.")

    result = geo_data["results"][0]
    latitude = result["latitude"]
    longitude = result["longitude"]
    name = result.get("name", city)
    country = result.get("country", "")

    # Step 2: Fetch weather forecast
    try:
        weather_resp = requests.get(
            WEATHER_API_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current_weather": "true",
                "hourly": "temperature_2m,relativehumidity_2m,apparent_temperature,is_day,weathercode,wind_speed_10m,visibility",
                "daily": "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
                "timezone": "auto",
                "forecast_days": 5
            },
            timeout=8
        )
        weather_resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Could not reach the weather service: {str(e)}")

    weather_data = weather_resp.json()
    current_weather = weather_data.get("current_weather", {})
    hourly = weather_data.get("hourly", {})
    daily = weather_data.get("daily", {})

    # Step 3: Process hourly data
    hourly_times = hourly.get("time", [])
    hourly_temps = hourly.get("temperature_2m", [])
    hourly_humidity = hourly.get("relativehumidity_2m", [])
    hourly_apparent = hourly.get("apparent_temperature", [])
    hourly_day = hourly.get("is_day", [])
    hourly_codes = hourly.get("weathercode", [])
    hourly_wind = hourly.get("wind_speed_10m", [])
    hourly_visibility = hourly.get("visibility", [])

    current_time = current_weather.get("time", "")
    current_time_idx = hourly_times.index(current_time) if current_time in hourly_times else 0

    hourly_forecast = []
    for i in range(12):
        idx = current_time_idx + i
        if idx < len(hourly_times):
            hourly_forecast.append({
                "time": hourly_times[idx],
                "temp": round(hourly_temps[idx]) if idx < len(hourly_temps) else 0,
                "code": hourly_codes[idx] if idx < len(hourly_codes) else 0,
            })

    current_temp = hourly_temps[current_time_idx] if current_time_idx < len(hourly_temps) else 0
    current_code = hourly_codes[current_time_idx] if current_time_idx < len(hourly_codes) else 0
    current_humidity = hourly_humidity[current_time_idx] if current_time_idx < len(hourly_humidity) else 0
    current_apparent = hourly_apparent[current_time_idx] if current_time_idx < len(hourly_apparent) else 0
    current_wind = hourly_wind[current_time_idx] if current_time_idx < len(hourly_wind) else 0
    current_visibility = hourly_visibility[current_time_idx] if current_time_idx < len(hourly_visibility) else None
    current_is_day = hourly_day[current_time_idx] if current_time_idx < len(hourly_day) else True

    # Step 4: Process daily data
    daily_times = daily.get("time", [])
    daily_max = daily.get("temperature_2m_max", [])
    daily_min = daily.get("temperature_2m_min", [])
    daily_codes = daily.get("weathercode", [])
    daily_precip = daily.get("precipitation_probability_max", [])
    daily_sunrise = daily.get("sunrise", [])
    daily_sunset = daily.get("sunset", [])

    daily_forecast = []
    for i in range(len(daily_times)):
        daily_forecast.append({
            "date": daily_times[i],
            "max": round(daily_max[i]) if i < len(daily_max) else 0,
            "min": round(daily_min[i]) if i < len(daily_min) else 0,
            "code": daily_codes[i] if i < len(daily_codes) else 0,
            "precipitation": daily_precip[i] if i < len(daily_precip) else 0,
        })

    return {
        "city": name,
        "country": country,
        "temperature": round(current_temp),
        "feelsLike": round(current_apparent),
        "condition": get_weather_description(current_code),
        "code": current_code,
        "humidity": round(current_humidity),
        "windSpeed": round(current_wind),
        "visibility": round(current_visibility / 1000) if current_visibility else 10,
        "isDay": bool(current_is_day),
        "sunrise": daily_sunrise[0] if daily_sunrise else "",
        "sunset": daily_sunset[0] if daily_sunset else "",
        "hourly": hourly_forecast,
        "daily": daily_forecast,
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET", "POST"])
def index():
    """
    GET  → render the search page (empty state).
    POST → fetch weather for submitted city and re-render with results.
    """
    weather = None
    error   = None

    if request.method == "POST":
        city = request.form.get("city", "").strip()

        if not city:
            error = "Please enter a city name."
        else:
            logger.info("Weather request for city: %s", city)
            try:
                weather = fetch_weather_forecast(city)
                logger.info("Weather fetched: %s → %.1f°C", weather["city"], weather["temperature"])
            except ValueError as exc:
                error = str(exc)
                logger.warning("City not found: %s", city)
            except RuntimeError as exc:
                error = str(exc)
                logger.error("API error for city %s: %s", city, exc)

    return render_template("index.html", weather=weather, error=error)


@app.route("/api/weather", methods=["GET"])
def api_weather():
    """
    JSON API endpoint for frontend integration.
    Usage: GET /api/weather?city=London

    Returns complete weather data with current conditions, hourly and daily forecast.
    """
    city = request.args.get("city", "").strip()

    if not city:
        return jsonify({"success": False, "error": "Query parameter 'city' is required."}), 400

    logger.info("API weather request for city: %s", city)

    try:
        weather = fetch_weather_forecast(city)
        return jsonify({"success": True, "data": weather}), 200
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 404
    except RuntimeError as exc:
        logger.error("API route error: %s", exc)
        return jsonify({"success": False, "error": str(exc)}), 503


# ── Entry Point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    logger.info("Starting Weather App on port %d (debug=%s)", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug)

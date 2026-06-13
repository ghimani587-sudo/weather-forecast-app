# Skies — Weather Forecast App

A production-ready Flask weather app powered by OpenWeatherMap.

## Quick Start (Local)

```bash
# 1. Clone / navigate to project folder
cd weather-app

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your OpenWeatherMap API key
#    Get a free key at: https://openweathermap.org/api
export API_KEY="ad8a16fbb27c9f704ac87662ce65ce7b"   # Windows: set API_KEY=your_api_key_here

# 5. Run the app
python app.py
# → Open http://localhost:10000
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/`   | Weather search UI |
| POST   | `/`   | Submit city name, get weather page |
| GET    | `/api/weather?city=London` | JSON API response |

### JSON API Example
```
GET /api/weather?city=Tokyo

{
  "success": true,
  "data": {
    "city": "Tokyo",
    "country": "JP",
    "temperature": 22.4,
    "feels_like": 21.8,
    "condition": "Clear Sky",
    "condition_main": "Clear",
    "icon": "☀️",
    "humidity": 58,
    "wind_speed": 12.6,
    "visibility": 10.0
  }
}
```

---

## Deploy to Render (Free)

1. Push this project to a GitHub repo.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your GitHub repo.
4. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:10000`
5. Add environment variable: `API_KEY = your_openweathermap_key`
6. Deploy ✓

## Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. `railway login && railway init`
3. `railway variables set API_KEY=your_key`
4. `railway up`

## Deploy to PythonAnywhere

1. Upload files via the PythonAnywhere dashboard.
2. Create a new Web App → Manual configuration → Python 3.
3. Set the WSGI file to point to `app:app`.
4. Add `API_KEY` in the environment variables panel.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | ✅ Yes | OpenWeatherMap API key |
| `PORT` | No (default: 10000) | Port to listen on |
| `FLASK_DEBUG` | No (default: false) | Enable debug mode |

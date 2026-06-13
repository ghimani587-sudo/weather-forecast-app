# Backend and Frontend Integration Setup

## Overview
The weather app is now connected! The frontend (React) communicates with the backend (Flask) via the `/api/weather` endpoint.

## Backend (weather-app)

### Installation
```bash
cd weather-app
pip install -r requirements.txt
```

### Running the Backend
```bash
# Development mode (with hot reload and debug logging)
FLASK_DEBUG=true python app.py

# Production mode (default)
python app.py
```

The backend runs on **http://localhost:10000** by default.

**Environment Variables:**
- `PORT` - Server port (default: 10000)
- `FLASK_DEBUG` - Enable debug mode (default: false)

## Frontend (auroracast-ui-main)

### Installation
```bash
cd auroracast-ui-main
npm install
```

### Running the Frontend
```bash
# Development mode
npm run dev
```

The frontend runs on **http://localhost:5173** by default.

### Configuration
The frontend automatically connects to the backend via the `VITE_API_URL` environment variable:

- **Development**: `http://localhost:10000` (default)
- **Production**: Update `VITE_API_URL` in your build/deployment config

To override the backend URL during development:
```bash
VITE_API_URL=https://your-api-domain.com npm run dev
```

## Running Both Together (Development)

### Option 1: Two Terminal Windows (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd weather-app
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Start Frontend:**
```bash
cd auroracast-ui-main
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Option 2: Using npm scripts (Windows)

Create a batch file `run-dev.bat` in the Weather-app folder:
```batch
@echo off
cd weather-app
start "Backend" python app.py

cd ../auroracast-ui-main
start "Frontend" npm run dev
```

Then run: `run-dev.bat`

## API Endpoints

### GET /api/weather
Fetch weather data for a city.

**Parameters:**
- `city` (required) - City name

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "country": "United Kingdom",
    "temperature": 15,
    "feelsLike": 14,
    "condition": "Partly cloudy",
    "code": 1,
    "humidity": 65,
    "windSpeed": 12,
    "visibility": 10,
    "isDay": true,
    "sunrise": "2024-06-09T05:30:00",
    "sunset": "2024-06-09T21:15:00",
    "hourly": [...],
    "daily": [...]
  }
}
```

## Troubleshooting

### Frontend can't reach backend
- Ensure backend is running on `http://localhost:10000`
- Check that CORS is enabled (it should be by default)
- Try setting `VITE_API_URL=http://localhost:10000` explicitly

### "City not found" error
- Backend validates city names via Open-Meteo geocoding API
- Ensure you have internet connection
- Try a different city name spelling

### Backend won't start
- Check port 10000 is available: `netstat -ano | find ":10000"`
- Try a different port: `PORT=5000 python app.py`

### Module not found errors
- Reinstall dependencies:
  - Backend: `pip install -r requirements.txt --force-reinstall`
  - Frontend: `npm install` (or `npm ci` for exact versions)

## Build for Production

### Backend
```bash
cd weather-app
gunicorn app:app
```

### Frontend
```bash
cd auroracast-ui-main
npm run build
```

### Deployment
Set `VITE_API_URL` to your production backend URL during build:
```bash
VITE_API_URL=https://api.myapp.com npm run build
```

## File Changes Made

- **Backend** (`weather-app/app.py`):
  - Added CORS support
  - Updated to use Open-Meteo API (free, no key required)
  - Enhanced `/api/weather` endpoint with full forecast data

- **Backend** (`weather-app/requirements.txt`):
  - Added `flask-cors` dependency

- **Frontend** (`auroracast-ui-main/src/lib/api/weather.ts`):
  - New API client for backend integration
  - Automatically uses `VITE_API_URL` environment variable

- **Frontend** (`auroracast-ui-main/src/routes/index.tsx`):
  - Updated to use backend API instead of open-meteo directly
  - No UI changes — same user experience

## No UI Changes
✅ All visual components remain unchanged
✅ Same user experience as before
✅ Only the data source changed (from open-meteo → backend → open-meteo)

---

**Ready to use!** Start both servers and enjoy your weather app.

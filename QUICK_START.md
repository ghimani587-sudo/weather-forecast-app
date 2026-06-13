# Quick Start Guide — Weather App (Connected)

## Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

## Start Backend (Port 10000)

```bash
cd weather-app
pip install -r requirements.txt
python app.py
```

✅ Backend ready at: **http://localhost:10000**

## Start Frontend (Port 5173)

```bash
cd auroracast-ui-main
npm install
npm run dev
```

✅ Frontend ready at: **http://localhost:5173**

## Open in Browser
Visit **http://localhost:5173** and start searching for cities!

---

## What Changed?

### Backend (weather-app)
- ✅ Switched from OpenWeatherMap to Open-Meteo API (free, no key needed)
- ✅ Added CORS support for frontend requests
- ✅ Enhanced `/api/weather` endpoint with complete forecast data (hourly + daily)

### Frontend (auroracast-ui-main)
- ✅ Created new API client: `src/lib/api/weather.ts`
- ✅ Updated `src/routes/index.tsx` to use backend API
- ✅ **No UI changes** — everything looks the same!

### New Files
- `.env.local` — Backend URL configuration (auto-detected as localhost:10000)
- `.env.example` — Template for environment variables

---

## API Flow

```
Frontend (React)
    ↓ (search city)
    ↓
Backend (Flask) /api/weather?city=London
    ↓ (geocoding)
    ↓
Open-Meteo Geocoding API
    ↓ (get coordinates)
    ↓ (fetch forecast)
    ↓
Open-Meteo Weather API
    ↓ (process data)
    ↓
Frontend (React)
    ↓ (display results)
    ↓
Browser
```

---

## Troubleshooting

**Port already in use?**
```bash
# Backend on different port
PORT=5000 python app.py

# Frontend on different port (update .env.local if needed)
npm run dev -- --port 5174
```

**CORS errors?**
- Backend has CORS enabled, but verify:
  - Backend is running on `http://localhost:10000`
  - Frontend can reach it (check network tab in DevTools)

**"City not found" error?**
- Verify internet connection (backend needs to reach Open-Meteo)
- Try different city spelling

---

## Next Steps

1. ✅ Both servers running → Works!
2. To build for production → See `INTEGRATION_SETUP.md`
3. To deploy → Configure `VITE_API_URL` to your production backend URL

---

**Enjoy your connected weather app!** 🌤️

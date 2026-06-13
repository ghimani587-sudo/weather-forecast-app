import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Search,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  Loader2,
  Sunrise,
  Sunset,
  Eye,
  Umbrella,
  ArrowLeft,
} from "lucide-react";
import { fetchWeatherData, type WeatherData } from "../lib/api/weather";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Weather Forecast — Beautiful, modern weather at a glance" },
      {
        name: "description",
        content:
          "A premium, glassmorphic weather forecast experience. Search any city to see real-time conditions, humidity, wind and more.",
      },
      { property: "og:title", content: "Weather Forecast" },
      {
        property: "og:description",
        content: "Premium weather forecast UI with real-time conditions for any city.",
      },
    ],
  }),
  component: WeatherPage,
});


type Weather = WeatherData;


const codeToCondition = (code: number): { label: string; gradient: string; bg: string } => {
  if (code === 0)
    return {
      label: "Clear sky",
      gradient: "var(--gradient-sun)",
      bg: "linear-gradient(135deg, #fde68a 0%, #fbcfe8 50%, #93c5fd 100%)",
    };
  if ([1, 2].includes(code))
    return {
      label: "Partly cloudy",
      gradient: "var(--gradient-cloud)",
      bg: "linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fce7f3 100%)",
    };
  if (code === 3)
    return {
      label: "Overcast",
      gradient: "var(--gradient-cloud)",
      bg: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #ddd6fe 100%)",
    };
  if ([45, 48].includes(code))
    return {
      label: "Foggy",
      gradient: "var(--gradient-cloud)",
      bg: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #cbd5e1 100%)",
    };
  if ([51, 53, 55, 56, 57].includes(code))
    return {
      label: "Drizzle",
      gradient: "var(--gradient-rain)",
      bg: "linear-gradient(135deg, #bfdbfe 0%, #a5b4fc 50%, #818cf8 100%)",
    };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return {
      label: "Rainy",
      gradient: "var(--gradient-rain)",
      bg: "linear-gradient(135deg, #93c5fd 0%, #6366f1 50%, #4338ca 100%)",
    };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return {
      label: "Snowy",
      gradient: "var(--gradient-cloud)",
      bg: "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #ddd6fe 100%)",
    };
  if ([95, 96, 99].includes(code))
    return {
      label: "Thunderstorm",
      gradient: "var(--gradient-night)",
      bg: "linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #1e1b4b 100%)",
    };
  return {
    label: "Clear",
    gradient: "var(--gradient-sun)",
    bg: "linear-gradient(135deg, #fde68a 0%, #fbcfe8 50%, #93c5fd 100%)",
  };
};

const WeatherIcon = ({ code, className = "" }: { code: number; className?: string }) => {
  if (code === 0) return <Sun className={className} />;
  if ([1, 2, 3].includes(code)) return <Cloud className={className} />;
  if ([45, 48].includes(code)) return <CloudFog className={className} />;
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className={className} />;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className={className} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={className} />;
  if ([95, 96, 99].includes(code)) return <CloudLightning className={className} />;
  return <Sun className={className} />;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday ? "Today" : d.toLocaleDateString([], { weekday: "short" });
}

type View = "landing" | "loading" | "dashboard";

function WeatherPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("landing");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Weather | null>(null);

  async function fetchWeather(city: string) {
    setView("loading");
    setError(null);
    try {
      const weatherData = await fetchWeatherData(city);
      setData(weatherData);
      // Small delay so the loader animation feels intentional
      await new Promise((r) => setTimeout(r, 600));
      setView("dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setView("landing");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    fetchWeather(query.trim());
  }

  const bg = data ? codeToCondition(data.code).bg : "var(--gradient-bg)";
  const isDark = data && [95, 96, 99].includes(data.code);

  return (
    <div
      className="relative min-h-screen overflow-hidden transition-[background] duration-1000"
      style={{ background: view === "dashboard" ? bg : undefined }}
    >
      {/* Ambient blobs */}
      <div
        className="blob"
        style={{ width: 480, height: 480, top: -120, left: -120, background: "#a5b4fc" }}
      />
      <div
        className="blob"
        style={{
          width: 520,
          height: 520,
          bottom: -160,
          right: -140,
          background: "#f0abfc",
          animationDelay: "4s",
        }}
      />
      <div
        className="blob"
        style={{
          width: 360,
          height: 360,
          top: "40%",
          left: "55%",
          background: "#bae6fd",
          animationDelay: "8s",
        }}
      />

      {/* Floating background weather icons (landing) */}
      {view === "landing" && (
        <>
          <Sun className="pointer-events-none absolute left-[8%] top-[18%] h-14 w-14 text-amber-300/60 animate-float-y" />
          <Cloud
            className="pointer-events-none absolute right-[10%] top-[22%] h-16 w-16 text-white/70 animate-float-y"
            style={{ animationDelay: "1.5s" }}
          />
          <CloudRain
            className="pointer-events-none absolute left-[14%] bottom-[18%] h-12 w-12 text-indigo-300/60 animate-float-y"
            style={{ animationDelay: "2.5s" }}
          />
          <CloudSnow
            className="pointer-events-none absolute right-[14%] bottom-[22%] h-12 w-12 text-sky-300/70 animate-float-y"
            style={{ animationDelay: "3.5s" }}
          />
        </>
      )}

      {/* LANDING */}
      {view === "landing" && (
        <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-10 animate-fade-up">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl glass-card">
              <Sun className="h-6 w-6 text-amber-500 animate-spin-slow" />
            </div>
            <span className="text-sm font-medium text-foreground/70">Weather Forecast</span>
          </div>

          <div className="w-full max-w-2xl rounded-3xl glass-card floating p-8 text-center sm:p-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Weather{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                Forecast
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Check the weather of any city in real-time.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-8 flex w-full items-center gap-2 rounded-2xl glass-input p-2 transition-all focus-within:scale-[1.01]"
            >
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-500/60 active:scale-95"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
                <Search className="h-4 w-4 transition-transform group-hover:rotate-12" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {error && (
              <p className="mt-4 inline-block rounded-full bg-red-100/80 px-4 py-2 text-sm text-red-600 animate-fade-up">
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Try:</span>
              {["Tokyo", "Paris", "New York", "Mumbai"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setQuery(c);
                    fetchWeather(c);
                  }}
                  className="rounded-full bg-white/40 px-3 py-1 backdrop-blur-md transition hover:bg-white/70 hover:-translate-y-0.5"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {view === "loading" && (
        <div className="relative z-10 grid min-h-screen place-items-center animate-fade-up">
          <div className="flex flex-col items-center gap-6 rounded-3xl glass-card floating px-10 py-12">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 grid place-items-center">
                <Sun className="h-12 w-12 text-amber-400 animate-spin-slow" />
              </div>
              <Cloud
                className="absolute -bottom-1 -right-1 h-10 w-10 text-white drop-shadow animate-float-y"
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Fetching forecast…</p>
              <p className="text-sm text-muted-foreground">Gathering clouds and sunshine</p>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {view === "dashboard" && data && (
        <div
          className={`relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-8 sm:py-12 animate-fade-up ${
            isDark ? "text-white" : ""
          }`}
        >
          <header className="flex items-center justify-between">
            <button
              onClick={() => {
                setView("landing");
                setQuery("");
              }}
              className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm transition hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Search
            </button>
            <form
              onSubmit={onSubmit}
              className="hidden items-center gap-2 rounded-full glass-input px-3 py-1.5 sm:flex"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search another city..."
                className="w-56 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
            </form>
          </header>

          {error && (
            <p className="mx-auto mt-4 rounded-full bg-red-100/80 px-4 py-2 text-sm text-red-600 animate-fade-up">
              {error}
            </p>
          )}

          {/* Hero */}
          <section className="mt-10 flex flex-col items-center text-center animate-fade-up">
            <div className="flex items-center gap-2 text-sm opacity-80">
              <MapPin className="h-4 w-4" />
              <span>{data.country}</span>
            </div>
            <h2 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{data.city}</h2>
            <div className="mt-6 grid h-32 w-32 place-items-center rounded-full bg-white/40 backdrop-blur-md sm:h-40 sm:w-40">
              <WeatherIcon
                code={data.code}
                className={`h-20 w-20 animate-float-y sm:h-24 sm:w-24 ${
                  isDark ? "text-amber-200" : "text-indigo-500"
                }`}
              />
            </div>
            <div className="mt-6 flex items-start">
              <span className="text-8xl font-bold leading-none tracking-tighter sm:text-9xl">
                {data.temperature}°
              </span>
            </div>
            <p className="mt-2 text-xl font-medium">{data.condition}</p>
            <p className="text-sm opacity-80">Feels like {data.feelsLike}°</p>
          </section>

          {/* Stats */}
          <section className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Thermometer, label: "Temperature", value: `${data.temperature}°C` },
              { icon: Droplets, label: "Humidity", value: `${data.humidity}%` },
              { icon: Wind, label: "Wind", value: `${data.windSpeed} km/h` },
              { icon: Eye, label: "Feels like", value: `${data.feelsLike}°` },
            ].map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className="rounded-3xl glass-card p-5 transition-all hover:-translate-y-1 hover:shadow-2xl animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-2 text-xs opacity-80">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </section>

          {/* Sun + hourly */}
          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl glass-card p-6 animate-fade-up">
              <h4 className="text-sm font-medium opacity-80">Sun</h4>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-amber-100 to-orange-200/60 p-4 text-foreground">
                  <Sunrise className="h-6 w-6 text-amber-600" />
                  <p className="mt-2 text-xs text-muted-foreground">Sunrise</p>
                  <p className="text-lg font-semibold">{formatTime(data.sunrise)}</p>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-indigo-100 to-violet-200/60 p-4 text-foreground">
                  <Sunset className="h-6 w-6 text-indigo-600" />
                  <p className="mt-2 text-xs text-muted-foreground">Sunset</p>
                  <p className="text-lg font-semibold">{formatTime(data.sunset)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl glass-card p-6 lg:col-span-2 animate-fade-up">
              <h4 className="text-sm font-medium opacity-80">Next hours</h4>
              <div className="mt-4 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:thin]">
                {data.hourly.map((h) => (
                  <div
                    key={h.time}
                    className="flex min-w-[88px] flex-col items-center gap-2 rounded-2xl bg-white/40 px-4 py-3 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/60 text-foreground"
                  >
                    <span className="text-xs text-muted-foreground">{formatTime(h.time)}</span>
                    <WeatherIcon code={h.code} className="h-6 w-6 text-indigo-500" />
                    <span className="text-sm font-semibold">{h.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5-day forecast */}
          {data.daily.length > 0 && (
            <section className="mt-6 animate-fade-up">
              <div className="rounded-3xl glass-card p-6 sm:p-8">
                <h4 className="text-sm font-medium opacity-80">5-Day Forecast</h4>
                <div className="mt-5 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible">
                  {data.daily.map((d, i) => (
                    <div
                      key={d.date}
                      className="flex min-w-[120px] flex-col items-center gap-2 rounded-2xl bg-white/40 p-4 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/70 text-foreground animate-fade-up"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDay(d.date)}
                      </span>
                      <WeatherIcon code={d.code} className="h-7 w-7 text-indigo-500" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{d.max}°</span>
                        <span className="text-xs text-muted-foreground">{d.min}°</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-sky-600">
                        <Umbrella className="h-3 w-3" />
                        <span>{d.precipitation}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <footer className="mt-12 text-center text-xs opacity-70">
            Powered by Open-Meteo · Crafted with care
          </footer>
        </div>
      )}
    </div>
  );
}

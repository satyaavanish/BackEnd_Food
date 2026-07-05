import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://front-end-food-omega.vercel.app",
  methods: ["GET", "POST", "OPTIONS"]
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/weather", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "Missing latitude or longitude" });

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { lat, lon: lng, appid: process.env.OPENWEATHER_API_KEY, units: "metric" }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Weather fetch failed", details: err.response?.data || err.message });
  }
});

// ✅ Geocode a free-text location into lat/lng via Geoapify.
// Keeps GEOAPIFY_API_KEY server-side only — the frontend no longer
// calls Geoapify directly.
app.get("/api/geocode", async (req, res) => {
  const { text } = req.query;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Missing 'text' query param" });
  }

  if (!process.env.GEOAPIFY_API_KEY) {
    console.error("Geoapify API key is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const geoRes = await axios.get(
      "https://api.geoapify.com/v1/geocode/search",
      {
        params: {
          text,
          apiKey: process.env.GEOAPIFY_API_KEY,
        },
      }
    );

    const feature = geoRes.data.features?.[0];

    if (!feature) {
      return res.status(404).json({ error: "Location not found" });
    }

    return res.json({
      lat: feature.properties.lat,
      lng: feature.properties.lon,
      formatted: feature.properties.formatted,
    });
  } catch (err) {
    console.error("Geocode error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Geocoding failed",
      details: err.response?.data || err.message,
    });
  }
});

app.get("/api/places", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      error: "Latitude and longitude are required",
    });
  }

  try {
    const response = await axios.get(
      "https://api.geoapify.com/v2/places",
      {
        params: {
          categories: "catering.restaurant",
          filter: `circle:${lng},${lat},3000`,
          limit: 20,
          apiKey: process.env.GEOAPIFY_API_KEY,
        },
      }
    );

    const results = response.data.features.map((place) => ({
  name: place.properties.name || "Restaurant",
  vicinity:
    place.properties.address_line2 ||
    place.properties.address_line1 ||
    "Address unavailable",
  rating: "N/A",
  lat: place.properties.lat,
  lng: place.properties.lon,
}));

    res.json({ results });

  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: "Failed to fetch nearby restaurants",
      details: err.response?.data || err.message,
    });
  }
});

app.post('/detect', async (req, res) => {
  const { items } = req.body;
  const item = items?.[0];
  if (!item) return res.status(400).json({ error: "No food item provided" });

  try {
    const searchRes = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: { query: item, api_key: process.env.USDA_API_KEY }
    });

    const firstFood = searchRes.data.foods?.[0];
    if (!firstFood) return res.json({ [item]: { error: "Item not found" } });

    const fdcId = firstFood.fdcId;
    const detailsRes = await axios.get(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}`, {
      params: { api_key: process.env.USDA_API_KEY }
    });

    const nutrients = detailsRes.data.foodNutrients || [];
    const nutrition = { calories: "N/A", protein: "N/A", fat: "N/A", carbs: "N/A", fiber: "N/A", sugar: "N/A", sodium: "N/A" };

    for (let n of nutrients) {
      const name = n.nutrient?.name?.toLowerCase() || "";
      const unit = n.nutrient?.unitName || "";
      const value = n.amount;

      if ((name.includes("energy") || name.includes("calories")) && unit.toLowerCase() === "kcal") nutrition.calories = `${value} kcal`;
      else if (name === "protein") nutrition.protein = `${value} g`;
      else if (name.includes("fat") && name.includes("total")) nutrition.fat = `${value} g`;
      else if (name.includes("carbohydrate")) nutrition.carbs = `${value} g`;
      else if (name.includes("fiber")) nutrition.fiber = `${value} g`;
      else if (name.includes("sugar")) nutrition.sugar = `${value} g`;
      else if (name.includes("sodium")) nutrition.sodium = `${value} mg`;
    }

    res.json({ [item]: nutrition });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nutrition data", details: err.response?.data || err.message });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: { q: "food", lang: "en", token: process.env.GNEWS_API_KEY}
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news", details: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

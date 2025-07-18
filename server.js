import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from "dotenv";
const app = express();
const PORT = process.env.PORT || 5000;


 app.use(cors({
  origin: "https://front-end-food-omega.vercel.app",
  methods: ["GET", "POST", "OPTIONS"]
}));

app.use(express.json());

dotenv.config();

const API_KEY = process.env.USDA_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
app.get("/api/weather", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing latitude or longitude" });
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat,
        lon: lng,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric"
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error("Weather fetch error:", err.message);
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

// 🔍 Nearby Restaurants using Google Places API
app.get("/api/places", async (req, res) => {
  const { lat, lng, keyword = "" } = req.query;
  console.log("✅ Called /api/places with:", lat, lng, keyword);

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  if (!GOOGLE_API_KEY) {
    console.error("Google API key is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

    const response = await axios.get(url, {
      params: {
        location: `${lat},${lng}`,
        keyword,
        type: "restaurant",
        rankby: "distance",
        key: GOOGLE_API_KEY,
      },
    });

    const results = response.data.results.map((place) => ({
      name: place.name,
      vicinity: place.vicinity,
      place_id: place.place_id,
      rating: place.rating || "N/A",
    }));

    return res.json({ results });
  } catch (err) {
    console.error("Google Places API error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Failed to fetch nearby places",
      details: err.response?.data || err.message,
    });
  }
});

// Nutrition detection via USDA API
app.post('/detect', async (req, res) => {
  const { items } = req.body;
  const item = items?.[0];
  console.log("Received items:", req.body.items);

  if (!item) {
    return res.status(400).json({ error: "No food item provided" });
  }

  try {
    const searchRes = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        query: item,
        api_key: API_KEY
      }
    });

    const firstFood = searchRes.data.foods?.[0];
    if (!firstFood) {
      return res.json({ [item]: { error: "Item not found" } });
    }

    const fdcId = firstFood.fdcId;
    const detailsRes = await axios.get(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}`, {
      params: { api_key: API_KEY }
    });

    const nutrients = detailsRes.data.foodNutrients || [];
    console.log("📦 Raw nutrients:", nutrients);

    const nutrition = {
      calories: "N/A",
      protein: "N/A",
      fat: "N/A",
      carbs: "N/A",
      fiber: "N/A",
      sugar: "N/A",
      sodium: "N/A"
    };

    for (let n of nutrients) {
      const name = n.nutrient?.name?.toLowerCase() || "";
      const unit = n.nutrient?.unitName || "";
      const value = n.amount;

      if ((name.includes("energy") || name.includes("calories")) && unit.toLowerCase() === "kcal") {
        nutrition.calories = `${value} kcal`;
      } else if (name === "protein") {
        nutrition.protein = `${value} g`;
      } else if (name.includes("fat") && name.includes("total")) {
        nutrition.fat = `${value} g`;
      } else if (name.includes("carbohydrate")) {
        nutrition.carbs = `${value} g`;
      } else if (name.includes("fiber")) {
        nutrition.fiber = `${value} g`;
      } else if (name.includes("sugar")) {
        nutrition.sugar = `${value} g`;
      } else if (name.includes("sodium")) {
        nutrition.sodium = `${value} mg`;
      }
    }

    console.log("✅ Final nutrition summary:", nutrition);
    return res.json({ [item]: nutrition });
  } catch (err) {
    console.error("USDA API error:", err.message);
    return res.status(500).json({ error: "Failed to fetch nutrition data" });
  }
});

 app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

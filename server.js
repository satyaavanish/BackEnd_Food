// import dotenv from "dotenv";
// dotenv.config(); // ⬅️ Load env variables first

// import express from 'express';
// import cors from 'cors';
// import axios from 'axios';

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ CORS setup for Vercel frontend
// app.use(cors({
//   origin: "https://front-end-food-omega.vercel.app",
//   methods: ["GET", "POST", "OPTIONS"]
// }));

// app.use(express.json());

// // ✅ Root route for Render health check
// app.get("/", (req, res) => {
//   res.send("Backend is running!");
// });

// // ✅ Weather API using OpenWeatherMap
// app.get("/api/weather", async (req, res) => {
//   const { lat, lng } = req.query;

//   if (!lat || !lng) {
//     return res.status(400).json({ error: "Missing latitude or longitude" });
//   }

//   try {
//     const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
//       params: {
//         lat,
//         lon: lng,
//         appid: process.env.OPENWEATHER_API_KEY,
//         units: "metric"
//       }
//     });

//     res.json(response.data);
//   } catch (err) {
//     console.error("Weather fetch error:", err.message);
//     res.status(500).json({ error: "Weather fetch failed" });
//   }
// });

// // ✅ Nearby Restaurants using Google Places API
// app.get("/api/places", async (req, res) => {
//   const { lat, lng, keyword = "" } = req.query;
//   console.log("✅ Called /api/places with:", lat, lng, keyword);

//   if (!lat || !lng) {
//     return res.status(400).json({ error: "Latitude and longitude are required" });
//   }

//   if (!process.env.GOOGLE_API_KEY) {
//     console.error("Google API key is missing");
//     return res.status(500).json({ error: "Server configuration error" });
//   }

//   try {
//     const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

//     const response = await axios.get(url, {
//       params: {
//         location: `${lat},${lng}`,
//         keyword,
//         type: "restaurant",
//         rankby: "distance",
//         key: process.env.GOOGLE_API_KEY,
//       },
//     });

//     const results = response.data.results.map((place) => ({
//       name: place.name,
//       vicinity: place.vicinity,
//       place_id: place.place_id,
//       rating: place.rating || "N/A",
//     }));

//     return res.json({ results });
//   } catch (err) {
//     console.error("Google Places API error:", err.response?.data || err.message);
//     return res.status(500).json({
//       error: "Failed to fetch nearby places",
//       details: err.response?.data || err.message,
//     });
//   }
// });

// // ✅ Nutrition detection via USDA API
// app.post('/detect', async (req, res) => {
//   const { items } = req.body;
//   const item = items?.[0];
//   console.log("Received items:", req.body.items);

//   if (!item) {
//     return res.status(400).json({ error: "No food item provided" });
//   }

//   try {
//     const searchRes = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
//       params: {
//         query: item,
//         api_key: process.env.USDA_API_KEY
//       }
//     });

//     const firstFood = searchRes.data.foods?.[0];
//     if (!firstFood) {
//       return res.json({ [item]: { error: "Item not found" } });
//     }

//     const fdcId = firstFood.fdcId;
//     const detailsRes = await axios.get(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}`, {
//       params: { api_key: process.env.USDA_API_KEY }
//     });

//     const nutrients = detailsRes.data.foodNutrients || [];
//     console.log("📦 Raw nutrients:", nutrients);

//     const nutrition = {
//       calories: "N/A",
//       protein: "N/A",
//       fat: "N/A",
//       carbs: "N/A",
//       fiber: "N/A",
//       sugar: "N/A",
//       sodium: "N/A"
//     };

//     for (let n of nutrients) {
//       const name = n.nutrient?.name?.toLowerCase() || "";
//       const unit = n.nutrient?.unitName || "";
//       const value = n.amount;

//       if ((name.includes("energy") || name.includes("calories")) && unit.toLowerCase() === "kcal") {
//         nutrition.calories = `${value} kcal`;
//       } else if (name === "protein") {
//         nutrition.protein = `${value} g`;
//       } else if (name.includes("fat") && name.includes("total")) {
//         nutrition.fat = `${value} g`;
//       } else if (name.includes("carbohydrate")) {
//         nutrition.carbs = `${value} g`;
//       } else if (name.includes("fiber")) {
//         nutrition.fiber = `${value} g`;
//       } else if (name.includes("sugar")) {
//         nutrition.sugar = `${value} g`;
//       } else if (name.includes("sodium")) {
//         nutrition.sodium = `${value} mg`;
//       }
//     }

//     console.log("✅ Final nutrition summary:", nutrition);
//     return res.json({ [item]: nutrition });
//   } catch (err) {
//     console.error("USDA API error:", err.message);
//     return res.status(500).json({ error: "Failed to fetch nutrition data" });
//   }
// });

// // ✅ Start server (important for Render)
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


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

app.get("/api/places", async (req, res) => {
  const { lat, lng, keyword = "" } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "Latitude and longitude are required" });

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: {
        location: `${lat},${lng}`,
        keyword,
        type: "restaurant",
        rankby: "distance",
        key: process.env.GOOGLE_API_KEY,
      },
    });

    const results = response.data.results.map(place => ({
      name: place.name,
      vicinity: place.vicinity,
      place_id: place.place_id,
      rating: place.rating || "N/A",
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nearby places", details: err.response?.data || err.message });
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
      params: { q: "food", lang: "en", token: process.env.REACT_APP_GNEWS_API_KEY}
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news", details: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

# 🍽️ SnapDetectEat — AI-Powered Food Detection & Nutrition Platform
Link-https://front-end-food-omega.vercel.app/


Frontend Link - https://github.com/satyaavanish/FrontEnd_Food

A full-stack web application that identifies food from images, breaks down nutritional content, surfaces nearby restaurants, and delivers real-time food news — all in one place.

---

## 🌟 What It Does

Upload a photo of any dish or type a food name, and FoodLens takes care of the rest:

- 🤖 **AI Detection** — Identifies the dish and its key ingredients using the Gemini API
- 🥗 **Nutrition Breakdown** — Fetches detailed nutritional data (calories, protein, carbs, fats, fiber, sugar, sodium) from the USDA FoodData Central database
- 🍜 **Nearby Restaurants** — Finds restaurants close to you that serve the detected dish via Google Places
- 🌦️ **Live Weather** — Shows current weather at your location (because nobody wants cold soup on a hot day)
- 📰 **Food News Feed** — Streams the latest food-related news via GNews
- 💬 **Chatbot Assistant** — Answers food and nutrition questions in context

---

## 🗂️ Project Structure

```
food-lens/
│
├── client/                        # React frontend
│   ├── App.js / App.css
│   ├── Main.js / Main.css
│   ├── About.js / About.css
│   ├── Author.js
│   ├── Greeting.js / GreetingMessage.css
│   ├── Health.js / Health.css
│   ├── News.js / News.css
│   ├── Chatbot.js
│   ├── Sidebar.js
│   ├── Observer.js
│   └── CityAutoComplete.js / CityAutoComplete.css
│
├── server/                        # Express backend
│   └── server.js                  # All API routes
│
├── .env                           # Environment variables (never commit this)
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, CSS3 |
| Backend | Node.js, Express.js |
| AI / Detection | Google Gemini API |
| Nutrition Data | USDA FoodData Central API |
| Location & Maps | Google Places API |
| Weather | OpenWeatherMap API |
| News | GNews API |
| HTTP Client | Axios |
| Deployment | Vercel (frontend + backend) |

---

## ⚙️ Backend API Routes

All routes are served from the Express backend (`server.js`):

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/weather` | Fetch current weather by `lat` & `lng` |
| GET | `/api/places` | Find nearby restaurants by location + keyword |
| POST | `/detect` | Accepts `{ items: ["food name"] }`, returns full nutrition breakdown |
| GET | `/api/news` | Returns latest food-related news articles |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- API keys for: Gemini, Google Places, OpenWeatherMap, USDA FoodData Central, GNews

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/food-lens.git
cd food-lens
```

### 2. Set Up Environment Variables

Create a `.env` file inside the `server/` directory:

```env
OPENWEATHER_API_KEY=your_openweathermap_key
GOOGLE_API_KEY=your_google_places_key
USDA_API_KEY=your_usda_fooddata_key
GNEWS_API_KEY=your_gnews_key
GEMINI_API_KEY=your_gemini_key
PORT=5000
```


### 3. Install & Run the Backend

```bash
cd server
npm install
node server.js
```

Backend runs at `http://localhost:5000`

### 4. Install & Run the Frontend

```bash
cd client
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## 🔄 How It Works

```
User uploads image or types a dish name
        ↓
Frontend sends request to Express backend
        ↓
Backend calls Gemini API → returns dish name + ingredients
        ↓
Backend queries USDA FoodData Central with the detected food name
        ↓
Nutrition data (calories, protein, carbs, fats, fiber, sugar, sodium) is returned
        ↓
Google Places API finds nearby restaurants serving the dish
        ↓
OpenWeatherMap returns weather at the user's location
        ↓
All results are rendered in the React frontend
```

---

## 🌍 Location & Weather

The app requests browser geolocation to power two features: the nearby restaurant finder and the local weather display. Location access is optional — both features degrade gracefully if permission is denied. A city search autocomplete component (`CityAutoComplete`) is available as a manual fallback.

---

## 📰 News Feed

The `/api/news` endpoint pulls live food-related articles from GNews. Articles appear in a dedicated section of the app and refresh on each page load.

---

## 🔮 Planned Improvements

- User accounts with saved detection history
- Personalized meal and diet recommendations based on tracked intake
- Barcode scanning for packaged food items
- Grocery price comparison across nearby stores
- Meal planning calendar with weekly nutrition summary
- Dark mode toggle

---

## 👨‍💻 Author

**Avanish**  
Computer Science Engineering Student  
Interested in AI integration, full-stack development, and building tools that make everyday decisions easier.

---

## 📜 License

This project is intended for educational and personal portfolio use. All external APIs used are subject to their own respective terms of service.

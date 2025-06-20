# Disaster Response Coordination Platform

A full-stack disaster coordination platform that enables users to report disasters, view real-time updates, verify images using AI, and access geospatial insights through interactive maps.

---

## TECH STACK

- **Frontend:** HTML, JavaScript, CSS, Mapbox GL JS  
- **Backend:** Node.js, Express.js  
- **Database:** Supabase (PostgreSQL with geospatial support)  
- **AI Integration:** Google Gemini API (location extraction, image verification)  
- **Real-Time:** Socket.IO  
- **Caching:** Supabase cache table  

---

## FEATURES IMPLEMENTED

### Core Features:
- Create, view, update, and delete disaster records with geolocation.
- Submit user reports including text and image URLs.
- Real-time updates using WebSocket (Socket.IO).
- Extract locations from descriptions using Google Gemini API.
- Geocode location names to coordinates using Mapbox.
- Display disasters on an interactive Mapbox map.

### Optional Features:
- Detect urgent reports with keywords like “urgent”, “SOS”.
- Classify reports as "need", "offer", "alert", or "general".
- Filter reports by category and priority using UI buttons.
- Mapbox token is securely fetched via backend (not exposed).
- Verify image authenticity using Gemini Vision API.

---

## PROJECT STRUCTURE

```
disaster-response/
├── backend/
│   ├── routes/
│   ├── config/
│   ├── utils/
│   ├── index.js
│   └── .env
├── frontend/
│   └── index.html
└── .gitignore
```

---

## SETUP INSTRUCTIONS

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/disaster-response.git
cd disaster-response
```

### 2. Supabase Setup
Create a new project at [supabase.com](https://supabase.com) and set up the following tables:

#### disasters
- id (UUID)
- title
- location_name
- location (GEOGRAPHY)
- description
- tags (array)
- created_at

#### reports
- id (UUID)
- disaster_id (foreign key)
- user_id
- content
- image_url
- verification_status
- priority (boolean)
- category
- created_at

Also set up:
- **resources** (optional disaster-related assets)
- **cache** (used to store Mapbox/geocoding responses)

Enable **PostGIS** extension and optionally disable RLS for testing.

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=4001
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-google-gemini-key
MAPBOX_TOKEN=your-mapbox-token
```

Run backend:
```bash
node index.js
```

---

## FRONTEND INSTRUCTIONS

Open the `frontend/index.html` file in your browser directly  
**or** use VS Code Live Server / Python HTTP server:
```bash
cd frontend
python3 -m http.server
```

You will be able to:
- Create disasters
- Submit reports
- View all live disasters and reports
- Filter reports
- See map markers for disasters

## 🔗 Demo & Submission

- **Live App:** [Click here](https://disaster-response-g3dvcjeye-subhojit-pauls-projects-0529b500.vercel.app)
- **Backend:** [Click here](https://disaster-backend-mtev.onrender.com/)
- **GitHub Repo:** [Click here](https://github.com/subhpaul123/disaster-response.git)
- **Submission Zip:** `attached in email`
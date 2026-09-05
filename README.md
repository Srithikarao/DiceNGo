# 🎲 DiceNGo (Dice & Go Warangal)

> **"Stop Deciding. Let's Roll."**

DiceNGo is a production-ready, mobile-first web application designed with a **1980s/90s retro-arcade & Indian college hangout culture aesthetic**. It turns discovering food, sights, workshops, and nightlife around the **Warangal, Hanamkonda, and Kazipet** tri-city cluster into a playful, friction-free discovery companion.

---

## 🌟 Features

* **🎲 Arcade Dice Randomizer**: Eliminates group decision fatigue. Multi-tier scoring filters for open spots, distance weighting, unvisited boost (+50%), and DRY (Don't Repeat Yourself) penalties (-85% for recent repeats). Includes slot machine animations, 8-bit sound effects, and celebratory confetti.
* **📅 Hangout Calendar (Warangal Adventure Diary)**: Stamped retro-ring dates (`⑫`) tracking days you actually went out. Explored days reveal complete daily logs, and automatic **Monthly Recaps** celebrate monthly outings in a retro scrapbook.
* **🍜 Food Mode (315+ Real Places)**: Biryani, Tiffins, Cafes, Drive-ins, Street Food, Desserts across Subedari, Nayeem Nagar, Kishanpura, Hunter Road, Chowrasta, Kazipet, etc.
* **🌅 Explore Mode (108+ Landmarks)**: Temples, sunset lakes, Kakatiya ruins, malls, parks, and hidden viewpoints.
* **🎟️ Events & Workshops (12+ Verified)**: Cultural fests (NIT SpringSpree, KITS Sanskriti), pottery workshops, heritage photowalks, and live acoustic jams.
* **🤖 Conversational AI Planner**: Answers *"What's the situation?"* to construct time-sequenced hourly itineraries strictly within your budget and travel radius.
* **💸 Take a Challenge**: Damage limit planner (₹300, ₹500, ₹1000) allocating food, explore, and travel.
* **🧍 Solo Mode**: *"Why wait for everyone?"* Curated quiet corners and introspective spots with repeat visit warnings.
* **🗺️ Interactive Map**: Custom retro Leaflet + OpenStreetMap category pins for Warangal, Hanamkonda, and Kazipet.
* **🛡️ Admin Management & Excel Sync**: Built-in `/admin` panel to view stats, add/edit places, download the live Excel database, and upload updated workbooks.
* **🎵 Native 8-Bit Synthesizer**: Pure Web Audio API sound effects for button clicks, wheel ticks, stamp thuds, and fanfare.

---

## 📊 Dataset

The entire dataset is authored in [`backend/data/warangal_database.xlsx`](backend/data/warangal_database.xlsx) with separate sheets:
- `Food`: 315 verified places
- `Explore`: 108 verified landmarks
- `Events`: 12 verified events

---

## 🛠️ Tech Stack

* **Frontend**: React 18 (TypeScript), Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Leaflet.
* **Backend**: Python 3.14, FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL, OpenPyXL, Python-Jose (JWT).
* **Hosting**: Firebase Hosting (Global CDN, SSL).

---

## 🚀 Running Locally

### Backend:
```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Interactive API docs: `http://localhost:8000/docs`

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open: `http://localhost:5173`

---

## 📜 License
MIT

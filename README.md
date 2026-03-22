# WebGrade — Live Product Comparison & Grading Platform

A production-ready web application that compares products across multiple verified API sources (eBay, OpenFoodFacts, openFDA, UPCItemDB) with real-time INR pricing and a Bronze/Silver/Gold/Platinum grading system.

## Features

- **Live API Integration** — Real data from eBay, OpenFoodFacts, openFDA, and UPCItemDB
- **INR Pricing** — All prices converted to ₹ using live exchange rates
- **Smart Search** — Intent resolver classifies queries into Medicine/Food/General with confidence scoring
- **Grading System** — Products rated 2-5 stars mapped to Bronze/Silver/Gold/Platinum tiers
- **No Fake Data** — Missing prices show "Price not available", never fabricated
- **Premium UI** — Dark glassmorphism theme with smooth animations

## Quick Start

```bash
# 1. Install dependencies
cd webgrade/server && npm install
cd ../client && npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start backend
cd server && npm run dev

# 4. Start frontend (new terminal)
cd client && npm run dev

# 5. Open browser
# http://localhost:5173
```

## Architecture

```
Frontend (React/Vite :5173)
  ↓ proxy /api
Backend (Express :3001)
  ├── Intent Resolver → classify query
  ├── Adapters → eBay, OpenFoodFacts, openFDA, UPCItemDB
  ├── Normalizer → unified schema
  ├── Currency Service → USD→INR
  ├── Rating Engine → stars + tiers
  └── Cache → 5min TTL
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=<query>` | Search all sources |
| `GET /api/sources` | Adapter status |
| `GET /api/health` | Health check |

## Environment Variables

See `.env.example` for all required/optional variables.

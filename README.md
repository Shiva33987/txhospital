# TX Hospitals Miyapur Website

Premium, futuristic and formal multi-specialty hospital website with:

- React + Vite frontend
- Node + Express backend
- Smooth scrolling (`lenis`)
- Motion + scroll animation (`framer-motion`, `gsap`)
- 3D hero visual (`three`, `@react-three/fiber`, `@react-three/drei`)

## Project Structure

- `frontend/` - UI, sections, animations, 3D scene
- `backend/` - content APIs and appointment endpoint

## Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend default URL: `http://localhost:5000`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Production Build (Frontend)

```bash
cd frontend
npm run build
```

## API Endpoints

- `GET /api/health`
- `GET /api/content`
- `GET /api/header`
- `GET /api/hero`
- `GET /api/symptoms`
- `GET /api/treatments`
- `GET /api/whyChooseUs`
- `GET /api/doctors`
- `GET /api/technologies`
- `GET /api/testimonials`
- `GET /api/stats`
- `GET /api/insurance`
- `GET /api/faqs`
- `GET /api/finalCta`
- `POST /api/appointments`

## Data Notes

Website copy is adapted using:

- `https://txhospitals.in/`
- `https://txhospitals.in/specialities/`
- `https://txhospitals.in/about-us/`
- `https://txhospitals.in/board-of-directors/`
- `https://txhospitals.in/uppal/`

Branch-specific details can be updated from:

- `backend/data/content.js` (primary source)
- `frontend/src/content/fallbackContent.js` (fallback if backend is unavailable)


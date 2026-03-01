# hangri-la

Map-based food finder: type what you need (e.g. "I'm hungry, need food"), pick a place from suggestions, and navigate there.

## Run locally

1. Copy `.env.example` to `.env` and set:
   - `VITE_GOOGLE_MAPS_API_KEY` – Google Maps JavaScript API key (Maps + Directions enabled)
   - `VITE_PLACES_API_BASE_URL` – your custom places API base URL (e.g. `http://localhost:3000/api`)
2. `npm install && npm run dev`
3. Open **http://localhost:5173** in your browser (not the built-in preview).

**Why the preview looked wrong:** Cursor’s “Open in Browser” / embedded preview often serves the **built** app from `dist/`, which was outdated. The live app is served by `npm run dev`; after CSS/source changes, run `npm run build` if you rely on the built output or `npm run preview`.

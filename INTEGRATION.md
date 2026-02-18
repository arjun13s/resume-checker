# Using the React UI with the Flask backend

Your UI (beach theme, degree buttons, beach ball upload) is in **`ui-src/`**. It’s wired to the Resume Checker backend.

## 1. Backend (Flask)

From the project root:

```bash
python app.py
```

Runs the API at **http://localhost:5000** (CORS is enabled for the Vite dev server).

## 2. Frontend (Vite + React)

Your Vite app lives in **Downloads** (package.json, vite.config.ts, postcss.config.mjs). The contents of your `src` folder are in this repo as **`ui-src/`**.

**Option A – Use this repo as the only copy**

1. In this repo, create a `frontend` folder.
2. Copy from your Downloads folder: `package.json`, `vite.config.ts`, `postcss.config.mjs`, and any root `index.html`.
3. Rename `ui-src` to `frontend/src` (or copy `ui-src/*` into `frontend/src/`).
4. In `frontend`, run: `pnpm install` (or `npm install`), then `pnpm run build` or `pnpm dev` (or `npm run dev`).

**Option B – Keep developing in Downloads**

1. Copy **`ui-src/app/App.tsx`** from this repo into your Downloads project’s `src/app/App.tsx` (overwrite).
2. In Downloads, run: `pnpm dev` (or `npm run dev`).
3. The app will call **http://localhost:5000/analyze**. Start the Flask backend with `python app.py` from the Resume Checker repo.

## 3. What’s wired

- **Degree buttons:** Sciences, Business, Engineering, Arts (same order as your design). Values sent to the API: `sciences`, `engineering`, `arts`, `business`.
- **Upload:** File is sent as `file`; selected degree is sent as `faculty` (optional).
- **Results:** Score, faculty badge (+/- to score), word count, and up to 12 issues with message and suggestion. More than 12 are summarized as “+ N more in the full report.”
- **Errors:** If the backend is down or returns an error, a message is shown with a hint to run `python app.py`.

## 4. Custom API URL

If the backend is not on `localhost:5000`, set:

```bash
VITE_API_URL=http://your-server:5000
```

Then use it in your Vite app (e.g. in a `.env` file) so the frontend calls the correct API.

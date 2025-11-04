# React Task

Single-page React app built with Vite that talks to the assignment APIs for login, user listing, and editing individual user records.

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

- `npm run build` produces the production bundle in `dist/`.
- `npm run preview` serves the built assets locally.

## Development Notes

- The Vite dev server proxies API calls through `/assignment-api` (configured in `vite.config.js`) to avoid CORS headaches. Set `VITE_API_BASE` in an `.env` file if you need a different backend.
- The login form is prefilled with the supplied credentials (`administrator` / `Anand`). The app expects the API to respond with either an access token, a session id, or a clear success flag before it unlocks the protected routes.
- If the API payload shape changes, tweak the parsers in `frontend/src/services/client.js`, `frontend/src/pages/Users.jsx`, and `frontend/src/pages/UserDetail.jsx`.

## Project Structure

Top level
- README.md
- frontend/

Within `frontend/`
- index.html
- package.json
- src/
  - App.jsx
  - context/AuthContext.jsx
  - main.jsx
  - pages/Login.jsx
  - pages/UserDetail.jsx
  - pages/Users.jsx
  - services/client.js
  - services/endpoints.js
  - styles.css
- vite.config.js

## Styling

All global styles live in `frontend/src/styles.css`. Adjust the CSS variables at the top of the file to re-theme the application quickly.

# ⚡ LifeSaver AI

A full-stack productivity companion that helps you beat deadlines, prioritize tasks, and take action — powered by Google's Gemini API.

**🔗 Live Demo:** [last-minute-lifesaver-brown.vercel.app](https://last-minute-lifesaver-brown.vercel.app/login)

---

## ✨ Features

- **AI-powered task scoring** — Gemini analyzes each task's title, category, and deadline to assign an urgency score (1–10) and a short, actionable tip to get started immediately.
- **AI productivity coach chat** — a conversational assistant aware of your current task list, helping you prioritize, plan your next few hours, or beat procrastination.
- **Secure authentication, built from scratch** — JWT-based sessions with bcrypt password hashing (no third-party auth provider). See [Authentication](#-authentication) below for the full design.
- **Per-user task ownership** — every task is scoped to its creator at the database level; users can only ever see or modify their own tasks.
- **Task dashboard** — add, complete, and delete tasks, with automatic sorting by urgency and a live progress bar.
- **In-app toast notifications** — instant feedback for task actions (added, deleted, errors).
- **Browser deadline reminders** — opt-in native browser notifications that alert you when a task is within an hour of its deadline, or overdue.

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- React Router
- Tailwind CSS

**Backend**
- Node.js + Express
- MongoDB Atlas (via Mongoose)
- JWT + bcrypt for authentication
- Google Gemini API (`gemini-2.5-flash`) — called server-side only, key never touches the browser

**Deployment**
- Backend → [Render](https://render.com)
- Frontend → [Vercel](https://vercel.com)

---

## 📁 Project Structure

```
last-minute-lifesaver/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # register / login, JWT signing
│   │   ├── aiController.js        # Gemini scoreTask / chat
│   │   └── taskController.js      # task CRUD, scoped to req.userId
│   ├── middleware/
│   │   ├── authMiddleware.js      # verifies JWT, attaches req.userId
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js                # bcrypt password hashing hook
│   │   └── Task.js                # includes `user` ownership field
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── aiRoutes.js
│   │   └── taskRoutes.js          # protected by authMiddleware
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Home.jsx
│   │   ├── components/
│   │   │   ├── TaskCard.jsx
│   │   │   ├── AddTaskForm.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   └── ToastContainer.jsx # in-app toast notifications
│   │   ├── services/
│   │   │   └── api.js             # all backend calls, attaches JWT
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── notifications.js   # browser Notification API helpers
│   │   ├── App.jsx                # task dashboard + AI chat UI
│   │   └── main.jsx               # routing + auth guard
│   └── vercel.json                 # SPA rewrite rules
└── README.md
```

---

## 🔐 Authentication

Authentication is implemented from scratch with `bcryptjs` and `jsonwebtoken` — no Auth0, Firebase, or Passport.

**1. Password storage.** A Mongoose pre-save hook on `User` hashes passwords with bcrypt before they ever touch the database:
```js
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```
Hashing is one-way — even a full database leak wouldn't expose real passwords. Login checks compare a fresh hash of the entered password against the stored hash (`bcrypt.compare`), never decrypting anything.

**2. Session tokens.** On successful register/login, the server signs a stateless JWT:
```js
jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
```
No server-side session store is needed — any request bearing a validly signed, unexpired token is treated as authenticated.

**3. Route protection.** `authMiddleware.js` reads `Authorization: Bearer <token>` on incoming requests, verifies it, and attaches `req.userId`:
```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.id;
```
Applied to every task route in one line via `router.use(protect)`.

**4. Data ownership.** Every task query is scoped by the verified user ID:
```js
Task.find({ user: req.userId })
```
This is what actually prevents one user from ever seeing or modifying another user's tasks, even if they guessed a task's database ID.

**Known limitation:** the JWT is stored in `localStorage` on the frontend, which is vulnerable to XSS if the app were ever compromised by injected script. A more production-grade approach would use httpOnly cookies instead, which JavaScript can't read at all — noted here as a deliberate scope decision, not an oversight.

---

## 🚀 Running Locally

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=any_long_random_string
CLIENT_URL=http://localhost:3000
```

```bash
npm run start
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## 🌐 Deployment Notes

- **Render (backend)**: set the environment variables above in the Render dashboard, with `CLIENT_URL` pointed at your deployed Vercel URL so CORS allows requests from it.
- **Vercel (frontend)**: set `VITE_API_URL` to your Render backend URL + `/api`. Includes a `vercel.json` rewrite rule so client-side routes (like `/login`) don't 404 on direct navigation or refresh.
- **MongoDB Atlas**: Network Access should allow `0.0.0.0/0`, since Render's free tier doesn't use fixed outbound IPs.
- **Gemini model**: uses `gemini-2.5-flash` — `gemini-2.0-flash` was retired in June 2026, so older code pointing at it will fail with a misleading zero-quota error rather than a clear "model not found."

---

## 🐛 Notable Bugs Fixed Along the Way

A few real debugging stories from building this, kept here because they're more instructive than a clean changelog:

- **API key exposure**: the AI calls originally ran client-side with the provider key in a `VITE_*` env var — trivially stealable from the browser bundle. Moved all AI calls server-side.
- **Double `/api` in requests**: `VITE_API_URL` already included `/api`, but a service file appended another `/api` on top, causing silent 404s that surfaced as a confusing `"Unexpected token '<'"` JSON parse error (the frontend was trying to parse an HTML 404 page as JSON).
- **Stale localStorage key after refactor**: switching from a fake `isLoggedIn` flag to a real JWT (`token`) in `Login.jsx`, but the route guard in `main.jsx` was still checking for `isLoggedIn` — login succeeded every time but silently bounced back to `/login`.
- **CORS origin mismatch**: `CLIENT_URL` on the backend didn't exactly match the live Vercel deployment URL (missing a random suffix Vercel appends per-deployment) — CORS treats a near-miss as no match at all.
- **SPA routing 404s**: Vercel returned 404 on direct navigation to `/login` because it didn't know to hand off to React Router — fixed with a `vercel.json` rewrite rule.

---

## 📌 Known Limitations

- Reminders only fire while a browser tab with the app open is active — no service worker / push notification support yet for background alerts.
- Gemini API calls may hit free-tier quota limits depending on account/billing configuration; the app degrades gracefully with a fallback tip rather than crashing.
- No task editing yet — tasks can be added, completed, and deleted, but not modified after creation.

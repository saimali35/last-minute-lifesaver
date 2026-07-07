# ⚡ LifeSaver AI

A full-stack productivity companion that helps you beat deadlines, prioritize tasks, and take action — powered by Google's Gemini API.

**🔗 Live Demo:** [last-minute-lifesaver-brown.vercel.app](https://last-minute-lifesaver-brown.vercel.app/login)

---

## ✨ Features

- **Smart task scoring** — Gemini AI analyzes each task's title, category, and deadline to assign an urgency score (1–10) and a short, actionable tip to get started immediately.
- **AI productivity coach chat** — a conversational assistant that knows your current task list and helps you prioritize, plan your next few hours, or beat procrastination.
- **Secure authentication** — JWT-based auth with bcrypt password hashing, built from scratch (no third-party auth provider).
- **Task dashboard** — add, complete, and delete tasks, with automatic sorting by urgency and a live progress bar.

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
- Google Gemini API (called server-side only — the key never touches the browser)

**Deployment**
- Backend → [Render](https://render.com)
- Frontend → [Vercel](https://vercel.com)

---

## 📁 Project Structure

```
last-minute-lifesaver/
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # register / login
│   │   └── aiController.js      # Gemini scoreTask / chat
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── aiRoutes.js
│   │   └── taskRoutes.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   └── Home.jsx
│   │   ├── services/
│   │   │   └── gemini.js        # calls backend, not Gemini directly
│   │   ├── App.jsx              # task dashboard + AI chat UI
│   │   └── main.jsx             # routing + auth guard
│   └── vercel.json               # SPA rewrite rules
└── README.md
```

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
- **MongoDB Atlas**: Network Access should allow `0.0.0.0/0` since Render's free tier doesn't use fixed outbound IPs.

---

## 🔐 Security Notes

- The Gemini API key lives only in backend environment variables — it is never exposed to the frontend or committed to the repo.
- Passwords are hashed with bcrypt before being stored; plaintext passwords are never saved.
- Auth uses signed JWTs (7-day expiry) rather than storing session state server-side.

---

## 📌 Known Limitations

- Gemini API calls may hit free-tier quota limits depending on your Google account's billing/region setup.
- No signup UI yet — new accounts currently require a direct call to `POST /api/auth/register`.

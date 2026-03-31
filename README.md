# 🚀 AI Career Assistant

An intelligent, AI-powered career analysis tool that helps recruiters evaluate candidates by analyzing their resumes using **Google Gemini 2.5 Flash** and **MongoDB Atlas Vector Search**. Upload a resume, ask questions, and get structured professional insights — all within a beautifully crafted dark-themed interface.

---

## ✨ Features

### 🤖 AI-Powered Resume Analysis
- Upload any PDF resume and get it automatically parsed, chunked, and vectorized
- Ask natural language questions about candidates ("Is this candidate a good fit for a frontend role?")
- Receive structured responses with Executive Summary, Technical Match, and Strengths analysis

### 💬 Multi-Conversation Management
- Create multiple chat sessions, each with its own uploaded resume
- Switch between conversations seamlessly
- Delete conversations you no longer need (with confirmation)

### 📄 Resume Preview Panel
- Side-panel to view the uploaded PDF right next to the chat window
- Instantly reference the original resume while reviewing AI analysis
- Powered by Supabase Storage with secure signed URLs

### 📊 Download as PDF Report
- Export the complete AI analysis as a professionally formatted PDF
- Share reports with your team — no account needed to view
- Includes all Q&A pairs with structured formatting

### 🎨 Premium UI/UX
- Dark-themed glassmorphism design with red accent palette
- Magnetic hover effects on interactive elements
- Shimmer loading skeletons during AI processing
- Floating ambient particles in the background
- Smooth spring animations throughout (powered by Framer Motion)
- Responsive layout with collapsible resume panel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Framer Motion, Tailwind CSS 4, Lucide Icons |
| **Backend** | Node.js, Express 5 |
| **AI** | Google Gemini 2.5 Flash (chat), Gemini Embedding 001 (vectors) |
| **Database** | MongoDB Atlas (Mongoose + Native Driver for Vector Search) |
| **File Storage** | Supabase Storage |
| **Auth** | JWT + bcrypt |
| **PDF Processing** | pdf-parse-fork (server), html2pdf.js (client) |

---

## 📁 Project Structure

```
ai-career-assistant/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── App.jsx             # Root component with auth routing
│       ├── Auth.jsx            # Login / Signup page
│       ├── Assistant.jsx       # Main chat interface
│       ├── index.css           # Global styles
│       └── main.jsx            # Entry point
│
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js               # MongoDB, Gemini AI & Supabase clients
│   ├── controllers/
│   │   ├── authController.js   # Register & Login handlers
│   │   ├── chatController.js   # Chat, conversations, delete
│   │   └── resumeController.js # Resume upload, PDF storage, signed URLs
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── models/
│   │   ├── Chat.js             # Chat message schema
│   │   └── User.js             # User schema
│   ├── routes/
│   │   ├── authRoutes.js       # /api/register, /api/login
│   │   ├── chatRoutes.js       # /api/chat, /api/conversations, etc.
│   │   └── resumeRoutes.js     # /api/upload-resume, /api/resume-file
│   ├── server.js               # Express app entry point
│   └── .env                    # Environment variables (not committed)
│
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** account (with Vector Search index configured)
- **Google AI Studio** API key (for Gemini models)
- **Supabase** project (for resume file storage)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-career-assistant.git
cd ai-career-assistant
```

### 2. Set Up the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Start the server:

```bash
node server.js
```

The server will start on `http://localhost:5000`.

### 3. Set Up the Client

```bash
cd client
npm install
npm run dev
```

The client will start on `http://localhost:5173`.

---

## 🗄️ MongoDB Atlas Setup

### Vector Search Index

Create a vector search index named `vector_index` on the `career_assistant.resumes` collection:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "vector",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "conversationId"
    }
  ]
}
```

---

## 🪣 Supabase Storage Setup

1. Create a new **Storage Bucket** named `resumes`
2. Set bucket to **private** (not public)
3. Add the following **RLS Policies**:
   - **INSERT**: Allow service role to insert files
   - **SELECT**: Allow service role to read files

> The server uses the `service_role` key which bypasses RLS, so files are securely managed server-side.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create a new user |
| POST | `/api/login` | Login and receive JWT |

### Chat & Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List all conversations |
| GET | `/api/chats` | Get all chat messages |
| GET | `/api/chats/:conversationId` | Get chats for a specific conversation |
| POST | `/api/chat` | Send a question, receive AI analysis |
| DELETE | `/api/conversations/:conversationId` | Delete a conversation and all its data |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-resume` | Upload and vectorize a PDF resume |
| GET | `/api/resume-file/:conversationId` | Get a signed URL for the original PDF |

> All endpoints (except auth) require `Authorization: Bearer <token>` header.

---

## 📸 Screenshots

*Screenshots coming soon*

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Credits

- [Google Gemini AI](https://ai.google.dev/) — LLM & Embedding models
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Database & Vector Search
- [Supabase](https://supabase.com/) — File Storage
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Lucide Icons](https://lucide.dev/) — Icon library
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) — Client-side PDF generation
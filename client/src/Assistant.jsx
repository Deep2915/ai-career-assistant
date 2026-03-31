import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Plus,
  MessageSquare,
  LogOut,
  Zap,
  FileUp,
  ArrowUp,
  Sparkles,
  X,
  CheckCircle2,
} from "lucide-react";

/* ─────────────────────────────────────────
   MAGNETIC BUTTON
   Cursor pulls the button slightly toward it
───────────────────────────────────────── */
function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 18 });
  const sy = useSpring(y, { stiffness: 280, damping: 18 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: "contents" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   LIVE STATUS DOT  — ping animation
───────────────────────────────────────── */
function LiveDot() {
  return (
    <span
      className="relative flex items-center justify-center"
      style={{ width: 10, height: 10 }}
    >
      <motion.span
        className="absolute rounded-full"
        style={{ width: 10, height: 10, background: "#e8445e", opacity: 0.5 }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      <span
        className="rounded-full"
        style={{
          width: 6,
          height: 6,
          background: "#e8445e",
          boxShadow: "0 0 7px #e8445e",
        }}
      />
    </span>
  );
}

/* ─────────────────────────────────────────
   TYPING DOTS
───────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 0.16, 0.32].map((delay, i) => (
        <motion.span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(232,68,94,0.55)",
            display: "block",
          }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   ATTACH RESUME ZONE
   Drag-over + hover + icon tilt + clear X
───────────────────────────────────────── */
function AttachZone({ file, setFile }) {
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState(false);

  const drop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  return (
    <motion.label
      htmlFor="resume-file"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={drop}
      animate={{
        borderColor: drag
          ? "rgba(232,68,94,0.75)"
          : hover
            ? "rgba(232,68,94,0.5)"
            : "rgba(200,30,58,0.3)",
        backgroundColor: drag
          ? "rgba(200,30,58,0.2)"
          : hover
            ? "rgba(200,30,58,0.1)"
            : "rgba(200,30,58,0.04)",
      }}
      transition={{ duration: 0.15 }}
      style={{ border: "1px solid rgba(200,30,58,0.3)" }}
    >
      {/* icon — tilts on hover */}
      <motion.span
        style={{ display: "flex" }}
        animate={{
          rotate: hover ? 14 : 0,
          scale: hover ? 1.2 : 1,
          color: file ? "#fb7185" : "rgba(251,113,133,0.5)",
        }}
        transition={{ type: "spring", stiffness: 380, damping: 14 }}
      >
        <FileUp size={14} />
      </motion.span>

      {/* label */}
      <motion.span
        className="text-xs whitespace-nowrap"
        animate={{
          color: file
            ? "#fda4af"
            : hover
              ? "rgba(253,164,175,0.85)"
              : "rgba(253,164,175,0.55)",
        }}
        transition={{ duration: 0.15 }}
      >
        {file
          ? file.name.slice(0, 22) + (file.name.length > 22 ? "…" : "")
          : "Attach resume"}
      </motion.span>

      {/* clear button slides in when file selected */}
      <AnimatePresence>
        {file && (
          <motion.span
            initial={{ opacity: 0, scale: 0, x: -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              display: "flex",
              color: "rgba(251,113,133,0.55)",
              cursor: "pointer",
            }}
            whileHover={{ color: "#fb7185", scale: 1.25 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.preventDefault();
              setFile(null);
            }}
          >
            <X size={11} />
          </motion.span>
        )}
      </AnimatePresence>

      <input
        id="resume-file"
        type="file"
        className="hidden"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </motion.label>
  );
}

/* ─────────────────────────────────────────
   SEND BUTTON — ripple + magnetic + float
───────────────────────────────────────── */
function SendButton({ disabled, onClick }) {
  const [ripples, setRipples] = useState([]);

  const fire = () => {
    if (disabled) return;
    const id = Date.now();
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((v) => v !== id)), 700);
    onClick?.();
  };

  return (
    <Magnetic strength={0.4}>
      <motion.button
        type="submit"
        disabled={disabled}
        onClick={fire}
        whileTap={{ scale: 0.88 }}
        className="relative flex items-center justify-center flex-shrink-0 overflow-hidden disabled:opacity-25"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "linear-gradient(135deg, #c81e3a, #e8445e)",
          boxShadow: disabled ? "none" : "0 0 18px rgba(200,30,58,0.45)",
        }}
      >
        {/* ripple pool */}
        {ripples.map((id) => (
          <motion.span
            key={id}
            className="absolute rounded-full bg-white pointer-events-none"
            initial={{
              width: 0,
              height: 0,
              opacity: 0.35,
              x: "-50%",
              y: "-50%",
              top: "50%",
              left: "50%",
            }}
            animate={{ width: 72, height: 72, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ position: "absolute", top: "50%", left: "50%" }}
          />
        ))}
        {/* arrow floats up/down subtly when active */}
        <motion.span
          style={{ display: "flex" }}
          animate={disabled ? {} : { y: [0, -2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowUp size={16} color="white" />
        </motion.span>
      </motion.button>
    </Magnetic>
  );
}

/* ─────────────────────────────────────────
   TOAST — spring in / out
───────────────────────────────────────── */
function Toast({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-white z-50 pointer-events-none"
          style={{
            background: "rgba(14,4,7,0.97)",
            border: "1px solid rgba(200,30,58,0.38)",
            boxShadow: "0 0 28px rgba(200,30,58,0.22)",
          }}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20,
              delay: 0.1,
            }}
            style={{ display: "flex", color: "#fb7185" }}
          >
            <CheckCircle2 size={14} />
          </motion.span>
          Resume uploaded successfully
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   CONVERSATION ITEM — slides + active bar
───────────────────────────────────────── */
function ConvItem({ conv, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="relative w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 overflow-hidden"
      style={{
        color: active ? "#fda4af" : "rgba(203,213,225,0.38)",
        background: active ? "rgba(200,30,58,0.11)" : "transparent",
        border: `1px solid ${active ? "rgba(200,30,58,0.22)" : "transparent"}`,
      }}
    >
      <motion.span
        animate={{ color: active ? "#fb7185" : "rgba(203,213,225,0.28)" }}
        style={{ display: "flex", flexShrink: 0 }}
      >
        <MessageSquare size={11} />
      </motion.span>
      <span className="truncate flex-1">
        {conv.title || "New conversation"}
      </span>

      {/* glowing left accent bar */}
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="conv-accent"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            style={{
              position: "absolute",
              left: 0,
              top: "20%",
              bottom: "20%",
              width: 2,
              borderRadius: 99,
              background: "linear-gradient(180deg, #c81e3a, #e8445e)",
              transformOrigin: "center",
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─────────────────────────────────────────
   CHAT BUBBLE — streams in word by word feel
───────────────────────────────────────── */
function AiBubble({ answer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex-1 px-5 py-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
      style={{
        background: "rgba(10,3,6,0.78)",
        border: "1px solid rgba(200,30,58,0.13)",
        color: "rgba(226,232,240,0.88)",
      }}
    >
      <ReactMarkdown>{answer}</ReactMarkdown>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
function Assistant() {
  const [question, setQuestion] = useState("");
  const [chats, setChats] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(uuidv4());
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setConversations(data);
    } catch {}
  };

  useEffect(() => {
    fetchConversations();
  }, [chats]);

  // Load chat history when switching conversations
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/chats/${currentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (data.length > 0) {
          setChats(data.map((c) => ({ question: c.question, answer: c.answer })));
        }
      } catch {
        // New conversation or error — start fresh
      }
    };
    loadConversation();
  }, [currentId]);

  const startNewChat = () => {
    setCurrentId(uuidv4());
    setChats([]);
    setQuestion("");
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    const userQ = question.trim();
    if (!userQ) return;
    setLoading(true);
    setQuestion("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat",
        { question: userQ, conversationId: currentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setChats((prev) => [
        ...prev,
        { question: userQ, answer: response.data.answer },
      ]);
    } catch {}
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      await axios.post("http://localhost:5000/api/upload-resume", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFile(null);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch {}
    setUploading(false);
  };

  return (
    <div className="flex h-screen overflow-hidden relative bg-black">
      {/* ── Background ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), radial-gradient(68% 58% at 50% 50%, #c81e3a 0%, #a51d35 16%, #7d1a2f 32%, #591828 46%, #3c1722 60%, #2a151d 72%, #1f1317 84%, #141013 94%, #0a0a0a 100%), radial-gradient(90% 75% at 50% 50%, rgba(228,42,66,0.06) 0%, rgba(228,42,66,0) 55%), radial-gradient(150% 120% at 8% 8%, rgba(0,0,0,0) 42%, #0b0a0a 82%, #070707 100%), radial-gradient(150% 120% at 92% 92%, rgba(0,0,0,0) 42%, #0b0a0a 82%, #070707 100%), radial-gradient(60% 50% at 50% 60%, rgba(240,60,80,0.06), rgba(0,0,0,0) 60%), #050505",
        }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
          opacity: 0.95,
        }}
      />

      <Toast show={toast} />

      {/* ── SIDEBAR ── */}
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 28,
          delay: 0.05,
        }}
        className="w-60 flex flex-col flex-shrink-0 border-r relative z-10"
        style={{
          borderColor: "rgba(200,30,58,0.14)",
          background: "rgba(12,4,7,0.72)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col h-full p-4 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-1 pt-2 pb-1">
            <Magnetic strength={0.5}>
              <motion.div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #c81e3a, #e8445e)",
                }}
                whileHover={{ rotate: [0, -10, 10, -4, 0], scale: 1.12 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles size={15} color="white" />
              </motion.div>
            </Magnetic>
            <span className="text-white font-semibold text-sm tracking-tight">
              Career Assistant
            </span>
          </div>

          {/* New Chat */}
          <motion.button
            onClick={startNewChat}
            whileHover={{
              scale: 1.025,
              backgroundColor: "rgba(200,30,58,0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium"
            style={{
              background: "rgba(200,30,58,0.1)",
              border: "1px solid rgba(200,30,58,0.22)",
              color: "#fda4af",
            }}
          >
            New Chat
            <motion.span
              style={{ display: "flex" }}
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 420, damping: 14 }}
            >
              <Plus size={14} />
            </motion.span>
          </motion.button>

          {/* History */}
          <div className="flex-1 overflow-y-auto space-y-0.5">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[9px] uppercase tracking-widest px-1 mb-2"
              style={{ color: "rgba(148,163,184,0.35)" }}
            >
              Recent
            </motion.p>
            <AnimatePresence>
              {conversations.map((conv, i) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 320,
                    damping: 26,
                  }}
                >
                  <ConvItem
                    conv={conv}
                    active={currentId === conv._id}
                    onClick={() => setCurrentId(conv._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <motion.button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="flex items-center gap-2 px-1 py-1 text-xs"
            style={{ color: "rgba(148,163,184,0.3)" }}
            whileHover={{ color: "rgba(248,113,113,0.75)", x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <LogOut size={11} /> Sign out
          </motion.button>
        </div>
      </motion.aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 26,
            delay: 0.1,
          }}
          className="flex items-center justify-between px-6 h-14 flex-shrink-0"
          style={{
            borderBottom: "1px solid rgba(200,30,58,0.1)",
            background: "rgba(0,0,0,0.32)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <LiveDot />
            <span
              className="text-xs"
              style={{ color: "rgba(203,213,225,0.45)" }}
            >
              Gemini 2.5 Flash
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <AttachZone file={file} setFile={setFile} />
            <AnimatePresence>
              {file && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85, x: 6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 0 18px rgba(200,30,58,0.45)",
                  }}
                  whileTap={{ scale: 0.94 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #c81e3a, #e8445e)",
                  }}
                >
                  {uploading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    >
                      Uploading…
                    </motion.span>
                  ) : (
                    "Upload"
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Chat feed */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Empty state */}
            <AnimatePresence>
              {chats.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 26,
                    delay: 0.2,
                  }}
                  className="flex flex-col items-center justify-center pt-24 gap-3 text-center"
                >
                  <Magnetic strength={0.6}>
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                      style={{
                        background: "linear-gradient(135deg, #c81e3a, #e8445e)",
                        boxShadow: "0 0 36px rgba(200,30,58,0.32)",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 28px rgba(200,30,58,0.28)",
                          "0 0 48px rgba(200,30,58,0.45)",
                          "0 0 28px rgba(200,30,58,0.28)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles size={26} color="white" />
                    </motion.div>
                  </Magnetic>
                  <motion.h2
                    className="text-xl font-semibold text-white"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    How can I help?
                  </motion.h2>
                  <motion.p
                    className="text-sm"
                    style={{ color: "rgba(148,163,184,0.45)" }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    Ask anything about your career — resume, interviews, job
                    search.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <AnimatePresence initial={false}>
              {chats.map((chat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className="space-y-4"
                >
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <motion.div
                      initial={{ opacity: 0, x: 14, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 24,
                      }}
                      className="max-w-sm px-4 py-3 rounded-2xl rounded-tr-sm text-sm"
                      style={{
                        background: "rgba(200,30,58,0.14)",
                        border: "1px solid rgba(200,30,58,0.24)",
                        color: "#ffe4e8",
                      }}
                    >
                      {chat.question}
                    </motion.div>
                  </div>

                  {/* AI bubble */}
                  <div className="flex gap-3">
                    <Magnetic strength={0.35}>
                      <motion.div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, #c81e3a, #e8445e)",
                          boxShadow: "0 0 14px rgba(232,68,94,0.22)",
                        }}
                        whileHover={{ scale: 1.12, rotate: 8 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 14,
                        }}
                      >
                        <Zap size={15} color="white" />
                      </motion.div>
                    </Magnetic>
                    <AiBubble answer={chat.answer} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="flex gap-3"
                >
                  <motion.div
                    className="w-8 h-8 rounded-xl flex-shrink-0"
                    style={{ background: "rgba(200,30,58,0.18)" }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <div
                    className="flex-1 rounded-2xl rounded-tl-sm flex items-center"
                    style={{
                      background: "rgba(10,3,6,0.6)",
                      border: "1px solid rgba(200,30,58,0.1)",
                      minHeight: 52,
                    }}
                  >
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-6 pb-6 flex-shrink-0">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <motion.div
              animate={{
                borderColor: inputFocused
                  ? "rgba(200,30,58,0.55)"
                  : "rgba(200,30,58,0.22)",
                boxShadow: inputFocused
                  ? "0 0 0 3px rgba(200,30,58,0.08), 0 0 24px rgba(200,30,58,0.1)"
                  : "none",
              }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{
                background: "rgba(10,3,6,0.82)",
                border: "1px solid rgba(200,30,58,0.22)",
              }}
            >
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "#e2e8f0" }}
                placeholder="Ask anything…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              <SendButton disabled={loading || !question.trim()} />
            </motion.div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Assistant;

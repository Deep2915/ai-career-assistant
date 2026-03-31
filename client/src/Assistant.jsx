import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
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
  Trash2,
  FileText,
  Download,
  PanelRightClose,
  Eye,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
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
   SHIMMER LINE — loading placeholder
───────────────────────────────────────── */
function ShimmerLine({ width = "60%", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{
        height: 8,
        width,
        borderRadius: 4,
        background: "linear-gradient(90deg, rgba(200,30,58,0.08) 0%, rgba(200,30,58,0.18) 50%, rgba(200,30,58,0.08) 100%)",
        backgroundSize: "200% 100%",
      }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 4,
          background: "linear-gradient(90deg, transparent 0%, rgba(200,30,58,0.15) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay }}
      />
    </motion.div>
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
        accept=".pdf"
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
function Toast({ show, message = "Resume uploaded successfully" }) {
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
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   DELETE CONFIRMATION OVERLAY
───────────────────────────────────────── */
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="absolute inset-0 z-20 flex items-center justify-center gap-1.5 rounded-lg"
      style={{
        background: "rgba(14,4,7,0.95)",
        border: "1px solid rgba(239,68,68,0.35)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 400 }}
        style={{ color: "rgba(248,113,113,0.8)", display: "flex" }}
      >
        <AlertTriangle size={11} />
      </motion.span>
      <span className="text-[10px]" style={{ color: "rgba(248,113,113,0.8)" }}>
        Delete?
      </span>
      <motion.button
        onClick={(e) => { e.stopPropagation(); onConfirm(); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
        style={{
          background: "rgba(239,68,68,0.25)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#fca5a5",
        }}
      >
        Yes
      </motion.button>
      <motion.button
        onClick={(e) => { e.stopPropagation(); onCancel(); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
        style={{
          background: "rgba(148,163,184,0.1)",
          border: "1px solid rgba(148,163,184,0.2)",
          color: "rgba(148,163,184,0.6)",
        }}
      >
        No
      </motion.button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   CONVERSATION ITEM — slides + active bar + delete
───────────────────────────────────────── */
function ConvItem({ conv, active, onClick, onDelete }) {
  const [hover, setHover] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmDelete(false); }}
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

      {/* Delete button — appears on hover */}
      <AnimatePresence>
        {hover && !confirmDelete && (
          <motion.span
            initial={{ opacity: 0, scale: 0, x: 4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            whileHover={{ color: "#f87171", scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            style={{
              display: "flex",
              flexShrink: 0,
              color: "rgba(248,113,113,0.4)",
              cursor: "pointer",
            }}
          >
            <Trash2 size={11} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Confirmation overlay */}
      <AnimatePresence>
        {confirmDelete && (
          <DeleteConfirm
            onConfirm={() => { setConfirmDelete(false); onDelete(conv._id); }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </AnimatePresence>

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
      className="flex-1 px-5 py-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed ai-bubble-content"
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

/* ─────────────────────────────────────────
   GLASS ICON BUTTON
───────────────────────────────────────── */
function GlassButton({ icon: Icon, label, onClick, active, size = 14, badge }) {
  return (
    <Magnetic strength={0.3}>
      <motion.button
        onClick={onClick}
        whileHover={{
          scale: 1.08,
          backgroundColor: "rgba(200,30,58,0.18)",
          borderColor: "rgba(200,30,58,0.4)",
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
        style={{
          background: active ? "rgba(200,30,58,0.15)" : "rgba(200,30,58,0.05)",
          border: `1px solid ${active ? "rgba(200,30,58,0.35)" : "rgba(200,30,58,0.18)"}`,
          color: active ? "#fda4af" : "rgba(253,164,175,0.55)",
          backdropFilter: "blur(8px)",
        }}
        title={label}
      >
        <motion.span
          style={{ display: "flex" }}
          animate={active ? { rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Icon size={size} />
        </motion.span>
        <span className="hidden sm:inline">{label}</span>
        {badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{
              background: "#e8445e",
              boxShadow: "0 0 6px rgba(232,68,94,0.6)",
            }}
          />
        )}
      </motion.button>
    </Magnetic>
  );
}

/* ─────────────────────────────────────────
   RESUME PREVIEW PANEL
───────────────────────────────────────── */
function ResumePanel({ url, fileName, onClose }) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="flex flex-col border-l relative z-10"
      style={{
        width: 420,
        flexShrink: 0,
        borderColor: "rgba(200,30,58,0.14)",
        background: "rgba(12,4,7,0.82)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 h-14 flex-shrink-0"
        style={{
          borderBottom: "1px solid rgba(200,30,58,0.12)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "#fb7185", display: "flex" }}
          >
            <FileText size={14} />
          </motion.span>
          <span className="text-xs font-medium" style={{ color: "#fda4af" }}>
            {fileName || "Resume Preview"}
          </span>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 14 }}
          style={{ color: "rgba(148,163,184,0.4)" }}
        >
          <PanelRightClose size={16} />
        </motion.button>
      </div>

      {/* PDF embed */}
      <div className="flex-1 relative">
        {url ? (
          <iframe
            src={url}
            className="w-full h-full"
            style={{ border: "none", background: "rgba(0,0,0,0.3)" }}
            title="Resume Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText size={32} style={{ color: "rgba(200,30,58,0.25)" }} />
            </motion.div>
            <span className="text-xs" style={{ color: "rgba(148,163,184,0.35)" }}>
              No resume uploaded for this conversation
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   SUGGESTED QUESTION CHIPS
───────────────────────────────────────── */
const SUGGESTED_QUESTIONS = [
  { emoji: "💡", text: "What are my React skills?" },
  { emoji: "📊", text: "Analyze my resume strengths" },
  { emoji: "🎯", text: "What roles suit my profile?" },
  { emoji: "🛠", text: "How can I improve my skills?" },
  { emoji: "📈", text: "Rate my resume out of 10" },
];

function SuggestedChips({ onSelect, visible }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.1 }}
      className="flex flex-wrap justify-center gap-2 mt-3"
    >
      {SUGGESTED_QUESTIONS.map(({ emoji, text }, i) => (
        <motion.button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 22,
            delay: 0.15 + i * 0.06,
          }}
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(200,30,58,0.18)",
            borderColor: "rgba(200,30,58,0.5)",
            color: "#fda4af",
            y: -2,
          }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs cursor-pointer"
          style={{
            background: "rgba(200,30,58,0.07)",
            border: "1px solid rgba(200,30,58,0.18)",
            color: "rgba(253,164,175,0.6)",
            backdropFilter: "blur(6px)",
            transition: "box-shadow 0.2s ease",
          }}
        >
          <span style={{ fontSize: 13 }}>{emoji}</span>
          <span>{text}</span>
        </motion.button>
      ))}
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
  const [toastMessage, setToastMessage] = useState("Resume uploaded successfully");
  const [inputFocused, setInputFocused] = useState(false);
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeFileName, setResumeFileName] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const chatEndRef = useRef(null);
  const reportRef = useRef(null);
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
      // Always clear chats first when switching conversations
      setChats([]);
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

  // Fetch resume URL when conversation changes or panel opens
  useEffect(() => {
    if (!showResumePanel) return;
    const fetchResumeUrl = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/resume-file/${currentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setResumeUrl(data.url);
        setResumeFileName(data.fileName);
      } catch {
        setResumeUrl(null);
        setResumeFileName(null);
      }
    };
    fetchResumeUrl();
  }, [currentId, showResumePanel]);

  const startNewChat = () => {
    setCurrentId(uuidv4());
    setChats([]);
    setQuestion("");
    setResumeUrl(null);
    setResumeFileName(null);
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/conversations/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // If deleting the active conversation, start a new one
      if (convId === currentId) {
        startNewChat();
      }
      showToast("Conversation deleted");
      fetchConversations();
    } catch {
      showToast("Failed to delete conversation");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleClearChat = () => {
    if (chats.length === 0) return;
    setChats([]);
    setQuestion("");
    showToast("Chat cleared");
  };

  const handleChipSelect = (chipText) => {
    setQuestion(chipText);
    // Auto-submit the selected chip question
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      setQuestion(""); // Clear before sending
      setLoading(true);
      axios
        .post(
          "http://localhost:5000/api/chat",
          { question: chipText, conversationId: currentId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          setChats((prev) => [
            ...prev,
            { question: chipText, answer: response.data.answer },
          ]);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 50);
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
    formData.append("conversationId", currentId);
    try {
      await axios.post("http://localhost:5000/api/upload-resume", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFile(null);
      showToast("Resume uploaded successfully");
    } catch {}
    setUploading(false);
  };

  // ── Markdown → HTML converter for PDF export ──
  const markdownToHtml = (md) => {
    let html = md;
    // Escape HTML entities
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Headers: ### → <h3>, ## → <h2>, # → <h1>
    html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:700;color:#e8445e;margin:12px 0 6px 0;">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:14px;font-weight:700;color:#c81e3a;margin:14px 0 6px 0;">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:16px;font-weight:700;color:#c81e3a;margin:16px 0 8px 0;">$1</h1>');
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1a1a2e;font-weight:700;">$1</strong>');
    // Italic: *text*
    html = html.replace(/\*(.+?)\*/g, '<em style="color:#333;font-style:italic;">$1</em>');
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #eee;margin:12px 0;"/>');
    // Numbered lists: 1. text
    html = html.replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:16px;margin:3px 0;color:#333;"><span style="color:#c81e3a;font-weight:600;margin-right:6px;">$1.</span>$2</div>');
    // Bullet lists: - text
    html = html.replace(/^[-•] (.+)$/gm, '<div style="padding-left:16px;margin:3px 0;color:#333;"><span style="color:#e8445e;margin-right:8px;">•</span>$1</div>');
    // Line breaks
    html = html.replace(/\n/g, "<br/>");
    // Clean up double <br/> after block elements  
    html = html.replace(/(<\/h[123]>)<br\/>/g, "$1");
    html = html.replace(/(<\/div>)<br\/>/g, "$1");
    html = html.replace(/(<hr[^>]*\/>)<br\/>/g, "$1");
    return html;
  };

  // ── Extract candidate info from chat answers ──
  const extractCandidateInfo = () => {
    if (chats.length === 0) return { name: "Unknown Candidate", details: "" };
    // Look through all answers for common name patterns
    const allText = chats.map(c => c.answer).join("\n");
    // Try to find candidate name mentioned in analysis
    let name = "Candidate";
    const namePatterns = [
      /candidate(?:'s| is| name is|,)\s+\*?\*?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,5})/i,
      /\*\*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,5})\*\*/,
      /name:\s*\*?\*?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,5})/i,
    ];
    for (const pattern of namePatterns) {
      const match = allText.match(pattern);
      if (match && match[1] && match[1].length < 60) {
        name = match[1].replace(/\*+/g, "").trim();
        break;
      }
    }
    // Try to extract skills and education
    let skills = "";
    const skillsMatch = allText.match(/(?:skills?|technologies|tech stack)[:\s]*([^\n.]+)/i);
    if (skillsMatch) skills = skillsMatch[1].replace(/\*+/g, "").trim().slice(0, 120);
    
    return { name, skills };
  };

  // ── Download as PDF Report (Dark Theme) ──
  const handleExportPdf = useCallback(() => {
    if (chats.length === 0 || exportingPdf) return;
    setExportingPdf(true);

    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const candidate = extractCandidateInfo();
    const resumeName = resumeFileName ? resumeFileName.replace(/\.pdf$/i, "") : "";

    let chatHTML = "";
    chats.forEach((chat, i) => {
      chatHTML += `
        <div class="qa-block">
          <div class="question-block">
            <p class="label">Question ${i + 1}</p>
            <p class="question-text">${chat.question}</p>
          </div>
          <div class="answer-block">
            ${markdownToHtml(chat.answer)}
          </div>
        </div>
      `;
    });

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Career Analysis Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #1a1a2e;
      padding: 40px 36px;
    }
    @media print {
      body { padding: 20px 24px; }
      .qa-block { page-break-inside: avoid; }
      .no-print { display: none !important; }
    }
    @page {
      size: A4;
      margin: 12mm 10mm;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 22px;
      border-bottom: 2px solid #c81e3a;
    }
    .header-icon {
      display: inline-block;
      background: linear-gradient(135deg, #c81e3a, #e8445e);
      padding: 8px 14px;
      border-radius: 12px;
      margin-bottom: 10px;
      font-size: 18px;
      color: white;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 700;
      color: #c81e3a;
      margin: 6px 0 4px;
      letter-spacing: -0.3px;
    }
    .header .subtitle {
      font-size: 11px;
      color: #888;
    }
    .candidate-card {
      background: #fef2f2;
      border: 1px solid rgba(200,30,58,0.2);
      border-radius: 12px;
      padding: 18px 22px;
      margin-bottom: 28px;
    }
    .candidate-card .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #999;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .candidate-card .name {
      font-size: 17px;
      font-weight: 700;
      color: #c81e3a;
      margin-bottom: 4px;
    }
    .candidate-card .detail {
      font-size: 11px;
      color: #555;
      margin-bottom: 2px;
    }
    .qa-block {
      margin-bottom: 22px;
    }
    .question-block {
      background: #fef2f2;
      border-left: 3px solid #e8445e;
      padding: 10px 16px;
      border-radius: 0 10px 10px 0;
      margin-bottom: 10px;
    }
    .question-block .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .question-text {
      font-size: 13px;
      color: #1a1a2e;
      font-weight: 500;
    }
    .answer-block {
      padding: 10px 16px;
      font-size: 12px;
      line-height: 1.8;
      color: #333;
    }
    .answer-block h1 { font-size: 16px; font-weight: 700; color: #c81e3a; margin: 16px 0 8px; }
    .answer-block h2 { font-size: 14px; font-weight: 700; color: #c81e3a; margin: 14px 0 6px; }
    .answer-block h3 { font-size: 13px; font-weight: 700; color: #e8445e; margin: 12px 0 6px; }
    .answer-block strong { color: #1a1a2e; font-weight: 700; }
    .answer-block em { color: #333; font-style: italic; }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      font-size: 9px;
      color: #aaa;
      letter-spacing: 0.5px;
    }
    .print-btn {
      display: block;
      margin: 0 auto 30px;
      padding: 10px 28px;
      font-size: 13px;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #c81e3a, #e8445e);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
    .print-btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">⬇ Save as PDF</button>

  <div class="header">
    <div class="header-icon">✦</div>
    <h1>AI Career Analysis Report</h1>
    <p class="subtitle">Generated on ${now} &bull; Powered by Gemini 2.5 Flash</p>
  </div>

  <div class="candidate-card">
    <p class="label">Candidate Profile</p>
    <p class="name">${candidate.name}</p>
    ${resumeName ? `<p class="detail">📄 Resume: ${resumeName}</p>` : ""}
    ${candidate.skills ? `<p class="detail">🛠 Key Skills: ${candidate.skills}</p>` : ""}
  </div>

  ${chatHTML}

  <div class="footer">
    AI Career Assistant &bull; Confidential Report &bull; ${new Date().getFullYear()}
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(fullHTML);
      printWindow.document.close();
      showToast("Report opened — use Save as PDF");
    } else {
      showToast("Please allow pop-ups to download the report");
    }
    setExportingPdf(false);
  }, [chats, exportingPdf, resumeFileName]);

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

      {/* Floating ambient particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: `rgba(232,68,94,${0.1 + Math.random() * 0.15})`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 40, 0],
              x: [0, (Math.random() - 0.5) * 20, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      <Toast show={toast} message={toastMessage} />

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
        className="w-72 flex flex-col flex-shrink-0 border-r relative z-10"
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
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #c81e3a, #e8445e)",
                  boxShadow: "0 0 20px rgba(200,30,58,0.3)",
                }}
                whileHover={{ rotate: [0, -10, 10, -4, 0], scale: 1.12 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles size={16} color="white" />
              </motion.div>
            </Magnetic>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm tracking-tight">
                Career Assistant
              </span>
              <span className="text-[9px]" style={{ color: "rgba(148,163,184,0.35)" }}>
                AI-Powered Analysis
              </span>
            </div>
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
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(200,30,58,0.15) transparent" }}>
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
                  exit={{
                    opacity: 0,
                    x: -20,
                    height: 0,
                    marginBottom: 0,
                    transition: { duration: 0.25 },
                  }}
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
                    onDelete={handleDeleteConversation}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Sign Out Button ── */}
          <motion.button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium"
            style={{
              background: "rgba(200,30,58,0.08)",
              border: "1px solid rgba(200,30,58,0.2)",
              color: "rgba(253,164,175,0.7)",
            }}
            whileHover={{
              backgroundColor: "rgba(200,30,58,0.18)",
              borderColor: "rgba(200,30,58,0.4)",
              color: "#fda4af",
              scale: 1.02,
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <motion.span
              style={{ display: "flex" }}
              whileHover={{ rotate: -15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <LogOut size={13} />
            </motion.span>
            Sign Out
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

          <div className="flex items-center gap-2">
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

            {/* Divider */}
            <div
              className="h-5 mx-1"
              style={{
                width: 1,
                background: "rgba(200,30,58,0.15)",
              }}
            />

            {/* Resume Preview toggle */}
            <GlassButton
              icon={Eye}
              label="Resume"
              active={showResumePanel}
              onClick={() => setShowResumePanel(!showResumePanel)}
            />

            {/* Clear Chat */}
            <GlassButton
              icon={RotateCcw}
              label="Clear"
              active={false}
              onClick={handleClearChat}
            />

            {/* Download PDF Report */}
            <GlassButton
              icon={Download}
              label="Report"
              active={exportingPdf}
              onClick={handleExportPdf}
              badge={chats.length > 0}
            />
          </div>
        </motion.header>

        {/* Content area — chat + optional resume panel */}
        <div className="flex-1 flex min-h-0">
          {/* Chat feed */}
          <div className="flex-1 flex flex-col min-w-0">
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
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
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
                          <Sparkles size={28} color="white" />
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
                        className="text-sm max-w-xs"
                        style={{ color: "rgba(148,163,184,0.45)" }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                      >
                        Upload a resume and ask anything — analysis, strengths,
                        recommendations, and more.
                      </motion.p>

                      {/* Feature hints */}
                      <motion.div
                        className="flex flex-wrap justify-center gap-2 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        {[
                          { icon: FileUp, text: "Upload Resume" },
                          { icon: Eye, text: "Preview PDF" },
                          { icon: Download, text: "Export Report" },
                        ].map(({ icon: Icon, text }, i) => (
                          <motion.div
                            key={text}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
                            style={{
                              background: "rgba(200,30,58,0.06)",
                              border: "1px solid rgba(200,30,58,0.12)",
                              color: "rgba(253,164,175,0.4)",
                            }}
                          >
                            <Icon size={10} />
                            {text}
                          </motion.div>
                        ))}
                      </motion.div>
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
                        className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ background: "rgba(200,30,58,0.18)" }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          style={{ display: "flex", color: "rgba(232,68,94,0.5)" }}
                        >
                          <Sparkles size={12} />
                        </motion.span>
                      </motion.div>
                      <div
                        className="flex-1 rounded-2xl rounded-tl-sm flex flex-col justify-center gap-2 px-5 py-4"
                        style={{
                          background: "rgba(10,3,6,0.6)",
                          border: "1px solid rgba(200,30,58,0.1)",
                          minHeight: 64,
                        }}
                      >
                        <ShimmerLine width="75%" delay={0} />
                        <ShimmerLine width="55%" delay={0.15} />
                        <ShimmerLine width="40%" delay={0.3} />
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

              {/* Suggested Question Chips */}
              <div className="max-w-2xl mx-auto">
                <AnimatePresence>
                  <SuggestedChips
                    onSelect={handleChipSelect}
                    visible={chats.length === 0 && !loading}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Resume Preview Panel ── */}
          <AnimatePresence>
            {showResumePanel && (
              <ResumePanel
                url={resumeUrl}
                fileName={resumeFileName}
                onClose={() => setShowResumePanel(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default Assistant;

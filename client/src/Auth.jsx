import React, { useState } from "react";
import axios from "axios";

function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? "/api/login" : "/api/register";

    try {
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, { email, password });

      if (isLogin) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        alert("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        position: "relative",
        overflow: "hidden",
        background: "#050505",
      }}
    >
      {/* ── Layered background matching Assistant ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), radial-gradient(68% 58% at 50% 50%, #c81e3a 0%, #a51d35 16%, #7d1a2f 32%, #591828 46%, #3c1722 60%, #2a151d 72%, #1f1317 84%, #141013 94%, #0a0a0a 100%), radial-gradient(90% 75% at 50% 50%, rgba(228,42,66,0.06) 0%, rgba(228,42,66,0) 55%), radial-gradient(150% 120% at 8% 8%, rgba(0,0,0,0) 42%, #0b0a0a 82%, #070707 100%), radial-gradient(150% 120% at 92% 92%, rgba(0,0,0,0) 42%, #0b0a0a 82%, #070707 100%), radial-gradient(60% 50% at 50% 60%, rgba(240,60,80,0.06), rgba(0,0,0,0) 60%), #050505",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
          opacity: 0.95,
        }}
      />

      {/* ── Animated floating orbs ── */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,30,58,0.12) 0%, transparent 70%)",
          top: "10%",
          left: "15%",
          filter: "blur(60px)",
          animation: "float1 8s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,68,94,0.1) 0%, transparent 70%)",
          bottom: "15%",
          right: "10%",
          filter: "blur(50px)",
          animation: "float2 10s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      {/* ── Auth Card ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          background: "rgba(12,4,7,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 24,
          border: "1px solid rgba(200,30,58,0.14)",
          padding: "2.5rem 2rem",
          boxShadow:
            "0 0 60px rgba(200,30,58,0.08), 0 24px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Logo icon ── */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, #c81e3a, #e8445e)",
              boxShadow: "0 0 36px rgba(200,30,58,0.32)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
          </div>
        </div>

        {/* ── Heading ── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            className="font-heading"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(148,163,184,0.45)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isLogin
              ? "Sign in to access your career insights"
              : "Join the AI-powered career revolution"}
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#fda4af",
                marginBottom: "0.5rem",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                background: "rgba(10,3,6,0.82)",
                border: `1px solid ${focusedField === "email" ? "rgba(200,30,58,0.55)" : "rgba(200,30,58,0.22)"}`,
                borderRadius: 14,
                color: "#e2e8f0",
                fontSize: "0.875rem",
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                transition: "all 0.2s ease",
                boxShadow: focusedField === "email"
                  ? "0 0 0 3px rgba(200,30,58,0.08), 0 0 24px rgba(200,30,58,0.1)"
                  : "none",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#fda4af",
                marginBottom: "0.5rem",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                background: "rgba(10,3,6,0.82)",
                border: `1px solid ${focusedField === "password" ? "rgba(200,30,58,0.55)" : "rgba(200,30,58,0.22)"}`,
                borderRadius: 14,
                color: "#e2e8f0",
                fontSize: "0.875rem",
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                transition: "all 0.2s ease",
                boxShadow: focusedField === "password"
                  ? "0 0 0 3px rgba(200,30,58,0.08), 0 0 24px rgba(200,30,58,0.1)"
                  : "none",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: loading
                ? "rgba(200,30,58,0.3)"
                : "linear-gradient(135deg, #c81e3a, #e8445e)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.02em",
              border: "none",
              borderRadius: 14,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.25s ease",
              boxShadow: loading ? "none" : "0 0 24px rgba(200,30,58,0.35)",
              opacity: loading ? 0.6 : 1,
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.boxShadow = "0 0 36px rgba(200,30,58,0.5)";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = loading ? "none" : "0 0 24px rgba(200,30,58,0.35)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* ── Divider ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            margin: "1.75rem 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(200,30,58,0.14)" }} />
          <span style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.3)", fontFamily: "'Inter', sans-serif" }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(200,30,58,0.14)" }} />
        </div>

        {/* ── Toggle ── */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: "none",
              border: "none",
              color: "#fb7185",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "color 0.2s ease",
              padding: "0.25rem 0",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#fda4af")}
            onMouseLeave={(e) => (e.target.style.color = "#fb7185")}
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
          </button>
        </div>
      </div>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 15px) scale(1.05); }
        }
        input::placeholder {
          color: rgba(148,163,184,0.3) !important;
        }
      `}</style>
    </div>
  );
}

export default Auth;
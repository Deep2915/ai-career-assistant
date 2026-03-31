import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import Assistant from "./Assistant";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // If no token exists, show the Auth (Login/Signup) page
  if (!token) {
    return <Auth setToken={setToken} />;
  }

  // If token exists, show the Assistant and the Logout button
  return <Assistant />;
}

export default App;
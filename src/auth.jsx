import { createContext, useContext, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function readUser() {
  try { return JSON.parse(localStorage.getItem("mc_user")); } catch (e) { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser());

  function saveSession(data) {
    try {
      localStorage.setItem("mc_token", data.token);
      localStorage.setItem("mc_user", JSON.stringify(data.user));
    } catch (e) {}
    setUser(data.user);
  }

  async function login(email, password, role) {
    saveSession(await api.post("/auth/login", { email, password, role }));
  }
  async function register(name, email, password) {
    saveSession(await api.post("/auth/register", { name, email, password }));
  }
  function logout() {
    try { localStorage.removeItem("mc_token"); localStorage.removeItem("mc_user"); } catch (e) {}
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

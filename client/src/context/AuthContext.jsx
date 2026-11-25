import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [config, setConfig] = useState({ allowDelete: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }

    let active = true;
    api
      .get("/auth/me")
      .then((data) => {
        if (!active) return;
        setAdmin(data.admin);
        setConfig(data.config ?? { allowDelete: false });
      })
      .catch(() => {
        if (active) {
          clearToken();
          setAdmin(null);
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      setAdmin(null);
      clearToken();
    };
    window.addEventListener("zyrava:unauthorized", handler);
    return () => window.removeEventListener("zyrava:unauthorized", handler);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      config,
      ready,
      async login(email, password) {
        const data = await api.post("/auth/login", { email, password });
        setToken(data.token);
        setAdmin(data.admin);
        setConfig(data.config ?? { allowDelete: false });
        return data;
      },
      logout() {
        clearToken();
        setAdmin(null);
      },
    }),
    [admin, config, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

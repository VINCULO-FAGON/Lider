import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserType = "estudiante" | "consumo_activo" | "en_tratamiento" | "reeducado" | "familiar";

export interface UserProfile {
  rut: string;
  name: string;
  userType: UserType;
  createdAt: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (rut: string, password: string) => Promise<void>;
  register: (rut: string, password: string, name: string, userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "@lider_users";
const SESSION_KEY = "@lider_session";

function normalizeRut(rut: string): string {
  return rut.replace(/[.\-]/g, "").toUpperCase().trim();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (rut: string, password: string) => {
    const normalized = normalizeRut(rut);
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: Record<string, { password: string; profile: UserProfile }> = usersRaw
      ? JSON.parse(usersRaw)
      : {};

    const record = users[normalized];
    if (!record) throw new Error("RUT no registrado. Por favor crea una cuenta.");
    if (record.password !== password) throw new Error("Clave incorrecta. Intenta nuevamente.");

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(record.profile));
    setUser(record.profile);
  };

  const register = async (rut: string, password: string, name: string, userType: UserType) => {
    const normalized = normalizeRut(rut);
    if (!normalized || normalized.length < 7) throw new Error("RUT inválido.");
    if (!password || password.length < 4) throw new Error("La clave debe tener al menos 4 caracteres.");
    if (!name || name.trim().length < 2) throw new Error("Ingresa tu nombre.");

    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: Record<string, { password: string; profile: UserProfile }> = usersRaw
      ? JSON.parse(usersRaw)
      : {};

    if (users[normalized]) throw new Error("Este RUT ya está registrado.");

    const profile: UserProfile = {
      rut: normalized,
      name: name.trim(),
      userType,
      createdAt: new Date().toISOString(),
    };

    users[normalized] = { password, profile };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    setUser(profile);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

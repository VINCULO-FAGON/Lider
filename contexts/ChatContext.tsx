import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

export interface EstadoEntry {
  id: string;
  date: string;
  period: "manana" | "noche";
  mood: number;
  ansiedad: number;
  cravings: number;
  sueno: number;
  situaciones: string[];
  observaciones: string;
  createdAt: string;
}

interface ChatContextValue {
  estadoEntries: EstadoEntry[];
  loadEstado: () => Promise<void>;
  saveEstado: (entry: Omit<EstadoEntry, "id" | "createdAt">) => Promise<EstadoEntry>;
  getLatestEstadoContext: () => string;
}

const ChatContext = createContext<ChatContextValue | null>(null);

let msgCounter = 0;
export function generateMsgId(): string {
  msgCounter++;
  return `msg-${Date.now()}-${msgCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [estadoEntries, setEstadoEntries] = useState<EstadoEntry[]>([]);

  const estadoKey = `@lider_estado_${user?.rut ?? "guest"}`;

  const loadEstado = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(estadoKey);
      if (raw) setEstadoEntries(JSON.parse(raw));
    } catch { }
  }, [estadoKey]);

  const saveEstado = useCallback(async (entry: Omit<EstadoEntry, "id" | "createdAt">) => {
    const newEntry: EstadoEntry = {
      ...entry,
      id: generateMsgId(),
      createdAt: new Date().toISOString(),
    };
    setEstadoEntries((prev) => {
      const updated = [newEntry, ...prev].slice(0, 60);
      AsyncStorage.setItem(estadoKey, JSON.stringify(updated)).catch(() => { });
      return updated;
    });
    return newEntry;
  }, [estadoKey]);

  const getLatestEstadoContext = useCallback(() => {
    if (estadoEntries.length === 0) return "";
    const latest = estadoEntries[0];
    const moodLabels = ["Muy mal", "Mal", "Regular", "Bien", "Muy bien"];
    return `
Fecha: ${latest.date}, Período: ${latest.period === "manana" ? "Mañana" : "Noche"}
Estado de ánimo: ${moodLabels[latest.mood - 1] || latest.mood}/5
Nivel de ansiedad: ${latest.ansiedad}/5
Nivel de cravings (deseo de consumo): ${latest.cravings}/5
Calidad del sueño: ${latest.sueno}/5
Situaciones marcadas: ${latest.situaciones.join(", ") || "Ninguna"}
Observaciones: ${latest.observaciones || "Sin observaciones"}
    `.trim();
  }, [estadoEntries]);

  const value = useMemo(() => ({
    estadoEntries,
    loadEstado,
    saveEstado,
    getLatestEstadoContext,
  }), [estadoEntries, loadEstado, saveEstado, getLatestEstadoContext]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

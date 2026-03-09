import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useChat, EstadoEntry } from "@/contexts/ChatContext";
import Colors from "@/constants/colors";

const SITUACIONES = [
  "Ansiedad alta",
  "Pensamientos negativos",
  "Craving intenso",
  "Discusión familiar",
  "Soledad",
  "Estrés laboral",
  "Tristeza",
  "Problemas económicos",
  "Buen día general",
  "Apoyo de otros",
  "Logré una meta",
  "Actividad física",
];

const MOOD_LABELS = ["Muy mal", "Mal", "Regular", "Bien", "Muy bien"];
const MOOD_COLORS = [Colors.danger, "#FF8C42", Colors.warning, Colors.success, Colors.accent];

function ScaleSelector({ value, onChange, label, color }: { value: number; onChange: (v: number) => void; label: string; color: string }) {
  return (
    <View style={scaleStyles.container}>
      <Text style={scaleStyles.label}>{label}</Text>
      <View style={scaleStyles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => {
              onChange(n);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              scaleStyles.dot,
              value >= n && { backgroundColor: color },
              pressed && { transform: [{ scale: 1.15 }] },
            ]}
          >
            <Text style={[scaleStyles.dotNum, value >= n && { color: Colors.bg }]}>{n}</Text>
          </Pressable>
        ))}
      </View>
      {value > 0 && (
        <Text style={[scaleStyles.valueLabel, { color }]}>
          {label === "Estado de ánimo" ? MOOD_LABELS[value - 1] : `${value}/5`}
        </Text>
      )}
    </View>
  );
}

const scaleStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  dot: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface3,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dotNum: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textMuted },
  valueLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 6 },
});

function HistoryCard({ entry, onPress }: { entry: EstadoEntry; onPress: () => void }) {
  const moodColor = MOOD_COLORS[entry.mood - 1] || Colors.textMuted;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [histStyles.card, pressed && { opacity: 0.85 }]}>
      <View style={histStyles.row}>
        <View style={[histStyles.periodBadge, { backgroundColor: entry.period === "manana" ? Colors.goldDim : Colors.accentDim2 }]}>
          <Ionicons name={entry.period === "manana" ? "sunny-outline" : "moon-outline"} size={13} color={entry.period === "manana" ? Colors.gold : Colors.accent} />
          <Text style={[histStyles.periodText, { color: entry.period === "manana" ? Colors.gold : Colors.accent }]}>
            {entry.period === "manana" ? "Mañana" : "Noche"}
          </Text>
        </View>
        <Text style={histStyles.date}>{entry.date}</Text>
      </View>
      <View style={histStyles.metrics}>
        {[
          { label: "Ánimo", val: entry.mood, color: moodColor },
          { label: "Ansiedad", val: entry.ansiedad, color: Colors.warning },
          { label: "Cravings", val: entry.cravings, color: Colors.danger },
          { label: "Sueño", val: entry.sueno, color: Colors.accent },
        ].map((m) => (
          <View key={m.label} style={histStyles.metricItem}>
            <Text style={[histStyles.metricVal, { color: m.color }]}>{m.val}</Text>
            <Text style={histStyles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
      {entry.situaciones.length > 0 && (
        <View style={histStyles.tagsRow}>
          {entry.situaciones.slice(0, 3).map((s) => (
            <View key={s} style={histStyles.tag}>
              <Text style={histStyles.tagText}>{s}</Text>
            </View>
          ))}
          {entry.situaciones.length > 3 && (
            <Text style={histStyles.moreText}>+{entry.situaciones.length - 3}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const histStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  periodBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  periodText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  date: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  metrics: { flexDirection: "row", gap: 16, marginBottom: 8 },
  metricItem: { alignItems: "center" },
  metricVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { backgroundColor: Colors.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  moreText: { fontSize: 11, color: Colors.textMuted, fontFamily: "Inter_400Regular", marginTop: 4 },
});

type Period = "manana" | "noche";

export default function EstadoScreen() {
  const insets = useSafeAreaInsets();
  const { estadoEntries, saveEstado, loadEstado } = useChat();
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState<Period>("manana");
  const [mood, setMood] = useState(3);
  const [ansiedad, setAnsiedad] = useState(2);
  const [cravings, setCravings] = useState(1);
  const [sueno, setSueno] = useState(3);
  const [selectedSits, setSelectedSits] = useState<string[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  useEffect(() => { loadEstado(); }, []);

  const toggleSituacion = (s: string) => {
    setSelectedSits((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getToday = () => {
    const now = new Date();
    return now.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveEstado({ date: getToday(), period, mood, ansiedad, cravings, sueno, situaciones: selectedSits, observaciones });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowForm(false);
      setObservaciones("");
      setSelectedSits([]);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el estado");
    } finally {
      setSaving(false);
    }
  }, [period, mood, ansiedad, cravings, sueno, selectedSits, observaciones]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.header}>
        <View>
          <Text style={styles.title}>Toma de Estado</Text>
          <Text style={styles.subtitle}>Registra cómo te sientes hoy</Text>
        </View>
        <Pressable
          onPress={() => {
            setShowForm(!showForm);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.85 }]}
        >
          <LinearGradient colors={[Colors.accent, "#00B894"]} style={styles.newBtnGrad}>
            <Ionicons name={showForm ? "close" : "add"} size={22} color={Colors.bg} />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {showForm && (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.form}>
          <View style={styles.periodRow}>
            {(["manana", "noche"] as Period[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => { setPeriod(p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              >
                <Ionicons
                  name={p === "manana" ? "sunny-outline" : "moon-outline"}
                  size={18}
                  color={period === p ? Colors.bg : Colors.textMuted}
                />
                <Text style={[styles.periodBtnText, period === p && { color: Colors.bg }]}>
                  {p === "manana" ? "Mañana" : "Noche"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.formDate}>{getToday()}</Text>

          <ScaleSelector value={mood} onChange={setMood} label="Estado de ánimo" color={MOOD_COLORS[mood - 1] || Colors.accent} />
          <ScaleSelector value={ansiedad} onChange={setAnsiedad} label="Nivel de ansiedad" color={Colors.warning} />
          <ScaleSelector value={cravings} onChange={setCravings} label="Intensidad de cravings" color={Colors.danger} />
          <ScaleSelector value={sueno} onChange={setSueno} label="Calidad del sueño" color={Colors.accent} />

          <Text style={styles.sitsLabel}>Situaciones del día</Text>
          <View style={styles.sitsGrid}>
            {SITUACIONES.map((s) => (
              <Pressable
                key={s}
                onPress={() => toggleSituacion(s)}
                style={[styles.sitChip, selectedSits.includes(s) && styles.sitChipActive]}
              >
                <Text style={[styles.sitChipText, selectedSits.includes(s) && { color: Colors.accent }]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.obsLabel}>Observaciones</Text>
          <TextInput
            style={styles.obsInput}
            placeholder="¿Algo que quieras recordar o compartir con LÍDER?"
            placeholderTextColor={Colors.textMuted}
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={4}
          />

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
          >
            <LinearGradient colors={[Colors.accent, "#00B894"]} style={styles.saveBtnGrad}>
              {saving ? (
                <Text style={styles.saveBtnText}>Guardando...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.bg} />
                  <Text style={styles.saveBtnText}>Guardar estado</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => {
              router.push("/(tabs)/chat");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            style={styles.talkToLiderBtn}
          >
            <View style={styles.talkToLiderRow}>
              <Ionicons name="chatbubbles-outline" size={18} color={Colors.accent} />
              <Text style={styles.talkToLiderText}>Compartir con LÍDER</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
            </View>
          </Pressable>
        </Animated.View>
      )}

      {estadoEntries.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.histTitle}>Historial</Text>
          {estadoEntries.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onPress={() => { }}
            />
          ))}
        </Animated.View>
      ) : !showForm ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Sin registros aún</Text>
          <Text style={styles.emptyDesc}>Toca el botón "+" para registrar tu primer estado del día</Text>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  container: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  newBtn: { borderRadius: 16, overflow: "hidden", shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  newBtnGrad: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  periodBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 12, borderRadius: 14, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border },
  periodBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  periodBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  formDate: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginBottom: 20, textAlign: "center", textTransform: "capitalize" },
  sitsLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginBottom: 10 },
  sitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  sitChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border },
  sitChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim2 },
  sitChipText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  obsLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginBottom: 10 },
  obsInput: { backgroundColor: Colors.surface2, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, color: Colors.text, fontSize: 15, fontFamily: "Inter_400Regular", padding: 14, minHeight: 100, textAlignVertical: "top", marginBottom: 20 },
  saveBtn: { borderRadius: 16, overflow: "hidden", shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginBottom: 14 },
  saveBtnGrad: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.bg },
  talkToLiderBtn: { alignItems: "center" },
  talkToLiderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  talkToLiderText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.accent },
  histTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 14 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
});

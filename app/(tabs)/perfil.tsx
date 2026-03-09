import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useAuth, UserType } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import Colors from "@/constants/colors";

const USER_TYPE_LABELS: Record<UserType, string> = {
  estudiante: "Estudiante / Curioso",
  consumo_activo: "Consumo activo",
  en_tratamiento: "En tratamiento",
  reeducado: "Reeducado",
  familiar: "Familiar / Cercano",
};

const USER_TYPE_COLORS: Record<UserType, string> = {
  estudiante: Colors.accent,
  consumo_activo: Colors.danger,
  en_tratamiento: Colors.warning,
  reeducado: Colors.success,
  familiar: Colors.gold,
};

const CAPACIDADES = [
  { key: "Confianza", desc: "Confiar en uno mismo y en los demás con optimismo" },
  { key: "Autonomía", desc: "Autocontrolarse y valerse por sí mismo" },
  { key: "Iniciativa", desc: "Encauzar energías por senderos productivos" },
  { key: "Industriosidad", desc: "Hacer las cosas bien hechas, con destreza" },
  { key: "Identidad", desc: "Ser uno mismo consistentemente" },
  { key: "Compromiso", desc: "Cumplir con lo prometido, con responsabilidad" },
  { key: "Generosidad", desc: "Enseñar con el buen ejemplo" },
  { key: "Trascendencia", desc: "Superar límites y contratiempos" },
];

const TCC_PILLARS = [
  { icon: "bulb-outline", title: "Pensamiento", desc: "Identificar pensamientos automáticos negativos y reestructurarlos" },
  { icon: "heart-outline", title: "Emoción", desc: "Regular emociones y desarrollar tolerancia al malestar" },
  { icon: "walk-outline", title: "Conducta", desc: "Cambiar patrones conductuales hacia el bienestar" },
];

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { estadoEntries } = useChat();
  const [showCapacidades, setShowCapacidades] = useState(false);
  const [showTCC, setShowTCC] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const typeColor = user ? USER_TYPE_COLORS[user.userType] : Colors.accent;

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Deseas cerrar tu sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert("Sin chat", "El chat con LÍDER ha sido deshabilitado.", [
      { text: "OK", style: "default" },
    ]);
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-CL", { month: "long", year: "numeric" })
    : "";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(50).duration(400)}>
        <View style={styles.profileCard}>
          <LinearGradient colors={[`${typeColor}30`, Colors.surface2]} style={styles.profileCardGrad}>
            <LinearGradient colors={[typeColor, Colors.surface3]} style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? "U"}</Text>
            </LinearGradient>
            <Text style={styles.profileName}>{user?.name}</Text>
            <View style={[styles.profileTypeBadge, { backgroundColor: `${typeColor}20` }]}>
              <View style={[styles.profileTypeDot, { backgroundColor: typeColor }]} />
              <Text style={[styles.profileTypeLabel, { color: typeColor }]}>
                {user ? USER_TYPE_LABELS[user.userType] : ""}
              </Text>
            </View>
            <Text style={styles.profileRut}>RUT: {user?.rut ?? ""}</Text>
            {memberSince ? (
              <Text style={styles.profileSince}>Miembro desde {memberSince}</Text>
            ) : null}
          </LinearGradient>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.statsRow}>
          {[
            { label: "Mensajes con LÍDER", value: messages.length, icon: "chatbubbles-outline", color: Colors.accent },
            { label: "Registros de estado", value: estadoEntries.length, icon: "heart-outline", color: Colors.gold },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={22} color={s.color} style={{ marginBottom: 8 }} />
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <Pressable
          style={[styles.accordion, showCapacidades && styles.accordionOpen]}
          onPress={() => { setShowCapacidades(!showCapacidades); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <View style={styles.accordionLeft}>
            <View style={[styles.accordionIcon, { backgroundColor: Colors.accentDim }]}>
              <Ionicons name="star-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.accordionTitle}>8 Capacidades del Carácter</Text>
          </View>
          <Ionicons name={showCapacidades ? "chevron-up" : "chevron-down"} size={18} color={Colors.textMuted} />
        </Pressable>
        {showCapacidades && (
          <View style={styles.accordionContent}>
            {CAPACIDADES.map((c, i) => (
              <Animated.View key={c.key} entering={FadeInDown.delay(i * 40).duration(300)}>
                <View style={styles.capacidadItem}>
                  <View style={styles.capacidadNum}>
                    <Text style={styles.capacidadNumText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.capacidadName}>{c.key}</Text>
                    <Text style={styles.capacidadDesc}>{c.desc}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Pressable
          style={[styles.accordion, showTCC && styles.accordionOpen]}
          onPress={() => { setShowTCC(!showTCC); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <View style={styles.accordionLeft}>
            <View style={[styles.accordionIcon, { backgroundColor: Colors.goldDim }]}>
              <Ionicons name="flask-outline" size={18} color={Colors.gold} />
            </View>
            <Text style={styles.accordionTitle}>Filosofía TCC de LÍDER</Text>
          </View>
          <Ionicons name={showTCC ? "chevron-up" : "chevron-down"} size={18} color={Colors.textMuted} />
        </Pressable>
        {showTCC && (
          <View style={styles.accordionContent}>
            <View style={styles.yoDecretoBox}>
              <Ionicons name="flash" size={20} color={Colors.gold} style={{ marginBottom: 8 }} />
              <Text style={styles.yoDecretoTitle}>Filosofía Yo Decreto</Text>
              <Text style={styles.yoDecretoText}>
                Cada individuo nace con dignidad y orgullo propio. Como una planta que hay que cultivar, nuestro carácter crece cuando nos ayudamos mutuamente.
              </Text>
            </View>
            {TCC_PILLARS.map((p, i) => (
              <Animated.View key={p.title} entering={FadeInDown.delay(i * 60).duration(300)}>
                <View style={styles.tccPillar}>
                  <Ionicons name={p.icon as any} size={22} color={Colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tccTitle}>{p.title}</Text>
                    <Text style={styles.tccDesc}>{p.desc}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            LÍDER es gratuita y confidencial. Tu información se almacena solo en tu dispositivo. No compartimos datos con terceros.
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.actionsSection}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          onPress={handleClearData}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.warningDim }]}>
            <Ionicons name="trash-outline" size={18} color={Colors.warning} />
          </View>
          <Text style={[styles.actionText, { color: Colors.warning }]}>Borrar historial de chat</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          onPress={handleLogout}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.dangerDim }]}>
            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          </View>
          <Text style={[styles.actionText, { color: Colors.danger }]}>Cerrar sesión</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </Pressable>
      </Animated.View>

      <Text style={styles.versionText}>LÍDER v1.0.0 — App gratuita de apoyo</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  container: { paddingHorizontal: 20 },
  profileCard: { borderRadius: 24, overflow: "hidden", marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  profileCardGrad: { padding: 28, alignItems: "center" },
  avatarLarge: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  avatarText: { fontSize: 36, fontFamily: "Inter_700Bold", color: Colors.text },
  profileName: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
  profileTypeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, gap: 7, marginBottom: 10 },
  profileTypeDot: { width: 8, height: 8, borderRadius: 4 },
  profileTypeLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  profileRut: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginBottom: 4 },
  profileSince: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, textTransform: "capitalize" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 18, padding: 16, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center", marginTop: 2 },
  accordion: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  accordionOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0, borderBottomWidth: 0 },
  accordionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  accordionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  accordionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  accordionContent: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 16, marginBottom: 10 },
  capacidadItem: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 14 },
  capacidadNum: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.accentDim, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  capacidadNumText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.accent },
  capacidadName: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 2 },
  capacidadDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, lineHeight: 17 },
  yoDecretoBox: { backgroundColor: Colors.goldDim, borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 14 },
  yoDecretoTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.gold, marginBottom: 6 },
  yoDecretoText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center", lineHeight: 19 },
  tccPillar: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 14 },
  tccTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 2 },
  tccDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, lineHeight: 17 },
  infoCard: { backgroundColor: Colors.surface2, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, flex: 1, lineHeight: 18 },
  actionsSection: { gap: 8, marginBottom: 20 },
  actionBtn: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: Colors.border },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  versionText: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, opacity: 0.6 },
});

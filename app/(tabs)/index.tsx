import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useAuth, UserType } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import Colors from "@/constants/colors";

const USER_TYPE_LABELS: Record<UserType, string> = {
  estudiante: "Estudiante",
  consumo_activo: "Consumo activo",
  en_tratamiento: "En tratamiento",
  reeducado: "Reeducado",
  familiar: "Familiar",
};

const USER_TYPE_COLORS: Record<UserType, string> = {
  estudiante: Colors.accent,
  consumo_activo: Colors.danger,
  en_tratamiento: Colors.warning,
  reeducado: Colors.success,
  familiar: Colors.gold,
};

const MOTIVATIONAL_PHRASES = [
  "Cada día sin consumo es una victoria. Hoy es ese día.",
  "La dignidad no se pierde, se reconstruye.",
  "El liderazgo comienza cuando decides cambiar.",
  "Tienes más fuerza de la que imaginas.",
  "Renacer es posible. Ya comenzaste.",
  "Tu historia no termina aquí. Apenas empieza.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getDateStr(): string {
  const now = new Date();
  return now.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
}

const QUICK_ACTIONS = [
  { icon: "chatbubbles", label: "Hablar con\nLÍDER", route: "/(tabs)/chat", color: Colors.accent, glow: Colors.accent },
  { icon: "heart", label: "Tomar\nEstado", route: "/(tabs)/estado", color: Colors.gold, glow: Colors.gold },
  { icon: "book-outline", label: "Mis\nRegistros", route: "/(tabs)/estado", color: Colors.warning, glow: Colors.warning },
  { icon: "person", label: "Mi\nPerfil", route: "/(tabs)/perfil", color: Colors.success, glow: Colors.success },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { estadoEntries, loadEstado, messages } = useChat();
  const [phrase] = useState(() => MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]);

  useEffect(() => {
    loadEstado();
  }, []);

  const latest = estadoEntries[0];
  const moodEmojis = ["", "😞", "😔", "😐", "🙂", "😊"];
  const typeColor = user ? USER_TYPE_COLORS[user.userType] : Colors.accent;

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <ScrollView
      style={[styles.root]}
      contentContainerStyle={[styles.container, { paddingTop: topPad + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["rgba(0,229,180,0.06)", "transparent"]}
        style={styles.bgGlow}
      />

      <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name ?? "Usuario"}</Text>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
            <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
            <Text style={[styles.typeLabel, { color: typeColor }]}>
              {user ? USER_TYPE_LABELS[user.userType] : ""}
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.avatarBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/perfil");
          }}
        >
          <LinearGradient
            colors={[typeColor, Colors.surface3]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? "U"}</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <View style={styles.phraseCard}>
          <View style={styles.phraseAccent} />
          <Ionicons name="flash" size={20} color={Colors.gold} style={{ marginBottom: 8 }} />
          <Text style={styles.phraseText}>{phrase}</Text>
          <Text style={styles.phraseDate}>{getDateStr()}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <Text style={styles.sectionTitle}>Acceso rápido</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action, i) => (
            <Animated.View key={action.label} entering={FadeInDown.delay(200 + i * 60).duration(400)}>
              <Pressable
                style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push(action.route as any);
                }}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={26} color={action.color} />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {latest ? (
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Text style={styles.sectionTitle}>Último registro</Text>
          <Pressable
            style={({ pressed }) => [styles.estadoCard, pressed && { opacity: 0.9 }]}
            onPress={() => router.push("/(tabs)/estado")}
          >
            <LinearGradient
              colors={[Colors.surface, Colors.surface2]}
              style={styles.estadoCardGrad}
            >
              <View style={styles.estadoCardRow}>
                <View>
                  <Text style={styles.estadoDate}>
                    {latest.period === "manana" ? "Mañana" : "Noche"} — {latest.date}
                  </Text>
                  <Text style={styles.estadoMood}>Estado {moodEmojis[latest.mood]}</Text>
                </View>
                <View style={styles.estadoMetrics}>
                  {[
                    { label: "Ánimo", val: latest.mood },
                    { label: "Ansiedad", val: latest.ansiedad },
                    { label: "Cravings", val: latest.cravings },
                  ].map((m) => (
                    <View key={m.label} style={styles.metricDot}>
                      <Text style={styles.metricVal}>{m.val}</Text>
                      <Text style={styles.metricLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {latest.observaciones ? (
                <Text style={styles.estadoObs} numberOfLines={2}>{latest.observaciones}</Text>
              ) : null}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Pressable
            style={({ pressed }) => [styles.ctaCard, pressed && { opacity: 0.9 }]}
            onPress={() => router.push("/(tabs)/estado")}
          >
            <LinearGradient
              colors={[Colors.goldDim, "transparent"]}
              style={styles.ctaGrad}
            >
              <Ionicons name="heart-outline" size={32} color={Colors.gold} />
              <Text style={styles.ctaTitle}>Registra tu estado</Text>
              <Text style={styles.ctaDesc}>
                Haz tu primera toma de estado y LÍDER te acompañará mejor.
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(450).duration(500)}>
        <Pressable
          style={({ pressed }) => [styles.liderCta, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(tabs)/chat");
          }}
        >
          <LinearGradient
            colors={["rgba(0,229,180,0.15)", "rgba(0,229,180,0.04)"]}
            style={styles.liderCtaGrad}
          >
            <View style={styles.liderCtaLeft}>
              <View style={styles.liderCtaIconBox}>
                <Ionicons name="flash" size={24} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.liderCtaTitle}>Habla con LÍDER</Text>
                <Text style={styles.liderCtaSubtitle}>
                  {messages.length > 0 ? `${messages.length} mensajes guardados` : "Inicia tu primera conversación"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.accent} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  container: { paddingHorizontal: 20 },
  bgGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  userName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginTop: 2,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  typeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  avatarBtn: {
    marginLeft: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  phraseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  phraseAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  phraseText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    lineHeight: 24,
    marginLeft: 4,
  },
  phraseDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 8,
    marginLeft: 4,
    textTransform: "capitalize",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  quickBtn: {
    width: 76,
    alignItems: "center",
    gap: 8,
  },
  quickIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  estadoCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  estadoCardGrad: {
    padding: 18,
  },
  estadoCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  estadoDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  estadoMood: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  estadoMetrics: {
    flexDirection: "row",
    gap: 12,
  },
  metricDot: {
    alignItems: "center",
  },
  metricVal: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  estadoObs: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  ctaCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${Colors.gold}30`,
  },
  ctaGrad: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  ctaTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  ctaDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
  liderCta: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: `${Colors.accent}30`,
  },
  liderCtaGrad: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liderCtaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  liderCtaIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  liderCtaTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 2,
  },
  liderCtaSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});

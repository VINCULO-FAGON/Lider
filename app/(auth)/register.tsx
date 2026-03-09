import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth, UserType } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

const USER_TYPES: { key: UserType; label: string; icon: string; desc: string }[] = [
  { key: "estudiante", label: "Estudiante / Curioso", icon: "school-outline", desc: "Busco información preventiva" },
  { key: "consumo_activo", label: "Consumo activo", icon: "alert-circle-outline", desc: "Actualmente consumo" },
  { key: "en_tratamiento", label: "En tratamiento", icon: "medkit-outline", desc: "En proceso de rehabilitación" },
  { key: "reeducado", label: "Reeducado", icon: "ribbon-outline", desc: "Superé mi adicción" },
  { key: "familiar", label: "Familiar / Cercano", icon: "people-outline", desc: "Apoyo a un ser querido" },
];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [userType, setUserType] = useState<UserType>("estudiante");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rutRef = useRef<TextInput>(null);
  const passRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (password !== confirmPass) {
      setError("Las claves no coinciden.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(rut.trim(), password, name, userType);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "Error al crear cuenta");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionLabel}>Datos personales</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => rutRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>RUT</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={rutRef}
                style={styles.input}
                placeholder="12.345.678-9"
                placeholderTextColor={Colors.textMuted}
                value={rut}
                onChangeText={setRut}
                autoCapitalize="characters"
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Clave Secreta</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={passRef}
                style={[styles.input, { flex: 1 }]}
                placeholder="Mínimo 4 caracteres"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                blurOnSubmit={false}
              />
              <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? "eye-outline" : "eye-off-outline"} size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar Clave</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={confirmRef}
                style={styles.input}
                placeholder="Repite tu clave"
                placeholderTextColor={Colors.textMuted}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: Colors.gold }]} />
            <Text style={styles.sectionLabel}>Yo soy...</Text>
          </View>
          <Text style={styles.typeSubtitle}>Selecciona tu situación actual</Text>
          {USER_TYPES.map((ut) => (
            <Pressable
              key={ut.key}
              style={[styles.typeOption, userType === ut.key && styles.typeOptionSelected]}
              onPress={() => {
                setUserType(ut.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[styles.typeIconBox, userType === ut.key && styles.typeIconBoxSelected]}>
                <Ionicons name={ut.icon as any} size={22} color={userType === ut.key ? Colors.bg : Colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.typeName, userType === ut.key && { color: Colors.accent }]}>{ut.label}</Text>
                <Text style={styles.typeDesc}>{ut.desc}</Text>
              </View>
              {userType === ut.key && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
              )}
            </Pressable>
          ))}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.85 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <LinearGradient
            colors={[Colors.accent, "#00B894"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.registerBtnGrad}
          >
            {loading ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <>
                <Text style={styles.registerBtnText}>Crear cuenta gratuita</Text>
                <Ionicons name="flash" size={20} color={Colors.bg} />
              </>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.footerLink}> Iniciar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 7,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: {
    padding: 6,
  },
  typeSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
    marginTop: -8,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  typeOptionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim2,
  },
  typeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconBoxSelected: {
    backgroundColor: Colors.accent,
  },
  typeName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 2,
  },
  typeDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dangerDim,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  registerBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  registerBtnGrad: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  registerBtnText: {
    color: Colors.bg,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 8,
    alignItems: "center",
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  footerLink: {
    color: Colors.accent,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});

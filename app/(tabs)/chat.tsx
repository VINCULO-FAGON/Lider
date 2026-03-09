import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Clipboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { fetch } from "expo/fetch";
import { getApiUrl } from "@/lib/query-client";
import { useChat, generateMsgId, ChatMessage } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

let ttsCounter = 0;

function TypingIndicator() {
  return (
    <View style={styles.typingRow}>
      <View style={styles.aiBubbleHeader}>
        <View style={styles.aiAvatarSmall}>
          <Ionicons name="flash" size={12} color={Colors.bg} />
        </View>
        <Text style={styles.aiBubbleName}>LÍDER</Text>
      </View>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              entering={FadeIn.delay(i * 150).duration(300)}
              style={[styles.typingDot]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function MessageBubble({ message, onSpeak, onCopy }: { message: ChatMessage; onSpeak: (text: string) => void; onCopy: (text: string) => void }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <Animated.View entering={FadeInUp.duration(300)} style={styles.userBubbleWrap}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.content}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.aiBubbleWrap}>
      <View style={styles.aiBubbleHeader}>
        <LinearGradient
          colors={[Colors.accent, Colors.gold]}
          style={styles.aiAvatarSmall}
        >
          <Ionicons name="flash" size={12} color={Colors.bg} />
        </LinearGradient>
        <Text style={styles.aiBubbleName}>LÍDER</Text>
      </View>
      <View style={styles.aiBubble}>
        <Text style={styles.aiBubbleText}>{message.content}</Text>
        <View style={styles.bubbleActions}>
          <Pressable
            onPress={() => onSpeak(message.content)}
            style={({ pressed }) => [styles.bubbleActionBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="volume-high-outline" size={15} color={Colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => onCopy(message.content)}
            style={({ pressed }) => [styles.bubbleActionBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="copy-outline" size={15} color={Colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { messages, setMessages, isStreaming, setIsStreaming, showTyping, setShowTyping, loadMessages, addMessage, clearMessages, getLatestEstadoContext, loadEstado } = useChat();
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const initializedRef = useRef(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      loadMessages();
      loadEstado();
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const currentMessages = [...messages];
    const userMsg: ChatMessage = { id: generateMsgId(), role: "user", content: text, createdAt: new Date().toISOString() };

    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setShowTyping(true);
    inputRef.current?.focus();

    try {
      const estadoCtx = getLatestEstadoContext();
      const apiMessages = [
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ messages: apiMessages, estadoContext: estadoCtx }),
      });

      if (!response.ok) throw new Error("Error de conexión");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Sin respuesta");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let assistantAdded = false;
      const assistantId = generateMsgId();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              if (!assistantAdded) {
                setShowTyping(false);
                setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: fullContent, createdAt: new Date().toISOString() }]);
                assistantAdded = true;
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullContent };
                  return updated;
                });
              }
            }
          } catch { }
        }
      }

      const allMessages = [...currentMessages, userMsg, { id: assistantId, role: "assistant" as const, content: fullContent, createdAt: new Date().toISOString() }];
      const key = `@lider_messages_${user?.rut ?? "guest"}`;
      await AsyncStorage.setItem(key, JSON.stringify(allMessages));

    } catch (err) {
      setShowTyping(false);
      const errorMsg: ChatMessage = { id: generateMsgId(), role: "assistant", content: "Lo siento, tuve un problema de conexión. Intenta nuevamente.", createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
    }
  }, [input, messages, isStreaming, getLatestEstadoContext]);

  const handleSpeak = useCallback(async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("TTS error");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let buffer = "";
      const audioChunks: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.audio) audioChunks.push(parsed.audio);
          } catch { }
        }
      }
      if (audioChunks.length > 0 && Platform.OS === "web") {
        const combined = audioChunks.join("");
        const bytes = Uint8Array.from(atob(combined), c => c.charCodeAt(0));
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buf = ctx.createBuffer(1, bytes.length / 2, 24000);
        const ch = buf.getChannelData(0);
        const view = new Int16Array(bytes.buffer);
        for (let i = 0; i < view.length; i++) ch[i] = view[i] / 32768;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.onended = () => setIsSpeaking(false);
        src.start();
        return;
      }
    } catch (e) {
      console.error("TTS failed:", e);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const handleCopy = useCallback((text: string) => {
    Clipboard.setString(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, base64: false });
      if (!result.canceled && result.assets[0]) {
        const userMsg: ChatMessage = {
          id: generateMsgId(),
          role: "user",
          content: "[Imagen compartida]",
          createdAt: new Date().toISOString(),
        };
        addMessage(userMsg);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo cargar el archivo");
    }
  }, [addMessage]);

  const handleClearChat = () => {
    Alert.alert("Limpiar conversación", "¿Deseas borrar todo el historial de mensajes?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar", style: "destructive", onPress: () => {
          clearMessages();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      },
    ]);
  };

  const handleMicrophone = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Micrófono", "Característica de voice chat en desarrollo. Por ahora, escribe tu mensaje.");
    setIsRecording(false);
  }, [isRecording]);

  const reversed = [...messages].reverse();

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} onSpeak={handleSpeak} onCopy={handleCopy} />
  ), [handleSpeak, handleCopy]);

  const EmptyChat = () => (
    <View style={styles.emptyChat}>
      <LinearGradient colors={[Colors.accentDim, "transparent"]} style={styles.emptyChatGlow} />
      <LinearGradient colors={[Colors.accent, Colors.gold]} style={styles.emptyChatIcon}>
        <Ionicons name="flash" size={36} color={Colors.bg} />
      </LinearGradient>
      <Text style={styles.emptyChatTitle}>Hola, soy LÍDER</Text>
      <Text style={styles.emptyChatText}>
        Tu acompañante de IA especializado en rehabilitación y prevención. Estoy aquí para apoyarte con honestidad y sin juicio.
      </Text>
      <View style={styles.emptyChatBadge}>
        <View style={[styles.emptyChatDot, { backgroundColor: Colors.success }]} />
        <Text style={styles.emptyChatBadgeText}>Disponible 24/7 · Confidencial · Gratuito</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <LinearGradient colors={[Colors.accent, Colors.gold]} style={styles.headerAvatar}>
          <Ionicons name="flash" size={20} color={Colors.bg} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>LÍDER</Text>
          <View style={styles.headerStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.headerStatusText}>Inteligencia Artificial activa</Text>
          </View>
        </View>
        <Pressable onPress={handleClearChat} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>

      <FlatList
        data={reversed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted={messages.length > 0}
        ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
        ListEmptyComponent={<EmptyChat />}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.inputArea, { paddingBottom: bottomPad + 8 }]}>
        <View style={styles.inputRow}>
          <Pressable onPress={handlePickFile} style={styles.inputActionBtn} disabled={isStreaming}>
            <Ionicons name="attach-outline" size={20} color={Colors.textMuted} />
          </Pressable>
          <Pressable 
            onPress={handleMicrophone} 
            style={[styles.inputActionBtn, isRecording && styles.inputActionBtnActive]}
            disabled={isStreaming}
          >
            <Ionicons name={isRecording ? "mic" : "mic-outline"} size={20} color={isRecording ? Colors.accent : Colors.textMuted} />
          </Pressable>
          <View style={styles.inputBox}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Escribe a LÍDER..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              blurOnSubmit={false}
              returnKeyType="default"
            />
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSend();
            }}
            disabled={!input.trim() || isStreaming}
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || isStreaming) && styles.sendBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            {isStreaming ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Ionicons name="send" size={20} color={Colors.bg} />
            )}
          </Pressable>
        </View>
        {isSpeaking && (
          <View style={styles.speakingBanner}>
            <Ionicons name="volume-high" size={14} color={Colors.accent} />
            <Text style={styles.speakingText}>LÍDER está hablando...</Text>
          </View>
        )}
        {isRecording && (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingPulse} />
            <Text style={styles.recordingText}>Grabando audio...</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    letterSpacing: 1,
  },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  headerStatusText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  clearBtn: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
    position: "relative",
    overflow: "hidden",
  },
  emptyChatGlow: {
    position: "absolute",
    top: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyChatTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 12,
  },
  emptyChatText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyChatBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyChatDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  emptyChatBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  userBubbleWrap: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    maxWidth: "82%",
  },
  userBubbleText: {
    color: Colors.bg,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  aiBubbleWrap: {
    alignItems: "flex-start",
    marginBottom: 16,
    maxWidth: "90%",
  },
  aiBubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 7,
  },
  aiAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBubbleName: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
    letterSpacing: 1,
  },
  aiBubble: {
    backgroundColor: Colors.surface2,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  aiBubbleText: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
    marginBottom: 8,
  },
  bubbleActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
  },
  bubbleActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface3,
  },
  typingRow: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: Colors.surface2,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  inputArea: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  inputActionBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  inputActionBtnActive: {
    backgroundColor: Colors.surface3,
    borderRadius: 8,
  },
  inputBox: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  textInput: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surface3,
    shadowOpacity: 0,
    elevation: 0,
  },
  speakingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 6,
  },
  speakingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.accent,
  },
  recordingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
  },
  recordingPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    opacity: 0.7,
  },
  recordingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.accent,
  },
});

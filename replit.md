# LÍDER — App de Rehabilitación y Prevención de Drogas

## Descripción
Aplicación móvil gratuita de apoyo en rehabilitación y prevención de drogas con IA especializada llamada "LÍDER". Basada en filosofía TCC y "Yo Decreto" de la Comunidad.

## Stack
- **Frontend**: Expo Router (React Native), TypeScript
- **Backend**: Express.js + TypeScript
- **IA**: OpenAI gpt-5.2 (chat) + gpt-audio (TTS) via Replit AI Integrations
- **Almacenamiento**: AsyncStorage (local en dispositivo)
- **Auth**: RUT + clave secreta, sesiones persistentes locales

## Estructura del Proyecto
```
app/
  _layout.tsx          # Root layout con providers (Auth, Chat, QueryClient)
  index.tsx            # Auth gate (redirige a login o tabs)
  (auth)/              # Flujo de autenticación (modal)
    login.tsx          # Login por RUT
    register.tsx       # Registro con tipo de usuario
  (tabs)/              # Pantallas principales
    index.tsx          # Dashboard principal
    chat.tsx           # Chat con IA LÍDER (streaming)
    estado.tsx         # Toma de Estado (formulario diario)
    perfil.tsx         # Perfil + info TCC

contexts/
  AuthContext.tsx      # Auth state (RUT login, registro, sesión)
  ChatContext.tsx      # Mensajes, estado entries, persistencia

server/
  routes.ts            # API: /api/chat, /api/tts, /api/stt
  index.ts             # Express server config

constants/
  colors.ts            # Paleta oscura: navy #070B14, teal #00E5B4, gold #E8C547
```

## Funcionalidades Principales
1. **Auth por RUT**: Registro/login con RUT chileno y clave secreta
2. **Chat con LÍDER**: Streaming SSE, memoria extendida, contexto de estado
3. **TTS/Voz**: Cada mensaje de LÍDER tiene botón de parlante (gpt-audio)
4. **Toma de Estado**: Formulario día/noche (ánimo, ansiedad, cravings, sueño, situaciones, observaciones)
5. **Dashboard**: Motivación diaria, acceso rápido, último estado
6. **Perfil**: Estadísticas, 8 Capacidades del Carácter, filosofía TCC

## Tipos de Usuario
- estudiante, consumo_activo, en_tratamiento, reeducado, familiar

## API Keys / Secrets
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Auto-inyectado por Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Auto-inyectado por Replit AI Integrations

## Diseño
- Tema oscuro profundo (navy #070B14)
- Accent teal #00E5B4, gold #E8C547
- Inter font (400/500/600/700)
- Animaciones con react-native-reanimated
- NativeTabs con Liquid Glass en iOS 26+

// server/index.ts
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// server/routes.ts
import { createServer } from "node:http";
import OpenAI from "openai";
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API Key not configured. Please set OPENAI_API_KEY in Secrets.");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || void 0
  });
}
var LIDER_SYSTEM_PROMPT = `Eres L\xCDDER, una inteligencia artificial especializada en rehabilitaci\xF3n y prevenci\xF3n de drogas, basada en la filosof\xEDa "Yo Decreto" y Terapia Cognitivo-Conductual (TCC).

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
FILOSOF\xCDA YO DECRETO - FUNDAMENTO
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

FE EN EL SER HUMANO:
- Cada individuo nace con dignidad y orgullo propio innato
- El orgullo es una planta que requiere cultivo y cuidado continuo
- La recuperaci\xF3n es renacer de los fracasos para recobrar dignidad y respeto
- Aceptaci\xF3n sin juicio: el adicto es una persona inmadura que necesita reeducaci\xF3n
- La sociedad tiene responsabilidad en la soluci\xF3n (es un mal social, no individual)

OBJETIVO CENTRAL:
Que el usuario desarrolle PRINCIPIOS, VALORES y crecimiento integral que le permita:
- Reencontrarse con su dignidad
- Recobrar su lugar en la sociedad
- Ser aceptado por haberla recobrado

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
COMPONENTES DE PERSONALIDAD - FRAMEWORK DIAGN\xD3STICO
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

8 CAPACIDADES DEL CAR\xC1CTER (Adquiridas/Desarrollables):
1. CONFIANZA: Autoestima, optimismo en capacidades propias. Falla: Pesimismo
2. AUTONOM\xCDA: Autocontrol, autosuficiencia emocional. Falla: Dependencia
3. INICIATIVA: Encauzar energ\xEDa hacia senderos productivos. Falla: Apat\xEDa
4. INDUSTRIOSIDAD: Hacer las cosas bien, con destreza. Falla: Ineptitud
5. IDENTIDAD: Ser aut\xE9ntico consistentemente. Falla: Duplicidad/Mentira
6. COMPROMISO: Cumplir palabra y promesas. Falla: Irresponsabilidad
7. GENEROSIDAD: Ense\xF1ar con buen ejemplo, altruismo. Falla: Ego\xEDsmo
8. TRASCENDENCIA: Superar l\xEDmites y contratiempos. Falla: Regresionismo

8 TEMPERAMENTOS (Innatos/Controlables):
1. AGRESIVIDAD \u2192 Tiende a acci\xF3n correctiva (controlar: evitar violencia)
2. CALLOSIDAD \u2192 Indiferencia afectiva (controlar: cultiva empat\xEDa)
3. IMPULSIVIDAD \u2192 Act\xFAa sin pensar (controlar: pausa reflexiva)
4. IRRITABILIDAD \u2192 Baja tolerancia (controlar: desarrolla paciencia)
5. MELANCOL\xCDA \u2192 Rumiaci\xF3n del pasado (controlar: enf\xF3cate en presente/futuro)
6. SENSIBILIDAD \u2192 Hiper-reacci\xF3n emocional (controlar: regulaci\xF3n)
7. SEXUALIDAD \u2192 Impulso pro-creativo (controlar: madurez sexual)
8. TIMIDEZ \u2192 Inhibici\xF3n de acci\xF3n (controlar: exponerse a oportunidades)

8 TALENTOS (Innatos/Potenciadores):
- Art\xEDsticos, Atl\xE9tico, Intelectual, Intuitivo, Manual, Sensorial, Social, Verbal
\u2192 USO: Apoyar car\xE1cter mientras se fortalece (no crear dependencia de talentos)

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
PROCESO DE INTERVENCI\xD3N (TCC + YO DECRETO)
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

PASO 1: AUTOCR\xCDTICA E INTROVISI\xD3N
\u2192 Ayuda al usuario a identificar sus fallas personales sin juzgar
\u2192 "\xBFQu\xE9 falla de car\xE1cter o temperamento ves en ti que te est\xE1 perjudicando?"

PASO 2: IDENTIFICAR DESCONTROLES TEMPERAMENTALES
\u2192 Localiza qu\xE9 temperamento descontrolado genera esa falla
\u2192 "Tu IMPULSIVIDAD te lleva a decisiones sin pensar"

PASO 3: FORTALECER CAPACIDADES DE CAR\xC1CTER
\u2192 Sugiere qu\xE9 capacidad fortalecer para crear controles internos
\u2192 "Desarrollar INICIATIVA te ayudar\xE1 a encauzar esa energ\xEDa"

PASO 4: UTILIZAR TALENTOS COMO MECANISMO TEMPORAL
\u2192 Recomienda talentos que apoyen mientras el car\xE1cter se fortalece
\u2192 "Tu talento MANUAL/SOCIAL puede ayudarte mientras desarrollas COMPROMISO"

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
TERAPIAS QUE IMPLEMENTAS
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

- TERAPIA GRUPAL: Fortalece AUTONOM\xCDA y CONFIANZA
- TERAPIA INDIVIDUAL: Consejer\xEDa directa, fortalece CONFIANZA
- TERAPIA EDUCATIVA: Reestructuraci\xF3n de personalidad, fortalece INDUSTRIOSIDAD e INICIATIVA
- TERAPIA RECREATIVA: Deportes y movimiento, fortalece IDENTIDAD
- TERAPIA DE CONFRONTACI\xD3N: Se\xF1alamientos respetuosos, fortalece COMPROMISO
- TERAPIA DE MARAT\xD3N Y AYUDAS: Desahogo de eventos negativos reprimidos, fortalece COMPROMISO
- TERAPIA FAMILIAR: Reconciliaci\xF3n y orientaci\xF3n, fortalece GENEROSIDAD

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
PRINCIPIOS TCC INTEGRADOS
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

- Identificar y reestructurar pensamientos autom\xE1ticos negativos (CONFIANZA)
- Analizar distorsiones cognitivas sistem\xE1ticamente
- T\xE9cnicas de regulaci\xF3n emocional (SENSIBILIDAD, IRRITABILIDAD)
- Activaci\xF3n conductual para combatir apat\xEDa (INICIATIVA)
- Prevenci\xF3n de reca\xEDdas a trav\xE9s de planes concretos
- Entrenamiento en habilidades sociales (GENEROSIDAD, IDENTIDAD)
- Planificaci\xF3n de comportamientos alternativos

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
ESTILO DE COMUNICACI\xD3N Y REGLAS \xC9TICAS
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

REGLAS ABSOLUTAS:
\u2713 HONESTIDAD TOTAL: Nunca mentir ni simular
\u2713 SIN JUICIO: M\xE1xima empat\xEDa y aceptaci\xF3n
\u2713 SEGURIDAD: Si riesgo de vida \u2192 llamar emergencias inmediatamente
\u2713 NO FACILITACI\xD3N: Nunca promover consumo de drogas
\u2713 DERIVACI\xD3N: Referir a profesionales cuando sea necesario
\u2713 IDIOMA: Responder en espa\xF1ol latino

TONO Y LENGUAJE:
- Directo, c\xE1lido, viril pero accesible
- Usa t\xE9rminos de LIDERAZGO: "recobra tu dignidad", "fortalece tu car\xE1cter"
- Valida SIEMPRE emociones antes de dar estrategias
- Usa preguntas SOCR\xC1TICAS para fomentar reflexi\xF3n propia
- Lenguaje cercano pero sin jerga callejera
- CELEBRA cada peque\xF1o avance (crear momentum)

ADAPTACI\xD3N POR TIPO DE USUARIO:
- ESTUDIANTES/CURIOSOS: Educaci\xF3n preventiva clara
- CONSUMO ACTIVO: Entrevista motivacional + reducci\xF3n de da\xF1os
- EN TRATAMIENTO: Apoyo terap\xE9utico intenso + consolidaci\xF3n
- REEDUCADOS: Prevenci\xF3n de reca\xEDdas + consolidaci\xF3n de logros
- FAMILIARES: Gu\xEDa y apoyo para soporte

CUANDO COMPARTEN "TOMA DE ESTADO" (estado actual):
\u2192 Analiza sus capacidades de car\xE1cter con debilidades
\u2192 Identifica temperamentos descontrolados
\u2192 Sugiere activaci\xF3n de talentos
\u2192 Proporciona plan de fortalecimiento personalizado

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

Recuerda: Eres L\xCDDER. Tu misi\xF3n es ayudar a cada persona a renacer de sus fracasos
y recobrar su dignidad. Cada interacci\xF3n es una oportunidad para fortalecer car\xE1cter
y crear una v\xEDa hacia la trascendencia personal.

"La fe en el ser humano en el ser humano, en el amor al pr\xF3jimo, en la creencia
de que cada individuo nace con sentido de dignidad y orgullo propio."
`;
async function registerRoutes(app2) {
  app2.post("/api/chat", async (req, res) => {
    try {
      const { messages, estadoContext } = req.body;
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      const systemMessages = [{ role: "system", content: LIDER_SYSTEM_PROMPT }];
      if (estadoContext) {
        systemMessages.push({
          role: "system",
          content: `ESTADO ACTUAL DEL USUARIO (informaci\xF3n de su \xFAltima Toma de Estado):
${estadoContext}`
        });
      }
      console.log("API Key present:", !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
      console.log("API Base URL:", process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);
      const stream = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [...systemMessages, ...messages],
        stream: true,
        max_completion_tokens: 4096
      });
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}

`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error al procesar el mensaje" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Error al procesar el mensaje" })}

`);
        res.end();
      }
    }
  });
  app2.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Texto requerido" });
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();
      const stream = await getOpenAI().chat.completions.create({
        model: "gpt-audio",
        modalities: ["text", "audio"],
        audio: { voice: "onyx", format: "pcm16" },
        messages: [
          {
            role: "system",
            content: "Eres un asistente de texto a voz. Repite el texto que se te da de forma natural, con voz masculina juvenil, c\xE1lida y emp\xE1tica. Habla en espa\xF1ol latino. Solo di el texto, sin comentarios adicionales."
          },
          { role: "user", content: `Repite textualmente: ${text}` }
        ],
        stream: true
      });
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta;
        if (delta?.audio?.data) {
          res.write(`data: ${JSON.stringify({ audio: delta.audio.data })}

`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("TTS error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error en text-to-speech" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Error en text-to-speech" })}

`);
        res.end();
      }
    }
  });
  app2.post("/api/stt", async (req, res) => {
    try {
      const { audio } = req.body;
      if (!audio) return res.status(400).json({ error: "Audio requerido" });
      const audioBuffer = Buffer.from(audio, "base64");
      const { toFile } = await import("openai");
      const file = await toFile(audioBuffer, "audio.wav", { type: "audio/wav" });
      const transcription = await getOpenAI().audio.transcriptions.create({
        file,
        model: "gpt-4o-mini-transcribe"
      });
      res.json({ text: transcription.text });
    } catch (error) {
      console.error("STT error:", error);
      res.status(500).json({ error: "Error en transcripci\xF3n" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  const staticWebBuildPath = path.resolve(process.cwd(), "static-build", "web");
  if (fs.existsSync(staticWebBuildPath)) {
    app.use(express.static(staticWebBuildPath));
    app.use("/assets/node_modules", (req, res, next) => {
      const requestedPath = req.path;
      const nodeModulesRoot = path.resolve(process.cwd(), "node_modules");
      const directPath = path.join(nodeModulesRoot, requestedPath);
      if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
        return res.sendFile(directPath);
      }
      const lastDot = requestedPath.lastIndexOf(".");
      const secondLastDot = requestedPath.lastIndexOf(".", lastDot - 1);
      if (secondLastDot !== -1 && lastDot !== -1) {
        const possibleHash = requestedPath.slice(secondLastDot + 1, lastDot);
        if (/^[a-f0-9]{32}$/.test(possibleHash)) {
          const withoutHash = requestedPath.slice(0, secondLastDot) + requestedPath.slice(lastDot);
          const resolvedPath = path.join(nodeModulesRoot, withoutHash);
          if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
            return res.sendFile(resolvedPath);
          }
        }
      }
      next();
    });
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      const indexPath = path.join(staticWebBuildPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  } else if (process.env.NODE_ENV === "development") {
    const metroProxy = createProxyMiddleware({
      target: "http://localhost:8081",
      changeOrigin: true,
      ws: true,
      on: {
        error: (_err, _req, res) => {
          if (res && "writeHead" in res) {
            res.status(502).send("Metro bundler not ready yet \u2014 please wait a moment and refresh.");
          }
        }
      }
    });
    app.use((req, _res, next) => {
      if (req.path.startsWith("/api")) return next();
      return metroProxy(req, _res, next);
    });
  } else {
    configureExpoAndLanding(app);
  }
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();

import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OpenAI API key. Set AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY.");
    }
    _openai = new OpenAI({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

const LIDER_SYSTEM_PROMPT = `Eres LÍDER, una inteligencia artificial especializada en rehabilitación y prevención de drogas, 
con profundo conocimiento en Terapia Cognitivo-Conductual (TCC) y la filosofía "Yo Decreto" de la Comunidad.

FILOSOFÍA BASE:
- Cada individuo nace con dignidad y orgullo propio
- El orgullo es como una planta que hay que cultivar
- La recuperación es renacer de los fracasos para recobrar dignidad

COMPONENTES DE PERSONALIDAD QUE MANEJAS:
- 8 Capacidades del Carácter: Confianza, Autonomía, Iniciativa, Industriosidad, Identidad, Compromiso, Generosidad, Trascendencia
- 8 Temperamentos: Agresividad, Callosidad, Impulsividad, Irritabilidad, Melancolía, Sensibilidad, Sexualidad, Timidez
- 8 Talentos: Artísticos, Atlético, Intelectual, Intuitivo, Manual, Sensorial, Social, Verbal

TERAPIAS QUE CONOCES:
- Terapia Grupal, Individual, Educativa, Recreativa, de Confrontación, de Maratón y Ayudas, Familiar

PRINCIPIOS TCC QUE APLICAS:
- Identificación y reestructuración de pensamientos automáticos negativos
- Análisis de distorsiones cognitivas
- Técnicas de regulación emocional
- Activación conductual
- Prevención de recaídas
- Entrenamiento en habilidades sociales

TIPOS DE USUARIOS QUE ATIENDES:
- Estudiantes/Curiosos: Información educativa preventiva
- Consumo activo: Reducción de daños, motivación al cambio (entrevista motivacional)
- En tratamiento de rehabilitación: Apoyo terapéutico, mantenimiento de motivación
- Reeducados/Recuperados: Prevención de recaídas, consolidación de logros
- Familiares/Cercanos: Apoyo y orientación

REGLAS ÉTICAS ABSOLUTAS:
1. NUNCA mentir ni simular - siempre honestidad total
2. NUNCA promover el consumo de drogas
3. SIEMPRE referir a profesionales cuando sea necesario
4. Si hay riesgo de vida, SIEMPRE indicar llamar al servicio de emergencias
5. Máxima empatía y sin juicio
6. Responder SIEMPRE en español latino

ESTILO DE COMUNICACIÓN:
- Directo, cálido, masculino juvenil
- Usa términos de liderazgo y fortaleza
- Valida emociones antes de ofrecer estrategias
- Usa preguntas socráticas para fomentar la reflexión
- Evita jerga callejera pero usa lenguaje cercano
- Celebra cada pequeño avance

Cuando el usuario comparte su "Toma de Estado" (formulario de bienestar), analiza la información y responde de forma personalizada basándote en su estado actual.`;

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, estadoContext } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const systemMessages = [{ role: "system" as const, content: LIDER_SYSTEM_PROMPT }];

      if (estadoContext) {
        systemMessages.push({
          role: "system" as const,
          content: `ESTADO ACTUAL DEL USUARIO (información de su última Toma de Estado):\n${estadoContext}`,
        });
      }

      const stream = await getOpenAI().chat.completions.create({
        model: "gpt-5.2",
        messages: [...systemMessages, ...messages],
        stream: true,
        max_completion_tokens: 8192,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error al procesar el mensaje" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Error al procesar el mensaje" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/tts", async (req, res) => {
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
            content:
              "Eres un asistente de texto a voz. Repite el texto que se te da de forma natural, con voz masculina juvenil, cálida y empática. Habla en español latino. Solo di el texto, sin comentarios adicionales.",
          },
          { role: "user", content: `Repite textualmente: ${text}` },
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = (chunk.choices?.[0]?.delta as any);
        if (delta?.audio?.data) {
          res.write(`data: ${JSON.stringify({ audio: delta.audio.data })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("TTS error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error en text-to-speech" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Error en text-to-speech" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/stt", async (req, res) => {
    try {
      const { audio } = req.body;
      if (!audio) return res.status(400).json({ error: "Audio requerido" });

      const audioBuffer = Buffer.from(audio, "base64");
      const { toFile } = await import("openai");
      const file = await toFile(audioBuffer, "audio.wav", { type: "audio/wav" });

      const transcription = await getOpenAI().audio.transcriptions.create({
        file,
        model: "gpt-4o-mini-transcribe",
      });

      res.json({ text: transcription.text });
    } catch (error) {
      console.error("STT error:", error);
      res.status(500).json({ error: "Error en transcripción" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

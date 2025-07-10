import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';
import { z } from 'zod';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

if (!GEMINI_API_KEY) {
  throw new Error('❌ Falta la clave GEMINI_API_KEY en tu archivo .env');
}

// Esquema Zod para validar la respuesta de Gemini
const GeminiPartSchema = z.object({
  text: z.string().optional(),
});

const GeminiContentSchema = z.object({
  parts: z.array(GeminiPartSchema).optional(),
  role: z.string().optional(),
});

const GeminiCandidateSchema = z.object({
  content: GeminiContentSchema.optional(),
  finishReason: z.string().optional(),
  index: z.number().optional(),
  safetyRatings: z
    .array(
      z.object({
        category: z.string().optional(),
        probability: z.string().optional(),
      })
    )
    .optional(),
});

const GeminiResponseSchema = z.object({
  candidates: z.array(GeminiCandidateSchema).optional(),
  promptFeedback: z
    .object({
      blockReason: z.string().optional(),
      safetyRatings: z
        .array(
          z.object({
            category: z.string().optional(),
            probability: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
});

type GeminiResponse = z.infer<typeof GeminiResponseSchema>;

// Esquema para validar el cuerpo de la solicitud
const ChatRequestSchema = z.object({
  message: z.string().min(1, 'El mensaje no puede estar vacío'),
});

router.post('/', async (req: Request, res: Response) => {
  // Validar el cuerpo de la solicitud
  const validation = ChatRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: validation.error.errors,
    });
  }

  const { message } = validation.data;

  try {
    const systemPrompt = `
Eres un asistente de ventas que puede hacer peticiones HTTP a una API REST.
Responde SOLO en texto natural, nunca en formato JSON.

API disponible:
- GET /products?q=
- POST /carts
- PATCH /carts/:id
`;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }, { text: message }],
            role: 'user',
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    // Validar la respuesta con Zod
    const jsonData = await response.json();
    const parsedData = GeminiResponseSchema.parse(jsonData);

    // Extraer el texto de respuesta de forma segura
    const reply =
      parsedData.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No se pudo generar respuesta';

    return res.status(200).json({ reply });
  } catch (err: unknown) {
    console.error(
      'Error en /chat:',
      err instanceof Error ? err.message : 'Error desconocido'
    );
    return res.status(500).json({
      error: 'Error procesando mensaje',
      details: err instanceof Error ? err.message : null,
    });
  }
});

export default router;

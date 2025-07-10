import 'dotenv/config';
import fetch from 'node-fetch';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

if (!GEMINI_API_KEY) {
  throw new Error('❌ Falta la clave GEMINI_API_KEY en tu archivo .env');
}

// Definición de tipos para la respuesta de Gemini
type GeminiPart = {
  text?: string;
};

type GeminiContent = {
  parts?: GeminiPart[];
  role?: string;
};

type GeminiCandidate = {
  content?: GeminiContent;
  finishReason?: string;
  index?: number;
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
};

async function handleUserMessage(message: string) {
  console.log(`💬 Usuario: ${message}`);

  const systemPrompt = `
Eres un asistente de ventas que puede hacer peticiones HTTP a una API REST para:
- buscar productos (/products?q=),
- ver detalles de un producto (/products/:id),
- agregar productos al carrito (POST /carts),
- modificar productos del carrito (PATCH /carts/:id).

La API está en http://localhost:3000. Tu tarea es:
1. Analizar el mensaje del usuario.
2. Proponer una acción clara en formato JSON:
{
  "action": "buscar" | "agregar" | "modificar",
  "params": { ... }
}
No expliques nada. Solo devolvé el JSON.
`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
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
          temperature: 0,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error HTTP ${res.status}: ${errorText}`);
    }

    // Aquí especificamos el tipo de la respuesta
    const data = (await res.json()) as GeminiResponse;
    const actionJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🤖 Acción sugerida por la IA:\n', actionJson);

    try {
      const parsed = JSON.parse(actionJson);

      if (parsed.action === 'buscar' && parsed.params?.q) {
        const response = await axios.get(
          `http://localhost:3000/products?q=${parsed.params.q}`
        );
        const products = response.data;

        if (products.length === 0) {
          console.log(
            '🤖 No encontré productos que coincidan con tu búsqueda.'
          );
        } else {
          console.log('🤖 Encontré estos productos:');
          products.forEach((p: any, i: number) => {
            console.log(`  ${i + 1}. ${p.name} - $${p.price}`);
          });
        }
      }

      if (parsed.action === 'agregar' && parsed.params?.items) {
        const response = await axios.post('http://localhost:3000/carts', {
          items: parsed.params.items,
        });
        console.log(
          '🤖 Carrito creado con los siguientes ítems:',
          response.data.items
        );
      }

      if (
        parsed.action === 'modificar' &&
        parsed.params?.cart_id &&
        parsed.params?.items
      ) {
        const response = await axios.patch(
          `http://localhost:3000/carts/${parsed.params.cart_id}`,
          {
            items: parsed.params.items,
          }
        );
        console.log('🤖 Carrito actualizado:', response.data.items);
      }
    } catch (err: any) {
      console.error(
        '❌ Error al procesar o ejecutar la acción:\n',
        err.message
      );
    }
  } catch (err: any) {
    console.error('❌ Error al comunicarse con Gemini:\n', err.message);
  }
}

// Prueba
handleUserMessage('Quiero ver zapatillas negras');

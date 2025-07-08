import { Router, Request, Response } from 'express';
import axios from 'axios';
import 'dotenv/config';

const router = Router();



router.post('/', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Mensaje requerido' });

  try {
    const systemPrompt = `
Eres un asistente de ventas que puede hacer peticiones HTTP a una API REST.
Responde SOLO en texto natural, nunca en formato JSON.

API disponible:
- GET /products?q=
- POST /carts
- PATCH /carts/:id
`;

    const completion = await axios.post('https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf', {
      inputs: `
      ${systemPrompt}
      
      Usuario: ${message}
      Asistente: `
    }, {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      }
    });

    const content = completion.data[0]?.generated_text;
    return res.status(200).json({ reply: content });
  } catch (err: any) {
    console.error('Error en /chat:', err.message);
    return res.status(500).json({ error: 'Error procesando mensaje' });
  }
});

export default router;

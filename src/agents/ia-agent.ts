import 'dotenv/config';
import axios from 'axios';

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

  const response = await axios.post('https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf', {
    inputs: `
    ${systemPrompt}
    
    Usuario: ${message}
    Asistente: `
  }, {
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
    }
  });

  const actionJson = response.data[0]?.generated_text?.trim();
  console.log('🤖 Acción sugerida por la IA:\n', actionJson);

  try {
    const parsed = JSON.parse(actionJson || '');

    if (parsed.action === 'buscar' && parsed.params?.q) {
      const response = await axios.get(
        `http://localhost:3000/products?q=${parsed.params.q}`
      );
      const products = response.data;

      if (products.length === 0) {
        console.log('🤖 No encontré productos que coincidan con tu búsqueda.');
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
    console.error('❌ Error al procesar o ejecutar la acción:\n', err.message);
  }
}

// ✅ Podés cambiar este mensaje por pruebas reales:
handleUserMessage('Quiero ver zapatillas negras');

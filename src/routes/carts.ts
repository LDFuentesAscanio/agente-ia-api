import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /carts
router.post('/', async (req: Request, res: Response) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de items' });
  }

  try {
    // Verificar que todos los productos existen
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.product_id },
      });
      if (!product) {
        return res
          .status(404)
          .json({ error: `Producto con ID ${item.product_id} no encontrado` });
      }
    }

    // Crear carrito
    const cart = await prisma.cart.create({
      data: {
        items: {
          create: items.map((item: { product_id: number; qty: number }) => ({
            product: { connect: { id: item.product_id } },
            qty: item.qty,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(cart);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /carts/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const cartId = Number(req.params.id);
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de items' });
  }

  try {
    // Verificar que el carrito exista
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Procesar cada ítem
    for (const item of items) {
      if (item.qty === 0) {
        // Eliminar el item
        await prisma.cartItem.deleteMany({
          where: {
            cartId: cartId,
            productId: item.product_id,
          },
        });
      } else {
        // Actualizar o crear el item
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cartId,
            productId: item.product_id,
          },
        });

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { qty: item.qty },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cart: { connect: { id: cartId } },
              product: { connect: { id: item.product_id } },
              qty: item.qty,
            },
          });
        }
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error al modificar el carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

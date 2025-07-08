# 🧠 Desafío Técnico — Agente IA para E-commerce

Este proyecto implementa un **agente inteligente** que entiende lenguaje natural y opera sobre una API REST para simular la compra de productos (ej: zapatillas).

---

## ⚙️ Tecnologías

- Node.js + Express
- TypeScript
- Prisma + PostgreSQL
- Hugging Face API (Llama 2)
- Axios

---

## 📦 API REST

| Método | Ruta              | Descripción                                      |
|--------|-------------------|--------------------------------------------------|
| GET    | `/products?q=`    | Busca productos por nombre o descripción         |
| GET    | `/products/:id`   | Muestra el detalle de un producto                |
| POST   | `/carts`          | Crea un carrito con ítems                        |
| PATCH  | `/carts/:id`      | Modifica cantidades o elimina ítems del carrito  |

---

## 🤖 Agente de IA

El archivo `src/agents/ia-agent.ts` utiliza GPT para:

1. Interpretar mensajes del usuario
2. Identificar intención (buscar, agregar, modificar)
3. Ejecutar llamadas HTTP a la API real
4. Responder con lenguaje natural

### 📍 Ejemplo de uso:

```bash
npx ts-node src/agents/ia-agent.ts
```

💬 Mensaje de entrada:
```
Quiero ver zapatillas negras
```

🤖 La IA responde con productos encontrados.

---

## 📄 .env (ejemplo)

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/products_ia
HUGGINGFACE_API_KEY=hf-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧪 Carga de productos

Los productos se cargan desde un archivo Excel con un script (`scripts/loadProductsFromExcel.ts`) que importa un 10 % del dataset para prueba.

---

## ✅ Requisitos previos

- Node.js ≥ 18
- PostgreSQL corriendo localmente
- Archivo `.env` configurado con la clave de OpenAI
- Migración Prisma ejecutada:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🚀 Para correr el backend

```bash
# Backend (puerto 3002)
npx ts-node src/index.ts

# Frontend (puerto 3000)
cd frontend-ia
npm run dev
```

---

## 👨‍💻 Autor

Luis Daniel — Desarrollador Fullstack | [Laburen.com](https://laburen.com)
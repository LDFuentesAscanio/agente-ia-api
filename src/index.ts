import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products';
import cartRoutes from './routes/carts';
import chatRoutes from './routes/chat';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.use('/carts', cartRoutes);

app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('API corriendo 🧠');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

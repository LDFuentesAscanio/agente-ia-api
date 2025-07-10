import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

type CorsOptions = {
  origin: string[];
  methods: string | string[];
  credentials: boolean;
  optionsSuccessStatus: number;
};

const allowedOrigins = [
  'https://frontend-ia-three.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter((origin): origin is string => !!origin);

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

// 4. Middleware CORS
app.use(cors(corsOptions));

// 5. Middleware para headers manuales (opcional pero recomendado)
app.use((req, res, next) => {
  // Convertimos el array a string si hay múltiples orígenes
  const originHeader = allowedOrigins.includes(req.headers.origin || '')
    ? req.headers.origin
    : allowedOrigins[0];

  res.header('Access-Control-Allow-Origin', originHeader);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', corsOptions.methods);
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// ... resto de tu configuración (rutas, etc.)

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log('Orígenes permitidos:', allowedOrigins);
});

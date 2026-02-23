import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import ridesRoutes from './routes/rides.js';
import driversRoutes from './routes/drivers.js';
import zonesRoutes from './routes/zones.js';
import whatsappRoutes from './routes/whatsapp.js';

export const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://autowala.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

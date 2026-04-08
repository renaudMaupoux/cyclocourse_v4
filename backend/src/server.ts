import express, { type Application } from 'express';
import http from 'http';
import { Server as SocketIoServer } from 'socket.io';
import cors from 'cors';
import sequelize from './config/database';
import { resolveCorsOrigin } from './config/corsOrigin';
import './models/Number';
import errorHandler from './middleware/errorHandler';
import numbersRoutes from './routes/numbers';
import voiceRoutes from './routes/voice';

const corsOrigin = resolveCorsOrigin();

const app: Application = express();
const server = http.createServer(app);

const io = new SocketIoServer(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API CycloCourse - Reconnaissance Vocale',
    version: '1.0.0',
    endpoints: {
      numbers: '/api/numbers',
      voice: {
        recognizeText: 'POST /api/voice/recognize-text'
      }
    }
  });
});

app.use('/api/numbers', numbersRoutes);
app.use('/api/voice', voiceRoutes);

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log(`✅ Client connecté: ${socket.id}`);

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client déconnecté: ${socket.id}`);
  });

  socket.on('start-recognition', (data: unknown) => {
    console.log(`🎤 Reconnaissance démarrée par ${socket.id}`, data);
    socket.emit('recognition-started', {
      success: true,
      sessionId: socket.id
    });
  });

  socket.on('stop-recognition', () => {
    console.log(`⏹️ Reconnaissance arrêtée par ${socket.id}`);
    socket.emit('recognition-stopped', { success: true });
  });
});

const PORT = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée');

    server.listen(PORT, () => {
      console.log('\n🚀 ════════════════════════════════════════════════');
      console.log(`   Serveur démarré sur le port ${PORT}`);
      console.log(`   API: http://localhost:${PORT}`);
      console.log(`   WebSocket: ws://localhost:${PORT}`);
      console.log(
        `   CORS: ${process.env.FRONTEND_URLS || process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'http://localhost:5173' : 'dev → localhost / 127.0.0.1 (tout port)')}`
      );
      console.log('🚀 ════════════════════════════════════════════════\n');
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

void startServer();

export { app, server, io };

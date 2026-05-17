import { io, type Socket } from 'socket.io-client';
import type { NumberEntry } from '@/types/number';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

type WsEvent =
  | 'number-detected'
  | 'number-updated'
  | 'number-deleted'
  | 'numbers-reset'
  | 'recognition-error';

class WebSocketService {
  socket: Socket | null = null;
  connected = false;
  private readonly listeners = new Map<WsEvent, Array<(data?: unknown) => void>>();

  connect(): Socket | undefined {
    if (this.socket?.connected) {
      console.log('WebSocket déjà connecté');
      return this.socket;
    }

    console.log(`Connexion à ${WS_URL}...`);

    this.socket = io(WS_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté:', this.socket?.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket déconnecté:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Erreur de connexion WebSocket:', error.message);
    });

    this.socket.on('number-detected', (data: NumberEntry) => {
      console.log('🔔 Nouveau chiffre détecté:', data);
      this.emit('number-detected', data);
    });

    this.socket.on('number-updated', (data: NumberEntry) => {
      console.log('🔔 Chiffre mis à jour:', data);
      this.emit('number-updated', data);
    });

    this.socket.on('number-deleted', (data: { id: number }) => {
      console.log('🔔 Chiffre supprimé:', data);
      this.emit('number-deleted', data);
    });

    this.socket.on('numbers-reset', () => {
      console.log('🔔 Chiffres réinitialisés');
      this.emit('numbers-reset');
    });

    this.socket.on('recognition-error', (data: unknown) => {
      console.error('🔔 Erreur de reconnaissance:', data);
      this.emit('recognition-error', data);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('WebSocket déconnecté manuellement');
    }
  }

  on(event: WsEvent, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: WsEvent, callback: (data?: unknown) => void): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event: WsEvent, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  send(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error("WebSocket non connecté, impossible d'envoyer:", event);
    }
  }

  startRecognition(): void {
    this.send('start-recognition', { timestamp: Date.now() });
  }

  stopRecognition(): void {
    this.send('stop-recognition');
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default new WebSocketService();

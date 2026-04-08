import type { Server as SocketIoServer } from 'socket.io';

declare global {
  namespace Express {
    interface Application {
      get(name: 'io'): SocketIoServer;
      set(name: 'io', value: SocketIoServer): this;
    }
  }
}

export {};

import { Server } from "socket.io";

let io: Server | null = null;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected to socket:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("Client disconnected from socket:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitEvent = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};

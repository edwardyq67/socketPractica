import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],       
}));

const server = http.createServer(app); 
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173", 
  },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
    
  });
  
  socket.on("sendMessage", (data) => {
    const { message, sender } = data;
    socket.broadcast.emit("message", {
      body: message,
      from: socket.id, 
    });
  });
    socket.on("updateData", () => {
    console.log("Se recibió el evento 'updateData' del cliente:", socket.id);

    socket.emit("serverResponse", { message: "Datos actualizados correctamente" });

  });
});

const connectedClients = {}; // Objeto para guardar los clientes conectados

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  
  // Guardar el cliente conectado
  connectedClients[socket.id] = { username: `User-${socket.id}` };

  // Enviar la lista actualizada a todos los clientes
  io.emit("clientsList", connectedClients);

  // Escuchar desconexión y eliminar el cliente de la lista
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
    delete connectedClients[socket.id];
    io.emit("clientsList", connectedClients);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

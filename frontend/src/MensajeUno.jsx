import { useEffect, useState } from "react";
import io from "socket.io-client";

// Establecer la conexión con el servidor Socket.IO
const socket = io("http://localhost:3000/");

function MensajeUno() {
  const [message, setMessage] = useState(""); // Estado para el mensaje
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [username, setUsername] = useState("User"); // Estado para el nombre del usuario
  const [targetId, setTargetId] = useState(""); // Estado para almacenar el socket ID del destinatario

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear el mensaje
    const newMessage = { sender: username, message };

    // Emitir el evento para enviar el mensaje a un usuario específico
    socket.emit("sendMessageToUser", {
      targetSocketId: targetId, // El ID del socket del destinatario
      message,
      sender: username
    });

    // Agregar el mensaje localmente en la lista de mensajes
    setMessages([...messages, { sender: username, message, from: 'You' }]);

    // Limpiar el campo de entrada
    setMessage("");
  };

  useEffect(() => {
    // Escuchar los mensajes desde el servidor
    socket.on("message", (msgData) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: msgData.sender, message: msgData.message }
      ]);
    });

    // Limpiar el listener al desmontar el componente
    return () => {
      socket.off("message");
    };
  }, [messages]);

  return (
    <div>
      <h2>Chat MensajeUno</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Actualiza el estado con el valor del input
        />
        <input
          type="text"
          placeholder="Recipient's socket ID"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)} // Captura el socket ID del destinatario
        />
        <button type="submit">Send</button>
      </form>
      
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.sender}:</strong> {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MensajeUno;

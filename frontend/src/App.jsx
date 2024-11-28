import { useEffect, useState } from "react";
import io from "socket.io-client";
import MensajeUno from "./MensajeUno";

// Establecer la conexión con el servidor Socket.IO
const socket = io("http://localhost:3000/");

function App() {
  const [message, setMessage] = useState(""); // Estado para el mensaje
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [username, setUsername] = useState("User"); // Estado para el nombre del usuario
  const [clients, setClients] = useState({});
  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear el mensaje localmente antes de enviarlo al servidor
    const newMessage = { sender: username, message };

    // Emitir el mensaje al servidor con Socket.IO
    socket.emit("sendMessage", newMessage);

    // Agregar el mensaje localmente en la lista de mensajes
    setMessages([...messages, { sender: username, message, from: 'You' }]);

    // Limpiar el campo de entrada
    setMessage("");
  };
  useEffect(() => {
    // Escuchar la lista de clientes conectados
    socket.on("clientsList", (clients) => {
      setClients(clients);
    });

    return () => {
      socket.off("clientsList");
    };
  }, []);
  useEffect(() => {
    // Escuchar los mensajes desde el servidor
    socket.on("message", (msgData) => {
      // Añadir el mensaje a la lista de mensajes con el ID de quien lo envió
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: msgData.from, message: msgData.body }
      ]);
    });

    // Limpiar el listener al desmontar el componente
    return () => {
      socket.off("message");
    };
  }, [messages]);
  const handleUpdateData = () => {
    // Emitir evento 'updateData' al servidor
    socket.emit("updateData");
    console.log("Se emitió el evento 'updateData' al servidor");
  };
  useEffect(() => {
    // Escuchar el evento desde el servidor
    socket.on("serverResponse", (data) => {
      console.log("Respuesta del servidor:", data);
    });

    return () => {
      socket.off("serverResponse");  // Limpiar el listener cuando se desmonte el componente
    };
  }, []);
  return (
    <div>
      <h1>Clientes conectados</h1>
      <ul>
        {Object.entries(clients).map(([id, info]) => (
          <li key={id}>
            <strong>{info.username}</strong> (ID: {id})
          </li>
        ))}
      </ul>
      <h2>Chat App</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Actualiza el estado con el valor del input
        />
        <button type="submit">Send</button>
      </form>

      <ul>
        {messages.map((msg, index) => (
          <li
            key={index}
            style={{
              textAlign: msg.sender === username ? "right" : "left", // Alineación de los mensajes según el emisor
              backgroundColor: msg.sender === username ? "#e0e0e0" : "#f1f1f1", // Colores diferentes para los mensajes
              borderRadius: "10px",
              padding: "5px 10px",
              margin: "5px",
              maxWidth: "80%",
              marginLeft: msg.sender === username ? "auto" : "initial"
            }}
          >
            <strong>{msg.sender === username ? "Yo" : msg.sender}:</strong> {msg.message}
          </li>
        ))}
      </ul>
      <button onClick={handleUpdateData}>Emitir 'updateData'</button>
      <MensajeUno/>
    </div>
  );
}

export default App;

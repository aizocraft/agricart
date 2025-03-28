import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState('');
  const socketRef = useRef();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Connect to Socket.io server
    socketRef.current = io('http://localhost:5000');

    // Join user's room
    socketRef.current.emit('joinRoom', userInfo._id);

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, { sender: data.sender, text: data.message }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userInfo]);

  const handleSendMessage = () => {
    if (message.trim() && receiver) {
      socketRef.current.emit('sendMessage', {
        sender: userInfo._id,
        receiver,
        message,
      });
      setMessages((prev) => [...prev, { sender: userInfo._id, text: message }]);
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary text-white p-3">
        <h3 className="font-bold">Chat</h3>
      </div>
      
      <div className="p-3">
        <input
          type="text"
          placeholder="Enter receiver ID"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
      </div>

      <div className="h-64 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded ${msg.sender === userInfo._id ? 'bg-blue-100 ml-auto' : 'bg-gray-100 mr-auto'}`}
            style={{ maxWidth: '80%' }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-l"
        />
        <button
          onClick={handleSendMessage}
          className="bg-primary text-white px-4 py-2 rounded-r hover:bg-secondary"
        >
          Send
        </button>
      </div>
    </div>
  );
}
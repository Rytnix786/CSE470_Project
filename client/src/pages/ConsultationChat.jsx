import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { chatAPI, uploadFile } from '../api/api';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function ConsultationChat() {
  const { id: appointmentId } = useParams();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load previous messages
    loadMessages();

    // Connect to Socket.IO
    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat');
      newSocket.emit('join-room', appointmentId);
    });

    newSocket.on('joined-room', () => {
      console.log('Joined consultation room');
    });

    newSocket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [appointmentId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(appointmentId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    socket.emit('send-message', {
      appointmentId,
      message: message.trim(),
    });

    setMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket) return;

    setUploading(true);
    try {
      const response = await uploadFile(file);
      socket.emit('send-message', {
        appointmentId,
        message: '',
        fileUrl: response.data.fileUrl,
      });
    } catch (error) {
      alert('File upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEndConsultation = async () => {
    if (!confirm('Are you sure you want to end this consultation?')) return;

    try {
      await chatAPI.endConsultation(appointmentId);
      alert('Consultation ended successfully');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">Consultation Chat</h1>
          {user?.role === 'DOCTOR' && (
            <button
              onClick={handleEndConsultation}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              End Consultation
            </button>
          )}
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.senderId._id === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId._id === user?._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-xs opacity-75 mb-1">{msg.senderId.name}</p>
                {msg.message && <p>{msg.message}</p>}
                {msg.fileUrl && (
                  <a
                    href={SOCKET_URL + msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    📎 View attachment
                  </a>
                )}
                <p className="text-xs opacity-75 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {uploading ? '...' : '📎'}
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

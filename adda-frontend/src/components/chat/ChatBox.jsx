import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiImage } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import { getConversation, sendMessage } from '../../api/messageApi';

// একটা নির্দিষ্ট বন্ধুর সাথে চ্যাট উইন্ডো — real-time মেসেজ আসা/যাওয়া
const ChatBox = ({ contact }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // কনভারসেশন লোড হবে যখনই contact বদলায়
  useEffect(() => {
    if (!contact) return;
    const load = async () => {
      const res = await getConversation(contact._id);
      setMessages(res.data.data);
    };
    load();
  }, [contact]);

  // নতুন মেসেজ এলে scroll নিচে যাবে
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket দিয়ে real-time মেসেজ আর টাইপিং শোনা
  useEffect(() => {
    if (!socket || !contact) return;

    const handleNewMessage = (msg) => {
      if (msg.sender === contact._id || msg.receiver === contact._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ from }) => {
      if (from === contact._id) setIsTyping(true);
    };
    const handleStopTyping = ({ from }) => {
      if (from === contact._id) setIsTyping(false);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('userStopTyping', handleStopTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('userStopTyping', handleStopTyping);
    };
  }, [socket, contact]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (socket) {
      socket.emit('typing', { to: contact._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { to: contact._id });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await sendMessage(contact._id, { text });
    setMessages((prev) => [...prev, res.data.data]);
    setText('');
  };

  const handleFileSend = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await sendMessage(contact._id, { file });
    setMessages((prev) => [...prev, res.data.data]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!contact) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#65676b' }}>
        {t('chat.selectContact')}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, borderBottom: '1px solid #dadde1' }}>
        <Avatar user={contact} size={40} />
        <div>
          <div style={{ fontWeight: 600 }}>{contact.name}</div>
          {isTyping && <div style={{ fontSize: 12, color: '#65676b' }}>{t('chat.typing')}</div>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {messages.map((m) => (
          <MessageBubble key={m._id} message={m} isOwn={m.sender === user.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 14, borderTop: '1px solid #dadde1' }}>
        <label style={{ cursor: 'pointer', color: '#1877f2' }}>
          <FiImage size={22} />
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSend} hidden />
        </label>
        <input
          value={text}
          onChange={handleTextChange}
          placeholder={t('chat.messagePlaceholder')}
          style={{
            flex: 1,
            border: 'none',
            background: '#f0f2f5',
            borderRadius: 20,
            padding: '10px 16px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1877f2' }}
        >
          <FiSend size={22} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import ChatList from '../components/chat/ChatList';
import ChatBox from '../components/chat/ChatBox';
import Loader from '../components/common/Loader';
import { getInbox } from '../api/messageApi';

// মেসেঞ্জার পেজ — বামে conversation list, ডানে active chat
const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInbox = async () => {
      try {
        const res = await getInbox();
        setConversations(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    loadInbox();
  }, []);

  return (
    <div style={{ background: '#f0f2f5', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', maxWidth: 1000, width: '100%', margin: '0 auto', background: '#fff', overflow: 'hidden' }}>
        <div style={{ width: 320, borderRight: '1px solid #dadde1', overflowY: 'auto' }}>
          <h3 style={{ padding: 14 }}>মেসেঞ্জার</h3>
          {loading ? (
            <Loader />
          ) : (
            <ChatList
              conversations={conversations}
              activeUserId={activeContact?._id}
              onSelect={setActiveContact}
            />
          )}
        </div>
        <ChatBox contact={activeContact} />
      </div>
    </div>
  );
};

export default ChatPage;
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import ChatList from '../components/chat/ChatList';
import ChatBox from '../components/chat/ChatBox';
import Loader from '../components/common/Loader';
import Avatar from '../components/common/Avatar';
import { getInbox } from '../api/messageApi';
import { getMe } from '../api/authApi';
import { getUserProfile } from '../api/userApi';

const ChatPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [friendsWithoutChat, setFriendsWithoutChat] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inboxRes, meRes] = await Promise.all([getInbox(), getMe()]);
      const inbox = inboxRes.data.data;
      setConversations(inbox);

      const conversationIds = new Set(inbox.map((c) => c._id._id));
      const friends = meRes.data.data.friends || [];
      setFriendsWithoutChat(friends.filter((f) => !conversationIds.has(f._id)));

      const withUserId = searchParams.get('with');
      if (withUserId) {
        const existing = inbox.find((c) => c._id._id === withUserId);
        if (existing) {
          setActiveContact(existing._id);
        } else {
          const profileRes = await getUserProfile(withUserId);
          setActiveContact({
            _id: withUserId,
            name: profileRes.data.data.name,
            avatar: profileRes.data.data.avatar,
          });
        }
      }
    } catch (err) {
      console.error('Chat page load error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: '#f0f2f5', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', maxWidth: 1000, width: '100%', margin: '0 auto', background: '#fff', overflow: 'hidden' }}>
        <div style={{ width: 320, borderRight: '1px solid #dadde1', overflowY: 'auto' }}>
          <h3 style={{ padding: 14 }}>{t('chat.messenger')}</h3>
          {loading ? (
            <Loader />
          ) : (
            <>
              <ChatList
                conversations={conversations}
                activeUserId={activeContact?._id}
                onSelect={setActiveContact}
              />

              {friendsWithoutChat.length > 0 && (
                <div style={{ borderTop: '1px solid #dadde1', paddingTop: 8 }}>
                  <div style={{ padding: '6px 14px', fontSize: 12, color: '#65676b', fontWeight: 600 }}>
                    {t('chat.friendsNoChat')}
                  </div>
                  {friendsWithoutChat.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => setActiveContact({ _id: f._id, name: f.name, avatar: f.avatar })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        background: activeContact?._id === f._id ? '#e7f3ff' : 'transparent',
                      }}
                    >
                      <Avatar user={{ name: f.name, avatar: f.avatar }} size={44} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <ChatBox contact={activeContact} />
      </div>
    </div>
  );
};

export default ChatPage;
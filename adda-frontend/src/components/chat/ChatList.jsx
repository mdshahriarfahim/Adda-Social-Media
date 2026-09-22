import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Avatar from '../common/Avatar';
import useSocket from '../../hooks/useSocket';

// ইনবক্স — সব কনভারসেশনের প্রিভিউ, unread count সহ
const ChatList = ({ conversations, activeUserId, onSelect }) => {
  const { t } = useTranslation();
  const { onlineUsers } = useSocket();

  if (conversations.length === 0) {
    return <p style={{ padding: 16, color: '#65676b', fontSize: 14 }}>{t('chat.noMessages')}</p>;
  }

  return (
    <div>
      {conversations.map((conv) => {
        const contact = conv._id; // populate করা user object
        const isActive = activeUserId === contact._id;
        const isOnline = onlineUsers.has(contact._id);

        return (
          <div
            key={contact._id}
            onClick={() => onSelect(contact)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              cursor: 'pointer',
              background: isActive ? '#e7f3ff' : 'transparent',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Avatar user={contact} size={48} />
              {isOnline && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#31a24c',
                    border: '2px solid #fff',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{contact.name}</div>
              <div
                style={{
                  fontSize: 13,
                  color: '#65676b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {conv.lastMessage?.text || t('chat.sentMedia')} ·{' '}
                {formatDistanceToNow(new Date(conv.lastMessage.createdAt))} {t('common.ago')}
              </div>
            </div>
            {conv.unreadCount > 0 && (
              <span
                style={{
                  background: '#1877f2',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {conv.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
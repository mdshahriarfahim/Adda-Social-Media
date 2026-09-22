import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Avatar from '../common/Avatar';

// একটা একক নোটিফিকেশন — টাইপ অনুযায়ী কোথায় ক্লিক করলে যাবে সেটা ঠিক করে
const NotificationItem = ({ notification, onSeen }) => {
  const { t } = useTranslation();
  const { sender, type, text, seen, createdAt, post } = notification;

  const getLink = () => {
    if (type === 'friend_request' || type === 'friend_accept') return `/profile/${sender?._id}`;
    if (type === 'message') return '/chat';
    if (post) return `/`; // পোস্ট নির্দিষ্ট পেজ নেই এখানে, ফিডে ফেরত পাঠাচ্ছি
    return '/';
  };

  const handleClick = () => {
    if (!seen) onSeen(notification._id);
  };

  return (
    <Link
      to={getLink()}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        textDecoration: 'none',
        color: '#050505',
        background: seen ? 'transparent' : '#e7f3ff',
      }}
    >
      <Avatar user={sender} size={44} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14 }}>{text}</div>
        <div style={{ fontSize: 12, color: '#65676b', marginTop: 2 }}>
          {formatDistanceToNow(new Date(createdAt))} {t('common.ago')}
        </div>
      </div>
      {!seen && (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#1877f2',
            flexShrink: 0,
          }}
        />
      )}
    </Link>
  );
};

export default NotificationItem;
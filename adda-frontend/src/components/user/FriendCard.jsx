import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';

// প্রোফাইল পেজে বন্ধুদের গ্রিড দেখানোর জন্য ছোট কার্ড
const FriendCard = ({ friend }) => {
  return (
    <Link
      to={`/profile/${friend._id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        textDecoration: 'none',
        color: '#050505',
      }}
    >
      <Avatar user={{ name: friend.name, avatar: friend.avatar }} size={64} />
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{friend.name}</span>
    </Link>
  );
};

export default FriendCard;
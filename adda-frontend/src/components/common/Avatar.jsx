import { API_BASE_URL } from '../../utils/constants';

// user.avatar এ backend থেকে path আসে যেমন "/api/users/123/avatar"
// সেটাকে পুরো URL বানিয়ে দেখায়, না থাকলে নামের প্রথম অক্ষর দিয়ে বৃত্ত বানায়
const Avatar = ({ user, size = 40 }) => {
  const avatarUrl = user?.avatar
    ? `${API_BASE_URL.replace('/api', '')}${user.avatar}`
    : null;

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e4e6eb',
    color: '#050505',
    fontWeight: 600,
    fontSize: size * 0.4,
    overflow: 'hidden',
    flexShrink: 0,
  };

  if (avatarUrl) {
    return (
      <div style={style}>
        <img
          src={avatarUrl}
          alt={user?.name || 'avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return <div style={style}>{initial}</div>;
};

export default Avatar;
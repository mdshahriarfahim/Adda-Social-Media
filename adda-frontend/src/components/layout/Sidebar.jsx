import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiUsers, FiMessageCircle, FiBell } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

// বামপাশের মেনু — Home, Profile, Friends, Messages, Notifications এর শর্টকাট
const Sidebar = () => {
  const { user } = useAuth();

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    color: '#050505',
    fontWeight: 600,
    fontSize: 15,
  };

  return (
    <aside
      style={{
        width: 260,
        padding: 12,
        position: 'sticky',
        top: 56,
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
      }}
    >
      <Link to={`/profile/${user?.id}`} style={menuItemStyle}>
        <Avatar user={user} size={32} />
        <span>{user?.name}</span>
      </Link>

      <Link to="/" style={menuItemStyle}>
        <FiHome size={22} color="#1877f2" />
        <span>হোম</span>
      </Link>

      <Link to={`/profile/${user?.id}`} style={menuItemStyle}>
        <FiUser size={22} color="#1877f2" />
        <span>প্রোফাইল</span>
      </Link>

      <Link to={`/profile/${user?.id}`} style={menuItemStyle}>
        <FiUsers size={22} color="#1877f2" />
        <span>বন্ধুরা</span>
      </Link>

      <Link to="/chat" style={menuItemStyle}>
        <FiMessageCircle size={22} color="#1877f2" />
        <span>মেসেঞ্জার</span>
      </Link>

      <Link to="/notifications" style={menuItemStyle}>
        <FiBell size={22} color="#1877f2" />
        <span>নোটিফিকেশন</span>
      </Link>
    </aside>
  );
};

export default Sidebar;
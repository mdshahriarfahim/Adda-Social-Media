import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiMessageCircle, FiBell, FiLogOut, FiUser } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { searchUsers } from '../../api/userApi';
import { getNotifications } from '../../api/notificationApi';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const searchBoxRef = useRef(null);

  // নোটিফিকেশনের unseen count প্রতি ৩০ সেকেন্ডে রিফ্রেশ হয়
  useEffect(() => {
    const fetchUnseen = async () => {
      try {
        const res = await getNotifications();
        setUnseenCount(res.data.data.filter((n) => !n.seen).length);
      } catch (err) {
        // silent fail — navbar এ error দেখানোর দরকার নেই
      }
    };
    fetchUnseen();
    const interval = setInterval(fetchUnseen, 30000);
    return () => clearInterval(interval);
  }, []);

  // সার্চ বক্সের বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হয়ে যায়
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await searchUsers(value);
      setResults(res.data.data);
      setShowResults(true);
    } catch (err) {
      setResults([]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        height: 56,
        background: '#fff',
        borderBottom: '1px solid #dadde1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* বামপাশে লোগো + সার্চ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <Link to="/" style={{ fontSize: 24, fontWeight: 800, color: '#1877f2', textDecoration: 'none' }}>
          Adda
        </Link>
        <div ref={searchBoxRef} style={{ position: 'relative', marginLeft: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f0f2f5',
              borderRadius: 20,
              padding: '8px 12px',
              width: 240,
            }}
          >
            <FiSearch color="#65676b" />
            <input
              value={query}
              onChange={handleSearch}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              placeholder={t('common.searchPlaceholder')}
              style={{
                border: 'none',
                background: 'transparent',
                marginLeft: 8,
                outline: 'none',
                width: '100%',
                fontSize: 14,
              }}
            />
          </div>

          {showResults && results.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 44,
                left: 0,
                width: 280,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                zIndex: 200,
              }}
            >
              {results.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setShowResults(false);
                    setQuery('');
                    navigate(`/profile/${u.id}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f2f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Avatar user={u} size={32} />
                  <span style={{ fontSize: 14 }}>{u.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ডানপাশে আইকন + প্রোফাইল মেনু */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LanguageSwitcher />

        <Link
          to="/chat"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#f0f2f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiMessageCircle size={20} />
        </Link>

        <Link
          to="/notifications"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#f0f2f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <FiBell size={20} />
          {unseenCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                background: '#fa383e',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unseenCount > 9 ? '9+' : unseenCount}
            </span>
          )}
        </Link>

        <div style={{ position: 'relative' }}>
          <div onClick={() => setShowMenu((s) => !s)} style={{ cursor: 'pointer' }}>
            <Avatar user={user} size={40} />
          </div>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 200,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                zIndex: 200,
              }}
            >
              <div
                onClick={() => {
                  setShowMenu(false);
                  navigate(`/profile/${user?.id}`);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
              >
                <FiUser /> <span>{t('common.myProfile')}</span>
              </div>
              <div
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', color: '#fa383e' }}
              >
                <FiLogOut /> <span>{t('common.logout')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
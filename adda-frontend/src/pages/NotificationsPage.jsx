import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import NotificationItem from '../components/notification/NotificationItem';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { getNotifications, markAsSeen, markAllAsSeen } from '../api/notificationApi';

// সব নোটিফিকেশনের তালিকা — like, comment, friend request, message ইত্যাদি
const NotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSeen = async (id) => {
    await markAsSeen(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, seen: true } : n)));
  };

  const handleSeenAll = async () => {
    await markAllAsSeen();
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 16, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2>{t('notifications.title')}</h2>
            {notifications.some((n) => !n.seen) && (
              <Button variant="secondary" onClick={handleSeenAll}>
                {t('notifications.markAllSeen')}
              </Button>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            {loading ? (
              <Loader />
            ) : notifications.length === 0 ? (
              <p style={{ padding: 20, textAlign: 'center', color: '#65676b' }}>{t('notifications.noNotifications')}</p>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n._id} notification={n} onSeen={handleSeen} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
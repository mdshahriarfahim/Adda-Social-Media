import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { getMe } from '../../api/authApi';
import { acceptFriendRequest, rejectFriendRequest } from '../../api/userApi';

// ডানপাশের প্যানেল — pending friend requests + বন্ধুদের মধ্যে কে অনলাইন আছে
const RightPanel = () => {
  const { user, setUser } = useAuth();
  const { onlineUsers } = useSocket();
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const refreshMe = async () => {
    try {
      const res = await getMe();
      setRequests(res.data.data.friendRequestsReceived || []);
      setFriends(res.data.data.friends || []);
    } catch (err) {
      console.error('RightPanel refresh error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptFriendRequest(id);
      refreshMe();
    } catch (err) {
      alert(err.response?.data?.message || 'রিকোয়েস্ট গ্রহণ করতে সমস্যা হয়েছে');
      console.error('Accept request error:', err.response?.data || err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectFriendRequest(id);
      refreshMe();
    } catch (err) {
      alert(err.response?.data?.message || 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে');
      console.error('Reject request error:', err.response?.data || err.message);
    }
  };

  return (
    <aside style={{ width: 280, padding: 16, position: 'sticky', top: 56 }}>
      {requests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 10 }}>ফ্রেন্ড রিকোয়েস্ট</h4>
          {requests.map((r) => (
            <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar user={{ name: r.name, avatar: r.avatar }} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <Button variant="primary" onClick={() => handleAccept(r._id)}>
                    Accept
                  </Button>
                  <Button variant="secondary" onClick={() => handleReject(r._id)}>
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 style={{ marginBottom: 10 }}>বন্ধুরা</h4>
        {friends.length === 0 && <p style={{ fontSize: 13, color: '#65676b' }}>এখনো কোনো বন্ধু নেই</p>}
        {friends.map((f) => (
          <Link
            key={f._id}
            to={`/chat?with=${f._id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textDecoration: 'none', color: '#050505' }}
          >
            <div style={{ position: 'relative' }}>
              <Avatar user={{ name: f.name, avatar: f.avatar }} size={36} />
              {onlineUsers.has(f._id) && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#31a24c',
                    border: '2px solid #fff',
                  }}
                />
              )}
            </div>
            <span style={{ fontSize: 14 }}>{f.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default RightPanel;
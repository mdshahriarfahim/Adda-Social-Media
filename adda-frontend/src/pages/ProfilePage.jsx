import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import ProfileHeader from '../components/user/ProfileHeader';
import FriendCard from '../components/user/FriendCard';
import PostCard from '../components/post/PostCard';
import CreatePost from '../components/post/CreatePost';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';
import { getUserProfile } from '../api/userApi';
import { getUserPosts } from '../api/postApi';
import { getMe } from '../api/authApi';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  // String() দিয়ে তুলনা করছি যাতে ObjectId/string mismatch এ ভুল না হয়
  const isOwnProfile = String(user?.id) === String(id);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([getUserProfile(id), getUserPosts(id)]);
      setProfileUser(profileRes.data.data);
      setPosts(postsRes.data.data);

      const meRes = await getMe();
      setFriends(isOwnProfile ? meRes.data.data.friends : []);
      setIsFriend(meRes.data.data.friends?.some((f) => String(f._id) === String(id)));
    } catch (err) {
      console.error('Profile load error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loading) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <Navbar />
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 16, maxWidth: 700, margin: '0 auto' }}>
          <ProfileHeader
            profileUser={profileUser}
            isOwnProfile={isOwnProfile}
            isFriend={isFriend}
            onUpdated={loadProfile}
          />

          {isOwnProfile && friends.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <h3 style={{ marginBottom: 10 }}>{t('profile.friends')} ({friends.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                {friends.map((f) => (
                  <FriendCard key={f._id} friend={f} />
                ))}
              </div>
            </div>
          )}

          {isOwnProfile && <CreatePost onPostCreated={handlePostCreated} />}

          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#65676b' }}>{t('profile.noPosts')}</p>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} onDeleted={handlePostDeleted} />)
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
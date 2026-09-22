import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import Loader from '../components/common/Loader';
import { getFeed } from '../api/postApi';

// News Feed — নিজের + বন্ধুদের পোস্ট দেখায়
const HomePage = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = async (pageNum = 1) => {
    try {
      const res = await getFeed(pageNum, 10);
      if (pageNum === 1) {
        setPosts(res.data.data);
      } else {
        setPosts((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.data.length === 10);
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '16px', maxWidth: 600, margin: '0 auto' }}>
          <CreatePost onPostCreated={handlePostCreated} />

          {loading ? (
            <Loader />
          ) : posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#65676b' }}>{t('home.noPosts')}</p>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onDeleted={handlePostDeleted} />
              ))}
              {hasMore && (
                <button
                  onClick={loadMore}
                  style={{ width: '100%', padding: 10, border: 'none', background: '#e4e6eb', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                >
                  {t('home.loadMore')}
                </button>
              )}
            </>
          )}
        </main>
        <RightPanel />
      </div>
    </div>
  );
};

export default HomePage;
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiThumbsUp, FiMessageCircle, FiShare2, FiTrash2 } from 'react-icons/fi';
import { API_BASE_URL } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import CommentList from './CommentList';
import { toggleLikePost, sharePost, deletePost } from '../../api/postApi';

// একটা পোস্ট — ছবি/ভিডিও, লাইক, কমেন্ট, শেয়ার সব এখানে
const PostCard = ({ post, onDeleted }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?.id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);

  const isOwner = post.user?._id === user?.id;

  const handleLike = async () => {
    const res = await toggleLikePost(post._id);
    setLiked(res.data.liked);
    setLikesCount(res.data.likesCount);
  };

  const handleShare = async () => {
    try {
      await sharePost(post._id, {});
      alert('পোস্টটি শেয়ার হয়েছে!');
    } catch (err) {
      alert(err.response?.data?.message || 'শেয়ার করতে সমস্যা হয়েছে');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('পোস্টটি ডিলিট করতে চান?')) return;
    await deletePost(post._id);
    onDeleted(post._id);
  };

  const mediaUrl = (fileId) => `${API_BASE_URL}/posts/media/${fileId}`;

  return (
    <div style={{ background: '#fff', borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar user={post.user} size={40} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{post.user?.name}</div>
            <div style={{ fontSize: 12, color: '#65676b' }}>
              {formatDistanceToNow(new Date(post.createdAt))} আগে · {post.privacy === 'public' ? 'সবার জন্য' : post.privacy === 'friends' ? 'বন্ধুরা' : 'শুধু আমি'}
            </div>
          </div>
        </div>
        {isOwner && (
          <FiTrash2 size={18} color="#65676b" style={{ cursor: 'pointer' }} onClick={handleDelete} />
        )}
      </div>

      {post.text && <p style={{ padding: '0 14px 10px', fontSize: 15, whiteSpace: 'pre-wrap' }}>{post.text}</p>}

      {post.media?.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: post.media.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {post.media.map((m) => (
            <div key={m.fileId}>
              {m.type === 'video' ? (
                <video src={mediaUrl(m.fileId)} controls style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }} />
              ) : (
                <img src={mediaUrl(m.fileId)} alt="" style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: 13, color: '#65676b' }}>
        <span>{likesCount > 0 && `👍 ${likesCount}`}</span>
        <span>{post.comments?.length > 0 && `${post.comments.length} কমেন্ট`}</span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #dadde1', margin: 0 }} />

      <div style={{ display: 'flex' }}>
        <button onClick={handleLike} style={actionButtonStyle(liked)}>
          <FiThumbsUp /> লাইক
        </button>
        <button onClick={() => setShowComments((s) => !s)} style={actionButtonStyle(false)}>
          <FiMessageCircle /> কমেন্ট
        </button>
        <button onClick={handleShare} style={actionButtonStyle(false)}>
          <FiShare2 /> শেয়ার
        </button>
      </div>

      {showComments && (
        <div style={{ padding: '0 14px 14px' }}>
          <CommentList postId={post._id} />
        </div>
      )}
    </div>
  );
};

const actionButtonStyle = (active) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '10px 0',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  color: active ? '#1877f2' : '#65676b',
});

export default PostCard;
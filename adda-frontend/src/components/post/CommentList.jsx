import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Avatar from '../common/Avatar';
import CommentBox from './CommentBox';
import { getComments, toggleLikeComment } from '../../api/commentApi';

// একটা পোস্টের সব কমেন্ট দেখায় + নতুন কমেন্ট যোগ করার বক্স
const CommentList = ({ postId }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await getComments(postId);
      setComments(res.data.data);
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleLike = async (commentId) => {
    await toggleLikeComment(commentId);
    fetchComments();
  };

  const handleNewComment = (comment) => {
    setComments((prev) => [comment, ...prev]);
  };

  if (loading) return <p style={{ fontSize: 13, color: '#65676b' }}>{t('comment.loading')}</p>;

  return (
    <div style={{ marginTop: 10 }}>
      {comments.map((c) => (
        <div key={c._id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <Avatar user={c.user} size={30} />
          <div>
            <div style={{ background: '#f0f2f5', borderRadius: 14, padding: '6px 12px', display: 'inline-block' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.user?.name}</div>
              <div style={{ fontSize: 14 }}>{c.text}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 2, fontSize: 12, color: '#65676b' }}>
              <span>{formatDistanceToNow(new Date(c.createdAt))} {t('common.ago')}</span>
              <span
                onClick={() => handleLike(c._id)}
                style={{ cursor: 'pointer', fontWeight: 600, color: c.likes?.length ? '#1877f2' : '#65676b' }}
              >
                {t('comment.like')} {c.likes?.length > 0 && `(${c.likes.length})`}
              </span>
            </div>
          </div>
        </div>
      ))}

      <CommentBox postId={postId} onCommentAdded={handleNewComment} />
    </div>
  );
};

export default CommentList;
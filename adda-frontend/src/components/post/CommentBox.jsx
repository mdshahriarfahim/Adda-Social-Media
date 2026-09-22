import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { addComment } from '../../api/commentApi';

// নতুন কমেন্ট লেখার ছোট ইনপুট বক্স
const CommentBox = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await addComment(postId, { text });
      onCommentAdded(res.data.data);
      setText('');
    } catch (err) {
      alert(err.response?.data?.message || 'কমেন্ট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
      <Avatar user={user} size={30} />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="একটা কমেন্ট লিখুন..."
        disabled={loading}
        style={{
          flex: 1,
          border: 'none',
          background: '#f0f2f5',
          borderRadius: 20,
          padding: '8px 14px',
          fontSize: 14,
          outline: 'none',
        }}
      />
    </form>
  );
};

export default CommentBox;
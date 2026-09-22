import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiImage, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { createPost } from '../../api/postApi';

// নতুন পোস্ট লেখার বক্স — text, privacy আর একাধিক ছবি/ভিডিও নেয়
const CreatePost = ({ onPostCreated }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    setLoading(true);
    try {
      const res = await createPost({ text, privacy, files });
      onPostCreated(res.data.data);
      setText('');
      setFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert(err.response?.data?.message || t('post.postError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 14, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Avatar user={user} size={40} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('post.whatsOnYourMind', { name: user?.name?.split(' ')[0] || '' })}
            rows={2}
            style={{
              flex: 1,
              border: 'none',
              background: '#f0f2f5',
              borderRadius: 20,
              padding: '10px 16px',
              fontSize: 15,
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {previews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginTop: 10 }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {files[i].type.startsWith('video') ? (
                  <video src={src} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <img src={src} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #dadde1' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#45bd62', fontWeight: 600, fontSize: 14 }}>
            <FiImage size={20} />
            {t('post.photoVideo')}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} hidden />
          </label>

          <select value={privacy} onChange={(e) => setPrivacy(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #dadde1' }}>
            <option value="public">{t('post.public')}</option>
            <option value="friends">{t('post.friendsOnly')}</option>
            <option value="only_me">{t('post.onlyMe')}</option>
          </select>

          <Button type="submit" disabled={loading || (!text.trim() && files.length === 0)}>
            {loading ? t('post.posting') : t('post.postButton')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
import { format } from 'date-fns';
import { API_BASE_URL } from '../../utils/constants';

// একটা একক মেসেজ বাবল — নিজের পাঠানো হলে ডানে, অন্যেরটা হলে বামে
const MessageBubble = ({ message, isOwn }) => {
  const mediaUrl = message.media?.fileId ? `${API_BASE_URL}/messages/media/${message.media.fileId}` : null;
  const isImage = message.media?.contentType?.startsWith('image');
  const isVideo = message.media?.contentType?.startsWith('video');

  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={{ maxWidth: '65%' }}>
        {mediaUrl && (
          <div style={{ marginBottom: message.text ? 4 : 0 }}>
            {isImage && <img src={mediaUrl} alt="" style={{ maxWidth: '100%', borderRadius: 12 }} />}
            {isVideo && <video src={mediaUrl} controls style={{ maxWidth: '100%', borderRadius: 12 }} />}
          </div>
        )}
        {message.text && (
          <div
            style={{
              background: isOwn ? '#1877f2' : '#e4e6eb',
              color: isOwn ? '#fff' : '#050505',
              padding: '8px 14px',
              borderRadius: 18,
              fontSize: 14,
              wordBreak: 'break-word',
            }}
          >
            {message.text}
          </div>
        )}
        <div style={{ fontSize: 11, color: '#65676b', marginTop: 2, textAlign: isOwn ? 'right' : 'left' }}>
          {format(new Date(message.createdAt), 'hh:mm a')}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
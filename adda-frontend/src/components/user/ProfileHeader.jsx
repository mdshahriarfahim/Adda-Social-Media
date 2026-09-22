import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCamera, FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { uploadAvatar, uploadCoverPhoto, sendFriendRequest, unfriendUser } from '../../api/userApi';
import { API_BASE_URL } from '../../utils/constants';

// প্রোফাইল পেজের উপরের অংশ — কভার ফটো, অ্যাভাটার, নাম, বায়ো, ফ্রেন্ড বাটন
const ProfileHeader = ({ profileUser, isOwnProfile, isFriend, onUpdated }) => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [requestSent, setRequestSent] = useState(false);

  const coverUrl = profileUser?.coverPhoto
    ? `${API_BASE_URL.replace('/api', '')}${profileUser.coverPhoto}`
    : null;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadAvatar(file);
      setUser(res.data.data);
      onUpdated(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || t('profile.avatarUploadError'));
      console.error('Avatar upload error:', err.response?.data || err.message);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadCoverPhoto(file);
      setUser(res.data.data);
      onUpdated(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || t('profile.coverUploadError'));
      console.error('Cover upload error:', err.response?.data || err.message);
    }
  };

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(profileUser.id);
      setRequestSent(true);
    } catch (err) {
      alert(err.response?.data?.message || t('profile.friendRequestError'));
      console.error('Friend request error:', err.response?.data || err.message);
    }
  };

  const handleUnfriend = async () => {
    if (!window.confirm(t('profile.unfriendConfirm'))) return;
    try {
      await unfriendUser(profileUser.id);
      onUpdated({ ...profileUser });
    } catch (err) {
      alert(err.response?.data?.message || t('profile.unfriendError'));
      console.error('Unfriend error:', err.response?.data || err.message);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
      {/* কভার ফটো */}
      <div style={{ position: 'relative', height: 280, background: '#dadde1' }}>
        {coverUrl && <img src={coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {isOwnProfile && (
          <>
            <button
              onClick={() => coverInputRef.current.click()}
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <FiCamera /> {t('profile.changeCover')}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} hidden />
          </>
        )}
      </div>

      {/* অ্যাভাটার + নাম + বায়ো */}
      <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -60 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ border: '4px solid #fff', borderRadius: '50%' }}>
            <Avatar user={profileUser} size={140} />
          </div>
          {isOwnProfile && (
            <>
              <button
                onClick={() => avatarInputRef.current.click()}
                style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#e4e6eb',
                  border: '2px solid #fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiCamera size={16} />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </>
          )}
        </div>

        <div style={{ flex: 1, paddingBottom: 8 }}>
          <h2 style={{ fontSize: 26, marginBottom: 4 }}>{profileUser?.name}</h2>
          {profileUser?.bio && <p style={{ color: '#65676b', fontSize: 14 }}>{profileUser.bio}</p>}
          <p style={{ color: '#65676b', fontSize: 13, marginTop: 4 }}>{t('profile.friendsCount', { count: profileUser?.friendsCount || 0 })}</p>
        </div>

        {!isOwnProfile && (
          <div style={{ paddingBottom: 8 }}>
            {isFriend ? (
              <Button variant="secondary" onClick={handleUnfriend}>
                <FiUserCheck /> {t('profile.friendLabel')}
              </Button>
            ) : requestSent ? (
              <Button variant="secondary" disabled>
                {t('profile.requestSent')}
              </Button>
            ) : (
              <Button onClick={handleAddFriend}>
                <FiUserPlus /> {t('profile.addFriend')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
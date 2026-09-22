import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';

// বাংলা আর English এর মধ্যে টগল করার ছোট বাটন — Navbar এ বসানো
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    changeLanguage(i18n.language === 'bn' ? 'en' : 'bn');
  };

  return (
    <button
      onClick={toggleLanguage}
      title={i18n.language === 'bn' ? 'Switch to English' : 'বাংলায় বদলান'}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: '#f0f2f5',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 13,
        color: '#1877f2',
      }}
    >
      {i18n.language === 'bn' ? 'EN' : 'বাং'}
    </button>
  );
};

export default LanguageSwitcher;
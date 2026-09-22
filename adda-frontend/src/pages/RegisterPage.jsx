import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', maxWidth: 900, padding: 20 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ color: '#1877f2', fontSize: 48, fontWeight: 800 }}>Adda</h1>
          <p style={{ fontSize: 20, color: '#050505' }}>
            {t('auth.tagline')}
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            width: 340,
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: 16 }}>{t('auth.newAccount')}</h2>

          {error && (
            <div style={{ background: '#fde2e2', color: '#c0392b', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              name="name"
              placeholder={t('auth.name')}
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="email"
              type="email"
              placeholder={t('auth.email')}
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="password"
              type="password"
              placeholder={t('auth.password')}
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.openAccount')}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
            {t('auth.alreadyHaveAccount')} <Link to="/login" style={{ color: '#1877f2' }}>{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 6,
  border: '1px solid #dadde1',
  fontSize: 15,
  outline: 'none',
};

export default RegisterPage;
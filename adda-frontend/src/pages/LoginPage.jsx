import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে');
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
            বন্ধুদের সাথে যুক্ত থাকুন, ছবি শেয়ার করুন, আড্ডা দিন — সব এক জায়গায়।
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
          {error && (
            <div style={{ background: '#fde2e2', color: '#c0392b', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              name="email"
              type="email"
              placeholder="ইমেইল"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="password"
              type="password"
              placeholder="পাসওয়ার্ড"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </Button>
          </form>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #dadde1' }} />

          <Link to="/register">
            <Button variant="secondary" fullWidth>
              নতুন অ্যাকাউন্ট খুলুন
            </Button>
          </Link>
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

export default LoginPage;
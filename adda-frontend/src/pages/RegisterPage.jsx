import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

const RegisterPage = () => {
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
      setError('পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে');
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
          <h2 style={{ textAlign: 'center', marginBottom: 16 }}>নতুন অ্যাকাউন্ট</h2>

          {error && (
            <div style={{ background: '#fde2e2', color: '#c0392b', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              name="name"
              placeholder="নাম"
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
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
              {loading ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট খুলুন'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
            আগে থেকে অ্যাকাউন্ট আছে? <Link to="/login" style={{ color: '#1877f2' }}>লগইন করুন</Link>
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
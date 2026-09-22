import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import Avatar from '../common/Avatar';
import { searchUsers } from '../../api/userApi';

// স্ট্যান্ডঅ্যালোন ইউজার সার্চ বক্স (Navbar এর সার্চ থেকে আলাদা,
// প্রয়োজনে কোনো পেজে বসানোর জন্য)
const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchUsers(value);
      setResults(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f0f2f5', borderRadius: 20, padding: '8px 12px' }}>
        <FiSearch color="#65676b" />
        <input
          value={query}
          onChange={handleSearch}
          placeholder="মানুষ খুঁজুন..."
          style={{ border: 'none', background: 'transparent', marginLeft: 8, outline: 'none', width: '100%' }}
        />
      </div>

      {loading && <p style={{ fontSize: 13, color: '#65676b', marginTop: 10 }}>খোঁজা হচ্ছে...</p>}

      <div style={{ marginTop: 10 }}>
        {results.map((u) => (
          <Link
            key={u.id}
            to={`/profile/${u.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', textDecoration: 'none', color: '#050505' }}
          >
            <Avatar user={u} size={36} />
            <span style={{ fontSize: 14 }}>{u.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
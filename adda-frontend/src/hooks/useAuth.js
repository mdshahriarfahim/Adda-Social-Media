import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Component এর ভেতর থেকে সহজে user, login, logout ইত্যাদি নেয়ার shortcut
const useAuth = () => useContext(AuthContext);

export default useAuth;
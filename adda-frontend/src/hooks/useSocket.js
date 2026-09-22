import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

// Component এর ভেতর থেকে সহজে socket connection আর online user list নেয়ার shortcut
const useSocket = () => useContext(SocketContext);

export default useSocket;
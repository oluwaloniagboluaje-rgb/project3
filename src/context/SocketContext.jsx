import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

// ✅ Use Vite environment variables instead of process.env
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [driverLocations, setDriverLocations] = useState({});

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('sr_token') },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { userId: user._id || user.id, role: user.role });
    });

    const notify = (msg, icon = '📦') => {
      const n = { id: Date.now(), message: msg, time: new Date(), read: false };
      setNotifications(p => [n, ...p.slice(0, 49)]);
      toast(msg, {
        icon,
        style: {
          background: '#1c2840',
          color: '#e8e4db',
          border: '1px solid rgba(201,168,76,.25)',
          borderRadius: '10px',
          fontFamily: 'Outfit,sans-serif',
          fontSize: '14px',
        },
      });
    };

    socket.on('order:new', d =>
      notify(`New order #${d.orderId?.slice(-6).toUpperCase()} received`, '📦')
    );
    socket.on('order:assigned', d =>
      notify(`Order #${d.orderId?.slice(-6).toUpperCase()} — driver assigned`, '🚗')
    );
    socket.on('order:pickedup', d =>
      notify(`Order #${d.orderId?.slice(-6).toUpperCase()} — picked up`, '✅')
    );
    socket.on('order:transit', d =>
      notify(`Order #${d.orderId?.slice(-6).toUpperCase()} — in transit`, '🚛')
    );
    socket.on('order:delivered', d =>
      notify(`Order #${d.orderId?.slice(-6).toUpperCase()} — delivered!`, '🎉')
    );
    socket.on('driver:location', d => {
      setDriverLocations(p => ({ ...p, [d.driverId]: d.location }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const emitLocation = data => socketRef.current?.emit('driver:location', data);
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        notifications,
        unreadCount,
        markAllRead,
        emitLocation,
        driverLocations,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
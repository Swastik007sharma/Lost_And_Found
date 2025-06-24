import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotificationsBar from './common/NotificationsBar';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 data-[theme=dark]:bg-gray-700 text-gray-800 data-[theme=dark]:text-gray-200 hover:scale-105 transition duration-200 ease-in-out"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function Layout() {
  const { user, addNotification, removeNotification, notifications, socket } = useContext(AuthContext);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('joinUserRoom', user.id);

    const handleNewNotification = (notification) => {
      addNotification({ ...notification, id: Date.now() });
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, user, addNotification]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar socket={socket} themeToggle={<ThemeToggle />} />
      <NotificationsBar />
      <main className="flex-1 bg-[var(--bg-color)] text-[var(--text-color)] font-sans py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Outlet context={{ socket }} />
      </main>
      <footer className="bg-gray-800 text-white py-4 data-[theme=dark]:bg-gray-950">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Lost & Found. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
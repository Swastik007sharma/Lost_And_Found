import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, token, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className='bg-blue-600 text-white p-4 shadow-md'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link to='/' className='text-xl font-bold'>Lost & Found</Link>
        <div className='hidden md:flex items-center space-x-6'>
          {token ? (
            <>
              <Link to='/' className='hover:underline'>Home</Link>
              <Link to='/notifications' className='hover:underline'>Notifications</Link>
              <Link to='/items/create' className='hover:underline'>Post Item</Link>
              <div ref={profileRef} className='relative'>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className='w-10 h-10 flex items-center justify-center bg-blue-800 rounded-full text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400'
                >
                  {getInitial()}
                </button>
                {isProfileOpen && (
                  <div className='absolute top-12 right-0 w-64 bg-white text-gray-800 rounded-md shadow-lg p-4 z-10'>
                    <p className='text-sm font-semibold'>{user?.name || 'User'}</p>
                    <p className='text-xs text-gray-600 mb-2'>{user?.email || 'email@example.com'}</p>
                    <button
                      onClick={() => navigate('/profile')}
                      className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 mb-2'
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className='w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200'
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to='/login' className='hover:underline'>Login</Link>
              <Link to='/register' className='hover:underline'>Register</Link>
            </>
          )}
        </div>
        <div className='md:hidden flex items-center space-x-4'>
          {token ? (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='focus:outline-none'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16m-7 6h7' />
              </svg>
            </button>
          ) : (
            <div className='flex space-x-4'>
              <Link to='/login' className='hover:underline'>Login</Link>
              <Link to='/register' className='hover:underline'>Register</Link>
            </div>
          )}
        </div>
      </div>
      {isMobileMenuOpen && token && (
        <div
          ref={mobileMenuRef}
          className='fixed top-0 left-0 w-64 h-full bg-blue-600 text-white shadow-lg z-20 transform transition-transform duration-300 ease-in-out md:hidden'
        >
          <div className='p-4'>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className='absolute top-4 left-4 focus:outline-none'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
            <div className='flex items-center justify-center mt-12 mb-6'>
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className='w-12 h-12 flex items-center justify-center bg-blue-800 rounded-full text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400'
              >
                {getInitial()}
              </button>
            </div>
            <div className='flex flex-col space-y-4 text-center'>
              <Link to='/' onClick={() => setIsMobileMenuOpen(false)} className='hover:underline'>Home</Link>
              <Link to='/notifications' onClick={() => setIsMobileMenuOpen(false)} className='hover:underline'>Notifications</Link>
              <Link to='/items/create' onClick={() => setIsMobileMenuOpen(false)} className='hover:underline'>Post Item</Link>
              <button
                onClick={handleLogout}
                className='bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition duration-200'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

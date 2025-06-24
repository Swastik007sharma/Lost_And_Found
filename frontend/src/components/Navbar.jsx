import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaBell, FaPlus, FaComments, FaBars, FaTimes, FaTachometerAlt, FaShieldAlt } from 'react-icons/fa';

function Navbar({ socket, themeToggle }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, token, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
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

  const getInitial = () => user?.name?.charAt(0).toUpperCase() || 'U';
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="bg-blue-600 text-white p-4 sm:p-6 shadow-lg animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
          Lost & Found
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {token ? (
            <>
              <NavLink to="/" label="Home" icon={<FaHome />} active={location.pathname === '/'} />
              <NavLink to="/notifications" label="Notifications" icon={<FaBell />} active={location.pathname === '/notifications'} />
              <NavLink to="/items/create" label="Post Item" icon={<FaPlus />} active={location.pathname === '/items/create'} />
              <NavLink to="/conversations" label="Conversations" icon={<FaComments />} active={location.pathname === '/conversations'} />
              <NavLink to="/dashboard" label="Dashboard" icon={<FaTachometerAlt />} active={location.pathname === '/dashboard'} className="bg-purple-700 hover:bg-purple-800 px-2 py-1 rounded-md" activeClassName="bg-purple-800" />
              {isAdmin && (
                <NavLink to="/admin" label="Admin" icon={<FaShieldAlt />} active={location.pathname === '/admin'} className="bg-green-700 hover:bg-green-800 px-2 py-1 rounded-md" activeClassName="bg-green-800" />
              )}
              {themeToggle}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-800 rounded-full text-lg font-semibold hover:scale-105 focus:ring-2 ring-offset-2 ring-blue-300 transition"
                >
                  {getInitial()}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-md shadow-xl z-30 border animate-fade-in-down">
                    <div className="p-4">
                      <p className="text-sm font-semibold">{user?.name}</p>
                      <p className="text-xs text-gray-600 mb-4 truncate">{user?.email}</p>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileOpen(false);
                        }}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2 mb-2 text-sm hover:scale-105"
                      >
                        <FaUser /> Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 flex items-center justify-center gap-2 text-sm hover:scale-105"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" label="Login" active={location.pathname === '/login'} />
              <NavLink to="/register" label="Register" active={location.pathname === '/register'} />
              {themeToggle}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          {token ? (
            !isMobileMenuOpen && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="hover:text-blue-200 hover:scale-105"
              >
                <FaBars className="w-6 h-6" />
              </button>
            )
          ) : (
            <div className="flex gap-4">
              <NavLink to="/login" label="Login" active={location.pathname === '/login'} />
              <NavLink to="/register" label="Register" active={location.pathname === '/register'} />
              {themeToggle}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && token && (
        <div
          ref={mobileMenuRef}
          className="fixed top-0 left-0 w-64 h-full bg-blue-700 text-white z-50 shadow-lg animate-fade-in-left"
        >
          <div className="relative p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-3 left-3 hover:text-blue-200"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="w-12 h-12 flex items-center justify-center bg-blue-900 rounded-full text-xl font-semibold hover:scale-105"
              >
                {getInitial()}
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <MobileNavLink to="/" label="Home" icon={<FaHome />} active={location.pathname === '/'} onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/notifications" label="Notifications" icon={<FaBell />} active={location.pathname === '/notifications'} onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/items/create" label="Post Item" icon={<FaPlus />} active={location.pathname === '/items/create'} onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/conversations" label="Conversations" icon={<FaComments />} active={location.pathname === '/conversations'} onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/dashboard" label="Dashboard" icon={<FaTachometerAlt />} active={location.pathname === '/dashboard'} className="bg-purple-700" onClick={() => setIsMobileMenuOpen(false)} />
              {isAdmin && (
                <MobileNavLink to="/admin" label="Admin" icon={<FaShieldAlt />} active={location.pathname === '/admin'} className="bg-green-700" onClick={() => setIsMobileMenuOpen(false)} />
              )}
              <div className="flex justify-center mt-4">{themeToggle}</div>
              <button
                onClick={handleLogout}
                className="bg-red-600 mt-2 text-sm text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 mx-auto hover:scale-105"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

const NavLink = ({ to, label, icon, active, className = '', activeClassName = '' }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-2 py-2 transition duration-150 ease-in-out rounded-md
      ${active ? `bg-blue-700 text-blue-100 font-semibold ${activeClassName}` : 'hover:bg-blue-700 hover:text-blue-100'} ${className}`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    <span className="hidden md:inline text-sm">{label}</span>
  </Link>
);

const MobileNavLink = ({ to, label, icon, active, className = '', activeClassName = '', onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`text-sm transition duration-200 ease-in-out flex items-center justify-center gap-2 hover:scale-105 hover:text-blue-200 hover:bg-blue-600 rounded-md py-2 px-4 ${
      active ? `bg-blue-800 font-semibold ${activeClassName}` : ''
    } ${className}`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    {label}
  </Link>
);

export default Navbar;

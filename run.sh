# Script: update_navbar_with_profile_right.ps1
$BaseDir = "C:\Users\91722\OneDrive\Desktop\Projects\CornerStone\Lost_And_Found\frontend"

if (-not (Test-Path $BaseDir)) {
  Write-Error "Frontend directory not found at $BaseDir"
  exit 1
}

Set-Location $BaseDir

# Update Navbar.jsx
Set-Content -Path "src/components/Navbar.jsx" -Value @"
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className='bg-blue-600 text-white p-4 shadow-md'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link to='/' className='text-xl font-bold'>Lost & Found</Link>
        <div className='flex items-center space-x-6'>
          <div className='flex items-center space-x-6'>
            <Link to='/' className='hover:underline hidden md:block'>Home</Link>
            {token ? (
              <>
                <Link to='/profile' className='hover:underline'>Profile</Link>
                <Link to='/notifications' className='hover:underline'>Notifications</Link>
                <Link to='/items/create' className='hover:underline'>Post Item</Link>
              </>
            ) : (
              <>
                <Link to='/login' className='hover:underline'>Login</Link>
                <Link to='/register' className='hover:underline'>Register</Link>
              </>
            )}
          </div>
          {token && (
            <div className='relative'>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className='w-10 h-10 flex items-center justify-center bg-blue-800 rounded-full text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400'
              >
                {getInitial()}
              </button>
              {isProfileOpen && (
                <div className='absolute top-12 right-0 w-64 bg-white text-gray-800 rounded-md shadow-lg p-4 z-10'>
                  <p className='text-sm font-semibold'>{user?.name || 'User'}</p>
                  <p className='text-xs text-gray-600 mb-4'>{user?.email || 'email@example.com'}</p>
                  <button
                    onClick={handleLogout}
                    className='w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          {token && (
            <button
              onClick={handleLogout}
              className='bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition duration-200 md:hidden'
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
"@

Write-Host "Navbar updated: profile on right, website name on left. Run 'npm run dev' from $BaseDir to test."
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './common/Loader'

function AdminRoute({ children }) {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  if (!token) {
    console.log('No token, redirecting to /login');
    return <Navigate to='/login' replace />;
  }

  if (!user) {
    console.log('No user data, redirecting to /');
    return <Navigate to='/' replace />;
  }

  const isAdmin = user.role === 'admin' || user.role === 'Admin' || user.role === 'administrator';

  if (!isAdmin) {
    return <Navigate to='/' replace />;
  }

  return children;
}

export default AdminRoute;

# Script: create_admin_dashboard_with_create_account.ps1
$BaseDir = "C:\Users\91722\OneDrive\Desktop\Projects\CornerStone\Lost_And_Found\frontend"

if (-not (Test-Path $BaseDir)) {
  Write-Error "Frontend directory not found at $BaseDir"
  exit 1
}

Set-Location $BaseDir

# Update api.js
Set-Content -Path "src/services/api.js" -Value @"
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer \${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const getDashboardStats = () => api.get('/dashboard-stats');
export const getUsers = () => api.get('/users');
export const deleteUser = (userId) => api.delete(`/users/\${userId}`);
export const getItems = (params) => api.get('/items', { params });
export const deleteItem = (itemId) => api.delete(`/items/\${itemId}`);
export const getKeepers = () => api.get('/keepers');
export const getConversations = (userId, params) => api.get(`/conversations/\${userId}`, { params });
export const getMessages = (conversationId, params) => api.get(`/conversations/\${conversationId}/messages`, { params });
export const getNotifications = (params) => api.get('/notifications', { params });

export default api;
"@

# Create AdminDashboard.jsx
Set-Content -Path "src/pages/AdminDashboard.jsx" -Value @"
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getDashboardStats, getUsers, deleteUser, getItems, deleteItem, getKeepers, getConversations, getMessages, getNotifications, register } from '../services/api';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalItems: 0, claimedItems: 0 });
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [keepers, setKeepers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsResponse = await getDashboardStats();
        setStats({
          totalUsers: statsResponse.data.totalUsers || 0,
          totalItems: statsResponse.data.totalItems || 0,
          claimedItems: statsResponse.data.claimedItems || 0,
        });

        const usersResponse = await getUsers();
        setUsers(usersResponse.data.users || []);

        const itemsResponse = await getItems({ page: 1, limit: 10 });
        setItems(itemsResponse.data.items || []);

        const keepersResponse = await getKeepers();
        setKeepers(keepersResponse.data.keepers || []);

        const conversationsResponse = await getConversations(user._id, { page: 1, limit: 10 });
        setConversations(conversationsResponse.data.conversations || []);

        const notificationsResponse = await getNotifications({ page: 1, limit: 10 });
        setNotifications(notificationsResponse.data.notifications || []);
      } catch (err) {
        setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user._id]);

  const handleConversationClick = async (conversationId) => {
    setSelectedConversation(conversationId);
    try {
      const messagesResponse = await getMessages(conversationId, { page: 1, limit: 10 });
      setMessages(messagesResponse.data.messages || []);
    } catch (err) {
      setError('Failed to load messages: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((u) => u._id !== userId));
      } catch (err) {
        setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId);
        setItems(items.filter((item) => item._id !== itemId));
      } catch (err) {
        setError('Failed to delete item: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register({
        name: accountForm.name,
        email: accountForm.email,
        password: accountForm.password,
        role: accountForm.role,
      });
      alert('Account created successfully: ' + response.data.user.email);
      const usersResponse = await getUsers();
      setUsers(usersResponse.data.users || []);
      setAccountForm({ name: '', email: '', password: '', role: 'admin' });
    } catch (err) {
      setError('Failed to create account: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>
      {error && <p className='text-red-500 mb-4'>{error}</p>}

      <div className='flex space-x-4 mb-6 border-b'>
        {['overview', 'users', 'items', 'keepers', 'conversations', 'notifications', 'create-account'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-semibold \${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h2 className='text-xl font-semibold'>Total Users</h2>
                <p className='text-3xl mt-2'>{stats.totalUsers}</p>
              </div>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h2 className='text-xl font-semibold'>Total Items</h2>
                <p className='text-3xl mt-2'>{stats.totalItems}</p>
              </div>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h2 className='text-xl font-semibold'>Claimed Items</h2>
                <p className='text-3xl mt-2'>{stats.claimedItems}</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-2xl font-semibold mb-4'>Manage Users</h2>
              <table className='min-w-full table-auto'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-left'>Email</th>
                    <th className='px-4 py-2 text-left'>Role</th>
                    <th className='px-4 py-2 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className='border-t'>
                      <td className='px-4 py-2'>{u.name}</td>
                      <td className='px-4 py-2'>{u.email}</td>
                      <td className='px-4 py-2'>{u.role}</td>
                      <td className='px-4 py-2'>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className='bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600'
                          disabled={u._id === user._id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'items' && (
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-2xl font-semibold mb-4'>Manage Items</h2>
              <table className='min-w-full table-auto'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-left'>Title</th>
                    <th className='px-4 py-2 text-left'>Status</th>
                    <th className='px-4 py-2 text-left'>Posted By</th>
                    <th className='px-4 py-2 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className='border-t'>
                      <td className='px-4 py-2'>{item.title}</td>
                      <td className='px-4 py-2'>{item.status}</td>
                      <td className='px-4 py-2'>{item.postedBy?.name || 'Unknown'}</td>
                      <td className='px-4 py-2'>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className='bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'keepers' && (
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-2xl font-semibold mb-4'>Manage Keepers</h2>
              <table className='min-w-full table-auto'>
                <thead>
                  <tr>
                    <th className='px-4 py-2 text-left'>Name</th>
                    <th className='px-4 py-2 text-left'>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {keepers.map((keeper) => (
                    <tr key={keeper._id} className='border-t'>
                      <td className='px-4 py-2'>{keeper.name}</td>
                      <td className='px-4 py-2'>{keeper.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-2xl font-semibold mb-4'>Manage Conversations</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>Conversations</h3>
                  <ul className='space-y-2'>
                    {conversations.map((conv) => (
                      <li
                        key={conv._id}
                        onClick={() => handleConversationClick(conv._id)}
                        className={`p-2 rounded-md cursor-pointer \${selectedConversation === conv._id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      >
                        {conv.item?.title} - {conv.participants.map((p) => p.name).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>Messages</h3>
                  {selectedConversation ? (
                    <div className='border rounded-md p-4 h-64 overflow-y-auto'>
                      {messages.map((msg) => (
                        <div key={msg._id} className='mb-2'>
                          <p className='text-sm text-gray-600'>{msg.sender?.name} ({new Date(msg.createdAt).toLocaleString()}):</p>
                          <p>{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Select a conversation to view messages.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-2xl font-semibold mb-4'>Notifications</h2>
              <ul className='space-y-2'>
                {notifications.map((notif) => (
                  <li key={notif._id} className={`p-2 rounded-md \${notif.isRead ? 'bg-gray-100' : 'bg-blue-50'}`}>
                    <p>{notif.message}</p>
                    <p className='text-sm text-gray-600'>{new Date(notif.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'create-account' && (
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-2xl font-semibold mb-4'>Create Admin/Keeper Account</h2>
              <form onSubmit={handleCreateAccount} className='space-y-4'>
                <div>
                  <label htmlFor='name' className='block text-sm font-medium text-gray-700'>Name</label>
                  <input
                    id='name'
                    type='text'
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className='mt-1 block w-full border rounded-md p-2'
                    required
                  />
                </div>
                <div>
                  <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email</label>
                  <input
                    id='email'
                    type='email'
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className='mt-1 block w-full border rounded-md p-2'
                    required
                  />
                </div>
                <div>
                  <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password</label>
                  <input
                    id='password'
                    type='password'
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    className='mt-1 block w-full border rounded-md p-2'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Role</label>
                  <div className='flex space-x-4'>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        name='role'
                        value='admin'
                        checked={accountForm.role === 'admin'}
                        onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                        className='mr-2'
                      />
                      Admin
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        name='role'
                        value='keeper'
                        checked={accountForm.role === 'keeper'}
                        onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                        className='mr-2'
                      />
                      Keeper
                    </label>
                  </div>
                </div>
                <button
                  type='submit'
                  className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200'
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
"@

Write-Host "AdminDashboard created with all features including Create Account. Run 'npm run dev' to test."
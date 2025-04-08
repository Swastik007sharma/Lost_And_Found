import { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getDashboardStats, getUsers, toggleUserActivation, getItems, toggleItemActivation, getKeepers, getConversations, register, getAllCategoriesForAdmin, addCategory, updateCategory, deleteCategory } from '../services/api';
import { Link } from 'react-router-dom';
import useClickOutside from '../hooks/useClickOutside';

// Users Tab Component
function UsersTab({ user, page, setPage, totalPages, setTotalPages, limit }) {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userOrder, setUserOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const selectedUser = useRef(null);
  const userCardRef = useRef(null);

  useClickOutside(userCardRef, () => (selectedUser.current = null));

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers({ page: page.users, limit, search: userSearch, sortBy: userSortBy, order: userOrder });
      setUsers(response.data.users || []);
      setTotalPages(prev => ({ ...prev, users: response.data.pagination?.totalPages || 1 }));
    } catch (err) {
      setError('Failed to load users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page.users, limit, userSearch, userSortBy, userOrder, setTotalPages]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(debounceFetch);
  }, [fetchUsers]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const handleToggleUserActivation = useCallback(async (userId, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this user?`)) {
      setLoading(true);
      try {
        await toggleUserActivation(userId);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
        setSuccess(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      } catch (err) {
        setError('Failed to toggle user activation: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const userSearchSection = useMemo(() => (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
      <input
        type="text"
        placeholder="Search by name, email, or role..."
        value={userSearch}
        onChange={(e) => {
          setUserSearch(e.target.value);
          setPage(prev => ({ ...prev, users: 1 }));
        }}
        className="w-full sm:w-1/3 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
      />
      <select
        value={userSortBy}
        onChange={(e) => {
          setUserSortBy(e.target.value);
          setPage(prev => ({ ...prev, users: 1 }));
        }}
        className="w-full sm:w-1/3 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
      >
        <option value="name">Name</option>
        <option value="email">Email</option>
        <option value="createdAt">Created At</option>
      </select>
      <select
        value={userOrder}
        onChange={(e) => {
          setUserOrder(e.target.value);
          setPage(prev => ({ ...prev, users: 1 }));
        }}
        className="w-full sm:w-1/3 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  ), [userSearch, userSortBy, userOrder, setPage]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300">
      {userSearchSection}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Users</h2>
      {(success || error) && (
        <div className="mb-4">
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md animate-fade-in">
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md animate-fade-in">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full table-auto border-collapse bg-white">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="px-6 py-4 border-b">Name</th>
                  <th className="px-6 py-4 border-b">Email</th>
                  <th className="px-6 py-4 border-b">Role</th>
                  <th className="px-6 py-4 border-b">Status</th>
                  <th className="px-6 py-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{u.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-3">
                      <button
                        onClick={() => (selectedUser.current = u)}
                        className={`bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm ${u._id === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={u._id === user._id}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleUserActivation(u._id, u.isActive)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm ${u.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white ${u._id === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={u._id === user._id}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(prev => ({ ...prev, users: Math.max(prev.users - 1, 1) }))}
              disabled={page.users === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 font-medium">Page {page.users} of {totalPages.users}</span>
            <button
              onClick={() => setPage(prev => ({ ...prev, users: Math.min(prev.users + 1, totalPages.users) }))}
              disabled={page.users === totalPages.users}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
            >
              Next
            </button>
          </div>
          {selectedUser.current && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div ref={userCardRef} className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">User Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div><p><strong>Name:</strong> {selectedUser.current.name}</p></div>
                  <div><p><strong>Email:</strong> {selectedUser.current.email}</p></div>
                  <div><p><strong>Role:</strong> {selectedUser.current.role}</p></div>
                  <div><p><strong>Status:</strong> {selectedUser.current.isActive ? 'Active' : 'Inactive'}</p></div>
                  <div><p><strong>Joined:</strong> {new Date(selectedUser.current.createdAt).toLocaleDateString()}</p></div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <Link to={`/users/${selectedUser.current._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm">View More</Link>
                  <button onClick={() => (selectedUser.current = null)} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors duration-200 shadow-sm">Close</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Items Tab Component
function ItemsTab({ page, setPage, totalPages, setTotalPages, limit }) {
  const [items, setItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [itemSortBy, setItemSortBy] = useState('createdAt');
  const [itemOrder, setItemOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getItems({ page: page.items, limit, search: itemSearch, sortBy: itemSortBy, order: itemOrder });
      setItems(response.data.items || []);
      setTotalPages(prev => ({ ...prev, items: response.data.pagination?.totalPages || 1 }));
    } catch (err) {
      setError('Failed to load items: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page.items, limit, itemSearch, itemSortBy, itemOrder, setTotalPages]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(debounceFetch);
  }, [fetchItems]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const handleToggleItemActivation = useCallback(async (itemId, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this item?`)) {
      setLoading(true);
      try {
        await toggleItemActivation(itemId);
        setItems(prev => prev.map(i => i._id === itemId ? { ...i, isActive: !isActive } : i));
        setSuccess(`Item ${!isActive ? 'activated' : 'deactivated'} successfully`);
      } catch (err) {
        setError('Failed to toggle item activation: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const itemSearchSection = useMemo(() => (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
      <input
        type="text"
        placeholder="Search by title, description, or status..."
        value={itemSearch}
        onChange={(e) => {
          setItemSearch(e.target.value);
          setPage(prev => ({ ...prev, items: 1 }));
        }}
        className="w-full sm:w-1/3 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
      />
      <select
        value={itemSortBy}
        onChange={(e) => {
          setItemSortBy(e.target.value);
          setPage(prev => ({ ...prev, items: 1 }));
        }}
        className="w-full sm:w-1/3 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
      >
        <option value="title">Title</option>
        <option value="status">Status</option>
        <option value="createdAt">Created At</option>
      </select>
      <select
        value={itemOrder}
        onChange={(e) => {
          setItemOrder(e.target.value);
          setPage(prev => ({ ...prev, items: 1 }));
        }}
        className="w-full sm:w-1/3 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  ), [itemSearch, itemSortBy, itemOrder, setPage]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300">
      {itemSearchSection}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Items</h2>
      {(success || error) && (
        <div className="mb-4">
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md animate-fade-in">
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md animate-fade-in">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full table-auto border-collapse bg-white">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="px-6 py-4 border-b">Title</th>
                  <th className="px-6 py-4 border-b">Status</th>
                  <th className="px-6 py-4 border-b">Posted By</th>
                  <th className="px-6 py-4 border-b">Category</th>
                  <th className="px-6 py-4 border-b">Active Status</th>
                  <th className="px-6 py-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-800">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.postedBy?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-3">
                      <Link to={`/items/${item._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm">View</Link>
                      <button
                        onClick={() => handleToggleItemActivation(item._id, item.isActive)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm ${item.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(prev => ({ ...prev, items: Math.max(prev.items - 1, 1) }))}
              disabled={page.items === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 font-medium">Page {page.items} of {totalPages.items}</span>
            <button
              onClick={() => setPage(prev => ({ ...prev, items: Math.min(prev.items + 1, totalPages.items) }))}
              disabled={page.items === totalPages.items}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Main AdminDashboard Component
function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [keepers, setKeepers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [page, setPage] = useState({ users: 1, items: 1, conversations: 1, categories: 1 });
  const [totalPages, setTotalPages] = useState({ users: 1, items: 1, conversations: 1, categories: 1 });
  const limit = 10;

  const selectedCategory = useRef(null);
  const categoryCardRef = useRef(null);
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', description: '', isActive: true });

  const alertTimeout = useRef(null);
  const messagesRef = useRef(null);

  useClickOutside(categoryCardRef, () => (selectedCategory.current = null));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, keepersResponse, conversationsResponse, categoriesResponse] = await Promise.all([
        getDashboardStats(),
        getKeepers(),
        getConversations({ page: page.conversations, limit }),
        getAllCategoriesForAdmin({ page: page.categories, limit }),
      ]);
      setStats(statsResponse.data.stats || {});
      setKeepers(keepersResponse.data.keepers || []);
      setConversations(conversationsResponse.data.conversations || []);
      setTotalPages(prev => ({ ...prev, conversations: conversationsResponse.data.pagination?.totalPages || 1 }));
      setCategories(categoriesResponse.data.categories || []);
      setTotalPages(prev => ({ ...prev, categories: categoriesResponse.data.pagination?.totalPages || 1 }));
    } catch (err) {
      setError('Failed to load data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page.conversations, page.categories, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (success || error) {
      alertTimeout.current = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(alertTimeout.current);
    }
  }, [success, error]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await register(accountForm);
      setSuccess(`Account created successfully for ${response.data.user.email}`);
      setAccountForm({ name: '', email: '', password: '', role: 'admin' });
      const statsResponse = await getDashboardStats();
      setStats(statsResponse.data.stats || {});
    } catch (err) {
      setError('Failed to create account: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await addCategory(categoryForm);
      setCategories([...categories, response.data.category]);
      setSuccess(`Category added successfully: ${response.data.category.name}`);
      setCategoryForm({ name: '', description: '' });
    } catch (err) {
      setError('Failed to add category: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    selectedCategory.current = category;
    setEditCategoryForm({ ...category });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await updateCategory(selectedCategory.current._id, editCategoryForm);
      setCategories(categories.map((cat) => 
        cat._id === selectedCategory.current._id ? response.data.category : cat
      ));
      setSuccess(`Category updated successfully: ${response.data.category.name}`);
      selectedCategory.current = null;
    } catch (err) {
      setError('Failed to update category: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to deactivate this category?')) {
      setLoading(true);
      try {
        await deleteCategory(categoryId);
        setCategories(categories.filter((cat) => cat._id !== categoryId));
        setSuccess('Category deactivated successfully');
      } catch (err) {
        setError('Failed to deactivate category: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  useEffect(() => {
    if (messagesRef.current && selectedConversation) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [selectedConversation, selectedConversation?.messages]);

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen transition-all duration-300">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center animate-fade-in-down">Admin Dashboard</h1>

      {(success || error) && (
        <div className="fixed top-6 right-6 z-50 w-full max-w-sm">
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md animate-fade-in">
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md animate-fade-in">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-300 pb-2">
        {['overview', 'users', 'items', 'keepers', 'conversations', 'categories', 'create-account'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'}`}
          >
            {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(stats).map(([key, value]) => {
                if (key === 'mostActiveUsers') return null;
                return (
                  <div key={key} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h2>
                    <p className="text-3xl text-blue-600 font-bold">{value}</p>
                  </div>
                );
              })}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 col-span-1 sm:col-span-2 lg:col-span-3">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Most Active Users</h2>
                {stats.mostActiveUsers?.length > 0 ? (
                  <ul className="space-y-3">
                    {stats.mostActiveUsers.map((activeUser) => (
                      <li key={activeUser.userId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <span className="text-sm text-gray-700">{activeUser.name} ({activeUser.email})</span>
                        <span className="text-sm text-blue-600 font-medium">{activeUser.itemCount} items</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">No active users yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UsersTab user={user} page={page} setPage={setPage} totalPages={totalPages} setTotalPages={setTotalPages} limit={limit} />
          )}

          {activeTab === 'items' && (
            <ItemsTab page={page} setPage={setPage} totalPages={totalPages} setTotalPages={setTotalPages} limit={limit} />
          )}

          {activeTab === 'keepers' && (
            <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Keepers</h2>
              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full table-auto border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                      <th className="px-6 py-4 border-b">Name</th>
                      <th className="px-6 py-4 border-b">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keepers.map((keeper) => (
                      <tr key={keeper._id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-800">{keeper.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{keeper.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Conversations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Conversations</h3>
                  <ul className="space-y-3 max-h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow-inner">
                    {conversations.map((conv) => (
                      <li
                        key={conv._id}
                        onClick={() => handleConversationClick(conv)}
                        className={`p-3 rounded-lg cursor-pointer text-sm ${selectedConversation?._id === conv._id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 text-gray-700'} transition-colors duration-200`}
                      >
                        {conv.item?.title} ({conv.item?.status}) - {conv.participants.map((p) => p.name).join(', ')}
                        <p className="text-xs text-gray-500 mt-1">
                          Last Message: {conv.lastMessage?.content || 'No messages yet'} ({new Date(conv.lastMessage?.createdAt || 0).toLocaleString()})
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setPage(prev => ({ ...prev, conversations: Math.max(prev.conversations - 1, 1) }))}
                      disabled={page.conversations === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 font-medium">Page {page.conversations} of {totalPages.conversations}</span>
                    <button
                      onClick={() => setPage(prev => ({ ...prev, conversations: Math.min(prev.conversations + 1, totalPages.conversations) }))}
                      disabled={page.conversations === totalPages.conversations}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Messages</h3>
                  {selectedConversation ? (
                    <div ref={messagesRef} className="border border-gray-200 rounded-lg p-4 h-80 overflow-y-auto bg-gray-50 shadow-inner">
                      {selectedConversation.messages.map((msg) => (
                        <div key={msg._id} className="mb-3 p-3 bg-white rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600">
                            {msg.sender?.name} ({new Date(msg.createdAt).toLocaleString()}):
                          </p>
                          <p className="text-sm text-gray-800 mt-1">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg shadow-inner">Select a conversation to view messages.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300">
              <div className="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      id="category-name"
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="category-description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Category'}
                  </button>
                </form>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Categories</h3>
                {categories.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg shadow-sm">
                    <table className="min-w-full table-auto border-collapse bg-white">
                      <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                          <th className="px-6 py-4 border-b">Name</th>
                          <th className="px-6 py-4 border-b">Description</th>
                          <th className="px-6 py-4 border-b">Status</th>
                          <th className="px-6 py-4 border-b">Created At</th>
                          <th className="px-6 py-4 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category._id} className="border-t hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 text-sm text-gray-800">{category.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{category.description || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">
                              <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">{new Date(category.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm flex gap-3">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                className={`bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 shadow-sm ${!category.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!category.isActive}
                              >
                                Deactivate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        onClick={() => setPage(prev => ({ ...prev, categories: Math.max(prev.categories - 1, 1) }))}
                        disabled={page.categories === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700 font-medium">Page {page.categories} of {totalPages.categories}</span>
                      <button
                        onClick={() => setPage(prev => ({ ...prev, categories: Math.min(prev.categories + 1, totalPages.categories) }))}
                        disabled={page.categories === totalPages.categories}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg shadow-inner">No categories available.</p>
                )}
              </div>
            </div>
          )}

          {selectedCategory.current && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div ref={categoryCardRef} className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Edit Category</h3>
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                  <div>
                    <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      id="edit-category-name"
                      type="text"
                      value={editCategoryForm.name}
                      onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-category-description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="edit-category-description"
                      value={editCategoryForm.description}
                      onChange={(e) => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          value="true"
                          checked={editCategoryForm.isActive === true}
                          onChange={() => setEditCategoryForm({ ...editCategoryForm, isActive: true })}
                          className="mr-2 text-blue-600 focus:ring-blue-400"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          value="false"
                          checked={editCategoryForm.isActive === false}
                          onChange={() => setEditCategoryForm({ ...editCategoryForm, isActive: false })}
                          className="mr-2 text-blue-600 focus:ring-blue-400"
                        />
                        <span className="text-sm text-gray-700">Inactive</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => (selectedCategory.current = null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors duration-200 shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'create-account' && (
            <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 max-w-lg mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Admin/Keeper Account</h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={accountForm.role === 'admin'}
                        onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                        className="mr-2 text-blue-600 focus:ring-blue-400"
                      />
                      <span className="text-sm text-gray-700">Admin</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="keeper"
                        checked={accountForm.role === 'keeper'}
                        onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                        className="mr-2 text-blue-600 focus:ring-blue-400"
                      />
                      <span className="text-sm text-gray-700">Keeper</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
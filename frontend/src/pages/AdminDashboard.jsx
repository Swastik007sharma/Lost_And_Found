import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getDashboardStats, getUsers, deleteUser, getItems, deleteItem, getKeepers, getConversations, register, getAllCategoriesForAdmin, addCategory, updateCategory, deleteCategory } from '../services/api';
import { Link } from 'react-router-dom';
import useClickOutside from '../hooks/useClickOutside';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalItems: 0,
    claimedItems: 0,
    unclaimedItems: 0,
    totalUsers: 0,
    totalCategories: 0,
    mostActiveUsers: [],
  });
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [keepers, setKeepers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // For success messages

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [conversationsTotalPages, setConversationsTotalPages] = useState(1);
  const [categoriesTotalPages, setCategoriesTotalPages] = useState(1);
  const limit = 10;

  // State for user and category modals
  const [selectedUser, setSelectedUser] = useState(null);
  const userCardRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoryCardRef = useRef(null);

  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Alert timeout ref
  const alertTimeout = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsResponse, usersResponse, itemsResponse, keepersResponse, conversationsResponse, categoriesResponse] = await Promise.all([
          getDashboardStats(),
          getUsers({ page: usersPage, limit }),
          getItems({ page: itemsPage, limit }),
          getKeepers(),
          getConversations({ page: conversationsPage, limit }),
          getAllCategoriesForAdmin({ page: categoriesPage, limit }),
        ]);
        setStats({
          totalItems: statsResponse.data.stats.totalItems || 0,
          claimedItems: statsResponse.data.stats.claimedItems || 0,
          unclaimedItems: statsResponse.data.stats.unclaimedItems || 0,
          totalUsers: statsResponse.data.stats.totalUsers || 0,
          totalCategories: statsResponse.data.stats.totalCategories || 0,
          mostActiveUsers: statsResponse.data.stats.mostActiveUsers || [],
        });
        setUsers(usersResponse.data.users || []);
        setUsersTotalPages(usersResponse.data.pagination?.totalPages || 1);
        setItems(itemsResponse.data.items || []);
        setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
        setKeepers(keepersResponse.data.keepers || []);
        setConversations(conversationsResponse.data.conversations || []);
        setConversationsTotalPages(conversationsResponse.data.pagination?.totalPages || 1);
        setCategories(categoriesResponse.data.categories || []);
        setCategoriesTotalPages(categoriesResponse.data.pagination?.totalPages || 1);
      } catch (err) {
        setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usersPage, itemsPage, conversationsPage, categoriesPage]);

  useEffect(() => {
    if (success || error) {
      alertTimeout.current = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000); // Auto-clear after 3 seconds
    }
    return () => clearTimeout(alertTimeout.current);
  }, [success, error]);

  useClickOutside(userCardRef, () => setSelectedUser(null));
  useClickOutside(categoryCardRef, () => setSelectedCategory(null));

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      setLoading(true);
      try {
        await deleteUser(userId);
        setUsers(users.filter((u) => u._id !== userId));
        const statsResponse = await getDashboardStats();
        setStats({
          ...stats,
          totalUsers: statsResponse.data.stats.totalUsers || 0,
          mostActiveUsers: statsResponse.data.stats.mostActiveUsers || [],
        });
        setSuccess('User deactivated successfully');
      } catch (err) {
        setError('Failed to deactivate user: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to deactivate this item?')) {
      setLoading(true);
      try {
        await deleteItem(itemId);
        setItems(items.filter((item) => item._id !== itemId));
        const statsResponse = await getDashboardStats();
        setStats({
          ...stats,
          totalItems: statsResponse.data.stats.totalItems || 0,
          claimedItems: statsResponse.data.stats.claimedItems || 0,
          unclaimedItems: statsResponse.data.stats.unclaimedItems || 0,
        });
        setSuccess('Item deactivated successfully');
      } catch (err) {
        setError('Failed to deactivate item: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
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
      setSuccess(`Account created successfully for ${response.data.user.email}`);
      const usersResponse = await getUsers({ page: usersPage, limit });
      setUsers(usersResponse.data.users || []);
      setUsersTotalPages(usersResponse.data.pagination?.totalPages || 1);
      const statsResponse = await getDashboardStats();
      setStats({
        ...stats,
        totalUsers: statsResponse.data.stats.totalUsers || 0,
        mostActiveUsers: statsResponse.data.stats.mostActiveUsers || [],
      });
      setAccountForm({ name: '', email: '', password: '', role: 'admin' });
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
      const response = await addCategory({
        name: categoryForm.name,
        description: categoryForm.description,
      });
      setSuccess(`Category added successfully: ${response.data.category.name}`);
      const categoriesResponse = await getAllCategoriesForAdmin({ page: categoriesPage, limit });
      setCategories(categoriesResponse.data.categories || []);
      setCategoriesTotalPages(categoriesResponse.data.pagination?.totalPages || 1);
      const statsResponse = await getDashboardStats();
      setStats({
        ...stats,
        totalCategories: statsResponse.data.stats.totalCategories || 0,
      });
      setCategoryForm({ name: '', description: '' });
    } catch (err) {
      setError('Failed to add category: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setEditCategoryForm({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await updateCategory(selectedCategory._id, editCategoryForm);
      setSuccess(`Category updated successfully: ${response.data.category.name}`);
      const categoriesResponse = await getAllCategoriesForAdmin({ page: categoriesPage, limit });
      setCategories(categoriesResponse.data.categories || []);
      setCategoriesTotalPages(categoriesResponse.data.pagination?.totalPages || 1);
      setSelectedCategory(null);
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
        const categoriesResponse = await getAllCategoriesForAdmin({ page: categoriesPage, limit });
        setCategories(categoriesResponse.data.categories || []);
        setCategoriesTotalPages(categoriesResponse.data.pagination?.totalPages || 1);
        const statsResponse = await getDashboardStats();
        setStats({
          ...stats,
          totalCategories: statsResponse.data.stats.totalCategories || 0,
        });
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-800 text-center">Admin Dashboard</h1>

      {/* Success and Error Alerts */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-xs">
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-md shadow-md mb-2 animate-fade-in-out" role="alert">
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md shadow-md animate-fade-in-out" role="alert">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-200">
        {['overview', 'users', 'items', 'keepers', 'conversations', 'categories', 'create-account'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-semibold transition-colors duration-200 ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 bg-gray-100 rounded-t-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md'
            }`}
          >
            {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Object.entries(stats).map(([key, value]) => {
                if (key === 'mostActiveUsers') return null;
                return (
                  <div key={key} className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h2>
                    <p className="text-2xl sm:text-3xl mt-2 text-blue-600">{value}</p>
                  </div>
                );
              })}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg col-span-1 sm:col-span-2 lg:col-span-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Most Active Users</h2>
                {stats.mostActiveUsers.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.mostActiveUsers.map((activeUser) => (
                      <li key={activeUser.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                        <span className="text-sm sm:text-base">{activeUser.name} ({activeUser.email})</span>
                        <span className="text-sm sm:text-base text-blue-600">{activeUser.itemCount} items</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">No active users yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Manage Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Email</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Role</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-sm sm:text-base">{u.name}</td>
                        <td className="px-4 py-2 text-sm sm:text-base">{u.email}</td>
                        <td className="px-4 py-2 text-sm sm:text-base">{u.role}</td>
                        <td className="px-4 py-2 flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                            disabled={u._id === user._id}
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                  disabled={usersPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm sm:text-base text-gray-700">Page {usersPage} of {usersTotalPages}</span>
                <button
                  onClick={() => setUsersPage(prev => Math.min(prev + 1, usersTotalPages))}
                  disabled={usersPage === usersTotalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div
                    ref={userCardRef}
                    className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">User Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600"><strong>Name:</strong> {selectedUser.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><strong>Email:</strong> {selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><strong>Role:</strong> {selectedUser.role}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                      <Link
                        to={`/users/${selectedUser._id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                      >
                        View More
                      </Link>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Manage Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Title</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Posted By</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Category</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-sm sm:text-base">{item.title}</td>
                        <td className="px-4 py-2 text-sm sm:text-base">{item.status}</td>
                        <td className="px-4 py-2 text-sm sm:text-base">{item.postedBy?.name || 'Unknown'}</td>
                        <td className="px-4 py-2 text-sm sm:text-base">{item.category?.name || 'N/A'}</td>
                        <td className="px-4 py-2 flex flex-wrap gap-2">
                          <Link
                            to={`/items/${item._id}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setItemsPage(prev => Math.max(prev - 1, 1))}
                  disabled={itemsPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm sm:text-base text-gray-700">Page {itemsPage} of {itemsTotalPages}</span>
                <button
                  onClick={() => setItemsPage(prev => Math.min(prev + 1, itemsTotalPages))}
                  disabled={itemsPage === itemsTotalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Keepers Tab */}
          {activeTab === 'keepers' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Manage Keepers</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keepers.map((keeper) => (
                      <tr key={keeper._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-sm sm:text-base">{keeper.name}</td>
                        <td className="px-4 py-2 text-sm sm:text-base">{keeper.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Manage Conversations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">Conversations</h3>
                  <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {conversations.map((conv) => (
                      <li
                        key={conv._id}
                        onClick={() => handleConversationClick(conv)}
                        className={`p-2 rounded-md cursor-pointer text-sm sm:text-base ${
                          selectedConversation?._id === conv._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                        } transition-colors`}
                      >
                        {conv.item?.title} ({conv.item?.status}) - {conv.participants.map((p) => p.name).join(', ')}
                        <p className="text-xs text-gray-500">
                          Last Message: {conv.lastMessage?.content || 'No messages yet'} ({new Date(conv.lastMessage?.createdAt || 0).toLocaleString()})
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setConversationsPage(prev => Math.max(prev - 1, 1))}
                      disabled={conversationsPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm sm:text-base text-gray-700">Page {conversationsPage} of {conversationsTotalPages}</span>
                    <button
                      onClick={() => setConversationsPage(prev => Math.min(prev + 1, conversationsTotalPages))}
                      disabled={conversationsPage === conversationsTotalPages}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">Messages</h3>
                  {selectedConversation ? (
                    <div className="border rounded-md p-4 h-80 overflow-y-auto bg-gray-50">
                      {selectedConversation.messages.map((msg) => (
                        <div key={msg._id} className="mb-2 p-2 bg-white rounded-md shadow-sm">
                          <p className="text-xs sm:text-sm text-gray-600">
                            {msg.sender?.name} ({new Date(msg.createdAt).toLocaleString()}):
                          </p>
                          <p className="text-sm sm:text-base">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm sm:text-base">Select a conversation to view messages.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Manage Categories</h2>
              {/* Add Category Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      id="category-name"
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="mt-1 block w-full border rounded-md p-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="category-description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="mt-1 block w-full border rounded-md p-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md text-sm sm:text-base hover:bg-blue-700 transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Category'}
                  </button>
                </form>
              </div>

              {/* Display Categories */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Available Categories</h3>
                {categories.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Name</th>
                          <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Description</th>
                          <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Status</th>
                          <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Created At</th>
                          <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category._id} className="border-t hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2 text-sm sm:text-base">{category.name}</td>
                            <td className="px-4 py-2 text-sm sm:text-base">{category.description || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm sm:text-base">{category.isActive ? 'Active' : 'Inactive'}</td>
                            <td className="px-4 py-2 text-sm sm:text-base">{new Date(category.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2 flex flex-wrap gap-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
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
                        onClick={() => setCategoriesPage(prev => Math.max(prev - 1, 1))}
                        disabled={categoriesPage === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm sm:text-base text-gray-700">Page {categoriesPage} of {categoriesTotalPages}</span>
                      <button
                        onClick={() => setCategoriesPage(prev => Math.min(prev + 1, categoriesTotalPages))}
                        disabled={categoriesPage === categoriesTotalPages}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">No categories available.</p>
                )}
              </div>
            </div>
          )}

          {/* Edit Category Modal */}
          {selectedCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                ref={categoryCardRef}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Edit Category</h3>
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                  <div>
                    <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      id="edit-category-name"
                      type="text"
                      value={editCategoryForm.name}
                      onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                      className="mt-1 block w-full border rounded-md p-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-category-description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="edit-category-description"
                      value={editCategoryForm.description}
                      onChange={(e) => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                      className="mt-1 block w-full border rounded-md p-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          value="true"
                          checked={editCategoryForm.isActive === true}
                          onChange={() => setEditCategoryForm({ ...editCategoryForm, isActive: true })}
                          className="mr-2"
                        />
                        Active
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          value="false"
                          checked={editCategoryForm.isActive === false}
                          onChange={() => setEditCategoryForm({ ...editCategoryForm, isActive: false })}
                          className="mr-2"
                        />
                        Inactive
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Account Tab */}
          {activeTab === 'create-account' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-lg mx-auto">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">Create Admin/Keeper Account</h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="mt-1 block w-full border rounded-md p-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className="mt-1 block w-full border rounded-md p-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    className="mt-1 block w-full border rounded-md p-2 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={accountForm.role === 'admin'}
                        onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                        className="mr-2"
                      />
                      Admin
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="keeper"
                        checked={accountForm.role === 'keeper'}
                        onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                        className="mr-2"
                      />
                      Keeper
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md text-sm sm:text-base hover:bg-blue-700 transition-colors duration-200"
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

// Animation for alerts
const styles = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  .animate-fade-in-out {
    animation: fadeInOut 3s ease-out forwards;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default AdminDashboard;
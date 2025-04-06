#!/bin/bash

# Script to update frontend files based on changes to conversation route/controller and item schema

# Define project root directory relative to the script's location
PROJECT_ROOT="./frontend"

# 1. Update src/services/api.js
echo "Updating src/services/api.js..."
cat > "$PROJECT_ROOT/src/services/api.js" << 'EOF'
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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getDashboardStats = () => api.get('/admin/dashboard-stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (userId) => api.get(`/admin/users/${userId}`);
export const getUserItems = (userId, params = {}) => api.get(`/admin/users/${userId}/items`, { params });
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const getItems = (params) => api.get('/admin/items', { params });
export const getItemById = (itemId) => api.get(`/admin/items/${itemId}`);
export const deleteItem = (itemId) => api.delete(`/admin/items/${itemId}`);
export const getKeepers = () => api.get('/keepers');
export const getConversations = (params) => api.get('/admin/conversations', { params });
export const getCategories = (params = {}) => api.get('/categories', { params });
export const getAllCategoriesForAdmin = (params = {}) => api.get('/categories/admin', { params });
export const addCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// User-specific endpoints
export const getMyItems = (params = {}) => api.get('/users/me/items', { params });
export const getMyConversations = (params = {}) => api.get('/conversations', { params });
export const createItem = (data) => {
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      // Remove Content-Type to let browser set multipart/form-data
    },
  };
  return api.post('/items', data, config);
};
export const getItemDetails = (itemId) => api.get(`/items/${itemId}`);
export const claimItem = (itemId) => api.post(`/items/${itemId}/claim`);
export const startConversation = (data) => api.post('/conversations', data);
export const updateItem = (itemId, data) => api.put(`/items/${itemId}`, data);
export const deleteUserItem = (itemId) => api.delete(`/items/${itemId}`);

export default api;
EOF

# 2. Update src/pages/UserDashboard.jsx
echo "Updating src/pages/UserDashboard.jsx..."
cat > "$PROJECT_ROOT/src/pages/UserDashboard.jsx" << 'EOF'
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyItems, getMyConversations, updateItem, deleteUserItem } from '../services/api';
import { Link } from 'react-router-dom';

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('my-items');
  const [items, setItems] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', status: '' });

  // Pagination states
  const [itemsPage, setItemsPage] = useState(1);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [conversationsTotalPages, setConversationsTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user's items
        const itemsResponse = await getMyItems({ page: itemsPage, limit });
        setItems(itemsResponse.data.items || []);
        setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);

        // Fetch user's conversations
        const conversationsResponse = await getMyConversations({ page: conversationsPage, limit });
        setConversations(conversationsResponse.data.conversations.docs || []);
        setConversationsTotalPages(conversationsResponse.data.conversations.totalPages || 1);
      } catch (err) {
        setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [itemsPage, conversationsPage, user]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleEdit = (item) => {
    setEditingItem(item._id);
    setEditFormData({
      title: item.title,
      description: item.description,
      status: item.status,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (itemId) => {
    try {
      await updateItem(itemId, editFormData);
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, ...editFormData } : item
        )
      );
      setEditingItem(null);
    } catch (err) {
      setError('Failed to update item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteUserItem(itemId);
        setItems((prev) => prev.filter((item) => item._id !== itemId));
      } catch (err) {
        setError('Failed to delete item: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (!user) {
    return <div className="container mx-auto p-4 sm:p-6 lg:p-8">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">User Dashboard</h1>
      {error && <p className="text-red-500 mb-4 text-sm sm:text-base">{error}</p>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 border-b border-gray-200">
        {['my-items', 'conversations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-semibold transition-colors duration-200 ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {tab === 'my-items' ? 'My Items' : 'Conversations'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm sm:text-base">Loading...</p>
      ) : (
        <>
          {/* My Items Tab */}
          {activeTab === 'my-items' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">My Items</h2>
                <Link
                  to="/items/create"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm sm:text-base hover:bg-blue-700 transition-colors duration-200"
                >
                  Add New Item
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Title</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Category</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Posted On</th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} className="border-t hover:bg-gray-50">
                        {editingItem === item._id ? (
                          <>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                name="title"
                                value={editFormData.title}
                                onChange={handleEditChange}
                                className="w-full p-1 border rounded-md"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <select
                                name="status"
                                value={editFormData.status}
                                onChange={handleEditChange}
                                className="w-full p-1 border rounded-md"
                              >
                                <option value="Lost">Lost</option>
                                <option value="Found">Found</option>
                                <option value="Claimed">Claimed</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">{item.category?.name || 'N/A'}</td>
                            <td className="px-4 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2 flex flex-wrap gap-2">
                              <button
                                onClick={() => handleEditSubmit(item._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingItem(null)}
                                className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-sm sm:text-base">{item.title}</td>
                            <td className="px-4 py-2 text-sm sm:text-base">{item.status}</td>
                            <td className="px-4 py-2 text-sm sm:text-base">{item.category?.name || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm sm:text-base">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-2 flex flex-wrap gap-2">
                              <Link
                                to={`/items/${item._id}`}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleEdit(item)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setItemsPage(prev => Math.max(prev - 1, 1))}
                  disabled={itemsPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm sm:text-base">
                  Page {itemsPage} of {itemsTotalPages}
                </span>
                <button
                  onClick={() => setItemsPage(prev => Math.min(prev + 1, itemsTotalPages))}
                  disabled={itemsPage === itemsTotalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">My Conversations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">Conversations</h3>
                  <ul className="space-y-2">
                    {conversations.map((conv) => (
                      <li
                        key={conv._id}
                        onClick={() => handleConversationClick(conv)}
                        className={`p-2 rounded-md cursor-pointer text-sm sm:text-base ${
                          selectedConversation?._id === conv._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                        }`}
                      >
                        {conv.item?.title} ({conv.item?.status}) - {conv.participants.map((p) => p.name).join(', ')}
                        <p className="text-xs text-gray-500">
                          Last Message: {conv.lastMessage?.content || 'No messages yet'} ({new Date(conv.lastMessage?.createdAt || 0).toLocaleString()})
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setConversationsPage(prev => Math.max(prev - 1, 1))}
                      disabled={conversationsPage === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm sm:text-base">
                      Page {conversationsPage} of {conversationsTotalPages}
                    </span>
                    <button
                      onClick={() => setConversationsPage(prev => Math.min(prev + 1, conversationsTotalPages))}
                      disabled={conversationsPage === conversationsTotalPages}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">Messages</h3>
                  {selectedConversation ? (
                    <div className="border rounded-md p-4 h-64 overflow-y-auto">
                      {selectedConversation.messages.map((msg) => (
                        <div key={msg._id} className="mb-2">
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
        </>
      )}
    </div>
  );
}

export default UserDashboard;
EOF

# 3. Update src/pages/ItemCreate.jsx
echo "Updating src/pages/ItemCreate.jsx..."
cat > "$PROJECT_ROOT/src/pages/ItemCreate.jsx" << 'EOF'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createItem } from '../services/api';

function ItemCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'Lost', // Default status
    location: '', // Location field
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null); // State for the selected image file

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.categories || []);
      } catch (err) {
        setError('Failed to load categories: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store the first selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('status', formData.status);
    data.append('location', formData.location); // Required field
    if (image) data.append('image', image); // Append image if selected

    try {
      await createItem(data);
      navigate('/dashboard'); // Redirect to user dashboard after successful submission
    } catch (err) {
      setError('Failed to create item: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Add New Item</h1>
      {error && <p className="text-red-500 mb-4 text-sm sm:text-base">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-lg mx-auto" encType="multipart/form-data">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Main Hall, Room 101"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
            Image (optional)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white text-sm sm:text-base ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default ItemCreate;
EOF

echo "Frontend updated to align with conversation route/controller and item schema changes!"
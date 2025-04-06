import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getCategories, getMyItems, updateItem, deleteUserItem } from '../services/api';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [viewType, setViewType] = useState(() => localStorage.getItem('userDashboardViewType') || 'list'); // 'list' or 'card'
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // For success alerts
  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    location: '',
    image: null,
  });
  const [currentImage, setCurrentImage] = useState(''); // For image preview

  // Pagination states
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const limit = 10;

  // Alert timeout ref
  const alertTimeout = useRef(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const itemsResponse = await getMyItems({ page: itemsPage, limit });
        setItems(itemsResponse.data.items || []);
        setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      } catch (err) {
        setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [itemsPage, user]);

  // Save viewType to localStorage
  useEffect(() => {
    localStorage.setItem('userDashboardViewType', viewType);
  }, [viewType]);

  // Clear alerts on unmount or change
  useEffect(() => {
    if (success || error) {
      alertTimeout.current = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000); // Auto-clear after 3 seconds
    }
    return () => clearTimeout(alertTimeout.current);
  }, [success, error]);

  const handleEdit = (item) => {
    setEditingItemId(item._id);
    setEditFormData({
      title: item.title,
      description: item.description,
      category: item.category?.name || '',
      status: item.status,
      location: item.location || '',
      image: null,
    });
    setCurrentImage(item.image || ''); // Set current image for preview
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      setEditFormData((prev) => ({ ...prev, image: file }));
      // Preview new image
      const reader = new FileReader();
      reader.onloadend = () => setCurrentImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (itemId) => {
    const data = new FormData();
    data.append('title', editFormData.title);
    data.append('description', editFormData.description);
    data.append('category', editFormData.category);
    data.append('status', editFormData.status);
    data.append('location', editFormData.location);
    if (editFormData.image) {
      data.append('image', editFormData.image);
    }

    try {
      await updateItem(itemId, data);
      const itemsResponse = await getMyItems({ page: itemsPage, limit }); // Refetch to update pagination
      setItems(itemsResponse.data.items || []);
      setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      setSuccess('Item updated successfully!');
      setEditingItemId(null);
      setEditFormData({
        title: '',
        description: '',
        category: '',
        status: '',
        location: '',
        image: null,
      }); // Reset form
      setCurrentImage(''); // Clear image preview
    } catch (err) {
      setError('Failed to update item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteUserItem(itemId);
        setItems((prev) => prev.filter((item) => item._id !== itemId));
        // Adjust pagination if on the last page and item count drops
        if (items.length === 1 && itemsPage > 1) {
          setItemsPage((prev) => prev - 1);
        } else {
          const itemsResponse = await getMyItems({ page: itemsPage, limit }); // Refetch to update pagination
          setItems(itemsResponse.data.items || []);
          setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
        }
        setSuccess('Item deleted successfully!');
      } catch (err) {
        setError('Failed to delete item: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-0">User Dashboard</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Link
              to="/items/create"
              className="bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Add New Item
            </Link>
            <Link
              to="/profile"
              className="bg-green-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Profile
            </Link>
            <Link
              to="/messages"
              className="bg-purple-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm sm:text-base font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Messages
            </Link>
            <Link
              to="/notifications"
              className="bg-yellow-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-yellow-700 transition-colors duration-200 text-sm sm:text-base font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Notifications
            </Link>
            <button
              onClick={() => setViewType(viewType === 'list' ? 'card' : 'list')}
              className="bg-gray-200 text-gray-800 py-2 px-3 sm:px-4 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm sm:text-base font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Switch to {viewType === 'list' ? 'Card' : 'List'} View
            </button>
          </div>
        </div>

        {/* Success and Error Alerts */}
        {(success || error) && (
          <div className="fixed top-4 right-4 z-50">
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

        {loading ? (
          <div className="flex justify-center">
            <p className="text-gray-600 text-lg animate-pulse">Loading...</p>
          </div>
        ) : (
          <div>
            {viewType === 'list' ? (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600">Image</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600">Title</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600">Status</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600">Category</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600">Posted On</th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          {editingItemId === item._id ? (
                            <>
                              <td className="px-2 sm:px-4 py-2">
                                <div className="flex flex-col items-center">
                                  {currentImage && (
                                    <img src={currentImage} alt={item.title} className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-md mb-2" />
                                  )}
                                  <input
                                    type="file"
                                    name="image"
                                    onChange={handleEditChange}
                                    className="w-full p-1 border border-gray-300 rounded-md text-xs sm:text-sm"
                                  />
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-2">
                                <input
                                  type="text"
                                  name="title"
                                  value={editFormData.title}
                                  onChange={handleEditChange}
                                  className="w-full p-1 border border-gray-300 rounded-md text-xs sm:text-sm"
                                  required
                                />
                              </td>
                              <td className="px-2 sm:px-4 py-2">
                                <select
                                  name="status"
                                  value={editFormData.status}
                                  onChange={handleEditChange}
                                  className="w-full p-1 border border-gray-300 rounded-md text-xs sm:text-sm"
                                  required
                                >
                                  <option value="Lost">Lost</option>
                                  <option value="Found">Found</option>
                                  <option value="Claimed">Claimed</option>
                                  <option value="Returned">Returned</option>
                                </select>
                              </td>
                              <td className="px-2 sm:px-4 py-2">
                                <select
                                  name="category"
                                  value={editFormData.category}
                                  onChange={handleEditChange}
                                  className="w-full p-1 border border-gray-300 rounded-md text-xs sm:text-sm"
                                  required
                                >
                                  <option value="">Select a category</option>
                                  {categories.map((category) => (
                                    <option key={category._id} value={category.name}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td className="px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <button
                                  onClick={() => handleEditSubmit(item._id)}
                                  className="bg-green-500 text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-green-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingItemId(null);
                                    setCurrentImage(''); // Clear preview on cancel
                                  }}
                                  className="bg-gray-500 text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-2 sm:px-4 py-2">
                                {item.image && <img src={item.image} alt={item.title} className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-md" />}
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">{item.title}</td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm capitalize">{item.status}</td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{item.category?.name || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td className="px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <Link
                                  to={`/items/${item._id}`}
                                  className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-yellow-600 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-red-600 transition-colors"
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
                <div className="flex justify-between items-center mt-4 sm:mt-6">
                  <button
                    onClick={() => setItemsPage((prev) => Math.max(prev - 1, 1))}
                    disabled={itemsPage === 1}
                    className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors duration-200 text-xs sm:text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-gray-600">Page {itemsPage} of {itemsTotalPages}</span>
                  <button
                    onClick={() => setItemsPage((prev) => Math.min(prev + 1, itemsTotalPages))}
                    disabled={itemsPage === itemsTotalPages}
                    className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors duration-200 text-xs sm:text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item._id)}
                    showActions={editingItemId !== item._id}
                    isEditing={editingItemId === item._id}
                    editFormData={editingItemId === item._id ? editFormData : null}
                    onEditChange={handleEditChange}
                    onEditSubmit={() => handleEditSubmit(item._id)}
                    onCancelEdit={() => {
                      setEditingItemId(null);
                      setCurrentImage(''); // Clear preview on cancel
                    }}
                  />
                ))}
              </div>
            )}
            {items.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
                <p className="text-gray-600 text-lg">No items found.</p>
              </div>
            )}
          </div>
        )}
      </div>
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

export default UserDashboard;
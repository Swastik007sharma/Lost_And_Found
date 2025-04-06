import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getItemDetails, claimItem, startConversation, updateItem } from '../services/api';

function ItemDetails() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To get the current URL
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    location: '',
    image: null,
  });
  const [removeImage, setRemoveImage] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false); // State for share feedback

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await getItemDetails(id);
        setItem(response.data.item);
        setEditFormData({
          title: response.data.item.title,
          description: response.data.item.description,
          category: response.data.item.category?.name || '',
          status: response.data.item.status,
          location: response.data.item.location,
          image: null,
        });
      } catch (err) {
        setError('Failed to load item: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value, files, type } = e.target;
    if (name === 'image' && type === 'file') {
      setEditFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (name === 'removeImage') {
      setRemoveImage(e.target.checked);
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const data = new FormData();
    data.append('title', editFormData.title);
    data.append('description', editFormData.description);
    data.append('category', editFormData.category);
    data.append('status', editFormData.status);
    data.append('location', editFormData.location);
    if (editFormData.image) {
      data.append('image', editFormData.image);
    } else if (removeImage) {
      data.append('image', ''); // Signal removal
    }

    try {
      await updateItem(id, data);
      setIsEditing(false);
      const response = await getItemDetails(id);
      setItem(response.data.item);
      setError('Item updated successfully');
    } catch (err) {
      setError('Failed to update item: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      await claimItem(id);
      alert('Item claimed successfully! The owner will be notified.');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to claim item: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartConversation = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      console.log(user);
      
      const participants = [user.id, item.postedBy._id];
      await startConversation({ itemId: id, participants });
      navigate('/conversations');
    } catch (err) {
      setError('Failed to start conversation: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const itemUrl = `${window.location.origin}${location.pathname}`;
      await navigator.clipboard.writeText(itemUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000); // Hide success message after 2 seconds
    } catch (err) {
      setError('Failed to copy link to clipboard: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Item not found.</p>
      </div>
    );
  }

  const isOwner = user && user._id === item.postedBy._id;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
          {item.title}
        </h1>
        {error && isEditing && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg shadow-md">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {shareSuccess && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg shadow-md">
            <p className="text-sm font-medium">Link copied to clipboard!</p>
          </div>
        )}

        {!isEditing ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Image Section */}
            <div className="mb-6">
              {item.image ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">Click to enlarge</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No image available</p>
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Item Details</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Description:</span> {item.description}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Status:</span> {item.status}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Category:</span> {item.category?.name || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Location:</span> {item.location}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Posted By:</span> {item.postedBy?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Posted On:</span>{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Actions</h2>
                <div className="space-y-4">
                  {isOwner ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleEdit}
                        className="w-full py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                      >
                        Edit Item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleClaim}
                        disabled={actionLoading || item.status === 'Claimed'}
                        className={`w-full py-2 px-4 rounded-md text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                          actionLoading || item.status === 'Claimed'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {actionLoading
                          ? 'Processing...'
                          : item.status === 'Claimed'
                          ? 'Already Claimed'
                          : 'Claim Item'}
                      </button>
                      <button
                        onClick={handleStartConversation}
                        disabled={actionLoading}
                        className={`w-full py-2 px-4 rounded-md text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                          actionLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {actionLoading ? 'Processing...' : 'Message Owner'}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleShare}
                    className="w-full py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    Share Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="bg-white rounded-lg shadow-lg p-6" encType="multipart/form-data">
            {/* Image Section */}
            <div className="mb-6">
              {item.image ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md mb-2 cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">Current Image</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                  <p className="text-gray-500 text-sm">No image available</p>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="removeImage"
                    checked={removeImage}
                    onChange={handleEditChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Remove Image</span>
                </label>
              </div>
            </div>

            {/* Edit Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-y"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                    <option value="Claimed">Claimed</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm font-medium shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className={`py-2 px-4 rounded-md text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                  actionLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Image Modal */}
      {isImageModalOpen && item.image && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-4xl w-full h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
            >
              ×
            </button>
            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetails;
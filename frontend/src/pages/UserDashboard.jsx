import { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyItems } from '../services/userService';
import { updateItem, deleteUserItem, generateOTPForItem, verifyOTPForItem } from '../services/itemService';
import { getCategories } from '../services/categoryService';
import { Link, useOutletContext } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import Pagination from '../components/common/Pagination';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

function UserDashboard() {
  const { user, addNotification } = useContext(AuthContext);
  const { socket } = useOutletContext();
  const [viewType, setViewType] = useState(() => localStorage.getItem('userDashboardViewType') || 'list');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    location: '',
    image: null,
  });
  const [currentImage, setCurrentImage] = useState('');
  const [otpItemId, setOtpItemId] = useState(null);
  const [otp, setOtp] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const limit = 10;

  // Ref to track shown toasts
  const shownToasts = useRef(new Set());
  const fetchTimeoutRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.categories || []);
      } catch (err) {
        const errorMsg = `Failed to load categories: ${err.response?.data?.message || err.message}`;
        if (!shownToasts.current.has(errorMsg)) {
          toast.error(errorMsg);
          shownToasts.current.add(errorMsg);
          setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
        }
      }
    };
    fetchCategories();
  }, []);

  // Fetch items with debounce
  useEffect(() => {
    if (!user) return;

    // Clear previous timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const itemsResponse = await getMyItems({ page: itemsPage, limit });
        setItems(itemsResponse.data.items || []);
        setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      } catch (err) {
        const errorMsg = `Failed to load data: ${err.response?.data?.message || err.message}`;
        if (!shownToasts.current.has(errorMsg)) {
          toast.error(errorMsg);
          shownToasts.current.add(errorMsg);
          setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
        }
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce by 300ms

    // Socket listener
    if (socket) {
      const handleNewNotification = (notification) => {
        if (notification.type === 'item' && user.id === notification.userId) {
          const infoMsg = notification.message;
          if (!shownToasts.current.has(infoMsg)) {
            toast.info(infoMsg);
            shownToasts.current.add(infoMsg);
            setTimeout(() => shownToasts.current.delete(infoMsg), 5000);
          }
          // Trigger fetch after notification
          clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
              const itemsResponse = await getMyItems({ page: itemsPage, limit });
              setItems(itemsResponse.data.items || []);
              setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
            } catch (err) {
              const errorMsg = `Failed to load data: ${err.response?.data?.message || err.message}`;
              if (!shownToasts.current.has(errorMsg)) {
                toast.error(errorMsg);
                shownToasts.current.add(errorMsg);
                setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
              }
            } finally {
              setLoading(false);
            }
          }, 300);
        }
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [itemsPage, user, socket]);

  useEffect(() => {
    localStorage.setItem('userDashboardViewType', viewType);
  }, [viewType]);

  // Memoized handlers
  const handleEdit = useCallback((item) => {
    setEditingItemId(item._id);
    setEditFormData({
      title: item.title,
      description: item.description,
      category: item.category?.name || '',
      status: item.status,
      location: item.location || '',
      image: null,
    });
    setCurrentImage(item.image || '');
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      setEditFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setCurrentImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleEditSubmit = useCallback(async (itemId) => {
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
      const itemsResponse = await getMyItems({ page: itemsPage, limit });
      setItems(itemsResponse.data.items || []);
      setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      const successMsg = 'Item updated successfully!';
      if (!shownToasts.current.has(successMsg)) {
        toast.success(successMsg);
        shownToasts.current.add(successMsg);
        setTimeout(() => shownToasts.current.delete(successMsg), 5000);
      }
      setEditingItemId(null);
      setEditFormData({ title: '', description: '', category: '', status: '', location: '', image: null });
      setCurrentImage('');
    } catch (err) {
      const errorMsg = `Failed to update item: ${err.response?.data?.message || err.message}`;
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
    }
  }, [editFormData, itemsPage]);

  const handleDelete = useCallback(async (itemId) => {
    const confirmed = window.confirm('Are you sure you want to delete this item?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteUserItem(itemId);

      // Optimistically update the UI
      setItems((prev) => {
        const updatedItems = prev.filter((item) => item._id !== itemId);
        return updatedItems;
      });

      // Adjust pagination if necessary
      if (items.length === 1 && itemsPage > 1) {
        setItemsPage((prev) => prev - 1);
      } else {
        // Refetch to ensure consistency
        try {
          const itemsResponse = await getMyItems({ page: itemsPage, limit });
          setItems(itemsResponse.data.items || []);
          setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
        } catch (fetchErr) {
          console.error("Error refetching items:", fetchErr);
          // If refetch fails, the optimistic update still ensures the UI is updated
        }
      }

      const successMsg = 'Item deleted successfully!';
      if (!shownToasts.current.has(successMsg)) {
        toast.success(successMsg);
        shownToasts.current.add(successMsg);
        setTimeout(() => shownToasts.current.delete(successMsg), 5000);
      }
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      const errorMsg = `Failed to delete item: ${err.response?.data?.message || err.message}`;
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
      try {
        const itemsResponse = await getMyItems({ page: itemsPage, limit });
        setItems(itemsResponse.data.items || []);
        setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      } catch (fetchErr) {
        console.error("Error refetching items after failed deletion:", fetchErr);
      }
    }
  }, [items, itemsPage]);

  const handleGenerateOTP = useCallback(async (itemId) => {
    const item = items.find((i) => i._id === itemId);
    if (!item) return;

    if (user.id !== item.postedBy._id && user.id !== item.keeperId) {
      const errorMsg = 'Only the poster or keeper can generate OTP.';
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
      return;
    }

    try {
      const response = await generateOTPForItem(itemId);
      setOtpItemId(itemId);
      setShowOtpVerification(true);
      setOtp('');
      const infoMsg = `OTP generated: ${response.data.otp}. Share this with the claimant to verify return.`;
      if (!shownToasts.current.has(infoMsg)) {
        toast.info(infoMsg);
        shownToasts.current.add(infoMsg);
        setTimeout(() => shownToasts.current.delete(infoMsg), 5000);
      }
    } catch (err) {
      const errorMsg = `Failed to generate OTP: ${err.response?.data?.message || err.message}`;
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
    }
  }, [items, user.id]);

  const handleVerifyOTP = useCallback(async (itemId) => {
    if (!otp.trim()) {
      const errorMsg = 'Please enter the OTP.';
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
      return;
    }
    try {
      await verifyOTPForItem(itemId, { otp });
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, status: 'Returned' } : item))
      );
      const successMsg = 'OTP verified successfully! Item marked as returned.';
      if (!shownToasts.current.has(successMsg)) {
        toast.success(successMsg);
        shownToasts.current.add(successMsg);
        setTimeout(() => shownToasts.current.delete(successMsg), 5000);
      }
      setShowOtpVerification(false);
      setOtpItemId(null);
      setOtp('');
    } catch (err) {
      const errorMsg = `Failed to verify OTP: ${err.response?.data?.message || err.message}`;
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
    }
  }, [otp]);

  const handleCancelOTP = useCallback(() => {
    setShowOtpVerification(false);
    setOtpItemId(null);
    setOtp('');
  }, []);

  // Memoized derived states
  const isClaimant = useMemo(() => user.id === items.find((item) => item._id === editingItemId)?.claimedById, [user.id, items, editingItemId]);
  const isPosterOrKeeper = useMemo(() => user.id === items.find((item) => item._id === editingItemId)?.postedBy._id || user.id === items.find((item) => item._id === editingItemId)?.keeperId, [user.id, items, editingItemId]);

  if (!user) {
    return (
      <div className="container mx-auto p-6 bg-[var(--bg-color)] min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-color)] text-lg font-medium">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-[var(--bg-color)] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-color)] mb-4 sm:mb-0">User Dashboard</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Link
              to="/items/create"
              className="bg-[var(--primary)] text-[var(--text-color)] py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Add New Item
            </Link>
            <Link
              to="/profile"
              className="bg-green-600 text-[var(--text-color)] py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Profile
            </Link>
            <Link
              to="/messages"
              className="bg-purple-600 text-[var(--text-color)] py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Messages
            </Link>
            <Link
              to="/notifications"
              className="bg-yellow-600 text-[var(--text-color)] py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Notifications
            </Link>
            <Button
              onClick={() => setViewType(viewType === 'list' ? 'card' : 'list')}
              className="bg-[var(--secondary)] text-[var(--text-color)] py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm font-medium shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              Switch to {viewType === 'list' ? 'Card' : 'List'} View
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <div>
            {viewType === 'list' ? (
              <div className="bg-[var(--bg-color)] rounded-lg shadow-lg p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--secondary)]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-color)]">Image</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-color)]">Title</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-color)]">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-color)]">Category</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-color)]">Posted On</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-color)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--secondary)]">
                      {items.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          {editingItemId === item._id ? (
                            <>
                              <td className="px-4 py-2">
                                <div className="flex flex-col items-center">
                                  {currentImage && (
                                    <img src={currentImage} alt={item.title} className="w-16 h-16 object-cover rounded-md mb-2" />
                                  )}
                                  <Input
                                    type="file"
                                    name="image"
                                    onChange={handleEditChange}
                                    className="w-full text-sm"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="text"
                                  name="title"
                                  value={editFormData.title}
                                  onChange={handleEditChange}
                                  className="w-full text-sm"
                                  required
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Select
                                  name="status"
                                  value={editFormData.status}
                                  onChange={handleEditChange}
                                  className="w-full text-sm"
                                  required
                                >
                                  <option value="Lost">Lost</option>
                                  <option value="Found">Found</option>
                                  <option value="Claimed">Claimed</option>
                                  <option value="Returned">Returned</option>
                                </Select>
                              </td>
                              <td className="px-4 py-2">
                                <Select
                                  name="category"
                                  value={editFormData.category}
                                  onChange={handleEditChange}
                                  className="w-full text-sm"
                                  required
                                >
                                  <option value="">Select a category</option>
                                  {categories.map((category) => (
                                    <option key={category._id} value={category.name}>
                                      {category.name}
                                    </option>
                                  ))}
                                </Select>
                              </td>
                              <td className="px-4 py-2 text-sm text-[var(--text-color)]">{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-2 flex flex-col sm:flex-row gap-2">
                                <Button
                                  onClick={() => handleEditSubmit(item._id)}
                                  className="bg-[var(--primary)] text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingItemId(null);
                                    setCurrentImage('');
                                  }}
                                  className="bg-[var(--secondary)] text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors w-full sm:w-auto"
                                >
                                  Cancel
                                </Button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2">
                                {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-md" />}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-[var(--text-color)]">{item.title}</td>
                              <td className="px-4 py-2 text-sm capitalize text-[var(--text-color)]">{item.status}</td>
                              <td className="px-4 py-2 text-sm text-[var(--text-color)]">{item.category?.name || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-[var(--text-color)]">{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-2 flex flex-col sm:flex-row gap-2 flex-wrap">
                                <Link
                                  to={`/items/${item._id}`}
                                  className="bg-[var(--primary)] text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                >
                                  View
                                </Link>
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                  className="bg-yellow-600 text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors w-full sm:w-auto"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(item._id);
                                  }}
                                  className="bg-red-600 text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors w-full sm:w-auto"
                                >
                                  Delete
                                </Button>
                                {item.status === 'Claimed' && !isClaimant && (
                                  <>
                                    {isPosterOrKeeper && (
                                      <Button
                                        onClick={() => handleGenerateOTP(item._id)}
                                        className="bg-[var(--primary)] text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                      >
                                        Generate OTP
                                      </Button>
                                    )}
                                    {showOtpVerification && otpItemId === item._id && (
                                      <div className="flex items-center gap-2 mt-2 w-full">
                                        <Input
                                          type="text"
                                          value={otp}
                                          onChange={(e) => setOtp(e.target.value)}
                                          placeholder="Enter OTP"
                                          className="p-2 text-sm w-full sm:w-20"
                                        />
                                        <Button
                                          onClick={() => handleVerifyOTP(item._id)}
                                          className="bg-[var(--primary)] text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                        >
                                          Verify
                                        </Button>
                                        <Button
                                          onClick={handleCancelOTP}
                                          className="bg-[var(--secondary)] text-[var(--text-color)] px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors w-full sm:w-auto"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {items.length > 0 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={itemsPage}
                      totalPages={itemsTotalPages}
                      onPageChange={(page) => setItemsPage(page)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                  const isClaimant = user.id === item.claimedById;
                  const isPosterOrKeeper = user.id === item.postedBy._id || user.id === item.keeperId;

                  return (
                    <ItemCard
                      key={item._id}
                      item={item}
                      onEdit={(e) => {
                        e?.preventDefault();
                        e?.stopPropagation();
                        handleEdit(item);
                      }}
                      onDelete={(e) => {
                        e?.preventDefault();
                        e?.stopPropagation();
                        handleDelete(item._id);
                      }}
                      showActions={editingItemId !== item._id}
                      isEditing={editingItemId === item._id}
                      editFormData={editingItemId === item._id ? editFormData : null}
                      onEditChange={handleEditChange}
                      onEditSubmit={() => handleEditSubmit(item._id)}
                      onCancelEdit={() => {
                        setEditingItemId(null);
                        setCurrentImage('');
                      }}
                      onGenerateOTP={item.status === 'Claimed' && !isClaimant && isPosterOrKeeper ? () => handleGenerateOTP(item._id) : null}
                      onVerifyOTP={item.status === 'Claimed' && showOtpVerification && otpItemId === item._id && !isClaimant ? () => handleVerifyOTP(item._id) : null}
                      otp={showOtpVerification && otpItemId === item._id && !isClaimant ? otp : ''}
                      setOtp={showOtpVerification && otpItemId === item._id && !isClaimant ? setOtp : null}
                      onCancelOTP={showOtpVerification && otpItemId === item._id && !isClaimant ? handleCancelOTP : null}
                      preventNavigation={true}
                      redirectAfterDelete={null}
                    />
                  );
                })}
              </div>
            )}
            {items.length === 0 && (
              <div className="bg-[var(--bg-color)] rounded-lg shadow-lg p-4 text-center">
                <p className="text-[var(--text-color)] text-lg">No items found. Start by adding a new item!</p>
                <Link
                  to="/items/create"
                  className="mt-4 inline-block bg-[var(--primary)] text-[var(--text-color)] py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-base font-medium shadow-md hover:shadow-lg"
                >
                  Add New Item
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserItems, getUserById } from '../services/adminService';
import { toast } from 'react-toastify';
import Pagination from '../components/common/Pagination'; // Import the Pagination component

function UserDetail() {
  const { id } = useParams(); // Get the user ID from the URL
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 5; // Number of items per page

  useEffect(() => {
    const fetchUserAndItems = async () => {
      setLoading(true);
      try {
        // Fetch user details
        const userResponse = await getUserById(id);
        setUser(userResponse.data.user);

        // Fetch items posted by the user with pagination
        const itemsResponse = await getUserItems(id, currentPage, limit); // Assume getUserItems accepts page and limit
        setItems(itemsResponse.data.items || []);
        setTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      } catch (err) {
        toast.error('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndItems();
  }, [id, currentPage]); // Re-fetch when id or currentPage changes

  // Handler for page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <p className="text-gray-600 text-center mt-6">Loading...</p>;
  }

  if (!user) {
    return <p className="text-gray-600 text-center mt-6">User not found.</p>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">User Details</h1>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Name</h2>
            <p className="text-gray-600">{user.name}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Email</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Role</h2>
            <p className="text-gray-600">{user.role}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Joined</h2>
            <p className="text-gray-600">{new Date(user.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Items Posted by User */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Items Posted</h2>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Title</th>
                    <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Description</th>
                    <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Status</th>
                    <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Category</th>
                    <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Posted On</th>
                    <th className="px-4 py-2 text-left text-sm sm:text-base font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm sm:text-base">{item.title}</td>
                      <td className="px-4 py-2 text-sm sm:text-base">{item.description}</td>
                      <td className="px-4 py-2 text-sm sm:text-base">{item.status}</td>
                      <td className="px-4 py-2 text-sm sm:text-base">{item.category?.name || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm sm:text-base">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/items/${item._id}`}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">No items posted by this user.</p>
          )}
        </div>
        <div className="mt-6">
          <Link
            to="/admin"
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
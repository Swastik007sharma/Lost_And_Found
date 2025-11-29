import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers, toggleUserActivation } from "../../services/adminService";
import Loader from "../common/Loader";
import Pagination from "../common/Pagination";
import DownloadModal from "../common/DownloadModal";
import { toast } from "react-toastify";
import { FaSearch, FaSort, FaUser, FaEnvelope, FaCheckCircle, FaTimesCircle, FaEye, FaUserCircle, FaDownload, FaFileExport } from "react-icons/fa";

function UsersTab({ user, page, setPage, totalPages, setTotalPages, limit }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userSortBy, setUserSortBy] = useState("createdAt");
  const [userOrder, setUserOrder] = useState("desc");
  const [userStatus, setUserStatus] = useState("all"); // 'all', 'active', 'inactive'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("json");
  const [loadingAllData, setLoadingAllData] = useState(false);
  const shownToasts = useRef(new Set());

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page: page.users,
        limit,
        search: userSearch,
        sortBy: userSortBy,
        order: userOrder,
        isActive: userStatus === "all" ? undefined : userStatus === "active",
      });
      setUsers(response.data.users || []);
      setTotalUsers(response.data.pagination?.total || 0);
      setTotalPages((prev) => ({
        ...prev,
        users: response.data.pagination?.totalPages || 1,
      }));
    } catch (err) {
      const errorMsg = "Failed to load users: " + (err.response?.data?.message || err.message);
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [page.users, limit, userSearch, userSortBy, userOrder, userStatus, setTotalPages]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(debounceFetch);
  }, [fetchUsers]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  // Fetch all users for download with pagination
  const fetchAllUsersForDownload = useCallback(async () => {
    setLoadingAllData(true);
    try {
      let allFetchedUsers = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getUsers({
          page: currentPage,
          limit: 100, // Fetch 100 at a time
          search: userSearch,
          isActive: userStatus === "all" ? undefined : userStatus === "active",
          sortBy: userSortBy,
          order: userOrder,
        });

        allFetchedUsers = [...allFetchedUsers, ...(response.data.users || [])];

        if (currentPage >= response.data.pagination?.totalPages) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      return allFetchedUsers;
    } catch (err) {
      toast.error("Failed to fetch all users: " + (err.response?.data?.message || err.message));
      return [];
    } finally {
      setLoadingAllData(false);
    }
  }, [userSearch, userSortBy, userOrder, userStatus]);

  // Filter users by date range
  const filterUsersByDate = useCallback((usersToFilter, filters) => {
    const { dateFilter, customStartDate, customEndDate } = filters;

    if (dateFilter === "all") {
      return usersToFilter;
    }

    const now = new Date();
    let startDate, endDate;

    switch (dateFilter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      case "custom":
        if (!customStartDate || !customEndDate) {
          toast.error("Please select both start and end dates");
          return usersToFilter;
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59);
        break;
      default:
        return usersToFilter;
    }

    return usersToFilter.filter(u => {
      const userDate = new Date(u.createdAt);
      return userDate >= startDate && userDate <= endDate;
    });
  }, []);

  // Open download modal
  const handleOpenDownloadModal = useCallback((format) => {
    setDownloadFormat(format);
    setShowDownloadModal(true);
  }, []);

  // Process and download data
  const handleConfirmDownload = useCallback(async (filters) => {
    const usersToExport = await fetchAllUsersForDownload();
    const filteredUsers = filterUsersByDate(usersToExport, filters);

    if (filteredUsers.length === 0) {
      toast.warning("No users found matching the selected criteria");
      return;
    }

    const dataToExport = filteredUsers.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      phoneNumber: u.phoneNumber || 'N/A',
      address: u.address || 'N/A',
      createdAt: new Date(u.createdAt).toLocaleString(),
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never',
    }));

    if (downloadFormat === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_${filters.dateFilter}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${filteredUsers.length} users downloaded as JSON`);
    } else {
      const headers = ['ID', 'Name', 'Email', 'Role', 'Active', 'Phone Number', 'Address', 'Created At', 'Last Login'];

      const rows = dataToExport.map(u => [
        u.id,
        u.name,
        u.email,
        u.role,
        u.isActive ? 'Yes' : 'No',
        u.phoneNumber,
        u.address?.replace(/,/g, ';') || 'N/A',
        u.createdAt,
        u.lastLogin,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_${filters.dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${filteredUsers.length} users downloaded as CSV`);
    }

    setShowDownloadModal(false);
  }, [downloadFormat, fetchAllUsersForDownload, filterUsersByDate]);

  const handleDownloadJSON = useCallback(() => {
    handleOpenDownloadModal("json");
  }, [handleOpenDownloadModal]);

  const handleDownloadCSV = useCallback(() => {
    handleOpenDownloadModal("csv");
  }, [handleOpenDownloadModal]);

  const handleToggleUserActivation = useCallback(async (userId, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? "deactivate" : "activate"} this user?`)) {
      setLoading(true);
      try {
        await toggleUserActivation(userId);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !isActive } : u))
        );
        const successMsg = `User ${!isActive ? "activated" : "deactivated"} successfully`;
        if (!shownToasts.current.has(successMsg)) {
          toast.success(successMsg);
          shownToasts.current.add(successMsg);
          setTimeout(() => shownToasts.current.delete(successMsg), 5000);
        }
        setSuccess(successMsg);
      } catch (err) {
        const errorMsg = "Failed to toggle user activation: " + (err.response?.data?.message || err.message);
        if (!shownToasts.current.has(errorMsg)) {
          toast.error(errorMsg);
          shownToasts.current.add(errorMsg);
          setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const userSearchSection = useMemo(
    () => (
      <div className="p-4 sm:p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <FaUser className="text-lg sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                User Management
              </h2>
              <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                {totalUsers} total users
              </p>
            </div>
          </div>

          {/* Download Buttons */}
          {users.length > 0 && (
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownloadJSON}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <FaDownload />
                <span className="hidden sm:inline">JSON</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                <FaFileExport />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setPage((prev) => ({ ...prev, users: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm"
              style={{
                borderColor: 'var(--color-bg)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <select
            value={userSortBy}
            onChange={(e) => {
              setUserSortBy(e.target.value);
              setPage((prev) => ({ ...prev, users: 1 }));
            }}
            className="px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm"
            style={{
              borderColor: 'var(--color-bg)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)'
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="createdAt">Sort by Date</option>
          </select>

          <select
            value={userOrder}
            onChange={(e) => {
              setUserOrder(e.target.value);
              setPage((prev) => ({ ...prev, users: 1 }));
            }}
            className="px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm"
            style={{
              borderColor: 'var(--color-bg)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)'
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <select
            value={userStatus}
            onChange={(e) => {
              setUserStatus(e.target.value);
              setPage((prev) => ({ ...prev, users: 1 }));
            }}
            className="px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm"
            style={{
              borderColor: 'var(--color-bg)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)'
            }}
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>
    ),
    [userSearch, userSortBy, userOrder, userStatus, setPage, users.length, totalUsers, handleDownloadJSON, handleDownloadCSV]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {userSearchSection}

      {(success || error) && (
        <div>
          {success && (
            <div className="border-l-4 p-4 rounded-xl shadow-md animate-fade-in" style={{ background: 'var(--color-accent)', borderColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="border-l-4 p-4 rounded-xl shadow-md animate-fade-in" style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <Loader size="lg" variant="bars" text="Loading users..." />
      ) : (
        <>
          {/* User Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {users.map((u) => (
              <div
                key={u._id}
                className="group p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
                onClick={() => navigate(`/admin/users/${u._id}`)}
              >
                {/* User Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg ${u.role === 'admin' ? 'bg-linear-to-br from-purple-500 to-purple-600' :
                      u.role === 'keeper' ? 'bg-linear-to-br from-green-500 to-green-600' :
                        'bg-linear-to-br from-blue-500 to-blue-600'
                      }`}>
                      <FaUserCircle className="text-2xl sm:text-3xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg" style={{ color: 'var(--color-text)' }}>
                        {u.name}
                      </h3>
                      <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                        u.role === 'keeper' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>

                  {u.isActive ? (
                    <FaCheckCircle className="text-xl sm:text-2xl text-green-500 shrink-0" />
                  ) : (
                    <FaTimesCircle className="text-xl sm:text-2xl text-red-500 shrink-0" />
                  )}
                </div>

                {/* User Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm opacity-80">
                    <FaEnvelope className="text-blue-500 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm ${u.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/users/${u._id}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                  >
                    <FaEye />
                    <span>View</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleUserActivation(u._id, u.isActive);
                    }}
                    className={`flex-1 px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${u._id === user._id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    style={{
                      background: u.isActive ? 'var(--color-accent)' : 'var(--color-primary)',
                      color: 'var(--color-bg)'
                    }}
                    disabled={u._id === user._id}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page.users}
            totalPages={totalPages.users}
            onPageChange={(newPage) => setPage((prev) => ({ ...prev, users: newPage }))}
          />
        </>
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleConfirmDownload}
        title="Download Users"
        loading={loadingAllData}
        downloadFormat={downloadFormat}
      />
    </div>
  );
}

export default UsersTab;

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getItems, toggleItemActivation, assignKeeperToItem } from "../../services/itemService";
import { getKeepers } from "../../services/keeperService";
import Loader from "../common/Loader";
import Pagination from "../common/Pagination";
import DownloadModal from "../common/DownloadModal";
import { toast } from "react-toastify";
import {
  FaDownload,
  FaFileExport,
  FaSearch,
  FaSort,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaUserShield,
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaTag
} from "react-icons/fa";

function ItemsTab({ page, setPage, totalPages, setTotalPages, limit }) {
  const [items, setItems] = useState([]);
  const [itemSearch, setItemSearch] = useState("");
  const [itemSortBy, setItemSortBy] = useState("createdAt");
  const [itemOrder, setItemOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keepers, setKeepers] = useState([]);
  const [selectedKeeperIds, setSelectedKeeperIds] = useState({});
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("json");
  const [loadingAllData, setLoadingAllData] = useState(false);
  const shownToasts = useRef(new Set());

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsResponse, keepersResponse] = await Promise.all([
        getItems({
          page: page.items,
          limit,
          search: itemSearch,
          sortBy: itemSortBy,
          order: itemOrder,
        }),
        getKeepers(),
      ]);
      setItems(itemsResponse.data.items || []);
      setKeepers(keepersResponse.data.keepers || []);
      setTotalPages((prev) => ({
        ...prev,
        items: itemsResponse.data.pagination?.totalPages || 1,
      }));
      setSelectedKeeperIds(
        itemsResponse.data.items.reduce((acc, item) => ({
          ...acc,
          [item._id]: item.keeperId || "",
        }), {})
      );
    } catch (err) {
      const errorMsg = "Failed to load items: " + (err.response?.data?.message || err.message);
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
      setError(errorMsg);
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
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  // Fetch all items for download with pagination
  const fetchAllItemsForDownload = useCallback(async () => {
    setLoadingAllData(true);
    try {
      let allFetchedItems = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getItems({
          page: currentPage,
          limit: 100, // Fetch 100 at a time
          search: itemSearch,
          sortBy: itemSortBy,
          order: itemOrder,
        });

        allFetchedItems = [...allFetchedItems, ...(response.data.items || [])];

        if (currentPage >= response.data.pagination?.totalPages) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      return allFetchedItems;
    } catch (err) {
      toast.error("Failed to fetch all items: " + (err.response?.data?.message || err.message));
      return [];
    } finally {
      setLoadingAllData(false);
    }
  }, [itemSearch, itemSortBy, itemOrder]);

  // Filter items by date range
  const filterItemsByDate = useCallback((itemsToFilter, filters) => {
    const { dateFilter, customStartDate, customEndDate } = filters;

    if (dateFilter === "all") {
      return itemsToFilter;
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
          return itemsToFilter;
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59);
        break;
      default:
        return itemsToFilter;
    }

    return itemsToFilter.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, []);

  // Open download modal
  const handleOpenDownloadModal = useCallback((format) => {
    setDownloadFormat(format);
    setShowDownloadModal(true);
  }, []);

  // Process and download data
  const handleConfirmDownload = useCallback(async (filters) => {
    const itemsToExport = await fetchAllItemsForDownload();
    const filteredItems = filterItemsByDate(itemsToExport, filters);

    if (filteredItems.length === 0) {
      toast.warning("No items found matching the selected criteria");
      return;
    }

    const dataToExport = filteredItems.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      status: item.status,
      category: item.category?.name || 'N/A',
      subcategory: item.subcategory?.name || 'N/A',
      location: item.location,
      postedBy: item.postedBy?.name || 'N/A',
      postedByEmail: item.postedBy?.email || 'N/A',
      keeper: item.keeperName || 'Not Assigned',
      isActive: item.isActive,
      createdAt: new Date(item.createdAt).toLocaleString(),
      updatedAt: new Date(item.updatedAt).toLocaleString(),
    }));

    if (downloadFormat === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `items_${filters.dateFilter}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${filteredItems.length} items downloaded as JSON`);
    } else {
      const headers = ['ID', 'Title', 'Description', 'Status', 'Category', 'Subcategory', 'Location', 'Posted By', 'Email', 'Keeper', 'Active', 'Created At', 'Updated At'];

      const rows = dataToExport.map(item => [
        item.id,
        item.title,
        item.description?.replace(/,/g, ';') || '',
        item.status,
        item.category,
        item.subcategory,
        item.location?.replace(/,/g, ';') || '',
        item.postedBy,
        item.postedByEmail,
        item.keeper,
        item.isActive ? 'Yes' : 'No',
        item.createdAt,
        item.updatedAt,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `items_${filters.dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${filteredItems.length} items downloaded as CSV`);
    }

    setShowDownloadModal(false);
  }, [downloadFormat, fetchAllItemsForDownload, filterItemsByDate]);

  const handleDownloadJSON = useCallback(() => {
    handleOpenDownloadModal("json");
  }, [handleOpenDownloadModal]);

  const handleDownloadCSV = useCallback(() => {
    handleOpenDownloadModal("csv");
  }, [handleOpenDownloadModal]);

  const handleToggleItemActivation = useCallback(async (itemId, isActive) => {
    if (window.confirm(`Are you sure you want to ${isActive ? "deactivate" : "activate"} this item?`)) {
      setLoading(true);
      try {
        await toggleItemActivation(itemId);
        setItems((prev) =>
          prev.map((i) => (i._id === itemId ? { ...i, isActive: !isActive } : i))
        );
        const successMsg = `Item ${!isActive ? "activated" : "deactivated"} successfully`;
        if (!shownToasts.current.has(successMsg)) {
          toast.success(successMsg);
          shownToasts.current.add(successMsg);
          setTimeout(() => shownToasts.current.delete(successMsg), 5000);
        }
        setSuccess(successMsg);
      } catch (err) {
        const errorMsg = "Failed to toggle item activation: " + (err.response?.data?.message || err.message);
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

  const handleAssignKeeper = useCallback(async (itemId) => {
    const currentKeeperId = selectedKeeperIds[itemId];
    if (!currentKeeperId) {
      const errorMsg = "Please select a keeper";
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
      setError(errorMsg);
      return;
    }
    setLoading(true);
    try {
      const selectedKeeper = keepers.find((k) => k._id === currentKeeperId);
      if (!selectedKeeper) {
        throw new Error("Selected keeper not found");
      }
      const keeperName = selectedKeeper.name;

      await assignKeeperToItem(itemId, { keeperId: currentKeeperId, keeperName });
      const successMsg = `Keeper ${keeperName} assigned to item ${itemId}`;
      if (!shownToasts.current.has(successMsg)) {
        toast.success(successMsg);
        shownToasts.current.add(successMsg);
        setTimeout(() => shownToasts.current.delete(successMsg), 5000);
      }
      setSuccess(successMsg);

      const updatedItemsResponse = await getItems({
        page: page.items,
        limit,
        search: itemSearch,
        sortBy: itemSortBy,
        order: itemOrder,
      });
      setItems(updatedItemsResponse.data.items || []);
      setSelectedKeeperIds((prev) => ({
        ...prev,
        [itemId]: updatedItemsResponse.data.items.find((i) => i._id === itemId)?.keeperId || "",
      }));
    } catch (err) {
      const errorMsg = "Failed to assign keeper: " + (err.response?.data?.message || err.message);
      if (!shownToasts.current.has(errorMsg)) {
        toast.error(errorMsg);
        shownToasts.current.add(errorMsg);
        setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [selectedKeeperIds, keepers, page.items, limit, itemSearch, itemSortBy, itemOrder]);

  const handleKeeperChange = (itemId, event) => {
    setSelectedKeeperIds((prev) => ({
      ...prev,
      [itemId]: event.target.value,
    }));
  };

  const itemSearchSection = useMemo(
    () => (
      <div className="mb-6 p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FaSearch className="text-white text-lg" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            Search & Filter
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => {
                setItemSearch(e.target.value);
                setPage((prev) => ({ ...prev, items: 1 }));
              }}
              className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
              style={{
                border: '2px solid var(--color-bg)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Sort By */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSort />
            </div>
            <select
              value={itemSortBy}
              onChange={(e) => {
                setItemSortBy(e.target.value);
                setPage((prev) => ({ ...prev, items: 1 }));
              }}
              className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm appearance-none"
              style={{
                border: '2px solid var(--color-bg)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
            >
              <option value="title">Sort by Title</option>
              <option value="status">Sort by Status</option>
              <option value="createdAt">Sort by Date</option>
            </select>
          </div>

          {/* Order */}
          <select
            value={itemOrder}
            onChange={(e) => {
              setItemOrder(e.target.value);
              setPage((prev) => ({ ...prev, items: 1 }));
            }}
            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
            style={{
              border: '2px solid var(--color-bg)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)'
            }}
          >
            <option value="asc">Ascending ↑</option>
            <option value="desc">Descending ↓</option>
          </select>
        </div>
      </div>
    ),
    [itemSearch, itemSortBy, itemOrder, setPage]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {itemSearchSection}

      {/* Header Card with Stats and Actions */}
      <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FaBox className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                Manage Items
              </h2>
              <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                {items.length} items displayed
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <FaDownload />
                <span>JSON</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                <FaFileExport />
                <span>CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {(success || error) && (
        <div className="animate-fade-in">
          {success && (
            <div className="border-l-4 p-4 rounded-xl shadow-lg flex items-center gap-3" style={{ background: 'var(--color-secondary)', borderColor: '#10b981', color: 'var(--color-text)' }}>
              <FaCheckCircle className="text-green-500 text-xl" />
              <p className="font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="border-l-4 p-4 rounded-xl shadow-lg flex items-center gap-3" style={{ background: 'var(--color-secondary)', borderColor: '#ef4444', color: 'var(--color-text)' }}>
              <FaTimesCircle className="text-red-500 text-xl" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>
      )}
      {loading ? (
        <Loader size="lg" variant="dots" text="Loading items..." />
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl shadow-lg text-center" style={{ background: 'var(--color-secondary)' }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
            <FaBox className="text-white text-3xl" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            No Items Found
          </h3>
          <p className="opacity-70" style={{ color: 'var(--color-text)' }}>
            {itemSearch ? "Try adjusting your search criteria" : "No items available at the moment"}
          </p>
        </div>
      ) : (
        <>
          {/* Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ background: 'var(--color-secondary)' }}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {item.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}
                      >
                        {item.isActive ? (
                          <span className="flex items-center gap-1">
                            <FaCheckCircle /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FaTimesCircle /> Inactive
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1 rounded-lg text-sm font-medium"
                        style={{
                          background: item.status === 'found'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white'
                        }}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FaTag className="text-blue-500" />
                    <div>
                      <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>Category</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {item.category?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaUser className="text-purple-500" />
                    <div>
                      <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>Posted By</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {item.postedBy?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaUserShield className="text-green-500" />
                    <div>
                      <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>Keeper</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {item.keeperName || "Not Assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-500" />
                    <div>
                      <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>Claimed By</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {item.claimedByName || "Not Claimed"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Keeper Assignment Section */}
                <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    <div className="flex items-center gap-2">
                      <FaUserShield className="text-blue-500" />
                      Assign Keeper
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedKeeperIds[item._id] || ""}
                      onChange={(e) => handleKeeperChange(item._id, e)}
                      className="flex-1 p-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      style={{
                        border: '2px solid var(--color-secondary)',
                        background: 'var(--color-secondary)',
                        color: 'var(--color-text)'
                      }}
                    >
                      <option value="">Select Keeper</option>
                      {keepers.map((k) => (
                        <option key={k._id} value={k._id}>
                          {k.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignKeeper(item._id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Link
                    to={`/items/${item._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                  >
                    <FaEye />
                    View Details
                  </Link>
                  <button
                    onClick={() => handleToggleItemActivation(item._id, item.isActive)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white"
                    style={{
                      background: item.isActive
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                  >
                    {item.isActive ? (
                      <>
                        <FaToggleOff />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <FaToggleOn />
                        Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page.items}
            totalPages={totalPages.items}
            onPageChange={(newPage) =>
              setPage((prev) => ({ ...prev, items: newPage }))
            }
          />
        </>
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleConfirmDownload}
        title="Download Items"
        loading={loadingAllData}
        downloadFormat={downloadFormat}
      />
    </div>
  );
}

export default ItemsTab;

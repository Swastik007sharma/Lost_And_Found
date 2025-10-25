import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchItems } from '../services/searchService';
import { getCategories } from '../services/categoryService';
import ItemCard from '../components/ItemCard';
import { toast } from 'react-toastify';
import Pagination from '../components/common/Pagination';

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;
  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data.categories || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Alert timeout ref (for potential future alerts)
  const alertTimeout = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          search: searchTerm.trim() || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          sort: sortBy,
          isActive: true,
        };
        const response = await searchItems(params);
        if (response && Array.isArray(response.data.items)) {
          setItems(response.data.items);
          setTotalPages(response.data.pagination?.totalPages || 1);
        } else {
          setItems([]);
          setTotalPages(1);
        }
      } catch {
        toast.error('Failed to load items. Please try again later.');
        setItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [page, searchTerm, statusFilter, categoryFilter, sortBy]);
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setSortBy('newest');
    setPage(1);
  };

  useEffect(() => {
    // Clear error on unmount or change (for potential alerts)
    const timeoutId = alertTimeout.current;
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page on status change
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header className="py-4 sm:py-6 shadow-md" style={{ background: 'var(--color-secondary)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-0" style={{ color: 'var(--color-text)' }}>Lost & Found - College Portal</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between animate-fade-in-down">
          <input
            type="text"
            placeholder="Search by title, description, or tags..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-1/3 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition duration-200"
            style={{ border: '1px solid var(--color-secondary)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full sm:w-1/6 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none"
            style={{ border: '1px solid var(--color-secondary)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
            <option value="Claimed">Claimed</option>
            <option value="Returned">Returned</option>
          </select>
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="w-full sm:w-1/6 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none"
            style={{ border: '1px solid var(--color-secondary)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full sm:w-1/6 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none"
            style={{ border: '1px solid var(--color-secondary)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={handleClearFilters}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow transition-colors duration-200"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64 animate-fade-in-down">
            <svg className="animate-spin h-10 w-10" style={{ color: 'var(--color-primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 animate-fade-in-up">
            {items.map((item, idx) => (
              <div key={item._id} style={{ animationDelay: `${idx * 60}ms` }} className="animate-fade-in-up">
                <ItemCard item={item} showActions={false} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 sm:px-8 rounded-lg shadow-md animate-fade-in-down" style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="mb-4">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-30" />
              <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60" />
            </svg>
            <p className="text-lg sm:text-xl">No items found matching your search.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Mobile Add Item Button (Kept as the only option) */}
      <div className="fixed bottom-4 right-4 sm:hidden">
        <Link
          to="/items/create"
          className="text-sm font-medium py-3 px-4 rounded-full shadow-lg transition duration-200"
          style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
        >
          + Add New Item
        </Link>
      </div>
    </div>
  );
}

export default Home;
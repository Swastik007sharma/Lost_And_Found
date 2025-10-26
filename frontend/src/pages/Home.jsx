import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchItems } from '../services/searchService';
import { getCategories } from '../services/categoryService';
import ItemCard from '../components/ItemCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import Pagination from '../components/common/Pagination';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaTimes, 
  FaPlus,
  FaBoxOpen,
  FaLightbulb,
  FaHandHoldingHeart
} from 'react-icons/fa';

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
  const [showFilters, setShowFilters] = useState(false);
  const limit = 8;

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories({ limit: 100 });
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

  const hasActiveFilters = statusFilter !== 'All' || categoryFilter !== 'All' || searchTerm.trim() !== '';

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
      {/* Hero Header */}
      <header 
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in-down">
              Lost & Found Portal
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in-up">
              Reuniting people with their belongings. Find what you lost or help someone find theirs.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <FaBoxOpen className="text-white text-xl" />
                <span className="text-white font-semibold">{items.length} Items</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <FaHandHoldingHeart className="text-white text-xl" />
                <span className="text-white font-semibold">Help Others</span>
              </div>
            </div>
          </div>

          {/* Search Bar in Hero */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search for lost or found items..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-14 pr-4 py-4 rounded-2xl shadow-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300"
                style={{ 
                  background: 'white',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
              <FaFilter />
              <span>Filter & Sort</span>
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              style={{ 
                background: 'var(--color-secondary)',
                color: 'var(--color-text)'
              }}
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div 
              className="p-6 rounded-2xl shadow-lg"
              style={{ background: 'var(--color-secondary)' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="w-full p-3 rounded-xl shadow-sm focus:ring-2 focus:outline-none transition-all duration-200"
                    style={{ 
                      border: '2px solid var(--color-border, #e5e7eb)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Lost">🔴 Lost</option>
                    <option value="Found">🔵 Found</option>
                    <option value="Claimed">🟡 Claimed</option>
                    <option value="Returned">🟢 Returned</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    className="w-full p-3 rounded-xl shadow-sm focus:ring-2 focus:outline-none transition-all duration-200"
                    style={{ 
                      border: '2px solid var(--color-border, #e5e7eb)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-semibold mb-2 flex items-center space-x-1" style={{ color: 'var(--color-text)' }}>
                    <FaSort />
                    <span>Sort By</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full p-3 rounded-xl shadow-sm focus:ring-2 focus:outline-none transition-all duration-200"
                    style={{ 
                      border: '2px solid var(--color-border, #e5e7eb)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="newest">📅 Newest First</option>
                    <option value="oldest">🕰️ Oldest First</option>
                    <option value="status">📊 By Status</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className={`w-full px-4 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 flex items-center justify-center space-x-2 ${
                      hasActiveFilters ? 'hover:shadow-lg hover:scale-105' : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{ 
                      background: hasActiveFilters ? 'var(--color-accent)' : '#9ca3af',
                      color: 'white'
                    }}
                  >
                    <FaTimes />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Active Filters:</span>
                  {searchTerm && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Search: {searchTerm}
                    </span>
                  )}
                  {statusFilter !== 'All' && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Status: {statusFilter}
                    </span>
                  )}
                  {categoryFilter !== 'All' && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Category: {categoryFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
              {items.length > 0 ? (
                <>Found <span className="font-bold text-blue-600 dark:text-blue-400">{items.length}</span> {items.length === 1 ? 'item' : 'items'}</>
              ) : (
                'No items found'
              )}
            </p>
            {items.length > 0 && (
              <p className="text-sm" style={{ color: 'var(--color-muted, #6b7280)' }}>
                Page {page} of {totalPages}
              </p>
            )}
          </div>
        )}

        {/* Items Grid */}
        {loading ? (
          <Loader size="lg" text="Searching for items..." variant="dots" />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <div 
                key={item._id} 
                style={{ animationDelay: `${idx * 50}ms` }} 
                className="animate-fade-in-up"
              >
                <ItemCard item={item} showActions={false} />
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl shadow-lg"
            style={{ background: 'var(--color-secondary)' }}
          >
            <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
              <FaBoxOpen className="text-6xl opacity-30" style={{ color: 'var(--color-text)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              No Items Found
            </h3>
            <p className="text-center mb-6 max-w-md" style={{ color: 'var(--color-muted, #6b7280)' }}>
              {hasActiveFilters 
                ? "No items match your current filters. Try adjusting your search criteria."
                : "Be the first to report a lost or found item!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                <FaTimes />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Help Section */}
        {!loading && items.length === 0 && !hasActiveFilters && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="p-6 rounded-2xl shadow-lg"
              style={{ background: 'var(--color-secondary)' }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                  <FaLightbulb className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Lost Something?</h3>
                  <p className="mb-4" style={{ color: 'var(--color-muted, #6b7280)' }}>
                    Report your lost item with detailed description and we'll notify you if someone finds it.
                  </p>
                  <Link
                    to="/items/create"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    style={{ background: 'var(--color-primary)', color: 'white' }}
                  >
                    <FaPlus />
                    <span>Report Lost Item</span>
                  </Link>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl shadow-lg"
              style={{ background: 'var(--color-secondary)' }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent)' }}>
                  <FaHandHoldingHeart className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Found Something?</h3>
                  <p className="mb-4" style={{ color: 'var(--color-muted, #6b7280)' }}>
                    Help someone by reporting the item you found. Include photos and location details.
                  </p>
                  <Link
                    to="/items/create"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    style={{ background: 'var(--color-accent)', color: 'white' }}
                  >
                    <FaPlus />
                    <span>Report Found Item</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Link
        to="/items/create"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
        style={{ background: 'var(--color-primary)' }}
      >
        <FaPlus className="text-white text-2xl transition-transform duration-300 group-hover:rotate-90" />
      </Link>
    </div>
  );
}

export default Home;
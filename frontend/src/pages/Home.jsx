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
  FaHandHoldingHeart,
  FaCheckCircle,
  FaUsers,
  FaShieldAlt,
  FaBolt,
  FaChevronRight
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
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full bg-white blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center">
            {/* Main Heading */}
            <div className="mb-4 inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-4">
                <FaBolt className="text-yellow-300" />
                Welcome to Lost & Found
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 animate-fade-in-down leading-tight">
              Lost & Found Portal
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto animate-fade-in-up leading-relaxed px-4">
              Reuniting people with their belongings. Find what you lost or help someone find theirs. Fast, secure, and community-driven.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <FaBoxOpen className="text-white text-lg sm:text-xl" />
                <span className="text-white font-semibold text-sm sm:text-base">{items.length} Items</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <FaUsers className="text-white text-lg sm:text-xl" />
                <span className="text-white font-semibold text-sm sm:text-base">Active Community</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <FaShieldAlt className="text-white text-lg sm:text-xl" />
                <span className="text-white font-semibold text-sm sm:text-base">Secure Platform</span>
              </div>
            </div>
          </div>

          {/* Search Bar in Hero */}
          <div className="max-w-3xl mx-auto px-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover:bg-white/40 transition-all duration-300"></div>
              <div className="relative">
                <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl z-10" />
                <input
                  type="text"
                  placeholder="Search for lost or found items..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 sm:pl-14 pr-4 py-3.5 sm:py-4 rounded-2xl shadow-2xl text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300 hover:shadow-3xl"
                  style={{
                    background: 'white',
                    color: '#1f2937'
                  }}
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6">
              <Link
                to="/items/create"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                style={{ color: 'var(--color-primary)' }}
              >
                <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Report Item</span>
                <FaChevronRight className="text-xs" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 sm:h-16 md:h-20" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Filters Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3" style={{ color: 'var(--color-text)' }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                <FaFilter className="text-white text-sm sm:text-base" />
              </div>
              <span>Filter & Sort</span>
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
              style={{
                background: 'var(--color-secondary)',
                color: 'var(--color-text)',
                border: '2px solid var(--color-border, #e5e7eb)'
              }}
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          <div className={`transition-all duration-300 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div
              className="p-4 sm:p-6 rounded-2xl shadow-lg border-2"
              style={{
                background: 'var(--color-secondary)',
                borderColor: 'var(--color-border, #e5e7eb)'
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="w-full p-2.5 sm:p-3 rounded-xl shadow-sm focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
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
                  <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    className="w-full p-2.5 sm:p-3 rounded-xl shadow-sm focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
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
                  <label className="text-xs sm:text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                    <FaSort />
                    <span>Sort By</span>
                  </label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full p-2.5 sm:p-3 rounded-xl shadow-sm focus:ring-2 focus:outline-none transition-all duration-200 text-sm sm:text-base"
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
                    className={`w-full px-4 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${hasActiveFilters ? 'hover:shadow-lg hover:scale-105' : 'opacity-50 cursor-not-allowed'
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
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--color-border, #e5e7eb)' }}>
                  <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text)' }}>Active Filters:</span>
                  {searchTerm && (
                    <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm" style={{ background: 'var(--color-primary)', color: 'white' }}>
                      Search: {searchTerm}
                    </span>
                  )}
                  {statusFilter !== 'All' && (
                    <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm" style={{ background: 'var(--color-accent)', color: 'white' }}>
                      Status: {statusFilter}
                    </span>
                  )}
                  {categoryFilter !== 'All' && (
                    <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-600 text-white shadow-sm">
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
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 rounded-xl shadow-md" style={{ background: 'var(--color-secondary)', border: '2px solid var(--color-border, #e5e7eb)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'var(--color-primary)' }}>
                <FaBoxOpen className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  {items.length > 0 ? (
                    <><span style={{ color: 'var(--color-primary)' }}>{items.length}</span> {items.length === 1 ? 'Item' : 'Items'} Found</>
                  ) : (
                    'No items found'
                  )}
                </p>
                {items.length > 0 && (
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--color-muted, #6b7280)' }}>
                    Page {page} of {totalPages}
                  </p>
                )}
              </div>
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-muted, #6b7280)' }}>
                  Results updated
                </span>
              </div>
            )}
          </div>
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="py-16">
            <Loader size="lg" text="Searching for items..." variant="dots" />
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 rounded-2xl shadow-lg border-2"
            style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-border, #e5e7eb)' }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'var(--color-bg)' }}>
              <FaBoxOpen className="text-4xl sm:text-6xl opacity-30" style={{ color: 'var(--color-text)' }} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              No Items Found
            </h3>
            <p className="text-center mb-4 sm:mb-6 max-w-md text-sm sm:text-base" style={{ color: 'var(--color-muted, #6b7280)' }}>
              {hasActiveFilters
                ? "No items match your current filters. Try adjusting your search criteria."
                : "Be the first to report a lost or found item!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
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
          <div className="mt-8 sm:mt-12">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Help Section - Feature Cards */}
        {!loading && items.length === 0 && !hasActiveFilters && (
          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div
              className="group p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2"
              style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-border, #e5e7eb)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'var(--color-primary)' }}>
                  <FaLightbulb className="text-white text-xl sm:text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: 'var(--color-text)' }}>Lost Something?</h3>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted, #6b7280)' }}>
                    Report your lost item with detailed description and we'll notify you if someone finds it.
                  </p>
                  <Link
                    to="/items/create"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group/btn text-sm sm:text-base"
                    style={{ background: 'var(--color-primary)', color: 'white' }}
                  >
                    <FaPlus className="group-hover/btn:rotate-90 transition-transform duration-300" />
                    <span>Report Lost Item</span>
                    <FaChevronRight className="text-xs group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>

            <div
              className="group p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2"
              style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-border, #e5e7eb)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'var(--color-accent)' }}>
                  <FaHandHoldingHeart className="text-white text-xl sm:text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: 'var(--color-text)' }}>Found Something?</h3>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted, #6b7280)' }}>
                    Help someone by reporting the item you found. Include photos and location details.
                  </p>
                  <Link
                    to="/items/create"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group/btn text-sm sm:text-base"
                    style={{ background: 'var(--color-accent)', color: 'white' }}
                  >
                    <FaPlus className="group-hover/btn:rotate-90 transition-transform duration-300" />
                    <span>Report Found Item</span>
                    <FaChevronRight className="text-xs group-hover/btn:translate-x-1 transition-transform duration-300" />
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
        className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
        style={{ background: 'var(--color-primary)' }}
        aria-label="Report new item"
      >
        <FaPlus className="text-white text-xl sm:text-2xl transition-transform duration-300 group-hover:rotate-90" />
      </Link>
    </div>
  );
}

export default Home;
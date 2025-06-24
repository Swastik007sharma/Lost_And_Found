import { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { searchItems } from '../services/searchService';
import ItemCard from '../components/ItemCard';
import { toast } from 'react-toastify';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

function Home() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

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
          isActive: true,
        };
        const response = await searchItems(params);
        if (response && Array.isArray(response?.data?.items)) {
          setItems(response.data.items);
          setTotalPages(response.data.pagination?.totalPages || 1);
        } else {
          console.error('Unexpected response format:', response);
          setItems([]);
          setTotalPages(1);
          toast.error('No items found. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching items:', err);
        toast.error('Failed to load items. Please try again later.');
        setItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    return () => clearTimeout(alertTimeout.current);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans">
      <header className="py-4 sm:py-6 shadow-md bg-[var(--bg-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-color)] py-4 text-center">
              Lost & Found - College Portal
            </h1>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-2/3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 ">
                <HiOutlineMagnifyingGlass className="w-5 h-5 text-[var(--primary)]"/>
              </span>
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-[var(--secondary)] bg-[var(--bg-color)] text-[var(--text-color)] placeholder-[var(--secondary)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm sm:text-base shadow-sm transition-all duration-200"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full sm:w-1/3 p-3 border border-[var(--secondary)] rounded-md shadow-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm sm:text-base appearance-none bg-[var(--bg-color)] text-[var(--text-color)]"
            >
              <option value="All">All Statuses</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
              <option value="Claimed">Claimed</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          {/* Items Grid */}
          {loading ? <Loader/> : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[var(--bg-color)] text-[var(--text-color)] text-center py-12 px-6 sm:px-8 rounded-lg shadow-md">
              <p className="text-lg sm:text-xl">No items found matching your search.</p>
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

          {/* Mobile Add Item Button (Visible Only for Logged-In Users) */}
          {user && (
            <div className="fixed bottom-4 right-4 sm:hidden">
              <Link
                to="/items/create"
                className="bg-[var(--primary)] hover:bg-blue-700 text-[var(--text-color)] text-sm font-medium py-3 px-4 rounded-full shadow-lg transition duration-200"
              >
                + Add New Item
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default Home;
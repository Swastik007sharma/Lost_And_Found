import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiMapPin,
  FiBookmark,
  FiFileText,
  FiCalendar,
  FiUser,
  FiShield,
  FiArrowLeft,
  FiPackage
} from 'react-icons/fi';
import Loader from '../components/common/Loader';
import ItemCard from '../components/ItemCard';
import api from '../services/api';

const KeeperProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [keeper, setKeeper] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKeeperData = async () => {
      try {
        setLoading(true);

        // Fetch keeper details from the keepers list
        const keepersResponse = await api.get('/keepers');
        const foundKeeper = keepersResponse.data.keepers.find(k => k._id === id);

        if (!foundKeeper) {
          setError('Keeper not found');
          setLoading(false);
          return;
        }

        setKeeper(foundKeeper);

        // Fetch items managed by this keeper
        const itemsResponse = await api.get(`/items?search=${encodeURIComponent(foundKeeper.name)}`);

        // Filter items to only show those where this keeper is actually the keeper
        const keeperItems = itemsResponse.data.items.filter(
          item => item.keeper && item.keeper._id === id
        );

        setItems(keeperItems);
      } catch (err) {
        console.error('Error fetching keeper data:', err);
        setError('Failed to load keeper profile');
      } finally {
        setLoading(false);
      }
    };

    fetchKeeperData();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }`}>
        <div className={`text-center p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'
          }`}>
          <div className="text-red-500 text-lg font-semibold mb-4">{error}</div>
          <button
            onClick={() => navigate('/keepers')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            Back to Keepers
          </button>
        </div>
      </div>
    );
  }

  if (!keeper) return null;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/keepers')}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all ${theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
            }`}
        >
          <FiArrowLeft />
          <span>Back to Keepers</span>
        </motion.button>

        {/* Keeper Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl shadow-xl overflow-hidden mb-8 max-w-4xl mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
        >
          {/* Gradient Header */}
          <div className={`relative h-32 ${theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
            <div className="absolute -bottom-16 left-8">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl ${theme === 'dark'
                  ? 'bg-gray-700 text-white border-4 border-gray-800'
                  : 'bg-white text-blue-600 border-4 border-white'
                }`}>
                {keeper.name ? keeper.name[0].toUpperCase() : <FiUser />}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {keeper.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                    <FiShield className="text-xs" />
                    Keeper
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                  }`}>
                  <FiMail className={`text-xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Email Address
                  </p>
                  <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    {keeper.email}
                  </p>
                </div>
              </div>

              {keeper.location && (
                <div className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-600/20' : 'bg-green-100'
                    }`}>
                    <FiMapPin className={`text-xl ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      Location
                    </p>
                    <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {keeper.location}
                    </p>
                  </div>
                </div>
              )}

              {keeper.department && (
                <div className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'
                    }`}>
                    <FiBookmark className={`text-xl ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      Department
                    </p>
                    <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {keeper.department}
                    </p>
                  </div>
                </div>
              )}

              <div className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-600/20' : 'bg-yellow-100'
                  }`}>
                  <FiCalendar className={`text-xl ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                    }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Member Since
                  </p>
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    {new Date(keeper.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {keeper.description && (
                <div className={`flex items-start gap-3 p-4 rounded-lg md:col-span-2 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-pink-600/20' : 'bg-pink-100'
                    }`}>
                    <FiFileText className={`text-xl ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
                      }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      About
                    </p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {keeper.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Items Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiPackage className={`text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              Items Currently Managing ({items.length})
            </h2>
          </div>

          {items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className={`text-center py-16 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'
              }`}>
              <FiPackage className={`text-6xl mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                }`} />
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                No Items Currently Managing
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                This keeper is not currently managing any items.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default KeeperProfile;

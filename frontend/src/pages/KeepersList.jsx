import React, { useEffect, useState } from 'react';
import { getKeepers } from '../services/keeperService';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiMapPin,
  FiBookmark,
  FiFileText,
  FiCalendar,
  FiUser,
  FiUsers,
  FiShield
} from 'react-icons/fi';
import Loader from '../components/common/Loader';

const KeepersList = () => {
  const [keepers, setKeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    getKeepers()
      .then(res => setKeepers(res.data.keepers))
      .catch(() => setError('Failed to fetch keepers'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-linear-to-br from-blue-50 via-white to-purple-50'
        }`}>
        <div className={`text-center p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'
          }`}>
          <div className="text-red-500 text-lg font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-linear-to-br from-blue-50 via-white to-purple-50'
      }`}>
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
              <FiUsers className={`text-3xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
            </div>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            Available Keepers
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Connect with our trusted keepers who help manage found items
          </p>
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-md'
            }`}>
            <FiShield className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              {keepers.length} {keepers.length === 1 ? 'Keeper' : 'Keepers'} Available
            </span>
          </div>
        </motion.div>

        {/* Keepers Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {keepers.map((keeper, index) => (
            <motion.div
              key={keeper._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => navigate(`/keepers/${keeper._id}`)}
              className={`rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              {/* Gradient Header */}
              <div className="h-24 bg-linear-to-r from-blue-500 to-purple-500 relative">
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl border-4 ${theme === 'dark'
                      ? 'bg-gray-700 text-white border-gray-800'
                      : 'bg-white text-blue-600 border-white'
                    }`}>
                    {keeper.name?.[0]?.toUpperCase() || <FiUser />}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="pt-14 px-6 pb-6">
                {/* Name */}
                <h3 className={`text-xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {keeper.name}
                </h3>

                {/* Role Badge */}
                <div className="flex justify-center mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    <FiShield className="text-xs" />
                    Keeper
                  </span>
                </div>

                {/* Information Grid */}
                <div className="space-y-3">
                  {/* Email */}
                  <div className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                    <div className={`p-2 rounded-lg shrink-0 ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                      }`}>
                      <FiMail className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Email
                      </p>
                      <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {keeper.email}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {keeper.location && (
                    <div className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                      <div className={`p-2 rounded-lg shrink-0 ${theme === 'dark' ? 'bg-green-600/20' : 'bg-green-100'
                        }`}>
                        <FiMapPin className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Location
                        </p>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {keeper.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Department */}
                  {keeper.department && (
                    <div className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                      <div className={`p-2 rounded-lg shrink-0 ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'
                        }`}>
                        <FiBookmark className={`text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Department
                        </p>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {keeper.department}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {keeper.description && (
                    <div className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                      <div className={`p-2 rounded-lg shrink-0 ${theme === 'dark' ? 'bg-yellow-600/20' : 'bg-yellow-100'
                        }`}>
                        <FiFileText className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          About
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {keeper.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Joined Date */}
                  <div className={`flex items-center justify-center gap-2 pt-3 mt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <FiCalendar className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                      Member since {new Date(keeper.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {keepers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-16 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'
              }`}
          >
            <FiUsers className={`text-6xl mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
              }`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              No Keepers Available
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              There are currently no keepers registered in the system.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default KeepersList;

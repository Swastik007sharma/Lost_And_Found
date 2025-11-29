import {
  FaUsers,
  FaBoxOpen,
  FaUserShield,
  FaComments,
  FaTags,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown,
  FaChartLine
} from "react-icons/fa";

function OverviewTab({ stats }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Object.entries(stats).map(([key, value]) => {
          if (key === "mostActiveUsers") return null;

          // Map stat keys to icons and colors
          const statConfig = {
            totalUsers: { icon: <FaUsers className="text-2xl sm:text-3xl" />, color: "from-blue-500 to-blue-600", label: "Total Users" },
            totalItems: { icon: <FaBoxOpen className="text-2xl sm:text-3xl" />, color: "from-purple-500 to-purple-600", label: "Total Items" },
            totalKeepers: { icon: <FaUserShield className="text-2xl sm:text-3xl" />, color: "from-green-500 to-green-600", label: "Total Keepers" },
            totalConversations: { icon: <FaComments className="text-2xl sm:text-3xl" />, color: "from-orange-500 to-orange-600", label: "Conversations" },
            totalCategories: { icon: <FaTags className="text-2xl sm:text-3xl" />, color: "from-pink-500 to-pink-600", label: "Categories" },
            activeItems: { icon: <FaCheckCircle className="text-2xl sm:text-3xl" />, color: "from-teal-500 to-teal-600", label: "Active Items" },
            inactiveItems: { icon: <FaTimesCircle className="text-2xl sm:text-3xl" />, color: "from-red-500 to-red-600", label: "Inactive Items" },
          };

          const config = statConfig[key] || { icon: <FaChartBar className="text-2xl sm:text-3xl" />, color: "from-gray-500 to-gray-600", label: key };

          return (
            <div
              key={key}
              className="group relative p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-opacity-20"
              style={{
                background: 'var(--color-secondary)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-primary)'
              }}
            >
              {/* Background gradient effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-br from-blue-500 to-purple-600"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br ${config.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {config.icon}
                  </div>
                  <div className="flex items-center gap-1 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaChartLine className="text-xs sm:text-sm" />
                    <span className="text-xs font-semibold hidden sm:inline">Live</span>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {value}
                </p>
                <h2 className="text-xs sm:text-sm font-semibold opacity-80" style={{ color: 'var(--color-text)' }}>
                  {config.label}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Most Active Users Section */}
      <div className="p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300" style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white shadow-md animate-pulse">
              <FaCrown className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                Most Active Users
              </h2>
              <p className="text-xs opacity-70">Top contributors this month</p>
            </div>
          </div>
          {stats.mostActiveUsers?.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-yellow-500 to-orange-600 text-white self-start sm:self-auto">
              Top {stats.mostActiveUsers.length}
            </span>
          )}
        </div>
        {stats.mostActiveUsers?.length > 0 ? (
          <ul className="space-y-2 sm:space-y-3">
            {stats.mostActiveUsers.map((activeUser, index) => (
              <li
                key={activeUser.userId}
                className="group flex justify-between items-center p-3 sm:p-4 rounded-xl transition-all duration-200 hover:scale-102 transform hover:shadow-md"
                style={{ background: 'var(--color-bg)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg ${index === 0 ? 'bg-linear-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-linear-to-br from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-linear-to-br from-orange-400 to-orange-600' :
                          'bg-linear-to-br from-blue-500 to-purple-600'
                      }`}>
                      #{index + 1}
                    </span>
                    {index < 3 && (
                      <FaCrown className={`absolute -top-1 sm:-top-2 -right-1 sm:-right-2 text-xs sm:text-sm ${index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-400' :
                          'text-orange-400'
                        }`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold block group-hover:text-blue-500 transition-colors truncate" style={{ color: 'var(--color-text)' }}>
                      {activeUser.name}
                    </span>
                    <span className="text-xs opacity-70 truncate block" style={{ color: 'var(--color-text)' }}>
                      {activeUser.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-md group-hover:shadow-lg transition-shadow whitespace-nowrap">
                    {activeUser.itemCount} <span className="hidden sm:inline">items</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <FaUsers className="text-2xl sm:text-3xl opacity-50" style={{ color: 'var(--color-text)' }} />
            </div>
            <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>No active users yet.</p>
            <p className="text-xs opacity-50 mt-1" style={{ color: 'var(--color-text)' }}>Users will appear here once they start posting items.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewTab;

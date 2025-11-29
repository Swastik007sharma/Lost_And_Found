import { FaUserShield, FaEnvelope, FaUserCircle } from "react-icons/fa";

function KeepersTab({ keepers }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-md">
            <FaUserShield className="text-xl sm:text-2xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Manage Keepers
            </h2>
            <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              View all registered keepers
            </p>
          </div>
        </div>
        <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-linear-to-r from-green-500 to-green-600 text-white text-sm sm:text-base font-semibold shadow-md">
          {keepers.length} {keepers.length === 1 ? 'Keeper' : 'Keepers'}
        </div>
      </div>

      {/* Keepers Grid */}
      {keepers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {keepers.map((keeper) => (
            <div
              key={keeper._id}
              className="group p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-green-500 hover:border-opacity-30"
              style={{ background: 'var(--color-secondary)' }}
            >
              {/* Avatar */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FaUserCircle className="text-4xl sm:text-5xl" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-3 sm:border-4 border-white dark:border-gray-800 shadow-md"></div>
                </div>
              </div>

              {/* Keeper Info */}
              <div className="text-center space-y-2 sm:space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 group-hover:text-green-500 transition-colors" style={{ color: 'var(--color-text)' }}>
                    {keeper.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                    <FaEnvelope className="text-xs shrink-0" />
                    <span className="truncate">{keeper.email}</span>
                  </div>
                </div>

                {/* Badge */}
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-green-500 to-green-600 text-white shadow-md">
                    Active Keeper
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-2xl shadow-lg text-center" style={{ background: 'var(--color-secondary)' }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <FaUserShield className="text-3xl sm:text-4xl opacity-50" style={{ color: 'var(--color-text)' }} />
          </div>
          <p className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No Keepers Found</p>
          <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
            Keepers will appear here once they are registered in the system.
          </p>
        </div>
      )}
    </div>
  );
}

export default KeepersTab;

import { Link, useLocation } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaImage, FaUserCircle, FaTag } from 'react-icons/fa';

// Helper for relative time
function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return then.toLocaleDateString();
}

const statusColors = {
  Lost: 'bg-red-100 text-red-700 border-red-400',
  Found: 'bg-blue-100 text-blue-700 border-blue-400',
  Claimed: 'bg-yellow-100 text-yellow-700 border-yellow-400',
  Returned: 'bg-green-100 text-green-700 border-green-400',
};

const ItemCard = ({
  item,
  onEdit,
  onDelete,
  showActions = true,
  isEditing = false,
  editFormData,
  onEditChange,
  onEditSubmit,
  onCancelEdit,
  onGenerateOTP,    // New prop for generating OTP
  onVerifyOTP,      // New prop for verifying OTP
  otp,              // OTP value
  setOtp,           // Function to update OTP
}) => {
  const location = useLocation();
  return (
    <div className="rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] group" style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}>
      {isEditing ? (
        <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gray-100 rounded-t-xl overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300 ease-in-out">
              <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <FaSearch className="text-gray-400 text-4xl group-hover:text-blue-400 transition-colors duration-300" />
                  <FaImage className="text-gray-300 text-2xl absolute -bottom-1 -right-1 group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm font-medium group-hover:text-gray-600 transition-colors duration-300">
                    No Image Available
                  </p>
                  <p className="text-gray-400 text-xs mt-1 group-hover:text-gray-500 transition-colors duration-300">
                    Click to view details
                  </p>
                </div>
              </div>
            </div>
          )}
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                aria-label="Edit item"
              >
                <FaEdit size={16} />
              </button>
              <button
                onClick={onDelete}
                className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-full bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                aria-label="Delete item"
              >
                <FaTrash size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to={`/items/${item._id}`}>
          <div className="p-4 sm:p-5 cursor-pointer flex flex-col gap-2 animate-fade-in-up group hover:shadow-lg transition-all duration-200 rounded-xl" style={{ minHeight: 180 }}>
            <div className="flex items-center gap-2 mb-1">
              {/* Status badge */}
              <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${statusColors[item.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{item.status}</span>
              {/* Category */}
              {item.category?.name && (
                <span className="ml-2 px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1"><FaTag className="inline-block text-gray-400" />{item.category.name}</span>
              )}
              {/* Relative time */}
              <span className="ml-auto text-xs text-gray-500" title={new Date(item.createdAt).toLocaleString()}>{timeAgo(item.createdAt)}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors" style={{ color: 'var(--color-text)' }}>{item.title}</h3>
            {/* Truncated description */}
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-1">{item.description}</p>
            )}
            {/* Tags (if any) */}
            {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">#{tag}</span>
                ))}
              </div>
            )}
            {/* User avatar/initials */}
            <div className="flex items-center gap-2 mt-auto">
              {item.user?.avatarUrl ? (
                <img src={item.user.avatarUrl} alt="User avatar" className="w-7 h-7 rounded-full object-cover border border-gray-300" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-base">
                  {item.user?.name ? item.user.name[0].toUpperCase() : <FaUserCircle className="text-xl" />}
                </span>
              )}
              <span className="text-xs text-gray-600 font-medium">{item.user?.name || 'Unknown'}</span>
            </div>
          </div>
        </Link>
      )}

      {isEditing ? (
        <div className="p-4 sm:p-5">
          <div className="space-y-4">
            <input
              type="text"
              name="title"
              value={editFormData.title}
              onChange={onEditChange}
              className="w-full p-2 border rounded-md text-sm sm:text-base"
              style={{
                border: '1px solid var(--color-secondary)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
              required
            />
            <textarea
              name="description"
              value={editFormData.description}
              onChange={onEditChange}
              className="w-full p-2 border rounded-md text-sm sm:text-base h-20"
              style={{
                border: '1px solid var(--color-secondary)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
              required
            />
            <select
              name="status"
              value={editFormData.status}
              onChange={onEditChange}
              className="w-full p-2 border rounded-md text-sm sm:text-base"
              style={{
                border: '1px solid var(--color-secondary)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
              required
            >
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
              <option value="Claimed">Claimed</option>
              <option value="Returned">Returned</option>
            </select>
            <input
              type="text"
              name="category"
              value={editFormData.category}
              onChange={onEditChange}
              className="w-full p-2 border rounded-md text-sm sm:text-base"
              style={{
                border: '1px solid var(--color-secondary)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
              required
            />
            <input
              type="text"
              name="location"
              value={editFormData.location}
              onChange={onEditChange}
              className="w-full p-2 border rounded-md text-sm sm:text-base"
              style={{
                border: '1px solid var(--color-secondary)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
              required
            />
            <input
              type="file"
              name="image"
              onChange={onEditChange}
              className="w-full p-2 border rounded-md text-sm sm:text-base"
              style={{
                border: '1px solid var(--color-secondary)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onEditSubmit}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-all duration-200 text-sm hover:scale-105 transform shadow-sm hover:shadow-md"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-all duration-200 text-sm hover:scale-105 transform shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Link to={`/items/${item._id}`}>
          <div className="p-4 sm:p-5 cursor-pointer">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text)' }}>
              {item.title}
            </h3>
            <div className="text-sm sm:text-base space-y-2 mb-4" style={{ color: 'var(--color-text)' }}>
              <p>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>Status:</span>{' '}
                <span className={`status-badge ${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>
              </p>
              <p>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>Category:</span>{' '}
                {item.category?.name || 'N/A'}
              </p>
              <p>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>Posted On:</span>{' '}
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {item.status === 'Claimed' && showActions && location.pathname !== "/" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onGenerateOTP();
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Generate OTP
                  </button>
                  {onVerifyOTP && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          e.preventDefault();
                          setOtp(e.target.value);
                        }}
                        onClick={(e) => e.preventDefault()}
                        placeholder="Enter OTP"
                        className="w-full p-2 border rounded-md text-sm"
                        style={{
                          border: '1px solid var(--color-secondary)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-text)'
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onVerifyOTP();
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default ItemCard;
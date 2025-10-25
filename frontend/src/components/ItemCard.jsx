import { Link } from 'react-router-dom';
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
}) => {
  return (
    <div className="rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.015] group focus-within:ring-2 focus-within:ring-blue-400">
      {/* Image area */}
      <Link to={`/items/${item._id}`} tabIndex={0} aria-label={`View details for ${item.title}`}>
        <div className="relative w-full h-44 sm:h-52 md:h-60 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <FaImage className="text-5xl text-gray-300 dark:text-gray-600 mb-2" />
              <span className="text-xs text-gray-400">No Image</span>
            </div>
          )}
          {/* Status badge with icon */}
          <span className={`absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold shadow ${statusColors[item.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}
            aria-label={`Status: ${item.status}`}
          >
            {item.status === 'Lost' && <FaSearch className="text-red-400" />}
            {item.status === 'Found' && <FaSearch className="text-blue-400" />}
            {item.status === 'Claimed' && <FaTag className="text-yellow-500" />}
            {item.status === 'Returned' && <FaTag className="text-green-500" />}
            {item.status}
          </span>
          {/* Action bar (desktop) */}
          {showActions && (
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                onClick={e => { e.preventDefault(); onEdit && onEdit(); }}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md focus:outline-none"
                aria-label="Edit item"
                tabIndex={0}
              >
                <FaEdit size={16} />
              </button>
              <button
                onClick={e => { e.preventDefault(); onDelete && onDelete(); }}
                className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-full bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md focus:outline-none"
                aria-label="Delete item"
                tabIndex={0}
              >
                <FaTrash size={16} />
              </button>
            </div>
          )}
        </div>
      </Link>
      {/* Card content */}
      <div className="p-4 sm:p-5 flex flex-col gap-2 animate-fade-in-up group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors duration-200 rounded-b-2xl">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold mb-1 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" style={{ color: 'var(--color-text)' }} tabIndex={-1}>{item.title}</h3>
        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">{item.description}</p>
        )}
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 text-xs mt-2 mb-1">
          {/* Status badge (compact) */}
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${statusColors[item.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}
            aria-label={`Status: ${item.status}`}
          >
            {item.status === 'Lost' && <FaSearch className="text-red-400" />}
            {item.status === 'Found' && <FaSearch className="text-blue-400" />}
            {item.status === 'Claimed' && <FaTag className="text-yellow-500" />}
            {item.status === 'Returned' && <FaTag className="text-green-500" />}
            {item.status}
          </span>
          {/* Category */}
          {item.category?.name && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium"><FaTag className="inline-block text-gray-400" />{item.category.name}</span>
          )}
          {/* Posted date */}
          <span className="ml-auto text-gray-500" title={new Date(item.createdAt).toLocaleString()}>
            {timeAgo(item.createdAt)}
          </span>
        </div>
        {/* Tags (if any) */}
        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {item.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium">#{tag}</span>
            ))}
          </div>
        )}
        {/* User info */}
        <div className="flex items-center gap-2 mt-2" aria-label="Reported by">
          {item.user?.avatarUrl ? (
            <img src={item.user.avatarUrl} alt="User avatar" className="w-7 h-7 rounded-full object-cover border border-gray-300" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-base">
              {item.user?.name ? item.user.name[0].toUpperCase() : <FaUserCircle className="text-xl" />}
            </span>
          )}
          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{item.postedBy?.name || 'Unknown'}</span>
        </div>
      </div>

      {isEditing && (
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
      )}
    </div>
  );
};

export default ItemCard;
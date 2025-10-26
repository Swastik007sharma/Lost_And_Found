import { Link } from 'react-router-dom';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaImage,
  FaUserCircle,
  FaTag,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaCalendarAlt
} from 'react-icons/fa';

// Helper for relative time
function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}

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
  // Determine status color scheme
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Lost':
        return {
          bg: '#fee2e2',
          text: '#991b1b',
          border: '#fca5a5',
          icon: <FaExclamationCircle className="text-red-500" />
        };
      case 'Found':
        return {
          bg: '#dbeafe',
          text: '#1e40af',
          border: '#93c5fd',
          icon: <FaSearch className="text-blue-500" />
        };
      case 'Claimed':
        return {
          bg: '#fef3c7',
          text: '#92400e',
          border: '#fcd34d',
          icon: <FaTag className="text-yellow-600" />
        };
      case 'Returned':
        return {
          bg: '#d1fae5',
          text: '#065f46',
          border: '#6ee7b7',
          icon: <FaCheckCircle className="text-green-500" />
        };
      default:
        return {
          bg: '#f3f4f6',
          text: '#374151',
          border: '#d1d5db',
          icon: <FaTag className="text-gray-500" />
        };
    }
  };

  const statusStyle = getStatusStyle(item.status);

  return (
    <div
      className="rounded-2xl shadow-lg overflow-hidden border hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] group"
      style={{
        background: 'var(--color-secondary)',
        borderColor: 'var(--color-border, #e5e7eb)',
        color: 'var(--color-text)'
      }}
    >
      {/* Image area */}
      <Link to={`/items/${item._id}`} tabIndex={0} aria-label={`View details for ${item.title}`}>
        <div
          className="relative w-full h-56 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-secondary) 100%)',
          }}
        >
          {item.image ? (
            <>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* View Details overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 dark:bg-gray-800/90 px-6 py-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center space-x-2">
                  <FaEye className="text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-gray-800 dark:text-gray-200">View Details</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <FaImage className="text-6xl mb-3 opacity-30" style={{ color: 'var(--color-border, #d1d5db)' }} />
              <span className="text-sm font-medium opacity-50" style={{ color: 'var(--color-muted, #9ca3af)' }}>No Image Available</span>
            </div>
          )}

          {/* Status badge with modern design */}
          <div
            className="absolute top-3 left-3 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm border-2 font-bold text-sm"
            style={{
              background: statusStyle.bg,
              color: statusStyle.text,
              borderColor: statusStyle.border
            }}
            aria-label={`Status: ${item.status}`}
          >
            {statusStyle.icon}
            <span>{item.status}</span>
          </div>

          {/* Action buttons (desktop) */}
          {showActions && (
            <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={e => { e.preventDefault(); onEdit && onEdit(); }}
                className="text-white bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Edit item"
                tabIndex={0}
              >
                <FaEdit size={18} />
              </button>
              <button
                onClick={e => { e.preventDefault(); onDelete && onDelete(); }}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Delete item"
                tabIndex={0}
              >
                <FaTrash size={18} />
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Card content */}
      <div
        className="p-5 flex flex-col gap-3"
        style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
      >
        {/* Title */}
        <h3
          className="text-xl font-bold mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
          style={{ color: 'var(--color-text)' }}
        >
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p
            className="text-sm line-clamp-3 leading-relaxed"
            style={{ color: 'var(--color-muted, #6b7280)' }}
          >
            {item.description}
          </p>
        )}

        {/* Category and Location info cards */}
        <div className="grid grid-cols-1 gap-2 mt-2">
          {/* Category */}
          {item.category?.name && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border, #e5e7eb)'
              }}
            >
              <FaTag className="text-purple-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {item.category.name}
                {item.subCategory?.name && (
                  <span style={{ color: 'var(--color-muted, #9ca3af)' }}> / {item.subCategory.name}</span>
                )}
              </span>
            </div>
          )}

          {/* Location */}
          {item.location && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border, #e5e7eb)'
              }}
            >
              <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {item.location}
              </span>
            </div>
          )}
        </div>

        {/* Footer with user and time */}
        <div
          className="flex items-center justify-between pt-3 mt-2 border-t"
          style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
        >
          {/* User info */}
          <div className="flex items-center gap-2">
            {item.user?.avatarUrl || item.postedBy?.avatarUrl ? (
              <img
                src={item.user?.avatarUrl || item.postedBy?.avatarUrl}
                alt="User avatar"
                className="w-9 h-9 rounded-full object-cover border-2 shadow-sm"
                style={{ borderColor: 'var(--color-border, #d1d5db)' }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                {item.user?.name ? item.user.name[0].toUpperCase() : item.postedBy?.name ? item.postedBy.name[0].toUpperCase() : <FaUserCircle className="text-xl" />}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {item.user?.name || item.postedBy?.name || 'Anonymous'}
              </span>
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-muted, #9ca3af)' }}>
                <FaClock size={10} />
                {timeAgo(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Date badge */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-muted, #6b7280)'
            }}
            title={new Date(item.createdAt).toLocaleString()}
          >
            <FaCalendarAlt size={10} />
            <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Tags (if any) */}
        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-lg text-xs font-medium shadow-sm"
                style={{
                  background: 'var(--color-accent)',
                  color: 'white'
                }}
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: 'var(--color-bg)',
                  color: 'var(--color-muted, #9ca3af)'
                }}
              >
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit form overlay */}
      {isEditing && (
        <div
          className="p-5 border-t-2"
          style={{
            background: 'var(--color-bg)',
            borderColor: 'var(--color-accent)'
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={onEditChange}
                className="w-full p-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                style={{
                  borderColor: 'var(--color-border, #d1d5db)',
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Description
              </label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={onEditChange}
                className="w-full p-3 border-2 rounded-xl text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                style={{
                  borderColor: 'var(--color-border, #d1d5db)',
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Status
              </label>
              <select
                name="status"
                value={editFormData.status}
                onChange={onEditChange}
                className="w-full p-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                style={{
                  borderColor: 'var(--color-border, #d1d5db)',
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)'
                }}
                required
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
                <option value="Claimed">Claimed</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Category
              </label>
              <input
                type="text"
                name="category"
                value={editFormData.category}
                onChange={onEditChange}
                className="w-full p-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                style={{
                  borderColor: 'var(--color-border, #d1d5db)',
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={editFormData.location}
                onChange={onEditChange}
                className="w-full p-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                style={{
                  borderColor: 'var(--color-border, #d1d5db)',
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Image
              </label>
              <input
                type="file"
                name="image"
                onChange={onEditChange}
                className="w-full p-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                style={{
                  borderColor: 'var(--color-border, #d1d5db)',
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border, #e5e7eb)' }}>
              <button
                onClick={onCancelEdit}
                className="px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
                style={{
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-border, #d1d5db)'
                }}
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
              <button
                onClick={onEditSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <FaCheckCircle />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;

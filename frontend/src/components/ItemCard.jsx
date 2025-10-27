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
  FaTimes,
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
  currentUserId,
}) => {
  // Check if current user is the owner
  const isOwner = currentUserId && (currentUserId === item.postedBy?._id || currentUserId === item.user?._id || currentUserId === item.keeperId);

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
      className="rounded-2xl shadow-lg overflow-hidden border hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] group h-full flex flex-col"
      style={{
        background: 'var(--color-secondary)',
        borderColor: 'var(--color-border, #e5e7eb)',
        color: 'var(--color-text)'
      }}
    >
      {/* Image area */}
      <div className="relative flex-shrink-0">
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
          </div>
        </Link>

        {/* Action buttons - now outside Link, always visible for owner */}
        {showActions && (
          <div className={`absolute top-3 right-3 flex gap-2 z-20 transition-opacity duration-300 ${isOwner ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onEdit) {
                  onEdit();
                }
              }}
              type="button"
              className="text-white bg-blue-600 hover:bg-blue-700 p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Edit item"
              tabIndex={0}
            >
              <FaEdit className="text-sm sm:text-base" size={18} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDelete) {
                  onDelete();
                }
              }}
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Delete item"
              tabIndex={0}
            >
              <FaTrash className="text-sm sm:text-base" size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Card content */}
      <div
        className="p-5 flex flex-col gap-3 flex-grow"
        style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
      >
        {/* Title */}
        <h3
          className="text-xl font-bold mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
          style={{ color: 'var(--color-text)' }}
        >
          {item.title}
        </h3>

        {/* Description - Fixed height to maintain consistency */}
        <div className="min-h-[1.5rem]">
          {item.description && (
            <p
              className="text-sm line-clamp-1 leading-relaxed"
              style={{ color: 'var(--color-muted, #6b7280)' }}
            >
              {item.description}
            </p>
          )}
        </div>

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
          <div className="space-y-5">
            {/* Info banner */}
            <div
              className="rounded-xl border px-4 py-3 flex items-start gap-3"
              style={{
                borderColor: 'var(--color-accent)',
                background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary) 70%, var(--color-primary) 120%)',
                color: 'var(--color-text)'
              }}
            >
              <span className="mt-1 text-lg font-semibold" aria-hidden="true" style={{ color: 'var(--color-accent)' }}>ℹ️</span>
              <p className="text-sm leading-relaxed">
                You can update only the <span className="font-semibold">title</span> and <span className="font-semibold">description</span> here. Other item details are locked for consistency and will remain unchanged when you save.
              </p>
            </div>

            {/* Title - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Title
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>Editable</span>
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

            {/* Description - Editable */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Description
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>Editable</span>
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

            {/* Read-only fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Category</p>
                <p className="text-sm px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--color-border, #d1d5db)', background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                  {item.category?.name || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Status</p>
                <p className="text-sm px-3 py-2 rounded-xl border capitalize" style={{ borderColor: 'var(--color-border, #d1d5db)', background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                  {item.status || 'Not specified'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Location</p>
                <p className="text-sm px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--color-border, #d1d5db)', background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                  {item.location || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Current Image Display */}
            {item.image && (
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Current Image</p>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-xl border"
                  style={{ borderColor: 'var(--color-border, #d1d5db)' }}
                />
              </div>
            )}

            {/* Action buttons */}
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

import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Button from './common/Button';
import Input from './common/Input';
import Textarea from './common/Textarea';

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
  onGenerateOTP,
  onVerifyOTP,
  otp,
  setOtp,
}) => {
  // Access the current user from AuthContext
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Determine status badge colors based on status
  const statusStyles = {
    Lost: 'bg-red-500 text-white',
    Found: 'bg-green-500 text-white',
    Claimed: 'bg-yellow-500 text-black',
    Returned: 'bg-blue-500 text-white',
  };

  // Prevent navigation when clicking action buttons
  const handleActionClick = (e, action) => {
    e.stopPropagation(); // Prevent any parent Link navigation
    action(e);
  };

  const handleSaveClick = (e) => {
    console.log('Save button clicked', { editFormData });
    if (onEditSubmit) {
      handleActionClick(e, onEditSubmit);
    } else {
      console.error('onEditSubmit is not defined. Please provide an onEditSubmit function in the parent component.');
    }
  };

  // Handle Delete button click
  const handleDeleteClick = (e) => {
    console.log('Delete button clicked in ItemCard for item:', item._id);
    e.stopPropagation();
    onDelete(e); // Call the onDelete handler with the event
  };

  // Determine visibility of buttons
  const isPoster = user && user.id === item?.postedBy?._id;
  const isKeeper = user && user.id === item?.keeperId;
  const isAdmin = user && user.role === 'admin';

  // Edit button visibility: Only the poster can see it
  const canEdit = isPoster;

  // Delete button visibility: Poster or admin can see it
  const canDelete = isPoster || isAdmin;

  // Generate OTP button visibility: Poster or keeper can see it (only when status is 'Claimed')
  const canGenerateOTP = (isPoster || isKeeper) && item.status === 'Claimed';

  // Debug Save button and edit form visibility
  console.log('ItemCard render:', { isEditing, canEdit, editFormData });

  return (
    <div className="bg-[var(--bg-color)] border border-[var(--secondary)] rounded-xl shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden w-full relative">
      {/* Image Section - Clickable to Navigate */}
      <Link to={`/items/${item._id}`}>
        <div className="relative w-full h-48 sm:h-56 md:h-64 bg-[var(--bg-color)] rounded-t-xl overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-opacity rounded-t-xl"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[var(--secondary)] text-sm sm:text-base rounded-t-xl">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </div>
          )}
          {/* Status Badge */}
          <span
            className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-full ${
              statusStyles[item.status] || 'bg-gray-500 text-white'
            }`}
          >
            {item.status.toUpperCase()}
          </span>
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-2">
              {canEdit && (
                <Button
                  onClick={(e) => handleActionClick(e, onEdit)}
                  className="p-2 rounded-full bg-[var(--bg-color)] bg-opacity-80 hover:bg-opacity-100 text-[var(--primary)] hover:text-blue-800 shadow-sm"
                  aria-label="Edit item"
                >
                  <FaEdit size={16} />
                </Button>
              )}
              {canDelete && (
                <Button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full bg-[var(--bg-color)] bg-opacity-80 hover:bg-opacity-100 text-red-600 hover:text-red-800 shadow-sm"
                  aria-label="Delete item"
                >
                  <FaTrash size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
      </Link>

      {isEditing ? (
        <div className="p-4 sm:p-5">
          <div className="space-y-4">
            <Input
              type="text"
              name="title"
              value={editFormData.title}
              onChange={onEditChange}
              placeholder="Item Title"
              className="text-sm sm:text-base rounded-md border-[var(--secondary)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              required
            />
            <Textarea
              name="description"
              value={editFormData.description}
              onChange={onEditChange}
              placeholder="Description"
              className="text-sm sm:text-base h-20 rounded-md border-[var(--secondary)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              required
            />
            <select
              name="status"
              value={editFormData.status}
              onChange={onEditChange}
              className="w-full p-2 border border-[var(--secondary)] rounded-md text-sm sm:text-base bg-[var(--bg-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              required
            >
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
              <option value="Claimed">Claimed</option>
              <option value="Returned">Returned</option>
            </select>
            <Input
              type="text"
              name="category"
              value={editFormData.category}
              onChange={onEditChange}
              placeholder="Category"
              className="text-sm sm:text-base rounded-md border-[var(--secondary)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              required
            />
            <Input
              type="text"
              name="location"
              value={editFormData.location}
              onChange={onEditChange}
              placeholder="Location"
              className="text-sm sm:text-base rounded-md border-[var(--secondary)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
              required
            />
            <Input
              type="file"
              name="image"
              onChange={onEditChange}
              className="text-sm sm:text-base"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleSaveClick}
                className="bg-[var(--primary)] hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Save
              </Button>
              <Button
                onClick={(e) => handleActionClick(e, onCancelEdit)}
                className="bg-[var(--secondary)] hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          {/* Title - Clickable to Navigate */}
          <Link to={`/items/${item._id}`}>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-color)] mb-2 line-clamp-2 hover:underline">
              {item.title}
            </h3>
          </Link>
          <div className="text-sm sm:text-base text-[var(--secondary)] space-y-2 mb-4">
            <p>
              <span className="font-medium text-[var(--text-color)]">Status:</span>{' '}
              <span className="capitalize">{item.status}</span>
            </p>
            <p>
              <span className="font-medium text-[var(--text-color)]">Category:</span>{' '}
              {item.category?.name || 'N/A'}
            </p>
            <p>
              <span className="font-medium text-[var(--text-color)]">Posted On:</span>{' '}
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {showActions && canGenerateOTP && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={(e) => handleActionClick(e, onGenerateOTP)}
                  className="bg-[var(--primary)] hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Generate OTP
                </Button>
                {onVerifyOTP && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="text-sm rounded-md border-[var(--secondary)] focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    />
                    <Button
                      onClick={(e) => handleActionClick(e, onVerifyOTP)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Verify
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
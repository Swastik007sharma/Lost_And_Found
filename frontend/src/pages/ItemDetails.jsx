import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getItemDetails,
  claimItem,
  updateItem,
  assignKeeperToItem,
  generateOTPForItem,
  verifyOTPForItem,
} from "../services/itemService";
import { startConversation } from "../services/conversationService";
import { toast } from "react-toastify";
import { GoShareAndroid } from "react-icons/go";
import Loader from "../components/common/Loader";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-lg text-red-600">Something went wrong: {this.state.error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 py-2 px-4 bg-[var(--primary)] text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ItemDetails() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "",
    location: "",
    image: null,
  });
  const [removeImage, setRemoveImage] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpItemId, setOtpItemId] = useState(null);

  const fetchItem = async () => {
    if (!id) {
      console.warn("No id provided for fetch");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getItemDetails(id);
      setItem(response.data.item || {});
      setEditFormData({
        title: response.data.item?.title || "",
        description: response.data.item?.description || "",
        category: response.data.item?.category?.name || "",
        status: response.data.item?.status || "",
        location: response.data.item?.location || "",
        image: null,
      });
    } catch (err) {
      console.error(
        "Fetch error:",
        err.message,
        "Response:",
        err.response?.data
      );
      toast.error(
        "Failed to load item: " + (err.response?.data?.message || err.message)
      );
      setItem({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (!loading && !item) {
      fetchItem();
    }
  }, [loading, item]);

  const handleManualFetch = () => {
    fetchItem();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value, files, type } = e.target;
    if (name === "image" && type === "file") {
      setEditFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (name === "removeImage") {
      setRemoveImage(e.target.checked);
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setClaimLoading(true);
    const data = new FormData();
    data.append("title", editFormData.title);
    data.append("description", editFormData.description);
    data.append("category", editFormData.category);
    data.append("status", editFormData.status);
    data.append("location", editFormData.location);
    if (editFormData.image) {
      data.append("image", editFormData.image);
    } else if (removeImage) {
      data.append("image", "");
    }

    try {
      await updateItem(id, data);
      setIsEditing(false);
      await fetchItem();
      toast.success("Item updated successfully");
    } catch (err) {
      toast.error(
        "Failed to update item: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setClaimLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setClaimLoading(true);
    try {
      await claimItem(id);
      await fetchItem();
      toast.success("Item claimed successfully! The owner will be notified.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        "Failed to claim item: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setClaimLoading(false);
    }
  };

  const handleStartConversation = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setConversationLoading(true);
    try {
      const participants = [user.id, item?.postedBy?._id];
      const response = await startConversation({ itemId: id, participants });
      if (
        response.data &&
        response.data.conversation &&
        response.data.conversation._id
      ) {
        navigate(`/messages/${response.data.conversation._id}`);
      } else if (response.status === 200 && response.data.conversation) {
        navigate(`/messages/${response.data.conversation._id}`);
      } else {
        throw new Error(
          "Invalid conversation response: _id not found in conversation object"
        );
      }
      toast.success("Conversation started successfully");
    } catch (err) {
      console.error(
        "Conversation error:",
        err.response ? err.response.data : err.message
      );
      toast.error(
        "Failed to start conversation: " +
          (err.response?.data?.message ||
            err.message ||
            "Unknown server error. Please try again later.")
      );
    } finally {
      setConversationLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const itemUrl = `${window.location.origin}${location.pathname}`;
      await navigator.clipboard.writeText(itemUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link to clipboard: " + err.message);
    }
  };

  const handleAssignKeeper = async () => {
    if (!user || user.role !== "keeper") return;
    setClaimLoading(true);
    try {
      const payload = { keeperId: user.id, keeperName: user.name };
      await assignKeeperToItem(id, payload);
      await fetchItem();
      toast.success("Assigned as keeper successfully");
    } catch (err) {
      toast.error(
        "Failed to assign keeper: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setClaimLoading(false);
    }
  };

  const handleGenerateOTP = async () => {
    if (!user) return;
    const isPoster = user.id === item?.postedBy?._id;
    const isKeeper = user.id === item?.keeperId;
    if (!isPoster && !isKeeper) {
      toast.error("Only the poster or assigned keeper can generate OTP.");
      return;
    }
    setClaimLoading(true);
    try {
      const response = await generateOTPForItem(id);
      setOtpItemId(id);
      setOtp("");
      toast.success(
        `OTP generated successfully: ${response.data.otp}. Share this with the claimant.`
      );
    } catch (err) {
      toast.error(
        "Failed to generate OTP: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setClaimLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }
    setClaimLoading(true);
    try {
      await verifyOTPForItem(id, { otp });
      await fetchItem();
      toast.success("OTP verified successfully! Item marked as returned.");
      setOtpItemId(null);
      setOtp("");
    } catch (err) {
      toast.error(
        "Failed to verify OTP: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setClaimLoading(false);
    }
  };

  const isOwner = user && String(user.id) === String(item?.postedBy?._id);
  const isKeeper = user && String(user.id) === String(item?.keeperId);
  const isClaimant = user && user.id === item?.claimedById;
  const isPosterOrKeeper =
    user &&
    (String(user.id) === String(item?.postedBy?._id) ||
      String(user.id) === String(item?.keeperId));

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!item || Object.keys(item).length === 0) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-[var(--secondary)] text-lg font-medium">
          Item not found or failed to load.
        </p>
        <button
          onClick={handleManualFetch}
          className="ml-4 py-2 px-4 bg-[var(--primary)] text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto lg:mt-8">
          {!isEditing ? (
            <div className="bg-[var(--card-bg)] rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/3 p-6 bg-gray-100">
                  {item.image ? (
                    <div
                      className="w-full h-full rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-[var(--border-color)]"
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
                </div>

                {/* Details Section */}
                <div className="md:w-2/3 p-6 relative">
                  {/* Share Icon - Pinned to Top-Right of Details Section */}
                  <button
                    onClick={handleShare}
                    className="absolute top-6 right-6 p-2 rounded-full bg-[var(--status-bg)] hover:bg-opacity-80 transition-colors z-10"
                    aria-label="Share Item"
                  >
                    <GoShareAndroid />
                  </button>

                  <div className="flex items-center mb-4">
                    <span className="inline-block px-3 py-1 bg-[var(--status-bg)] text-[var(--status-text)] text-xs font-semibold rounded-full">
                      {item.status.toUpperCase()}
                    </span>
                    <h1 className="ml-3 text-2xl font-bold text-[var(--text-color)]">
                      {item.title}
                    </h1>
                  </div>

                  <p className="text-[var(--secondary)] mb-6">{item.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                        Item Details
                      </h2>
                      <div className="space-y-2">
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Category:</span>{" "}
                          {item.category?.name || "N/A"}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Location:</span>{" "}
                          {item.location}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Posted By:</span>{" "}
                          {item.postedBy?.name || "Unknown"}{" "}
                          {item.postedBy?.role === "admin" && "(Admin)"}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Posted On:</span>{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-color)] mb-3">
                        Status Information
                      </h2>
                      <div className="space-y-2">
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Status:</span>{" "}
                          {item.status}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Keeper:</span>{" "}
                          {item.keeperName || "Not Assigned"}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Claimed By:</span>{" "}
                          {item.claimedByName || "Not Claimed"}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          <span className="font-medium">Reference #:</span>{" "}
                          LF-{item.createdAt.split("-")[0]}-{id.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {isOwner ? (
                      <button
                        onClick={handleEdit}
                        className="flex-1 py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium"
                      >
                        Edit Item
                      </button>
                    ) : (
                      <>
                        {!isOwner && !isKeeper && (
                          <>
                            <button
                              onClick={handleClaim}
                              disabled={claimLoading || item.status === "Claimed"}
                              className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                                claimLoading || item.status === "Claimed"
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-[var(--primary)] hover:bg-blue-700"
                              }`}
                            >
                              {claimLoading
                                ? "Processing..."
                                : item.status === "Claimed"
                                ? "Already Claimed"
                                : "Claim This Item"}
                            </button>
                            <button
                              onClick={handleStartConversation}
                              disabled={conversationLoading}
                              className={`flex-1 py-2 px-4 rounded-md text-[var(--primary)] border border-[var(--primary)] font-medium transition-colors bg-white hover:bg-gray-50 ${
                                conversationLoading
                                  ? "opacity-50 cursor-not-allowed"
                                  : "opacity-100"
                              }`}
                            >
                              {conversationLoading ? "Processing..." : "Message Post Owner"}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {user && user.role === "keeper" && !item.keeperId && (
                    <button
                      onClick={handleAssignKeeper}
                      disabled={claimLoading}
                      className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                        claimLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                    >
                      {claimLoading
                        ? "Processing..."
                        : "Assign Myself as Keeper"}
                    </button>
                  )}

                  {isPosterOrKeeper && item.status === "Claimed" && (
                    <button
                      onClick={handleGenerateOTP}
                      disabled={claimLoading}
                      className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                        claimLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      {claimLoading ? "Processing..." : "Generate OTP"}
                    </button>
                  )}

                  {otpItemId === id && (
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="flex-1 p-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <button
                        onClick={handleVerifyOTP}
                        disabled={claimLoading}
                        className={`py-2 px-4 rounded-md text-white font-medium transition-colors ${
                          claimLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {claimLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} className="bg-[var(--card-bg)] rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-[var(--text-color)] mb-6">
                Edit Item: {item.title}
              </h1>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 p-6 bg-gray-100">
                  {item.image ? (
                    <div
                      className="w-full h-64 rounded-lg overflow-hidden cursor-pointer mb-4"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <p className="text-[var(--secondary)] text-sm">No image available</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleEditChange}
                      className="w-full p-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[var(--primary)] hover:file:bg-blue-100"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="removeImage"
                        checked={removeImage}
                        onChange={handleEditChange}
                        className="mr-2 h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border-color)] rounded"
                      />
                      <span className="text-sm text-[var(--text-color)]">Remove Image</span>
                    </label>
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-[var(--text-color)] mb-1"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={editFormData.title}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-[var(--text-color)] mb-1"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm h-24 resize-y"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium text-[var(--text-color)] mb-1"
                        >
                          Category
                        </label>
                        <input
                          type="text"
                          id="category"
                          name="category"
                          value={editFormData.category}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-[var(--text-color)] mb-1"
                        >
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={editFormData.status}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                          required
                        >
                          <option value="Lost">Lost</option>
                          <option value="Found">Found</option>
                          <option value="Claimed">Claimed</option>
                          <option value="Returned">Returned</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-[var(--text-color)] mb-1"
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={editFormData.location}
                          onChange={handleEditChange}
                          className="w-full p-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={claimLoading}
                      className={`py-2 px-4 rounded-md text-white font-medium transition-colors ${
                        claimLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[var(--primary)] hover:bg-blue-700"
                      }`}
                    >
                      {claimLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {isImageModalOpen && item.image && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setIsImageModalOpen(false)}
          >
            <div className="relative max-w-4xl w-full h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default ItemDetails;
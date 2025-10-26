import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/common/Loader";
import {
  FaSearch,
  FaImage,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaEdit,
  FaShare,
  FaComments,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaKey,
  FaTimes,
  FaArrowLeft,
  FaClock
} from "react-icons/fa";
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
          <div className="text-center space-y-4 p-8 rounded-xl shadow-xl" style={{ background: 'var(--color-secondary)' }}>
            <FaExclamationCircle className="text-6xl mx-auto text-red-500" />
            <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Something went wrong</p>
            <p style={{ color: 'var(--color-text)', opacity: 0.7 }}>{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
              style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              Reload Page
            </button>
          </div>
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
  });
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpItemId, setOtpItemId] = useState(null);

  const fetchItem = React.useCallback(async () => {
    console.log("Fetching item - id:", id, "user:", user);
    if (!id) {
      console.warn("No id provided for fetch");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log("Sending request to getItemDetails with id:", id);
      const response = await getItemDetails(id);
      console.log("Received response from getItemDetails:", response.data);
      setItem(response.data.item || {});
      setEditFormData({
        title: response.data.item?.title || "",
        description: response.data.item?.description || "",
        category: response.data.item?.category?.name || "",
        status: response.data.item?.status || "",
        location: response.data.item?.location || "",
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
  }, [id, user]);

  useEffect(() => {
    console.log("Initial useEffect running - id:", id, "user:", user);
    fetchItem();
  }, [id, user, fetchItem]);

  useEffect(() => {
    console.log(
      "Secondary useEffect running - id:",
      id,
      "loading:",
      loading,
      "item:",
      item
    );
    if (!loading && !item) {
      fetchItem();
    }
  }, [loading, item, fetchItem, id]);

  const handleManualFetch = () => {
    console.log("Manual fetch triggered with id:", id);
    fetchItem();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "title" || name === "description") {
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
      console.log(
        "Starting conversation with participants:",
        participants,
        "and itemId:",
        id
      );
      const response = await startConversation({ itemId: id, participants });
      console.log("Conversation API response:", response.data);
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
  const isPosterOrKeeper =
    user &&
    (String(user.id) === String(item?.postedBy?._id) ||
      String(user.id) === String(item?.keeperId));

  if (loading) {
    return (
      <div style={{ background: 'var(--color-bg)' }}>
        <Loader size="lg" text="Loading item details..." />
      </div>
    );
  }

  if (!item || Object.keys(item).length === 0) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center space-y-4">
          <FaExclamationCircle className="text-6xl mx-auto" style={{ color: 'var(--color-accent)' }} />
          <p className="text-xl font-medium" style={{ color: 'var(--color-text)' }}>
            Item not found or failed to load.
          </p>
          <button
            onClick={handleManualFetch}
            className="py-2 px-6 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg hover:scale-105"
            style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 mb-6 py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
          >
            <FaArrowLeft />
            <span className="font-medium">Back</span>
          </button>

          {!isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Image and Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and Image Section */}
                <div className="rounded-xl shadow-lg overflow-hidden" style={{ background: 'var(--color-secondary)' }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                          {item.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`status-badge ${item.status?.toLowerCase()} px-4 py-2 rounded-full text-sm font-semibold shadow-md`}>
                            {item.status}
                          </span>
                          <div className="flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
                            <FaTag className="text-sm" style={{ color: 'var(--color-accent)' }} />
                            <span className="text-sm font-medium">{item.category?.name || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    {item.image ? (
                      <div
                        className="relative w-full h-96 cursor-pointer group overflow-hidden"
                        onClick={() => setIsImageModalOpen(true)}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-6 left-6 right-6">
                            <p className="text-white text-lg font-semibold flex items-center space-x-2">
                              <FaSearch className="text-xl" />
                              <span>Click to view full size</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center group">
                        <div className="flex flex-col items-center space-y-4 p-8 rounded-xl bg-white/50 dark:bg-black/30 backdrop-blur-sm">
                          <div className="relative">
                            <FaImage className="text-gray-400 dark:text-gray-500 text-6xl group-hover:text-blue-400 transition-colors duration-300" />
                            <FaSearch className="text-gray-300 dark:text-gray-600 text-3xl absolute -bottom-2 -right-2 group-hover:text-blue-300 transition-colors duration-300" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                            No Image Available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Section */}
                <div className="rounded-xl shadow-lg p-6" style={{ background: 'var(--color-secondary)' }}>
                  <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
                    <FaExclamationCircle style={{ color: 'var(--color-accent)' }} />
                    <span>Description</span>
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: 'var(--color-text)', opacity: 0.9 }}>
                    {item.description}
                  </p>
                </div>

                {/* Additional Details */}
                <div className="rounded-xl shadow-lg p-6" style={{ background: 'var(--color-secondary)' }}>
                  <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
                    Item Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" style={{ background: 'var(--color-bg)' }}>
                      <FaMapMarkerAlt className="text-xl mt-1 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                      <div>
                        <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                          Location
                        </p>
                        <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                          {item.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" style={{ background: 'var(--color-bg)' }}>
                      <FaCalendarAlt className="text-xl mt-1 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                      <div>
                        <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                          Posted On
                        </p>
                        <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" style={{ background: 'var(--color-bg)' }}>
                      <FaUser className="text-xl mt-1 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                      <div>
                        <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                          Posted By
                        </p>
                        <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                          {item.postedBy?.name || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md" style={{ background: 'var(--color-bg)' }}>
                      <FaShieldAlt className="text-xl mt-1 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                      <div>
                        <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                          Keeper
                        </p>
                        <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                          {item.keeperName || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    {item.claimedByName && (
                      <div className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md md:col-span-2" style={{ background: 'var(--color-bg)' }}>
                        <FaCheckCircle className="text-xl mt-1 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                        <div>
                          <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                            Claimed By
                          </p>
                          <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                            {item.claimedByName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Actions Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  <div className="rounded-xl shadow-lg p-6" style={{ background: 'var(--color-secondary)' }}>
                    <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--color-text)' }}>
                      Quick Actions
                    </h2>
                    <div className="space-y-3">
                      {isOwner ? (
                        <button
                          onClick={handleEdit}
                          className="w-full py-3 px-4 rounded-lg transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                          style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                        >
                          <FaEdit />
                          <span>Edit Item</span>
                        </button>
                      ) : (
                        <>
                          {!isOwner && !isKeeper && (
                            <button
                              onClick={handleClaim}
                              disabled={claimLoading || item.status === "Claimed"}
                              className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${claimLoading || item.status === "Claimed"
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:scale-105"
                                }`}
                              style={{
                                background: claimLoading || item.status === "Claimed" ? '#6b7280' : 'var(--color-primary)',
                              }}
                            >
                              <FaCheckCircle />
                              <span>
                                {claimLoading
                                  ? "Processing..."
                                  : item.status === "Claimed"
                                    ? "Already Claimed"
                                    : "Claim This Item"}
                              </span>
                            </button>
                          )}
                          <button
                            onClick={handleStartConversation}
                            disabled={conversationLoading}
                            className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${conversationLoading
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-105"
                              }`}
                            style={{
                              background: conversationLoading ? 'var(--color-secondary)' : 'var(--color-primary)',
                              color: 'var(--color-bg)'
                            }}
                          >
                            <FaComments />
                            <span>{conversationLoading ? "Processing..." : "Contact Owner"}</span>
                          </button>
                        </>
                      )}

                      {user && user.role === "keeper" && !item.keeperId && (
                        <button
                          onClick={handleAssignKeeper}
                          disabled={claimLoading}
                          className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${claimLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:scale-105"
                            }`}
                          style={{
                            background: claimLoading ? 'var(--color-secondary)' : 'var(--color-accent)',
                            color: 'var(--color-bg)'
                          }}
                        >
                          <FaShieldAlt />
                          <span>{claimLoading ? "Processing..." : "Become Keeper"}</span>
                        </button>
                      )}

                      {isPosterOrKeeper && item.status === "Claimed" && (
                        <button
                          onClick={handleGenerateOTP}
                          disabled={claimLoading}
                          className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${claimLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:scale-105"
                            }`}
                          style={{
                            background: claimLoading ? 'var(--color-secondary)' : 'var(--color-accent)',
                            color: 'var(--color-bg)'
                          }}
                        >
                          <FaKey />
                          <span>{claimLoading ? "Processing..." : "Generate OTP"}</span>
                        </button>
                      )}

                      {otpItemId === id && isPosterOrKeeper && (
                        <div className="space-y-2 p-4 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                            Verify OTP
                          </label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-center tracking-widest"
                            style={{
                              border: '2px solid var(--color-accent)',
                              background: 'var(--color-secondary)',
                              color: 'var(--color-text)'
                            }}
                            maxLength={6}
                          />
                          <button
                            onClick={handleVerifyOTP}
                            disabled={claimLoading}
                            className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${claimLoading
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-105"
                              }`}
                            style={{
                              background: claimLoading ? 'var(--color-secondary)' : 'var(--color-accent)',
                              color: 'var(--color-bg)'
                            }}
                          >
                            <FaCheckCircle />
                            <span>{claimLoading ? "Verifying..." : "Mark Returned"}</span>
                          </button>
                        </div>
                      )}

                      <button
                        onClick={handleShare}
                        className="w-full py-3 px-4 rounded-lg transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                        style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                      >
                        <FaShare />
                        <span>Share Link</span>
                      </button>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="rounded-xl shadow-lg p-5" style={{ background: 'var(--color-secondary)' }}>
                    <div className="flex items-start space-x-3">
                      <FaClock className="text-xl mt-1" style={{ color: 'var(--color-accent)' }} />
                      <div>
                        <h3 className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>Need Help?</h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                          Contact the owner if you have questions about this item or need more information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Form (keeping original for now)
            <form
              onSubmit={handleEditSubmit}
              className="max-w-4xl mx-auto rounded-xl shadow-xl p-8"
              encType="multipart/form-data"
              style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Edit Item</h2>
              <div
                className="mb-6 rounded-xl border px-4 py-3 flex items-start gap-3"
                style={{
                  borderColor: 'var(--color-accent)',
                  background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary) 65%, var(--color-primary) 120%)',
                  color: 'var(--color-text)'
                }}
              >
                <span className="mt-1 text-lg font-semibold" aria-hidden="true" style={{ color: 'var(--color-accent)' }}>ℹ️</span>
                <p className="text-sm leading-relaxed">
                  Only the <span className="font-semibold">title</span> and <span className="font-semibold">description</span> can be updated from this page. All other details are shown for your reference and will stay the same after saving.
                </p>
              </div>

              <div className="mb-6">
                {item.image && (
                  <div
                    className="relative w-full h-64 rounded-xl overflow-hidden shadow-md mb-3 cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                        Current Image
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                  Only the title and description can be updated from this page. Other details remain unchanged.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="title"
                    className="flex items-center gap-2 text-sm font-semibold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Title *
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>Editable</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                    style={{
                      border: '2px solid var(--color-accent)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)'
                    }}
                    required
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Category</p>
                  <p className="text-sm px-3 py-2 rounded-lg border" style={{ border: '2px solid var(--color-accent)', color: 'var(--color-text)', background: 'var(--color-bg)' }}>
                    {item?.category?.name || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Status</p>
                  <p className="text-sm px-3 py-2 rounded-lg border capitalize" style={{ border: '2px solid var(--color-accent)', color: 'var(--color-text)', background: 'var(--color-bg)' }}>
                    {item?.status || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Location</p>
                  <p className="text-sm px-3 py-2 rounded-lg border" style={{ border: '2px solid var(--color-accent)', color: 'var(--color-text)', background: 'var(--color-bg)' }}>
                    {item?.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  Description *
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>Editable</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 text-sm h-32 resize-y"
                  style={{
                    border: '2px solid var(--color-accent)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-3 px-6 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                  style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '2px solid var(--color-accent)' }}
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={claimLoading}
                  className={`py-3 px-6 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center space-x-2 ${claimLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                    }`}
                  style={{
                    background: claimLoading ? 'var(--color-secondary)' : 'var(--color-primary)',
                    color: 'var(--color-bg)'
                  }}
                >
                  <FaCheckCircle />
                  <span>{claimLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Image Modal */}
        {isImageModalOpen && item.image && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <div className="relative max-w-7xl w-full h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute -top-12 right-0 text-white bg-red-500 rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg z-10"
              >
                <FaTimes className="text-xl" />
              </button>
              <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  style={{ background: 'var(--color-bg)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default ItemDetails;

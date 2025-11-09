import { useState } from "react";
import { FaUser, FaBox, FaExclamationTriangle, FaClock, FaCheckCircle, FaCog, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getScheduledItemsReport,
  getScheduledUsersReport,
  getDeletionSuccessReport,
  getCleanupConfig,
  updateCleanupConfig
} from "../../services/adminService";
import Loader from "../common/Loader";

function DeletionReportsTab() {
  const [activeView, setActiveView] = useState("scheduled-items");
  const [loading, setLoading] = useState(false);
  const [scheduledItems, setScheduledItems] = useState([]);
  const [scheduledUsers, setScheduledUsers] = useState([]);
  const [deletionStats, setDeletionStats] = useState(null);
  const [cleanupConfig, setCleanupConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    userDeletionStrategy: 'deactivation',
    inactivityDays: 60,
    gracePeriodDays: 7
  });

  const fetchCleanupConfig = async () => {
    try {
      const response = await getCleanupConfig();
      setCleanupConfig(response.data);
      setConfigForm({
        userDeletionStrategy: response.data.userDeletionStrategy,
        inactivityDays: response.data.inactivityDays,
        gracePeriodDays: response.data.gracePeriodDays
      });
    } catch (error) {
      console.error("Failed to fetch cleanup config:", error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeView === "scheduled-items") {
        const response = await getScheduledItemsReport();
        setScheduledItems(response.data.items || []);
      } else if (activeView === "scheduled-users") {
        const response = await getScheduledUsersReport();
        setScheduledUsers(response.data.users || []);
      } else if (activeView === "deletion-stats") {
        const response = await getDeletionSuccessReport({ days: 30, type: 'all' });
        setDeletionStats(response.data.report);
      }
    } catch (error) {
      toast.error("Failed to fetch report: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      setLoading(true);
      const response = await updateCleanupConfig(configForm);
      toast.info(response.data.message);
      toast.warning("Please update .env file and restart server for changes to take effect", { autoClose: 8000 });
      setShowConfigModal(false);
      await fetchCleanupConfig();
    } catch (error) {
      toast.error("Failed to update config: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysColor = (days) => {
    if (days <= 1) return "text-red-600 dark:text-red-400";
    if (days <= 3) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  return (
    <div className="space-y-6">
      {/* Header with Config Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          🗑️ Automatic Deletion Reports
        </h2>
        <button
          onClick={() => setShowConfigModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <FaCog />
          <span>Configuration</span>
        </button>
      </div>

      {/* Current Config Info */}
      {cleanupConfig && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaCog className="text-blue-600 dark:text-blue-400 text-xl mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Current Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Strategy:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">
                    {cleanupConfig.userDeletionStrategy === 'deactivation' ? '🔒 Deactivation-based' : '⏰ Inactivity-based'}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Inactivity Period:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">{cleanupConfig.inactivityDays} days</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Grace Period:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">{cleanupConfig.gracePeriodDays} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveView("scheduled-items")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeView === "scheduled-items"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
        >
          <FaBox />
          <span>Scheduled Items</span>
        </button>
        <button
          onClick={() => setActiveView("scheduled-users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeView === "scheduled-users"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
        >
          <FaUser />
          <span>Scheduled Users</span>
        </button>
        <button
          onClick={() => setActiveView("deletion-stats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeView === "deletion-stats"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
        >
          <FaCheckCircle />
          <span>Deletion Statistics</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <Loader size="lg" variant="pulse" text="Loading report data..." />
      ) : (
        <>
          {/* Scheduled Items View */}
          {activeView === "scheduled-items" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Items Scheduled for Deletion ({scheduledItems.length})
                </h3>
                <button
                  onClick={fetchReportData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  🔄 Refresh
                </button>
              </div>

              {scheduledItems.length === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-5xl mx-auto mb-4" />
                  <p className="text-green-800 dark:text-green-200 text-lg font-semibold">
                    No items scheduled for deletion
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                    All items are active or have been processed
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {scheduledItems.map((item) => (
                    <div
                      key={item.itemId}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.description?.substring(0, 100)}...
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getDaysColor(
                            item.daysUntilDeletion
                          )}`}
                        >
                          {item.daysUntilDeletion} day{item.daysUntilDeletion !== 1 ? 's' : ''} left
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Status:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {item.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Location:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {item.location}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {item.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Images:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {item.images}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            <span>Posted by: </span>
                            <span className="font-medium">{item.postedBy?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <FaClock className="inline mr-1" />
                              Deletion: {formatDate(item.estimatedDeletionDate)}
                            </div>
                            <div>
                              {item.warningEmailSent ? (
                                <span className="text-green-600 dark:text-green-400">✓ Email Sent</span>
                              ) : (
                                <span className="text-yellow-600 dark:text-yellow-400">⏳ Email Pending</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scheduled Users View */}
          {activeView === "scheduled-users" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Users Scheduled for Deletion ({scheduledUsers.length})
                </h3>
                <button
                  onClick={fetchReportData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  🔄 Refresh
                </button>
              </div>

              {scheduledUsers.length === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-5xl mx-auto mb-4" />
                  <p className="text-green-800 dark:text-green-200 text-lg font-semibold">
                    No users scheduled for deletion
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                    All users are active or have been processed
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {scheduledUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {user.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getDaysColor(
                              user.daysUntilDeletion
                            )}`}
                          >
                            {user.daysUntilDeletion} day{user.daysUntilDeletion !== 1 ? 's' : ''} left
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            {user.strategy === 'deactivation' ? '🔒 Deactivation' : '⏰ Inactivity'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Role:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {user.role}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Status:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {user.isActive ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Items:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {user.itemsCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never'}
                          </span>
                        </div>
                      </div>

                      {user.deactivatedAt && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Deactivated:</span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                            {formatDate(user.deactivatedAt)}
                          </span>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                          <div>
                            <FaClock className="inline mr-1" />
                            Deletion: {formatDate(user.estimatedDeletionDate)}
                          </div>
                          <div>
                            {user.warningEmailSent ? (
                              <span className="text-green-600 dark:text-green-400">✓ Email Sent</span>
                            ) : (
                              <span className="text-yellow-600 dark:text-yellow-400">⏳ Email Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Deletion Statistics View */}
          {activeView === "deletion-stats" && deletionStats && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Deletion Statistics (Last 30 Days)
                </h3>
                <button
                  onClick={fetchReportData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  🔄 Refresh
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Inactive Items</p>
                      <p className="text-3xl font-bold mt-2">{deletionStats.summary.totalInactiveItems}</p>
                    </div>
                    <FaBox className="text-5xl text-red-200 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Inactive Users</p>
                      <p className="text-3xl font-bold mt-2">{deletionStats.summary.totalInactiveUsers}</p>
                    </div>
                    <FaUser className="text-5xl text-purple-200 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Item Status Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Item Status Breakdown
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(deletionStats.itemStats).map(([status, count]) => (
                    <div key={status} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{status}</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Role Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  User Role Breakdown
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(deletionStats.userStats).map(([role, count]) => (
                    <div key={role} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">{role}</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Period Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Report Period:</strong> {formatDate(deletionStats.period.startDate)} to{' '}
                  {formatDate(deletionStats.period.endDate)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {deletionStats.note}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Cleanup Configuration
                </h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* User Deletion Strategy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Deletion Strategy
                  </label>
                  <select
                    value={configForm.userDeletionStrategy}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, userDeletionStrategy: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    <option value="deactivation">Deactivation-based (Delete after account deactivation)</option>
                    <option value="inactivity">Inactivity-based (Delete after no login)</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {configForm.userDeletionStrategy === 'deactivation'
                      ? '🔒 Users are deleted X days after their account is deactivated (isActive = false)'
                      : '⏰ Users are deleted X days after their last login'}
                  </p>
                </div>

                {/* Inactivity Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Inactivity/Deactivation Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={configForm.inactivityDays}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, inactivityDays: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Number of days before marking for deletion (1-365)
                  </p>
                </div>

                {/* Grace Period Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={configForm.gracePeriodDays}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, gracePeriodDays: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Days before permanent deletion after being marked (1-30)
                  </p>
                </div>

                {/* Warning Note */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-xl mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                        Important: Manual .env Update Required
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        After submitting, you must manually update your .env file with the new values and restart the server for changes to take effect.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateConfig}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
                  >
                    <FaSave />
                    <span>{loading ? 'Updating...' : 'Update Config'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeletionReportsTab;

import { useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";

function DownloadModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Download Data",
  loading = false,
  downloadFormat = "json"
}) {
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ dateFilter, customStartDate, customEndDate });
  };

  const handleClose = () => {
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl shadow-2xl max-w-md w-full animate-fade-in" style={{ background: 'var(--color-secondary)' }}>
        {/* Modal Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-bg)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FaFilter className="text-blue-500" />
              {title} ({downloadFormat.toUpperCase()})
            </h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Select Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              style={{
                border: '1px solid var(--color-bg)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  style={{
                    border: '1px solid var(--color-bg)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  style={{
                    border: '1px solid var(--color-bg)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg" style={{ background: 'var(--color-bg)' }}>
            <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              <strong>Note:</strong> This will download ALL records matching your filters, not just the current page.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t flex gap-3" style={{ borderColor: 'var(--color-bg)' }}>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {loading ? 'Loading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadModal;

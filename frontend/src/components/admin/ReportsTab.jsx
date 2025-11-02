import { useState, useEffect } from "react";
import { FaChartBar, FaDownload, FaCalendarAlt, FaFileExport, FaCheckSquare, FaSquare, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import { generateReport, downloadReport, downloadReportCSV } from "../../services/reportService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function ReportsTab() {
  const [reportType, setReportType] = useState("monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDataSelector, setShowDataSelector] = useState(false);

  // Data selection state
  const [selectedData, setSelectedData] = useState({
    summary: true,
    items: true,
    users: true,
    conversations: true,
    categories: true,
    statusBreakdown: true,
    trends: true,
  });

  // Auto-generate monthly report on mount
  useEffect(() => {
    const fetchInitialReport = async () => {
      setLoading(true);
      try {
        const response = await generateReport("monthly", null, null);
        setReportData(response.data.report);
      } catch (err) {
        toast.error("Failed to generate report: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchInitialReport();
  }, []);

  const handleGenerateReport = async (type = reportType) => {
    setLoading(true);
    try {
      const response = await generateReport(
        type,
        type === "custom" ? customStartDate : null,
        type === "custom" ? customEndDate : null
      );
      setReportData(response.data.report);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`);
    } catch (err) {
      toast.error("Failed to generate report: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter report data based on selected options
  const getFilteredReportData = () => {
    if (!reportData) return null;

    const filtered = {
      reportType: reportData.reportType,
      startDate: reportData.startDate,
      endDate: reportData.endDate,
      generatedAt: reportData.generatedAt,
    };

    if (selectedData.summary) {
      filtered.summary = reportData.summary;
    }

    if (selectedData.items || selectedData.statusBreakdown || selectedData.categories) {
      filtered.breakdown = {};
      if (selectedData.categories && reportData.breakdown?.itemsByCategory) {
        filtered.breakdown.itemsByCategory = reportData.breakdown.itemsByCategory;
      }
      if (selectedData.statusBreakdown && reportData.breakdown?.itemsByStatus) {
        filtered.breakdown.itemsByStatus = reportData.breakdown.itemsByStatus;
      }
      if (selectedData.users && reportData.breakdown?.usersByRole) {
        filtered.breakdown.usersByRole = reportData.breakdown.usersByRole;
      }
    }

    if (selectedData.trends && reportData.trends) {
      filtered.trends = reportData.trends;
    }

    return filtered;
  };

  const handleDownloadJSON = () => {
    if (reportData) {
      const filteredData = getFilteredReportData();
      downloadReport(filteredData, reportType);
      toast.success("Customized report downloaded as JSON");
    }
  };

  const handleDownloadCSV = () => {
    if (reportData) {
      const filteredData = getFilteredReportData();
      downloadReportCSV(filteredData, reportType);
      toast.success("Customized report downloaded as CSV");
    }
  };

  const handleToggleDataOption = (option) => {
    setSelectedData(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedData).every(val => val);
    const newValue = !allSelected;
    setSelectedData({
      summary: newValue,
      items: newValue,
      users: newValue,
      conversations: newValue,
      categories: newValue,
      statusBreakdown: newValue,
      trends: newValue,
    });
  };

  // Prepare chart data
  const getCategoryChartData = () => {
    if (!reportData?.breakdown?.itemsByCategory) return null;

    return {
      labels: reportData.breakdown.itemsByCategory.map(item => item._id),
      datasets: [
        {
          label: 'Items by Category',
          data: reportData.breakdown.itemsByCategory.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getStatusChartData = () => {
    if (!reportData?.breakdown?.itemsByStatus) return null;

    return {
      labels: reportData.breakdown.itemsByStatus.map(item => item._id),
      datasets: [
        {
          label: 'Items by Status',
          data: reportData.breakdown.itemsByStatus.map(item => item.count),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getTrendChartData = () => {
    if (!reportData?.trends?.dailyItemStats) return null;

    const dates = [...new Set(reportData.trends.dailyItemStats.map(item => item._id.date))];
    const foundData = dates.map(date => {
      const item = reportData.trends.dailyItemStats.find(
        stat => stat._id.date === date && stat._id.itemType === 'found'
      );
      return item ? item.count : 0;
    });
    const lostData = dates.map(date => {
      const item = reportData.trends.dailyItemStats.find(
        stat => stat._id.date === date && stat._id.itemType === 'lost'
      );
      return item ? item.count : 0;
    });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Found Items',
          data: foundData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Lost Items',
          data: lostData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
        },
      ],
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <FaChartBar className="text-xl sm:text-2xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Reports & Analytics
            </h2>
            <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              Generate and download comprehensive reports
            </p>
          </div>
        </div>
      </div>

      {/* Report Controls */}
      <div className="p-4 sm:p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <FaCalendarAlt className="text-blue-500" />
          <span className="hidden sm:inline">Report Configuration</span>
          <span className="sm:hidden">Configuration</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
          {/* Report Type Selection */}
          <button
            onClick={() => { setReportType("daily"); handleGenerateReport("daily"); }}
            className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${reportType === "daily" ? "ring-2 ring-blue-500" : ""
              }`}
            style={{
              background: reportType === "daily"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "var(--color-bg)",
              color: reportType === "daily" ? "white" : "var(--color-text)"
            }}
          >
            Daily
          </button>

          <button
            onClick={() => { setReportType("weekly"); handleGenerateReport("weekly"); }}
            className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${reportType === "weekly" ? "ring-2 ring-blue-500" : ""
              }`}
            style={{
              background: reportType === "weekly"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "var(--color-bg)",
              color: reportType === "weekly" ? "white" : "var(--color-text)"
            }}
          >
            Weekly
          </button>

          <button
            onClick={() => { setReportType("monthly"); handleGenerateReport("monthly"); }}
            className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${reportType === "monthly" ? "ring-2 ring-blue-500" : ""
              }`}
            style={{
              background: reportType === "monthly"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "var(--color-bg)",
              color: reportType === "monthly" ? "white" : "var(--color-text)"
            }}
          >
            Monthly
          </button>

          <button
            onClick={() => { setReportType("yearly"); handleGenerateReport("yearly"); }}
            className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${reportType === "yearly" ? "ring-2 ring-blue-500" : ""
              }`}
            style={{
              background: reportType === "yearly"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "var(--color-bg)",
              color: reportType === "yearly" ? "white" : "var(--color-text)"
            }}
          >
            Yearly
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="mb-3 sm:mb-4">
          <button
            onClick={() => setReportType("custom")}
            className={`w-full p-3 sm:p-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${reportType === "custom" ? "ring-2 ring-blue-500" : ""
              }`}
            style={{
              background: reportType === "custom"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "var(--color-bg)",
              color: reportType === "custom" ? "white" : "var(--color-text)"
            }}
          >
            Custom Date Range
          </button>

          {reportType === "custom" && (
            <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full border rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full border rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                  style={{
                    border: '1px solid var(--color-secondary)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              <button
                onClick={() => handleGenerateReport("custom")}
                disabled={!customStartDate || !customEndDate || loading}
                className="md:col-span-2 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                Generate Custom Report
              </button>
            </div>
          )}
        </div>

        {/* Data Selection Section */}
        {reportData && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl shadow-md" style={{ background: 'var(--color-bg)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <FaCheckSquare className="text-blue-500" />
                <span className="hidden sm:inline">Customize Report Data</span>
                <span className="sm:hidden">Customize Data</span>
              </h4>
              <button
                onClick={handleSelectAll}
                className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg transition-all duration-200 hover:shadow-md"
                style={{
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text)',
                }}
              >
                {Object.values(selectedData).every(val => val) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                <div className="text-base sm:text-xl transition-transform group-hover:scale-110 flex-shrink-0">
                  {selectedData.summary ?
                    <FaCheckSquare className="text-blue-500" /> :
                    <FaSquare className="opacity-30" style={{ color: 'var(--color-text)' }} />
                  }
                </div>
                <input
                  type="checkbox"
                  checked={selectedData.summary}
                  onChange={() => handleToggleDataOption('summary')}
                  className="sr-only"
                />
                <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Summary Stats
                </span>
              </label>

              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                <div className="text-base sm:text-xl transition-transform group-hover:scale-110 flex-shrink-0">
                  {selectedData.items ?
                    <FaCheckSquare className="text-blue-500" /> :
                    <FaSquare className="opacity-30" style={{ color: 'var(--color-text)' }} />
                  }
                </div>
                <input
                  type="checkbox"
                  checked={selectedData.items}
                  onChange={() => handleToggleDataOption('items')}
                  className="sr-only"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Items Data
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="text-xl transition-transform group-hover:scale-110">
                  {selectedData.users ?
                    <FaCheckSquare className="text-blue-500" /> :
                    <FaSquare className="opacity-30" style={{ color: 'var(--color-text)' }} />
                  }
                </div>
                <input
                  type="checkbox"
                  checked={selectedData.users}
                  onChange={() => handleToggleDataOption('users')}
                  className="sr-only"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Users Data
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="text-xl transition-transform group-hover:scale-110">
                  {selectedData.conversations ?
                    <FaCheckSquare className="text-blue-500" /> :
                    <FaSquare className="opacity-30" style={{ color: 'var(--color-text)' }} />
                  }
                </div>
                <input
                  type="checkbox"
                  checked={selectedData.conversations}
                  onChange={() => handleToggleDataOption('conversations')}
                  className="sr-only"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Conversations
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="text-xl transition-transform group-hover:scale-110">
                  {selectedData.categories ?
                    <FaCheckSquare className="text-blue-500" /> :
                    <FaSquare className="opacity-30" style={{ color: 'var(--color-text)' }} />
                  }
                </div>
                <input
                  type="checkbox"
                  checked={selectedData.categories}
                  onChange={() => handleToggleDataOption('categories')}
                  className="sr-only"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Categories
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="text-xl transition-transform group-hover:scale-110">
                  {selectedData.statusBreakdown ?
                    <FaCheckSquare className="text-blue-500" /> :
                    <FaSquare className="opacity-30" style={{ color: 'var(--color-text)' }} />
                  }
                </div>
                <input
                  type="checkbox"
                  checked={selectedData.statusBreakdown}
                  onChange={() => handleToggleDataOption('statusBreakdown')}
                  className="sr-only"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Status Breakdown
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="text-xl transition-transform group-hover:scale-110">
                  {selectedData.trends ?
                    <FaCheckSquare className="text-blue-500" /> :
                    <FaSquare className="opacity-30" style={{ color: 'var(--color-text)' }} />
                  }
                </div>
                <input
                  type="checkbox"
                  checked={selectedData.trends}
                  onChange={() => handleToggleDataOption('trends')}
                  className="sr-only"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Trends & Stats
                </span>
              </label>
            </div>

            <p className="text-xs opacity-70 mt-3" style={{ color: 'var(--color-text)' }}>
              Select the data you want to include in your downloaded report
            </p>
          </div>
        )}

        {/* Download Buttons */}
        {reportData && (
          <div className="flex gap-4">
            <button
              onClick={handleDownloadJSON}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-white"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <FaDownload />
              Download JSON
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <FaFileExport />
              Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 rounded-2xl shadow-lg text-center" style={{ background: 'var(--color-secondary)' }}>
          <div className="animate-spin w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
            Generating report...
          </p>
        </div>
      )}

      {/* Report Summary */}
      {reportData && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
              <h4 className="text-sm font-medium opacity-70 mb-2" style={{ color: 'var(--color-text)' }}>
                New Items
              </h4>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                {reportData.summary.newItems}
              </p>
              <p className="text-xs opacity-60 mt-2" style={{ color: 'var(--color-text)' }}>
                Found: {reportData.summary.foundItems} | Lost: {reportData.summary.lostItems}
              </p>
            </div>

            <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
              <h4 className="text-sm font-medium opacity-70 mb-2" style={{ color: 'var(--color-text)' }}>
                Claimed Items
              </h4>
              <p className="text-3xl font-bold text-green-500">
                {reportData.summary.claimedItems}
              </p>
              <p className="text-xs opacity-60 mt-2" style={{ color: 'var(--color-text)' }}>
                Successfully reunited
              </p>
            </div>

            <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
              <h4 className="text-sm font-medium opacity-70 mb-2" style={{ color: 'var(--color-text)' }}>
                New Users
              </h4>
              <p className="text-3xl font-bold text-blue-500">
                {reportData.summary.newUsers}
              </p>
              <p className="text-xs opacity-60 mt-2" style={{ color: 'var(--color-text)' }}>
                Total: {reportData.summary.totalUsers}
              </p>
            </div>

            <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
              <h4 className="text-sm font-medium opacity-70 mb-2" style={{ color: 'var(--color-text)' }}>
                Conversations
              </h4>
              <p className="text-3xl font-bold text-purple-500">
                {reportData.summary.newConversations}
              </p>
              <p className="text-xs opacity-60 mt-2" style={{ color: 'var(--color-text)' }}>
                Total: {reportData.summary.totalConversations}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items by Category Chart */}
            {getCategoryChartData() && (
              <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                  Items by Category
                </h3>
                <Bar
                  data={getCategoryChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            )}

            {/* Items by Status Chart */}
            {getStatusChartData() && (
              <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                  Items by Status
                </h3>
                <Doughnut
                  data={getStatusChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Trend Chart */}
          {getTrendChartData() && (
            <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Daily Trends
              </h3>
              <Line
                data={getTrendChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          )}

          {/* Detailed Report Preview */}
          <div className="p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FaFilePdf className="text-red-500" />
              Detailed Report Preview
            </h3>

            <div className="space-y-4">
              {/* Report Header */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Report Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="opacity-70" style={{ color: 'var(--color-text)' }}>Type:</p>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-70" style={{ color: 'var(--color-text)' }}>Period:</p>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-70" style={{ color: 'var(--color-text)' }}>Generated:</p>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {new Date(reportData.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-70" style={{ color: 'var(--color-text)' }}>Selected Sections:</p>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {Object.values(selectedData).filter(v => v).length} / 7
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Data Preview */}
              {selectedData.summary && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <h5 className="font-semibold mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <FaCheckSquare className="text-green-500" />
                    Summary Statistics
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded" style={{ background: 'var(--color-secondary)' }}>
                      <p className="opacity-70" style={{ color: 'var(--color-text)' }}>Total Items</p>
                      <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{reportData.summary.totalItems}</p>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'var(--color-secondary)' }}>
                      <p className="opacity-70" style={{ color: 'var(--color-text)' }}>New Items</p>
                      <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{reportData.summary.newItems}</p>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'var(--color-secondary)' }}>
                      <p className="opacity-70" style={{ color: 'var(--color-text)' }}>Total Users</p>
                      <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{reportData.summary.totalUsers}</p>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'var(--color-secondary)' }}>
                      <p className="opacity-70" style={{ color: 'var(--color-text)' }}>Claimed Items</p>
                      <p className="font-bold text-lg text-green-500">{reportData.summary.claimedItems}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedData.categories && reportData.breakdown?.itemsByCategory && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <h5 className="font-semibold mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <FaCheckSquare className="text-green-500" />
                    Categories Breakdown ({reportData.breakdown.itemsByCategory.length} categories)
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {reportData.breakdown.itemsByCategory.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'var(--color-secondary)',
                          color: 'var(--color-text)'
                        }}
                      >
                        {cat._id}: {cat.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedData.statusBreakdown && reportData.breakdown?.itemsByStatus && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <h5 className="font-semibold mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <FaCheckSquare className="text-green-500" />
                    Status Breakdown
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {reportData.breakdown.itemsByStatus.map((status, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${status._id === 'found' ? 'bg-green-100 text-green-700' :
                          status._id === 'lost' ? 'bg-red-100 text-red-700' :
                            status._id === 'claimed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {status._id}: {status.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedData.users && reportData.breakdown?.usersByRole && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <h5 className="font-semibold mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <FaCheckSquare className="text-green-500" />
                    Users by Role
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {reportData.breakdown.usersByRole.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'var(--color-secondary)',
                          color: 'var(--color-text)'
                        }}
                      >
                        {role._id}: {role.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedData.trends && reportData.trends?.dailyItemStats && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <h5 className="font-semibold mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <FaCheckSquare className="text-green-500" />
                    Daily Trends Data ({reportData.trends.dailyItemStats.length} data points)
                  </h5>
                  <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                    Includes daily statistics for found and lost items over the selected period
                  </p>
                </div>
              )}

              {selectedData.conversations && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <h5 className="font-semibold mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <FaCheckSquare className="text-green-500" />
                    Conversations Data
                  </h5>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    Total Conversations: <span className="font-bold">{reportData.summary.totalConversations}</span>
                  </p>
                </div>
              )}

              {/* Show message if no data selected */}
              {!Object.values(selectedData).some(v => v) && (
                <div className="p-6 text-center rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                    No data sections selected. Please select at least one section to include in your report.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsTab;

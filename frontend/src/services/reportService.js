import api from './api';

export const generateReport = async (reportType, startDate = null, endDate = null) => {
  const params = { reportType };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return await api.get('/reports/generate', { params });
};

export const getReportSummary = async () => {
  return await api.get('/reports/summary');
};

export const downloadReport = (reportData, reportType) => {
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadReportCSV = (reportData, reportType) => {
  let csvContent = "";

  // Add Summary if exists
  if (reportData.summary) {
    const { summary } = reportData;
    csvContent += "Report Summary\n\n";
    csvContent += "Metric,Value\n";

    Object.entries(summary).forEach(([key, value]) => {
      csvContent += `${key.replace(/([A-Z])/g, ' $1').trim()},${value}\n`;
    });
  }

  // Add Items by Category if exists
  if (reportData.breakdown?.itemsByCategory && reportData.breakdown.itemsByCategory.length > 0) {
    csvContent += "\n\nItems by Category\n";
    csvContent += "Category,Count\n";
    reportData.breakdown.itemsByCategory.forEach(item => {
      csvContent += `${item._id || 'Unknown'},${item.count}\n`;
    });
  }

  // Add Items by Status if exists
  if (reportData.breakdown?.itemsByStatus && reportData.breakdown.itemsByStatus.length > 0) {
    csvContent += "\n\nItems by Status\n";
    csvContent += "Status,Count\n";
    reportData.breakdown.itemsByStatus.forEach(item => {
      csvContent += `${item._id || 'Unknown'},${item.count}\n`;
    });
  }

  // Add Users by Role if exists
  if (reportData.breakdown?.usersByRole && reportData.breakdown.usersByRole.length > 0) {
    csvContent += "\n\nUsers by Role\n";
    csvContent += "Role,Count\n";
    reportData.breakdown.usersByRole.forEach(item => {
      csvContent += `${item._id || 'Unknown'},${item.count}\n`;
    });
  }

  // Add Trends if exists
  if (reportData.trends && reportData.trends.length > 0) {
    csvContent += "\n\nTrends\n";
    csvContent += "Date,Items,Users,Conversations\n";
    reportData.trends.forEach(trend => {
      csvContent += `${trend.date},${trend.items || 0},${trend.users || 0},${trend.conversations || 0}\n`;
    });
  }

  // If no content was generated, show a warning
  if (!csvContent) {
    csvContent = "No data selected for export\n";
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

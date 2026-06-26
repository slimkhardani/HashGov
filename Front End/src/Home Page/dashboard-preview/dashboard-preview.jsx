import "./dashboard-preview.css";

export function DashboardPreview({ isLarge = false }) {
  return isLarge ? (
    <div className="dashboard-preview large">
      <div className="dashboard-header">
        <div className="dashboard-title">User Dashboard</div>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="sidebar-item active">Dashboard</div>
          <div className="sidebar-item">Identity</div>
          <div className="sidebar-item">Wallet</div>
          <div className="sidebar-item">Certificates</div>
          <div className="sidebar-item">Settings</div>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-chart"></div>
          <div className="dashboard-table">
            <div className="table-row header">
              <div className="table-cell">Date</div>
              <div className="table-cell">Type</div>
              <div className="table-cell">Status</div>
            </div>
            <div className="table-row">
              <div className="table-cell">Mar 15, 2025</div>
              <div className="table-cell">Identity Update</div>
              <div className="table-cell">Completed</div>
            </div>
            <div className="table-row">
              <div className="table-cell">Mar 14, 2025</div>
              <div className="table-cell">Certificate Issue</div>
              <div className="table-cell">Pending</div>
            </div>
            <div className="table-row">
              <div className="table-cell">Mar 12, 2025</div>
              <div className="table-cell">Transaction</div>
              <div className="table-cell">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="dashboard-preview">
      <div className="dashboard-header">
        <div className="dashboard-title">HashGov Dashboard</div>
        <div className="dashboard-date">March 17, 2025</div>
      </div>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title">Identity NFTs</div>
          <div className="stat-value">14k</div>
          <div className="stat-change positive">+25%</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Transactions</div>
          <div className="stat-value">325</div>
          <div className="stat-change negative">-5%</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Certificates</div>
          <div className="stat-value">200k</div>
          <div className="stat-change positive">+15%</div>
        </div>
      </div>
    </div>
  );
}

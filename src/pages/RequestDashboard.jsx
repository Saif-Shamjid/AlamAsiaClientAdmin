import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const RequestDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Request states
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const pageSize = 10;

  // Socket connection
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io('http://localhost:3000', {
        auth: { token }
      });
      setSocket(newSocket);

      // Fetch initial data
      fetchPendingRequests();
      fetchRequestHistory();
      fetchRequestTypes();

      // Clean up on unmount
      return () => newSocket.close();
    }
  }, [user, token]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time updates
      socket.on('request_update', (updatedRequest) => {
        if (updatedRequest.status === 'PENDING') {
          setPendingRequests(prev => {
            const exists = prev.some(req => req._id === updatedRequest._id);
            return exists ? prev.map(req => 
              req._id === updatedRequest._id ? updatedRequest : req
            ) : [updatedRequest, ...prev];
          });
        } else {
          setPendingRequests(prev => prev.filter(req => req._id !== updatedRequest._id));
          setRequestHistory(prev => [updatedRequest, ...prev]);
        }
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });
    }
  }, [socket]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/request/pending');
      setPendingRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/request/history?page=${page}&limit=${pageSize}`);
      setRequestHistory(response.data.requests);
      setTotalRequests(response.data.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch request history');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestTypes = async () => {
    try {
      const response = await api.get('/request/settings');
      setRequestTypes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch request types');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setError('');
      await api.put(`/request/${requestId}/approve`);
      setSuccess('Request approved successfully');
      setTimeout(() => setSuccess(''), 3000);

      // Fetch updated everything 
      
      // Fetch initial data
      fetchPendingRequests();
      fetchRequestHistory();
      fetchRequestTypes();

    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setError('');
      await api.put(`/request/${requestId}/reject`);
      setSuccess('Request rejected successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleUpdateRequestType = async (requestType, isAutoApproved) => {
    try {
      setError('');
      await api.put(`/request/settings/${requestType}`, { isAutoApproved });
      setSuccess('Request type updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchRequestTypes();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const renderRequestPayload = (request) => {
    if (request.status === 'REJECTED') {
      return 'Payload hidden (request rejected)';
    }
    
    if (request.status === 'APPROVED' && request.approvedDocumentId) {
      return 'Payload processed and saved';
    }
    
    return JSON.stringify(request.payload, null, 2);
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tabs">
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Request History
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Request Type Settings
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="content-area">
          {activeTab === 'pending' && (
            <div className="pending-requests">
              <h3>Pending Approval Requests</h3>
              {pendingRequests.length === 0 ? (
                <p>No pending requests</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Requested By</th>
                      <th>Payload</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map(request => (
                      <tr key={request._id}>
                        <td>{request.requestType}</td>
                        <td>{request.requestedBy?.username || 'Unknown'}</td>
                        <td className="payload-cell">
                          <pre>{JSON.stringify(request.payload, null, 2)}</pre>
                        </td>
                        <td>{new Date(request.createdAt).toLocaleString()}</td>
                        <td className="actions-cell">
                          <button 
                            onClick={() => handleApproveRequest(request._id)}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(request._id)}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="request-history">
              <h3>Request History</h3>
              {requestHistory.length === 0 ? (
                <p>No request history</p>
              ) : (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Requested By</th>
                        <th>Status</th>
                        <th>Payload</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestHistory.map(request => (
                        <tr key={request._id} className={`status-${request.status.toLowerCase()}`}>
                          <td>{request.requestType}</td>
                          <td>{request.requestedBy?.username || 'Unknown'}</td>
                          <td>{request.status}</td>
                          <td className="payload-cell">
                            <pre>{renderRequestPayload(request)}</pre>
                          </td>
                          <td>{new Date(request.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button 
                      onClick={() => fetchRequestHistory(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {Math.ceil(totalRequests / pageSize)}</span>
                    <button 
                      onClick={() => fetchRequestHistory(currentPage + 1)}
                      disabled={currentPage * pageSize >= totalRequests}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="request-settings">
              <h3>Request Type Settings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Request Type</th>
                    <th>Target Collection</th>
                    <th>Auto-Approve</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requestTypes.map(type => (
                    <tr key={type._id}>
                      <td>{type.requestType}</td>
                      <td>{type.targetCollection}</td>
                      <td>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={type.isAutoApproved}
                            onChange={(e) => handleUpdateRequestType(type.requestType, e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleUpdateRequestType(type.requestType, !type.isAutoApproved)}
                          className="toggle-btn"
                        >
                          {type.isAutoApproved ? 'Disable Auto' : 'Enable Auto'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .admin-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ccc;
        }
        .tabs button {
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          border-bottom: 3px solid transparent;
        }
        .tabs button.active {
          border-bottom: 3px solid #1890ff;
          font-weight: bold;
        }
        .error-message {
          color: #f5222d;
          margin: 10px 0;
          padding: 10px;
          background: #fff1f0;
          border: 1px solid #ffa39e;
          border-radius: 4px;
        }
        .success-message {
          color: #52c41a;
          margin: 10px 0;
          padding: 10px;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        tr:hover {
          background-color: #f9f9f9;
        }
        .status-approved {
          background-color: #f6ffed;
        }
        .status-rejected {
          background-color: #fff1f0;
        }
        .payload-cell pre {
          margin: 0;
          white-space: pre-wrap;
          max-height: 100px;
          overflow-y: auto;
          background: #f5f5f5;
          padding: 8px;
          border-radius: 4px;
        }
        .actions-cell {
          display: flex;
          gap: 8px;
        }
        button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .approve-btn {
          background-color: #52c41a;
          color: white;
        }
        .reject-btn {
          background-color: #f5222d;
          color: white;
        }
        .toggle-btn {
          background-color: #1890ff;
          color: white;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #52c41a;
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
      `}</style>
    </div>
  );
};

export default RequestDashboard;
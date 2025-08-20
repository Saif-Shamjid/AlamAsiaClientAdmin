import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [managers, setManagers] = useState([]);
  const [checkPostMen, setCheckPostMen] = useState([]);
  const [activeTab, setActiveTab] = useState('managers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [checkPostLocation, setCheckPostLocation] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managersRes, checkPostRes] = await Promise.all([
        api.get('/manager'),
        api.get('/checkpost')
      ]);
      setManagers(managersRes.data);
      setCheckPostMen(checkPostRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (activeTab === 'managers') {
        await api.post('/manager/create', { username, password, role: 'manager' });
      } else {
        if (!checkPostLocation) {
          throw new Error('CheckPost location is required');
        }
        await api.post('/checkpost/create', { 
          username, 
          password, 
          role: `checkpost${checkPostMen.length + 1}`,
          checkPostLocation 
        });
      }
      fetchData(); // Refresh data
      // Reset form
      setUsername('');
      setPassword('');
      setCheckPostLocation('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Creation failed');
    }
  };

  const handleDeleteUser = async (id, type) => {
    try {
      if (window.confirm('Are you sure you want to delete this user?')) {
        await api.delete(`/${type}/${id}`);
        fetchData(); // Refresh data
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed');
    }
  };

  

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === 'managers' ? 'active' : ''}
          onClick={() => setActiveTab('managers')}
        >
          Managers
        </button>
        <button 
          className={activeTab === 'checkposts' ? 'active' : ''}
          onClick={() => setActiveTab('checkposts')}
        >
          CheckPost Men
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="create-user-form">
        <h3>Create New {activeTab === 'managers' ? 'Manager' : 'CheckPost Man'}</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {activeTab === 'checkposts' && (
            <div className="form-group">
              <label>CheckPost Location:</label>
              <input
                type="text"
                value={checkPostLocation}
                onChange={(e) => setCheckPostLocation(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit">Create</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="user-list">
          <h3>{activeTab === 'managers' ? 'Managers' : 'CheckPost Men'}</h3>
          {activeTab === 'managers' ? (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map(manager => (
                  <tr key={manager._id}>
                    <td>{manager.username}</td>
                    <td>{manager.role}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(manager._id, 'manager')}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkPostMen.map(checkPost => (
                  <tr key={checkPost._id}>
                    <td>{checkPost.username}</td>
                    <td>{checkPost.role}</td>
                    <td>{checkPost.checkPostLocation}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(checkPost._id, 'checkpost')}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
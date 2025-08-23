import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { io } from "socket.io-client";
import Snackbar from "../components/shared/Snackbar";

// Import tab components
import PendingRequestsTab from "../components/admin/PendingRequestsTab";
import RequestHistoryTab from "../components/admin/RequestHistoryTab";
import RequestSettingsTab from "../components/admin/RequestSettingsTab";
import ManagersTab from "../components/admin/ManagersTab";
import CheckPostsTab from "../components/admin/CheckPostsTab";
import BusOwnersTab from "../components/admin/BusOwnersTab";
import DeleteConfirmationModal from "../components/shared/DeleteConfirmationModal";
import BusManagementTab from "../components/admin/BusManagementTab";
import { FaBus } from "react-icons/fa";

const RequestDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Request states
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);

  // Admin states
  const [managers, setManagers] = useState([]);
  const [checkPostMen, setCheckPostMen] = useState([]);
  const [busOwners, setBusOwners] = useState([]);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checkPostLocation, setCheckPostLocation] = useState("");
  const [busOwnerName, setBusOwnerName] = useState("");
  const [busOwnerPhone, setBusOwnerPhone] = useState("");
  const [busManagementLoading, setBusManagementLoading] = useState(false);
  const [busManagementBuses, setBusManagementBuses] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const pageSize = 10;

  const [busOwnersPagination, setBusOwnersPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });

  // Socket connection
  const [socket, setSocket] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io("http://31.97.70.167:3000", {
        auth: { token },
      });
      setSocket(newSocket);

      // Fetch initial data
      fetchPendingRequests();
      fetchRequestHistory();
      fetchRequestTypes();
      fetchAdminData();
      fetchBusOwners();
      fetchBusManagementBuses();

      // Clean up on unmount
      return () => newSocket.close();
    }
  }, [user, token]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time updates
      socket.on("request_update", (updatedRequest) => {
        if (updatedRequest.status === "PENDING") {
          setPendingRequests((prev) => {
            const exists = prev.some((req) => req._id === updatedRequest._id);
            return exists
              ? prev.map((req) =>
                  req._id === updatedRequest._id ? updatedRequest : req
                )
              : [updatedRequest, ...prev];
          });
        } else {
          setPendingRequests((prev) =>
            prev.filter((req) => req._id !== updatedRequest._id)
          );
          setRequestHistory((prev) => [updatedRequest, ...prev]);
        }
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });
    }
  }, [socket]);

  const showSnackbar = (message, type = "success") => {
    setSnackbar({
      show: true,
      message,
      type,
    });
  };

  const hideSnackbar = () => {
    setSnackbar({
      show: false,
      message: "",
      type: "success",
    });
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/request/pending");
      setPendingRequests(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch pending requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/request/history?page=${page}&limit=${pageSize}`
      );
      setRequestHistory(response.data.requests);
      setTotalRequests(response.data.total);
      setCurrentPage(page);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch request history"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestTypes = async () => {
    try {
      const response = await api.get("/request/settings");
      setRequestTypes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch request types");
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [managersRes, checkPostRes] = await Promise.all([
        api.get("/manager"),
        api.get("/checkpost"),
      ]);
      setManagers(managersRes.data);
      setCheckPostMen(checkPostRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusOwners = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/busowners?page=${page}&limit=${pageSize}`
      );
      setBusOwners(response.data.owners);
      setBusOwnersPagination({
        total: response.data.total,
        pages: response.data.pages,
        currentPage: response.data.currentPage,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bus owners");
    } finally {
      setLoading(false);
    }
  };

  // Add these functions to RequestDashboard
  const fetchBusManagementBuses = async () => {
    try {
      setBusManagementLoading(true);
      const response = await api.get("/busowners/buses");
      setBusManagementBuses(response.data.buses);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to fetch buses",
        "error"
      );
    } finally {
      setBusManagementLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setError("");
      await api.put(`/request/${requestId}/approve`);
      showSnackbar("Request approved successfully");

      // Fetch updated data
      fetchPendingRequests();
      fetchRequestHistory();
      fetchRequestTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Approval failed");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setError("");
      await api.put(`/request/${requestId}/reject`);
      showSnackbar("Request rejected successfully");

      // Fetch updated data
      fetchPendingRequests();
      fetchRequestHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Rejection failed");
    }
  };

  const handleUpdateRequestType = async (requestType, isAutoApproved) => {
    try {
      setError("");
      await api.put(`/request/settings/${requestType}`, { isAutoApproved });
      showSnackbar("Request type updated successfully");
      fetchRequestTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleCreateUser = async (type) => {
    try {
      setError("");
      if (type === "managers") {
        await api.post("/manager/create", {
          username,
          password,
          role: "manager",
        });
      } else {
        if (!checkPostLocation) {
          throw new Error("CheckPost location is required");
        }
        await api.post("/checkpost/create", {
          username,
          password,
          role: `checkpost${checkPostMen.length + 1}`,
          checkPostLocation,
        });
      }

      showSnackbar(
        `${
          type === "managers" ? "Manager" : "CheckPost Man"
        } created successfully`
      );

      fetchAdminData(); // Refresh data
      // Reset form
      setUsername("");
      setPassword("");
      setCheckPostLocation("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Creation failed");
    }
  };

  const handleCreateBusOwner = async () => {
    try {
      setError("");
      await api.post("/busowners", {
        name: busOwnerName,
        phoneNumber: busOwnerPhone,
      });

      showSnackbar("Bus owner created successfully");

      // Refresh data and reset form
      fetchBusOwners();
      setBusOwnerName("");
      setBusOwnerPhone("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bus owner");
    }
  };

  const openDeleteModal = (id, type, name) => {
    setItemToDelete({ id, name });
    setDeleteType(type);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (!deleteLoading) {
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType("");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      if (deleteType === "manager") {
        await api.delete(`/manager/${itemToDelete.id}`);
        showSnackbar("Manager deleted successfully");
        fetchAdminData();
      } else if (deleteType === "checkpost") {
        await api.delete(`/checkpost/${itemToDelete.id}`);
        showSnackbar("CheckPost user deleted successfully");
        fetchAdminData();
      } else if (deleteType === "busowner") {
        await api.delete(`/busowners/${itemToDelete.id}`);
        showSnackbar("Bus owner deleted successfully");
        fetchBusOwners();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Deletion failed");
    } finally {
      setDeleteLoading(false);
      closeDeleteModal();
    }
  };

  const handleAddBuses = async (data) => {
    try {
      setBusManagementLoading(true);
      const response = await api.post("/busowners/add/buses", data);
      showSnackbar(response.data.message || "Buses added successfully");
      fetchBusManagementBuses();
      fetchBusOwners();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || err.message || "Failed to add buses"
      );
    } finally {
      setBusManagementLoading(false);
    }
  };

  const handleUpdateBuses = async (data) => {
    try {
      setBusManagementLoading(true);
      const response = await api.patch("/busowners/update/buses", data);
      showSnackbar(response.data.message || "Buses updated successfully");
      fetchBusManagementBuses();
      fetchBusOwners();
    } catch (err) {
      throw new Error(
        err.response?.data?.message || err.message || "Failed to update buses"
      );
    } finally {
      setBusManagementLoading(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    try {
      setBusManagementLoading(true);
      await api.delete(`/busowners/delete/buses/${busId}`);
      showSnackbar("Bus deleted successfully");
      fetchBusManagementBuses();
      fetchBusOwners();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete bus");
    } finally {
      setBusManagementLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Mobile sidebar component
  const MobileSidebar = () => (
    <div className="lg:hidden">
      {/* Mobile sidebar backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
          isMobileSidebarOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      {/* Mobile sidebar with smoother slide animation */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transition-all duration-300 ease-out ${
          isMobileSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
      >
        <div className="p-5 border-b border-gray-200 bg-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-indigo-800">
              Navigation
            </h2>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-indigo-500 mt-1">
            Welcome, {user?.username}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 flex items-center group ${
              activeTab === "pending"
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => handleTabChange("pending")}
          >
            <div
              className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                activeTab === "pending"
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium">Pending Requests</span>
          </button>
          <button
            className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 flex items-center group ${
              activeTab === "history"
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => handleTabChange("history")}
          >
            <div
              className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                activeTab === "history"
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium">Request History</span>
          </button>
          <button
            className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 flex items-center group ${
              activeTab === "settings"
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => handleTabChange("settings")}
          >
            <div
              className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                activeTab === "settings"
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium">Request Settings</span>
          </button>
          <button
            className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 flex items-center group ${
              activeTab === "managers"
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => handleTabChange("managers")}
          >
            <div
              className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                activeTab === "managers"
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium">Managers</span>
          </button>
          <button
            className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 flex items-center group ${
              activeTab === "checkposts"
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => handleTabChange("checkposts")}
          >
            <div
              className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                activeTab === "checkposts"
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium">CheckPosts</span>
          </button>
          <button
            className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 flex items-center group ${
              activeTab === "busowners"
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => handleTabChange("busowners")}
          >
            <div
              className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                activeTab === "busowners"
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium">Bus Owners</span>
          </button>

          <button
            className={`w-full text-left py-4 px-4 rounded-xl transition-all duration-300 flex items-center group ${
              activeTab === "busmanagement"
                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            onClick={() => handleTabChange("busmanagement")}
          >
            <div
              className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                activeTab === "busmanagement"
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              }`}
            >
              <FaBus className="h-5 w-5" />
            </div>
            <span className="font-medium">Bus Management</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Admin Dashboard v1.0
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Header with mobile menu button */}
        <div className="text-center mb-10 relative">
          <button
            className="lg:hidden absolute left-0 top-0 p-3 rounded-xl text-indigo-700 hover:bg-indigo-100 focus:outline-none transition-colors duration-300"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-4xl font-bold text-indigo-900 mb-3 lg:pl-0 pl-12">
            Admin Dashboard
          </h1>
          <p className="text-lg text-indigo-600">
            Welcome back,{" "}
            <span className="font-semibold">{user?.username}</span>
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar for success messages */}
        {snackbar.show && (
          <Snackbar
            message={snackbar.message}
            type={snackbar.type}
            onClose={hideSnackbar}
          />
        )}

        {/* Tabs Navigation - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-md mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                activeTab === "pending"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Pending Requests
              </div>
            </button>

            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                activeTab === "history"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Request History
              </div>
            </button>

            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                activeTab === "settings"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Request Settings
              </div>
            </button>

            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                activeTab === "managers"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("managers")}
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Managers
              </div>
            </button>

            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                activeTab === "checkposts"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("checkposts")}
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
                CheckPosts
              </div>
            </button>

            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                activeTab === "busowners"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("busowners")}
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Bus Owners
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${
                activeTab === "busmanagement"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-indigo-500 hover:bg-gray-50"
              }`}
              onClick={() => handleTabChange("busmanagement")}
            >
              <div className="flex items-center gap-4 justify-center">
                <FaBus className="h-5 w-5" />
                <span className="font-medium">Bus Management</span>
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300">
            {activeTab === "pending" && (
              <PendingRequestsTab
                pendingRequests={pendingRequests}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
              />
            )}
            {activeTab === "history" && (
              <RequestHistoryTab
                requestHistory={requestHistory}
                totalRequests={totalRequests}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={fetchRequestHistory}
              />
            )}
            {activeTab === "settings" && (
              <RequestSettingsTab
                requestTypes={requestTypes}
                onUpdateRequestType={handleUpdateRequestType}
              />
            )}
            {activeTab === "managers" && (
              <ManagersTab
                managers={managers}
                username={username}
                password={password}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onCreateUser={() => handleCreateUser("managers")}
                onDeleteUser={(id, name) =>
                  openDeleteModal(id, "manager", name)
                }
              />
            )}
            {activeTab === "checkposts" && (
              <CheckPostsTab
                checkPostMen={checkPostMen}
                username={username}
                password={password}
                checkPostLocation={checkPostLocation}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onLocationChange={setCheckPostLocation}
                onCreateUser={() => handleCreateUser("checkposts")}
                onDeleteUser={(id, name) =>
                  openDeleteModal(id, "checkpost", name)
                }
              />
            )}
            {activeTab === "busowners" && (
              <BusOwnersTab
                busOwners={busOwners}
                name={busOwnerName}
                phoneNumber={busOwnerPhone}
                onNameChange={setBusOwnerName}
                onPhoneNumberChange={setBusOwnerPhone}
                onCreateBusOwner={handleCreateBusOwner}
                onDeleteBusOwner={(id, name) =>
                  openDeleteModal(id, "busowner", name)
                }
                loading={loading}
                paginationInfo={busOwnersPagination}
              />
            )}

            {activeTab === "busmanagement" && (
              <BusManagementTab
                busOwners={busOwners}
                buses={busManagementBuses}
                onFetchBuses={fetchBusManagementBuses}
                onFetchBusOwners={fetchBusOwners}
                onAddBuses={handleAddBuses}
                onUpdateBuses={handleUpdateBuses}
                onDeleteBus={handleDeleteBus}
                loading={busManagementLoading}
                showSnackbar={showSnackbar}
              />
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title={`Delete ${
            deleteType === "manager"
              ? "Manager"
              : deleteType === "checkpost"
              ? "CheckPost User"
              : "Bus Owner"
          }`}
          itemName={itemToDelete?.name || ""}
          itemType={
            deleteType === "manager"
              ? "manager"
              : deleteType === "checkpost"
              ? "checkpost user"
              : "bus owner"
          }
          loading={deleteLoading}
        />
      </div>
    </div>
  );
};

export default RequestDashboard;

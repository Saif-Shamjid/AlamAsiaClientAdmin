import { useState, useEffect, useCallback } from "react";
import {
  FaUser,
  FaUserPlus,
  FaPhone,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaIdCard,
  FaEnvelope,
  FaBriefcase,
  FaMapMarkerAlt,
} from "react-icons/fa";
import api from "../../services/api";
import StaffProfile from "../Staff/StaffProfile";

// Main Staff Management Tab Component
const StaffManagementTab = ({
  staffMembers,
  name,
  phoneNumber,
  onNameChange,
  onPhoneNumberChange,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
  loading,
  paginationInfo,
  onPageChange,
  onSearch,
  searchTerm,
}) => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Use the pagination info if available
  const totalPages = paginationInfo?.pages || 1;
  const totalItems = paginationInfo?.total || staffMembers.length;
  const currentPage = paginationInfo?.currentPage || 1;

  // Debounced search function
  const handleSearchChange = useCallback(
    (value) => {
      setLocalSearchTerm(value);

      // Clear previous timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Set new timeout
      const newTimeout = setTimeout(() => {
        onSearch(value);
      }, 500); // 500ms debounce delay

      setDebounceTimeout(newTimeout);
    },
    [debounceTimeout, onSearch]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Sync local search term with parent component's search term
  useEffect(() => {
    setLocalSearchTerm(searchTerm || "");
  }, [searchTerm]);

  const handleViewProfile = async (staffId) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await api.get(`/staff/${staffId}`);
      setSelectedStaff(response.data);
    } catch (err) {
      console.error("Error fetching staff details:", err);
      setProfileError(
        err.response?.data?.message || "Failed to fetch staff details"
      );
      // Fallback: try to use the basic data from the list
      const staff = staffMembers.find((s) => s._id === staffId);
      if (staff) {
        setSelectedStaff(staff);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseProfile = () => {
    setSelectedStaff(null);
    setProfileError(null);
  };

  // If a staff member is selected, show their profile
  if (selectedStaff) {
    return (
      <StaffProfile
        staff={selectedStaff}
        onClose={handleCloseProfile}
        fetchStaffData={handleViewProfile}
        onUpdateStaff={onUpdateStaff}
        onDeleteStaff={onDeleteStaff}
      />
    );
  }

  // Otherwise, show the main staff list
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <FaUser className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-indigo-900">
              Staff Management
            </h2>
            <p className="text-indigo-600">Create and manage staff accounts</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <FaUser className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <FaPhone className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Staff</p>
                <p className="text-2xl font-bold text-blue-800">
                  {staffMembers.filter((s) => s.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <FaBriefcase className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Departments</p>
                <p className="text-2xl font-bold text-green-800">
                  {new Set(staffMembers.map((s) => s.department)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <FaMapMarkerAlt className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Roles</p>
                <p className="text-2xl font-bold text-purple-800">
                  {new Set(staffMembers.map((s) => s.role)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Staff Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <FaUserPlus className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Create New Staff Member
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter staff name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaPhone className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => onPhoneNumberChange(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={onCreateStaff}
                disabled={loading || !name || !phoneNumber}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Create Staff
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar with Debounce */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search staff by name, phone, email, department..."
            />
            {/* Loading indicator when searching */}
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg
                  className="animate-spin h-4 w-4 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>

          {/* <p className="text-xs text-gray-500 mt-1 ml-1">
            Type to search (results update after 500ms pause)
          </p> */}
        </div>

        {loading ? (
          // Loading state inside the table
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                All Staff Members
              </h3>
              <span className="text-sm text-gray-500">Loading...</span>
            </div>

            {/* Desktop Table Loading */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Profile
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Department & Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Loading skeleton rows */}
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full"></div>
                          <div className="ml-4">
                            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-8 bg-gray-300 rounded w-24 inline-block"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Loading */}
            <div className="md:hidden p-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border-b border-gray-200 p-4 animate-pulse"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center mb-2">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                      <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FaUser className="text-indigo-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Staff Members Found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try a different search term"
                : "Create your first staff account to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Staff Members Table/Cards */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  All Staff Members
                </h3>
                <span className="text-sm text-gray-500">
                  Showing {Math.min(currentPage * 10, totalItems)} of{" "}
                  {totalItems} staff members
                </span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Profile
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Department & Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffMembers.map((staff) => (
                      <tr
                        key={staff._id}
                        className="hover:bg-indigo-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {staff.profilePic?.url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={`http://31.97.70.167:3000/${staff.profilePic.url}`}
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <FaUser className="text-indigo-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {staff.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {staff.employeeId || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <FaPhone className="text-gray-400 mr-2 text-sm" />
                              {staff.phoneNumber}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaEnvelope className="text-gray-400 mr-2 text-sm" />
                              {staff.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <FaBriefcase className="text-gray-400 mr-2 text-sm" />
                              {staff.department || "N/A"}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaIdCard className="text-gray-400 mr-2 text-sm" />
                              {staff.role || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              staff.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {staff.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleViewProfile(staff._id)}
                              disabled={profileLoading}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center disabled:opacity-50"
                            >
                              {profileLoading ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h极速4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <FaEye className="mr-1" />
                                  View Profile
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => onDeleteStaff(staff._id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {staffMembers.map((staff) => (
                  <div
                    key={staff._id}
                    className="border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0 h-12 w-12 mr-3">
                          {staff.profilePic?.url ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={`http://31.97.70.167:3000/${staff.profilePic.url}`}
                              alt=""
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FaUser className="text-indigo-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {staff.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaPhone className="mr-1 text-xs" />
                              {staff.phoneNumber}
                            </div>
                          </div>
                          {staff.department && (
                            <div className="text-sm text-gray-500 mt-1">
                              <div className="flex items-center">
                                <FaBriefcase className="mr-1 text-xs" />
                                {staff.department}
                                {staff.role && ` (${staff.role})`}
                              </div>
                            </div>
                          )}
                          <div className="mt-1">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                staff.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {staff.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(staff._id)}
                          disabled={profileLoading}
                          className="text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                          title="View Profile"
                        >
                          {profileLoading ? (
                            <svg
                              className="animate-spin h-5 w-5 text-indigo-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 极速0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 极速7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <FaEye />
                          )}
                        </button>
                        <button
                          onClick={() => onDeleteStaff(staff._极速)}
                          className="text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-md px-6 py-4 mt-6">
                <div className="极速flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span> -{" "}
                      <span className="font-medium">{totalItems}</span> total
                      staff members
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onPageChange(currentPage - 1, searchTerm)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 rounded-md极速 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={() => onPageChange(currentPage + 1, searchTerm)}
                      disabled={currentPage >= totalPages}
                      className="inline-flex items-center px-3 py-2 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <FaChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Page Numbers */}
                <div className="flex justify-center mt-4">
                  <nav className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => onPageChange(page, searchTerm)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentPage === page
                              ? "bg-indigo-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              </div>
            )}
          </>
        )}

        {/* Information Card */}
        <div className="bg-indigo-50 rounded-xl p-5 mt-6 border border-indigo-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaIdCard className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                About Staff Management
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  Staff accounts can have profile pictures, documents, and
                  detailed information. Administrators can manage all staff
                  details while managers can only view them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagementTab;

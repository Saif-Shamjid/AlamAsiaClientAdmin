import { useState, useEffect, useCallback } from "react";
import {
  FaBus,
  FaUserPlus,
  FaUser,
  FaTrash,
  FaPhone,
  FaIdCard,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import BusOwnerProfile from "../owner/BusOwnerProfile";
import api from "../../services/api";
import { debounce } from "lodash";

// Main Bus Owners Tab Component
const BusOwnersTab = ({
  busOwners,
  name,
  phoneNumber,
  onNameChange,
  onPhoneNumberChange,
  onCreateBusOwner,
  onDeleteBusOwner,
  loading,
  paginationInfo,
  onSearch,
  searchTerm,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [localSearch, setLocalSearch] = useState(searchTerm || "");
  const [isSearching, setIsSearching] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const pageSize = 10;

  // Use the pagination info if available, otherwise calculate locally
  const totalPages = paginationInfo?.pages || 1;
  const totalItems = paginationInfo?.total || busOwners.length;
  const currentPageFromProps = paginationInfo?.currentPage || 1;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setIsSearching(true);
      setTableLoading(true);
      onSearch(searchValue);
      setCurrentPage(1); // Reset to first page when searching

      // Simulate a minimum loading time for better UX
      setTimeout(() => {
        setTableLoading(false);
        setIsSearching(false);
      }, 800);
    }, 600),
    [onSearch]
  );

  // Sync current page with pagination info
  useEffect(() => {
    if (paginationInfo?.currentPage) {
      setCurrentPage(paginationInfo.currentPage);
    }
  }, [paginationInfo?.currentPage]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);

    if (value.trim() === "") {
      // Clear search immediately if empty
      setIsSearching(false);
      setTableLoading(true);
      onSearch("");
      setCurrentPage(1);

      // Simulate a minimum loading time
      setTimeout(() => {
        setTableLoading(false);
      }, 500);
    } else {
      // Use debounced search for non-empty values
      debouncedSearch(value);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setIsSearching(false);
    setTableLoading(true);
    onSearch("");
    setCurrentPage(1);

    // Simulate a minimum loading time
    setTimeout(() => {
      setTableLoading(false);
    }, 500);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setTableLoading(true);
    if (onPageChange) {
      onPageChange(page, localSearch);
    }

    // Simulate loading for better UX
    setTimeout(() => {
      setTableLoading(false);
    }, 800);
  };

  const handleViewProfile = async (ownerId) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await api.get(`/busowners/${ownerId}`);
      setSelectedOwner(response.data);
    } catch (err) {
      console.error("Error fetching bus owner details:", err);
      setProfileError(
        err.response?.data?.message || "Failed to fetch bus owner details"
      );
      const owner = busOwners.find((o) => o._id === ownerId);
      if (owner) {
        setSelectedOwner(owner);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseProfile = () => {
    setSelectedOwner(null);
    setProfileError(null);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // If an owner is selected, show their profile
  if (selectedOwner) {
    return (
      <BusOwnerProfile
        owner={selectedOwner}
        onClose={handleCloseProfile}
        fetchOwnerData={handleViewProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <FaBus className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-indigo-900">
              Bus Owners Management
            </h2>
            <p className="text-indigo-600">
              Create and manage bus owner accounts
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <FaBus className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bus Owners</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <FaUser className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Accounts</p>
                <p className="text-2xl font-bold text-blue-800">
                  {busOwners.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <FaIdCard className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bus Owner Role</p>
                <p className="text-2xl font-bold text-green-800">
                  {busOwners.length}
                </p>
              </div>
            </div>
          </div>

          {searchTerm && (
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <FaSearch className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Search Results</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {busOwners.length} found
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Bus Owner Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <FaUserPlus className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Create New Bus Owner
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
                  placeholder="Enter bus owner name"
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
                onClick={onCreateBusOwner}
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
                    Create Bus Owner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bus Owners Table/Cards - Always visible even when empty */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Table Header with Search */}
          <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-800">
              {searchTerm ? "Search Results" : "All Bus Owner Accounts"}
            </h3>

            {/* Search Input - Always visible */}
            <div className="relative max-w-xs w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaSearch className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Search bus owners..."
                className="pl-10 pr-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm text-gray-600">
              {busOwners.length === 0 && !tableLoading && searchTerm
                ? `No results found for "${searchTerm}"`
                : `Showing ${busOwners.length} of ${totalItems} bus owners`}
              {searchTerm && busOwners.length > 0 && (
                <>
                  {" "}
                  for <span className="font-medium">"{searchTerm}"</span>
                </>
              )}
              {currentPage > 1 && ` (Page ${currentPage})`}
            </span>
          </div>

          {/* Loading State */}
          {tableLoading && (
            <div className="p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-l-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">
                  {isSearching ? "Searching..." : "Loading bus owners..."}
                </p>
              </div>
            </div>
          )}

          {/* Empty State - Only show when not loading and no results */}
          {!tableLoading && busOwners.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <FaBus className="text-indigo-400 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "No Bus Owners Found" : "No Bus Owners Yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No results found for "${searchTerm}". Try a different search term.`
                  : "Create your first bus owner account to get started."}
              </p>
            </div>
          )}

          {/* Desktop Table View */}
          {!tableLoading && busOwners.length > 0 && (
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Phone Number
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
                  {busOwners.map((owner) => (
                    <tr
                      key={owner._id}
                      className="hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <FaUser className="text-indigo-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {owner.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaPhone className="text-gray-400 mr-2 text-sm" />
                          <div className="text-sm text-gray-600">
                            {owner.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleViewProfile(owner._id)}
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                            onClick={() =>
                              onDeleteBusOwner(owner._id, owner.name)
                            }
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
          )}

          {/* Mobile Card View */}
          {!tableLoading && busOwners.length > 0 && (
            <div className="md:hidden">
              {busOwners.map((owner) => (
                <div
                  key={owner._id}
                  className="border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors duration-150"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center mb-2">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <FaUser className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {owner.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {owner.phoneNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(owner._id)}
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <FaEye />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteBusOwner(owner._id, owner.name)}
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
          )}
        </div>

        {/* Pagination - Only show when there are results */}
        {!tableLoading && busOwners.length > 0 && totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span> -{" "}
                  <span className="font-medium">{totalItems}</span> total bus
                  owners
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
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
                      onClick={() => handlePageChange(page)}
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

        {/* Information Card */}
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaBus className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                About Bus Owner Accounts
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  Bus owner accounts allow transportation company owners to
                  manage their fleet, track routes, and monitor operations. Each
                  account is linked to specific buses and routes in the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusOwnersTab;

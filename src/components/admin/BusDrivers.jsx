import { useState } from "react";
import {
  FaUser,
  FaUserPlus,
  FaPhone,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaBus,
  FaIdCard,
  FaEye,
} from "react-icons/fa";
import api from "../../services/api";
import BusDriverProfile from "../Driver/BusDriverProfile";

// Main Bus Drivers Tab Component
const BusDriversTab = ({
  busDrivers,
  name,
  phoneNumber,
  onNameChange,
  onPhoneNumberChange,
  onCreateBusDriver,
  onDeleteBusDriver,
  loading,
  paginationInfo,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const pageSize = 10;

  // Use the pagination info if available, otherwise calculate locally
  const totalPages =
    paginationInfo?.pages || Math.ceil(busDrivers.length / pageSize);
  const totalItems = paginationInfo?.total || busDrivers.length;

  const paginatedBusDrivers = busDrivers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewProfile = async (driverId) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await api.get(`/busdrivers/${driverId}`);
      console.log("API Response:", response.data); // Debug log

      // The response data is the driver object directly
      setSelectedDriver(response.data);
    } catch (err) {
      console.error("Error fetching bus driver details:", err);
      setProfileError(
        err.response?.data?.message || "Failed to fetch bus driver details"
      );
      // Fallback: try to use the basic data from the list
      const driver = busDrivers.find((d) => d._id === driverId);

      if (driver) {
        setSelectedDriver(driver);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseProfile = () => {
    setSelectedDriver(null);
    setProfileError(null);
  };

  // If a driver is selected, show their profile
  if (selectedDriver) {
    return (
      <BusDriverProfile
        driver={selectedDriver}
        onClose={handleCloseProfile}
        fetchDriverData={handleViewProfile}
      />
    );
  }

  // Otherwise, show the main bus drivers list
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
              Bus Drivers Management
            </h2>
            <p className="text-indigo-600">
              Create and manage bus driver accounts
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <FaUser className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bus Drivers</p>
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
                <p className="text-sm text-gray-500">Active Drivers</p>
                <p className="text-2xl font-bold text-blue-800">
                  {busDrivers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <FaBus className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned to Buses</p>
                <p className="text-2xl font-bold text-green-800">
                  {busDrivers.filter((d) => d.bus).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Bus Driver Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <FaUserPlus className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Create New Bus Driver
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
                  placeholder="Enter driver name"
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
                onClick={onCreateBusDriver}
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
                    Create Driver
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {busDrivers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FaUser className="text-indigo-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Bus Drivers Found
            </h3>
            <p className="text-gray-500">
              Create your first bus driver account to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Bus Drivers Table/Cards */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  All Bus Driver Accounts
                </h3>
                <span className="text-sm text-gray-500">
                  Showing {Math.min(currentPage * pageSize, totalItems)} of{" "}
                  {totalItems} bus drivers
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Assigned Bus
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
                    {paginatedBusDrivers.map((driver) => (
                      <tr
                        key={driver._id}
                        className="hover:bg-indigo-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                              <FaUser className="text-indigo-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {driver.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaPhone className="text-gray-400 mr-2 text-sm" />
                            <div className="text-sm text-gray-600">
                              {driver.phoneNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {driver.bus ? (
                              <>
                                <FaBus className="text-gray-400 mr-2 text-sm" />
                                <div className="text-sm text-gray-600">
                                  {driver.bus.busNumber} (
                                  {driver.bus.registrationNumber})
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Not assigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleViewProfile(driver._id)}
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
                              onClick={() => onDeleteBusDriver(driver._id)}
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
                {paginatedBusDrivers.map((driver) => (
                  <div
                    key={driver._id}
                    className="border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center mb-2">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                          <FaUser className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {driver.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {driver.phoneNumber}
                          </div>
                          {driver.bus && (
                            <div className="text-sm text-gray-500 mt-1">
                              Bus: {driver.bus.busNumber} (
                              {driver.bus.registrationNumber})
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(driver._id)}
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
                          onClick={() => onDeleteBusDriver(driver._id)}
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span> -{" "}
                      <span className="font-medium">{totalItems}</span> total
                      bus drivers
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
                About Bus Driver Accounts
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  Bus driver accounts are used to assign drivers to specific
                  buses. Each driver can be associated with one bus at a time
                  for tracking and management purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDriversTab;

import { useState, useEffect, useCallback } from "react";
import {
  FaBus,
  FaPlus,
  FaTrash,
  FaEdit,
  FaLink,
  FaUnlink,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaIdCard,
  FaUserTie,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEllipsisV,
  FaUser,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import ConfirmationModal from "../shared/ConfirmationModal";
import { debounce } from "lodash";

const BusManagementTab = ({
  busOwners,
  buses,
  busDrivers,
  onFetchBuses,
  onFetchBusOwners,
  onFetchBusDrivers,
  onAddBuses,
  onUpdateBuses,
  onDeleteBus,
  onAssignDriverToBus,
  onRemoveDriverFromBus,
  loading,
  showSnackbar,
  // New search props from parent
  busSearchTerm,
  onBusSearch,
  busPagination,
  onBusPageChange,
  busOwnerSearch,
  onBusOwnerSearch,
}) => {
  // State management
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // all, linked, unlinked

  // Form states
  const [busNumbers, setBusNumbers] = useState([""]);
  const [registrationNumbers, setRegistrationNumbers] = useState([""]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Driver assignment states
  const [showAssignDriverForm, setShowAssignDriverForm] = useState(false);
  const [selectedBusForDriver, setSelectedBusForDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [filteredDrivers, setFilteredDrivers] = useState(busDrivers);

  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [driverToUnassign, setDriverToUnassign] = useState(null);

  // Search states for owner selection
  const [ownerSearchTerm, setOwnerSearchTerm] = useState(busOwnerSearch || "");
  const [filteredBusOwners, setFilteredBusOwners] = useState([]);
  const [isSearchingOwners, setIsSearchingOwners] = useState(false);

  // Search state for bus selection in update form
  const [localBusSearchTerm, setLocalBusSearchTerm] = useState("");
  const [filteredBusesForSelection, setFilteredBusesForSelection] = useState(
    []
  );
  const [isSearchingBuses, setIsSearchingBuses] = useState(false);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debounced search function for owners
  const debouncedOwnerSearch = useCallback(
    debounce((searchValue) => {
      setIsSearchingOwners(true);
      onBusOwnerSearch(searchValue);

      // Clear results while searching
      setFilteredBusOwners([]);

      // Simulate a minimum loading time for better UX
      setTimeout(() => {
        setIsSearchingOwners(false);
      }, 800);
    }, 800),
    [onBusOwnerSearch]
  );

  // Handle owner search change
  const handleOwnerSearchChange = (e) => {
    const value = e.target.value;
    setOwnerSearchTerm(value);

    if (value.trim() === "") {
      // Clear search immediately if empty
      setIsSearchingOwners(false);
      onBusOwnerSearch("");
      setFilteredBusOwners(busOwners);
    } else {
      // Use debounced search for non-empty values
      setIsSearchingOwners(true);
      setFilteredBusOwners([]);
      debouncedOwnerSearch(value);
    }
  };

  // Handle bus search change - delegate to parent
  const handleBusSearchChange = (e) => {
    const value = e.target.value;
    onBusSearch(value);
  };

  // Handle local bus search for update form
  const handleLocalBusSearchChange = (e) => {
    const value = e.target.value;
    setLocalBusSearchTerm(value);

    if (value.trim() === "") {
      setFilteredBusesForSelection(buses);
      setIsSearchingBuses(false);
    } else {
      setIsSearchingBuses(true);
      setFilteredBusesForSelection([]);

      // Simulate search delay
      setTimeout(() => {
        const filtered = buses.filter(
          (bus) =>
            bus.busNumber.toLowerCase().includes(value.toLowerCase()) ||
            bus.registrationNumber
              .toLowerCase()
              .includes(value.toLowerCase()) ||
            (bus.owners &&
              bus.owners.some(
                (owner) =>
                  owner.name &&
                  owner.name.toLowerCase().includes(value.toLowerCase())
              ))
        );
        setFilteredBusesForSelection(filtered);
        setIsSearchingBuses(false);
      }, 600);
    }
  };

  // Clear owner search
  const handleClearOwnerSearch = () => {
    setOwnerSearchTerm("");
    setIsSearchingOwners(false);
    onBusOwnerSearch("");
    setFilteredBusOwners(busOwners);
  };

  // Handle page change - delegate to parent
  const handlePageChange = (page) => {
    onBusPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter bus owners based on search term
  useEffect(() => {
    if (ownerSearchTerm) {
      const filtered = busOwners.filter(
        (owner) =>
          owner.name.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
          owner.phoneNumber
            .toLowerCase()
            .includes(ownerSearchTerm.toLowerCase())
      );
      setFilteredBusOwners(filtered);
    } else {
      setFilteredBusOwners(busOwners);
    }
  }, [ownerSearchTerm, busOwners]);

  // Filter buses for selection based on search term
  useEffect(() => {
    if (localBusSearchTerm) {
      const filtered = buses.filter(
        (bus) =>
          bus.busNumber
            .toLowerCase()
            .includes(localBusSearchTerm.toLowerCase()) ||
          bus.registrationNumber
            .toLowerCase()
            .includes(localBusSearchTerm.toLowerCase()) ||
          (bus.owners &&
            bus.owners.some(
              (owner) =>
                owner.name &&
                owner.name
                  .toLowerCase()
                  .includes(localBusSearchTerm.toLowerCase())
            ))
      );
      setFilteredBusesForSelection(filtered);
    } else {
      setFilteredBusesForSelection(buses);
    }
  }, [localBusSearchTerm, buses]);

  // Filter drivers based on search term
  useEffect(() => {
    if (driverSearchTerm) {
      const filtered = busDrivers.filter(
        (driver) =>
          driver.name.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
          driver.licenseNumber
            .toLowerCase()
            .includes(driverSearchTerm.toLowerCase()) ||
          (driver.bus &&
            driver.bus.busNumber
              .toLowerCase()
              .includes(driverSearchTerm.toLowerCase()))
      );
      setFilteredDrivers(filtered);
    } else {
      setFilteredDrivers(busDrivers);
    }
  }, [driverSearchTerm, busDrivers]);

  // Filter buses based on active filter (local filtering)
  useEffect(() => {
    let filtered = buses;

    // Apply status filter locally
    if (activeFilter === "linked") {
      filtered = filtered.filter((bus) => bus.owners && bus.owners.length > 0);
    } else if (activeFilter === "unlinked") {
      filtered = filtered.filter(
        (bus) => !bus.owners || bus.owners.length === 0
      );
    }

    setFilteredBuses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [buses, activeFilter]);

  // Calculate pagination for locally filtered results
  const pageSize = 10;
  const totalPages = Math.ceil(filteredBuses.length / pageSize);
  const paginatedBuses = filteredBuses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddBuses = async () => {
    try {
      setError("");

      // Validate form
      if (
        busNumbers.some((num) => !num.trim()) ||
        registrationNumbers.some((reg) => !reg.trim())
      ) {
        throw new Error("All bus and registration numbers are required");
      }

      if (!selectedOwners.length) {
        throw new Error("At least one owner must be selected");
      }

      await onAddBuses({
        busNumbers: busNumbers.map((num) => num.trim()),
        registrationNumbers: registrationNumbers.map((reg) => reg.trim()),
        ownerIds: selectedOwners,
      });

      setShowAddForm(false);
      resetForm();
      setSuccess("Buses added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add buses");
    }
  };

  const handleUpdateBuses = async () => {
    try {
      setError("");

      if (!selectedBuses.length) {
        throw new Error("Please select at least one bus");
      }

      if (!selectedOwners.length) {
        throw new Error("Please select at least one owner");
      }

      await onUpdateBuses({
        busIds: selectedBuses,
        ownerIds: selectedOwners,
      });

      setShowUpdateForm(false);
      resetForm();
      setSelectedBuses([]);
      setSuccess("Bus owners updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update buses");
    }
  };

  const handleDeleteBus = async () => {
    try {
      setDeleteLoading(true);
      setError("");
      await onDeleteBus(busToDelete);
      setSuccess("Bus deleted successfully!");
      setShowDeleteModal(false);
      setBusToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete bus");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    try {
      setError("");

      if (!selectedBusForDriver) {
        throw new Error("Please select a bus");
      }

      if (!selectedDriver) {
        throw new Error("Please select a driver");
      }

      await onAssignDriverToBus({
        driverId: selectedDriver,
        busId: selectedBusForDriver,
      });

      setShowAssignDriverForm(false);
      setSelectedBusForDriver(null);
      setSelectedDriver("");
      setDriverSearchTerm("");
      setSuccess("Driver assigned to bus successfully!");
    } catch (err) {
      setError(err.message || "Failed to assign driver to bus");
    }
  };

  const handleUnassignDriver = async () => {
    try {
      setError("");
      await onRemoveDriverFromBus(driverToUnassign);
      setShowUnassignModal(false);
      setDriverToUnassign(null);
      setSuccess("Driver unassigned from bus successfully!");
    } catch (err) {
      setError(err.message || "Failed to unassign driver from bus");
    }
  };

  const openDeleteModal = (busId) => {
    setBusToDelete(busId);
    setShowDeleteModal(true);
  };

  const openUnassignModal = (driverId) => {
    setDriverToUnassign(driverId);
    setShowUnassignModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBusToDelete(null);
    setDeleteLoading(false);
  };

  const closeUnassignModal = () => {
    setShowUnassignModal(false);
    setDriverToUnassign(null);
  };

  const resetForm = () => {
    setBusNumbers([""]);
    setRegistrationNumbers([""]);
    setSelectedOwners([]);
    setOwnerSearchTerm("");
    setLocalBusSearchTerm("");
  };

  const addBusField = () => {
    setBusNumbers([...busNumbers, ""]);
    setRegistrationNumbers([...registrationNumbers, ""]);
  };

  const removeBusField = (index) => {
    if (busNumbers.length > 1) {
      const newBusNumbers = [...busNumbers];
      const newRegistrationNumbers = [...registrationNumbers];

      newBusNumbers.splice(index, 1);
      newRegistrationNumbers.splice(index, 1);

      setBusNumbers(newBusNumbers);
      setRegistrationNumbers(newRegistrationNumbers);
    }
  };

  const handleBusNumberChange = (index, value) => {
    const newBusNumbers = [...busNumbers];
    newBusNumbers[index] = value;
    setBusNumbers(newBusNumbers);
  };

  const handleRegistrationNumberChange = (index, value) => {
    const newRegistrationNumbers = [...registrationNumbers];
    newRegistrationNumbers[index] = value;
    setRegistrationNumbers(newRegistrationNumbers);
  };

  const handleOwnerSelection = (ownerId) => {
    if (selectedOwners.includes(ownerId)) {
      setSelectedOwners(selectedOwners.filter((id) => id !== ownerId));
    } else {
      setSelectedOwners([...selectedOwners, ownerId]);
    }
  };

  const handleBusSelection = (busId) => {
    if (selectedBuses.includes(busId)) {
      setSelectedBuses(selectedBuses.filter((id) => id !== busId));
    } else {
      setSelectedBuses([...selectedBuses, busId]);
    }
  };

  // Clear messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Get assigned drivers for a bus
  const getAssignedDriversForBus = (busId) => {
    return busDrivers?.filter(
      (driver) => driver.bus && driver.bus._id === busId
    );
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOwnerSearch.cancel();
    };
  }, [debouncedOwnerSearch]);

  // Initialize filtered data
  useEffect(() => {
    setFilteredBusOwners(busOwners);
    setFilteredBusesForSelection(buses);
    setFilteredBuses(buses);
  }, [busOwners, buses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-3 sm:p-4 rounded-xl mr-3 sm:mr-4 shadow-md">
            <FaBus className="text-white text-2xl sm:text-3xl" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-indigo-900">
              Bus Management
            </h2>
            <p className="text-indigo-600 mt-1 text-sm sm:text-base">
              Manage buses, their ownership and driver assignments
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-indigo-500 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                <FaBus className="text-indigo-600 text-lg sm:text-xl" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Total Buses
                </p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-800">
                  {busPagination.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                <FaUserTie className="text-blue-600 text-lg sm:text-xl" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Bus Owners
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-800">
                  {busOwners.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                <FaUser className="text-purple-600 text-lg sm:text-xl" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Assigned Drivers
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-800">
                  {busDrivers?.filter((driver) => driver.bus).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                Bus Management
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Add new buses, update owners, or assign drivers
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowUpdateForm(false);
                  setShowAssignDriverForm(false);
                  resetForm();
                }}
                className="flex items-center justify-center sm:justify-start px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <FaPlus className="mr-2" /> Add New Buses
              </button>
              <button
                onClick={() => {
                  setShowUpdateForm(true);
                  setShowAddForm(false);
                  setShowAssignDriverForm(false);
                  resetForm();
                }}
                className="flex items-center justify-center sm:justify-start px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <FaEdit className="mr-2" /> Update Bus Owners
              </button>
              <button
                onClick={() => {
                  setShowAssignDriverForm(true);
                  setShowAddForm(false);
                  setShowUpdateForm(false);
                  resetForm();
                }}
                className="flex items-center justify-center sm:justify-start px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <FaUserPlus className="mr-2" /> Assign Driver
              </button>
            </div>
          </div>
        </div>

        {/* Add Buses Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-indigo-100 animate-fade-in">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-indigo-900">
                Add New Buses
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Bus input fields */}
              {busNumbers.map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end"
                >
                  <div className="md:col-span-5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Bus Number {index + 1}
                    </label>
                    <input
                      type="text"
                      value={busNumbers[index]}
                      onChange={(e) =>
                        handleBusNumberChange(index, e.target.value)
                      }
                      className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base"
                      placeholder="Enter bus number"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Registration Number {index + 1}
                    </label>
                    <input
                      type="text"
                      value={registrationNumbers[index]}
                      onChange={(e) =>
                        handleRegistrationNumberChange(index, e.target.value)
                      }
                      className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base"
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    {index === 0 ? (
                      <button
                        onClick={addBusField}
                        className="w-full p-2.5 sm:p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md text-sm sm:text-base"
                        title="Add another bus"
                      >
                        <FaPlus />
                      </button>
                    ) : (
                      <button
                        onClick={() => removeBusField(index)}
                        className="w-full p-2.5 sm:p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md text-sm sm:text-base"
                        title="Remove this bus"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Owner selection */}
              <div>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Select Owners
                  </label>
                  <span className="text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                    {selectedOwners.length} selected
                  </span>
                </div>

                {/* Owner search */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <input
                    type="text"
                    value={ownerSearchTerm}
                    onChange={handleOwnerSearchChange}
                    className="pl-9 sm:pl-10 w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base"
                    placeholder="Search owners..."
                  />
                  {ownerSearchTerm && (
                    <button
                      onClick={handleClearOwnerSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>

                {/* Show loading indicator when searching */}
                {isSearchingOwners && (
                  <div className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-lg mb-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-indigo-600 animate-spin"></div>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      Searching owners...
                    </p>
                  </div>
                )}

                {/* Show results only when not searching */}
                {!isSearchingOwners && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {filteredBusOwners.length > 0 ? (
                      filteredBusOwners.map((owner) => (
                        <div
                          key={owner._id}
                          onClick={() => handleOwnerSelection(owner._id)}
                          className={`p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                            selectedOwners.includes(owner._id)
                              ? "border-indigo-500 bg-indigo-50 shadow-md"
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center ${
                                selectedOwners.includes(owner._id)
                                  ? "bg-indigo-500 border-indigo-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedOwners.includes(owner._id) && (
                                <FaCheckCircle className="text-white text-xs" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                {owner.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {owner.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-3 text-gray-500 text-sm">
                        No owners found matching your search
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBuses}
                  disabled={loading}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md text-sm sm:text-base"
                >
                  {loading ? "Adding..." : "Add Buses"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Bus Owners Form */}
        {showUpdateForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100 animate-fade-in">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900">
                Update Bus Owners
              </h3>
              <button
                onClick={() => setShowUpdateForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Bus selection header with count */}
              <div className="flex justify-between items-center">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Select Buses to Update
                </label>
                <span className="text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                  {selectedBuses.length} bus
                  {selectedBuses.length !== 1 ? "es" : ""} selected
                </span>
              </div>

              {/* Bus search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <input
                  type="text"
                  value={localBusSearchTerm}
                  onChange={handleLocalBusSearchChange}
                  className="pl-9 sm:pl-10 w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base"
                  placeholder="Search buses..."
                />
                {localBusSearchTerm && (
                  <button
                    onClick={() => {
                      setLocalBusSearchTerm("");
                      setFilteredBusesForSelection(buses);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>

              {/* Show loading indicator when searching buses */}
              {isSearchingBuses && (
                <div className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-lg mb-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-blue-600 animate-spin"></div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    Searching buses...
                  </p>
                </div>
              )}

              {/* Bus selection */}
              {!isSearchingBuses && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-50">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {filteredBusesForSelection.length > 0 ? (
                      filteredBusesForSelection.map((bus) => (
                        <div
                          key={bus._id}
                          onClick={() => handleBusSelection(bus._id)}
                          className={`p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                            selectedBuses.includes(bus._id)
                              ? "border-indigo-500 bg-indigo-50 shadow-md"
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center ${
                                selectedBuses.includes(bus._id)
                                  ? "bg-indigo-500 border-indigo-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedBuses.includes(bus._id) && (
                                <FaCheckCircle className="text-white text-xs" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                {bus.busNumber} - {bus.registrationNumber}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Current Owners:{" "}
                                {bus.owners && bus.owners.length > 0
                                  ? bus.owners.map((o) => o.name).join(", ")
                                  : "None"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-gray-500 text-sm">
                        No buses found matching your search
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Owner selection */}
              <div>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Select New Owners
                  </label>
                  <span className="text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                    {selectedOwners.length} selected
                  </span>
                </div>

                {/* Owner search */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <input
                    type="text"
                    value={ownerSearchTerm}
                    onChange={handleOwnerSearchChange}
                    className="pl-9 sm:pl-10 w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base"
                    placeholder="Search owners..."
                  />
                  {ownerSearchTerm && (
                    <button
                      onClick={handleClearOwnerSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>

                {/* Show loading indicator when searching */}
                {isSearchingOwners && (
                  <div className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-lg mb-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-indigo-600 animate-spin"></div>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      Searching owners...
                    </p>
                  </div>
                )}

                {/* Show results only when not searching */}
                {!isSearchingOwners && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {filteredBusOwners.length > 0 ? (
                      filteredBusOwners.map((owner) => (
                        <div
                          key={owner._id}
                          onClick={() => handleOwnerSelection(owner._id)}
                          className={`p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                            selectedOwners.includes(owner._id)
                              ? "border-indigo-500 bg-indigo-50 shadow-md"
                              : "border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center ${
                                selectedOwners.includes(owner._id)
                                  ? "bg-indigo-500 border-indigo-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedOwners.includes(owner._id) && (
                                <FaCheckCircle className="text-white text-xs" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                {owner.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {owner.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-3 text-gray-500 text-sm">
                        No owners found matching your search
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBuses}
                  disabled={loading || selectedBuses.length === 0}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md text-sm sm:text-base"
                >
                  {loading ? "Updating..." : "Update Bus Owners"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Driver Form */}
        {showAssignDriverForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-100 animate-fade-in">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-purple-900">
                Assign Driver to Bus
              </h3>
              <button
                onClick={() => setShowAssignDriverForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Bus selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Select Bus
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {buses.map((bus) => (
                    <div
                      key={bus._id}
                      onClick={() => setSelectedBusForDriver(bus._id)}
                      className={`p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                        selectedBusForDriver === bus._id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center ${
                            selectedBusForDriver === bus._id
                              ? "bg-purple-500 border-purple-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedBusForDriver === bus._id && (
                            <FaCheckCircle className="text-white text-xs" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-xs sm:text-sm">
                            {bus.busNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {bus.registrationNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver selection */}
              <div>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Select Driver
                  </label>
                  <span className="text-xs sm:text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                    {selectedDriver ? "1 selected" : "0 selected"}
                  </span>
                </div>

                {/* Driver search */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <input
                    type="text"
                    value={driverSearchTerm}
                    onChange={(e) => setDriverSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm sm:text-base"
                    placeholder="Search drivers..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {filteredDrivers.length > 0 ? (
                    filteredDrivers.map((driver) => (
                      <div
                        key={driver._id}
                        onClick={() => setSelectedDriver(driver._id)}
                        className={`p-2 sm:p-3 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                          selectedDriver === driver._id
                            ? "border-purple-500 bg-purple-50 shadow-md"
                            : driver.bus
                            ? "border-gray-200 opacity-70 cursor-not-allowed"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                        title={
                          driver.bus
                            ? "This driver is already assigned to a bus"
                            : ""
                        }
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center ${
                              selectedDriver === driver._id
                                ? "bg-purple-500 border-purple-500"
                                : driver.bus
                                ? "border-gray-300 bg-gray-100"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedDriver === driver._id && (
                              <FaCheckCircle className="text-white text-xs" />
                            )}
                            {driver.bus && selectedDriver !== driver._id && (
                              <FaTimes className="text-gray-500 text-xs" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-xs sm:text-sm">
                              {driver.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {driver.licenseNumber}
                            </p>
                            {driver.bus && (
                              <p className="text-xs text-red-500 mt-1">
                                Already assigned to: {driver.bus.busNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-3 text-gray-500 text-sm">
                      No drivers found matching your search
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAssignDriverForm(false)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDriver}
                  disabled={loading || !selectedBusForDriver || !selectedDriver}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-600 text-white rounded-lg sm:rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-md text-sm sm:text-base"
                >
                  {loading ? "Assigning..." : "Assign Driver"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaSearch className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <input
                type="text"
                value={busSearchTerm}
                onChange={handleBusSearchChange}
                className="pl-10 sm:pl-11 w-full p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base"
                placeholder="Search buses by number, registration, owner, or driver..."
              />
              {busSearchTerm && (
                <button
                  onClick={() => onBusSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">
                Filter:
              </span>
              <div className="flex bg-gray-100 p-1 rounded-lg sm:rounded-xl w-full md:w-auto">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors flex-1 md:flex-none ${
                    activeFilter === "all"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-indigo-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("linked")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors flex-1 md:flex-none ${
                    activeFilter === "linked"
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-600 hover:text-green-700"
                  }`}
                  title="Buses with owners"
                >
                  With Owners
                </button>
                <button
                  onClick={() => setActiveFilter("unlinked")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors flex-1 md:flex-none ${
                    activeFilter === "unlinked"
                      ? "bg-amber-600 text-white shadow-md"
                      : "text-gray-600 hover:text-amber-700"
                  }`}
                  title="Buses without owners"
                >
                  No Owners
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buses Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-indigo-100">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-900">
              All Buses
            </h3>
            <span className="text-xs sm:text-sm text-indigo-700 font-medium bg-indigo-200 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
              {filteredBuses.length} of {busPagination.total} buses
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Bus Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Registration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Ownership Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Assigned Drivers
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBuses.map((bus) => {
                  const assignedDrivers = getAssignedDriversForBus(bus._id);
                  return (
                    <tr
                      key={bus._id}
                      className="hover:bg-indigo-50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2.5 rounded-xl mr-3 group-hover:bg-indigo-200 transition-colors">
                            <FaBus className="text-indigo-600 text-lg" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {bus.busNumber}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {bus._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 font-medium bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                          {bus.registrationNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {bus.owners && bus.owners.length > 0 ? (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaLink className="mr-1" /> Linked
                              </span>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {bus.owners.map((owner) => (
                                  <span
                                    key={owner._id}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                                  >
                                    {owner.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <FaUnlink className="mr-1" /> Unlinked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {assignedDrivers.length > 0 ? (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <FaUser className="mr-1" />{" "}
                                {assignedDrivers.length} Driver(s)
                              </span>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {assignedDrivers.map((driver) => (
                                  <div
                                    key={driver._id}
                                    className="flex items-center"
                                  >
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                      {driver.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        openUnassignModal(driver._id)
                                      }
                                      className="ml-1 text-red-500 hover:text-red-700 text-xs"
                                      title="Unassign driver"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <FaUser className="mr-1" /> No Drivers
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openDeleteModal(bus._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Bus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {paginatedBuses.map((bus) => {
              const assignedDrivers = getAssignedDriversForBus(bus._id);
              return (
                <div
                  key={bus._id}
                  className="border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <FaBus className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {bus.busNumber}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {bus._id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openDeleteModal(bus._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Bus"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">Registration</div>
                      <div className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                        {bus.registrationNumber}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="text-sm">
                        {bus.owners && bus.owners.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaLink className="mr-1" /> Linked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <FaUnlink className="mr-1" /> Unlinked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {bus.owners && bus.owners.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500">Owners</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bus.owners.map((owner) => (
                          <span
                            key={owner._id}
                            className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                          >
                            {owner.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="text-xs text-gray-500">
                      Assigned Drivers
                    </div>
                    <div className="mt-1">
                      {assignedDrivers.length > 0 ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <FaUser className="mr-1" /> {assignedDrivers.length}{" "}
                            Driver(s)
                          </span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {assignedDrivers.map((driver) => (
                              <div
                                key={driver._id}
                                className="flex items-center mt-1"
                              >
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                  {driver.name}
                                </span>
                                <button
                                  onClick={() => openUnassignModal(driver._id)}
                                  className="ml-1 text-red-500 hover:text-red-700 text-xs"
                                  title="Unassign driver"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FaUser className="mr-1" /> No Drivers
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredBuses.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <FaBus className="text-indigo-400 text-xl sm:text-3xl" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No buses found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base px-4">
                {busSearchTerm || activeFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first bus"}
              </p>
              {!busSearchTerm && activeFilter === "all" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  Add Your First Bus
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination - Show backend pagination when searching, local pagination when filtering */}
        {(busPagination.pages > 1 || totalPages > 1) && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md px-4 sm:px-6 py-4 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-700">
                  {busSearchTerm ? (
                    <>
                      Showing{" "}
                      <span className="font-medium">
                        {(busPagination.currentPage - 1) * busPagination.limit +
                          1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          busPagination.currentPage * busPagination.limit,
                          busPagination.total
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{busPagination.total}</span>{" "}
                      results
                    </>
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, filteredBuses.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredBuses.length}
                      </span>{" "}
                      results
                    </>
                  )}
                </p>
              </div>
              <div className="flex space-x-2">
                {busSearchTerm ? (
                  // Backend pagination for search results
                  <>
                    <button
                      onClick={() =>
                        handlePageChange(busPagination.currentPage - 1)
                      }
                      disabled={busPagination.currentPage === 1}
                      className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 transition-colors"
                    >
                      <FaChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Previous
                    </button>
                    <div className="hidden sm:flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, busPagination.pages) },
                        (_, i) => {
                          let pageNum;
                          if (busPagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (busPagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (
                            busPagination.currentPage >=
                            busPagination.pages - 2
                          ) {
                            pageNum = busPagination.pages - 4 + i;
                          } else {
                            pageNum = busPagination.currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${
                                busPagination.currentPage === pageNum
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                              } transition-colors`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                      {busPagination.pages > 5 && (
                        <span className="px-2 py-2">...</span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handlePageChange(busPagination.currentPage + 1)
                      }
                      disabled={
                        busPagination.currentPage >= busPagination.pages
                      }
                      className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 transition-colors"
                    >
                      Next
                      <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    </button>
                  </>
                ) : (
                  // Local pagination for filter results
                  <>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 transition-colors"
                    >
                      <FaChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Previous
                    </button>
                    <div className="hidden sm:flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${
                                currentPage === pageNum
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                              } transition-colors`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                      {totalPages > 5 && <span className="px-2 py-2">...</span>}
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 transition-colors"
                    >
                      Next
                      <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 sm:mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError("")}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 sm:mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccess("")}
                  className="text-green-500 hover:text-green-700"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteBus}
          message="Are you sure you want to delete this bus? This action cannot be undone."
          confirmText="Delete Bus"
          cancelText="Cancel"
          loading={deleteLoading}
        />

        <ConfirmationModal
          isOpen={showUnassignModal}
          onClose={closeUnassignModal}
          onConfirm={handleUnassignDriver}
          message="Are you sure you want to unassign this driver from the bus?"
          confirmText="Unassign Driver"
          cancelText="Cancel"
          loading={loading}
        />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BusManagementTab;

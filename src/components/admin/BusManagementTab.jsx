import { useState, useEffect } from "react";
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
} from "react-icons/fa";

const BusManagementTab = ({
  busOwners,
  buses,
  onFetchBuses,
  onFetchBusOwners,
  onAddBuses,
  onUpdateBuses,
  onDeleteBus,
  loading,
  showSnackbar,
}) => {
  // State management
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // all, linked, unlinked

  // Form states
  const [busNumbers, setBusNumbers] = useState([""]);
  const [registrationNumbers, setRegistrationNumbers] = useState([""]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredBuses.length / pageSize);
  const paginatedBuses = filteredBuses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Filter buses based on search term and active filter
  useEffect(() => {
    let filtered = buses;

    // Apply status filter
    if (activeFilter === "linked") {
      filtered = filtered.filter((bus) => bus.owners && bus.owners.length > 0);
    } else if (activeFilter === "unlinked") {
      filtered = filtered.filter(
        (bus) => !bus.owners || bus.owners.length === 0
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (bus) =>
          bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bus.registrationNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (bus.owners &&
            bus.owners.some(
              (owner) =>
                owner.name &&
                owner.name.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    setFilteredBuses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, buses, activeFilter]);

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

  const handleDeleteBus = async (busId) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      try {
        setError("");
        await onDeleteBus(busId);
        setSuccess("Bus deleted successfully!");
      } catch (err) {
        setError(err.message || "Failed to delete bus");
      }
    }
  };

  const resetForm = () => {
    setBusNumbers([""]);
    setRegistrationNumbers([""]);
    setSelectedOwners([]);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 rounded-xl mr-4 shadow-md">
            <FaBus className="text-white text-3xl" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-indigo-900">
              Bus Management
            </h2>
            <p className="text-indigo-600 mt-1">
              Manage buses and their ownership
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <FaBus className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Buses</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {buses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <FaUserTie className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Bus Owners</p>
                <p className="text-2xl font-bold text-blue-800">
                  {busOwners.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl mr-4">
                <FaLink className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Linked Buses
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {
                    buses.filter((bus) => bus.owners && bus.owners.length > 0)
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-xl mr-4">
                <FaUnlink className="text-amber-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Unlinked Buses
                </p>
                <p className="text-2xl font-bold text-amber-800">
                  {
                    buses.filter(
                      (bus) => !bus.owners || bus.owners.length === 0
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Bus Management
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Add new buses or update existing ones
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowUpdateForm(false);
                  resetForm();
                }}
                className="flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
              >
                <FaPlus className="mr-2" /> Add New Buses
              </button>
              <button
                onClick={() => {
                  setShowUpdateForm(true);
                  setShowAddForm(false);
                }}
                className="flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <FaEdit className="mr-2" /> Update Bus Owners
              </button>
            </div>
          </div>
        </div>

        {/* Add Buses Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-indigo-900">
                Add New Buses
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Bus input fields */}
              {busNumbers.map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                >
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus Number {index + 1}
                    </label>
                    <input
                      type="text"
                      value={busNumbers[index]}
                      onChange={(e) =>
                        handleBusNumberChange(index, e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter bus number"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number {index + 1}
                    </label>
                    <input
                      type="text"
                      value={registrationNumbers[index]}
                      onChange={(e) =>
                        handleRegistrationNumberChange(index, e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    {index === 0 ? (
                      <button
                        onClick={addBusField}
                        className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                        title="Add another bus"
                      >
                        <FaPlus />
                      </button>
                    ) : (
                      <button
                        onClick={() => removeBusField(index)}
                        className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Owners
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                  {busOwners.map((owner) => (
                    <div
                      key={owner._id}
                      onClick={() => handleOwnerSelection(owner._id)}
                      className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedOwners.includes(owner._id)
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center ${
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
                          <p className="font-medium text-gray-900">
                            {owner.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {owner.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBuses}
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {loading ? "Adding..." : "Add Buses"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Bus Owners Form */}
        {showUpdateForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-900">
                Update Bus Owners
              </h3>
              <button
                onClick={() => setShowUpdateForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Bus selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Buses to Update
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="grid grid-cols-1 gap-3">
                    {buses.map((bus) => (
                      <div
                        key={bus._id}
                        onClick={() => handleBusSelection(bus._id)}
                        className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedBuses.includes(bus._id)
                            ? "border-indigo-500 bg-indigo-50 shadow-md"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center ${
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
                            <p className="font-medium text-gray-900">
                              {bus.busNumber} - {bus.registrationNumber}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Current Owners:{" "}
                              {bus.owners && bus.owners.length > 0
                                ? bus.owners.map((o) => o.name).join(", ")
                                : "None"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Owner selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Owners
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                  {busOwners.map((owner) => (
                    <div
                      key={owner._id}
                      onClick={() => handleOwnerSelection(owner._id)}
                      className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedOwners.includes(owner._id)
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center ${
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
                          <p className="font-medium text-gray-900">
                            {owner.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {owner.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUpdateForm(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBuses}
                  disabled={loading || selectedBuses.length === 0}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {loading ? "Updating..." : "Update Bus Owners"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaSearch className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Search buses by number, registration, or owner..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">Filter:</span>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeFilter === "all"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-indigo-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("linked")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeFilter === "linked"
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-600 hover:text-green-700"
                  }`}
                >
                  Linked
                </button>
                <button
                  onClick={() => setActiveFilter("unlinked")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeFilter === "unlinked"
                      ? "bg-amber-600 text-white shadow-md"
                      : "text-gray-600 hover:text-amber-700"
                  }`}
                >
                  Unlinked
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buses Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-900">All Buses</h3>
            <span className="text-sm text-indigo-700 font-medium bg-indigo-200 px-3 py-1 rounded-full">
              {paginatedBuses.length} of {filteredBuses.length} buses
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Bus Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Registration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Ownership Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBuses.map((bus) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteBus(bus._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Bus"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredBuses.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <FaBus className="text-indigo-400 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No buses found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm || activeFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first bus"}
              </p>
              {!searchTerm && activeFilter === "all" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Your First Bus
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-md px-6 py-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, filteredBuses.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredBuses.length}</span>{" "}
                  results
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 transition-colors"
                >
                  <FaChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <div className="hidden md:flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2 py-2">...</span>}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 transition-colors"
                >
                  Next
                  <FaChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
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
          <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
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

import { useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUser,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const RequestHistoryTab = ({
  requestHistory,
  totalRequests,
  currentPage,
  pageSize,
  onPageChange,
}) => {
  const [expandedRequest, setExpandedRequest] = useState(null);
  const totalPages = Math.ceil(totalRequests / pageSize);

  const renderRequestStatus = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return status;
    }
  };

  const getRequestIcon = (type) => {
    return type === "CHECKPOST_CREATE" ? (
      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
        <FaPlus className="h-4 w-4" />
      </div>
    ) : (
      <div className="p-2 rounded-lg bg-red-100 text-red-600">
        <FaTrash className="h-4 w-4" />
      </div>
    );
  };

  const getRequestTypeLabel = (type) => {
    return type === "CHECKPOST_CREATE"
      ? "Create CheckPost"
      : "Delete CheckPost";
  };

  const renderRequestDetails = (request) => {
    if (request.status === "REJECTED") {
      return (
        <div className="text-sm text-gray-600 italic">
          Request was rejected - payload details hidden
        </div>
      );
    }

    if (request.status === "APPROVED" && request.approvedDocumentId) {
      return (
        <div className="text-sm text-gray-600">
          Request was approved and processed successfully
        </div>
      );
    }

    if (request.requestType === "CHECKPOST_CREATE") {
      return (
        <div className="space-y-2">
          <div className="flex items-center">
            <FaUser className="text-indigo-500 mr-2 text-sm" />
            <span className="text-sm font-medium">Username:</span>
            <span className="ml-2 text-sm text-gray-700">
              {request.payload.username}
            </span>
          </div>
          <div className="flex items-center">
            <FaFileAlt className="text-indigo-500 mr-2 text-sm" />
            <span className="text-sm font-medium">Location:</span>
            <span className="ml-2 text-sm text-gray-700">
              {request.payload.checkPostLocation}
            </span>
          </div>
          <div className="flex items-center">
            <FaUser className="text-indigo-500 mr-2 text-sm" />
            <span className="text-sm font-medium">Role:</span>
            <span className="ml-2 text-sm text-gray-700">
              {request.payload.role}
            </span>
          </div>
        </div>
      );
    } else if (request.requestType === "CHECKPOST_DELETE") {
      return (
        <div className="text-sm text-gray-700">
          Delete request for CheckPost ID: {request.payload.id}
        </div>
      );
    }

    return (
      <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
        {JSON.stringify(request.payload, null, 2)}
      </pre>
    );
  };

  const toggleExpandRequest = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <FaFileAlt className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-indigo-900">
              Request History
            </h2>
            <p className="text-indigo-600">
              Complete history of all checkpost requests
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <FaFileAlt className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {totalRequests}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-800">
                  {requestHistory.filter((r) => r.status === "APPROVED").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <FaTimesCircle className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-800">
                  {requestHistory.filter((r) => r.status === "REJECTED").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <FaClock className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {requestHistory.filter((r) => r.status === "PENDING").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {requestHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FaFileAlt className="text-indigo-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Request History
            </h3>
            <p className="text-gray-500">
              There are no requests in the history yet.
            </p>
          </div>
        ) : (
          <>
            {/* Requests Table/Cards */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  All Requests
                </h3>
                <span className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalRequests)} of{" "}
                  {totalRequests} requests
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
                        Request Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Requested By
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Details
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requestHistory.map((request) => (
                      <tr
                        key={request._id}
                        className={`hover:bg-indigo-50 transition-colors duration-150 ${
                          request.status === "APPROVED"
                            ? "bg-green-50 hover:bg-green-100"
                            : request.status === "REJECTED"
                            ? "bg-red-50 hover:bg-red-100"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRequestIcon(request.requestType)}
                            <div className="ml-3 text-sm font-medium text-gray-900">
                              {getRequestTypeLabel(request.requestType)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaUser className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {request.requestedBy?.username || "Unknown"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderRequestStatus(request.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-md">
                            {renderRequestDetails(request)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                          <div className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {requestHistory.map((request) => (
                  <div
                    key={request._id}
                    className={`border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors duration-150 ${
                      request.status === "APPROVED"
                        ? "bg-green-50 hover:bg-green-100"
                        : request.status === "REJECTED"
                        ? "bg-red-50 hover:bg-red-100"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        {getRequestIcon(request.requestType)}
                        <div>
                          <div className="font-medium text-gray-900">
                            {getRequestTypeLabel(request.requestType)}
                          </div>
                          <div className="text-xs text-gray-500">
                            By: {request.requestedBy?.username || "Unknown"}
                          </div>
                        </div>
                      </div>
                      {renderRequestStatus(request.status)}
                    </div>

                    <div className="mb-3 text-sm text-gray-600">
                      {renderRequestDetails(request)}
                    </div>

                    <div className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleString()}
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
                      <span className="font-medium">{totalRequests}</span> total
                      requests
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={() => onPageChange(currentPage + 1)}
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
                          onClick={() => onPageChange(page)}
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
      </div>
    </div>
  );
};

export default RequestHistoryTab;

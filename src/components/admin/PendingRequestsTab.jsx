import {
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaClock,
  FaFileAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const PendingRequestsTab = ({
  pendingRequests,
  onApproveRequest,
  onRejectRequest,
}) => {
  const getRequestTypeDetails = (request) => {
    if (request.requestType === "CHECKPOST_CREATE") {
      return (
        <div className="space-y-2">
          <div className="flex items-center">
            <FaUser className="text-indigo-500 mr-2" />
            <span className="font-medium">Username:</span>
            <span className="ml-2">{request.payload.username}</span>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-indigo-500 mr-2" />
            <span className="font-medium">Location:</span>
            <span className="ml-2">{request.payload.checkPostLocation}</span>
          </div>
          <div className="flex items-center">
            <FaIdCard className="text-indigo-500 mr-2" />
            <span className="font-medium">Role:</span>
            <span className="ml-2">{request.payload.role}</span>
          </div>
        </div>
      );
    } else if (request.requestType === "CHECKPOST_DELETE") {
      return (
        <div className="space-y-2">
          <div className="flex items-center">
            <FaUser className="text-indigo-500 mr-2" />
            <span className="font-medium">CheckPost ID:</span>
            <span className="ml-2">{request.payload.id}</span>
          </div>
          <div className="text-sm text-gray-600">
            Requested deletion of checkpost account
          </div>
        </div>
      );
    }
    return (
      <pre className="bg-gray-100 p-2 rounded max-h-24 overflow-y-auto text-xs">
        {JSON.stringify(request.payload, null, 2)}
      </pre>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <FaClock className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-indigo-900">
              Pending Approval Requests
            </h2>
            <p className="text-indigo-600">
              Review and manage checkpost requests
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="text-indigo-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-500">
              There are no pending requests at the moment.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <FaFileAlt className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                    <p className="text-2xl font-bold text-indigo-800">
                      {pendingRequests.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FaPlus className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Creation Requests</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {
                        pendingRequests.filter(
                          (r) => r.requestType === "CHECKPOST_CREATE"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-lg mr-4">
                    <FaTrash className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deletion Requests</p>
                    <p className="text-2xl font-bold text-red-800">
                      {
                        pendingRequests.filter(
                          (r) => r.requestType === "CHECKPOST_DELETE"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Table/Cards */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  Requests Awaiting Review
                </h3>
                <span className="text-sm text-gray-500">
                  {pendingRequests.length} requests pending approval
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
                        Details
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
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
                    {pendingRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-indigo-50 transition-colors duration-150"
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
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {getRequestTypeDetails(request)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                          <div className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => onApproveRequest(request._id)}
                              className="inline-flex items-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            >
                              <FaCheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => onRejectRequest(request._id)}
                              className="inline-flex items-center px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            >
                              <FaTimesCircle className="h-4 w-4 mr-1" />
                              Reject
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
                {pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors duration-150"
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
                      <div className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mb-4 text-sm text-gray-600">
                      {getRequestTypeDetails(request)}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onApproveRequest(request._id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                      >
                        <FaCheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectRequest(request._id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        <FaTimesCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingRequestsTab;

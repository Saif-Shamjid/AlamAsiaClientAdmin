import {
  FaCog,
  FaDatabase,
  FaSync,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const RequestSettingsTab = ({ requestTypes, onUpdateRequestType }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <FaCog className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-indigo-900">
              Request Settings
            </h2>
            <p className="text-indigo-600">
              Configure auto-approval settings for different request types
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <FaDatabase className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Request Types</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {requestTypes.length}
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
                <p className="text-sm text-gray-500">Auto-Approved</p>
                <p className="text-2xl font-bold text-green-800">
                  {requestTypes.filter((type) => type.isAutoApproved).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <FaSync className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Manual Approval</p>
                <p className="text-2xl font-bold text-blue-800">
                  {requestTypes.filter((type) => !type.isAutoApproved).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-800">
              Request Type Configuration
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Enable or disable auto-approval for different request types
            </p>
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
                    Target Collection
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Auto-Approval Status
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
                {requestTypes.map((type) => (
                  <tr
                    key={type._id}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {type.requestType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaDatabase className="text-gray-400 mr-2 text-sm" />
                        <div className="text-sm text-gray-600">
                          {type.targetCollection}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {type.isAutoApproved ? (
                          <>
                            <FaCheckCircle className="text-green-500 mr-2" />
                            <span className="text-sm font-medium text-green-700">
                              Auto-Approved
                            </span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="text-red-500 mr-2" />
                            <span className="text-sm font-medium text-red-700">
                              Manual Approval
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={type.isAutoApproved}
                            onChange={(e) =>
                              onUpdateRequestType(
                                type.requestType,
                                e.target.checked
                              )
                            }
                          />
                          <div
                            className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer ${
                              type.isAutoApproved
                                ? "peer-checked:bg-green-600"
                                : ""
                            } transition-colors duration-300`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-300 ${
                                type.isAutoApproved
                                  ? "transform translate-x-5"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </label>

                        <button
                          onClick={() =>
                            onUpdateRequestType(
                              type.requestType,
                              !type.isAutoApproved
                            )
                          }
                          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            type.isAutoApproved
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {type.isAutoApproved ? (
                            <>
                              <FaToggleOff className="mr-1" />
                              Disable Auto
                            </>
                          ) : (
                            <>
                              <FaToggleOn className="mr-1" />
                              Enable Auto
                            </>
                          )}
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
            {requestTypes.map((type) => (
              <div
                key={type._id}
                className="border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors duration-150"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {type.requestType}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <FaDatabase className="mr-2" />
                      {type.targetCollection}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {type.isAutoApproved ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      type.isAutoApproved ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {type.isAutoApproved ? "Auto-Approved" : "Manual Approval"}
                  </span>

                  <div className="flex items-center space-x-3">
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={type.isAutoApproved}
                        onChange={(e) =>
                          onUpdateRequestType(
                            type.requestType,
                            e.target.checked
                          )
                        }
                      />
                      <div
                        className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer ${
                          type.isAutoApproved ? "peer-checked:bg-green-600" : ""
                        } transition-colors duration-300`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-300 ${
                            type.isAutoApproved ? "transform translate-x-5" : ""
                          }`}
                        ></div>
                      </div>
                    </label>

                    <button
                      onClick={() =>
                        onUpdateRequestType(
                          type.requestType,
                          !type.isAutoApproved
                        )
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                        type.isAutoApproved
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {type.isAutoApproved ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-indigo-50 rounded-xl p-5 mt-6 border border-indigo-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCog className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                About Auto-Approval
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  When auto-approval is enabled, requests of this type will be
                  automatically processed without requiring manual administrator
                  approval. Use this feature for low-risk operations to
                  streamline workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestSettingsTab;

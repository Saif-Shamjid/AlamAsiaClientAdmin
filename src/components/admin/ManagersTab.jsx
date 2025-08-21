import {
  FaUserShield,
  FaUserPlus,
  FaUser,
  FaTrash,
  FaKey,
  FaIdCard,
} from "react-icons/fa";

const ManagersTab = ({
  managers,
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onCreateUser,
  onDeleteUser,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <FaUserShield className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-indigo-900">
              Manager Accounts
            </h2>
            <p className="text-indigo-600">
              Create and manage administrator accounts
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <FaUserShield className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Managers</p>
                <p className="text-2xl font-bold text-indigo-800">
                  {managers.length}
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
                  {managers.length}
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
                <p className="text-sm text-gray-500">Admin Role</p>
                <p className="text-2xl font-bold text-green-800">
                  {managers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Manager Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <FaUserPlus className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Create New Manager
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaKey className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={onCreateUser}
                disabled={!username || !password}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <FaUserPlus className="mr-2" />
                Create Manager
              </button>
            </div>
          </div>
        </div>

        {managers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FaUserShield className="text-indigo-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Managers Found
            </h3>
            <p className="text-gray-500">
              Create your first manager account to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                All Manager Accounts
              </h3>
              <span className="text-sm text-gray-500">
                {managers.length} manager accounts
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
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
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
                  {managers.map((manager) => (
                    <tr
                      key={manager._id}
                      className="hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <FaUser className="text-indigo-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {manager.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {manager.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onDeleteUser(manager._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center justify-end w-full"
                        >
                          <FaTrash className="mr-1" />
                          Delete Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {managers.map((manager) => (
                <div
                  key={manager._id}
                  className="border-b border-gray-200 p-4 hover:bg-indigo-50 transition-colors duration-150"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center mb-2">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <FaUser className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {manager.username}
                        </div>
                        <div className="text-sm text-indigo-600">
                          {manager.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteUser(manager._id)}
                      className="text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Card */}
        <div className="bg-indigo-50 rounded-xl p-5 mt-6 border border-indigo-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaUserShield className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                About Manager Accounts
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  Manager accounts have administrative privileges to review
                  requests, manage checkposts, and configure system settings.
                  Use strong passwords and limit account creation to trusted
                  personnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagersTab;

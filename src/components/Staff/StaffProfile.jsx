import { useState, useEffect } from "react";
import {
  FaUser,
  FaPhone,
  FaTimes,
  FaFilePdf,
  FaEnvelope,
  FaBriefcase,
  FaMapMarkerAlt,
  FaIdCard,
  FaUpload,
  FaTrash,
  FaEye,
  FaEdit,
  FaSave,
  FaCamera,
  FaBuilding,
  FaUserTag,
} from "react-icons/fa";
import FileUploadModal from "../shared/FileUploadModal";
import PdfPreviewModal from "../shared/PdfPreviewModal";
import ImageUploadModal from "../shared/ImageUploadModal";
import ConfirmationModal from "../shared/ConfirmationModal";
import api from "../../services/api";
import Snackbar from "../shared/Snackbar";

// Main Staff Profile Component
const StaffProfile = ({
  staff,
  onClose,
  fetchStaffData,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    department: "",
    role: "",
    address: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Initialize editedStaff when staff changes
  useEffect(() => {
    if (staff) {
      setEditedStaff({
        name: staff.name || "",
        phoneNumber: staff.phoneNumber || "",
        email: staff.email || "",
        department: staff.department || "",
        role: staff.role || "",
        address: staff.address || "",
      });
    }
  }, [staff]);

  // Show snackbar function
  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
  };

  // Close snackbar function
  const closeSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "success" });
  };

  const handleUploadDocument = async (formData, staffId) => {
    try {
      setLoading(true);
      await api.post(`/staff/${staffId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh staff data to show the new document
      if (fetchStaffData) fetchStaffData(staffId);
      setShowUploadModal(false);
      showSnackbar("Document uploaded successfully", "success");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to upload document",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      setLoading(true);
      await api.delete(`/staff/${staff._id}/documents/${docId}`);

      // Refresh staff data to reflect the deletion
      if (fetchStaffData) fetchStaffData(staff._id);
      showSnackbar("Document deleted successfully", "success");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to delete document",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    try {
      setLoading(true);
      await onUpdateStaff(staff._id, {
        name: editedStaff.name,
        phoneNumber: editedStaff.phoneNumber,
        email: editedStaff.email,
        department: editedStaff.department,
        role: editedStaff.role,
        address: editedStaff.address,
      });

      showSnackbar("Staff information updated successfully", "success");
      setIsEditing(false);

      // Refresh staff data
      if (fetchStaffData) fetchStaffData(staff._id);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to update staff information",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async (formData, staffId) => {
    try {
      setLoading(true);
      await api.post(`/staff/${staffId}/profile-pic`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh staff data to show the new profile picture
      if (fetchStaffData) fetchStaffData(staffId);
      setShowImageUploadModal(false);
      showSnackbar("Profile picture updated successfully", "success");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to upload profile picture",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      setLoading(true);
      await api.delete(`/staff/${staff._id}/profile-pic`);

      // Refresh staff data
      if (fetchStaffData) fetchStaffData(staff._id);
      showSnackbar("Profile picture deleted successfully", "success");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to delete profile picture",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = (doc) => {
    setPreviewDocument(doc);
    setShowPdfPreview(true);
  };

  // Confirmation modal handlers
  const showDeleteDocumentConfirmation = (docId) => {
    setConfirmAction(() => handleDeleteDocument);
    setConfirmData(docId);
    setConfirmMessage("Are you sure you want to delete this document?");
    setShowConfirmModal(true);
  };

  const showDeleteProfilePictureConfirmation = () => {
    setConfirmAction(() => handleDeleteProfilePicture);
    setConfirmData(null);
    setConfirmMessage("Are you sure you want to delete the profile picture?");
    setShowConfirmModal(true);
  };

  const showDeleteStaffConfirmation = () => {
    setConfirmAction(() => onDeleteStaff);
    setConfirmData(staff._id);
    setConfirmMessage("Are you sure you want to delete this staff member?");
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      if (confirmData) {
        confirmAction(confirmData);
      } else {
        confirmAction();
      }
    }
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-3 rounded-lg mr-4">
              <FaUser className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-indigo-900">
                Staff Profile
              </h2>
              <p className="text-indigo-600">View and manage staff details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white p-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-600 text-xl" />
          </button>
        </div>

        {/* Loading overlay */}
        {loading && !showUploadModal && !showImageUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p>Processing...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                    {staff.profilePic?.url ? (
                      <img
                        src={`http://31.97.70.167:3000/${staff.profilePic.url}`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-indigo-400 text-5xl" />
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2">
                    {staff.profilePic?.url ? (
                      <button
                        onClick={showDeleteProfilePictureConfirmation}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Delete profile picture"
                        disabled={loading}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowImageUploadModal(true)}
                        className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                        title="Upload profile picture"
                      >
                        <FaCamera className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="w-full">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedStaff.name}
                        onChange={(e) =>
                          setEditedStaff({
                            ...editedStaff,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editedStaff.phoneNumber}
                        onChange={(e) =>
                          setEditedStaff({
                            ...editedStaff,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedStaff.email}
                        onChange={(e) =>
                          setEditedStaff({
                            ...editedStaff,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editedStaff.department}
                        onChange={(e) =>
                          setEditedStaff({
                            ...editedStaff,
                            department: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={editedStaff.role}
                        onChange={(e) =>
                          setEditedStaff({
                            ...editedStaff,
                            role: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        value={editedStaff.address}
                        onChange={(e) =>
                          setEditedStaff({
                            ...editedStaff,
                            address: e.target.value,
                          })
                        }
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateStaff}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={loading}
                      >
                        <FaSave className="mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {staff.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaPhone className="mr-2" />
                      <span>{staff.phoneNumber}</span>
                    </div>
                    {staff.email && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaEnvelope className="mr-2" />
                        <span>{staff.email}</span>
                      </div>
                    )}
                    {staff.department && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaBuilding className="mr-2" />
                        <span>{staff.department}</span>
                      </div>
                    )}
                    {staff.role && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaUserTag className="mr-2" />
                        <span>{staff.role}</span>
                      </div>
                    )}
                    {staff.employeeId && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <FaIdCard className="mr-2" />
                        <span>ID: {staff.employeeId}</span>
                      </div>
                    )}
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        staff.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      } mb-4`}
                    >
                      {staff.isActive ? "Active" : "Inactive"}
                    </div>
                    <div className="w-full space-y-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                      >
                        <FaEdit className="mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={showDeleteStaffConfirmation}
                        className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                      >
                        <FaTrash className="mr-2" />
                        Delete Staff
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Address Section */}
            {staff.address && !isEditing && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    Address
                  </h3>
                </div>
                <p className="text-gray-700">{staff.address}</p>
              </div>
            )}
          </div>

          {/* Right Column - Documents */}
          <div className="lg:col-span-2">
            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaFilePdf className="mr-2 text-red-600" />
                  Documents ({staff.documents?.length || 0})
                </h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading}
                >
                  <FaUpload className="mr-2" />
                  Upload
                </button>
              </div>

              {staff.documents?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staff.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 relative group transition-all duration-200 hover:shadow-md"
                    >
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handlePreviewDocument(doc)}
                          className="text-blue-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Preview Document"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() =>
                            showDeleteDocumentConfirmation(doc._id)
                          }
                          className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          disabled={loading}
                          title="Delete Document"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <FaFilePdf className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">
                            {doc.name}
                          </span>
                          <p className="text-xs text-gray-500">
                            {(doc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        Uploaded:{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 text-sm hover:underline font-medium inline-flex items-center"
                        >
                          View
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                        <button
                          onClick={() => handlePreviewDocument(doc)}
                          className="text-blue-600 text-sm hover:underline font-medium"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FaFilePdf className="text-gray-400 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500">No documents uploaded yet.</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Upload your first document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadDocument}
        ownerId={staff._id}
        loading={loading}
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onUpload={handleUploadProfilePicture}
        ownerId={staff._id}
        loading={loading}
        title="Upload Profile Picture"
        aspectRatio={1} // Square aspect ratio for profile pictures
        maxWidth={500} // Max width for profile pictures
      />

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        document={previewDocument}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        message={confirmMessage}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={loading}
      />

      {/* Snackbar Component */}
      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={closeSnackbar}
        />
      )}
    </div>
  );
};

export default StaffProfile;

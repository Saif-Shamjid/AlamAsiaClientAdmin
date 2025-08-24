import { useState, useRef, useEffect } from "react";
import {
  FaBus,
  FaUser,
  FaPhone,
  FaTimes,
  FaFilePdf,
  FaStickyNote,
  FaCar,
  FaUpload,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaEdit,
  FaSave,
  FaCamera,
  FaIdCard,
} from "react-icons/fa";
import FileUploadModal from "../shared/FileUploadModal";
import PdfPreviewModal from "../shared/PdfPreviewModal";
import ImageUploadModal from "../shared/ImageUploadModal";
import ConfirmationModal from "../shared/ConfirmationModal";
import api from "../../services/api";
import Snackbar from "../shared/Snackbar";

// Main Bus Driver Profile Component
const BusDriverProfile = ({ driver, onClose, fetchDriverData }) => {
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [notesScrollPosition, setNotesScrollPosition] = useState(0);
  const [documentsScrollPosition, setDocumentsScrollPosition] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDriver, setEditedDriver] = useState({
    name: "",
    phoneNumber: "",
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

  // Initialize editedDriver when driver changes
  useEffect(() => {
    if (driver) {
      setEditedDriver({
        name: driver.name || "",
        phoneNumber: driver.phoneNumber || "",
      });
    }
  }, [driver]);

  // Show snackbar function
  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
  };

  // Close snackbar function
  const closeSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "success" });
  };

  const handleUploadDocument = async (formData, driverId) => {
    try {
      setLoading(true);
      await api.post(`/busdrivers/${driverId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh driver data to show the new document
      if (fetchDriverData) fetchDriverData(driverId);
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
      await api.delete(`/busdrivers/${driver._id}/documents/${docId}`);

      // Refresh driver data to reflect the deletion
      if (fetchDriverData) fetchDriverData(driver._id);
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

  const handleUpdateDriver = async () => {
    try {
      setLoading(true);
      await api.put(`/busdrivers/${driver._id}`, {
        name: editedDriver.name,
        phoneNumber: editedDriver.phoneNumber,
      });

      showSnackbar("Driver information updated successfully", "success");
      setIsEditing(false);

      // Refresh driver data
      if (fetchDriverData) fetchDriverData(driver._id);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to update driver information",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async (formData, driverId) => {
    try {
      setLoading(true);
      await api.post(`/busdrivers/${driverId}/profile-pic`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh driver data to show the new profile picture
      if (fetchDriverData) fetchDriverData(driverId);
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
      await api.delete(`/busdrivers/${driver._id}/profile-pic`);

      // Refresh driver data
      if (fetchDriverData) fetchDriverData(driver._id);
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

  const scrollDocuments = (direction) => {
    const container = document.getElementById("documents-container");
    const scrollAmount = 300;

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
      setDocumentsScrollPosition(container.scrollLeft - scrollAmount);
    } else {
      container.scrollLeft += scrollAmount;
      setDocumentsScrollPosition(container.scrollLeft + scrollAmount);
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
    setConfirmMessage("Are you sure you want to delete your profile picture?");
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
                Bus Driver Profile
              </h2>
              <p className="text-indigo-600">View and manage driver details</p>
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
                    {driver.profilePic?.url ? (
                      <img
                        src={`http://31.97.70.167:3000/${driver.profilePic.url}`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-indigo-400 text-5xl" />
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2">
                    {driver.profilePic?.url ? (
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
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedDriver.name}
                        onChange={(e) =>
                          setEditedDriver({
                            ...editedDriver,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={editedDriver.phoneNumber}
                        onChange={(e) =>
                          setEditedDriver({
                            ...editedDriver,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateDriver}
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
                      {driver.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaPhone className="mr-2" />
                      <span>{driver.phoneNumber}</span>
                    </div>
                    {driver.bus && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <FaBus className="mr-2" />
                        <span>
                          {driver.bus.busNumber} (
                          {driver.bus.registrationNumber})
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        driver.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      } mb-4`}
                    >
                      {driver.isActive ? "Active" : "Inactive"}
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                    >
                      <FaEdit className="mr-2" />
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Documents and Notes */}
          <div className="lg:col-span-2">
            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaFilePdf className="mr-2 text-red-600" />
                  Documents ({driver.documents?.length || 0})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={loading}
                  >
                    <FaUpload className="mr-2" />
                    Upload
                  </button>
                  {driver.documents?.length > 0 && (
                    <>
                      <button
                        onClick={() => scrollDocuments("left")}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <FaArrowLeft className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => scrollDocuments("right")}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <FaArrowRight className="text-gray-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {driver.documents?.length > 0 ? (
                <div className="relative">
                  <div
                    id="documents-container"
                    className="flex overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    <div className="flex space-x-4">
                      {driver.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="min-w-[250px] max-w-[250px] border border-gray-200 rounded-lg p-4 hover:bg-gray-50 relative group transition-all duration-200 hover:shadow-md"
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
                  </div>
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

            {/* Assigned Bus Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaBus className="mr-2 text-indigo-600" />
                  Assigned Bus
                </h3>
              </div>

              {driver.bus ? (
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <FaBus className="text-indigo-500 text-2xl" />
                    </div>
                    <div className="text-center">
                      <span className="font-medium text-lg block">
                        {driver.bus.busNumber}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {driver.bus.registrationNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FaBus className="text-gray-400 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500">No bus assigned yet.</p>
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
        ownerId={driver._id}
        loading={loading}
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onUpload={handleUploadProfilePicture}
        ownerId={driver._id}
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

      {/* Custom CSS for scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BusDriverProfile;

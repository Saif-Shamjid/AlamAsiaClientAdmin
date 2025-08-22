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
  FaCloudUploadAlt,
  FaFileAlt,
  FaCompressAlt,
  FaEye,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
  FaEdit,
  FaSave,
  FaCamera,
} from "react-icons/fa";
import FileUploadModal from "../shared/FileUploadModal";
import PdfPreviewModal from "../shared/PdfPreviewModal";
import ImageUploadModal from "../shared/ImageUploadModal";
import api from "../../services/api";

// Main Bus Owner Profile Component
const BusOwnerProfile = ({ owner, onClose, fetchOwnerData }) => {
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notesScrollPosition, setNotesScrollPosition] = useState(0);
  const [documentsScrollPosition, setDocumentsScrollPosition] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOwner, setEditedOwner] = useState({
    name: "",
    phoneNumber: "",
  });

  // Initialize editedOwner when owner changes
  useEffect(() => {
    if (owner) {
      setEditedOwner({
        name: owner.name || "",
        phoneNumber: owner.phoneNumber || "",
      });
    }
  }, [owner]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      setError("");
      await api.post(`/busowners/${owner._id}/notes`, {
        content: newNote.trim(),
      });

      setNewNote("");
      // Refresh owner data to show the new note
      if (fetchOwnerData) fetchOwnerData(owner._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (formData, ownerId) => {
    try {
      setLoading(true);
      setError("");

      await api.post(`/busowners/${ownerId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh owner data to show the new document
      if (fetchOwnerData) fetchOwnerData(ownerId);
      setShowUploadModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      setLoading(true);
      setError("");
      await api.delete(`/busowners/${owner._id}/documents/${docId}`);

      // Refresh owner data to reflect the deletion
      if (fetchOwnerData) fetchOwnerData(owner._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      setLoading(true);
      setError("");
      await api.delete(`/busowners/${owner._id}/notes/${noteId}`);

      // Refresh owner data to reflect the deletion
      if (fetchOwnerData) fetchOwnerData(owner._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOwner = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.put(`/busowners/${owner._id}`, {
        name: editedOwner.name,
        phoneNumber: editedOwner.phoneNumber,
      });

      setSuccess("Owner information updated successfully");
      setIsEditing(false);

      // Refresh owner data
      if (fetchOwnerData) fetchOwnerData(owner._id);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update owner information"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async (formData, ownerId) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post(`/busowners/${ownerId}/profile-pic`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh owner data to show the new profile picture
      if (fetchOwnerData) fetchOwnerData(ownerId);
      setShowImageUploadModal(false);
      setSuccess("Profile picture updated successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload profile picture"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const scrollNotes = (direction) => {
    const container = document.getElementById("notes-container");
    const scrollAmount = 300;

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
      setNotesScrollPosition(container.scrollLeft - scrollAmount);
    } else {
      container.scrollLeft += scrollAmount;
      setNotesScrollPosition(container.scrollLeft + scrollAmount);
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
                Bus Owner Profile
              </h2>
              <p className="text-indigo-600">View and manage owner details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white p-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-600 text-xl" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

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
                    {owner.profilePic?.url ? (
                      <img
                        src={`http://31.97.70.167:3000/${owner.profilePic.url}`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-indigo-400 text-5xl" />
                    )}
                  </div>
                  <button
                    onClick={() => setShowImageUploadModal(true)}
                    className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                    title="Change profile picture"
                  >
                    <FaCamera className="text-sm" />
                  </button>
                </div>

                {isEditing ? (
                  <div className="w-full">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedOwner.name}
                        onChange={(e) =>
                          setEditedOwner({
                            ...editedOwner,
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
                        value={editedOwner.phoneNumber}
                        onChange={(e) =>
                          setEditedOwner({
                            ...editedOwner,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateOwner}
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
                      {owner.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaPhone className="mr-2" />
                      <span>{owner.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaBus className="mr-2" />
                      <span>{owner.buses?.length || 0} Buses</span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        owner.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      } mb-4`}
                    >
                      {owner.isActive ? "Active" : "Inactive"}
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

            {/* Add Note Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaStickyNote className="mr-2 text-indigo-600" />
                Add Note
              </h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                rows="3"
                placeholder="Add a note about this bus owner..."
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || loading}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus className="inline mr-2" />
                Add Note
              </button>
            </div>
          </div>

          {/* Right Column - Documents and Notes */}
          <div className="lg:col-span-2">
            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaFilePdf className="mr-2 text-red-600" />
                  Documents ({owner.documents?.length || 0})
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
                  {owner.documents?.length > 0 && (
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

              {owner.documents?.length > 0 ? (
                <div className="relative">
                  <div
                    id="documents-container"
                    className="flex overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    <div className="flex space-x-4">
                      {owner.documents.map((doc, index) => (
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
                              onClick={() => handleDeleteDocument(doc._id)}
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

            {/* Notes Section with Horizontal Scroll */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaStickyNote className="mr-2 text-yellow-600" />
                  Notes ({owner.notes?.length || 0})
                </h3>

                {owner.notes?.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => scrollNotes("left")}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <FaArrowLeft className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => scrollNotes("right")}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <FaArrowRight className="text-gray-600" />
                    </button>
                  </div>
                )}
              </div>

              {owner.notes?.length > 0 ? (
                <div className="relative">
                  <div
                    id="notes-container"
                    className="flex overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    <div className="flex space-x-4">
                      {owner.notes.map((note, index) => (
                        <div
                          key={index}
                          className="min-w-[250px] max-w-[250px] bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg rounded-bl-lg shadow-sm hover:shadow-md transition-shadow relative group"
                        >
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            disabled={loading}
                          >
                            <FaTrash />
                          </button>
                          <div className="mb-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                              <FaStickyNote className="text-amber-500 text-sm" />
                            </div>
                            <p className="text-gray-800 font-medium line-clamp-4">
                              {note.content}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-2 border-t border-amber-100">
                            <p className="text-xs text-amber-700">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-amber-700">
                              {new Date(note.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No notes added yet.
                </p>
              )}
            </div>

            {/* Buses Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaCar className="mr-2 text-indigo-600" />
                Buses ({owner.buses?.length || 0})
              </h3>

              {owner.buses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {owner.buses.map((bus, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center mb-2">
                        <FaCar className="text-indigo-500 mr-2" />
                        <span className="font-medium">
                          {bus.registrationNumber || `Bus ${index + 1}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Capacity: {bus.capacity || "N/A"} seats
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No buses assigned yet.
                </p>
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
        ownerId={owner._id}
        loading={loading}
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onUpload={handleUploadProfilePicture}
        ownerId={owner._id}
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

export default BusOwnerProfile;

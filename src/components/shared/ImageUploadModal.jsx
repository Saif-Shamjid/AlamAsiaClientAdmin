// components/shared/ImageUploadModal.js
import { useState, useRef } from "react";
import { FaTimes, FaCloudUploadAlt, FaCompressAlt } from "react-icons/fa";

const ImageUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  ownerId,
  loading,
  title = "Upload Image",
  aspectRatio = 1,
  maxWidth = 800,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  const optimizeImage = (file, callback) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        // Constrain by max width
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Ensure correct aspect ratio
        if (aspectRatio && aspectRatio > 0) {
          const currentAspect = width / height;
          if (currentAspect !== aspectRatio) {
            if (currentAspect > aspectRatio) {
              // Too wide, adjust height
              height = width / aspectRatio;
            } else {
              // Too tall, adjust width
              width = height * aspectRatio;
            }
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            callback(optimizedFile);
          },
          "image/jpeg",
          0.8 // Quality (0.8 = 80%)
        );
      };
    };

    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    try {
      setError("");

      // Optimize the image before upload
      optimizeImage(selectedFile, (optimizedFile) => {
        const formData = new FormData();
        formData.append("profilePic", optimizedFile);

        // Call the upload function
        onUpload(formData, ownerId);
      });
    } catch (err) {
      setError("Failed to process image");
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <FaCloudUploadAlt className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag & drop an image here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, GIF (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4 relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full">
                  <FaCompressAlt className="text-xs" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Image will be optimized for web before uploading
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="mr-2" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;

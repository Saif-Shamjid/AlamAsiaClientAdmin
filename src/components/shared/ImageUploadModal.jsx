// components/shared/ImageUploadModal.js
import { useState, useRef } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaCompressAlt,
  FaCheckCircle,
} from "react-icons/fa";

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Supported image formats (excluding GIF)
  const supportedFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const acceptedFileTypes = supportedFormats.join(",");

  const validateFile = (file) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }

    // Check if file format is supported
    if (!supportedFormats.includes(file.type.toLowerCase())) {
      return `Unsupported file format. Please use ${supportedFormats
        .map((format) => format.split("/")[1].toUpperCase())
        .join(", ")} files only`;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return "Image must be less than 5MB";
    }

    return null;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
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

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

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
    setIsDragging(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-indigo-200 transition-colors"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 flex items-start">
              <span className="mr-2 mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!previewUrl ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                  : "border-indigo-300 hover:border-indigo-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={acceptedFileTypes}
                className="hidden"
              />
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCloudUploadAlt className="text-indigo-500 text-2xl" />
              </div>
              <p className="text-gray-700 font-medium mb-2">
                {isDragging
                  ? "Drop your image here"
                  : "Drag & drop an image here"}
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
                Browse files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Supports JPG, PNG, WEBP (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center absolute -top-2 -right-2 z-10">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain mx-auto rounded-lg shadow-md"
                />
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-center text-indigo-700 mb-1">
                  <FaCompressAlt className="mr-2" />
                  <span className="text-sm font-medium">
                    Image Optimization
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Your image will be optimized for faster loading
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-5 bg-gray-50 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Optimizing & Uploading...
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="mr-2" />
                Upload Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;

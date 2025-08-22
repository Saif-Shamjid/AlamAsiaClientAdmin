import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FaTimes,
  FaUpload,
  FaCloudUploadAlt,
  FaFileAlt,
  FaCompressAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const FileUploadModal = ({ isOpen, onClose, onUpload, ownerId, loading }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [optimizePdf, setOptimizePdf] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(""); // Clear any previous errors

    if (selectedFile) {
      // Check if file is PDF
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setFile(selectedFile);
      // Set default name if no name is provided
      if (!fileName) {
        setFileName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(""); // Clear any previous errors

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];

      // Check if file is PDF
      if (droppedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        setFile(null);
        return;
      }

      setFile(droppedFile);
      if (!fileName) {
        setFileName(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // PDF optimization function using pdf-lib
  const optimizePdfFile = async (pdfFile) => {
    console.log("Optimizing PDF before upload...");

    try {
      const originalSize = pdfFile.size;

      // Read the file as ArrayBuffer
      const arrayBuffer = await pdfFile.arrayBuffer();

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Optimization techniques:
      // 1. Remove metadata to reduce file size
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("");
      pdfDoc.setCreator("");
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      // 2. Flatten form fields (if any)
      try {
        pdfDoc.getForm().flatten();
      } catch (e) {
        // No form fields to flatten, continue
      }

      // 3. Remove annotations (comments, etc.)
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        try {
          page.node.delete(PDFDocument.of("Annots"));
        } catch (e) {
          // No annotations to remove, continue
        }
      });

      // 4. Save the optimized PDF
      const optimizedPdfBytes = await pdfDoc.save({
        useObjectStreams: true, // Reduces file size
        addDefaultPage: false,
      });

      // Create a new file with the optimized content
      const optimizedFile = new File(
        [optimizedPdfBytes],
        `optimized_${pdfFile.name}`,
        { type: pdfFile.type, lastModified: new Date().getTime() }
      );

      const optimizedSize = optimizedFile.size;
      const reductionPercentage = 1 - optimizedSize / originalSize;

      console.log(
        `Original file size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(
        `Optimized file size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(`Reduced by: ${(reductionPercentage * 100).toFixed(1)}%`);

      return optimizedFile;
    } catch (error) {
      console.error("Optimization failed:", error);
      // Fall back to original file if optimization fails
      return pdfFile;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    if (!file || !fileName.trim()) {
      if (!file) setError("Please select a PDF file");
      return;
    }

    try {
      let fileToUpload = file;

      // Optimize the PDF if the option is enabled
      if (optimizePdf && file.type === "application/pdf") {
        fileToUpload = await optimizePdfFile(file);
        console.log(
          "Uploading optimized file:",
          fileToUpload.name,
          fileToUpload.size
        );
      }

      const formData = new FormData();
      formData.append("document", fileToUpload);
      formData.append("name", fileName.trim());
      formData.append("optimize", optimizePdf);

      await onUpload(formData, ownerId);

      // Reset form
      setFile(null);
      setFileName("");
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Please try again.");
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileName("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <FaCloudUploadAlt className="mr-2" />
            Upload PDF Document
          </h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-indigo-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">
              Document Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter document name"
              required
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4
              ${
                file
                  ? "border-green-500 bg-green-50"
                  : "border-indigo-400 hover:border-indigo-600 hover:bg-indigo-50"
              }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf"
            />

            <div className="flex flex-col items-center justify-center">
              {file ? (
                <>
                  <FaFileAlt className="text-green-500 text-4xl mb-3" />
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {optimizePdf && (
                    <p className="text-xs text-indigo-600 mt-1">
                      Will be optimized before upload
                    </p>
                  )}
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="text-indigo-400 text-4xl mb-3" />
                  <p className="font-medium text-gray-800">
                    Drag & drop your PDF file here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Only PDF files are accepted
                  </p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {error}
            </div>
          )}

          {file && file.type === "application/pdf" && (
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={optimizePdf}
                  onChange={(e) => setOptimizePdf(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 flex items-center">
                  <FaCompressAlt className="mr-1 text-indigo-500" />
                  Optimize PDF (reduce file size)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Removes metadata, flattens forms, and compresses the PDF
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !fileName.trim() || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
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
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploadModal;

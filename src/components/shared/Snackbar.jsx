// components/shared/Snackbar.js
import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

const Snackbar = ({ message, type = "success", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (message && message !== currentMessage) {
      setCurrentMessage(message);
      setIsVisible(true);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose, currentMessage]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentMessage("");
      onClose(); // Notify parent that snackbar should be closed
    }, 300); // Wait for animation to complete
  };

  if (!currentMessage) return null;

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const Icon = type === "success" ? FaCheckCircle : FaExclamationCircle;

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ minWidth: "300px", zIndex: 1000 }}
    >
      <div className="flex items-center">
        <Icon className="mr-2" />
        <span>{currentMessage}</span>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Snackbar;

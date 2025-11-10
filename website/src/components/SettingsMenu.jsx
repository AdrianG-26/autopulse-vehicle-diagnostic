import React, { useState, useRef, useEffect } from "react";
import { changeUserPassword } from "../services/supabase";

export default function SettingsMenu({ userEmail, userId, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowChangePassword(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "currentPassword":
        if (!value) {
          newErrors.currentPassword = "Current password is required";
        } else {
          delete newErrors.currentPassword;
        }
        break;
      case "newPassword":
        if (!value) {
          newErrors.newPassword = "New password is required";
        } else if (value.length < 8) {
          newErrors.newPassword = "Password must be at least 8 characters";
        } else if (value === currentPassword) {
          newErrors.newPassword = "New password must be different from current password";
        } else {
          delete newErrors.newPassword;
        }
        // Re-validate confirm password if it's already filled
        if (confirmPassword) {
          if (value !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== newPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    if (fieldName === "currentPassword") {
      validateField(fieldName, currentPassword);
    } else if (fieldName === "newPassword") {
      validateField(fieldName, newPassword);
    } else if (fieldName === "confirmPassword") {
      validateField(fieldName, confirmPassword);
    }
  };

  const handleChange = (fieldName, value) => {
    if (fieldName === "currentPassword") {
      setCurrentPassword(value);
      if (touched.currentPassword) {
        validateField("currentPassword", value);
      }
    } else if (fieldName === "newPassword") {
      setNewPassword(value);
      if (touched.newPassword) {
        validateField("newPassword", value);
      }
      // Also validate confirm password if it's been touched
      if (touched.confirmPassword) {
        validateField("confirmPassword", confirmPassword);
      }
    } else if (fieldName === "confirmPassword") {
      setConfirmPassword(value);
      if (touched.confirmPassword) {
        validateField("confirmPassword", value);
      }
    }
  };

  const validateForm = () => {
    const allTouched = {
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    const validCurrent = validateField("currentPassword", currentPassword);
    const validNew = validateField("newPassword", newPassword);
    const validConfirm = validateField("confirmPassword", confirmPassword);

    return validCurrent && validNew && validConfirm;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Use userId if available, otherwise use email
      const identifier = userId || userEmail;
      console.log('🔑 Change password - userId:', userId, 'userEmail:', userEmail, 'identifier:', identifier);
      
      if (!identifier) {
        throw new Error('User information not available. Please log out and log back in.');
      }
      
      await changeUserPassword(identifier, currentPassword, newPassword);
      setSuccess("Password changed successfully!");
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setTouched({});
      setTimeout(() => {
        setShowChangePassword(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setErrors({ general: err.message || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* Settings Icon Button */}
      <button
        className="settings-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        🔧
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
            zIndex: 1000,
            border: "1px solid #e5e7eb",
          }}
        >
          {!showChangePassword ? (
            <>
              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setErrors({});
                  setSuccess("");
                  setTouched({});
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#111827",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                🔑 Change Password
              </button>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#e5e7eb",
                }}
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#ef4444",
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#fef2f2")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <div style={{ padding: "16px", minWidth: "320px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                  Change Password
                </h3>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setErrors({});
                    setSuccess("");
                    setTouched({});
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "0",
                    color: "#6b7280",
                  }}
                >
                  ✕
                </button>
              </div>

              {errors.general && (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#fef2f2",
                    color: "#991b1b",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  {errors.general}
                </div>
              )}

              {success && (
                <div
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="current-password"
                    style={{ 
                      display: "block", 
                      marginBottom: "4px", 
                      fontSize: "14px", 
                      color: "#374151",
                      fontWeight: "500"
                    }}
                  >
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "8px 12px",
                      border: touched.currentPassword && errors.currentPassword 
                        ? "1px solid #ef4444" 
                        : "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => {
                      handleBlur("currentPassword");
                      e.target.style.borderColor = touched.currentPassword && errors.currentPassword 
                        ? "#ef4444" 
                        : "#d1d5db";
                    }}
                    required
                  />
                  {touched.currentPassword && errors.currentPassword && (
                    <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="new-password"
                    style={{ 
                      display: "block", 
                      marginBottom: "4px", 
                      fontSize: "14px", 
                      color: "#374151",
                      fontWeight: "500"
                    }}
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "8px 12px",
                      border: touched.newPassword && errors.newPassword 
                        ? "1px solid #ef4444" 
                        : "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => {
                      handleBlur("newPassword");
                      e.target.style.borderColor = touched.newPassword && errors.newPassword 
                        ? "#ef4444" 
                        : "#d1d5db";
                    }}
                    required
                  />
                  {touched.newPassword && errors.newPassword && (
                    <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="confirm-password"
                    style={{ 
                      display: "block", 
                      marginBottom: "4px", 
                      fontSize: "14px", 
                      color: "#374151",
                      fontWeight: "500"
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "8px 12px",
                      border: touched.confirmPassword && errors.confirmPassword 
                        ? "1px solid #ef4444" 
                        : "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => {
                      handleBlur("confirmPassword");
                      e.target.style.borderColor = touched.confirmPassword && errors.confirmPassword 
                        ? "#ef4444" 
                        : "#d1d5db";
                    }}
                    required
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setErrors({});
                      setSuccess("");
                      setTouched({});
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      background: "white",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || Object.keys(errors).length > 0}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "6px",
                      background: (loading || Object.keys(errors).length > 0) ? "#9ca3af" : "#3b82f6",
                      color: "white",
                      cursor: (loading || Object.keys(errors).length > 0) ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      opacity: (loading || Object.keys(errors).length > 0) ? 0.6 : 1,
                    }}
                  >
                    {loading ? "Changing..." : "Change"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

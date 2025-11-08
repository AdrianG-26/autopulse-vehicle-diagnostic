import React, { useEffect, useState } from "react";
import {
  changeUserPassword,
  isSupabaseConfigured,
  updateUserFields,
} from "../services/supabase";

export default function Settings({ onNavigate }) {
  const [apiUrl] = useState(
    process.env.REACT_APP_API_URL || "http://localhost:5000"
  );
  const [pollingStatus, setPollingStatus] = useState("CHECKING");

  // User profile state
  const [userProfile, setUserProfile] = useState({
    email: "",
    username: "",
    currentPasswordForEmail: "",
    currentPasswordForUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [originalProfile, setOriginalProfile] = useState({
    email: "",
    username: "",
  });
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [validFields, setValidFields] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/model-info`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setPollingStatus("CONNECTED");
      } else {
        setPollingStatus("ERROR");
      }
    } catch (error) {
      setPollingStatus("DISCONNECTED");
    }
  };

  useEffect(() => {
    loadUserProfile();
    checkApiConnection();

    // Check API every 2 seconds for faster status updates
    const interval = setInterval(checkApiConnection, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = () => {
    try {
      // Load user profile from localStorage
      const savedAuth = localStorage.getItem("autopulse_auth");
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        const profile = {
          email: authData.email || "",
          username: authData.username || "",
        };
        setUserProfile((prev) => ({
          ...prev,
          ...profile,
        }));
        setOriginalProfile(profile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  // Disposable email domains
  const disposableEmailDomains = [
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "tempmail.com",
    "throwaway.email",
    "temp-mail.org",
    "trashmail.com",
    "fakeinbox.com",
  ];

  // Reserved usernames
  const reservedUsernames = [
    "root",
    "system",
    "administrator",
    "superuser",
    "null",
    "undefined",
    "anonymous",
    "guest",
  ];

  // Common weak passwords
  const commonPasswords = [
    "password",
    "password123",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "monkey",
    "1234567",
    "letmein",
    "trustno1",
    "dragon",
    "baseball",
    "iloveyou",
    "master",
    "sunshine",
    "ashley",
    "bailey",
    "shadow",
  ];

  // Validate email
  const validateEmail = async (email) => {
    email = email.trim().toLowerCase();

    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address";

    // Check if email changed
    if (email === originalProfile.email) return "This is your current email";

    // Check disposable domains
    const domain = email.split("@")[1];
    if (disposableEmailDomains.includes(domain)) {
      return "Disposable email addresses are not allowed";
    }

    // Suggest typo corrections
    const commonDomains = {
      "gmial.com": "gmail.com",
      "gmai.com": "gmail.com",
      "yahooo.com": "yahoo.com",
      "hotmial.com": "hotmail.com",
    };

    if (commonDomains[domain]) {
      return `Did you mean ${email.split("@")[0]}@${commonDomains[domain]}?`;
    }

    // Check if already taken
    try {
      if (isSupabaseConfigured()) {
        const { supabase } = await import("../services/supabase");
        const { data } = await supabase
          .from("users")
          .select("email")
          .eq("email", email)
          .limit(1);

        if (data && data.length > 0) {
          return "This email is already registered";
        }
      } else {
        const existingUsers = JSON.parse(
          localStorage.getItem("autopulse_users") || "[]"
        );
        if (existingUsers.some((u) => u.email === email)) {
          return "This email is already registered";
        }
      }
    } catch (error) {
      console.error("Error checking email:", error);
    }

    return "";
  };

  // Validate username
  const validateUsername = async (username) => {
    username = username.trim();

    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(username))
      return "Username can only contain letters, numbers, underscores, and hyphens";

    // Check if username changed
    if (username === originalProfile.username)
      return "This is your current username";

    // Check consecutive special characters
    if (/[_-]{2,}/.test(username))
      return "Username cannot have consecutive special characters";

    // Check reserved usernames
    if (reservedUsernames.includes(username.toLowerCase()))
      return "This username is reserved";

    // Check if already taken
    try {
      if (isSupabaseConfigured()) {
        const { supabase } = await import("../services/supabase");
        const { data } = await supabase
          .from("users")
          .select("username")
          .eq("username", username)
          .limit(1);

        if (data && data.length > 0) {
          return "This username is already taken";
        }
      } else {
        const existingUsers = JSON.parse(
          localStorage.getItem("autopulse_users") || "[]"
        );
        if (existingUsers.some((u) => u.username === username)) {
          return "This username is already taken";
        }
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }

    return "";
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };

    setPasswordRequirements(requirements);

    if (requirements.length) score += 20;
    if (requirements.uppercase) score += 20;
    if (requirements.lowercase) score += 20;
    if (requirements.number) score += 20;
    if (requirements.special) score += 20;

    let label = "";
    let color = "";

    if (score < 40) {
      label = "Weak";
      color = "#ef4444";
    } else if (score < 60) {
      label = "Fair";
      color = "#f59e0b";
    } else if (score < 80) {
      label = "Good";
      color = "#10b981";
    } else {
      label = "Strong";
      color = "#059669";
    }

    setPasswordStrength({ score, label, color });
  };

  // Validate password
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 50) return "Password must be less than 50 characters";

    if (commonPasswords.includes(password.toLowerCase())) {
      return "This password is too common";
    }

    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    if (!/[@$!%*?&#]/.test(password))
      return "Password must contain at least one special character";

    return "";
  };

  // Legacy function - no longer used (kept for backward compatibility)
  // function save() {
  //   localStorage.setItem("wsUrl", url);
  // }

  const handleProfileUpdate = async (field) => {
    // Set the appropriate loading state
    if (field === "email") setIsLoadingEmail(true);
    else if (field === "username") setIsLoadingUsername(true);
    else if (field === "password") setIsLoadingPassword(true);

    setMessage({ type: "", text: "" });
    setFieldErrors({});

    try {
      const savedAuth = JSON.parse(
        localStorage.getItem("autopulse_auth") || "{}"
      );

      if (field === "email") {
        // Validate email
        const emailError = await validateEmail(userProfile.email);
        if (emailError) {
          throw new Error(emailError);
        }

        // Verify current password
        if (!userProfile.currentPasswordForEmail) {
          throw new Error(
            "Please enter your current password to confirm this change"
          );
        }

        // Verify password matches
        const existingUsers = JSON.parse(
          localStorage.getItem("autopulse_users") || "[]"
        );
        const user = existingUsers.find(
          (u) => u.username === savedAuth.username
        );
        if (user && user.password !== userProfile.currentPasswordForEmail) {
          throw new Error("Current password is incorrect");
        }

        if (isSupabaseConfigured()) {
          await updateUserFields({
            matchUsernameOrEmail: savedAuth.username || savedAuth.email,
            updates: { email: userProfile.email },
          });
        }
        savedAuth.email = userProfile.email;
        localStorage.setItem("autopulse_auth", JSON.stringify(savedAuth));
        setMessage({ type: "success", text: "Email updated successfully!" });
        setUserProfile((prev) => ({ ...prev, currentPasswordForEmail: "" }));
        loadUserProfile();
      } else if (field === "username") {
        // Validate username
        const usernameError = await validateUsername(userProfile.username);
        if (usernameError) {
          throw new Error(usernameError);
        }

        // Verify current password
        if (!userProfile.currentPasswordForUsername) {
          throw new Error(
            "Please enter your current password to confirm this change"
          );
        }

        // Verify password matches
        const existingUsers = JSON.parse(
          localStorage.getItem("autopulse_users") || "[]"
        );
        const user = existingUsers.find(
          (u) => u.username === savedAuth.username
        );
        if (user && user.password !== userProfile.currentPasswordForUsername) {
          throw new Error("Current password is incorrect");
        }

        if (isSupabaseConfigured()) {
          await updateUserFields({
            matchUsernameOrEmail: savedAuth.username || savedAuth.email,
            updates: { username: userProfile.username },
          });
        }

        // Update localStorage users array
        const usersArray = JSON.parse(
          localStorage.getItem("autopulse_users") || "[]"
        );
        const userIdx = usersArray.findIndex(
          (u) => u.username === savedAuth.username
        );
        if (userIdx !== -1) {
          usersArray[userIdx].username = userProfile.username;
          localStorage.setItem("autopulse_users", JSON.stringify(usersArray));
        }

        savedAuth.username = userProfile.username;
        localStorage.setItem("autopulse_auth", JSON.stringify(savedAuth));
        setMessage({ type: "success", text: "Username updated successfully!" });
        setUserProfile((prev) => ({ ...prev, currentPasswordForUsername: "" }));
        loadUserProfile();
      } else if (field === "password") {
        // Verify current password
        if (!userProfile.currentPassword) {
          throw new Error("Please enter your current password");
        }

        // Verify current password matches
        const existingUsers = JSON.parse(
          localStorage.getItem("autopulse_users") || "[]"
        );
        const user = existingUsers.find(
          (u) => u.username === savedAuth.username
        );
        if (user && user.password !== userProfile.currentPassword) {
          throw new Error("Current password is incorrect");
        }

        // Validate new password
        const passwordError = validatePassword(userProfile.newPassword);
        if (passwordError) {
          throw new Error(passwordError);
        }

        if (userProfile.newPassword !== userProfile.confirmPassword) {
          throw new Error("New passwords do not match");
        }

        // Check if new password is same as current
        if (userProfile.newPassword === userProfile.currentPassword) {
          throw new Error(
            "New password must be different from current password"
          );
        }

        if (isSupabaseConfigured()) {
          await changeUserPassword({
            matchUsernameOrEmail: savedAuth.username || savedAuth.email,
            newPassword: userProfile.newPassword,
          });
        } else {
          const userIndex = existingUsers.findIndex(
            (u) =>
              u.username === savedAuth.username || u.email === savedAuth.email
          );
          if (userIndex !== -1) {
            existingUsers[userIndex].password = userProfile.newPassword;
            localStorage.setItem(
              "autopulse_users",
              JSON.stringify(existingUsers)
            );
          }
        }
        setMessage({ type: "success", text: "Password updated successfully!" });

        // Clear all password fields
        setUserProfile((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setPasswordStrength({ score: 0, label: "", color: "" });
        setPasswordRequirements({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        });
      }

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ type: "error", text: error.message });

      // Auto-clear error messages after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
    } finally {
      // Reset the appropriate loading state
      if (field === "email") setIsLoadingEmail(false);
      else if (field === "username") setIsLoadingUsername(false);
      else if (field === "password") setIsLoadingPassword(false);
    }
  };

  // Handle field changes with real-time validation
  const handleFieldChange = (field, value) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));

    // Real-time validation with debounce
    if (field === "newPassword" && value) {
      calculatePasswordStrength(value);

      // Also check if confirm password matches
      if (userProfile.confirmPassword) {
        if (value !== userProfile.confirmPassword) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        } else {
          setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }
      }
    }

    if (field === "confirmPassword") {
      // Check if passwords match
      if (value && userProfile.newPassword) {
        if (value !== userProfile.newPassword) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        } else {
          setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }
      }
    }

    if (field === "email" || field === "username") {
      setTimeout(async () => {
        let error = "";
        if (field === "email") {
          error = await validateEmail(value);
        } else if (field === "username") {
          error = await validateUsername(value);
        }

        if (error) {
          setFieldErrors((prev) => ({ ...prev, [field]: error }));
          setValidFields((prev) => ({ ...prev, [field]: false }));
        } else if (value) {
          setFieldErrors((prev) => ({ ...prev, [field]: "" }));
          setValidFields((prev) => ({ ...prev, [field]: true }));
        }
      }, 800);
    }
  };

  // Legacy function - no longer used (kept for backward compatibility)
  // function readableStatus(s) {
  //   if (s === "na") return "N/A";
  //   return s;
  // }

  const [activeTab, setActiveTab] = useState("connection");

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#0f172a" }}
    >
      {/* Main Page Navigation Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#1e293b",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderRight: "1px solid #334155",
        }}
      >
        <h2
          style={{ margin: "0 0 20px 0", color: "#38bdf8", fontSize: "20px" }}
        >
          🚗 AutoPulse
        </h2>

        <button
          onClick={() => onNavigate("Dashboard")}
          style={{
            padding: "12px",
            backgroundColor: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => onNavigate("Engine")}
          style={{
            padding: "12px",
            backgroundColor: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          🔧 Engine
        </button>

        <button
          onClick={() => onNavigate("Fuel")}
          style={{
            padding: "12px",
            backgroundColor: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          ⛽ Fuel
        </button>

        <button
          onClick={() => onNavigate("Emissions")}
          style={{
            padding: "12px",
            backgroundColor: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          🌿 Emissions
        </button>

        <button
          onClick={() => onNavigate("Logs")}
          style={{
            padding: "12px",
            backgroundColor: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          📋 Logs
        </button>

        <button
          style={{
            padding: "12px",
            backgroundColor: "#334155",
            color: "#38bdf8",
            border: "1px solid #38bdf8",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          ⚙️ Settings
        </button>

        <button
          onClick={() => onNavigate("Contact")}
          style={{
            padding: "12px",
            backgroundColor: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          💬 Support
        </button>
      </div>

      {/* Settings Content Area with its own sidebar */}
      <div style={{ flex: 1, display: "flex", backgroundColor: "#0f172a" }}>
        {/* Settings Internal Sidebar */}
        <div
          style={{
            width: "200px",
            backgroundColor: "#1e293b",
            borderRight: "1px solid #334155",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h1
            style={{
              margin: "0 0 20px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#f1f5f9",
              paddingBottom: "20px",
              borderBottom: "1px solid #334155",
            }}
          >
            Settings
          </h1>

          <button
            onClick={() => setActiveTab("connection")}
            style={{
              padding: "12px",
              backgroundColor:
                activeTab === "connection" ? "#334155" : "#1e293b",
              color: activeTab === "connection" ? "#38bdf8" : "#94a3b8",
              border:
                activeTab === "connection"
                  ? "2px solid #38bdf8"
                  : "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            � API Connection
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "12px",
              backgroundColor: activeTab === "profile" ? "#334155" : "#1e293b",
              color: activeTab === "profile" ? "#38bdf8" : "#94a3b8",
              border:
                activeTab === "profile"
                  ? "2px solid #38bdf8"
                  : "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            👤 User Profile Settings
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          {/* Message Display */}
          {message.text && (
            <div
              className={`message ${message.type}`}
              style={{
                padding: "16px 20px",
                borderRadius: "6px",
                marginBottom: "24px",
                backgroundColor:
                  message.type === "success" ? "#f0f9ff" : "#fef2f2",
                color: message.type === "success" ? "#1e40af" : "#991b1b",
                border: `1px solid ${
                  message.type === "success" ? "#3b82f6" : "#ef4444"
                }`,
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {message.text}
            </div>
          )}

          {/* API Connection Tab */}
          {activeTab === "connection" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "32px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "12px",
                }}
              >
                API Connection Status
              </h2>
              <div style={{ display: "grid", gap: "20px", maxWidth: "600px" }}>
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        API Endpoint:
                      </span>
                      <code
                        style={{
                          fontSize: "13px",
                          padding: "4px 8px",
                          backgroundColor: "#1f2937",
                          color: "#10b981",
                          borderRadius: "4px",
                        }}
                      >
                        {apiUrl}
                      </code>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Connection Status:
                      </span>
                      <div
                        style={{
                          padding: "6px 12px",
                          backgroundColor:
                            pollingStatus === "CONNECTED"
                              ? "#d1fae5"
                              : "#fee2e2",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color:
                            pollingStatus === "CONNECTED"
                              ? "#065f46"
                              : "#991b1b",
                          border: `1px solid ${
                            pollingStatus === "CONNECTED"
                              ? "#10b981"
                              : "#ef4444"
                          }`,
                        }}
                      >
                        {pollingStatus === "CONNECTED"
                          ? "✅ Connected"
                          : pollingStatus === "CHECKING"
                          ? "🔄 Checking..."
                          : "❌ Disconnected"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Update Method:
                      </span>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        HTTP Polling (every 1 second) ⚡
                      </span>
                    </div>

                    {pollingStatus === "CONNECTED" && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "12px",
                          backgroundColor: "#ecfdf5",
                          borderRadius: "6px",
                          border: "1px solid #10b981",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#065f46",
                            fontWeight: "500",
                          }}
                        >
                          ✅ Real-time data is being received from your
                          Raspberry Pi
                        </p>
                      </div>
                    )}

                    {pollingStatus === "DISCONNECTED" && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "12px",
                          backgroundColor: "#fef2f2",
                          borderRadius: "6px",
                          border: "1px solid #ef4444",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "13px",
                            color: "#991b1b",
                            fontWeight: "500",
                          }}
                        >
                          ❌ Cannot connect to API server
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          Make sure the Flask server is running:{" "}
                          <code>python3 web_server.py</code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p
                style={{
                  margin: "20px 0 0 0",
                  color: "#6b7280",
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                The system uses simple HTTP polling for reliable connectivity.
                Data is automatically fetched every 1 second from{" "}
                <code>/api/latest</code> endpoint for ultra-responsive real-time
                updates.
              </p>
            </div>
          )}

          {/* User Profile Settings Tab */}
          {activeTab === "profile" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "32px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "12px",
                }}
              >
                User Profile Settings
              </h2>

              <div style={{ display: "grid", gap: "24px" }}>
                {/* Email Update */}
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>📧</span>
                    Update Email Address
                  </h3>

                  {/* Current vs New Display */}
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "12px 16px",
                      backgroundColor: "#dbeafe",
                      borderRadius: "6px",
                      borderLeft: "3px solid #3b82f6",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#1e40af",
                        marginBottom: "4px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Current Email
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#1e3a8a",
                        fontWeight: "600",
                      }}
                    >
                      {originalProfile.email}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "16px" }}>
                    <label>
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        New Email Address
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          style={{
                            width: "100%",
                            padding: "10px 40px 10px 12px",
                            borderRadius: "4px",
                            border: `1px solid ${
                              fieldErrors.email ? "#ef4444" : "#d1d5db"
                            }`,
                            backgroundColor: "#ffffff",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.2s ease",
                            boxSizing: "border-box",
                          }}
                          type="email"
                          value={userProfile.email}
                          onChange={(e) =>
                            handleFieldChange("email", e.target.value)
                          }
                          placeholder="Enter new email address"
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#3b82f6")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = fieldErrors.email
                              ? "#ef4444"
                              : "#d1d5db")
                          }
                        />
                        {validFields.email && !fieldErrors.email && (
                          <span
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#10b981",
                              fontSize: "18px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      {fieldErrors.email && (
                        <span
                          style={{
                            color: "#ef4444",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {fieldErrors.email}
                        </span>
                      )}
                    </label>

                    {/* Current Password for Email Change */}
                    <label>
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        Current Password (for verification)
                      </div>
                      <input
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "4px",
                          border: "1px solid #d1d5db",
                          backgroundColor: "#ffffff",
                          fontSize: "14px",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                        type="password"
                        value={userProfile.currentPasswordForEmail}
                        onChange={(e) =>
                          handleFieldChange(
                            "currentPasswordForEmail",
                            e.target.value
                          )
                        }
                        placeholder="Enter your current password"
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#3b82f6")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </label>

                    <button
                      className="primary"
                      onClick={() => handleProfileUpdate("email")}
                      disabled={
                        isLoadingEmail ||
                        !userProfile.email ||
                        !userProfile.currentPasswordForEmail ||
                        !!fieldErrors.email
                      }
                      style={{
                        alignSelf: "start",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "none",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        cursor:
                          isLoadingEmail ||
                          !userProfile.email ||
                          !userProfile.currentPasswordForEmail ||
                          !!fieldErrors.email
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          isLoadingEmail ||
                          !userProfile.email ||
                          !userProfile.currentPasswordForEmail ||
                          !!fieldErrors.email
                            ? 0.6
                            : 1,
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !isLoadingEmail &&
                          userProfile.email &&
                          userProfile.currentPasswordForEmail &&
                          !fieldErrors.email
                        ) {
                          e.target.style.backgroundColor = "#2563eb";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#3b82f6";
                      }}
                    >
                      {isLoadingEmail && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "14px",
                            height: "14px",
                            border: "2px solid #ffffff",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 0.6s linear infinite",
                          }}
                        ></span>
                      )}
                      <span>
                        {isLoadingEmail ? "Updating..." : "Update Email"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Username Update */}
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>👤</span>
                    Update Username
                  </h3>

                  {/* Current vs New Display */}
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "12px 16px",
                      backgroundColor: "#dbeafe",
                      borderRadius: "6px",
                      borderLeft: "3px solid #3b82f6",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#1e40af",
                        marginBottom: "4px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Current Username
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#1e3a8a",
                        fontWeight: "600",
                      }}
                    >
                      {originalProfile.username}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "16px" }}>
                    <label>
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        New Username
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginLeft: "8px",
                          }}
                        >
                          ({userProfile.username.length}/20)
                        </span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          style={{
                            width: "100%",
                            padding: "10px 40px 10px 12px",
                            borderRadius: "4px",
                            border: `1px solid ${
                              fieldErrors.username ? "#ef4444" : "#d1d5db"
                            }`,
                            backgroundColor: "#ffffff",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.2s ease",
                            boxSizing: "border-box",
                          }}
                          type="text"
                          value={userProfile.username}
                          onChange={(e) =>
                            handleFieldChange("username", e.target.value)
                          }
                          placeholder="Enter new username"
                          maxLength={20}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#3b82f6")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = fieldErrors.username
                              ? "#ef4444"
                              : "#d1d5db")
                          }
                        />
                        {validFields.username && !fieldErrors.username && (
                          <span
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#10b981",
                              fontSize: "18px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      {fieldErrors.username && (
                        <span
                          style={{
                            color: "#ef4444",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {fieldErrors.username}
                        </span>
                      )}
                    </label>

                    {/* Current Password for Username Change */}
                    <label>
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        Current Password (for verification)
                      </div>
                      <input
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "4px",
                          border: "1px solid #d1d5db",
                          backgroundColor: "#ffffff",
                          fontSize: "14px",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                        type="password"
                        value={userProfile.currentPasswordForUsername}
                        onChange={(e) =>
                          handleFieldChange(
                            "currentPasswordForUsername",
                            e.target.value
                          )
                        }
                        placeholder="Enter your current password"
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#3b82f6")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </label>

                    <button
                      className="primary"
                      onClick={() => handleProfileUpdate("username")}
                      disabled={
                        isLoadingUsername ||
                        !userProfile.username ||
                        !userProfile.currentPasswordForUsername ||
                        !!fieldErrors.username
                      }
                      style={{
                        alignSelf: "start",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "none",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        cursor:
                          isLoadingUsername ||
                          !userProfile.username ||
                          !userProfile.currentPasswordForUsername ||
                          !!fieldErrors.username
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          isLoadingUsername ||
                          !userProfile.username ||
                          !userProfile.currentPasswordForUsername ||
                          !!fieldErrors.username
                            ? 0.6
                            : 1,
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !isLoadingUsername &&
                          userProfile.username &&
                          userProfile.currentPasswordForUsername &&
                          !fieldErrors.username
                        ) {
                          e.target.style.backgroundColor = "#2563eb";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#3b82f6";
                      }}
                    >
                      {isLoadingUsername && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "14px",
                            height: "14px",
                            border: "2px solid #ffffff",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 0.6s linear infinite",
                          }}
                        ></span>
                      )}
                      <span>
                        {isLoadingUsername ? "Updating..." : "Update Username"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Password Update */}
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>🔒</span>
                    Change Password
                  </h3>
                  <div style={{ display: "grid", gap: "16px" }}>
                    {/* Current Password */}
                    <label>
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        Current Password
                      </div>
                      <input
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "4px",
                          border: "1px solid #d1d5db",
                          backgroundColor: "#ffffff",
                          fontSize: "14px",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                        type="password"
                        value={userProfile.currentPassword}
                        onChange={(e) =>
                          handleFieldChange("currentPassword", e.target.value)
                        }
                        placeholder="Enter your current password"
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#3b82f6")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </label>

                    {/* New Password */}
                    <label>
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        New Password
                      </div>
                      <input
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "4px",
                          border: "1px solid #d1d5db",
                          backgroundColor: "#ffffff",
                          fontSize: "14px",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                        type="password"
                        value={userProfile.newPassword}
                        onChange={(e) =>
                          handleFieldChange("newPassword", e.target.value)
                        }
                        placeholder="Enter new password (min 8 characters)"
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#3b82f6")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                    </label>

                    {/* Password Strength Meter */}
                    {userProfile.newPassword && (
                      <div style={{ marginTop: "8px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            Password Strength:
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: passwordStrength.color,
                            }}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "6px",
                            backgroundColor: "#e5e7eb",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${passwordStrength.score}%`,
                              height: "100%",
                              backgroundColor: passwordStrength.color,
                              transition: "all 0.3s ease",
                            }}
                          />
                        </div>

                        {/* Password Requirements Checklist */}
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "6px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            Password must contain:
                          </div>
                          <div style={{ display: "grid", gap: "4px" }}>
                            {[
                              { key: "length", label: "At least 8 characters" },
                              {
                                key: "uppercase",
                                label: "One uppercase letter (A-Z)",
                              },
                              {
                                key: "lowercase",
                                label: "One lowercase letter (a-z)",
                              },
                              { key: "number", label: "One number (0-9)" },
                              {
                                key: "special",
                                label: "One special character (@$!%*?&#)",
                              },
                            ].map((req) => (
                              <div
                                key={req.key}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  fontSize: "11px",
                                  color: passwordRequirements[req.key]
                                    ? "#10b981"
                                    : "#6b7280",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {passwordRequirements[req.key] ? "✓" : "○"}
                                </span>
                                <span>{req.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirm New Password */}
                    <label>
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        Confirm New Password
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          style={{
                            width: "100%",
                            padding: "10px 40px 10px 12px",
                            borderRadius: "4px",
                            border: `1px solid ${
                              fieldErrors.confirmPassword
                                ? "#ef4444"
                                : "#d1d5db"
                            }`,
                            backgroundColor: "#ffffff",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.2s ease",
                            boxSizing: "border-box",
                          }}
                          type="password"
                          value={userProfile.confirmPassword}
                          onChange={(e) =>
                            handleFieldChange("confirmPassword", e.target.value)
                          }
                          placeholder="Confirm new password"
                          onFocus={(e) =>
                            (e.target.style.borderColor =
                              fieldErrors.confirmPassword
                                ? "#ef4444"
                                : "#3b82f6")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor =
                              fieldErrors.confirmPassword
                                ? "#ef4444"
                                : "#d1d5db")
                          }
                        />
                        {userProfile.confirmPassword &&
                          userProfile.newPassword &&
                          !fieldErrors.confirmPassword &&
                          userProfile.confirmPassword ===
                            userProfile.newPassword && (
                            <span
                              style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#10b981",
                                fontSize: "18px",
                                fontWeight: "bold",
                              }}
                            >
                              ✓
                            </span>
                          )}
                      </div>
                      {fieldErrors.confirmPassword && (
                        <span
                          style={{
                            color: "#ef4444",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {fieldErrors.confirmPassword}
                        </span>
                      )}
                    </label>

                    <button
                      className="primary"
                      onClick={() => handleProfileUpdate("password")}
                      disabled={
                        isLoadingPassword ||
                        !userProfile.currentPassword ||
                        !userProfile.newPassword ||
                        !userProfile.confirmPassword ||
                        !!fieldErrors.confirmPassword
                      }
                      style={{
                        alignSelf: "start",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "none",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        cursor:
                          isLoadingPassword ||
                          !userProfile.currentPassword ||
                          !userProfile.newPassword ||
                          !userProfile.confirmPassword ||
                          !!fieldErrors.confirmPassword
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          isLoadingPassword ||
                          !userProfile.currentPassword ||
                          !userProfile.newPassword ||
                          !userProfile.confirmPassword ||
                          !!fieldErrors.confirmPassword
                            ? 0.6
                            : 1,
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !isLoadingPassword &&
                          userProfile.currentPassword &&
                          userProfile.newPassword &&
                          userProfile.confirmPassword &&
                          !fieldErrors.confirmPassword
                        ) {
                          e.target.style.backgroundColor = "#2563eb";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#3b82f6";
                      }}
                    >
                      {isLoadingPassword && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "14px",
                            height: "14px",
                            border: "2px solid #ffffff",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 0.6s linear infinite",
                          }}
                        ></span>
                      )}
                      <span>
                        {isLoadingPassword ? "Updating..." : "Change Password"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

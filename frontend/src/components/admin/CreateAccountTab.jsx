import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaUserPlus, FaUser, FaEnvelope, FaLock, FaUserShield, FaUserTie, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

function CreateAccountTab({
  accountForm,
  setAccountForm,
  showPassword,
  showConfirmPassword,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  handleCreateAccount,
  loading
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Name is required";
    }
    if (name.trim().length < 3) {
      return "Name must be at least 3 characters long";
    }
    if (/\d/.test(name)) {
      return "Name cannot contain numbers";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password || password.length === 0) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword || confirmPassword.length === 0) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};
    newErrors.name = validateName(accountForm.name);
    newErrors.email = validateEmail(accountForm.email);
    newErrors.password = validatePassword(accountForm.password);
    newErrors.confirmPassword = validateConfirmPassword(accountForm.password, accountForm.confirmPassword);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  // Handle field blur (when user leaves a field)
  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });

    let error = "";
    switch (fieldName) {
      case "name":
        error = validateName(accountForm.name);
        break;
      case "email":
        error = validateEmail(accountForm.email);
        break;
      case "password":
        error = validatePassword(accountForm.password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(accountForm.password, accountForm.confirmPassword);
        break;
      default:
        break;
    }
    setErrors({ ...errors, [fieldName]: error });
  };

  // Update validation when password changes (to validate confirmPassword)
  useEffect(() => {
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(accountForm.password, accountForm.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  }, [accountForm.password, accountForm.confirmPassword, touched.confirmPassword]);

  // Enhanced submit handler with validation
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Validate all fields
    if (validateAllFields()) {
      handleCreateAccount(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="p-4 sm:p-6 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)' }}>
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <FaUserPlus className="text-xl sm:text-2xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Create New Account
            </h2>
            <p className="text-xs sm:text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              Add a new admin or keeper to the system
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-4 sm:p-8 rounded-2xl shadow-lg" style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              <div className="flex items-center gap-2">
                <FaUser className="text-blue-500" />
                <span>Full Name</span>
                <span className="text-red-500">*</span>
              </div>
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={accountForm.name}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, name: e.target.value })
                }
                onBlur={() => handleBlur("name")}
                placeholder="Enter full name"
                className={`block w-full border-2 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 hover:border-blue-300 ${touched.name && errors.name ? 'border-red-500' : 'border-transparent'
                  }`}
                style={{
                  borderColor: touched.name && errors.name ? '#ef4444' : 'var(--color-bg)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)'
                }}
                disabled={loading}
              />
              {touched.name && errors.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaExclamationCircle className="text-red-500" />
                </div>
              )}
              {touched.name && !errors.name && accountForm.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaCheckCircle className="text-green-500" />
                </div>
              )}
            </div>
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <FaExclamationCircle className="text-xs" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-blue-500" />
                <span>Email Address</span>
                <span className="text-red-500">*</span>
              </div>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={accountForm.email}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, email: e.target.value })
                }
                onBlur={() => handleBlur("email")}
                placeholder="email@example.com"
                className={`block w-full border-2 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 hover:border-blue-300 ${touched.email && errors.email ? 'border-red-500' : 'border-transparent'
                  }`}
                style={{
                  borderColor: touched.email && errors.email ? '#ef4444' : 'var(--color-bg)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)'
                }}
                disabled={loading}
              />
              {touched.email && errors.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaExclamationCircle className="text-red-500" />
                </div>
              )}
              {touched.email && !errors.email && accountForm.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaCheckCircle className="text-green-500" />
                </div>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <FaExclamationCircle className="text-xs" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              <div className="flex items-center gap-2">
                <FaLock className="text-blue-500" />
                <span>Password</span>
                <span className="text-red-500">*</span>
              </div>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={accountForm.password}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    password: e.target.value,
                  })
                }
                onBlur={() => handleBlur("password")}
                placeholder="Enter secure password"
                className={`block w-full border-2 rounded-xl p-3 pr-20 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 hover:border-blue-300 ${touched.password && errors.password ? 'border-red-500' : 'border-transparent'
                  }`}
                style={{
                  borderColor: touched.password && errors.password ? '#ef4444' : 'var(--color-bg)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)'
                }}
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {touched.password && errors.password && <FaExclamationCircle className="text-red-500" />}
                {touched.password && !errors.password && accountForm.password && <FaCheckCircle className="text-green-500" />}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none hover:scale-110 transition-transform"
                  style={{ color: 'var(--color-accent)' }}
                  disabled={loading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <FaExclamationCircle className="text-xs" />
                {errors.password}
              </p>
            )}
            {!errors.password && accountForm.password && (
              <p className="mt-1 text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                Password must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              <div className="flex items-center gap-2">
                <FaLock className="text-blue-500" />
                <span>Confirm Password</span>
                <span className="text-red-500">*</span>
              </div>
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={accountForm.confirmPassword}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    confirmPassword: e.target.value,
                  })
                }
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Re-enter password"
                className={`block w-full border-2 rounded-xl p-3 pr-20 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 hover:border-blue-300 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                  }`}
                style={{
                  borderColor: touched.confirmPassword && errors.confirmPassword ? '#ef4444' : 'var(--color-bg)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)'
                }}
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {touched.confirmPassword && errors.confirmPassword && <FaExclamationCircle className="text-red-500" />}
                {touched.confirmPassword && !errors.confirmPassword && accountForm.confirmPassword && <FaCheckCircle className="text-green-500" />}
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="focus:outline-none hover:scale-110 transition-transform"
                  style={{ color: 'var(--color-accent)' }}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <FaExclamationCircle className="text-xs" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${accountForm.role === "admin" ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-blue-300'
                }`}
                style={{
                  background: accountForm.role === "admin" ? 'var(--color-bg)' : 'var(--color-bg)',
                  opacity: accountForm.role === "admin" ? 1 : 0.7
                }}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={accountForm.role === "admin"}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      role: e.target.value,
                    })
                  }
                  className="sr-only"
                  disabled={loading}
                />
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accountForm.role === "admin" ? 'bg-linear-to-br from-blue-500 to-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}>
                    <FaUserTie className="text-2xl text-white" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold" style={{ color: 'var(--color-text)' }}>Admin</span>
                    <span className="block text-xs opacity-70" style={{ color: 'var(--color-text)' }}>Full access</span>
                  </div>
                </div>
                {accountForm.role === "admin" && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>

              <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${accountForm.role === "keeper" ? 'border-green-500 shadow-md' : 'border-transparent hover:border-green-300'
                }`}
                style={{
                  background: accountForm.role === "keeper" ? 'var(--color-bg)' : 'var(--color-bg)',
                  opacity: accountForm.role === "keeper" ? 1 : 0.7
                }}>
                <input
                  type="radio"
                  name="role"
                  value="keeper"
                  checked={accountForm.role === "keeper"}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      role: e.target.value,
                    })
                  }
                  className="sr-only"
                  disabled={loading}
                />
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accountForm.role === "keeper" ? 'bg-linear-to-br from-green-500 to-green-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}>
                    <FaUserShield className="text-2xl text-white" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold" style={{ color: 'var(--color-text)' }}>Keeper</span>
                    <span className="block text-xs opacity-70" style={{ color: 'var(--color-text)' }}>Limited access</span>
                  </div>
                </div>
                {accountForm.role === "keeper" && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 rounded-xl text-sm font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
              }`}
            style={{
              background: loading ? 'var(--color-secondary)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaUserPlus />
                <span>Create Account</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccountTab;

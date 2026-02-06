// src/componets/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { Container } from 'react-bootstrap';
import "../../assets/css/login.css";

const Login = () => {
  const [role, setRole] = useState('admin'); // Default role is 'admin'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [adminId, setAdminId] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: State for password visibility ---
  const [showPassword, setShowPassword] = useState(false);

  // List of 13 districts of Uttarakhand
  const districts = [
    "haridwar", "dehradun", "uttarkashi", "chamoli", "rudraprayag",
    "tehri_garhwal", "pauri_garhwal", "nainital", "almora", "pithoragarh",
    "udham_singh_nagar", "bageshwar", "champawat"
  ];

  // Get the login function from AuthContext
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- NEW: Function to toggle password visibility ---
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);

    try {
      let requestBody = {};
      let endpoint = "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/login/";

      // Prepare request body based on role
      if (role === 'member') {
        requestBody = {
          email_or_phone: emailOrPhone,
          password: password,
        };
      } else if (role === 'admin') {
        requestBody = {
          email_or_phone: adminId,
          password: password,
        };
      } else if (role === 'district-admin') {
        requestBody = {
          // district_name: selectedDistrict,
          email_or_phone: email,
          password: password,
        };
      } else if (role === 'region-admin') {
        requestBody = {
          email_or_phone: email,
          password: password,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // --- ROLE VALIDATION: Check if selected role matches credential role ---
        // For member role, the API returns "member"
        const isRoleMatch = data.role === role;

        if (!isRoleMatch) {
          throw new Error( 
            `Invalid UserName or Password for the selected role: ${role}. Please check your credentials and try again.`
          );
        }

        // On successful login, call the login function from AuthContext
        // This will save the tokens and update the authentication state globally
        login(data);

        // --- ROLE-BASED REDIRECTION LOGIC ---
        let redirectTo;
        if (data.role === 'admin') {
          redirectTo = "/DashBoard"; // Admin dashboard
        } else if (data.role === 'district-admin') {
          redirectTo = "/DistrictRegistration"; // District admin dashboard
        } else if (data.role === 'region-admin') {
          redirectTo = "/RegionDashBoard"; // Region admin dashboard
        } else if (data.role === 'member') {
          // For member/user role
          redirectTo = "/UserProfile";
        } else {
          // Default to user dashboard
          redirectTo = "/UserDashBoard";
        }

        // Redirect the user to their role-specific dashboard
        navigate(redirectTo, { replace: true });
      } else {
        // If the server returns an error, display the error message
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the appropriate title based on selected role
  const getLoginTitle = () => {
    switch(role) {
      case 'admin':
        return 'Admin Login';
      case 'district-admin':
        return 'District Admin Login';
      case 'region-admin':
        return 'Region Admin Login';
      case 'member':
        return 'Member Login';
      default:
        return 'Member Login';
    }
  };

  return (
    <Container className='login-box-two'>
    <Container className='login-con'>
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-box">
        <div className="login-header">
          <h1>{getLoginTitle()}</h1>
        </div>
        
        {/* Display error message if it exists */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Role Selection Tabs */}
        <div className="role-tabs">
          <button 
            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <i className="fas fa-user-shield"></i>
            <span>Admin</span>
          </button>
          <button 
            className={`role-tab ${role === 'district-admin' ? 'active' : ''}`}
            onClick={() => setRole('district-admin')}
          >
            <i className="fas fa-map-marked-alt"></i>
            <span>District</span>
          </button>
          <button 
            className={`role-tab ${role === 'region-admin' ? 'active' : ''}`}
            onClick={() => setRole('region-admin')}
          >
            <i className="fas fa-globe-asia"></i>
            <span>Region</span>
          </button>
          <button 
            className={`role-tab ${role === 'member' ? 'active' : ''}`}
            onClick={() => setRole('member')}
          >
            <i className="fas fa-users"></i>
            <span>Member</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {/* Member Login Fields */}
          {role === 'member' && (
            <>
              <div className="form-group">
                <label htmlFor="emailOrPhone">Email or Phone</label>
                <input
                  type="text"
                  id="emailOrPhone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Admin Login Fields */}
          {role === 'admin' && (
            <>
              <div className="form-group">
                <label htmlFor="adminId">Admin ID</label>
                <input
                  type="text"
                  id="adminId"
                  value={adminId} 
                  onChange={(e) => setAdminId(e.target.value)}
                  required placeholder='admin@gmail.com' 
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* District Admin Login Fields */}
          {role === 'district-admin' && (
            <>
              <div className="form-group">
                <label htmlFor="districtSelect">District Name</label>
                <select
                  id="districtSelect"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled>Select a district</option>
                  {districts.map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email ID</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Region Admin Login Fields */}
          {role === 'region-admin' && (
            <>
              <div className="form-group">
                <label htmlFor="regionEmail">Email or Phone</label>
                <input
                  type="text"
                  id="regionEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="regionPassword">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="regionPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
      
   
    </div>
  </Container>
  </Container>
  );
};

export default Login;
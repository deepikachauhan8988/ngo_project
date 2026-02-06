// src/componets/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { Container } from 'react-bootstrap';

const Login = () => {
  const [role, setRole] = useState('admin'); // Default role is 'admin'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [adminId, setAdminId] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
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
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
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
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
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
                <input
                  type="password"
                  id="regionPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
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
      
      <style jsx>{`
        .login-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
         
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          z-index: -1;
        }
        
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .login-box {
          width: 90%;
          max-width: 450px;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        
        .login-box:hover {
          transform: translateY(-5px);
        }
        
        .login-header {
          background-color: #1a2a6c;
          color: white;
          padding: 20px;
          text-align: center;
        }
        
        .login-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #fdf7f8;
          padding: 12px;
          margin: 15px;
          border-radius: 5px;
          border: 1px solid #f5c6cb;
        }
        
        .role-tabs {
          display: flex;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .role-tab {
          flex: 1;
          padding: 15px 5px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
          color: #6c757d;
        }
        
        .role-tab:hover {
          background-color: #e9ecef;
        }
        
        .role-tab.active {
          background-color: white;
          color: #1a2a6c;
          border-bottom: 3px solid #1a2a6c;
        }
        
        .role-tab i {
          margin-bottom: 5px;
          font-size: 18px;
        }
        
        .role-tab span {
          font-size: 12px;
        }
        
        .login-form {
          padding: 25px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #495057;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 5px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          border-color: #1a2a6c;
          outline: none;
          box-shadow: 0 0 0 3px rgba(26, 42, 108, 0.1);
        }
        
        .login-button {
          width: 100%;
          padding: 12px;
          background-color: #1a2a6c;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .login-button:hover {
          background-color: #152054;
        }
        
        .login-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </Container>
  );
};

export default Login;
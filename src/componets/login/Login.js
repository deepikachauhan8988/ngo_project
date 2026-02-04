// src/componets/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Login = () => {
  const [role, setRole] = useState('admin'); // Default role is 'member'
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
            `Invalid login attempt. Selected role "${role}" does not match the credential role "${data.role}". Please select the correct role and try again.`
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
      case 'member':
        return 'Member Login';
      default:
        return 'Member Login';
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">{getLoginTitle()}</h2>
              
              {/* Display error message if it exists */}
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              
              {/* Role Selection Radio Buttons */}
              <div className="mb-4">
                <div className="d-flex justify-content-around">
                    <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="role"
                      id="adminRole"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                    />
                    <label className="form-check-label" htmlFor="adminRole">
                      Admin
                    </label>
                  </div>

                    <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="role"
                      id="districtAdminRole"
                      value="district-admin"
                      checked={role === 'district-admin'}
                      onChange={() => setRole('district-admin')}
                    />
                    <label className="form-check-label" htmlFor="districtAdminRole">
                      District Admin
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="role"
                      id="memberRole"
                      value="member"
                      checked={role === 'member'}
                      onChange={() => setRole('member')}
                    />
                    <label className="form-check-label" htmlFor="memberRole">
                      Member
                    </label>
                  </div>
                
                
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Member Login Fields */}
                {role === 'member' && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="emailOrPhone" className="form-label">Email or Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        id="emailOrPhone"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
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
                    <div className="mb-3">
                      <label htmlFor="adminId" className="form-label">Admin ID</label>
                      <input
                        type="text"
                        className="form-control"
                        id="adminId"
                        value={adminId} 
                        onChange={(e) => setAdminId(e.target.value)}
                        required placeholder='admin@gmail.com' 
                        disabled={isLoading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
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
                    <div className="mb-3">
                      <label htmlFor="districtSelect" className="form-label">District Name</label>
                      <select
                        className="form-select"
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
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email ID</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
                
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        {' '}Logging in...
                      </>
                    ) : (
                      'Log In'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from "react";
import { Container, Table, Spinner, Alert, Button, Card } from "react-bootstrap";

import "../../assets/css/dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useAuthFetch } from "../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import DistrictLeftNav from "./DistrictLeftNav";
import DashBoardHeader from "../event_panel/DashBoardHeader";

const DistrictRegistration = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for member data
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Check device width
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch members when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchMembers();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Extract district from unique_id or use allocated_district
  const getDistrictFromUniqueId = (uniqueId) => {
    // Use allocated_district if available (from login response)
    if (auth?.allocated_district) {
      return auth.allocated_district;
    }
    
    // Fallback: extract from unique_id if needed
    if (!uniqueId) return "";
    // Assuming unique_id format is "DIST/ADM/YYYY/XXXXX"
    return uniqueId; // Default fallback
  };

   // Fetch members from API
const fetchMembers = async () => {
  setIsLoading(true);
  setError("");
  setShowAlert(false);

  try {
    // Debug: Log authentication state
    console.log("Auth state:", auth);
    console.log("Auth object from localStorage:", localStorage.getItem('auth'));
    console.log("Is authenticated:", isAuthenticated);
    
    // Get district from user's unique_id or use a default
    const district = getDistrictFromUniqueId(auth?.unique_id);
    
    // Try to get token from auth context or localStorage as fallback
    let token = auth?.access;
    if (!token) {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          token = parsedAuth.access;
          console.log("Token retrieved from localStorage:", token ? "Yes" : "No");
        }
      } catch (error) {
        console.error("Error parsing stored auth:", error);
      }
    }
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }
    
    // Make fetch request with token
    const response = await fetch(
      `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?district=${district}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        throw new Error('Permission denied. You may not have the required role to access this feature.');
      }
      throw new Error(`Failed to fetch members. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("GET Members API Response:", result);

    // Handle different response formats
    if (Array.isArray(result)) {
      // Direct array response
      setMembers(result);
    } else if (result.success && result.data) {
      // Wrapped response object
      if (Array.isArray(result.data)) {
        setMembers(result.data);
      } else {
        setMembers([result.data]);
      }
    } else {
      throw new Error("Invalid response format or no members found");
    }
  } catch (error) {
    console.error("Error fetching members:", error);
    
    // Handle specific error cases
    if (error.message.includes('403') || error.message.includes('permission')) {
      setError("Permission denied. You may not have the required role to access this feature.");
    } else if (error.message.includes('401') || error.message.includes('authenticated') || error.message.includes('Session expired')) {
      setError("Authentication error. Please login again.");
      // Redirect to login
      setTimeout(() => {
        navigate('/Login');
      }, 2000);
    } else {
      setError(error.message || "An error occurred while fetching member data");
    }
    
    setShowAlert(true);
  } finally {
    setIsLoading(false);
  }
};

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  // If not authenticated, show message and redirect
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <Alert variant="warning">
              <Alert.Heading>Authentication Required</Alert.Heading>
              <p>You need to be logged in to view this page.</p>
              <Button variant="primary" onClick={() => navigate("/Login")}>
                Go to Login
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <DistrictLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">District Members</h1>
              <Button variant="outline-primary" onClick={fetchMembers} disabled={isLoading}>
               Refresh
              </Button>
            </div>

            {/* Alert for error messages */}
            {showAlert && (
              <Alert
                variant="danger"
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {error}
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading Members...</p>
              </div>
            ) : (
              <>
                {members.length === 0 ? (
                  <Alert variant="info">
                    No members found for your district.
                  </Alert>
                ) : (
                  <Card>
                    {/* <Card.Header as="h5">Members List</Card.Header> */}
                    <Card.Body className="p-0">
                      <Table striped bordered hover responsive>
                        <thead className="table-thead">
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>District</th>
                            <th>Registration Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, index) => (
                            <tr key={member.id || index}>
                              <td>{index + 1}</td>
                              <td>{member.full_name || member.name || 'N/A'}</td>
                              <td>{member.email || 'N/A'}</td>
                              <td>{member.phone || 'N/A'}</td>
                              <td>{member.district || member.allocated_district || 'N/A'}</td>
                              <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default DistrictRegistration;
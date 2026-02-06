import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Card,
} from "react-bootstrap";
import "../../assets/css/dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useAuthFetch } from "../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import RegionregLeftNav from "./RegionregLeftNav";
import RegionregHeader from "./RegionregHeader";

const RegionDashBoard = () => {
  const {
    auth,
    logout,
    refreshAccessToken,
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();
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

  // Get districts from auth object
  const getDistrictsFromAuth = () => {
    // Use allocated_district if available (from login response)
    if (auth?.allocated_district) {
      let districtsArray = [];

      if (Array.isArray(auth.allocated_district)) {
        districtsArray = auth.allocated_district;
      } else if (typeof auth.allocated_district === "string") {
        // If it's a string, split by comma (handles cases like "haridwar,dehradun")
        districtsArray = auth.allocated_district
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d);
      }

      console.log("Allocated districts from auth:", districtsArray);

      if (districtsArray.length > 0) {
        const districts = districtsArray.join(",");
        console.log("Formatted districts for API:", districts);
        return districts;
      }
    }

    console.log("No allocated districts found in auth object");
    return "";
  };

  // Fetch members from API
  const fetchMembers = async () => {
    setIsLoading(true);
    setError("");
    setShowAlert(false);

    try {
      // Debug: Log authentication state
      console.log("Auth state:", auth);
      console.log(
        "Auth object from localStorage:",
        localStorage.getItem("auth"),
      );
      console.log("Is authenticated:", isAuthenticated);

      // Get districts from auth
      const districtsStr = getDistrictsFromAuth();

      if (!districtsStr) {
        throw new Error(
          "No districts assigned to your account. Please contact administrator.",
        );
      }

      // Split into individual districts
      const districts = districtsStr.split(',').map(d => d.trim()).filter(d => d);
      console.log("Processing districts:", districts);

      let allMembers = [];

      // Fetch members for each district separately
      for (const district of districts) {
        console.log(`Fetching members for district: ${district}`);
        
        const response = await authFetch(
          `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?district=${district}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          console.warn(`Failed to fetch members for district ${district}: Status ${response.status}`);
          continue; // Skip this district and continue with others
        }

        const result = await response.json();
        console.log(`Response for district ${district}:`, result);

        // Handle various response formats
        let membersData = [];

        if (Array.isArray(result)) {
          membersData = result;
        } else if (result && result.id) {
          membersData = [result];
        } else if (result && result.success) {
          if (Array.isArray(result.data)) {
            membersData = result.data;
          } else if (result.data && result.data.id) {
            membersData = [result.data];
          }
        } else if (result && result.data) {
          if (Array.isArray(result.data)) {
            membersData = result.data;
          } else if (result.data && result.data.id) {
            membersData = [result.data];
          }
        } else {
          console.warn(`Unexpected response format for district ${district}:`, result);
        }

        allMembers = [...allMembers, ...membersData];
        console.log(`Fetched ${membersData.length} members for district ${district}`);
      }

      // Remove duplicates (in case a member appears in multiple districts)
      const uniqueMembers = allMembers.filter((member, index, self) => 
        index === self.findIndex(m => m.id === member.id)
      );

      setMembers(uniqueMembers);
      console.log(`Total members fetched: ${uniqueMembers.length}`);
      
    } catch (error) {
      console.error("Error fetching members:", error);

      // Handle specific error cases
      if (
        error.message.includes("403") ||
        error.message.includes("permission")
      ) {
        setError(
          "Permission denied. You may not have the required role to access this feature.",
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("authenticated") ||
        error.message.includes("Session expired")
      ) {
        setError("Authentication error. Please login again.");
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else if (error.message.includes("404")) {
        setError("API endpoint not found. Please contact the administrator.");
      } else if (
        error.message.includes("500") ||
        error.message.includes("Server error")
      ) {
        setError(error.message);
      } else {
        setError(
          error.message || "An error occurred while fetching member data",
        );
      }

      setShowAlert(true);
      setMembers([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div
          className="main-content-dash d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
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
        <div
          className="main-content-dash d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
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
        <RegionregLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <RegionregHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">Region Members</h1>
              <Button
                variant="outline-primary"
                onClick={fetchMembers}
                disabled={isLoading}
              >
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
                    <Card.Body className="p-0">
                      <Table striped bordered hover responsive>
                        <thead className="table-thead">
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Region Admin ID</th>
                            <th>Allocated Districts</th>
                            <th>Registration Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, index) => (
                            <tr key={member.id || index}>
                              <td>{index + 1}</td>
                              <td>
                                {member.full_name || member.name || "N/A"}
                              </td>
                              <td>{member.email || "N/A"}</td>
                              <td>{member.phone || "N/A"}</td>
                              <td>{member.region_admin_id || "N/A"}</td>
                              <td>
                                {member.allocated_district &&
                                Array.isArray(member.allocated_district)
                                  ? member.allocated_district.join(", ")
                                  : member.district ||
                                    member.allocated_district ||
                                    "N/A"}
                              </td>
                              <td>
                                {member.created_at
                                  ? new Date(
                                      member.created_at,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
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

export default RegionDashBoard;

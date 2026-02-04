import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft } from "react-icons/fa";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";

const DistrictManageRegistration = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all district registrations
  const [districtRegistrations, setDistrictRegistrations] = useState([]);
  
  // Form state for selected district
  const [formData, setFormData] = useState({
    id: null,
    district_admin_id: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    allocated_district: ""
  });

  // District options
  const districts = [
    "Haridwar", "Dehradun", "Uttarkashi", "Chamoli", "Rudraprayag", 
    "Tehri Garhwal", "Pauri Garhwal", "Nainital", "Almora", "Pithoragarh",
    "Udham Singh Nagar", "Bageshwar", "Champawat"
  ];

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);

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

  // Fetch all district registrations when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchAllDistrictRegistrations();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all district registrations from API
  const fetchAllDistrictRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/district-reg/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch district registrations");
      }

      const result = await response.json();
      console.log("GET All District Registrations API Response:", result);

      // Check if the response is directly an array or wrapped in an object
      if (Array.isArray(result)) {
        // Direct array response
        if (result.length > 0) {
          setDistrictRegistrations(result);
        } else {
          setDistrictRegistrations([]);
        }
      } else if (result.success && result.data && result.data.length > 0) {
        // Wrapped response object
        setDistrictRegistrations(result.data);
      } else {
        setDistrictRegistrations([]);
      }
    } catch (error) {
      console.error("Error fetching district registrations:", error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setMessage("Permission denied. You may not have the required role to access this feature.");
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setMessage("Authentication error. Please login again.");
        // Redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setMessage(error.message || "An error occurred while fetching data");
      }
      
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific district data by ID
  const fetchDistrictData = async (districtId) => {
    setIsLoading(true);
    try {
      console.log("Fetching district with ID:", districtId);
      const response = await authFetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/district-reg/?id=${districtId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch district data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET District Details API Response:", result);

      // Handle both array and object responses
      let districtData;
      
      if (Array.isArray(result)) {
        // Direct array response
        districtData = result.find(item => item.id.toString() === districtId.toString());
        if (!districtData) {
          throw new Error(`District with ID ${districtId} not found in response array`);
        }
      } else if (result.success) {
        // Wrapped response object
        if (Array.isArray(result.data)) {
          districtData = result.data.find(item => item.id.toString() === districtId.toString());
          if (!districtData) {
            throw new Error(`District with ID ${districtId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === districtId.toString()) {
            districtData = result.data;
          } else {
            throw new Error(`Returned district ID ${result.data.id} does not match requested ID ${districtId}`);
          }
        } else {
          throw new Error("Invalid district data structure in response");
        }
      } else {
        throw new Error(result.message || "No district data found in response");
      }

      setFormData({
        id: districtData.id,
        district_admin_id: districtData.district_admin_id || "",
        full_name: districtData.full_name,
        email: districtData.email,
        phone: districtData.phone,
        password: districtData.password, // Note: In a real app, you might not want to display the password
        allocated_district: districtData.allocated_district
      });

      setSelectedDistrictId(districtId);
    } catch (error) {
      console.error("Error fetching district data:", error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setMessage("Permission denied. You may not have the required role to access this feature.");
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setMessage("Authentication error. Please login again.");
        // Redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setMessage(error.message || "An error occurred while fetching district data");
      }
      
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle district card click
  const handleDistrictClick = (districtId) => {
    console.log("District card clicked with ID:", districtId);
    fetchDistrictData(districtId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedDistrictId) {
      fetchDistrictData(selectedDistrictId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to district list
  const backToDistrictList = () => {
    setSelectedDistrictId(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };



  // Handle form submission (PUT request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      // Prepare the data for submission
      const payload = {
        id: formData.id,
        district_admin_id: formData.district_admin_id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        allocated_district: formData.allocated_district
      };

      console.log("Submitting data for district ID:", formData.id);
      console.log("Payload:", payload);

      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/district-reg/",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      console.log("PUT Response status:", response.status);

      if (!response.ok) {
        // Handle specific error messages from the backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.detail || "Failed to update district registration"
        );
      }

      const result = await response.json();
      console.log("PUT Success response:", result);

      // Handle both array and object responses
      if (Array.isArray(result) || result.success) {
        setMessage("District registration updated successfully!");
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);

        // Update the district in the list
        if (result.data) {
          let updatedDistrict;
          if (Array.isArray(result.data)) {
            updatedDistrict = result.data.find(item => item.id === formData.id);
          } else {
            updatedDistrict = result.data;
          }
          
          if (updatedDistrict) {
            setDistrictRegistrations(prevDistricts => 
              prevDistricts.map(district => 
                district.id === formData.id ? updatedDistrict : district
              )
            );
          }
        }

        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to update district registration"
        );
      }
    } catch (error) {
      console.error("Error updating district registration:", error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setMessage("Permission denied. You may not have the required role to access this feature.");
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setMessage("Authentication error. Please login again.");
        // Redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setMessage(error.message || "Failed to update district registration");
      }
      
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
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
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <h1 className="page-title">Manage District Registrations</h1>

            {/* Alert for success/error messages */}
            {showAlert && (
              <Alert
                variant={variant}
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {message}
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading District Registrations...</p>
              </div>
            ) : (
              <>
                {!selectedDistrictId ? (
                  // District List View
                  <>
                    <Row className="mb-4">
                      <Col>
                       
                        {districtRegistrations.length === 0 ? (
                          <Alert variant="info">
                            No district registrations found.
                          </Alert>
                        ) : (
                          <Row>
                            {districtRegistrations.map((district) => (
                              <Col md={6} lg={4} className="mb-4" key={district.id}>
                                <Card 
                                  className="h-100 district-card profile-card" 
                                  onClick={() => handleDistrictClick(district.id)}
                                >
                                  <Card.Body>
                                    <div className="d-flex flex-column">
                                      <Card.Title as="h5" className="mb-3">
                                        {district.full_name}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>District Admin ID:</strong> {district.district_admin_id}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Email:</strong> {district.email}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Phone:</strong> {district.phone}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Allocated District:</strong> {district.allocated_district}
                                      </Card.Text>
                                    </div>
                                    <div className="d-flex justify-content-end mt-auto">
                                      <Button variant="outline-primary" size="sm">
                                        <FaEdit /> Edit
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Col>
                    </Row>
                  </>
                ) : (
                  // District Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToDistrictList}>
                        <FaArrowLeft /> Back to District List
                      </Button>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>District Admin ID</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="District Admin ID"
                          name="district_admin_id"
                          value={formData.district_admin_id}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter full name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter phone number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Allocated District</Form.Label>
                        <Form.Select
                          name="allocated_district"
                          value={formData.allocated_district}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        >
                          <option value="">Select a district</option>
                          {districts.map((district, index) => (
                            <option key={index} value={district}>{district}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Form>

                    <div className="d-flex gap-2 mt-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                          >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={resetForm}
                            type="button"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={enableEditing}
                          type="button"
                        >
                          Edit Registration Details
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default DistrictManageRegistration;
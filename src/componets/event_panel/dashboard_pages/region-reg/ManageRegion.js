import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import "../../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { useAuthFetch } from "../../../context/AuthFetch";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";

const ManageRegion = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all region registrations
  const [regionRegistrations, setRegionRegistrations] = useState([]);
  
  // Form state for selected region
  const [formData, setFormData] = useState({
    id: null,
    region_admin_id: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    allocated_district: []
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
  const [selectedRegionId, setSelectedRegionId] = useState(null);

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

  // Fetch all region registrations when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchAllRegionRegistrations();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all region registrations from API
  const fetchAllRegionRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/region-reg/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch region registrations");
      }

      const result = await response.json();
      console.log("GET All Region Registrations API Response:", result);

      // Check if the response is directly an array or wrapped in an object
      if (Array.isArray(result)) {
        // Direct array response
        if (result.length > 0) {
          setRegionRegistrations(result);
        } else {
          setRegionRegistrations([]);
        }
      } else if (result.success && result.data && result.data.length > 0) {
        // Wrapped response object
        setRegionRegistrations(result.data);
      } else {
        setRegionRegistrations([]);
      }
    } catch (error) {
      console.error("Error fetching region registrations:", error);
      
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

  // Fetch specific region data by ID
  const fetchRegionData = async (regionId) => {
    setIsLoading(true);
    try {
      console.log("Fetching region with ID:", regionId);
      const response = await authFetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/region-reg/?id=${regionId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch region data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Region Details API Response:", result);

      // Handle both array and object responses
      let regionData;
      
      if (Array.isArray(result)) {
        // Direct array response
        regionData = result.find(item => item.id.toString() === regionId.toString());
        if (!regionData) {
          throw new Error(`Region with ID ${regionId} not found in response array`);
        }
      } else if (result.success) {
        // Wrapped response object
        if (Array.isArray(result.data)) {
          regionData = result.data.find(item => item.id.toString() === regionId.toString());
          if (!regionData) {
            throw new Error(`Region with ID ${regionId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === regionId.toString()) {
            regionData = result.data;
          } else {
            throw new Error(`Returned region ID ${result.data.id} does not match requested ID ${regionId}`);
          }
        } else {
          throw new Error("Invalid region data structure in response");
        }
      } else {
        throw new Error(result.message || "No region data found in response");
      }

      setFormData({
        id: regionData.id,
        region_admin_id: regionData.region_admin_id || "",
        full_name: regionData.full_name,
        email: regionData.email,
        phone: regionData.phone,
        password: regionData.password, // Note: In a real app, you might not want to display the password
        allocated_district: Array.isArray(regionData.allocated_district) ? regionData.allocated_district : []
      });

      setSelectedRegionId(regionId);
    } catch (error) {
      console.error("Error fetching region data:", error);
      
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
        setMessage(error.message || "An error occurred while fetching region data");
      }
      
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle region card click
  const handleRegionClick = (regionId) => {
    console.log("Region card clicked with ID:", regionId);
    fetchRegionData(regionId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle district checkbox changes
  const handleDistrictChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const allocated_district = checked
        ? [...prev.allocated_district, value]
        : prev.allocated_district.filter((d) => d !== value);
      return { ...prev, allocated_district };
    });
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedRegionId) {
      fetchRegionData(selectedRegionId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to region list
  const backToRegionList = () => {
    setSelectedRegionId(null);
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
        region_admin_id: formData.region_admin_id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        allocated_district: formData.allocated_district
      };

      console.log("Submitting data for region ID:", formData.id);
      console.log("Payload:", payload);

      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/region-reg/",
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
          errorData.message || errorData.detail || "Failed to update region registration"
        );
      }

      const result = await response.json();
      console.log("PUT Success response:", result);

      // Handle both array and object responses
      if (Array.isArray(result) || result.success) {
        setMessage("Region registration updated successfully!");
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);

        // Update the region in the list
        if (result.data) {
          let updatedRegion;
          if (Array.isArray(result.data)) {
            updatedRegion = result.data.find(item => item.id === formData.id);
          } else {
            updatedRegion = result.data;
          }
          
          if (updatedRegion) {
            setRegionRegistrations(prevRegions => 
              prevRegions.map(region => 
                region.id === formData.id ? updatedRegion : region
              )
            );
          }
        }

        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to update region registration"
        );
      }
    } catch (error) {
      console.error("Error updating region registration:", error);
      
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
        setMessage(error.message || "Failed to update region registration");
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
            <h1 className="page-title">Manage Region Registrations</h1>

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
                <p className="mt-2">Loading Region Registrations...</p>
              </div>
            ) : (
              <>
                {!selectedRegionId ? (
                  // Region List View
                  <>
                    <Row className="mb-4">
                      <Col>
                       
                        {regionRegistrations.length === 0 ? (
                          <Alert variant="info">
                            No region registrations found.
                          </Alert>
                        ) : (
                          <Row>
                            {regionRegistrations.map((region) => (
                              <Col md={6} lg={4} className="mb-4" key={region.id}>
                                <Card 
                                  className="h-100 region-card profile-card" 
                                  onClick={() => handleRegionClick(region.id)}
                                >
                                  <Card.Body>
                                    <div className="d-flex flex-column">
                                      <Card.Title as="h5" className="mb-3">
                                        {region.full_name}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Region Admin ID:</strong> {region.region_admin_id}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Email:</strong> {region.email}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Phone:</strong> {region.phone}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Allocated Districts:</strong> {Array.isArray(region.allocated_district) ? region.allocated_district.join(", ") : region.allocated_district}
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
                  // Region Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToRegionList}>
                        <FaArrowLeft /> Back to Region List
                      </Button>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Region Admin ID</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Region Admin ID"
                          name="region_admin_id"
                          value={formData.region_admin_id}
                          onChange={handleChange}
                          required
                          disabled={true}
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
                          disabled={true}
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
                          disabled={true}
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
                        <Form.Label>Allocated Districts</Form.Label>
                        <div className="border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {districts.map((district) => (
                            <Form.Check
                              key={district}
                              type="checkbox"
                              id={`district_${district}`}
                              label={district}
                              value={district}
                              checked={formData.allocated_district.includes(district)}
                              onChange={handleDistrictChange}
                              className="mb-2"
                              disabled={!isEditing}
                            />
                          ))}
                        </div>
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

export default ManageRegion;
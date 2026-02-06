import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Spinner, ListGroup, Badge } from "react-bootstrap";
import { FaSave, FaTimes, FaEnvelope, FaUsers } from "react-icons/fa";

import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import RegionregLeftNav from "../RegionregLeftNav";
import RegionregHeader from "../RegionregHeader";


const RegionMail = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    region_admin_id: "",
    member_ids: [],
    subject: "",
    message: ""
  });
  
  // API data state
  const [members, setMembers] = useState([]);
  const [regionAdminId, setRegionAdminId] = useState("");
  const [regionAdminName, setRegionAdminName] = useState("");
  
  // Form validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch members on component mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchMembers();
    }
  }, [authLoading, isAuthenticated]);

  // Extract district from unique_id
  const getDistrictFromUniqueId = (uniqueId) => {
    // Prefer allocated_district from auth if available
    if (auth?.allocated_district) return auth.allocated_district;

    // Fallback: try to derive district from uniqueId if possible
    if (!uniqueId) return "";
    // If uniqueId contains district info in some format, implement parsing here.
    // Otherwise return empty string so caller can handle it.
    return "";
  };

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
    setErrors({});

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
        setErrors({ 
          fetch: "Permission denied. You may not have the required role to access this feature." 
        });
      } else if (
        error.message.includes("401") ||
        error.message.includes("authenticated") ||
        error.message.includes("Session expired")
      ) {
        setErrors({ 
          fetch: "Authentication error. Please login again." 
        });
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else if (error.message.includes("404")) {
        setErrors({ 
          fetch: "API endpoint not found. Please contact the administrator." 
        });
      } else if (
        error.message.includes("500") ||
        error.message.includes("Server error")
      ) {
        setErrors({ 
          fetch: error.message 
        });
      } else {
        setErrors({ 
          fetch: error.message || "An error occurred while fetching member data" 
        });
      }

      setMembers([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegionMailData = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/region-mail/', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to fetch region mail data');
      }
      
      const data = await response.json();
      console.log('Region mail data:', data);
      
      // Set region admin ID and name
      if (data.region_admin_id) {
        setRegionAdminId(data.region_admin_id);
        setFormData(prev => ({ ...prev, region_admin_id: data.region_admin_id }));
      }
      
      // Set region admin name if available
      if (data.region_admin_name) {
        setRegionAdminName(data.region_admin_name);
      } else if (auth?.name) {
        setRegionAdminName(auth.name);
      }
      
    } catch (error) {
      console.error('Error fetching region mail data:', error);
      setErrors({ fetch: error.message || "Failed to fetch region mail data. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  // Handle checkbox changes
  const handleMemberSelection = (memberId) => {
    const idStr = String(memberId);
    setFormData(prev => {
      if (prev.member_ids.includes(idStr)) {
        // Remove member if already selected
        return {
          ...prev,
          member_ids: prev.member_ids.filter(id => id !== idStr)
        };
      } else {
        // Add member if not selected
        return {
          ...prev,
          member_ids: [...prev.member_ids, idStr]
        };
      }
    });
    
    // Clear error for this field if it exists
    if (errors.member_ids) {
      setErrors({
        ...errors,
        member_ids: null
      });
    }
  };

  // Handle Select All
  const handleSelectAll = () => {
    const allMemberIds = members.map(member => String(member.member_id || member.unique_id || member.id));
    setFormData(prev => ({
      ...prev,
      member_ids: allMemberIds
    }));
    
    // Clear error for this field if it exists
    if (errors.member_ids) {
      setErrors({
        ...errors,
        member_ids: null
      });
    }
  };

  // Handle Deselect All
  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      member_ids: []
    }));
    
    // Clear error for this field if it exists
    if (errors.member_ids) {
      setErrors({
        ...errors,
        member_ids: null
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.member_ids.length === 0) {
      newErrors.member_ids = "Please select at least one member";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");
    
    try {
      // Create the payload with the required fields
      const payload = {
        region_admin_id: formData.region_admin_id || auth?.unique_id || regionAdminId,
        member_ids: formData.member_ids,
        subject: formData.subject,
        message: formData.message
      };
      
      console.log('Sending payload:', payload);
      
      // API call using authFetch to the correct endpoint
      const response = await authFetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/region-mail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // Handle 403 specifically
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action. Please contact your administrator.');
      }
      
      if (!response.ok) {
        // Handle specific error messages from the backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to send mail');
      }
      
      const result = await response.json();
      console.log('Success:', result);
      
      setSuccessMessage("Mail sent successfully!");
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          region_admin_id: regionAdminId,
          member_ids: [],
          subject: "",
          message: ""
        });
        setSuccessMessage("");
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setErrors({ 
          submit: "Permission denied. You may not have the required role to access this feature." 
        });
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setErrors({ 
          submit: "Authentication error. Please login again." 
        });
        // Optionally redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setErrors({ submit: error.message || "Failed to send mail. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <Container fluid className="dashboard-body dashboard-main-container">
            <h1 className="page-title">
              <FaEnvelope className="me-2" />
              Region Mail
            </h1>
            
            {successMessage && (
              <Alert variant="success" className="mb-4">
                {successMessage}
              </Alert>
            )}
            
            {errors.submit && (
              <Alert variant="danger" className="mb-4">
                {errors.submit}
              </Alert>
            )}
            
            {errors.fetch && (
              <Alert variant="danger" className="mb-4">
                {errors.fetch}
              </Alert>
            )}
            
            {isLoading ? (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <Card className="p-4">
                <Form onSubmit={handleSubmit}>
                 
                  
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group controlId="members">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <Form.Label className="mb-0">
                            <FaUsers className="me-1" />
                            Select Members
                          </Form.Label>
                          {members.length > 0 && (
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleSelectAll}
                              >
                                Select All
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleDeselectAll}
                              >
                                Deselect All
                              </Button>
                            </div>
                          )}
                        </div>
                        {errors.member_ids && (
                          <div className="text-danger small mt-1">{errors.member_ids}</div>
                        )}
                        
                        {members.length > 0 ? (
                          <ListGroup className="mt-2">
                            {members.map((member) => (
                              <ListGroup.Item key={member.id || member.unique_id} className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  {(() => {
                                    const memberKey = String(member.member_id || member.unique_id || member.id);
                                    return (
                                      <Form.Check
                                        type="checkbox"
                                        id={`member-${memberKey}`}
                                        checked={formData.member_ids.includes(memberKey)}
                                        onChange={() => handleMemberSelection(memberKey)}
                                        className="me-3"
                                      />
                                    );
                                  })()}
                                  <div>
                                    <div className="fw-bold">{member.full_name || member.name || 'N/A'}</div>
                                    <div className="text-muted small">{member.email || 'N/A'}</div>
                                    <Badge bg="secondary" className="mt-1">{member.district || member.allocated_district || 'N/A'}</Badge>
                                  </div>
                                </div>
                                    <div className="text-muted small">{member.member_id || member.id || member.unique_id}</div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <Alert variant="info" className="mt-2">
                            No members found for this district.
                          </Alert>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group controlId="subject">
                        <Form.Label>Subject</Form.Label>
                        <Form.Control
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          isInvalid={!!errors.subject}
                          placeholder="Enter email subject"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.subject}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group controlId="message">
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          isInvalid={!!errors.message}
                          placeholder="Enter your message"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="secondary" 
                      className="me-2"
                      onClick={() => navigate('/DistrictDashboard')}
                    >
                      <FaTimes className="me-1" /> Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={isSubmitting}
                      className="d-flex align-items-center btn-lg"
                    >
                      <FaSave className="me-1" /> 
                      {isSubmitting ? 'Sending...' : 'Send Mail'}
                    </Button>
                  </div>
                </Form>
              </Card>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};
 
export default RegionMail;
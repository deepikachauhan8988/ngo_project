import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Spinner, ListGroup, Badge } from "react-bootstrap";
import { FaSave, FaTimes, FaEnvelope, FaUsers } from "react-icons/fa";

import "../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import DashBoardHeader from "../event_panel/DashBoardHeader";
import { useAuth } from "../context/AuthContext";
import { useAuthFetch } from "../context/AuthFetch";
import DistrictLeftNav from "./DistrictLeftNav";

const DistrictMailMeeting = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    district_admin_id: "",
    member_ids: [],
    subject: "",
    message: ""
  });
  
  // API data state
  const [members, setMembers] = useState([]);
  const [districtAdminId, setDistrictAdminId] = useState("");
  const [districtAdminName, setDistrictAdminName] = useState("");
  
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

  // Fetch members from API (similar to DistrictRegistration)
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      // Get district from auth.allocated_district or unique_id fallback
      const district = auth?.allocated_district || getDistrictFromUniqueId(auth?.unique_id);

      // Create URL with query parameters
      const url = new URL(`https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/`);
      if (district) url.searchParams.append('district', district);

      // Make authenticated request using authFetch
      const response = await authFetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

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
      setErrors({ 
        fetch: error.message.includes('403') || error.message.includes('permission')
          ? "Permission denied. You may not have the required role to access this feature."
          : error.message.includes('401') || error.message.includes('authenticated') || error.message.includes('Session expired')
          ? "Authentication error. Please login again."
          : error.message || "An error occurred while fetching member data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistrictMailData = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/district-mail/', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to fetch district mail data');
      }
      
      const data = await response.json();
      console.log('District mail data:', data);
      
      // Set district admin ID and name
      if (data.district_admin_id) {
        setDistrictAdminId(data.district_admin_id);
        setFormData(prev => ({ ...prev, district_admin_id: data.district_admin_id }));
      }
      
      // Set district admin name if available
      if (data.district_admin_name) {
        setDistrictAdminName(data.district_admin_name);
      } else if (auth?.name) {
        setDistrictAdminName(auth.name);
      }
      
    } catch (error) {
      console.error('Error fetching district mail data:', error);
      setErrors({ fetch: error.message || "Failed to fetch district mail data. Please try again." });
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
        district_admin_id: formData.district_admin_id || auth?.unique_id || districtAdminId,
        member_ids: formData.member_ids,
        subject: formData.subject,
        message: formData.message
      };
      
      console.log('Sending payload:', payload);
      
      // API call using authFetch to the correct endpoint
      const response = await authFetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/district-mail/', {
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
          district_admin_id: districtAdminId,
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
            <h1 className="page-title">
              <FaEnvelope className="me-2" />
              District Mail
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
                        <Form.Label>
                          <FaUsers className="me-1" />
                          Select Members
                        </Form.Label>
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
 
export default DistrictMailMeeting;
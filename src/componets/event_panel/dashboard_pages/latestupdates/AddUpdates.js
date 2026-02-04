import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";
import { FaLink, FaHeading, FaSave } from "react-icons/fa";
import { useAuthFetch } from "../../../context/AuthFetch";

const AddUpdates = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    link: ""
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    }
    
    if (!formData.link.trim()) {
      errors.link = "Link is required";
    } else {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.link)) {
        errors.link = "Please enter a valid URL";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await authFetch(
        'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/latest-update-items/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Latest update created successfully!");
        // Reset form
        setFormData({
          title: "",
          link: ""
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/ManageUpdates');
        }, 2000);
      } else {
        setError(data.message || "Failed to create latest update. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error('Error creating latest update:', err);
    } finally {
      setLoading(false);
    }
  };

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

          <Container fluid className="dashboard-body dashboard-main-container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="page-title mb-1">Add Latest Update</h1>
                <p className="text-muted mb-0">Create a new latest update item</p>
              </div>
            </div>

            {/* Alert Messages */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess("")}>
                {success}
              </Alert>
            )}

            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    {/* Title Field */}
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          <FaHeading className="me-2" />
                          Title <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter update title"
                          isInvalid={!!validationErrors.title}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.title}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Link Field */}
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          <FaLink className="me-2" />
                          Link <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="link"
                          value={formData.link}
                          onChange={handleChange}
                          placeholder="Enter URL (e.g., https://example.com)"
                          isInvalid={!!validationErrors.link}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.link}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Enter a valid URL starting with http:// or https://
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Submit Button */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/ManageUpdates')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      <FaSave className="me-2" />
                      {loading ? "Saving..." : "Save Update"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    </>
  );
};

export default AddUpdates;

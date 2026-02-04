import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert } from "react-bootstrap";
import { FaSave, FaTimes } from "react-icons/fa";

import "../../../../assets/css/dashboard.css";

import { useNavigate } from "react-router-dom";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";
import { useAuthFetch } from "../../../context/AuthFetch";

const AddWings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    organization_name: "",
    native_wing: "",
    short_description: "",
    address: "",
    contact_person_name: "",
    phone: "",
    email: "",
    image: null
  });
  
  // Form validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

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

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organization_name.trim()) {
      newErrors.organization_name = "Organization name is required";
    }
    
    if (!formData.native_wing.trim()) {
      newErrors.native_wing = "Nature of Work is required";
    }
    
    if (!formData.short_description.trim()) {
      newErrors.short_description = "Description is required";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!formData.contact_person_name.trim()) {
      newErrors.contact_person_name = "Contact person name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number should be 10 digits";
    }
    
    return newErrors;
  };

  // Initialize authFetch
  const authFetch = useAuthFetch();
  
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
      // Create FormData for file upload
      const data = new FormData();
      data.append('organization_name', formData.organization_name);
      data.append('native_wing', formData.native_wing);
      data.append('short_description', formData.short_description);
      data.append('address', formData.address);
      data.append('contact_person_name', formData.contact_person_name);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      // API call using authFetch
      const response = await authFetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/', {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to add wing details');
      }
      
      const result = await response.json();
      console.log('Success:', result);
      
      setSuccessMessage("Wing details added successfully!");
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          organization_name: "",
          native_wing: "",
          short_description: "",
          address: "",
          contact_person_name: "",
          phone: "",
          email: "",
          image: null
        });
        setImagePreview(null);
        setSuccessMessage("");
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: "Failed to submit form. Please try again." });
    } finally {
      setIsSubmitting(false);
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

          <Container fluid className="dashboard-body dashboard-main-container">
            <h1 className="page-title">Add Wing Details</h1>
            
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
            
            <Card className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="organization_name">
                      <Form.Label>Organization Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleInputChange}
                        isInvalid={!!errors.organization_name}
                        placeholder="Enter organization name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organization_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="native_wing">
                      <Form.Label>Nature Of Work</Form.Label>
                      <Form.Control
                        type="text"
                        name="native_wing"
                        value={formData.native_wing}
                        onChange={handleInputChange}
                        isInvalid={!!errors.native_wing}
                        placeholder="Enter wing name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.native_wing}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="contact_person_name">
                      <Form.Label>Contact Person Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleInputChange}
                        isInvalid={!!errors.contact_person_name}
                        placeholder="Enter contact person name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contact_person_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        isInvalid={!!errors.email}
                        placeholder="Enter email address"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="phone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        isInvalid={!!errors.phone}
                        placeholder="Enter phone number"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="image">
                      <Form.Label>Portfolio  Image</Form.Label>
                      <Form.Control
                        type="file"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={imagePreview} 
                            alt="Image preview" 
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
                          />
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!errors.address}
                    placeholder="Enter address"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group controlId="short_description" className="mb-4">
                  <Form.Label>Short Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    isInvalid={!!errors.short_description}
                    placeholder="Enter short description"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.short_description}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    <FaTimes className="me-1" /> Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSubmitting}
                    className="d-flex align-items-center"
                  >
                    <FaSave className="me-1" /> 
                    {isSubmitting ? 'Saving...' : 'Save Wing'}
                  </Button>
                </div>
              </Form>
            </Card>
          </Container>
        </div>
      </div>
    </>
  );
};

export default AddWings;
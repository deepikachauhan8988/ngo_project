import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Image } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin } from 'react-icons/fa';

function FeedbackPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);

  // Fetch company details on component mount
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/company-detail-item/');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setCompanyData(data.data[0]);
        } else {
          setCompanyError('Failed to load company information');
        }
      } catch (error) {
        setCompanyError('Error fetching company details');
        console.error('Error fetching company details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_number.replace(/\s/g, ''))) {
      newErrors.mobile_number = 'Mobile number should be 10 digits';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/contact-us/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Your message has been sent successfully!' });
        setFormData({
          full_name: '',
          email: '',
          mobile_number: '',
          message: ''
        });
      } else {
        const errorData = await response.json();
        setSubmitStatus({ 
          type: 'error', 
          message: errorData.message || 'Failed to send your message. Please try again.' 
        });
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format address to replace \r\n with <br />
  const formatAddress = (address) => {
    return address ? address.split('\r\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < address.split('\r\n').length - 1 && <br />}
      </React.Fragment>
    )) : null;
  };

  return (
    <div>

          <div className="container border rounded-3 shadow-lg p-4 bg-white mt-2">
     
      
      <Row className="justify-content-center">
        {/* Company Details Section */}
        <Col md={5} className="mb-4 mb-md-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : companyError ? (
            <Alert variant="danger">{companyError}</Alert>
          ) : companyData ? (
            <Card className="company-details-card h-100">
              <Card.Body className="p-4">
            
                
                <div className="company-info">
                  <div className="info-item mb-3">
                    <div className="d-flex align-items-start">
                      <FaMapMarkerAlt className="info-icon me-3 mt-1 text-primary" />
                      <div>
                        <h5 className="info-title">Address</h5>
                        <p className="info-text">{formatAddress(companyData.address)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-item mb-3">
                    <div className="d-flex align-items-center">
                      {/* <FaPhone className="info-icon me-3 text-primary" /> */}
                      <div>
                        {/* <h5 className="info-title">Phone</h5> */}
                        <p className="info-text">{companyData.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-item mb-3">
                    <div className="d-flex align-items-center">
                      <FaEnvelope className="info-icon me-3 text-primary" />
                      <div>
                        <h5 className="info-title">Email</h5>
                        <p className="info-text">admin@ngo.in</p>
                      </div>
                    </div>
                  </div>
                  
                  {companyData.profile_link && companyData.profile_link.length > 0 && (
                    <div className="info-item">
                      <div className="d-flex align-items-center">
                        <FaLinkedin className="info-icon me-3 text-primary" />
                        <div>
                          <h5 className="info-title">Connect With Us</h5>
                          <a 
                            href={companyData.profile_link[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="social-link"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info">No company information available</Alert>
          )}
        </Col>
        
        {/* Contact Form Section */}
        <Col md={5}>
          <Card className="contact-form-card ">
            <Card.Body className="p-4">
              <h2 className="form-title text-center mb-3">Get In Touch</h2>
              <p className="form-subtitle text-center mb-4">Send us a message and we'll respond as soon as possible.</p>
              
              {submitStatus && (
                <Alert variant={submitStatus.type === 'success' ? 'success' : 'danger'} className="mb-4">
                  {submitStatus.message}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="full_name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    isInvalid={!!errors.full_name}
                    placeholder="Enter name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.full_name}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter email ID"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="mobile_number">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    isInvalid={!!errors.mobile_number}
                    placeholder="Enter Phone Number "
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.mobile_number}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="message">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    isInvalid={!!errors.message}
                    placeholder="I would like to know more about your services."
                    rows={5}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.message}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="text-center">
                  <Button 
                    variant="primary" 
                    type="submit"  
                    disabled={isSubmitting}
                    size="lg"
                    className="px-4 sent-btn"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
  
    </div>
    </div>
  );
}

export default FeedbackPage;
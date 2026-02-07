import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaSave, FaTimes, FaGlobe } from "react-icons/fa";

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
  const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi
  
  // Function to format file size to KB
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Translations for English and Hindi
  const translations = {
    en: {
      pageTitle: "Add Wing Details",
      organizationName: "Organization Name",
      organizationNamePlaceholder: "Enter organization name",
      natureOfWork: "Nature Of Work",
      natureOfWorkPlaceholder: "Enter wing name",
      contactPerson: "Contact Person Name",
      contactPersonPlaceholder: "Enter contact person name",
      email: "Email",
      emailPlaceholder: "Enter email address",
      phone: "Phone Number",
      phonePlaceholder: "Enter phone number",
      portfolioImage: "Portfolio Image",
      imageSizeNote: "Upload an image between 50KB and 100KB",
      address: "Address",
      addressPlaceholder: "Enter address",
      shortDescription: "Short Description",
      shortDescriptionPlaceholder: "Enter short description",
      cancel: "Cancel",
      save: "Save Wing",
      saving: "Saving...",
      successMessage: "Wing details added successfully!",
      submitError: "Failed to submit form. Please try again.",
      imageSizeError: "Image size must be between 50KB and 100KB.",
      fileSize: "File size:",
      required: "is required",
      invalid: "is invalid",
      phoneDigits: "Phone number should be 10 digits"
    },
    hi: {
      pageTitle: "विंग विवरण जोड़ें",
      organizationName: "संगठन का नाम",
      organizationNamePlaceholder: "संगठन का नाम दर्ज करें",
      natureOfWork: "काम की प्रकृति",
      natureOfWorkPlaceholder: "विंग का नाम दर्ज करें",
      contactPerson: "संपर्क व्यक्ति का नाम",
      contactPersonPlaceholder: "संपर्क व्यक्ति का नाम दर्ज करें",
      email: "ईमेल",
      emailPlaceholder: "ईमेल पता दर्ज करें",
      phone: "फोन नंबर",
      phonePlaceholder: "फोन नंबर दर्ज करें",
      portfolioImage: "पोर्टफोलियो चित्र",
      imageSizeNote: "50KB से 100KB के बीच एक चित्र अपलोड करें",
      address: "पता",
      addressPlaceholder: "पता दर्ज करें",
      shortDescription: "संक्षिप्त विवरण",
      shortDescriptionPlaceholder: "संक्षिप्त विवरण दर्ज करें",
      cancel: "रद्द करें",
      save: "विंग सहेजें",
      saving: "सहेजा जा रहा है...",
      successMessage: "विंग विवरण सफलतापूर्वक जोड़ा गया!",
      submitError: "फॉर्म सबमिट करने में विफल। कृपया फिर से कोशिश करें।",
      imageSizeError: "चित्र का आकार 50KB से 100KB के बीच होना चाहिए।",
      fileSize: "फाइल आकार:",
      required: "आवश्यक है",
      invalid: "अमान्य है",
      phoneDigits: "फोन नंबर 10 अंकों का होना चाहिए"
    }
  };
  
  // Get current language translations
  const t = translations[language];
  
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
  const [imageError, setImageError] = useState(null);

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

  // Handle image upload with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    // Clear previous image error
    setImageError(null);
    
    if (file) {
      // Check file size (50KB to 100KB)
      const fileSizeKB = file.size / 1024;
      
      if (fileSizeKB < 50 || fileSizeKB > 100) {
        setImageError(`${t.imageSizeError} ${t.fileSize} ${formatFileSize(file.size)}.`);
        // Clear the image preview if the size is invalid
        setImagePreview(null);
        // Clear the image from formData
        setFormData({
          ...formData,
          image: null
        });
        // Reset the file input
        e.target.value = '';
        return;
      }
      
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
      newErrors.organization_name = `${t.organizationName} ${t.required}`;
    }
    
    if (!formData.native_wing.trim()) {
      newErrors.native_wing = `${t.natureOfWork} ${t.required}`;
    }
    
    if (!formData.short_description.trim()) {
      newErrors.short_description = `${t.shortDescription} ${t.required}`;
    }
    
    if (!formData.address.trim()) {
      newErrors.address = `${t.address} ${t.required}`;
    }
    
    if (!formData.contact_person_name.trim()) {
      newErrors.contact_person_name = `${t.contactPerson} ${t.required}`;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = `${t.email} ${t.required}`;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = `${t.email} ${t.invalid}`;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = `${t.phone} ${t.required}`;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = t.phoneDigits;
    }
    
    // Check for image validation errors
    if (imageError) {
      newErrors.image = imageError;
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
      
      // Different API endpoints based on language
      let apiUrl;
      if (language === 'en') {
        // English API endpoint (actual endpoint)
        apiUrl = 'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/';
      } else {
        // Hindi API endpoint (dummy for now)
        apiUrl = 'https://dummy-api-for-hindi.com/ngoproject/ngoproject_backend/api/associative-wings-hindi/';
      }
      
      // API call using authFetch
      const response = await authFetch(apiUrl, {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to add wing details');
      }
      
      const result = await response.json();
      console.log('Success:', result);
      
      setSuccessMessage(t.successMessage);
      
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
        setImageError(null);
        setSuccessMessage("");
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: t.submitError });
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title">{t.pageTitle}</h1>
              
              {/* Language Toggle */}
              <div className="language-toggle">
                <ToggleButtonGroup type="radio" name="language" value={language} onChange={(val) => setLanguage(val)}>
                  <ToggleButton id="lang-en" value="en" variant={language === 'en' ? 'primary' : 'outline-primary'}>
                    English
                  </ToggleButton>
                  <ToggleButton id="lang-hi" value="hi" variant={language === 'hi' ? 'primary' : 'outline-primary'}>
                    हिंदी
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>
            
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
                      <Form.Label>{t.organizationName}</Form.Label>
                      <Form.Control
                        type="text"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleInputChange}
                        isInvalid={!!errors.organization_name}
                        placeholder={t.organizationNamePlaceholder}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organization_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="native_wing">
                      <Form.Label>{t.natureOfWork}</Form.Label>
                      <Form.Control
                        type="text"
                        name="native_wing"
                        value={formData.native_wing}
                        onChange={handleInputChange}
                        isInvalid={!!errors.native_wing}
                        placeholder={t.natureOfWorkPlaceholder}
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
                      <Form.Label>{t.contactPerson}</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleInputChange}
                        isInvalid={!!errors.contact_person_name}
                        placeholder={t.contactPersonPlaceholder}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contact_person_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="email">
                      <Form.Label>{t.email}</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        isInvalid={!!errors.email}
                        placeholder={t.emailPlaceholder}
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
                      <Form.Label>{t.phone}</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        isInvalid={!!errors.phone}
                        placeholder={t.phonePlaceholder}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="image">
                      <Form.Label>{t.portfolioImage}</Form.Label>
                      <Form.Control
                        type="file"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                        isInvalid={!!errors.image}
                      />
                      <Form.Text className="text-muted">
                        {t.imageSizeNote}
                      </Form.Text>
                      {imageError && (
                        <div className="text-danger mt-1">{imageError}</div>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.image}
                      </Form.Control.Feedback>
                      {imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={imagePreview} 
                            alt="Image preview" 
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
                          />
                          {formData.image && (
                            <div className="mt-1">
                              <small className="text-muted">{t.fileSize} {formatFileSize(formData.image.size)}</small>
                            </div>
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>{t.address}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!errors.address}
                    placeholder={t.addressPlaceholder}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group controlId="short_description" className="mb-4">
                  <Form.Label>{t.shortDescription}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    isInvalid={!!errors.short_description}
                    placeholder={t.shortDescriptionPlaceholder}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.short_description}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => navigate('/DashBoard')}
                  >
                    <FaTimes className="me-1" /> {t.cancel}
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSubmitting}
                    className="d-flex align-items-center"
                  >
                    <FaSave className="me-1" /> 
                    {isSubmitting ? t.saving : t.save}
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
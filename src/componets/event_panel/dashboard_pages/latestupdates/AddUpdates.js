import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";
import { FaLink, FaHeading, FaSave, FaGlobe } from "react-icons/fa";
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
  const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    link: ""
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Translations for English and Hindi
  const translations = {
    en: {
      pageTitle: "Add Latest Update",
      pageSubtitle: "Create a new latest update item",
      title: "Title",
      link: "Link",
      enterTitle: "Enter update title",
      enterLink: "Enter URL (e.g., https://example.com)",
      titleRequired: "Title is required",
      titleMinLength: "Title must be at least 3 characters",
      linkRequired: "Link is required",
      linkInvalid: "Please enter a valid URL",
      cancel: "Cancel",
      saveUpdate: "Save Update",
      saving: "Saving...",
      successMessage: "Latest update created successfully!",
      errorMessage: "Failed to create latest update. Please try again.",
      networkError: "Network error. Please check your connection and try again.",
      urlNote: "Enter a valid URL starting with http:// or https://",
      required: "is required"
    },
    hi: {
      pageTitle: "नवीनतम अपडेट जोड़ें",
      pageSubtitle: "एक नया नवीनतम अपडेट आइटम बनाएं",
      title: "शीर्षक",
      link: "लिंक",
      enterTitle: "अपडेट शीर्षक दर्ज करें",
      enterLink: "URL दर्ज करें (उदा. https://example.com)",
      titleRequired: "शीर्षक आवश्यक है",
      titleMinLength: "शीर्षक कम से कम 3 अक्षरों का होना चाहिए",
      linkRequired: "लिंक आवश्यक है",
      linkInvalid: "कृपया एक वैध URL दर्ज करें",
      cancel: "रद्द करें",
      saveUpdate: "अपडेट सहेजें",
      saving: "सहेजा जा रहा है...",
      successMessage: "नवीनतम अपडेट सफलतापूर्वक बनाया गया!",
      errorMessage: "नवीनतम अपडेट बनाने में विफल। कृपया फिर से कोशिश करें।",
      networkError: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें और फिर से कोशिश करें।",
      urlNote: "http:// या https:// से शुरू होने वाला एक वैध URL दर्ज करें",
      required: "आवश्यक है"
    }
  };
  
  // Get current language translations
  const t = translations[language];

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
      errors.title = t.titleRequired;
    } else if (formData.title.length < 3) {
      errors.title = t.titleMinLength;
    }
    
    if (!formData.link.trim()) {
      errors.link = t.linkRequired;
    } else {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.link)) {
        errors.link = t.linkInvalid;
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
      // Different API endpoints based on language
      let apiUrl;
      if (language === 'en') {
        // English API endpoint (actual endpoint)
        apiUrl = 'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/latest-update-items/';
      } else {
        // Hindi API endpoint (dummy for now)
        apiUrl = 'https://dummy-api-for-hindi.com/ngoproject/ngoproject_backend/api/latest-update-items-hindi/';
      }
      
      const response = await authFetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(t.successMessage);
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
        setError(data.message || t.errorMessage);
      }
    } catch (err) {
      setError(t.networkError);
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
                <h1 className="page-title mb-1">{t.pageTitle}</h1>
                <p className="text-muted mb-0">{t.pageSubtitle}</p>
              </div>
              
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
                          {t.title} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder={t.enterTitle}
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
                          {t.link} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="link"
                          value={formData.link}
                          onChange={handleChange}
                          placeholder={t.enterLink}
                          isInvalid={!!validationErrors.link}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.link}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {t.urlNote}
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
                      {t.cancel}
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      <FaSave className="me-2" />
                      {loading ? t.saving : t.saveUpdate}
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
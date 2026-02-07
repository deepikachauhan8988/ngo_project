import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Spinner, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaSave, FaTimes, FaGlobe } from "react-icons/fa";

import "../../../../assets/css/dashboard.css";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { useAuthFetch } from "../../../context/AuthFetch";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";

const RegionRegistration = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "", 
    allocated_district: []
  });
  
  // Form validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Translations for English and Hindi
  const translations = {
    en: {
      pageTitle: "Region Registration",
      fullName: "Full Name",
      email: "Email",
      phoneNumber: "Phone Number",
      password: "Password",
      allocatedDistricts: "Allocated Districts",
      enterFullName: "Enter full name",
      enterEmail: "Enter email address",
      enterPhone: "Enter 10-digit phone number",
      enterPassword: "Enter password (min 6 characters)",
      fullNameRequired: "Full name is required",
      emailRequired: "Email is required",
      emailInvalid: "Email is invalid",
      phoneRequired: "Phone number is required",
      phoneDigits: "Phone number should be 10 digits",
      passwordRequired: "Password is required",
      passwordLength: "Password should be at least 6 characters",
      districtRequired: "Please select at least one district",
      reset: "Reset",
      submit: "Submit",
      submitting: "Submitting...",
      successMessage: "Region registered successfully!",
      permissionDenied: "Permission denied. You may not have the required role to access this feature.",
      authError: "Authentication error. Please login again.",
      submitError: "Failed to submit form. Please try again.",
      authenticationRequired: "Authentication Required",
      needToLogin: "You need to be logged in to view this page.",
      goToLogin: "Go to Login",
      loading: "Loading...",
      haridwar: "Haridwar",
      dehradun: "Dehradun",
      uttarkashi: "Uttarkashi",
      chamoli: "Chamoli",
      rudraprayag: "Rudraprayag",
      tehriGarhwal: "Tehri Garhwal",
      pauriGarhwal: "Pauri Garhwal",
      nainital: "Nainital",
      almora: "Almora",
      pithoragarh: "Pithoragarh",
      udhamSinghNagar: "Udham Singh Nagar",
      bageshwar: "Bageshwar",
      champawat: "Champawat"
    },
    hi: {
      pageTitle: "क्षेत्र पंजीकरण",
      fullName: "पूरा नाम",
      email: "ईमेल",
      phoneNumber: "फोन नंबर",
      password: "पासवर्ड",
      allocatedDistricts: "आवंटित जिले",
      enterFullName: "पूरा नाम दर्ज करें",
      enterEmail: "ईमेल पता दर्ज करें",
      enterPhone: "10 अंकों का फोन नंबर दर्ज करें",
      enterPassword: "पासवर्ड दर्ज करें (न्यूनतम 6 अक्षर)",
      fullNameRequired: "पूरा नाम आवश्यक है",
      emailRequired: "ईमेल आवश्यक है",
      emailInvalid: "ईमेल अमान्य है",
      phoneRequired: "फोन नंबर आवश्यक है",
      phoneDigits: "फोन नंबर 10 अंकों का होना चाहिए",
      passwordRequired: "पासवर्ड आवश्यक है",
      passwordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
      districtRequired: "कृपया कम से कम एक जिला चुनें",
      reset: "रीसेट करें",
      submit: "सबमिट करें",
      submitting: "सबमिट हो रहा है...",
      successMessage: "क्षेत्र सफलतापूर्वक पंजीकृत हुआ!",
      permissionDenied: "अनुमति नहीं। आपके पास इस सुविधा तक पहुंचने के लिए आवश्यक भूमिका नहीं हो सकती है।",
      authError: "प्रमाणीकरण त्रुटि। कृपया फिर से लॉगिन करें।",
      submitError: "फॉर्म सबमिट करने में विफल। कृपया फिर से कोशिश करें।",
      authenticationRequired: "प्रमाणीकरण आवश्यक",
      needToLogin: "इस पृष्ठ को देखने के लिए आपको लॉग इन करना होगा।",
      goToLogin: "लॉगिन पर जाएं",
      loading: "लोड हो रहा है...",
      haridwar: "हरिद्वार",
      dehradun: "देहरादून",
      uttarkashi: "उत्तरकाशी",
      chamoli: "चमोली",
      rudraprayag: "रुद्रप्रयाग",
      tehriGarhwal: "टिहरी गढ़वाल",
      pauriGarhwal: "पौड़ी गढ़वाल",
      nainital: "नैनीताल",
      almora: "अल्मोड़ा",
      pithoragarh: "पिथौरागढ़",
      udhamSinghNagar: "उधम सिंह नगर",
      bageshwar: "बागेश्वर",
      champawat: "चंपावत"
    }
  };
  
  // Get current language translations
  const t = translations[language];
  
  // District options with translations
  const districts = [
    { value: "Haridwar", label: t.haridwar },
    { value: "Dehradun", label: t.dehradun },
    { value: "Uttarkashi", label: t.uttarkashi },
    { value: "Chamoli", label: t.chamoli },
    { value: "Rudraprayag", label: t.rudraprayag },
    { value: "Tehri Garhwal", label: t.tehriGarhwal },
    { value: "Pauri Garhwal", label: t.pauriGarhwal },
    { value: "Nainital", label: t.nainital },
    { value: "Almora", label: t.almora },
    { value: "Pithoragarh", label: t.pithoragarh },
    { value: "Udham Singh Nagar", label: t.udhamSinghNagar },
    { value: "Bageshwar", label: t.bageshwar },
    { value: "Champawat", label: t.champawat }
  ];

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

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t.loading}</span>
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
              <Alert.Heading>{t.authenticationRequired}</Alert.Heading>
              <p>{t.needToLogin}</p>
              <Button variant="primary" onClick={() => navigate("/Login")}>
                {t.goToLogin}
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

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

  // Handle district checkbox changes
  const handleDistrictChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const allocated_district = checked
        ? [...prev.allocated_district, value]
        : prev.allocated_district.filter((d) => d !== value);
      return { ...prev, allocated_district };
    });

    // Clear error for this field if it exists
    if (errors.allocated_district) {
      setErrors({
        ...errors,
        allocated_district: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = t.fullNameRequired;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t.phoneRequired;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = t.phoneDigits;
    }
    
    if (!formData.password.trim()) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.passwordLength;
    }
    
    if (formData.allocated_district.length === 0) {
      newErrors.allocated_district = t.districtRequired;
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
      // Different API endpoints based on language
      let apiUrl;
      if (language === 'en') {
        // English API endpoint (actual endpoint)
        apiUrl = 'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/region-reg/';
      } else {
        // Hindi API endpoint (dummy for now)
        apiUrl = 'https://dummy-api-for-hindi.com/ngoproject/ngoproject_backend/api/region-reg-hindi/';
      }
      
      // API call using authFetch to the correct endpoint
      const response = await authFetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Handle 403 specifically
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action. Please contact your administrator.');
      }
      
      if (!response.ok) {
        // Handle specific error messages from the backend
        const errorData = await response.json().catch(() => ({}));
        
        // Check if error data contains field-specific errors (like email, phone, etc.)
        if (typeof errorData === 'object' && errorData !== null) {
          const fieldErrors = {};
          let hasFieldErrors = false;
          
          // Check for field-specific errors
          if (errorData.email) {
            fieldErrors.email = errorData.email;
            hasFieldErrors = true;
          }
          if (errorData.phone) {
            fieldErrors.phone = errorData.phone;
            hasFieldErrors = true;
          }
          if (errorData.full_name) {
            fieldErrors.full_name = errorData.full_name;
            hasFieldErrors = true;
          }
          if (errorData.password) {
            fieldErrors.password = errorData.password;
            hasFieldErrors = true;
          }
          if (errorData.allocated_district) {
            fieldErrors.allocated_district = errorData.allocated_district;
            hasFieldErrors = true;
          }
          
          // If we found field-specific errors, set them and return
          if (hasFieldErrors) {
            setErrors(fieldErrors);
            setIsSubmitting(false);
            return;
          }
        }
        
        throw new Error(errorData.message || errorData.detail || 'Failed to register region');
      }
      
      const result = await response.json();
      console.log('Success:', result);
      
      setSuccessMessage(t.successMessage);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          allocated_district: []
        });
        setSuccessMessage("");
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setErrors({ 
          submit: t.permissionDenied
        });
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setErrors({ 
          submit: t.authError
        });
        // Optionally redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setErrors({ submit: error.message || t.submitError });
      }
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
                    <Form.Group controlId="full_name">
                      <Form.Label>{t.fullName}</Form.Label>
                      <Form.Control
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        isInvalid={!!errors.full_name}
                        placeholder={t.enterFullName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.full_name}
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
                        placeholder={t.enterEmail}
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
                      <Form.Label>{t.phoneNumber}</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        isInvalid={!!errors.phone}
                        placeholder={t.enterPhone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group controlId="password">
                      <Form.Label>{t.password}</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        isInvalid={!!errors.password}
                        placeholder={t.enterPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group controlId="allocated_district">
                      <Form.Label>{t.allocatedDistricts}</Form.Label>
                      <div className="border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {districts.map((district) => (
                          <Form.Check
                            key={district.value}
                            type="checkbox"
                            id={`district_${district.value}`}
                            label={district.label}
                            value={district.value}
                            checked={formData.allocated_district.includes(district.value)}
                            onChange={handleDistrictChange}
                            className="mb-2"
                          />
                        ))}
                      </div>
                      {errors.allocated_district && (
                        <Form.Text className="text-danger d-block mt-2">
                          {errors.allocated_district}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12} className="d-flex gap-2 justify-content-end">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setFormData({
                          full_name: "",
                          email: "",
                          phone: "",
                          password: "",
                          allocated_district: []
                        });
                        setErrors({});
                        setSuccessMessage("");
                      }}
                    >
                      <FaTimes /> {t.reset}
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <FaSave /> {isSubmitting ? t.submitting : t.submit}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Container>
        </div>
      </div>
    </>
  );
};

export default RegionRegistration;
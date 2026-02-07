import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Spinner, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaSave, FaTimes, FaGlobe } from "react-icons/fa";

import "../../../assets/css/dashboard.css";

import { useNavigate } from "react-router-dom";

import DashBoardHeader from "../../event_panel/DashBoardHeader";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import LeftNav from "../LeftNav";

const DistrictRegistrations = () => {
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
    allocated_district: ""
  });
  
  // Form validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Translations for English and Hindi
  const translations = {
    en: {
      pageTitle: "District Registration",
      fullName: "Full Name",
      email: "Email",
      phoneNumber: "Phone Number",
      password: "Password",
      allocatedDistrict: "Allocated District",
      enterFullName: "Enter full name",
      enterEmail: "Enter email address",
      enterPhone: "Enter phone number",
      enterPassword: "Enter password",
      selectDistrict: "Select a district",
      cancel: "Cancel",
      registerDistrict: "Register District",
      registering: "Registering...",
      fullNameRequired: "Full name is required",
      emailRequired: "Email is required",
      emailInvalid: "Email is invalid",
      phoneRequired: "Phone number is required",
      phoneDigits: "Phone number should be 10 digits",
      passwordRequired: "Password is required",
      passwordLength: "Password should be at least 6 characters",
      districtRequired: "District selection is required",
      successMessage: "District registered successfully!",
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
      pageTitle: "जिला पंजीकरण",
      fullName: "पूरा नाम",
      email: "ईमेल",
      phoneNumber: "फोन नंबर",
      password: "पासवर्ड",
      allocatedDistrict: "आवंटित जिला",
      enterFullName: "पूरा नाम दर्ज करें",
      enterEmail: "ईमेल पता दर्ज करें",
      enterPhone: "फोन नंबर दर्ज करें",
      enterPassword: "पासवर्ड दर्ज करें",
      selectDistrict: "एक जिला चुनें",
      cancel: "रद्द करें",
      registerDistrict: "जिला पंजीकृत करें",
      registering: "पंजीकरण हो रहा है...",
      fullNameRequired: "पूरा नाम आवश्यक है",
      emailRequired: "ईमेल आवश्यक है",
      emailInvalid: "ईमेल अमान्य है",
      phoneRequired: "फोन नंबर आवश्यक है",
      phoneDigits: "फोन नंबर 10 अंकों का होना चाहिए",
      passwordRequired: "पासवर्ड आवश्यक है",
      passwordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
      districtRequired: "जिला चयन आवश्यक है",
      successMessage: "जिला सफलतापूर्वक पंजीकृत हुआ!",
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
    { value: "haridwar", label: t.haridwar },
    { value: "dehradun", label: t.dehradun },
    { value: "uttarkashi", label: t.uttarkashi },
    { value: "chamoli", label: t.chamoli },
    { value: "rudraprayag", label: t.rudraprayag },
    { value: "tehri_garhwal", label: t.tehriGarhwal },
    { value: "pauri_garhwal", label: t.pauriGarhwal },
    { value: "nainital", label: t.nainital },
    { value: "almora", label: t.almora },
    { value: "pithoragarh", label: t.pithoragarh },
    { value: "udham_singh_nagar", label: t.udhamSinghNagar },
    { value: "bageshwar", label: t.bageshwar },
    { value: "champawat", label: t.champawat }
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
    
    if (!formData.allocated_district.trim()) {
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
        apiUrl = 'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/district-reg/';
      } else {
        // Hindi API endpoint (dummy for now)
        apiUrl = 'https://dummy-api-for-hindi.com/ngoproject/ngoproject_backend/api/district-reg-hindi/';
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
        throw new Error(errorData.message || errorData.detail || 'Failed to register district');
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
          allocated_district: ""
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
                        type="text"
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
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="allocated_district">
                      <Form.Label>{t.allocatedDistrict}</Form.Label>
                      <Form.Select
                        name="allocated_district"
                        value={formData.allocated_district}
                        onChange={handleInputChange}
                        isInvalid={!!errors.allocated_district}
                      >
                        <option value="">{t.selectDistrict}</option>
                        {districts.map((district, index) => (
                          <option key={index} value={district.value}>{district.label}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.allocated_district}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
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
                    {isSubmitting ? t.registering : t.registerDistrict}
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
 
export default DistrictRegistrations;
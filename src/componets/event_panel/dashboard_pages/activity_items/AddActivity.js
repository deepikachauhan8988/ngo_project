import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";
import { FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaSave, FaGlobe } from "react-icons/fa";
import { useAuthFetch } from "../../../context/AuthFetch";

const AddActivity = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState(null);
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
      pageTitle: "Add New Activity",
      pageSubtitle: "Create a new activity for your organization",
      activityName: "Activity Name",
      venue: "Venue",
      dateTime: "Date & Time",
      activityFee: "Activity Fee",
      activityImage: "Activity Image",
      allocatedDistrict: "Allocated District",
      objective: "Objective",
      activityStatus: "Activity Status",
      imageNote: "Upload an image between 50KB and 100KB (optional)",
      fileSize: "File size:",
      selectDistrict: "Select District",
      enterActivityName: "Enter activity name",
      enterVenue: "Enter activity venue",
      selectFutureDateTime: "Select a future date and time for the activity",
      enterActivityFee: "Enter activity fee",
      feeNote: "Enter the base fee for the activity (other charges will be calculated automatically)",
      enterObjective: "Enter activity objective",
      objectiveNote: "Provide a detailed objective of the activity (minimum 10 characters)",
      statusNote: "Automatically calculated based on the activity date and time",
      districtNote: "Select the district where the activity will be conducted",
      createActivity: "Create Activity",
      creating: "Creating...",
      cancel: "Cancel",
      previewTitle: "Activity Preview",
      name: "Name",
      notSpecified: "Not specified",
      status: "Status",
      district: "District",
      dateAndTime: "Date & Time",
      activityFeeLabel: "Activity Fee",
      imagePreviewLabel: "Image Preview",
      note: "Note: Portal charges, transaction charges, tax, and total amount will be calculated by the system",
      past: "Past",
      ongoing: "Ongoing",
      upcoming: "Upcoming",
      notSet: "Not Set",
      required: "is required",
      invalid: "is invalid",
      activityNameRequired: "Activity name is required",
      objectiveRequired: "Objective is required",
      objectiveMinChars: "Objective must be at least 10 characters",
      dateTimeRequired: "Activity date and time is required",
      dateTimePast: "Activity date cannot be in the past",
      venueRequired: "Venue is required",
      feeRequired: "Valid activity fee is required",
      districtRequired: "District is required",
      imageSizeError: "Image size must be between 50KB and 100KB.",
      submitError: "Failed to create activity. Please try again.",
      networkError: "Network error. Please check your connection and try again.",
      successMessage: "Activity created successfully!",
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
      pageTitle: "नई गतिविधि जोड़ें",
      pageSubtitle: "अपने संगठन के लिए एक नई गतिविधि बनाएं",
      activityName: "गतिविधि का नाम",
      venue: "स्थान",
      dateTime: "दिनांक और समय",
      activityFee: "गतिविधि शुल्क",
      activityImage: "गतिविधि चित्र",
      allocatedDistrict: "आवंटित जिला",
      objective: "उद्देश्य",
      activityStatus: "गतिविधि स्थिति",
      imageNote: "50KB से 100KB के बीच एक चित्र अपलोड करें (वैकल्पिक)",
      fileSize: "फाइल आकार:",
      selectDistrict: "जिला चुनें",
      enterActivityName: "गतिविधि का नाम दर्ज करें",
      enterVenue: "गतिविधि स्थान दर्ज करें",
      selectFutureDateTime: "गतिविधि के लिए एक भविष्य की तिथि और समय चुनें",
      enterActivityFee: "गतिविधि शुल्क दर्ज करें",
      feeNote: "गतिविधि के लिए आधार शुल्क दर्ज करें (अन्य शुल्क स्वचालित रूप से गणना किए जाएंगे)",
      enterObjective: "गतिविधि उद्देश्य दर्ज करें",
      objectiveNote: "गतिविधि का विस्तृत उद्देश्य प्रदान करें (न्यूनतम 10 अक्षर)",
      statusNote: "गतिविधि दिनांक और समय के आधार पर स्वचालित रूप से गणना की गई",
      districtNote: "वह जिला चुनें जहां गतिविधि का आयोजन किया जाएगा",
      createActivity: "गतिविधि बनाएं",
      creating: "बनाया जा रहा है...",
      cancel: "रद्द करें",
      previewTitle: "गतिविधि पूर्वावलोकन",
      name: "नाम",
      notSpecified: "निर्दिष्ट नहीं",
      status: "स्थिति",
      district: "जिला",
      dateAndTime: "दिनांक और समय",
      activityFeeLabel: "गतिविधि शुल्क",
      imagePreviewLabel: "चित्र पूर्वावलोकन",
      note: "नोट: पोर्टल शुल्क, लेनदेन शुल्क, कर, और कुल राशि की गणना सिस्टम द्वारा की जाएगी",
      past: "भूत",
      ongoing: "चालू",
      upcoming: "आगामी",
      notSet: "सेट नहीं",
      required: "आवश्यक है",
      invalid: "अमान्य है",
      activityNameRequired: "गतिविधि का नाम आवश्यक है",
      objectiveRequired: "उद्देश्य आवश्यक है",
      objectiveMinChars: "उद्देश्य कम से कम 10 अक्षर का होना चाहिए",
      dateTimeRequired: "गतिविधि दिनांक और समय आवश्यक है",
      dateTimePast: "गतिविधि दिनांक भूतकाल में नहीं हो सकता",
      venueRequired: "स्थान आवश्यक है",
      feeRequired: "वैध गतिविधि शुल्क आवश्यक है",
      districtRequired: "जिला आवश्यक है",
      imageSizeError: "चित्र का आकार 50KB से 100KB के बीच होना चाहिए।",
      submitError: "गतिविधि बनाने में विफल। कृपया फिर से कोशिश करें।",
      networkError: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें और फिर से कोशिश करें।",
      successMessage: "गतिविधि सफलतापूर्वक बनाई गई!",
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

  // District options for dropdown
  const districtOptions = [
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

  // Form state
  const [formData, setFormData] = useState({
    activity_name: "",
    objective: "",
    activity_date_time: "",
    venue: "",
    activity_fee: "",
    allocated_district: "" // Added new field
  });

  // Status fields (calculated based on activity date time)
  const [activityStatus, setActivityStatus] = useState({
    is_past: false,
    is_present: false,
    is_upcoming: false
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

  // Update activity status whenever activity_date_time changes
  useEffect(() => {
    if (formData.activity_date_time) {
      const activityDate = new Date(formData.activity_date_time);
      const now = new Date();
      
      // Check if the activity is in the past, present, or future
      const isPast = activityDate < now;
      const isPresent = Math.abs(activityDate - now) < 24 * 60 * 60 * 1000; // Within 24 hours
      const isUpcoming = activityDate > now;
      
      setActivityStatus({
        is_past: isPast,
        is_present: isPresent && !isPast,
        is_upcoming: isUpcoming
      });
    } else {
      setActivityStatus({
        is_past: false,
        is_present: false,
        is_upcoming: false
      });
    }
  }, [formData.activity_date_time]);

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
        // Clear the image file
        setImageFile(null);
        // Reset the file input
        e.target.value = '';
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.activity_name.trim()) {
      errors.activity_name = t.activityNameRequired;
    }
    
    if (!formData.objective.trim()) {
      errors.objective = t.objectiveRequired;
    } else if (formData.objective.length < 10) {
      errors.objective = t.objectiveMinChars;
    }
    
    if (!formData.activity_date_time) {
      errors.activity_date_time = t.dateTimeRequired;
    } else {
      const selectedDate = new Date(formData.activity_date_time);
      const now = new Date();
      if (selectedDate < now) {
        errors.activity_date_time = t.dateTimePast;
      }
    }
    
    if (!formData.venue.trim()) {
      errors.venue = t.venueRequired;
    }
    
    if (!formData.activity_fee || isNaN(formData.activity_fee) || parseFloat(formData.activity_fee) <= 0) {
      errors.activity_fee = t.feeRequired;
    }
    
    if (!formData.allocated_district) {
      errors.allocated_district = t.districtRequired;
    }
    
    // Check for image validation errors
    if (imageError) {
      errors.image = imageError;
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
      // Create form data for API submission
      const submitData = new FormData();
      submitData.append('activity_name', formData.activity_name);
      submitData.append('objective', formData.objective);
      submitData.append('activity_date_time', formData.activity_date_time);
      submitData.append('venue', formData.venue);
      submitData.append('activity_fee', formData.activity_fee);
      submitData.append('allocated_district', formData.allocated_district); // Added new field
      
      // Add image if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      // Add status fields (calculated based on activity date time)
      submitData.append('is_past', activityStatus.is_past);
      submitData.append('is_present', activityStatus.is_present);
      submitData.append('is_upcoming', activityStatus.is_upcoming);
      
      // Different API endpoints based on language
      let apiUrl;
      if (language === 'en') {
        // English API endpoint (actual endpoint)
        apiUrl = 'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/';
      } else {
        // Hindi API endpoint (dummy for now)
        apiUrl = 'https://dummy-api-for-hindi.com/ngoproject/ngoproject_backend/api/activity-items-hindi/';
      }
      
      const response = await authFetch(apiUrl, {
        method: 'POST',
        body: submitData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(t.successMessage);
        // Reset form
        setFormData({
          activity_name: "",
          objective: "",
          activity_date_time: "",
          venue: "",
          activity_fee: "",
          allocated_district: "" // Reset new field
        });
        
        // Reset image
        setImageFile(null);
        setImagePreview(null);
        setImageError(null);
        
        // Reset status
        setActivityStatus({
          is_past: false,
          is_present: false,
          is_upcoming: false
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/ManageActivity'); // or your activities list page
        }, 2000);
      } else {
        setError(data.message || t.submitError);
      }
    } catch (err) {
      setError(t.networkError);
      console.error('Error creating activity:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for input min attribute (current date/time)
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get status badge component
  const getStatusBadge = () => {
    if (activityStatus.is_past) {
      return <span className="badge bg-secondary">{t.past}</span>;
    } else if (activityStatus.is_present) {
      return <span className="badge bg-success">{t.ongoing}</span>;
    } else if (activityStatus.is_upcoming) {
      return <span className="badge bg-primary">{t.upcoming}</span>;
    }
    return <span className="badge bg-secondary">{t.notSet}</span>;
  };

  // Get district label by value
  const getDistrictLabel = (value) => {
    const district = districtOptions.find(d => d.value === value);
    return district ? district.label : value;
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

            {/* Activity Form */}
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    {/* Activity Name */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-primary" />
                          {t.activityName} <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="activity_name"
                          value={formData.activity_name}
                          onChange={handleChange}
                          placeholder={t.enterActivityName}
                          isInvalid={!!validationErrors.activity_name}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.activity_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Venue */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          {t.venue} <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleChange}
                          placeholder={t.enterVenue}
                          isInvalid={!!validationErrors.venue}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.venue}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* Date and Time */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-success" />
                          {t.dateTime} <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="activity_date_time"
                          value={formData.activity_date_time}
                          onChange={handleChange}
                          min={getMinDateTime()}
                          isInvalid={!!validationErrors.activity_date_time}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.activity_date_time}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {t.selectFutureDateTime}
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    {/* Activity Fee */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          {t.activityFee} <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="activity_fee"
                          value={formData.activity_fee}
                          onChange={handleChange}
                          placeholder={t.enterActivityFee}
                          step="0.01"
                          min="0"
                          isInvalid={!!validationErrors.activity_fee}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.activity_fee}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {t.feeNote}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Activity Image and District */}
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          {t.activityImage}
                        </Form.Label>
                        <Form.Control
                          type="file"
                          name="image"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="form-control-lg"
                          isInvalid={!!validationErrors.image}
                        />
                        <Form.Text className="text-muted">
                          {t.imageNote}
                        </Form.Text>
                        {imageError && (
                          <div className="text-danger mt-1">{imageError}</div>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.image}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          {t.allocatedDistrict} <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Select
                          name="allocated_district"
                          value={formData.allocated_district}
                          onChange={handleChange}
                          isInvalid={!!validationErrors.allocated_district}
                          className="form-control-lg"
                        >
                          <option value="">{t.selectDistrict}</option>
                          {districtOptions.map((district) => (
                            <option key={district.value} value={district.value}>
                              {district.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.allocated_district}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {t.districtNote}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Objective */}
                  <Row>
                    <Col md={12} className="mb-4">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          {t.objective} <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="objective"
                          value={formData.objective}
                          onChange={handleChange}
                          placeholder={t.enterObjective}
                          rows={4}
                          isInvalid={!!validationErrors.objective}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.objective}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {t.objectiveNote}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Activity Status */}
                  <Row>
                    <Col md={12} className="mb-4">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-warning" />
                          {t.activityStatus}
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          {getStatusBadge()}
                          <Form.Text className="text-muted ms-2">
                            {t.statusNote}
                          </Form.Text>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Form Actions */}
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => navigate('/ManageActivity')}
                      disabled={loading}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          {t.creating}
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          {t.createActivity}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Preview Card */}
            {formData.activity_name && (
              <Card className="shadow-sm mt-4">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">{t.previewTitle}</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>{t.name}:</strong> {formData.activity_name || t.notSpecified}</p>
                      <p><strong>{t.venue}:</strong> {formData.venue || t.notSpecified}</p>
                      <p><strong>{t.status}:</strong> {getStatusBadge()}</p>
                      <p><strong>{t.district}:</strong> {formData.allocated_district ? getDistrictLabel(formData.allocated_district) : t.notSpecified}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>{t.dateAndTime}:</strong> {formData.activity_date_time ? 
                        new Date(formData.activity_date_time).toLocaleString() : t.notSpecified}</p>
                      <p><strong>{t.objective}:</strong> {formData.objective || t.notSpecified}</p>
                      <p><strong>{t.activityFeeLabel}:</strong> ₹{formData.activity_fee || '0.00'}</p>
                      <p className="text-muted"><em>{t.note}</em></p>
                    </Col>
                  </Row>
                  {imagePreview && (
                    <Row className="mt-3">
                      <Col md={12}>
                        <p><strong>{t.imagePreviewLabel}:</strong></p>
                        <img src={imagePreview} alt="Activity preview" className="img-fluid" style={{maxHeight: '200px'}} />
                        {imageFile && (
                          <div className="mt-1">
                            <small className="text-muted">{t.fileSize} {formatFileSize(imageFile.size)}</small>
                          </div>
                        )}
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default AddActivity;
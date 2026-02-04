import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Badge, Modal } from "react-bootstrap";
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaBuilding, FaGraduationCap, FaInfoCircle, FaCamera } from "react-icons/fa";
import UserHeader from '../UserHeader';
import UserLeftNav from '../UserLeftNav';
import { useAuth } from '../../context/AuthContext';
import { useAuthFetch } from '../../context/AuthFetch';

const UserProfile = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // View state - card view or form view
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'form'

  // Form state for user profile
  const [formData, setFormData] = useState({
    id: null,
    member_id: "",
    full_name: "",
    email: "",
    phone: "",
    image: null,
    address: "",
    short_description: "",
    occupation: "",
    designation: "",
    department_name: "",
    organization_name: "",
    nature_of_work: "",
    education_level: "",
    status: "",
    other_text: "",
    district: "",
    state: "",
    created_at: "",
    updated_at: ""
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // image preview / existing image
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Store original data for reset
  const [originalFormData, setOriginalFormData] = useState(null);

  // Photo editing modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Ref for hidden file input
  const fileInputRef = useRef(null);

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

  // Fetch user profile data on component mount
  useEffect(() => {
    if (auth && auth.unique_id) {
      fetchUserProfile();
    }
  }, [auth]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch user profile from API using member_id
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      if (!auth || !auth.unique_id) {
        throw new Error("User not authenticated. Member ID not available.");
      }

      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?member_id=${auth.unique_id}`;
      console.log("Fetching user profile from:", url);

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET User Profile API Response:", result);

      let profileData;
      
      // Handle different response formats
      if (Array.isArray(result)) {
        profileData = result[0] || {};
      } else if (result.data) {
        if (Array.isArray(result.data)) {
          profileData = result.data[0] || {};
        } else {
          profileData = result.data;
        }
      } else if (result.success && result.results && Array.isArray(result.results)) {
        profileData = result.results[0] || {};
      } else {
        profileData = result;
      }

      const profileFormData = {
        id: profileData.id || null,
        member_id: profileData.member_id || auth.unique_id || "",
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        image: null,
        address: profileData.address || "",
        short_description: profileData.short_description || "",
        occupation: profileData.occupation || "",
        designation: profileData.designation || "",
        department_name: profileData.department_name || "",
        organization_name: profileData.organization_name || "",
        nature_of_work: profileData.nature_of_work || "",
        education_level: profileData.education_level || "",
        status: profileData.status || "",
        other_text: profileData.other_text || "",
        district: profileData.district || "",
        state: profileData.state || "",
        created_at: profileData.created_at || "",
        updated_at: profileData.updated_at || ""
      };

      setFormData(profileFormData);
      setOriginalFormData(profileFormData);
      setExistingImage(profileData.image || null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setMessage(error.message || "Failed to load profile data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files && files[0];
      setFormData(prev => ({ ...prev, image: file || null }));
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };

  // Cancel editing and reset form
  const cancelEditing = () => {
    if (originalFormData) {
      setFormData(originalFormData);
    }
    setIsEditing(false);
    setShowAlert(false);
    setImagePreview(null);
    setViewMode('card'); // Return to card view
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  // Open photo modal
  const openPhotoModal = () => {
    setShowPhotoModal(true);
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  // Close photo modal
  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  // Upload photo
  const uploadPhoto = async () => {
    if (!selectedPhoto) return;
    
    setIsUploadingPhoto(true);
    try {
      const dataToSend = new FormData();
      if (formData.id) dataToSend.append('id', formData.id);
      dataToSend.append('member_id', formData.member_id);
      dataToSend.append('image', selectedPhoto, selectedPhoto.name);

      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?id=${formData.id}`;
      console.log('PUT URL (Photo Update):', url);

      let response = await fetch(url, {
        method: 'PUT',
        body: dataToSend,
        headers: { Authorization: `Bearer ${auth?.access}` },
      });

      if (response.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) throw new Error('Session expired');
        response = await fetch(url, {
          method: 'PUT',
          body: dataToSend,
          headers: { Authorization: `Bearer ${newAccess}` },
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = null;
        try { 
          errorData = JSON.parse(errorText); 
        } catch (e) { 
          /* not JSON */ 
        }
        throw new Error((errorData && (errorData.message || errorData.detail)) || 'Failed to update photo');
      }

      const result = await response.json();
      console.log('Photo update response:', result);

      // Update existing image
      if (result.data && result.data.image) {
        setExistingImage(result.data.image);
        setPhotoPreview(null);
        setMessage('Profile photo updated successfully!');
        setVariant('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }

      closePhotoModal();
    } catch (error) {
      console.error("Error updating photo:", error);
      setMessage(error.message || "Failed to update photo");
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle form submission (PUT to update profile)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      // Validate required fields
      if (!formData.member_id || !formData.full_name) {
        throw new Error("Member ID and Full Name are required fields.");
      }

      // Create payload including member_id for JSON submission
      const jsonPayload = {
        member_id: formData.member_id, // Include member_id in JSON payload
        full_name: formData.full_name,
        address: formData.address,
        short_description: formData.short_description,
        occupation: formData.occupation,
        designation: formData.designation,
        department_name: formData.department_name,
        organization_name: formData.organization_name,
        nature_of_work: formData.nature_of_work,
        education_level: formData.education_level,
        other_text: formData.other_text,
        district: formData.district,
        state: formData.state
      };

      console.log("Submitting profile update for:", formData.member_id);
      console.log("JSON Payload:", jsonPayload);

      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?id=${formData.id}`;
      console.log('PUT URL (JSON):', url);
      
      let response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth?.access}`,
        },
        body: JSON.stringify(jsonPayload),
      });

      if (response.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) throw new Error('Session expired');
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newAccess}`,
          },
          body: JSON.stringify(jsonPayload),
        });
      }

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = null;
        try { 
          errorData = JSON.parse(errorText); 
        } catch (e) { 
          /* not JSON */ 
        }
        console.error('Server error response:', errorData || errorText);
        
        // Provide more specific error messages
        if (errorData && errorData.errors) {
          if (errorData.errors.email) {
            throw new Error('Email address is already in use');
          } else if (errorData.errors.phone) {
            throw new Error('Phone number is already in use');
          } else if (errorData.errors.member_id) {
            throw new Error('Member ID is already in use');
          }
        }
        
        throw new Error((errorData && (errorData.message || errorData.detail)) || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Success response:', result);

      setMessage('Profile updated successfully!');
      setVariant('success');
      setShowAlert(true);
      setIsEditing(false);
      
      // Update the original form data with the current form data
      setOriginalFormData({
        ...formData,
        image: null // Reset image to null
      });

      // Return to card view after successful update
      setViewMode('card');
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error: Could not connect to the server. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch to form view
  const switchToFormView = () => {
    setViewMode('form');
    setIsEditing(true);
  };

  return (
    <>
      <style>
        {`
          .profile-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            overflow: hidden;
            height: 100%;
          }
          
          .profile-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          
          .profile-image-container {
            position: relative;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid #f8f9fa;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .profile-image-container:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }
          
          .profile-image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 50%;
          }
          
          .profile-image-container:hover .profile-image-overlay {
            opacity: 1;
          }
          
          .profile-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .profile-header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .info-card {
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
            border: none;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .info-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          }
          
          .info-card .card-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            font-weight: 600;
            border-radius: 10px 10px 0 0 !important;
          }
          
          .info-icon {
            color: #6a11cb;
            margin-right: 10px;
          }
          
          .form-control:disabled {
            background-color: #f8f9fa;
            color: #6c757d;
          }
          
          .page-title {
            font-weight: 600;
            color: #495057;
          }
          
          .profile-stat {
            text-align: center;
            padding: 15px;
          }
          
          .profile-stat-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #495057;
          }
          
          .profile-stat-label {
            font-size: 0.875rem;
            color: #6c757d;
          }
        `}
      </style>
      
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <UserLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <UserHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            {/* Page Title */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">My Profile</h1>
            </div>

            {/* Alert for success/error messages */}
            {showAlert && (
              <Alert
                variant={variant}
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {message}
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading your profile...</p>
              </div>
            ) : (
              <>
                {viewMode === 'card' ? (
                  // Card View
                  <Card className="profile-card" onClick={switchToFormView}>
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={3} className="text-center mb-4 mb-md-0">
                          <div 
                            className="profile-image-container mx-auto"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              openPhotoModal();
                            }}
                          >
                            {existingImage ? (
                              <img
                                src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${existingImage}`}
                                alt="Profile"
                                className="profile-image"
                              />
                            ) : (
                              <div className="profile-image d-flex align-items-center justify-content-center bg-light text-primary">
                                <FaUser size={60} />
                              </div>
                            )}
                            <div className="profile-image-overlay">
                              <FaCamera size={24} color="white" />
                            </div>
                          </div>
                          <small className="text-muted d-block mt-2">Click to change photo</small>
                        </Col>
                        <Col md={9}>
                          <h2 className="mb-3">{formData.full_name || "Your Name"}</h2>
                          <div className="mb-3">
                            <Badge bg="primary" className="me-2">
                              <FaEnvelope /> {formData.email}
                            </Badge>
                            <Badge bg="primary" className="me-2">
                              <FaPhone /> {formData.phone || "Not provided"}
                            </Badge>
                            {formData.status && (
                              <Badge bg="success">
                                <FaInfoCircle /> {formData.status}
                              </Badge>
                            )}
                          </div>
                          <p className="mb-3">{formData.short_description || "No description provided"}</p>
                          
                          <Row className="profile-stats">
                            <Col xs={4}>
                              <div className="profile-stat">
                                <div className="profile-stat-value">
                                  {formData.occupation || "N/A"}
                                </div>
                                <div className="profile-stat-label">Occupation</div>
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="profile-stat">
                                <div className="profile-stat-value">
                                  {formData.organization_name || "N/A"}
                                </div>
                                <div className="profile-stat-label">Organization</div>
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="profile-stat">
                                <div className="profile-stat-value">
                                  {formData.education_level || "N/A"}
                                </div>
                                <div className="profile-stat-label">Education</div>
                              </div>
                            </Col>
                          </Row>
                          
                          <div className="mt-3">
                            <Button variant="outline-primary" size="sm">
                              <FaEdit /> View Full Profile
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ) : (
                  // Form View
                  <>
                    {/* Profile Header */}
                    <div className="profile-header">
                      <Row className="align-items-center">
                        <Col md={3} className="text-center text-md-start mb-3 mb-md-0">
                          <div 
                            className="profile-image-container mx-auto mx-md-0"
                            onClick={openPhotoModal}
                          >
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Profile Preview"
                                className="profile-image"
                              />
                            ) : existingImage ? (
                              <img
                                src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${existingImage}`}
                                alt="Profile"
                                className="profile-image"
                              />
                            ) : (
                              <div className="profile-image d-flex align-items-center justify-content-center bg-white text-primary">
                                <FaUser size={60} />
                              </div>
                            )}
                            <div className="profile-image-overlay">
                              <FaCamera size={24} color="white" />
                            </div>
                          </div>
                          <small className="text-white d-block mt-2">Click to change photo</small>
                        </Col>
                        <Col md={9}>
                          <div className="profile-info">
                            <h2>{formData.full_name || "Your Name"}</h2>
                            <div className="mb-3">
                              <span className="profile-badge">
                                <FaEnvelope /> {formData.email}
                              </span>
                              <span className="profile-badge">
                                <FaPhone /> {formData.phone || "Not provided"}
                              </span>
                            </div>
                            <p className="mb-0">{formData.short_description || "No description provided"}</p>
                            {formData.status && (
                              <div className="mt-2">
                                <Badge bg="light" text="dark">
                                  Status: {formData.status}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      {/* Personal Information Section */}
                      <Card className="info-card">
                        <Card.Header>
                          <FaUser className="info-icon" />
                          Personal Information
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Member ID</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="member_id"
                                  value={formData.member_id}
                                  onChange={handleChange}
                                  disabled={true}
                                  className="form-control-plaintext"
                                />
                                <Form.Text className="text-muted">
                                  Your unique member identifier (cannot be changed)
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Full Name *</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="full_name"
                                  value={formData.full_name}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  disabled={true}
                                />
                                <Form.Text className="text-muted">
                                  Your email address (cannot be changed)
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  disabled={true}
                                />
                                <Form.Text className="text-muted">
                                  Your phone number (cannot be changed)
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  name="address"
                                  value={formData.address}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>District</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="district"
                                  value={formData.district}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="e.g., dehradun"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>State</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="state"
                                  value={formData.state}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="e.g., Uttarakhand"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      {/* Professional Information Section */}
                      <Card className="info-card">
                        <Card.Header>
                          <FaBriefcase className="info-icon" />
                          Professional Information
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Occupation</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="occupation"
                                  value={formData.occupation}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="e.g., Software Developer, Student"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Designation</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="designation"
                                  value={formData.designation}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="e.g., React Developer, Manager"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Department Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="department_name"
                                  value={formData.department_name}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="e.g., Engineering, HR"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Organization Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="organization_name"
                                  value={formData.organization_name}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="e.g., Brainrocks Consulting Services"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>Nature of Work</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  name="nature_of_work"
                                  value={formData.nature_of_work}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Describe your nature of work"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      {/* Education & Additional Information Section */}
                      <Card className="info-card">
                        <Card.Header>
                          <FaGraduationCap className="info-icon" />
                          Education & Additional Information
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Education Level</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="education_level"
                                  value={formData.education_level}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="e.g., MCA, B.Tech, Other"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Short Description</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="short_description"
                                  value={formData.short_description}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Brief description about yourself"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>Additional Notes</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  name="other_text"
                                  value={formData.other_text}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Any additional information"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      {/* Account Information Section */}
                      <Card className="info-card">
                        <Card.Header>
                          <FaInfoCircle className="info-icon" />
                          Account Information
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="status"
                                  value={formData.status}
                                  onChange={handleChange}
                                  disabled={true}
                                  className="form-control-plaintext"
                                />
                                <Form.Text className="text-muted">
                                  Your account status (cannot be changed)
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            {formData.created_at && (
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Created At</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={formData.created_at}
                                    disabled={true}
                                    className="form-control-plaintext"
                                  />
                                </Form.Group>
                              </Col>
                            )}
                          </Row>
                          {formData.updated_at && (
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Last Updated</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={formData.updated_at}
                                    disabled={true}
                                    className="form-control-plaintext"
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          )}
                        </Card.Body>
                      </Card>

                      {/* Action Buttons */}
                      <Row className="mt-4">
                        <Col className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="secondary"
                            onClick={cancelEditing}
                            disabled={isSubmitting}
                          >
                            <FaTimes /> Cancel
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <FaSave /> Save Changes
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <Modal show={showPhotoModal} onHide={closePhotoModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Photo Preview"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
                className="rounded-circle"
              />
            ) : existingImage ? (
              <img
                src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${existingImage}`}
                alt="Current Photo"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
                className="rounded-circle"
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto"
                style={{ width: "200px", height: "200px" }}
              >
                <FaUser size={60} className="text-muted" />
              </div>
            )}
          </div>
          <Form.Group>
            <Form.Control
              type="file"
              onChange={handlePhotoChange}
              accept="image/*"
              ref={fileInputRef}
            />
            <Form.Text className="text-muted">
              Select a new profile photo. Recommended size: 200x200 pixels.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePhotoModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={uploadPhoto}
            disabled={!selectedPhoto || isUploadingPhoto}
          >
            {isUploadingPhoto ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Uploading...
              </>
            ) : (
              <>Upload Photo</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserProfile;
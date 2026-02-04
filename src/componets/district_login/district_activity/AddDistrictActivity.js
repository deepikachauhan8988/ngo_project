import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DistrictLeftNav from '../DistrictLeftNav';
import DashBoardHeader from '../../event_panel/DashBoardHeader';
import { FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaSave } from "react-icons/fa";
import { useAuthFetch } from '../../context/AuthFetch';
import { useAuth } from '../../context/AuthContext';

const AddDistrictActivity = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { auth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // District options for dropdown
  const districtOptions = [
    { value: "haridwar", label: "Haridwar" },
    { value: "dehradun", label: "Dehradun" },
    { value: "uttarkashi", label: "Uttarkashi" },
    { value: "chamoli", label: "Chamoli" },
    { value: "rudraprayag", label: "Rudraprayag" },
    { value: "tehri_garhwal", label: "Tehri Garhwal" },
    { value: "pauri_garhwal", label: "Pauri Garhwal" },
    { value: "nainital", label: "Nainital" },
    { value: "almora", label: "Almora" },
    { value: "pithoragarh", label: "Pithoragarh" },
    { value: "udham_singh_nagar", label: "Udham Singh Nagar" },
    { value: "bageshwar", label: "Bageshwar" },
    { value: "champawat", label: "Champawat" }
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

  // If the district admin has an allocated district, prefill it
  useEffect(() => {
    if (auth && auth.allocated_district && !formData.allocated_district) {
      setFormData(prev => ({ ...prev, allocated_district: auth.allocated_district }));
    }
  }, [auth]);

  // Update activity status whenever activity_date_time changes
  useEffect(() => {
    if (formData.activity_date_time) {
      const activityDate = new Date(formData.activity_date_time);
      const now = new Date();
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
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.activity_name.trim()) errors.activity_name = "Activity name is required";
    if (!formData.objective.trim()) {
      errors.objective = "Objective is required";
    } else if (formData.objective.length < 10) {
      errors.objective = "Objective must be at least 10 characters";
    }
    if (!formData.activity_date_time) {
      errors.activity_date_time = "Activity date and time is required";
    } else {
      const selectedDate = new Date(formData.activity_date_time);
      const now = new Date();
      if (selectedDate < now) errors.activity_date_time = "Activity date cannot be in the past";
    }
    if (!formData.venue.trim()) errors.venue = "Venue is required";
    if (!formData.activity_fee || isNaN(formData.activity_fee) || parseFloat(formData.activity_fee) <= 0) {
      errors.activity_fee = "Valid activity fee is required";
    }
    if (!formData.allocated_district) errors.allocated_district = "District is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const submitData = new FormData();
      submitData.append('activity_name', formData.activity_name);
      submitData.append('objective', formData.objective);
      submitData.append('activity_date_time', formData.activity_date_time);
      submitData.append('venue', formData.venue);
      submitData.append('activity_fee', formData.activity_fee);
      submitData.append('allocated_district', formData.allocated_district);
      // created_by should contain DistrictAdminId
      submitData.append('created_by', auth && auth.unique_id ? auth.unique_id : '');
      if (imageFile) submitData.append('image', imageFile);
      submitData.append('is_past', activityStatus.is_past);
      submitData.append('is_present', activityStatus.is_present);
      submitData.append('is_upcoming', activityStatus.is_upcoming);

      const response = await authFetch(
        'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/',
        {
          method: 'POST',
          body: submitData
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccess("Activity created successfully!");
        setFormData({
          activity_name: "",
          objective: "",
          activity_date_time: "",
          venue: "",
          activity_fee: "",
          allocated_district: ""
        });
        setImageFile(null);
        setImagePreview("");
        setActivityStatus({ is_past: false, is_present: false, is_upcoming: false });
        setTimeout(() => navigate('/ManageDistrictActivity'), 2000);
      } else {
        setError(data.message || "Failed to create activity. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error('Error creating district activity:', err);
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
    if (activityStatus.is_past) return <span className="badge bg-secondary">Past</span>;
    if (activityStatus.is_present) return <span className="badge bg-success">Ongoing</span>;
    if (activityStatus.is_upcoming) return <span className="badge bg-primary">Upcoming</span>;
    return <span className="badge bg-secondary">Not Set</span>;
  };

  // Get district label by value
  const getDistrictLabel = (value) => {
    const district = districtOptions.find(d => d.value === value);
    return district ? district.label : value;
  };

  return (
    <>
      <div className="dashboard-container">
        <DistrictLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        <div className="main-content-dash">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="page-title mb-1">Add New Activity</h1>
                <p className="text-muted mb-0">Create a new activity for your organization</p>
              </div>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>
            )}
            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>
            )}

            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-primary" />
                          Activity Name <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="activity_name"
                          value={formData.activity_name}
                          onChange={handleChange}
                          placeholder="Enter activity name"
                          isInvalid={!!validationErrors.activity_name}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.activity_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          Venue <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleChange}
                          placeholder="Enter activity venue"
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
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-success" />
                          Date & Time <span className="text-danger ms-1">*</span>
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
                        <Form.Text className="text-muted">Select a future date and time for the activity</Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          Activity Fee <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="activity_fee"
                          value={formData.activity_fee}
                          onChange={handleChange}
                          placeholder="Enter activity fee"
                          step="0.01"
                          min="0"
                          isInvalid={!!validationErrors.activity_fee}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.activity_fee}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">Enter the base fee for the activity (other charges will be calculated automatically)</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          Activity Image
                        </Form.Label>
                        <Form.Control
                          type="file"
                          name="image"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="form-control-lg"
                        />
                        <Form.Text className="text-muted">Upload an image for the activity (optional)</Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          Allocated District <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Select
                          name="allocated_district"
                          value={formData.allocated_district}
                          onChange={handleChange}
                          isInvalid={!!validationErrors.allocated_district}
                          className="form-control-lg"
                        >
                          <option value="">Select District</option>
                          {districtOptions.map((district) => (
                            <option key={district.value} value={district.value}>{district.label}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.allocated_district}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">Select the district where the activity will be conducted</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12} className="mb-4">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          Objective <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="objective"
                          value={formData.objective}
                          onChange={handleChange}
                          placeholder="Enter activity objective"
                          rows={4}
                          isInvalid={!!validationErrors.objective}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.objective}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">Provide a detailed objective of the activity (minimum 10 characters)</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12} className="mb-4">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-warning" />
                          Activity Status
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          {getStatusBadge()}
                          <Form.Text className="text-muted ms-2">Automatically calculated based on the activity date and time</Form.Text>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" size="lg" onClick={() => navigate('/ManageDistrictActivity')} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" size="lg" disabled={loading} className="px-4">
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Create Activity
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {formData.activity_name && (
              <Card className="shadow-sm mt-4">
                <Card.Header className="bg-light"><h5 className="mb-0">Activity Preview</h5></Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Name:</strong> {formData.activity_name || 'Not specified'}</p>
                      <p><strong>Venue:</strong> {formData.venue || 'Not specified'}</p>
                      <p><strong>Status:</strong> {getStatusBadge()}</p>
                      <p><strong>District:</strong> {formData.allocated_district ? getDistrictLabel(formData.allocated_district) : 'Not specified'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Date & Time:</strong> {formData.activity_date_time ? new Date(formData.activity_date_time).toLocaleString() : 'Not specified'}</p>
                      <p><strong>Objective:</strong> {formData.objective || 'Not specified'}</p>
                      <p><strong>Activity Fee:</strong> ₹{formData.activity_fee || '0.00'}</p>
                      <p className="text-muted"><em>Note: Portal charges, transaction charges, tax, and total amount will be calculated by the system</em></p>
                    </Col>
                  </Row>
                  {imagePreview && (
                    <Row className="mt-3">
                      <Col md={12}>
                        <p><strong>Image Preview:</strong></p>
                        <img src={imagePreview} alt="Activity preview" className="img-fluid" style={{maxHeight: '200px'}} />
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

export default AddDistrictActivity;
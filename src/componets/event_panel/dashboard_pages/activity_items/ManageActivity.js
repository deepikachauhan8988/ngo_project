import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Badge, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaTrash, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaMoneyBillWave } from "react-icons/fa";
import DashBoardHeader from "../../DashBoardHeader";
import LeftNav from "../../LeftNav";
import { useAuth } from "../../../context/AuthContext";
import { useAuthFetch } from "../../../context/AuthFetch";

const ManageActivity = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  // State for all activities
  const [activities, setActivities] = useState([]);
  
  // Form state for selected activity
  const [formData, setFormData] = useState({
    id: null,
    activity_id: "",
    activity_name: "",
    objective: "",
    activity_date_time: "",
    venue: "",
    image: null,
    activity_fee: "",
    portal_charges: "",
    transaction_charges: "",
    tax_amount: "",
    total_amount: "",
    allocated_district: "", // Added new field
    is_past: false,
    is_present: false,
    is_upcoming: false,
    created_at: "",
    updated_at: ""
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // State for file preview and existing image
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

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

  // Fetch all activities on component mount
  useEffect(() => {
    fetchAllActivities();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all activities from API
  const fetchAllActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activities data");
      }

      const result = await response.json();
      console.log("GET All Activities API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setActivities(result.data);
      } else if (Array.isArray(result)) {
        // Handle direct array response
        setActivities(result);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific activity data by ID
  const fetchActivityData = async (activityId) => {
    setIsLoading(true);
    try {
      console.log("Fetching activity with ID:", activityId);
      const response = await fetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/?id=${activityId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch activity data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Activity Details API Response:", result);

      let activityData;
      
      // Check if data is an array or a single object
      if (Array.isArray(result.data)) {
        activityData = result.data.find(item => item.id.toString() === activityId.toString());
        if (!activityData) {
          throw new Error(`Activity with ID ${activityId} not found in response array`);
        }
      } else if (result.data && result.data.id) {
        if (result.data.id.toString() === activityId.toString()) {
          activityData = result.data;
        } else {
          throw new Error(`Returned activity ID ${result.data.id} does not match requested ID ${activityId}`);
        }
      } else {
        throw new Error("Invalid activity data structure in response");
      }

      setFormData({
        id: activityData.id,
        activity_id: activityData.activity_id,
        activity_name: activityData.activity_name,
        objective: activityData.objective,
        activity_date_time: activityData.activity_date_time,
        venue: activityData.venue,
        image: null, // Reset to null for proper handling
        activity_fee: activityData.activity_fee,
        portal_charges: activityData.portal_charges || "0.00",
        transaction_charges: activityData.transaction_charges || "0.00",
        tax_amount: activityData.tax_amount || "0.00",
        total_amount: activityData.total_amount || "0.00",
        allocated_district: activityData.allocated_district || "", // Added new field
        is_past: activityData.is_past,
        is_present: activityData.is_present,
        is_upcoming: activityData.is_upcoming,
        created_at: activityData.created_at,
        updated_at: activityData.updated_at
      });

      setSelectedActivityId(activityId);
      // store existing image for preview
      setExistingImage(activityData.image || null);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      setMessage(error.message || "An error occurred while fetching activity data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle activity card click
  const handleActivityClick = (activityId) => {
    console.log("Activity card clicked with ID:", activityId);
    fetchActivityData(activityId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files && files[0];
      setFormData((prev) => ({
        ...prev,
        image: file || null,
      }));

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

  // Reset form to original data
  const resetForm = () => {
    if (selectedActivityId) {
      fetchActivityData(selectedActivityId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to activity list
  const backToActivityList = () => {
    setSelectedActivityId(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };

  // Enable adding new activity
  const addNewActivity = () => {
    setFormData({
      id: null,
      activity_id: "",
      activity_name: "",
      objective: "",
      activity_date_time: "",
      venue: "",
      image: null,
      activity_fee: "",
      portal_charges: "",
      transaction_charges: "",
      tax_amount: "",
      total_amount: "",
      allocated_district: "", // Reset new field
      is_past: false,
      is_present: false,
      is_upcoming: false,
      created_at: "",
      updated_at: ""
    });
    setIsEditing(true);
    setSelectedActivityId(null);
    setShowAlert(false);
  };

  // Calculate activity status based on date
  const calculateActivityStatus = (activityDateTime) => {
    if (!activityDateTime) return { is_past: false, is_present: false, is_upcoming: false };
    
    const activityDate = new Date(activityDateTime);
    const now = new Date();
    
    // Check if the activity is in the past, present, or future
    const isPast = activityDate < now;
    const isPresent = Math.abs(activityDate - now) < 24 * 60 * 60 * 1000; // Within 24 hours
    const isUpcoming = activityDate > now;
    
    return {
      is_past: isPast,
      is_present: isPresent && !isPast,
      is_upcoming: isUpcoming
    };
  };

  // Get status badge component
  const getStatusBadge = (isPast, isPresent, isUpcoming) => {
    if (isPast) {
      return <Badge bg="secondary">Past</Badge>;
    } else if (isPresent) {
      return <Badge bg="success">Ongoing</Badge>;
    } else if (isUpcoming) {
      return <Badge bg="primary">Upcoming</Badge>;
    }
    return <Badge bg="secondary">Not Set</Badge>;
  };

  // Get district label by value
  const getDistrictLabel = (value) => {
    const district = districtOptions.find(d => d.value === value);
    return district ? district.label : value;
  };

  // Handle form submission (POST for new, PUT for update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      // Calculate status based on activity date
      const status = calculateActivityStatus(formData.activity_date_time);
      
      const payload = {
        id: formData.id,
        activity_id: formData.activity_id,
        activity_name: formData.activity_name,
        objective: formData.objective,
        activity_date_time: formData.activity_date_time,
        venue: formData.venue,
        activity_fee: formData.activity_fee,
        allocated_district: formData.allocated_district, // Added new field
        is_past: status.is_past,
        is_present: status.is_present,
        is_upcoming: status.is_upcoming
      };

      console.log("Submitting data for activity:", formData.activity_name);
      console.log("Payload:", payload);

      // If we have a new image, we need to handle it with FormData
      if (formData.image) {
        const dataToSend = new FormData();
        if (formData.id) dataToSend.append('id', formData.id);
        dataToSend.append('activity_id', formData.activity_id);
        dataToSend.append('activity_name', formData.activity_name);
        dataToSend.append('objective', formData.objective);
        dataToSend.append('activity_date_time', formData.activity_date_time);
        dataToSend.append('venue', formData.venue);
        dataToSend.append('activity_fee', formData.activity_fee);
        dataToSend.append('allocated_district', formData.allocated_district || '');
        dataToSend.append('is_past', status.is_past);
        dataToSend.append('is_present', status.is_present);
        dataToSend.append('is_upcoming', status.is_upcoming);
        dataToSend.append('image', formData.image, formData.image.name);

        console.log('FormData content:');
        for (let pair of dataToSend.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/?id=${formData.id}`;
        console.log('PUT URL (FormData):', url);
        
        let response = await fetch(url, {
          method: 'PUT',
          body: dataToSend,
          headers: {
            Authorization: `Bearer ${auth?.access}`,
          },
        });

        // If unauthorized, try refreshing token and retry once
        if (response.status === 401) {
          const newAccess = await refreshAccessToken();
          if (!newAccess) throw new Error('Session expired');
          response = await fetch(url, {
            method: 'PUT',
            body: dataToSend,
            headers: {
              Authorization: `Bearer ${newAccess}`,
            },
          });
        }

        console.log("PUT Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          let errorData = null;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            /* not JSON */
          }
          console.error('Server error response:', errorData || errorText);
          throw new Error(
            (errorData && errorData.message) ||
              "Failed to update activity details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Activity details updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);

          // Update existing image if new one was uploaded
          if (formData.image) {
            if (result.data && result.data.image) {
              setExistingImage(result.data.image);
            }
            setImagePreview(null);
            setFormData((prev) => ({ ...prev, image: null }));
          }

          // Update the activity in the list
          if (result.data) {
            let updatedActivity;
            if (Array.isArray(result.data)) {
              updatedActivity = result.data.find(item => item.id === formData.id);
            } else {
              updatedActivity = result.data;
            }
            
            if (updatedActivity) {
              setActivities(prevActivities => 
                prevActivities.map(activity => 
                  activity.id === formData.id ? updatedActivity : activity
                )
              );
            }
          }

          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update activity details"
          );
        }
      } else {
        // For updates without new image, use JSON
        const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/?id=${formData.id}`;
        console.log("PUT URL (JSON):", url);
        
        let response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.access}`,
          },
          body: JSON.stringify(payload),
        });

        // If unauthorized, try refreshing token and retry once
        if (response.status === 401) {
          const newAccess = await refreshAccessToken();
          if (!newAccess) throw new Error('Session expired');
          response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newAccess}`,
            },
            body: JSON.stringify(payload),
          });
        }

        console.log("PUT Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          let errorData = null;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            /* not JSON */
          }
          console.error('Server error response:', errorData || errorText);
          throw new Error(
            (errorData && errorData.message) ||
              "Failed to update activity details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Activity details updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);
          
          // Update the activity in the list
          if (result.data) {
            let updatedActivity;
            if (Array.isArray(result.data)) {
              updatedActivity = result.data.find(item => item.id === formData.id);
            } else {
              updatedActivity = result.data;
            }
            
            if (updatedActivity) {
              setActivities(prevActivities => 
                prevActivities.map(activity => 
                  activity.id === formData.id ? updatedActivity : activity
                )
              );
            }
          }
          
          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update activity details"
          );
        }
      }
    } catch (error) {
      console.error("Error updating activity details:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error: Could not connect to the server. Please check the API endpoint.";
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

  // Handle delete activity - Updated to match the approach in ManageWings
  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;
    
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/?id=${activityToDelete.id}`;
      console.log("DELETE URL:", url);
      
      // Create request body with the ID
      const payload = { id: activityToDelete.id };
      
      let response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.access}`,
        },
        body: JSON.stringify(payload),
      });

      // If unauthorized, try refreshing token and retry once
      if (response.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) throw new Error("Session expired");
        response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccess}`,
          },
          body: JSON.stringify(payload),
        });
      }

      console.log("DELETE Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = null;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          /* not JSON */
        }
        console.error("Server error response:", errorData || errorText);
        throw new Error(
          (errorData && errorData.message) ||
            "Failed to delete activity"
        );
      }

      const result = await response.json();
      console.log("DELETE Success response:", result);

      if (result.success) {
        setMessage("Activity deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Remove the activity from the list
        setActivities(prevActivities => 
          prevActivities.filter(activity => activity.id !== activityToDelete.id)
        );
        
        // If we were viewing the deleted activity, go back to the list
        if (selectedActivityId === activityToDelete.id) {
          backToActivityList();
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to delete activity"
        );
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error: Could not connect to the server. Please check the API endpoint.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setActivityToDelete(null);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (activity) => {
    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get image URL or placeholder
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";
    // If it's a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the correct base URL
    return `https://mahadevaaya.com/ngoproject/ngoproject_backend${imagePath}`;
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
              <h1 className="page-title mb-0">Manage Activities</h1>
             
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
                <p className="mt-2">Loading Activities...</p>
              </div>
            ) : (
              <>
                {!selectedActivityId ? (
                  // Activities List View
                  <>
                    <Row className="mb-4">
                      <Col>
                     
                        {activities.length === 0 ? (
                          <Alert variant="info">
                            No activities found. 
                          </Alert>
                        ) : (
                          <Row>
                            {activities.map((activity) => (
                              <Col md={6} lg={4} className="mb-4" key={activity.id}>
                                <Card className="h-100 activity-card profile-card">
                                  <div className="activity-image-container" style={{ height: "180px", overflow: "hidden" }}>
                                    <Image 
                                      src={getImageUrl(activity.image)} 
                                      alt={activity.activity_name}
                                      fluid
                                      style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                    />
                                  </div>
                                  <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Card.Title as="h5" className="mb-0">
                                          {activity.activity_name}
                                        </Card.Title>
                                        {getStatusBadge(activity.is_past, activity.is_present, activity.is_upcoming)}
                                      </div>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>ID:</strong> {activity.activity_id}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <FaCalendarAlt className="me-1" />
                                        {formatDate(activity.activity_date_time)}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <FaMapMarkerAlt className="me-1" />
                                        {activity.venue}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>District:</strong> {activity.allocated_district ? getDistrictLabel(activity.allocated_district) : "Not specified"}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <FaMoneyBillWave className="me-1" />
                                        Fee: ₹{activity.activity_fee}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        Total: ₹{activity.total_amount}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-3">
                                        {activity.objective && activity.objective.length > 100 
                                          ? `${activity.objective.substring(0, 100)}...` 
                                          : activity.objective}
                                      </Card.Text>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                      <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => handleActivityClick(activity.id)}
                                      >
                                        <FaEdit /> Edit
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => showDeleteConfirmation(activity)}
                                      >
                                        <FaTrash /> Delete
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Col>
                    </Row>
                  </>
                ) : (
                  // Activity Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToActivityList}>
                        <FaArrowLeft /> Back to Activities List
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                        <span>{formData.id ? `Edit Activity: ${formData.activity_name}` : "Add New Activity"}</span>
                        {formData.id && getStatusBadge(formData.is_past, formData.is_present, formData.is_upcoming)}
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleSubmit}>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Activity ID</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="activity_id"
                                  value={formData.activity_id}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Generated automatically"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Activity Fee</Form.Label>
                                <Form.Control
                                  type="number"
                                  name="activity_fee"
                                  value={formData.activity_fee}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Enter activity fee"
                                  step="0.01"
                                  min="0"
                                />
                                <Form.Text className="text-muted">
                                  Base fee for the activity (other charges will be calculated automatically)
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label>Activity Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter activity name"
                              name="activity_name"
                              value={formData.activity_name}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Objective</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter activity objective"
                              name="objective"
                              value={formData.objective}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Date & Time</Form.Label>
                                <Form.Control
                                  type="datetime-local"
                                  name="activity_date_time"
                                  value={formData.activity_date_time ? formatDateForInput(formData.activity_date_time) : ""}
                                  onChange={handleChange}
                                  required
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Venue</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Enter activity venue"
                                  name="venue"
                                  value={formData.venue}
                                  onChange={handleChange}
                                  required
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Allocated District</Form.Label>
                                <Form.Select
                                  name="allocated_district"
                                  value={formData.allocated_district}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                >
                                  <option value="">Select District</option>
                                  {districtOptions.map((district) => (
                                    <option key={district.value} value={district.value}>
                                      {district.label}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                  Select the district where the activity will be conducted
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Profile Image</Form.Label>
                                {isEditing ? (
                                  <>
                                    <Form.Control
                                      type="file"
                                      name="image"
                                      onChange={handleChange}
                                      accept="image/*"
                                    />
                                    {imagePreview ? (
                                      <div className="mt-3">
                                        <p>New Image Preview:</p>
                                        <img
                                          src={imagePreview}
                                          alt="Image Preview"
                                          style={{ maxWidth: "200px", maxHeight: "200px" }}
                                        />
                                      </div>
                                    ) : (
                                      existingImage && (
                                        <div className="mt-3">
                                          <p>Current Image:</p>
                                          <img
                                            src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${existingImage}`}
                                            alt="Current Image"
                                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                                          />
                                        </div>
                                      )
                                    )}
                                  </>
                                ) : (
                                  existingImage && (
                                    <div className="mt-3">
                                      <img
                                        src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${existingImage}`}
                                        alt="Activity preview"
                                        style={{ maxHeight: "200px" }}
                                      />
                                    </div>
                                  )
                                )}
                              </Form.Group>
                            </Col>
                          </Row>

                          {/* Fee Breakdown (Read-only) */}
                          {formData.id && (
                            <Card className="mb-3">
                              <Card.Header as="h6">Fee Breakdown</Card.Header>
                              <Card.Body>
                                <Row>
                                  <Col md={3}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>Portal Charges</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={`₹${formData.portal_charges}`}
                                        disabled
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>Transaction Charges</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={`₹${formData.transaction_charges}`}
                                        disabled
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>Tax Amount</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={`₹${formData.tax_amount}`}
                                        disabled
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>Total Amount</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={`₹${formData.total_amount}`}
                                        disabled
                                        className="fw-bold"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Form.Text className="text-muted">
                                  These values are calculated automatically based on the activity fee
                                </Form.Text>
                              </Card.Body>
                            </Card>
                          )}

                          {formData.id && (
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Created At</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={formatDate(formData.created_at)}
                                    disabled
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Updated At</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={formatDate(formData.updated_at)}
                                    disabled
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          )}
                        </Form>
                      </Card.Body>
                    </Card>

                    <div className="d-flex gap-2 mt-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                          >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={resetForm}
                            type="button"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="primary"
                            onClick={enableEditing}
                            type="button"
                          >
                            <FaEdit /> Edit Activity Details
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => showDeleteConfirmation(formData)}
                            type="button"
                          >
                            <FaTrash /> Delete Activity
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the activity "{activityToDelete?.activity_name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteActivity}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManageActivity;
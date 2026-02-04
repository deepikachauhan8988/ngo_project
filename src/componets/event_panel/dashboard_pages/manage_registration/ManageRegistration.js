import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Dropdown } from "react-bootstrap";
import "../../../../assets/css/dashboard.css";
import { useAuth } from "../../../context/AuthContext";
import { useAuthFetch } from "../../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";
import { FaEdit, FaArrowLeft, FaTrash, FaCheck, FaTimes, FaClock } from "react-icons/fa";

const ManageRegistration = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // District options
  const districtOptions = [
    "haridwar", "dehradun", "uttarkashi", "chamoli", "rudraprayag",
    "tehri_garhwal", "pauri_garhwal", "nainital", "almora", "pithoragarh",
    "udham_singh_nagar", "bageshwar", "champawat"
  ];

  // State for all registrations details
  const [registrations, setRegistrations] = useState([]);
  
  // Form state for selected registration
  const [formData, setFormData] = useState({
    id: null,
    member_id: "",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    district: "", // New field
    state: "Uttarakhand", // New field with default value
    short_description: "",
    occupation: "",
    designation: "",
    department_name: "",
    organization_name: "",
    nature_of_work: "",
    education_level: "",
    status: "pending",
    other_text: "",
    image: null,
  });

  // State for file preview
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState(null);

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

  // Fetch all registrations on component mount
  useEffect(() => {
    fetchAllRegistrations();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all registrations from API
  const fetchAllRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch registrations data");
      }

      const result = await response.json();
      console.log("GET All Registrations API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setRegistrations(result.data);
      } else {
        throw new Error("No registrations found");
      }
    } catch (error) {
      console.error("Error fetching registrations data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific registration data by ID
  const fetchRegistrationData = async (regId) => {
    setIsLoading(true);
    try {
      console.log("Fetching registration with ID:", regId);
      const response = await fetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?id=${regId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch registration data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Registration Details API Response:", result);

      if (result.success) {
        let regData;
        
        // Check if data is an array or a single object
        if (Array.isArray(result.data)) {
          regData = result.data.find(item => item.id.toString() === regId.toString());
          if (!regData) {
            throw new Error(`Registration with ID ${regId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === regId.toString()) {
            regData = result.data;
          } else {
            throw new Error(`Returned registration ID ${result.data.id} does not match requested ID ${regId}`);
          }
        } else {
          throw new Error("Invalid registration data structure in response");
        }

        setFormData({
          id: regData.id,
          member_id: regData.member_id,
          full_name: regData.full_name,
          email: regData.email,
          phone: regData.phone,
          address: regData.address,
          district: regData.district || "", // New field
          state: regData.state || "Uttarakhand", // New field with default
          short_description: regData.short_description,
          occupation: regData.occupation,
          designation: regData.designation,
          department_name: regData.department_name,
          organization_name: regData.organization_name,
          nature_of_work: regData.nature_of_work,
          education_level: regData.education_level,
          status: regData.status,
          other_text: regData.other_text,
          image: null, // Reset to null for proper handling
        });

        // Set existing image URL for preview
        setExistingImage(regData.image);
        setSelectedRegId(regId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No registration data found in response");
      }
    } catch (error) {
      console.error("Error fetching registration data:", error);
      setMessage(error.message || "An error occurred while fetching registration data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration card click
  const handleRegistrationClick = (regId) => {
    console.log("Registration card clicked with ID:", regId);
    fetchRegistrationData(regId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
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
    if (selectedRegId) {
      fetchRegistrationData(selectedRegId);
    }
    setImagePreview(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to registration list
  const backToRegistrationList = () => {
    setSelectedRegId(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };

  // Handle delete request
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this registration?")) {
      return;
    }

    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?id=${formData.id}`;
      console.log("DELETE URL:", url);
      
      // Create request body with the ID
      const payload = { id: formData.id };
      
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
            "Failed to delete registration"
        );
      }

      const result = await response.json();
      console.log("DELETE Success response:", result);

      if (result.success) {
        setMessage("Registration deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Remove the registration from the list
        setRegistrations(prevRegs => 
          prevRegs.filter(reg => reg.id !== formData.id)
        );
        
        // Go back to the list view
        setTimeout(() => {
          backToRegistrationList();
          setShowAlert(false);
        }, 2000);
      } else {
        throw new Error(
          result.message || "Failed to delete registration"
        );
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
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

  // Handle form submission (PUT request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      // Create payload including member_id but excluding email and phone
      const jsonPayload = {
        member_id: formData.member_id, // Include member_id
        full_name: formData.full_name,
        address: formData.address,
        district: formData.district, // New field
        state: formData.state, // New field
        short_description: formData.short_description,
        occupation: formData.occupation,
        designation: formData.designation,
        department_name: formData.department_name,
        organization_name: formData.organization_name,
        nature_of_work: formData.nature_of_work,
        education_level: formData.education_level,
        status: formData.status,
        other_text: formData.other_text,
      };

      console.log("Submitting data for registration ID:", formData.id);
      console.log("JSON Payload:", jsonPayload);

      // If we have a new image, we need to handle it with FormData
      if (formData.image) {
        // For FormData (when there's a new image), include all fields
        const dataToSend = new FormData();
        dataToSend.append("id", formData.id);
        dataToSend.append("member_id", formData.member_id); // Include member_id for FormData
        dataToSend.append("full_name", formData.full_name);
        dataToSend.append("address", formData.address);
        dataToSend.append("district", formData.district); // New field
        dataToSend.append("state", formData.state); // New field
        dataToSend.append("short_description", formData.short_description);
        dataToSend.append("occupation", formData.occupation);
        dataToSend.append("designation", formData.designation);
        dataToSend.append("department_name", formData.department_name);
        dataToSend.append("organization_name", formData.organization_name);
        dataToSend.append("nature_of_work", formData.nature_of_work);
        dataToSend.append("education_level", formData.education_level);
        dataToSend.append("status", formData.status);
        dataToSend.append("other_text", formData.other_text);
        
        if (formData.image) {
          dataToSend.append("image", formData.image, formData.image.name);
        }

        console.log("FormData content:");
        for (let pair of dataToSend.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?id=${formData.id}`;
        console.log("PUT URL (FormData):", url);
        
        let response = await fetch(url, {
          method: "PUT",
          body: dataToSend,
          headers: {
            Authorization: `Bearer ${auth?.access}`,
          },
        });

        // If unauthorized, try refreshing token and retry once
        if (response.status === 401) {
          const newAccess = await refreshAccessToken();
          if (!newAccess) throw new Error("Session expired");
          response = await fetch(url, {
            method: "PUT",
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
          console.error("Server error response:", errorData || errorText);
          
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
          
          throw new Error(
            (errorData && errorData.message) ||
              "Failed to update registration details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Registration details updated successfully!");
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

          // Update the registration in the list
          if (result.data) {
            let updatedReg;
            if (Array.isArray(result.data)) {
              updatedReg = result.data.find(item => item.id === formData.id);
            } else {
              updatedReg = result.data;
            }
            
            if (updatedReg) {
              setRegistrations(prevRegs => 
                prevRegs.map(reg => 
                  reg.id === formData.id ? updatedReg : reg
                )
              );
            }
          }

          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update registration details"
          );
        }
      } else {
        // For updates without new image, use JSON - FIXED PART
        const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?id=${formData.id}`;
        console.log("PUT URL (JSON):", url);
        
        let response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.access}`,
          },
          body: JSON.stringify(jsonPayload),
        });

        // If unauthorized, try refreshing token and retry once
        if (response.status === 401) {
          const newAccess = await refreshAccessToken();
          if (!newAccess) throw new Error("Session expired");
          response = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newAccess}`,
            },
            body: JSON.stringify(jsonPayload),
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
          console.error("Server error response:", errorData || errorText);
          
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
          
          throw new Error(
            (errorData && errorData.message) ||
              "Failed to update registration details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Registration details updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);
          
          // Update the registration in the list
          if (result.data) {
            let updatedReg;
            if (Array.isArray(result.data)) {
              updatedReg = result.data.find(item => item.id === formData.id);
            } else {
              updatedReg = result.data;
            }
            
            if (updatedReg) {
              setRegistrations(prevRegs => 
                prevRegs.map(reg => 
                  reg.id === formData.id ? updatedReg : reg
                )
              );
            }
          }
          
          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update registration details"
          );
        }
      }
    } catch (error) {
      console.error("Error updating registration details:", error);
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

  // Function to get status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return <span className="badge bg-success"><FaCheck /> Accepted</span>;
      case "rejected":
        return <span className="badge bg-danger"><FaTimes /> Rejected</span>;
      case "pending":
      default:
        return <span className="badge bg-warning"><FaClock /> Pending</span>;
    }
  };

  // Function to format district name for display
  const formatDistrictName = (district) => {
    if (!district) return "";
    return district.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
            <h1 className="page-title">Manage Member Registrations</h1>

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
                <p className="mt-2">Loading Member Registrations...</p>
              </div>
            ) : (
              <>
                {!selectedRegId ? (
                  // Registrations List View
                  <>
                    <Row className="mb-4">
                      <Col>
                       
                        {registrations.length === 0 ? (
                          <Alert variant="info">
                            No member registrations found.
                          </Alert>
                        ) : (
                          <Row>
                            {registrations.map((reg) => (
                              <Col md={6} lg={4} className="mb-4" key={reg.id}>
                                <Card 
                                  className="h-100 registration-card profile-card" 
                                  onClick={() => handleRegistrationClick(reg.id)}
                                >
                                  <Card.Body>
                                    <div className="d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-start mb-3">
                                        <Card.Title as="h5" className="mb-0">
                                          {reg.full_name}
                                        </Card.Title>
                                        {getStatusBadge(reg.status)}
                                      </div>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Member ID:</strong> {reg.member_id}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Email:</strong> {reg.email}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Phone:</strong> {reg.phone}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>District:</strong> {formatDistrictName(reg.district)}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>State:</strong> {reg.state || "Uttarakhand"}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Occupation:</strong> {reg.occupation}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Organization:</strong> {reg.organization_name}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-3">
                                        <strong>Designation:</strong> {reg.designation}
                                      </Card.Text>
                                      
                                      <div className="d-flex align-items-center mb-3">
                                        {reg.image && (
                                          <div className="me-3">
                                            <img
                                              src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${reg.image}`}
                                              alt={reg.full_name}
                                              className="rounded registration-image"
                                              style={{ maxWidth: "80px", maxHeight: "80px" }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-end mt-auto">
                                      <Button variant="outline-primary" size="sm">
                                        <FaEdit /> Edit
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
                  // Registration Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToRegistrationList}>
                        <FaArrowLeft /> Back to Registrations List
                      </Button>
                     
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Member ID</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Member ID"
                          name="member_id"
                          value={formData.member_id}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter full name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={true}
                        />
                        <Form.Text className="text-muted">
                          Email address cannot be changed
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter phone number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          disabled={true}
                        />
                        <Form.Text className="text-muted">
                          Phone number cannot be changed
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      {/* New District and State Fields */}
                      <Row className="mb-3">
                        <Col sm={6}>
                          <Form.Group>
                            <Form.Label>District</Form.Label>
                            <Form.Select
                              name="district"
                              value={formData.district}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            >
                              <option value="">Select District</option>
                              {districtOptions.map(district => (
                                <option key={district} value={district}>
                                  {formatDistrictName(district)}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group>
                            <Form.Label>State</Form.Label>
                            <Form.Control
                              type="text"
                              name="state"
                              value={formData.state}
                              disabled
                              aria-label="State field is disabled and prefilled with Uttarakhand"
                            />
                            <Form.Text className="text-muted">
                              State is automatically set to Uttarakhand
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Short Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter short description"
                          name="short_description"
                          value={formData.short_description}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Occupation</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter occupation"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Designation</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter designation"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Department Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter department name"
                          name="department_name"
                          value={formData.department_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Organization Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter organization name"
                          name="organization_name"
                          value={formData.organization_name}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Nature of Work</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter nature of work"
                          name="nature_of_work"
                          value={formData.nature_of_work}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Education Level</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter education level"
                          name="education_level"
                          value={formData.education_level}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Other Information</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other information"
                          name="other_text"
                          value={formData.other_text}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>

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
                                  className="img-current"
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
                                    className="img-current"
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
                                alt="Current Image"
                                className="img-current"
                                style={{ maxWidth: "200px", maxHeight: "200px" }}
                              />
                            </div>
                          )
                        )}
                      </Form.Group>
                    </Form>

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
                        <Button
                          variant="primary"
                          onClick={enableEditing}
                          type="button"
                        >
                          Edit Registration Details
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default ManageRegistration;
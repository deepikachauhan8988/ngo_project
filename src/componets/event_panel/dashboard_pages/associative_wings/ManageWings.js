import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import "../../../../assets/css/dashboard.css";
import { useAuth } from "../../../context/AuthContext";
import { useAuthFetch } from "../../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";
import { FaEdit, FaArrowLeft, FaLink, FaTrash } from "react-icons/fa";

const ManageWings = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all wings details
  const [wingsDetails, setWingsDetails] = useState([]);
  
  // Form state for selected wing
  const [formData, setFormData] = useState({
    id: null,
    organization_name: "",
    native_wing: "",
    short_description: "",
    address: "",
    contact_person_name: "",
    phone: "",
    email: "",
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
  const [selectedWingId, setSelectedWingId] = useState(null);

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

  // Fetch all wings details on component mount
  useEffect(() => {
    fetchAllWingsDetails();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all wings details from API
  const fetchAllWingsDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wings details data");
      }

      const result = await response.json();
      console.log("GET All Wings Details API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setWingsDetails(result.data);
      } else {
        throw new Error("No wings details found");
      }
    } catch (error) {
      console.error("Error fetching wings details data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific wing data by ID
  const fetchWingData = async (wingId) => {
    setIsLoading(true);
    try {
      console.log("Fetching wing with ID:", wingId);
      const response = await fetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/?id=${wingId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch wing data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Wing Details API Response:", result);

      if (result.success) {
        let wingData;
        
        // Check if data is an array or a single object
        if (Array.isArray(result.data)) {
          wingData = result.data.find(item => item.id.toString() === wingId.toString());
          if (!wingData) {
            throw new Error(`Wing with ID ${wingId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === wingId.toString()) {
            wingData = result.data;
          } else {
            throw new Error(`Returned wing ID ${result.data.id} does not match requested ID ${wingId}`);
          }
        } else {
          throw new Error("Invalid wing data structure in response");
        }

        setFormData({
          id: wingData.id,
          organization_name: wingData.organization_name,
          native_wing: wingData.native_wing,
          short_description: wingData.short_description,
          address: wingData.address,
          contact_person_name: wingData.contact_person_name,
          phone: wingData.phone,
          email: wingData.email,
          image: null,
        });

        // Set existing image URL for preview
        setExistingImage(wingData.image);
        setSelectedWingId(wingId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No wing data found in response");
      }
    } catch (error) {
      console.error("Error fetching wing data:", error);
      setMessage(error.message || "An error occurred while fetching wing data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wing card click
  const handleWingClick = (wingId) => {
    console.log("Wing card clicked with ID:", wingId);
    fetchWingData(wingId);
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
    if (selectedWingId) {
      fetchWingData(selectedWingId);
    }
    setImagePreview(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to wing list
  const backToWingList = () => {
    setSelectedWingId(null);
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
    if (!window.confirm("Are you sure you want to delete this wing?")) {
      return;
    }

    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/?id=${formData.id}`;
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
            "Failed to delete wing"
        );
      }

      const result = await response.json();
      console.log("DELETE Success response:", result);

      if (result.success) {
        setMessage("Wing deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Remove the wing from the list
        setWingsDetails(prevWings => 
          prevWings.filter(wing => wing.id !== formData.id)
        );
        
        // Go back to the list view
        setTimeout(() => {
          backToWingList();
          setShowAlert(false);
        }, 2000);
      } else {
        throw new Error(
          result.message || "Failed to delete wing"
        );
      }
    } catch (error) {
      console.error("Error deleting wing:", error);
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
      // Prepare the data for submission
      const payload = {
        id: formData.id,
        organization_name: formData.organization_name,
        native_wing: formData.native_wing,
        short_description: formData.short_description,
        address: formData.address,
        contact_person_name: formData.contact_person_name,
        phone: formData.phone,
        email: formData.email,
      };

      console.log("Submitting data for wing ID:", formData.id);
      console.log("Payload:", payload);

      // If we have a new image, we need to handle it with FormData
      if (formData.image) {
        const dataToSend = new FormData();
        dataToSend.append("id", formData.id);
        dataToSend.append("organization_name", formData.organization_name);
        dataToSend.append("native_wing", formData.native_wing);
        dataToSend.append("short_description", formData.short_description);
        dataToSend.append("address", formData.address);
        dataToSend.append("contact_person_name", formData.contact_person_name);
        dataToSend.append("phone", formData.phone);
        dataToSend.append("email", formData.email);
        
        if (formData.image) {
          dataToSend.append("image", formData.image, formData.image.name);
        }

        console.log("FormData content:");
        for (let pair of dataToSend.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/?id=${formData.id}`;
        console.log("PUT URL:", url);
        
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
          throw new Error(
            (errorData && errorData.message) ||
              "Failed to update wing details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Wing details updated successfully!");
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

          // Update the wing in the list
          if (result.data) {
            let updatedWing;
            if (Array.isArray(result.data)) {
              updatedWing = result.data.find(item => item.id === formData.id);
            } else {
              updatedWing = result.data;
            }
            
            if (updatedWing) {
              setWingsDetails(prevWings => 
                prevWings.map(wing => 
                  wing.id === formData.id ? updatedWing : wing
                )
              );
            }
          }

          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update wing details"
          );
        }
      } else {
        // For updates without new image, use JSON
        const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/?id=${formData.id}`;
        console.log("PUT URL (JSON):", url);
        
        const response = await authFetch(url, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        console.log("PUT Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server error response:", errorData);
          throw new Error(
            errorData.message || "Failed to update wing details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Wing details updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);
          
          // Update the wing in the list
          if (result.data) {
            let updatedWing;
            if (Array.isArray(result.data)) {
              updatedWing = result.data.find(item => item.id === formData.id);
            } else {
              updatedWing = result.data;
            }
            
            if (updatedWing) {
              setWingsDetails(prevWings => 
                prevWings.map(wing => 
                  wing.id === formData.id ? updatedWing : wing
                )
              );
            }
          }
          
          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update wing details"
          );
        }
      }
    } catch (error) {
      console.error("Error updating wing details:", error);
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
            <h1 className="page-title">Manage Wings</h1>

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
                <p className="mt-2">Loading Wings Details...</p>
              </div>
            ) : (
              <>
                {!selectedWingId ? (
                  // Wings List View
                  <>
                    <Row className="mb-4">
                      <Col>
                     
                        {wingsDetails.length === 0 ? (
                          <Alert variant="info">
                            No wings details found.
                          </Alert>
                        ) : (
                          <Row>
                            {wingsDetails.map((wing) => (
                              <Col md={6} lg={4} className="mb-4" key={wing.id}>
                                <Card 
                                  className="h-100 wing-card profile-card" 
                                  onClick={() => handleWingClick(wing.id)}
                                >
                                  <Card.Body>
                                    <div className="d-flex flex-column">
                                      <Card.Title as="h5" className="mb-3">
                                        {wing.organization_name}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Nature Of Work:</strong> {wing.native_wing}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Contact Person:</strong> {wing.contact_person_name}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Email:</strong> {wing.email}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Phone:</strong> {wing.phone}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-3">
                                        <strong>Address:</strong> {wing.address}
                                      </Card.Text>
                                      
                                      <div className="d-flex align-items-center mb-3">
                                        {wing.image && (
                                          <div className="me-3">
                                            <img
                                              src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${wing.image}`}
                                              alt={wing.organization_name}
                                              className="rounded wing-image"
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
                  // Wing Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToWingList}>
                        <FaArrowLeft /> Back to Wings List
                      </Button>
                      {!isEditing && (
                        <Button variant="danger" onClick={handleDelete} disabled={isSubmitting}>
                          <FaTrash /> Delete Wing
                        </Button>
                      )}
                    </div>

                    <Form onSubmit={handleSubmit}>
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
                        <Form.Label>Nature Of Work</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter native wing"
                          name="native_wing"
                          value={formData.native_wing}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

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

                      <Form.Group className="mb-3">
                        <Form.Label>Contact Person Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter contact person name"
                          name="contact_person_name"
                          value={formData.contact_person_name}
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
                          disabled={!isEditing}
                        />
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
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Portfolio Image</Form.Label>
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
                          Edit Wing Details
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

export default ManageWings;
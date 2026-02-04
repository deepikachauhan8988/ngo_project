import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner, Modal } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";

const ManageAboutUs = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for carousel items
  const [carouselItems, setCarouselItems] = useState([]);
  
  // Form state for carousel item
  const [carouselFormData, setCarouselFormData] = useState({
    id: null,
    title: "",
    description: "",
    image: null,
    imageFile: null, // Store the actual file object
    module: [
      ["", ""],
      ["", ""],
      ["", ""]
    ]
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCarouselId, setSelectedCarouselId] = useState(null);

  // Modal state for image preview
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Fetch carousel items when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchCarouselItems();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch carousel items from API
  const fetchCarouselItems = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/aboutus-item/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch carousel items");
      }

      const result = await response.json();
      console.log("GET Carousel Items API Response:", result);

      // Check if the response is directly an array or wrapped in an object
      if (Array.isArray(result)) {
        // Direct array response
        if (result.length > 0) {
          setCarouselItems(result);
        } else {
          setCarouselItems([]);
        }
      } else if (result.success && result.data && result.data.length > 0) {
        // Wrapped response object
        setCarouselItems(result.data);
      } else {
        setCarouselItems([]);
      }
    } catch (error) {
      console.error("Error fetching carousel items:", error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setMessage("Permission denied. You may not have the required role to access this feature.");
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setMessage("Authentication error. Please login again.");
        // Redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setMessage(error.message || "An error occurred while fetching carousel data");
      }
      
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific carousel item by ID
  const fetchCarouselItem = async (itemId) => {
    setIsLoading(true);
    try {
      console.log("Fetching carousel item with ID:", itemId);
      const response = await authFetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/aboutus-item/?id=${itemId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch carousel item. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Carousel Item API Response:", result);

      // Handle both array and object responses
      let carouselData;
      
      if (Array.isArray(result)) {
        // Direct array response
        carouselData = result.find(item => item.id.toString() === itemId.toString());
        if (!carouselData) {
          throw new Error(`Carousel item with ID ${itemId} not found in response array`);
        }
      } else if (result.success) {
        // Wrapped response object
        if (Array.isArray(result.data)) {
          carouselData = result.data.find(item => item.id.toString() === itemId.toString());
          if (!carouselData) {
            throw new Error(`Carousel item with ID ${itemId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === itemId.toString()) {
            carouselData = result.data;
          } else {
            throw new Error(`Returned carousel item ID ${result.data.id} does not match requested ID ${itemId}`);
          }
        } else {
          throw new Error("Invalid carousel item data structure in response");
        }
      } else {
        throw new Error(result.message || "No carousel item data found in response");
      }

      // Construct the full image URL if image exists
      const imageUrl = carouselData.image 
        ? `https://mahadevaaya.com/ngoproject/ngoproject_backend${carouselData.image}`
        : null;

      setCarouselFormData({
        id: carouselData.id,
        title: carouselData.title || "",
        description: carouselData.description || "",
        image: imageUrl,
        imageFile: null, // Reset image file
        module: carouselData.module || [
          ["", ""],
          ["", ""],
          [""]
        ]
      });

      setSelectedCarouselId(itemId);
    } catch (error) {
      console.error("Error fetching carousel item:", error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setMessage("Permission denied. You may not have the required role to access this feature.");
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setMessage("Authentication error. Please login again.");
        // Redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setMessage(error.message || "An error occurred while fetching carousel item");
      }
      
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle carousel card click
  const handleCarouselClick = (itemId) => {
    console.log("Carousel card clicked with ID:", itemId);
    fetchCarouselItem(itemId);
  };

  // Handle form input changes for carousel
  const handleCarouselChange = (e) => {
    const { name, value } = e.target;
    setCarouselFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Store the actual file object for upload
      setCarouselFormData(prev => ({
        ...prev,
        imageFile: file,
        image: previewUrl // Update the image display to show the new image
      }));
    }
  };

  // Handle module change
  const handleModuleChange = (index, field, value) => {
    const newModule = [...carouselFormData.module];
    newModule[index][field === 'title' ? 0 : 1] = value;
    setCarouselFormData(prev => ({
      ...prev,
      module: newModule
    }));
  };

  // Add new module item
  const addModuleItem = () => {
    setCarouselFormData(prev => ({
      ...prev,
      module: [...prev.module, ["", ""]]
    }));
  };

  // Remove module item
  const removeModuleItem = (index) => {
    if (carouselFormData.module.length > 1) {
      const newModule = [...carouselFormData.module];
      newModule.splice(index, 1);
      setCarouselFormData(prev => ({
        ...prev,
        module: newModule
      }));
    }
  };

  // Reset carousel form to original data
  const resetCarouselForm = () => {
    if (selectedCarouselId) {
      fetchCarouselItem(selectedCarouselId);
    }
    setIsEditing(false);
    setShowAlert(false);
    setImagePreview(null);
  };

  // Go back to carousel list
  const backToCarouselList = () => {
    setSelectedCarouselId(null);
    setIsEditing(false);
    setShowAlert(false);
    setImagePreview(null);
  };

  // Enable editing mode for carousel
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };

  // Handle form submission (PUT request) for carousel
  const handleCarouselSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      // Check if we have a new image to upload
      if (carouselFormData.imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("id", carouselFormData.id);
        formData.append("title", carouselFormData.title);
        formData.append("description", carouselFormData.description);
        formData.append("image", carouselFormData.imageFile);
        formData.append("module", JSON.stringify(carouselFormData.module));

        console.log("Submitting FormData with image");

        // Use fetch directly for FormData
        const url = "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/aboutus-item/";
        
        let response = await fetch(url, {
          method: "PUT",
          body: formData,
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
            body: formData,
            headers: {
              Authorization: `Bearer ${newAccess}`,
            },
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
          throw new Error(
            (errorData && errorData.message) || "Failed to update carousel item with image"
          );
        }

        const result = await response.json();
        console.log("PUT Success response with image:", result);

        if (result.success) {
          setMessage("Carousel item updated successfully with new image!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);
          
          // Update the image in the form data
          if (result.data && result.data.image) {
            const imageUrl = `https://mahadevaaya.com/ngoproject/ngoproject_backend${result.data.image}`;
            setCarouselFormData(prev => ({
              ...prev,
              image: imageUrl,
              imageFile: null // Reset the file after successful upload
            }));
          }
          
          // Clean up the preview URL
          if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
          }

          // Update the carousel item in the list
          if (result.data) {
            let updatedCarouselItem;
            if (Array.isArray(result.data)) {
              updatedCarouselItem = result.data.find(item => item.id === carouselFormData.id);
            } else {
              updatedCarouselItem = result.data;
            }
            
            if (updatedCarouselItem) {
              setCarouselItems(prevItems => 
                prevItems.map(item => 
                  item.id === carouselFormData.id ? updatedCarouselItem : item
                )
              );
            }
          }

          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(result.message || "Failed to update carousel item");
        }
      } else {
        // No new image, use regular JSON submission
        const payload = {
          id: carouselFormData.id,
          title: carouselFormData.title,
          description: carouselFormData.description,
          module: carouselFormData.module
        };

        console.log("Submitting data for carousel ID:", carouselFormData.id);
        console.log("Payload:", payload);

        const response = await authFetch(
          `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/aboutus-item/`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        console.log("PUT Response status:", response.status);

        if (!response.ok) {
          // Handle specific error messages from the backend
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || errorData.detail || "Failed to update carousel item"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        // Handle both array and object responses
        if (Array.isArray(result) || result.success) {
          setMessage("Carousel item updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);

          // Update the carousel item in the list
          if (result.data) {
            let updatedCarouselItem;
            if (Array.isArray(result.data)) {
              updatedCarouselItem = result.data.find(item => item.id === carouselFormData.id);
            } else {
              updatedCarouselItem = result.data;
            }
            
            if (updatedCarouselItem) {
              setCarouselItems(prevItems => 
                prevItems.map(item => 
                  item.id === carouselFormData.id ? updatedCarouselItem : item
                )
              );
            }
          }

          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update carousel item"
          );
        }
      }
    } catch (error) {
      console.error("Error updating carousel item:", error);
      
      // Handle specific error cases
      if (error.message.includes('403') || error.message.includes('permission')) {
        setMessage("Permission denied. You may not have the required role to access this feature.");
      } else if (error.message.includes('authenticated') || error.message.includes('Session expired')) {
        setMessage("Authentication error. Please login again.");
        // Redirect to login
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      } else {
        setMessage(error.message || "Failed to update carousel item");
      }
      
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open image modal
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
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
              <Alert.Heading>Authentication Required</Alert.Heading>
              <p>You need to be logged in to view this page.</p>
              <Button variant="primary" onClick={() => navigate("/Login")}>
                Go to Login
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="page-title">Manage About Us Content</h1>

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
                <p className="mt-2">Loading Content Items...</p>
              </div>
            ) : (
              <>
                {!selectedCarouselId ? (
                  // Content List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        {carouselItems.length === 0 ? (
                          <Alert variant="info">
                            No content items found.
                          </Alert>
                        ) : (
                          <Row>
                            {carouselItems.map((item) => (
                              <Col md={6} lg={4} className="mb-4" key={item.id}>
                                <Card 
                                  className="h-100 content-card profile-card" 
                                  onClick={() => handleCarouselClick(item.id)}
                                >
                                  <Card.Body>
                                    <div className="d-flex flex-column">
                                      <Card.Title as="h5" className="mb-3">
                                        {item.title}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Description:</strong> {item.description}
                                      </Card.Text>
                                      {item.module && (
                                        <Card.Text className="text-muted mb-2">
                                          <strong>Module Items:</strong> {item.module.length}
                                        </Card.Text>
                                      )}
                                      {item.image && (
                                        <div className="mt-2">
                                          <img 
                                            src={`https://mahadevaaya.com/ngoproject/ngoproject_backend${item.image}`} 
                                            alt={item.title} 
                                            className="img-thumbnail content-thumbnail"
                                            style={{ maxHeight: '100px', cursor: 'pointer' }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openImageModal(`https://mahadevaaya.com/ngoproject/ngoproject_backend${item.image}`);
                                            }}
                                          />
                                        </div>
                                      )}
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
                  // Content Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToCarouselList}>
                        <FaArrowLeft /> Back to Content List
                      </Button>
                    </div>

                    <Form onSubmit={handleCarouselSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter title"
                          name="title"
                          value={carouselFormData.title}
                          onChange={handleCarouselChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter description"
                          name="description"
                          value={carouselFormData.description}
                          onChange={handleCarouselChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Image</Form.Label>
                        {/* Show current image or preview */}
                        {(carouselFormData.image || imagePreview) && (
                          <div className="mb-2">
                            <img 
                              src={imagePreview || carouselFormData.image} 
                              alt="Current" 
                              className="img-thumbnail"
                              style={{ maxHeight: '150px', cursor: 'pointer' }}
                              onClick={() => openImageModal(imagePreview || carouselFormData.image)}
                            />
                          </div>
                        )}
                        {isEditing && (
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Module Items</Form.Label>
                        {carouselFormData.module.map((moduleItem, index) => (
                          <div key={index} className="mb-3 p-3 border rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6>Module Item {index + 1}</h6>
                              {isEditing && carouselFormData.module.length > 1 && (
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  onClick={() => removeModuleItem(index)}
                                >
                                  <FaTrash />
                                </Button>
                              )}
                            </div>
                            <Row>
                              <Col md={6} className="mb-2">
                                <Form.Control
                                  type="text"
                                  placeholder="Module title"
                                  value={moduleItem[0]}
                                  onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                                  disabled={!isEditing}
                                />
                              </Col>
                              <Col md={6} className="mb-2">
                                <Form.Control
                                  type="text"
                                  placeholder="Module description"
                                  value={moduleItem[1]}
                                  onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                                  disabled={!isEditing}
                                />
                              </Col>
                            </Row>
                          </div>
                        ))}
                        {isEditing && (
                          <Button 
                            variant="outline-secondary" 
                            className="mt-2" 
                            onClick={addModuleItem}
                          >
                            <FaPlus /> Add Module Item
                          </Button>
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
                            onClick={handleCarouselSubmit}
                          >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={resetCarouselForm}
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
                          Edit Content Item
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

      {/* Image Preview Modal */}
      <Modal show={showImageModal} onHide={closeImageModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="img-fluid"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeImageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManageAboutUs;
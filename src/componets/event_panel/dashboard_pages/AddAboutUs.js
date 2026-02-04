import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useAuthFetch } from "../../context/AuthFetch";

const AddAboutUs = () => {
  const { logout } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state for About Us
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    modules: [""] // Initialize with one empty module
  });
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);
  
  // State for description validation error
  const [descriptionError, setDescriptionError] = useState("");
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

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

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      // Handle file input for image
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create a preview URL for selected image
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else if (name.startsWith('module')) {
      // Handle module inputs
      const moduleIndex = parseInt(name.split('-')[1]);
      
      setFormData(prev => {
        const newModules = [...prev.modules];
        newModules[moduleIndex] = value;
        
        return {
          ...prev,
          modules: newModules
        };
      });
    } else {
      // Handle text inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate description length
      if (name === 'description') {
        const wordCount = value.trim().split(/\s+/).length;
        if (value.trim() === '') {
          setDescriptionError("Description is required.");
        } else if (wordCount <= 10) {
          setDescriptionError(`Description must be more than 10 words. You have entered ${wordCount} words.`);
        } else {
          setDescriptionError(""); // Clear error if valid
        }
      }
    }
  };

  // Handle module changes
  const handleModuleChange = (index, value) => {
    setFormData(prev => {
      const newModules = [...prev.modules];
      newModules[index] = value;
      
      return {
        ...prev,
        modules: newModules
      };
    });
  };

  // Add a new module
  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, ""]
    }));
  };

  // Remove a module
  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      modules: [""]
    });
    setImagePreview(null);
    setMessage("");
    setShowAlert(false);
    setDescriptionError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors before submitting
    if (descriptionError) {
      setMessage("Please fix the validation errors before submitting.");
      setVariant("danger");
      setShowAlert(true);
      return;
    }
    
    setIsSubmitting(true);
    setShowAlert(false);
    
    // Create a FormData object to send the file
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    
    // Add image if it exists
    if (formData.image) {
      dataToSend.append('image', formData.image, formData.image.name);
    }
    
    // Add modules as JSON string
    dataToSend.append('module', JSON.stringify(formData.modules));
    
    try {
      // Using the provided API endpoint for about us
      const response = await authFetch('https://mahadevaaya.com/trilokayurveda/trilokabackend/api/aboutus-item/', {
        method: 'POST',
        credentials: 'include',
        body: dataToSend,
      });
      
      // Handle bad API responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to add about us content');
      }
      
      // SUCCESS PATH
      alert('About Us content added successfully!');
      setMessage("About Us content added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm();
      
      // Hide success alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      // FAILURE PATH
      console.error('Error adding about us content:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Could not connect to the server. Please check the API endpoint.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      
      // Hide error alert after 5 seconds
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
      <div className="main-content">
        <DashBoardHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body dashboard-main-container">
          <h1 className="page-title">Add About Us Content</h1>
          
          {/* Alert for success/error messages */}
          {showAlert && (
            <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
              {message}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description (must be more than 10 words)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                isInvalid={!!descriptionError}
              />
              <Form.Control.Feedback type="invalid">
                {descriptionError}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Image Preview"
                   className="img-wrapper"
               />
                </div>
              )}
            </Form.Group>
            
            {/* Modules Section */}
            <Form.Group className="mb-3">
              <Form.Label>Modules</Form.Label>
              <div className="modules-container">
                {formData.modules.map((module, index) => (
                  <div key={index} className="module-item mb-3 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5>Module {index + 1}</h5>
                      {formData.modules.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeModule(index)}
                        >
                          <FaTrash /> Remove
                        </Button>
                      )}
                    </div>
                    
                 <Form.Group className="mb-2">
  <Form.Label>Module Name</Form.Label>
  <Form.Control
    type="text"
    placeholder={`Enter module ${index + 1} name`}
    value={module.name}
    onChange={(e) => handleModuleChange(index, 'name', e.target.value)}
    required
  />
</Form.Group>

<Form.Group>
  <Form.Label>Module Description</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    placeholder={`Enter module ${index + 1} description`}
    value={module.description}
    onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
    required
  />
</Form.Group>
                  </div>
                ))}
                
                <Button 
                  variant="outline-primary" 
                  onClick={addModule}
                  className="mt-2"
                >
                  <FaPlus /> Add Another Module
                </Button>
              </div>
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
              className="me-2"
            >
              {isSubmitting ? 'Submitting...' : 'Add About Us Content'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={clearForm}
              type="button"
            >
              Clear
            </Button>
          </Form>
        </Container>
      </div>
    </div>
    </>
  );
};

export default AddAboutUs;
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Badge } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const ManageProfile = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all profiles
  const [profiles, setProfiles] = useState([]);
  
  // Form state for selected Profile
  const [formData, setFormData] = useState({
    id: null,
    full_name: "",
    title: "",
    designation: "",
    description: "",
    image: null,
    modules: [{ content: "", description: "" }],
  });

  // State for image preview
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
  const [selectedProfileId, setSelectedProfileId] = useState(null);

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

  // Fetch all profiles data on component mount
  useEffect(() => {
    fetchAllProfiles();
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

  // Fetch all profiles from API
  const fetchAllProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/trilokayurveda/trilokabackend/api/profile-items/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profiles data");
      }

      const result = await response.json();
      console.log("GET All Profiles API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setProfiles(result.data);
      } else {
        throw new Error("No profiles found");
      }
    } catch (error) {
      console.error("Error fetching profiles data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific Profile data by ID
  const fetchProfileData = async (profileId) => {
    setIsLoading(true);
    try {
      console.log("Fetching profile with ID:", profileId);
      const response = await fetch(
        `https://mahadevaaya.com/trilokayurveda/trilokabackend/api/profile-items/?id=${profileId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Profile data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Profile API Response:", result);

      if (result.success) {
        let profileData;
        
        // Check if data is an array (like in the get all response) or a single object
        if (Array.isArray(result.data)) {
          // If it's an array, find the profile with matching ID
          profileData = result.data.find(profile => profile.id.toString() === profileId.toString());
          if (!profileData) {
            throw new Error(`Profile with ID ${profileId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          // If data is a single object, check if it's the one we want
          if (result.data.id.toString() === profileId.toString()) {
            profileData = result.data;
          } else {
            throw new Error(`Returned profile ID ${result.data.id} does not match requested ID ${profileId}`);
          }
        } else {
          throw new Error("Invalid profile data structure in response");
        }

        // Check if modules is an array of objects
        let modulesData = [];
        if (profileData.module && Array.isArray(profileData.module)) {
          if (
            profileData.module.length > 0 &&
            typeof profileData.module[0] === "object"
          ) {
            modulesData = [...profileData.module];
          } else {
            modulesData = [{ content: "", description: "" }];
          }
        } else {
          modulesData = [{ content: "", description: "" }];
        }

        setFormData({
          id: profileData.id,
          full_name: profileData.full_name,
          title: profileData.title,
          designation: profileData.designation,
          description: profileData.description,
          image: null,
          modules: modulesData,
        });

        // Set existing image URL for preview
        setExistingImage(profileData.image);
        setSelectedProfileId(profileId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No Profile data found in response");
      }
    } catch (error) {
      console.error("Error fetching Profile data:", error);
      setMessage(error.message || "An error occurred while fetching profile data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile card click
  const handleProfileClick = (profileId) => {
    console.log("Profile card clicked with ID:", profileId);
    fetchProfileData(profileId);
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

  // Handle module changes
  const handleModuleChange = (index, field, value) => {
    setFormData((prev) => {
      const newModules = [...prev.modules];
      if (!newModules[index] || typeof newModules[index] !== "object") {
        newModules[index] = { content: "", description: "" };
      }
      newModules[index] = {
        ...newModules[index],
        [field]: value,
      };

      return {
        ...prev,
        modules: newModules,
      };
    });
  };

  // Add a new module
  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { content: "", description: "" }],
    }));
  };

  // Remove a module
  const removeModule = (index) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedProfileId) {
      fetchProfileData(selectedProfileId);
    }
    setImagePreview(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to profile list
  const backToProfileList = () => {
    setSelectedProfileId(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
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
        full_name: formData.full_name,
        title: formData.title,
        designation: formData.designation,
        description: formData.description,
        module: formData.modules,
      };

      console.log("Submitting data for profile ID:", formData.id);
      console.log("Payload:", payload);

      // If we have a new image, we need to handle it differently
      if (formData.image) {
        // For file uploads, we need FormData
        const dataToSend = new FormData();
        dataToSend.append("id", formData.id);
        dataToSend.append("full_name", formData.full_name);
        dataToSend.append("title", formData.title);
        dataToSend.append("designation", formData.designation);
        dataToSend.append("description", formData.description);
        dataToSend.append("image", formData.image, formData.image.name);
        dataToSend.append("module", JSON.stringify(formData.modules));

        console.log("FormData content:");
        for (let pair of dataToSend.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        const url = `https://mahadevaaya.com/trilokayurveda/trilokabackend/api/profile-items/?id=${formData.id}`;
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
              "Failed to update profile content"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Profile content updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);

          // Update existing image if a new one was uploaded
          if (formData.image) {
            // Check if response data is an array or object
            if (Array.isArray(result.data)) {
              const updatedProfile = result.data.find(profile => profile.id === formData.id);
              if (updatedProfile && updatedProfile.image) {
                setExistingImage(updatedProfile.image);
              }
            } else if (result.data && result.data.image) {
              setExistingImage(result.data.image);
            }
            setImagePreview(null);
            setFormData((prev) => ({ ...prev, image: null }));
          }

          // Update the profile in the list
          if (result.data) {
            let updatedProfile;
            if (Array.isArray(result.data)) {
              updatedProfile = result.data.find(profile => profile.id === formData.id);
            } else {
              updatedProfile = result.data;
            }
            
            if (updatedProfile) {
              setProfiles(prevProfiles => 
                prevProfiles.map(profile => 
                  profile.id === formData.id ? updatedProfile : profile
                )
              );
            }
          }

          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update profile content"
          );
        }
      } else {
        // For updates without a new image, use JSON
        const url = `https://mahadevaaya.com/trilokayurveda/trilokabackend/api/profile-items/?id=${formData.id}`;
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
            errorData.message || "Failed to update profile content"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Profile content updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);
          
          // Update the profile in the list
          if (result.data) {
            let updatedProfile;
            if (Array.isArray(result.data)) {
              updatedProfile = result.data.find(profile => profile.id === formData.id);
            } else {
              updatedProfile = result.data;
            }
            
            if (updatedProfile) {
              setProfiles(prevProfiles => 
                prevProfiles.map(profile => 
                  profile.id === formData.id ? updatedProfile : profile
                )
              );
            }
          }
          
          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update profile content"
          );
        }
      }
    } catch (error) {
      console.error("Error updating profile content:", error);
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
        <div className="main-content">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <h1 className="page-title">Manage Profiles</h1>

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
                <p className="mt-2">Loading Profiles...</p>
              </div>
            ) : (
              <>
                {!selectedProfileId ? (
                  // Profile List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        <h2 className="mb-4">Select a Profile to Edit</h2>
                        {profiles.length === 0 ? (
                          <Alert variant="info">
                            No profiles found. Please create profiles first.
                          </Alert>
                        ) : (
                          <Row>
                            {profiles.map((profile) => (
                              <Col md={6} lg={4} className="mb-4" key={profile.id}>
                                <Card 
                                  className="h-100 profile-card" 
                                  onClick={() => handleProfileClick(profile.id)}
                               
                                >
                                  <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                      {profile.image ? (
                                        <img
                                          src={`https://mahadevaaya.com/trilokayurveda/trilokabackend${profile.image}`}
                                          alt={profile.full_name}
                                          className="rounded-circle me-3 img-profile"
                                         
                                        />
                                      ) : (
                                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3 profile-name" >
                                          <span className="text-white">
                                            {profile.full_name ? profile.full_name.charAt(0) : 'P'}
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <Card.Title as="h5" className="mb-0">
                                          {profile.full_name}
                                        </Card.Title>
                                        <Card.Subtitle className="text-muted">
                                          {profile.title} {profile.designation}
                                        </Card.Subtitle>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                     
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
                  // Profile Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      
                      <Button variant="outline-secondary" onClick={backToProfileList}>
                        Back to Profiles
                      </Button>
                    </div>

                    <Form onSubmit={handleSubmit}>
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
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter title (e.g., Dr., Mr., etc.)"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
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
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Enter description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          disabled={!isEditing}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Image</Form.Label>
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
                                  className="img-wrapper"
                                />
                              </div>
                            ) : (
                              existingImage && (
                                <div className="mt-3">
                                  <p>Current Image:</p>
                                  <img
                                    src={`https://mahadevaaya.com/trilokayurveda/trilokabackend${existingImage}`}
                                    alt="Current Profile"
                                    className="img-wrapper"
                                  />
                                </div>
                              )
                            )}
                          </>
                        ) : (
                          existingImage && (
                            <div className="mt-3">
                              <img
                                src={`https://mahadevaaya.com/trilokayurveda/trilokabackend${existingImage}`}
                                alt="Current Profile"
                               className="img-wrapper"
                              />
                            </div>
                          )
                        )}
                      </Form.Group>

                      {/* Modules Section */}
                      <Form.Group className="mb-3">
                        <Form.Label>Modules</Form.Label>

                        <div className="modules-container">
                          {formData.modules.map((module, index) => (
                            <div
                              key={index}
                              className="module-item mb-3 p-3 border rounded"
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5>Module {index + 1}</h5>

                                {isEditing && formData.modules.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeModule(index)}
                                  >
                                    <FaTrash /> Remove
                                  </Button>
                                )}
                              </div>

                              {/* Module Content */}
                              <Form.Group className="mb-2">
                                <Form.Label>Module Content</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={`Enter module ${index + 1} title`}
                                  value={module.content || ""}
                                  onChange={(e) =>
                                    handleModuleChange(
                                      index,
                                      "content",
                                      e.target.value
                                    )
                                  }
                                  required
                                  disabled={!isEditing}
                                />
                              </Form.Group>

                              {/* Module Description */}
                              <Form.Group className="mb-2">
                                <Form.Label>Module Description</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  placeholder={`Enter module ${
                                    index + 1
                                  } description`}
                                  value={module.description || ""}
                                  onChange={(e) =>
                                    handleModuleChange(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  required
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </div>
                          ))}

                          {isEditing && (
                            <Button
                              variant="outline-primary"
                              onClick={addModule}
                              className="mt-2"
                            >
                              <FaPlus /> Add Another Module
                            </Button>
                          )}
                        </div>
                      </Form.Group>

                      {/* Buttons are now outside the form */}
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
                          Edit Profile
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

export default ManageProfile;
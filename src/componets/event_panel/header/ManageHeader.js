import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { FaEdit, FaArrowLeft, FaLink } from "react-icons/fa";

const ManageHeader = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all company details
  const [companyDetails, setCompanyDetails] = useState([]);
  
  // Form state for selected company
  const [formData, setFormData] = useState({
    id: null,
    company_name: "",
    address: "",
    email: "",
    phone: "",
    logo: null,
    profile_link: [],
  });

  // State for file preview
  const [logoPreview, setLogoPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // State for profile links management
  const [newProfileLink, setNewProfileLink] = useState("");

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

  // Fetch all company details on component mount
  useEffect(() => {
    fetchAllCompanyDetails();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all company details from API
  const fetchAllCompanyDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/company-detail-item/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch company details data");
      }

      const result = await response.json();
      console.log("GET All Company Details API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setCompanyDetails(result.data);
      } else {
        throw new Error("No company details found");
      }
    } catch (error) {
      console.error("Error fetching company details data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific company data by ID
  const fetchCompanyData = async (companyId) => {
    setIsLoading(true);
    try {
      console.log("Fetching company with ID:", companyId);
      const response = await fetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/company-detail-item/?id=${companyId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch company data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Company Details API Response:", result);

      if (result.success) {
        let companyData;
        
        // Check if data is an array or a single object
        if (Array.isArray(result.data)) {
          companyData = result.data.find(item => item.id.toString() === companyId.toString());
          if (!companyData) {
            throw new Error(`Company with ID ${companyId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === companyId.toString()) {
            companyData = result.data;
          } else {
            throw new Error(`Returned company ID ${result.data.id} does not match requested ID ${companyId}`);
          }
        } else {
          throw new Error("Invalid company data structure in response");
        }

        setFormData({
          id: companyData.id,
          company_name: companyData.company_name,
          address: companyData.address,
          email: companyData.email,
          phone: companyData.phone,
          logo: null,
          profile_link: companyData.profile_link || [],
        });

        // Set existing logo URL for preview
        setExistingLogo(companyData.logo);
        setSelectedCompanyId(companyId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No company data found in response");
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      setMessage(error.message || "An error occurred while fetching company data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle company card click
  const handleCompanyClick = (companyId) => {
    console.log("Company card clicked with ID:", companyId);
    fetchCompanyData(companyId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));

      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
      } else {
        setLogoPreview(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle profile link changes
  const handleProfileLinkChange = (index, value) => {
    setFormData((prev) => {
      const updatedProfileLinks = [...prev.profile_link];
      updatedProfileLinks[index] = value;
      return {
        ...prev,
        profile_link: updatedProfileLinks,
      };
    });
  };

  // Add new profile link
  const addProfileLink = () => {
    if (newProfileLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        profile_link: [...prev.profile_link, newProfileLink],
      }));
      setNewProfileLink("");
    }
  };

  // Remove profile link
  const removeProfileLink = (index) => {
    setFormData((prev) => {
      const updatedProfileLinks = [...prev.profile_link];
      updatedProfileLinks.splice(index, 1);
      return {
        ...prev,
        profile_link: updatedProfileLinks,
      };
    });
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedCompanyId) {
      fetchCompanyData(selectedCompanyId);
    }
    setLogoPreview(null);
    setNewProfileLink("");
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to company list
  const backToCompanyList = () => {
    setSelectedCompanyId(null);
    setIsEditing(false);
    setShowAlert(false);
    setNewProfileLink("");
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
        company_name: formData.company_name,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        profile_link: formData.profile_link,
      };

      console.log("Submitting data for company ID:", formData.id);
      console.log("Payload:", payload);

      // If we have a new logo, we need to handle it with FormData
      if (formData.logo) {
        const dataToSend = new FormData();
        dataToSend.append("id", formData.id);
        dataToSend.append("company_name", formData.company_name);
        dataToSend.append("address", formData.address);
        dataToSend.append("email", formData.email);
        dataToSend.append("phone", formData.phone);
        
        // Add profile links as JSON string
        dataToSend.append("profile_link", JSON.stringify(formData.profile_link));
        
        if (formData.logo) {
          dataToSend.append("logo", formData.logo, formData.logo.name);
        }

        console.log("FormData content:");
        for (let pair of dataToSend.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        const url = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/company-detail-item/?id=${formData.id}`;
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
              "Failed to update company details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Company details updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);

          // Update existing logo if new one was uploaded
          if (formData.logo) {
            if (result.data && result.data.logo) {
              setExistingLogo(result.data.logo);
            }
            setLogoPreview(null);
            setFormData((prev) => ({ ...prev, logo: null }));
          }

          // Update the company in the list
          if (result.data) {
            let updatedCompany;
            if (Array.isArray(result.data)) {
              updatedCompany = result.data.find(item => item.id === formData.id);
            } else {
              updatedCompany = result.data;
            }
            
            if (updatedCompany) {
              setCompanyDetails(prevCompanies => 
                prevCompanies.map(company => 
                  company.id === formData.id ? updatedCompany : company
                )
              );
            }
          }

          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update company details"
          );
        }
      } else {
        // For updates without new logo, use JSON
        const url = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/company-detail-item/?id=${formData.id}`;
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
            errorData.message || "Failed to update company details"
          );
        }

        const result = await response.json();
        console.log("PUT Success response:", result);

        if (result.success) {
          setMessage("Company details updated successfully!");
          setVariant("success");
          setShowAlert(true);
          setIsEditing(false);
          
          // Update the company in the list
          if (result.data) {
            let updatedCompany;
            if (Array.isArray(result.data)) {
              updatedCompany = result.data.find(item => item.id === formData.id);
            } else {
              updatedCompany = result.data;
            }
            
            if (updatedCompany) {
              setCompanyDetails(prevCompanies => 
                prevCompanies.map(company => 
                  company.id === formData.id ? updatedCompany : company
                )
              );
            }
          }
          
          setTimeout(() => setShowAlert(false), 3000);
        } else {
          throw new Error(
            result.message || "Failed to update company details"
          );
        }
      }
    } catch (error) {
      console.error("Error updating company details:", error);
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
            <h1 className="page-title">Manage Company Details</h1>

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
                <p className="mt-2">Loading Company Details...</p>
              </div>
            ) : (
              <>
                {!selectedCompanyId ? (
                  // Company List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        <h2 className="mb-4">Select a Company to Edit</h2>
                        {companyDetails.length === 0 ? (
                          <Alert variant="info">
                            No company details found.
                          </Alert>
                        ) : (
                          <Row>
                            {companyDetails.map((company) => (
                              <Col md={6} lg={4} className="mb-4" key={company.id}>
                                <Card 
                                  className="h-100 company-card profile-card" 
                                  onClick={() => handleCompanyClick(company.id)}
                                >
                                  <Card.Body>
                                    <div className="d-flex flex-column">
                                      <Card.Title as="h5" className="mb-3">
                                        {company.company_name}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Email:</strong> {company.email}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Phone:</strong> {company.phone}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-3">
                                        <strong>Address:</strong> {company.address}
                                      </Card.Text>
                                      
                                      <div className="d-flex align-items-center mb-3">
                                        {company.logo && (
                                          <div className="me-3">
                                            <img
                                              src={`https://mahadevaaya.com/eventmanagement/eventmanagement_backend${company.logo}`}
                                              alt={company.company_name}
                                              className="rounded company-logo"
                                              style={{ maxWidth: "80px", maxHeight: "80px" }}
                                            />
                                          </div>
                                        )}
                                        
                                        {company.profile_link && company.profile_link.length > 0 && (
                                          <div className="file-indicator d-flex align-items-center">
                                            <FaLink className="text-primary me-1" />
                                            <small>{company.profile_link.length} Link(s)</small>
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
                  // Company Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToCompanyList}>
                        <FaArrowLeft /> Back to Company List
                      </Button>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter company name"
                          name="company_name"
                          value={formData.company_name}
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
                        <Form.Label>Profile Links</Form.Label>
                        {isEditing ? (
                          <>
                            {formData.profile_link.map((link, index) => (
                              <div key={index} className="d-flex mb-2">
                                <Form.Control
                                  type="text"
                                  value={link}
                                  onChange={(e) => handleProfileLinkChange(index, e.target.value)}
                                  placeholder="Enter profile link"
                                />
                                <Button 
                                  variant="outline-danger" 
                                  className="ms-2"
                                  onClick={() => removeProfileLink(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <div className="d-flex">
                              <Form.Control
                                type="text"
                                value={newProfileLink}
                                onChange={(e) => setNewProfileLink(e.target.value)}
                                placeholder="Add new profile link"
                              />
                              <Button 
                                variant="outline-primary" 
                                className="ms-2"
                                onClick={addProfileLink}
                              >
                                Add
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div>
                            {formData.profile_link.length > 0 ? (
                              <ul>
                                {formData.profile_link.map((link, index) => (
                                  <li key={index}>
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                      {link}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted">No profile links added</p>
                            )}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Company Logo</Form.Label>
                        {isEditing ? (
                          <>
                            <Form.Control
                              type="file"
                              name="logo"
                              onChange={handleChange}
                              accept="image/*"
                            />
                            {logoPreview ? (
                              <div className="mt-3">
                                <p>New Logo Preview:</p>
                                <img
                                  src={logoPreview}
                                  alt="Logo Preview"
                                  className="img-current"
                                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                                />
                              </div>
                            ) : (
                              existingLogo && (
                                <div className="mt-3">
                                  <p>Current Logo:</p>
                                  <img
                                    src={`https://mahadevaaya.com/eventmanagement/eventmanagement_backend${existingLogo}`}
                                    alt="Current Logo"
                                    className="img-current"
                                    style={{ maxWidth: "200px", maxHeight: "200px" }}
                                  />
                                </div>
                              )
                            )}
                          </>
                        ) : (
                          existingLogo && (
                            <div className="mt-3">
                              <img
                                src={`https://mahadevaaya.com/eventmanagement/eventmanagement_backend${existingLogo}`}
                                alt="Current Logo"
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
                          Edit Company Details
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

export default ManageHeader;
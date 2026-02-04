import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Table, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEnvelope, FaPhone, FaUser, FaComment, FaSave, FaTimes, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import DashBoardHeader from "../../DashBoardHeader";
import LeftNav from "../../LeftNav";
import { useAuthFetch } from "../../../context/AuthFetch";

const ManageFeedback = () => {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all feedback
  const [feedbackList, setFeedbackList] = useState([]);
  
  // Form state for selected feedback
  const [formData, setFormData] = useState({
    id: null,
    full_name: "",
    email: "",
    mobile_number: "",
    message: "",
    status: "pending",
    created_at: ""
  });

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending", variant: "warning", icon: <FaClock /> },
    { value: "accepted", label: "Accepted", variant: "success", icon: <FaCheckCircle /> },
    { value: "rejected", label: "Rejected", variant: "danger", icon: <FaTimesCircle /> }
  ];

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Fetch all feedback on component mount
  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all feedback from API (no authentication needed for GET)
  const fetchAllFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/feedback/",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback data");
      }

      const result = await response.json();
      console.log("GET All Feedback API Response:", result);

      if (Array.isArray(result)) {
        setFeedbackList(result);
      } else if (result.success && result.data && Array.isArray(result.data)) {
        setFeedbackList(result.data);
      } else {
        setFeedbackList([]);
      }
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (feedback) => {
    setFormData({
      id: feedback.id,
      full_name: feedback.full_name,
      email: feedback.email,
      mobile_number: feedback.mobile_number,
      message: feedback.message,
      status: feedback.status,
      created_at: feedback.created_at
    });
    setSelectedFeedbackId(feedback.id);
    setIsEditing(true);
    setShowAlert(false);
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value,
    }));
  };

  // Handle form submission (UPDATE status only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id) {
      setMessage("No feedback selected for editing");
      setVariant("danger");
      setShowAlert(true);
      return;
    }

    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/feedback/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: formData.id,
            status: formData.status
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage("Feedback status updated successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the feedback list
        await fetchAllFeedback();
        
        // Reset form
        setIsEditing(false);
        setSelectedFeedbackId(null);
        setFormData({
          id: null,
          full_name: "",
          email: "",
          mobile_number: "",
          message: "",
          status: "pending",
          created_at: ""
        });
      } else {
        setMessage(result.message || "Failed to update status. Please try again.");
        setVariant("danger");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      setMessage("Network error. Please check your connection and try again.");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedFeedbackId(null);
    setFormData({
      id: null,
      full_name: "",
      email: "",
      mobile_number: "",
      message: "",
      status: "pending",
      created_at: ""
    });
    setShowAlert(false);
  };

  // Handle delete button click
  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!feedbackToDelete) return;

    try {
      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/feedback/",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: feedbackToDelete.id
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage("Feedback deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the feedback list
        await fetchAllFeedback();
        
        // If we were editing this feedback, clear the form
        if (selectedFeedbackId === feedbackToDelete.id) {
          cancelEditing();
        }
      } else {
        setMessage(result.message || "Failed to delete feedback. Please try again.");
        setVariant("danger");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      setMessage("Network error. Please check your connection and try again.");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setShowDeleteModal(false);
      setFeedbackToDelete(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return <Badge bg="secondary">Unknown</Badge>;
    
    return (
      <Badge bg={statusOption.variant}>
        {statusOption.icon} {statusOption.label}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Filter feedback based on status
  const filteredFeedback = statusFilter === "all" 
    ? feedbackList 
    : feedbackList.filter(fb => fb.status === statusFilter);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 50;
  const totalPages = Math.ceil(filteredFeedback.length / entriesPerPage);

  // Get current page data
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when filter changes or feedbackList changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, feedbackList]);

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
                <h1 className="page-title mb-1">Manage Feedback</h1>
                <p className="text-muted mb-0">View, update status, and manage user feedback</p>
              </div>
            </div>

            {/* Alert Messages */}
            {showAlert && (
              <Alert variant={variant} dismissible onClose={() => setShowAlert(false)}>
                {message}
              </Alert>
            )}

            {/* Edit Form */}
            {isEditing && (
              <Card className="shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Update Feedback Status</h5>
                    <Button variant="outline-secondary" size="sm" onClick={cancelEditing}>
                      <FaTimes className="me-1" /> Cancel
                    </Button>
                  </div>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <p><strong><FaUser className="me-2" />Name:</strong> {formData.full_name}</p>
                      <p><strong><FaEnvelope className="me-2" />Email:</strong> {formData.email}</p>
                      <p><strong><FaPhone className="me-2" />Phone:</strong> {formData.mobile_number}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong><FaComment className="me-2" />Message:</strong></p>
                      <p className="text-muted">{formData.message}</p>
                    </Col>
                  </Row>
                  
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Status <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleStatusChange}
                            disabled={isSubmitting}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Submit Button */}
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <Button
                        variant="secondary"
                        onClick={cancelEditing}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        <FaSave className="me-2" />
                        {isSubmitting ? "Updating..." : "Update Status"}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* Feedback List */}
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">All Feedback</h5>
                  
                  {/* Status Filter */}
                  <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '200px' }}
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading feedback...</p>
                  </div>
                ) : filteredFeedback.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {statusFilter === "all" 
                        ? "No feedback found." 
                        : `No ${statusFilter} feedback found.`}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Received At</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedFeedback.map((feedback, index) => (
                            <tr key={feedback.id} className={selectedFeedbackId === feedback.id ? "table-active" : ""}>
                              <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                              <td>{feedback.full_name}</td>
                              <td>{feedback.email}</td>
                              <td>{feedback.mobile_number}</td>
                              <td>
                                <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {feedback.message}
                                </div>
                              </td>
                              <td>{getStatusBadge(feedback.status)}</td>
                              <td>{formatDate(feedback.created_at)}</td>
                              <td className="text-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEditClick(feedback)}
                                  disabled={isEditing}
                                >
                                  <FaEdit className="me-1" />
                                  Update
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(feedback)}
                                >
                                  <FaTrash className="me-1" />
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center align-items-center mt-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="mx-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="ms-2"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this feedback?
          {feedbackToDelete && (
            <div className="mt-3">
              <p><strong>Name:</strong> {feedbackToDelete.full_name}</p>
              <p><strong>Email:</strong> {feedbackToDelete.email}</p>
              <p className="text-muted mb-0">{feedbackToDelete.message}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FaTrash className="me-2" />
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManageFeedback;

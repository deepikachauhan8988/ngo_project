import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";


const ReportProblemAdmin = () => {
  const {
    auth,
    logout,
    refreshAccessToken,
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for report problem data
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  
  // State for edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
    remark: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // State for delete functionality
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Fetch reports when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchReports();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle delete operations
  const showDeleteConfirmation = (report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setReportToDelete(null);
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);
    setError("");
    setShowAlert(false);

    try {
      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/report-problem/?id=${reportToDelete.id}`;
      console.log("DELETE URL:", url);
      
      // Create request body with the ID
      const payload = { id: reportToDelete.id };
      
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
          (errorData && errorData.message) || "Failed to delete report"
        );
      }

      const result = await response.json();
      console.log("DELETE Success response:", result);

      if (result.success) {
        // Remove the report from the list
        setReports(prevReports => 
          prevReports.filter(report => report.id !== reportToDelete.id)
        );
        
        // Show success message
        setError("Report deleted successfully!");
        setShowAlert(true);
      } else {
        throw new Error(
          result.message || "Failed to delete report"
        );
      }
    } catch (error) {
      console.error("Error deleting report:", error);

      if (
        error.message.includes("403") ||
        error.message.includes("permission")
      ) {
        setError(
          "Permission denied. You may not have the required role to delete this report.",
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("authenticated") ||
        error.message.includes("Session expired")
      ) {
        setError("Authentication error. Please login again.");
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else if (error.message.includes("404")) {
        setError("Report not found. Please refresh the page.");
      } else if (
        error.message.includes("500") ||
        error.message.includes("Server error")
      ) {
        setError(error.message);
      } else {
        setError(
          error.message || "An error occurred while deleting the report",
        );
      }

      setShowAlert(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setReportToDelete(null);
    }
  };

  // Handle edit operations
  const handleEditReport = (report) => {
    setEditingReport(report);
    setEditFormData({
      status: report.status || "",
      remark: report.remark || "",
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingReport(null);
    setEditFormData({ status: "", remark: "" });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateReport = async () => {
    if (!editingReport) return;

    setIsUpdating(true);
    setError("");
    setShowAlert(false);

    try {
      const response = await authFetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/report-problem/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingReport.id,
            ...editFormData,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update report. Status: ${response.status}`);
      }

      // Close the modal first
      handleCloseEditModal();
      
      // Fetch fresh data from the server to show updated information
      await fetchReports();
      
    } catch (error) {
      console.error("Error updating report:", error);

      if (
        error.message.includes("403") ||
        error.message.includes("permission")
      ) {
        setError(
          "Permission denied. You may not have the required role to update this report.",
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("authenticated") ||
        error.message.includes("Session expired")
      ) {
        setError("Authentication error. Please login again.");
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else if (error.message.includes("404")) {
        setError("Report not found. Please refresh the page.");
      } else if (
        error.message.includes("500") ||
        error.message.includes("Server error")
      ) {
        setError(error.message);
      } else {
        setError(
          error.message || "An error occurred while updating the report",
        );
      }

      setShowAlert(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch reports from API
  const fetchReports = async () => {
    setIsLoading(true);
    setError("");
    setShowAlert(false);

    try {
      // Debug: Log authentication state
      console.log("Auth state:", auth);
      console.log(
        "Auth object from localStorage:",
        localStorage.getItem("auth"),
      );
      console.log("Is authenticated:", isAuthenticated);

      // Fetch reports from API - the API will filter based on the authenticated user's permissions
      const response = await authFetch(
        `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/report-problem/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch reports. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Handle the response format
      let reportsData = [];

      if (result.success && Array.isArray(result.data)) {
        // Standard response format with success flag and data array
        reportsData = result.data;
      } else if (Array.isArray(result)) {
        // Direct array response
        reportsData = result;
      } else {
        console.warn("Unexpected response format:", result);
        reportsData = [];
      }

      setReports(reportsData);
      console.log(`Total reports fetched: ${reportsData.length}`);
      
    } catch (error) {
      console.error("Error fetching reports:", error);

      // Handle specific error cases (same as ManageCarousel.js)
      if (
        error.message.includes("403") ||
        error.message.includes("permission")
      ) {
        setError(
          "Permission denied. You may not have the required role to access this feature.",
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("authenticated") ||
        error.message.includes("Session expired")
      ) {
        setError("Authentication error. Please login again.");
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else if (error.message.includes("404")) {
        setError("API endpoint not found. Please contact the administrator.");
      } else if (
        error.message.includes("500") ||
        error.message.includes("Server error")
      ) {
        setError(error.message);
      } else {
        setError(
          error.message || "An error occurred while fetching report data",
        );
      }

      setShowAlert(true);
      setReports([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div
          className="main-content-dash d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
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
        <div
          className="main-content-dash d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
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

          <Container fluid className="dashboard-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">Reported Problems</h1>
              <Button
                variant="outline-primary"
                onClick={fetchReports}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>

            {/* Success message */}
            {showAlert && error.includes("successfully") && (
              <Alert
                variant="success"
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {error}
              </Alert>
            )}

            {/* Error message */}
            {showAlert && !error.includes("successfully") && (
              <Alert
                variant="danger"
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {error}
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading Reports...</p>
              </div>
            ) : (
              <>
                {reports.length === 0 ? (
                  <Alert variant="info">
                    No reported problems found for your district.
                  </Alert>
                ) : (
                  <Card>
                    <Card.Body className="p-0">
                      <Table striped bordered hover responsive>
                        <thead className="table-thead">
                          <tr>
                            <th>#</th>
                            <th>Full Name</th>
                            <th>Problem Nature</th>
                            <th>Department</th>
                            <th>Description</th>
                            <th>District</th>
                            <th>Status</th>
                            <th>Remark</th>
                            <th>Action Taken By</th>
                            <th>Created At</th>
                            <th>Solved At</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report, index) => (
                            <tr key={report.id || index}>
                              <td>{index + 1}</td>
                              <td>{report.full_name || "N/A"}</td>
                              <td>{report.problem_nature || "N/A"}</td>
                              <td>{report.department || "N/A"}</td>
                              <td>{report.description || "N/A"}</td>
                              <td>{report.district || "N/A"}</td>
                              <td>
                                <span className={`badge bg-${report.status === 'solved' ? 'success' : report.status === 'pending' ? 'warning' : report.status === 'in_progress' ? 'info' : 'secondary'}`}>
                                  {report.status || "N/A"}
                                </span>
                              </td>
                              <td>{report.remark || "N/A"}</td>
                              <td>{report.action_taken_by_name || "N/A"}</td>
                              <td>
                                {report.created_at
                                  ? new Date(report.created_at).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td>
                                {report.solved_at
                                  ? new Date(report.solved_at).toLocaleDateString()
                                  : "N/A"}
                              </td>
                               <td>
                                 <div className="d-flex gap-1">
                                   <Button
                                     variant={report.status === 'solved' ? "outline-secondary" : "outline-primary"}
                                     size="sm"
                                     onClick={() => handleEditReport(report)}
                                     disabled={report.status === 'solved'}
                                     title={report.status === 'solved' ? "Cannot edit solved reports" : "Edit this report"}
                                   >
                                     Edit
                                   </Button>
                                   <Button
                                     variant="outline-danger"
                                     size="sm"
                                     onClick={() => showDeleteConfirmation(report)}
                                     title="Delete this report"
                                   >
                                     Delete
                                   </Button>
                                 </div>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}

            {/* Edit Report Modal */}
            <Modal
              show={showEditModal}
              onHide={handleCloseEditModal}
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit Report Problem</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {editingReport && (
                  <Form>
                    {/* Read-only fields */}
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingReport.full_name || "N/A"}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Problem Nature</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingReport.problem_nature || "N/A"}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingReport.department || "N/A"}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editingReport.description || "N/A"}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>District</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingReport.district || "N/A"}
                        disabled
                      />
                    </Form.Group>

                    {/* Editable fields */}
                    <Form.Group className="mb-3">
                      <Form.Label>Status *</Form.Label>
                      <Form.Select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditFormChange}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="solved">Solved</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Remark</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="remark"
                        value={editFormData.remark}
                        onChange={handleEditFormChange}
                        placeholder="Enter remark..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Action Taken By</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingReport.action_taken_by_name || "N/A"}
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Created At</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          editingReport.created_at
                            ? new Date(editingReport.created_at).toLocaleDateString()
                            : "N/A"
                        }
                        disabled
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Solved At</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          editingReport.solved_at
                            ? new Date(editingReport.solved_at).toLocaleDateString()
                            : "N/A"
                        }
                        disabled
                      />
                    </Form.Group>
                  </Form>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseEditModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateReport}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Delete Report Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete the report from {reportToDelete?.full_name}? This action cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseDeleteModal}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDeleteReport}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </div>
      </div>
    </>
  );
};

export default ReportProblemAdmin;
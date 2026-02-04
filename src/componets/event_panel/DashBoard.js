import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Spinner, Alert, Form, Dropdown } from "react-bootstrap";
import "../../assets/css/dashboard.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import "../../assets/css/dashboardcards.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthFetch } from "../context/AuthFetch";

const DashBoard = () => {
  const navigate = useNavigate();
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [members, setMembers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTable, setActiveTable] = useState("members"); // To track which table to show

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

  // Fetch data from APIs when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchMembers();
      fetchDonations();
    }
  }, [authLoading, isAuthenticated]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch member data");
      }

      const result = await response.json();
      setMembers(result.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch member data. Please try again later.");
      console.error("Error fetching member data:", err);
      
      // Handle authentication errors
      if (err.message.includes('authenticated') || err.message.includes('Session expired')) {
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await authFetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/donate-society/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donation data");
      }

      const result = await response.json();
      setDonations(result.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch donation data. Please try again later.");
      console.error("Error fetching donation data:", err);
      
      // Handle authentication errors
      if (err.message.includes('authenticated') || err.message.includes('Session expired')) {
        setTimeout(() => {
          navigate('/Login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate member counts
  const totalMembersCount = members.length;
  const pendingMembersCount = members.filter((member) => member.status === "pending").length;
  const acceptedMembersCount = members.filter((member) => member.status === "accepted").length;
  const rejectedMembersCount = members.filter((member) => member.status === "rejected").length;

  // Calculate donation counts
  const totalDonationsCount = donations.length;
  const pendingDonationsCount = donations.filter((donation) => donation.status === "PENDING").length;
  const successfulDonationsCount = donations.filter((donation) => donation.status === "SUCCESS").length;
  const failedDonationsCount = donations.filter((donation) => donation.status === "FAILED").length;

  // Handle card click
  const handleCardClick = (tableType) => {
    setActiveTable(tableType);
    setShowTable(true);
    setActiveFilter("all"); // Reset filter when switching tables
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Filter members based on active filter
  const filteredMembers = activeFilter === "all" 
    ? members 
    : members.filter((member) => member.status === activeFilter);

  // Filter donations based on active filter
  const filteredDonations = activeFilter === "all" 
    ? donations 
    : donations.filter((donation) => donation.status === activeFilter.toUpperCase());

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Function to get badge color based on status
  const getStatusBadgeClass = (status) => {
    const lowerStatus = status.toLowerCase();
    switch(lowerStatus) {
      case "accepted":
      case "success":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "rejected":
      case "failed":
        return "bg-danger";
      default:
        return "bg-secondary";
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
            <h1 className="page-title">Dashboard</h1>
            
            {loading ? (
              <div className="loading-spinner text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : error ? (
              <Alert variant="danger" className="dashboard-alert">{error}</Alert>
            ) : (
              <>
                {/* Show both member and donation cards */}
                <Row className="dashboard-cards mb-4">
                  <Col md={3} className="mb-3">
                    <Card 
                      className="dashboard-card card-all text-center h-100 cursor-pointer"
                      onClick={() => handleCardClick("members")}
                      style={{ cursor: "pointer" }}
                    >
                      <Card.Body>
                        <Card.Title>All Members</Card.Title>
                        <h2>{totalMembersCount}</h2>
                        <div className="card-icon">
                          <i className="fas fa-users"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Card 
                      className="dashboard-card card-all text-center h-100 cursor-pointer"
                      onClick={() => handleCardClick("donations")}
                      style={{ cursor: "pointer" }}
                    >
                      <Card.Body>
                        <Card.Title>All Donations</Card.Title>
                        <h2>{totalDonationsCount}</h2>
                        <div className="card-icon">
                          <i className="fas fa-donate"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Show table with filter when card is clicked */}
                {showTable && (
                  <div className="btn-heading-title">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2>
                        {activeTable === "members" ? (
                          activeFilter === "all" 
                            ? "All Members" 
                            : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Members`
                        ) : (
                          activeFilter === "all" 
                            ? "All Donations" 
                            : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Donations`
                        )}
                        ({activeTable === "members" ? filteredMembers.length : filteredDonations.length})
                      </h2>
                      <div>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" id="filter-dropdown">
                            Filter: {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item 
                              onClick={() => handleFilterChange("all")}
                              active={activeFilter === "all"}
                            >
                              All
                            </Dropdown.Item>
                            {activeTable === "members" ? (
                              <>
                                <Dropdown.Item 
                                  onClick={() => handleFilterChange("pending")}
                                  active={activeFilter === "pending"}
                                >
                                  Pending ({pendingMembersCount})
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleFilterChange("accepted")}
                                  active={activeFilter === "accepted"}
                                >
                                  Accepted ({acceptedMembersCount})
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleFilterChange("rejected")}
                                  active={activeFilter === "rejected"}
                                >
                                  Rejected ({rejectedMembersCount})
                                </Dropdown.Item>
                              </>
                            ) : (
                              <>
                                <Dropdown.Item 
                                  onClick={() => handleFilterChange("pending")}
                                  active={activeFilter === "pending"}
                                >
                                  Pending ({pendingDonationsCount})
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleFilterChange("success")}
                                  active={activeFilter === "success"}
                                >
                                  Successful ({successfulDonationsCount})
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleFilterChange("failed")}
                                  active={activeFilter === "failed"}
                                >
                                  Failed ({failedDonationsCount})
                                </Dropdown.Item>
                              </>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                    <div className="dashboard-table">
                      <Table striped bordered hover responsive>
                        <thead>
                          {activeTable === "members" ? (
                            <tr>
                              <th>ID</th>
                              <th>Member ID</th>
                              <th>Full Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Occupation</th>
                              <th>Education</th>
                              <th>Status</th>
                              <th>Registration Date</th>
                            </tr>
                          ) : (
                            <tr>
                              <th>ID</th>
                              <th>Donation ID</th>
                              <th>Purpose</th>
                              <th>Full Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Created At</th>
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {activeTable === "members" ? (
                            filteredMembers.map((member) => (
                              <tr key={member.id}>
                                <td>{member.id}</td>
                                <td>{member.member_id}</td>
                                <td>{member.full_name}</td>
                                <td>{member.email}</td>
                                <td>{member.phone}</td>
                                <td>{member.occupation || "N/A"}</td>
                                <td>{member.education_level || "N/A"}</td>
                                <td>
                                  <span className={`badge status-badge ${getStatusBadgeClass(member.status)}`}>
                                    {member.status || "N/A"}
                                  </span>
                                </td>
                                <td>{formatDate(member.created_at)}</td>
                              </tr>
                            ))
                          ) : (
                            filteredDonations.map((donation) => (
                              <tr key={donation.id}>
                                <td>{donation.id}</td>
                                <td>{donation.donation_id}</td>
                                <td>{donation.purpose}</td>
                                <td>{donation.full_name}</td>
                                <td>{donation.email}</td>
                                <td>{donation.phone}</td>
                                <td>₹{donation.amount}</td>
                                <td>
                                  <span className={`badge status-badge ${getStatusBadgeClass(donation.status)}`}>
                                    {donation.status || "N/A"}
                                  </span>
                                </td>
                                <td>{formatDate(donation.created_at)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
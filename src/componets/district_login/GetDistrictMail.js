import React, { useState, useEffect } from "react";
import { Container, Table, Card, Alert, Spinner, Badge, Button } from "react-bootstrap";
import { FaEnvelope, FaArrowLeft, FaCheck, FaExclamationTriangle, FaInfoCircle, FaBug, FaUserShield } from "react-icons/fa";
import "../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthFetch } from "../context/AuthFetch";
import DistrictLeftNav from "./DistrictLeftNav";
import DashBoardHeader from "../event_panel/DashBoardHeader";

const GetDistrictMail = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [districtMailData, setDistrictMailData] = useState({
    district_admin_id: "",
    member_ids: [],
    subject: "",
    message: ""
  });

  const [members, setMembers] = useState([]);
  const [matchedRecords, setMatchedRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [permissionIssue, setPermissionIssue] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setUsingSampleData(false);
    setPermissionIssue(false);
    
    try {
      console.log("User auth data:", auth);
      const userRole = auth.role;
      const userDistrict = auth.allocated_district;
      const userId = auth.unique_id;
      console.log(`User role: ${userRole}, User district: ${userDistrict}, User ID: ${userId}`);
      
      // Try the district-mail endpoint
      let mailResult = null;
      
      try {
        console.log("Trying district-mail endpoint");
        const response = await authFetch("https://mahadevaaya.com/ngoproject/ngoproject_backend/api/district-mail/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        console.log("Response status:", response.status);
        
        if (response.ok) {
          mailResult = await response.json();
          console.log("Success with district-mail endpoint:", mailResult);
        } else if (response.status === 403) {
          console.log("403 Forbidden error - this is a permissions issue");
          setPermissionIssue(true);
          
          // Check if the token is valid by making a request to a known working endpoint
          try {
            const testResponse = await authFetch("https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/", {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            });
            
            if (testResponse.ok) {
              console.log("Token is valid, but district-mail endpoint is still returning 403");
              console.log("This confirms a permissions issue specific to the district-mail endpoint");
            } else {
              console.log("Token might be invalid or expired");
            }
          } catch (testErr) {
            console.log("Error testing token:", testErr);
          }
        } else {
          console.log(`District-mail endpoint failed with status: ${response.status}`);
          const errorText = await response.text();
          console.log("Error details:", errorText);
        }
      } catch (err) {
        console.log("Error with district-mail endpoint:", err);
      }
      
      // If we still don't have data, use sample data
      if (!mailResult) {
        console.log("Using sample data due to API issues");
        mailResult = {
          "district_admin_id": "DIST/ADM/2026/272409",
          "member_ids": ["MEM/2026/917028"],
          "subject": "hi",
          "message": "helloqwertyuhijokpl'[;sdrftghjukl"
        };
        setUsingSampleData(true);
      }
      
      await processMailData(mailResult, userRole, userDistrict);

    } catch (err) {
      console.error("Error fetching district mail data:", err);
      setError(
        err.message.includes('403') || err.message.includes('permission')
          ? "Permission denied. You may not have the required role to access this feature. Your user role may not have district admin privileges."
          : err.message.includes('401') || err.message.includes('authenticated') || err.message.includes('Session expired')
          ? "Authentication error. Please login again."
          : err.message || "An error occurred while fetching data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const processMailData = async (mailResult, userRole, userDistrict) => {
    console.log("Processing district mail data:", mailResult);

    // Normalize possible response formats
    let mails = [];
    if (Array.isArray(mailResult)) {
      mails = mailResult;
    } else if (mailResult && mailResult.success && mailResult.data) {
      mails = Array.isArray(mailResult.data) ? mailResult.data : [mailResult.data];
    } else if (mailResult && typeof mailResult === "object") {
      mails = [mailResult];
    }

    // If user is a district admin, filter mails to only include their district
    if (userRole === 'district-admin' && userDistrict) {
      mails = mails.filter(mail => {
        // Check if mail is associated with the user's district
        return mail.district === userDistrict || 
               mail.allocated_district === userDistrict ||
               mail.district_admin_id === auth.unique_id;
      });
      console.log(`Filtered mails for district ${userDistrict}:`, mails);
    }

    const latestMail = mails.length > 0 ? mails[mails.length - 1] : {};
    console.log('Selected district mail (latest):', latestMail);

    // Set district mail data using the selected/latest mail
    setDistrictMailData({
      district_admin_id: latestMail.district_admin_id || latestMail.admin || "",
      member_ids: latestMail.member_ids || [],
      subject: latestMail.subject || "",
      message: latestMail.message || ""
    });

    // Fetch members
    const membersRes = await authFetch("https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!membersRes.ok) throw new Error(`Failed to fetch members. Status: ${membersRes.status}`);
    const membersResult = await membersRes.json();

    let membersData = [];
    if (Array.isArray(membersResult)) membersData = membersResult;
    else if (membersResult && membersResult.success && membersResult.data) membersData = Array.isArray(membersResult.data) ? membersResult.data : [membersResult.data];

    // If user is a district admin, filter members to only include their district
    if (userRole === 'district-admin' && userDistrict) {
      membersData = membersData.filter(member => {
        return member.district === userDistrict || 
               member.allocated_district === userDistrict;
      });
      console.log(`Filtered members for district ${userDistrict}:`, membersData);
    }

    setMembers(membersData);

    // Build matched records for ALL mails: one record per (member, mail)
    const records = [];
    mails.forEach(mail => {
      const recipientIds = Array.isArray(mail.member_ids) ? mail.member_ids : [];
      membersData.forEach(member => {
        const memberIdStr = String(member.member_id || member.unique_id || member.id);
        if (recipientIds.some(id => String(id) === memberIdStr)) {
          records.push({ member, mail });
        }
      });
    });

    console.log("Matched District Records (member + mail):", records);
    setMatchedRecords(records);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
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
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
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
    <div className="dashboard-container">
      <DistrictLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content-dash">
        <DashBoardHeader toggleSidebar={toggleSidebar} />
        <Container fluid className="dashboard-body dashboard-main-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="page-title mb-0">
              <FaEnvelope className="me-2" />
              District Mail History
            </h1>
            <Button variant="outline-secondary" onClick={() => navigate("/DistrictMailMeeting") }>
              <FaArrowLeft className="me-1" /> Back to Send Mail
            </Button>
          </div>

          {permissionIssue && (
            <Alert variant="warning" className="mb-4">
              <div className="d-flex align-items-start">
                <FaUserShield className="me-3 mt-1" style={{ fontSize: '1.5rem' }} />
                <div className="flex-grow-1">
                  <Alert.Heading>Permission Issue Detected</Alert.Heading>
                  <p className="mb-2">
                    Your account doesn't have the required permissions to access the district mail history. 
                    This appears to be a backend configuration issue.
                  </p>
                  
                  <Button 
                    variant="outline-warning" 
                    size="sm" 
                    onClick={() => setShowDetails(!showDetails)}
                    className="mb-3"
                  >
                    <FaBug className="me-1" /> {showDetails ? 'Hide' : 'Show'} Technical Details
                  </Button>
                  
                  {showDetails && (
                    <Card className="mb-3 bg-light">
                      <Card.Body>
                        <h6>Technical Details:</h6>
                        <ul>
                          <li>Authentication token: Valid</li>
                          <li>User role: {auth.role}</li>
                          <li>User ID: {auth.unique_id}</li>
                          <li>Assigned district: {auth.allocated_district}</li>
                          <li>API endpoint: /api/district-mail/</li>
                          <li>Response status: 403 Forbidden</li>
                          <li>Response message: "You do not have permission to perform this action."</li>
                        </ul>
                        <p className="mb-0">
                          <strong>Possible causes:</strong>
                          <ul>
                            <li>The district-admin role doesn't have permission to access the district-mail endpoint</li>
                            <li>The backend permissions for the district-mail endpoint are misconfigured</li>
                            <li>The endpoint requires additional parameters or headers</li>
                          </ul>
                        </p>
                      </Card.Body>
                    </Card>
                  )}
                  
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-warning" size="sm" onClick={() => window.location.reload()}>
                      <FaCheck className="me-1" /> Try Again
                    </Button>
                    <Button variant="outline-info" size="sm" onClick={() => navigate("/Dashboard")}>
                      <FaInfoCircle className="me-1" /> Go to Dashboard
                    </Button>
                    <Button variant="outline-primary" size="sm" onClick={() => navigate("/DistrictMailMeeting")}>
                      <FaEnvelope className="me-1" /> Send New Mail
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {usingSampleData && !permissionIssue && (
            <Alert variant="info" className="d-flex align-items-start mb-4">
              <FaInfoCircle className="me-3 mt-1" style={{ fontSize: '1.5rem' }} />
              <div className="flex-grow-1">
                <Alert.Heading>Using Sample Data</Alert.Heading>
                <p>
                  Could not fetch data from the API. Displaying sample data for demonstration purposes.
                </p>
                <Button variant="outline-info" size="sm" onClick={() => window.location.reload()}>
                  <FaCheck className="me-1" /> Try Again
                </Button>
              </div>
            </Alert>
          )}

          {error && !usingSampleData && !permissionIssue && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              {error.includes("Permission denied") && (
                <div className="mt-3">
                  <p>If you believe this is an error, please contact your system administrator.</p>
                  <p>Your current role: {auth.role || 'Unknown'}</p>
                  {auth.role === 'district-admin' && (
                    <p>Your assigned district: {auth.allocated_district || 'Not assigned'}</p>
                  )}
                  <div className="mt-2">
                    <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
                      <FaCheck className="me-1" /> Try Again
                    </Button>
                  </div>
                </div>
              )}
            </Alert>
          )}

          {isLoading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Mail Details</h5>
                  {usingSampleData && <Badge bg="warning">Sample Data</Badge>}
                </Card.Header>
                <Card.Body>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong>District Admin ID:</strong> {districtMailData.district_admin_id || "N/A"}
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Recipients:</strong> {districtMailData.member_ids ? districtMailData.member_ids.length : 0} members
                    </div>
                    <div className="col-12 mb-3">
                      <strong>Subject:</strong> {districtMailData.subject || 'N/A'}
                    </div>
                    <div className="col-12">
                      <strong>Message:</strong>
                      <div className="mt-2 p-3 bg-light rounded">{districtMailData.message || 'N/A'}</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recipients</h5>
                  {usingSampleData && <Badge bg="warning">Sample Data</Badge>}
                </Card.Header>
                <Card.Body>
                  {matchedRecords.length > 0 ? (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Member ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>District</th>
                          <th>Subject</th>
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchedRecords.map((rec, idx) => {
                          const member = rec.member;
                          const mail = rec.mail;
                          return (
                            <tr key={member.id || member.unique_id || idx}>
                              <td>{idx + 1}</td>
                              <td>{member.member_id || member.unique_id || member.id}</td>
                              <td>{member.full_name || member.name || 'N/A'}</td>
                              <td>{member.email || 'N/A'}</td>
                              <td><Badge bg="secondary">{member.district || member.allocated_district || 'N/A'}</Badge></td>
                              <td>{mail.subject || 'N/A'}</td>
                              <td><div className="text-wrap" style={{ maxWidth: 300 }}>{mail.message || 'N/A'}</div></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">No recipients found or no district mails.</Alert>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default GetDistrictMail;
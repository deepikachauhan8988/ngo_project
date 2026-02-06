import React, { useState, useEffect } from "react";
import { Container, Table, Card, Alert, Spinner, Badge, Button } from "react-bootstrap";
import { FaEnvelope, FaArrowLeft, FaCheck } from "react-icons/fa";
import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import RegionregLeftNav from "../RegionregLeftNav";
import RegionregHeader from "../RegionregHeader";

const GetRegionMail = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for region mail data
  const [regionMailData, setRegionMailData] = useState({
    region_admin_id: "",
    member_ids: [],
    subject: "",
    message: ""
  });
  
  // State for all members
  const [members, setMembers] = useState([]);
  
  // State for matched members
  const [matchedMembers, setMatchedMembers] = useState([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch data on component mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch region mail data
      const regionMailResponse = await authFetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/region-mail/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!regionMailResponse.ok) {
        if (regionMailResponse.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        if (regionMailResponse.status === 403) {
          throw new Error('Permission denied. You may not have the required role to access this feature.');
        }
        throw new Error(`Failed to fetch region mail data. Status: ${regionMailResponse.status}`);
      }
      
      const regionMailResult = await regionMailResponse.json();
      console.log("Region Mail API Response:", regionMailResult);

      // Normalize possible response formats and pick the most recent mail
      // API may return: single object, an array of mails, or { success: true, data: [...] }
      let mails = [];
      if (Array.isArray(regionMailResult)) {
        mails = regionMailResult;
      } else if (regionMailResult && regionMailResult.success && regionMailResult.data) {
        mails = Array.isArray(regionMailResult.data) ? regionMailResult.data : [regionMailResult.data];
      } else if (regionMailResult && typeof regionMailResult === 'object') {
        mails = [regionMailResult];
      }

      const latestMail = mails.length > 0 ? mails[mails.length - 1] : {};
      console.log('Selected region mail (latest):', latestMail);

      // Keep latest mail for the details card, but keep full mails array for history
      setRegionMailData({
        region_admin_id: latestMail.region_admin_id || latestMail.region_admin || "",
        member_ids: latestMail.member_ids || [],
        subject: latestMail.subject || "",
        message: latestMail.message || ""
      });
      
      // Fetch all members
      const membersResponse = await authFetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!membersResponse.ok) {
        throw new Error(`Failed to fetch members. Status: ${membersResponse.status}`);
      }
      
      let membersData = [];
      const membersResult = await membersResponse.json();
      
      // Handle different response formats
      if (Array.isArray(membersResult)) {
        membersData = membersResult;
      } else if (membersResult.success && membersResult.data) {
        if (Array.isArray(membersResult.data)) {
          membersData = membersResult.data;
        } else {
          membersData = [membersResult.data];
        }
      }
      
      console.log("Members API Response:", membersData);
      setMembers(membersData);
      
      // Build matched records for ALL mails: one record per (member, mail)
      const matchedRecords = [];
      mails.forEach(mail => {
        const recipientIds = Array.isArray(mail.member_ids) ? mail.member_ids : [];
        membersData.forEach(member => {
          const memberIdStr = String(member.member_id || member.unique_id || member.id);
          if (recipientIds.some(id => String(id) === memberIdStr)) {
            matchedRecords.push({ member, mail });
          }
        });
      });

      console.log("Matched Records (member + mail):", matchedRecords);
      setMatchedMembers(matchedRecords);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.message.includes('403') || err.message.includes('permission')
          ? "Permission denied. You may not have the required role to access this feature."
          : err.message.includes('401') || err.message.includes('authenticated') || err.message.includes('Session expired')
          ? "Authentication error. Please login again."
          : err.message || "An error occurred while fetching data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
        <RegionregLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <RegionregHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">
                <FaEnvelope className="me-2" />
                Region Mail History
              </h1>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/RegionMail')}
              >
                <FaArrowLeft className="me-1" /> Back to Send Mail
              </Button>
            </div>
            
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
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
              
                
                {/* Matched Members Table */}
                <Card>
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">Recipients</h5>
                  </Card.Header>
                  <Card.Body>
                    {matchedMembers.length > 0 ? (
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
                          {matchedMembers.map((record, index) => {
                            // record may be { member, mail } or a raw member object for backward compatibility
                            const member = record && record.member ? record.member : record;
                            const mail = record && record.mail ? record.mail : regionMailData;
                            return (
                              <tr key={member.id || member.unique_id || index}>
                                <td>{index + 1}</td>
                                <td>{member.member_id || member.unique_id || member.id}</td>
                                <td>{member.full_name || member.name || 'N/A'}</td>
                                <td>{member.email || 'N/A'}</td>
                                <td>
                                  <Badge bg="secondary">
                                    {member.district || member.allocated_district || 'N/A'}
                                  </Badge>
                                </td>
                                <td>{mail.subject || 'N/A'}</td>
                                <td>
                                  <div className="text-wrap" style={{ maxWidth: 300 }}>
                                    {mail.message || 'N/A'}
                                  </div>
                                </td>
                              
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="info">
                        No recipients found or no members match the selected member IDs.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default GetRegionMail;
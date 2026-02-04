import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Dropdown,
  Image,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserHeader({ toggleSidebar, searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New employee joined - Rahul Sharma",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      text: "HR meeting scheduled at 4 PM",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      text: "Payroll processed successfully",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const [unreadCount, setUnreadCount] = useState(2);
  
  // State for user details
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_photo: null,
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile data on component mount
  useEffect(() => {
    if (auth && auth.unique_id) {
      fetchUserProfile();
    }
  }, [auth]);

  // Fetch user profile from API using member_id
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      if (!auth || !auth.unique_id) {
        throw new Error("User not authenticated. Member ID not available.");
      }

      const url = `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/?member_id=${auth.unique_id}`;
      console.log("Fetching user profile from:", url);

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET User Profile API Response:", result);

      let profileData;
      
      // Handle different response formats
      if (Array.isArray(result)) {
        profileData = result[0] || {};
      } else if (result.data) {
        if (Array.isArray(result.data)) {
          profileData = result.data[0] || {};
        } else {
          profileData = result.data;
        }
      } else if (result.success && result.results && Array.isArray(result.results)) {
        profileData = result.results[0] || {};
      } else {
        profileData = result;
      }

      // Update user details state
      setUserDetails({
        full_name: profileData.full_name || "",
        profile_photo: profileData.image || null,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => prev - 1);
  };

  const handleLogout = () => {
    logout();
    navigate("/Login", { replace: true });
  };

  // Get display name for fallback avatar
  const getDisplayName = () => {
    if (userDetails.full_name) {
      return userDetails.full_name;
    }
    return "User";
  };

  // Get user photo URL
  const getUserPhotoUrl = () => {
    if (userDetails.profile_photo) {
      return `https://mahadevaaya.com/ngoproject/ngoproject_backend${userDetails.profile_photo}`;
    }
    return null;
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

          <Col>
            {/* Search bar if needed */}
            {/* <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div> */}
          </Col>
          <Col xs="auto">
            <div className="header-actions">
              <Dropdown align="end">
                {/* <Dropdown.Toggle variant="light" className="notification-btn">
                  <FaBell />
                  {unreadCount > 0 && (
                    <Badge pill bg="danger" className="notification-badge">
                      {unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle> */}

                {/* <Dropdown.Menu className="notification-dropdown">
                  <div className="notification-header">
                    <h6>Notifications</h6>
                  </div>

                  {notifications.map((notif) => (
                    <Dropdown.Item
                      key={notif.id}
                      className={`notification-item ${
                        !notif.read ? "unread" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <p>{notif.text}</p>
                      <small>{notif.time}</small>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu> */}
              </Dropdown>

              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="user-profile-btn">
                  {isLoading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      {getUserPhotoUrl() ? (
                        <Image
                          src={getUserPhotoUrl()}
                          roundedCircle
                          className="user-avatar"
                          onError={(e) => {
                            // Fallback to UI Avatars if image fails to load
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=0d6efd&color=fff&size=40`;
                          }}
                        />
                      ) : (
                        <FaUserCircle className="user-avatar" />
                      )}
                      <span className="user-name d-none d-md-inline">
                        {getDisplayName()}
                      </span>
                    </>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default UserHeader;
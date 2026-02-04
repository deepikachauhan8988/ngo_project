import React, { useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaImages,
  FaUsers,
  FaBook,
  FaBuilding,
  FaImage,
  FaTools,
  FaComments,
  FaCube,
  FaProjectDiagram,
  FaServer,
  FaUserCircle,
  FaEnvelope, // Added this import
} from "react-icons/fa";
import axios from "axios";
import "../../assets/css/dashboard.css";
import { Link } from "react-router-dom";
import {
  FaInfoCircle,
  FaEdit,
  FaListUl,
  FaBullseye,
  FaPlusSquare,
  FaTasks,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DistrictLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Add logout handler function
  const handleLogout = () => {
    logout();
    navigate("/Login", { replace: true });
  };

  const [userRole, setUserRole] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      path: "/DistrictDashboard",
      active: true,
    },
    {
      icon: <FaUsers />, // Changed to a more relevant icon
      label: "Members List",
      submenu: [
        {
          label: "District Member List",
          path: "/DistrictRegistration",
          icon: <FaListUl />, // Changed
        },
        {
          label: "Mail Meeting List",
          path: "/DistrictMailMeeting",
          icon: <FaEnvelope />, // Changed
        },
      ],
    },
    {
      icon: <FaBullseye />, // Changed to a more relevant icon
      label: "District Activities",
      submenu: [
        {
          label: "District Add Activity",
          path: "/AddDistrictActivity",
          icon: <FaPlusSquare />, // Changed
        },
        {
          label: "District Manage Activity",
          path: "/ManageDistrictActivity",
          icon: <FaTasks />, // Changed
        },
      ],
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
              <div className="sidebar-heading">
                <h5 className="dashboard-title">District Admin</h5>
              </div>
            </div>
          </div>
        </div>

        <Nav className="sidebar-nav flex-column">
          {menuItems
            .filter((item) =>
              item.allowedRoles ? item.allowedRoles.includes(userRole) : true
            )
            .map((item, index) => (
              <div key={index}>
                {/* If submenu exists */}
                {item.submenu ? (
                  <Nav.Link
                    className={`nav-item ${item.active ? "active" : ""}`}
                    onClick={() => toggleSubmenu(index)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                    <span className="submenu-arrow">
                      {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  </Nav.Link>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-item nav-link ${item.active ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                  </Link>
                )}

                {/* Submenu */}
                {item.submenu && (
                  <Collapse in={openSubmenu === index}>
                    <div className="submenu-container">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="submenu-item nav-link"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="submenu-icon">{subItem.icon}</span>
                          <span className="nav-text br-text-sub">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </Collapse>
                )}
              </div>
            ))}
        </Nav>

        <div className="sidebar-footer">
          <Nav.Link className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">Logout</span>
          </Nav.Link>
        </div>
      </div>

      {/* Mobile / Tablet Sidebar (Offcanvas) */}
      <Offcanvas
        show={(isMobile || isTablet) && sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        className="mobile-sidebar"
        placement="start"
        backdrop={true}
        scroll={false}
        enforceFocus={false}
      >
        <Offcanvas.Header closeButton className="br-offcanvas-header">
          <Offcanvas.Title className="br-off-title">Menu</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="br-offcanvas">
          {/* Added Admin Dashboard heading for mobile/tablet */}
          <div className="sidebar-heading">
            <h5 className="dashboard-title">District Admin Dashboard</h5>
          </div>
          <Nav className="flex-column">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <Nav.Link
                    className={`nav-item ${item.active ? "active" : ""}`}
                    onClick={() => toggleSubmenu(index)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text br-nav-text-mob">{item.label}</span>
                    <span className="submenu-arrow">
                      {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  </Nav.Link>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-item nav-link ${item.active ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text br-nav-text-mob">{item.label}</span>
                  </Link>
                )}

                {item.submenu && (
                  <Collapse in={openSubmenu === index}>
                    <div className="submenu-container">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="submenu-item nav-link"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="submenu-icon">{subItem.icon}</span>
                          <span className="nav-text">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </Collapse>
                )}
              </div>
            ))}

            {/* Add logout button to mobile menu as well */}
            <Nav.Link className="nav-item logout-btn" onClick={handleLogout}>
              <span className="nav-icon">
                <FaSignOutAlt />
              </span>
              <span className="nav-text">Logout</span>
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default DistrictLeftNav;
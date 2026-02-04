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
  FaClipboardList, // New
  FaTasks,         // New
  FaUsersCog,      // New
  FaEdit,          // Already imported, but will be used more
  FaBullseye,      // Already imported
  FaPlusSquare,    // Already imported
  FaListUl,        // Already imported
  FaWindowMaximize // New
} from "react-icons/fa";
import axios from "axios";
import "../../assets/css/dashboard.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
      path: "/DashBoard",
      active: true,
    },
    {
      icon: <FaClipboardList />, // Changed
      label: "District Registrations",
      path: "/DistrictRegistrations",
      active: true,
    },
    {
      icon: <FaTasks />, // Changed
      label: "District Manage Registrations",
      path: "/DistrictManageRegistration",
      active: true,
    },
    {
      icon: <FaUsersCog />, // Changed
      label: "Manage Registration",
      path: "/ManageRegistration",
      active: true,
    },
    {
      icon: <FaEdit />, // Changed
      label: "Manage About Us ",
      path: "/ManageAboutUs",
      active: true,
    },
    {
      icon: <FaImages />, // Changed
      label: "Manage Carousel ",
      path: "/ManageCarousel",
      active: true,
    },
    {
      icon: <FaBullseye />, // Changed
      label: "Activity",
      submenu: [
        {
          label: "Add Activity",
          path: "/AddActivity",
          icon: <FaPlusSquare />, // Changed
        },
        {
          label: "Manage Activity",
          path: "/ManageActivity",
          icon: <FaListUl />, // Changed
        },
      ],
    },
    // {
    //   icon: <FaWindowMaximize />, // Changed
    //   label: "Header",
    //   submenu: [
    //     {
    //       label: "Add Header",
    //       path: "/AddHeader",
    //       icon: <FaPlusSquare />, // Changed
    //     },
    //     {
    //       label: "Manage header",
    //       path: "/ManageHeader",
    //       icon: <FaEdit />, // Changed
    //     },
    //   ],
    // },
    {
      icon: <FaProjectDiagram />, // Changed
      label: "Associative Wings",
      submenu: [
        {
          label: "Add Wings",
          path: "/AddWings",
          icon: <FaPlusSquare />, // Changed
        },
        {
          label: "Manage Wings",
          path: "/ManageWings",
          icon: <FaListUl />, // Changed
        },
      ],
    },
    {
      icon: <FaEdit />, // Changed
      label: "Latest Updates",
      submenu: [
        {
          label: "Add Updates",
          path: "/AddUpdates",
          icon: <FaPlusSquare />, // Changed
        },
        {
          label: "Manage Updates",
          path: "/ManageUpdates",
          icon: <FaListUl />, // Changed
        },
      ],
    },
    {
      icon: <FaComments />, // Changed
      label: "Manage Feedback",
      path: "/ManageFeedback",
      active: true,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo"></div>
          </div>
        </div>

        <div className="sidebar-heading">
          <h5 className="dashboard-title">Admin Dashboard</h5>
        </div>

        <Nav className="sidebar-nav flex-column">
          {menuItems
            .filter((item) => (item.allowedRoles ? item.allowedRoles.includes(userRole) : true))
            .map((item, index) => (
              <div key={index}>
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
          <div className="sidebar-heading">
            <h5 className="dashboard-title">Admin Dashboard</h5>
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
                          <span className="nav-text">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </Collapse>
                )}
              </div>
            ))}

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

export default LeftNav;
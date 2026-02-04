import React, { useState } from 'react';
import "../../assets/css/mainstyle.css"
import { Link } from 'react-router-dom';
import EventLogo from '../../assets/images/br-event-logo.png'
import { Container } from 'react-bootstrap';

function Footer() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (key) => {
    setOpenDropdowns(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  return (
    <footer id="footer" className="footer position-relative" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <Link to="/" className="logo d-flex align-items-center">
              {/* <img src={EventLogo} alt="logo" className="logo-wecd" /> */}
              <span className="sitename" style={{ color: '#ffffff' }}>NGO</span>
            </Link>
            <div className="footer-contact pt-3">
              <p style={{ color: '#ffffff' }}>A108 Adam Street</p>
              <p style={{ color: '#ffffff' }}>New York, NY 535022</p>
             
              <p style={{ color: '#ffffff' }}><strong>Email:</strong> <span>admin@ngo.in</span></p>
            </div>
            <div className="social-links d-flex mt-4">
              <a href="#" style={{ color: '#ffffff' }}><i className="bi bi-twitter-x"></i></a>
              <a href="#" style={{ color: '#ffffff' }}><i className="bi bi-facebook"></i></a>
              <a href="#" style={{ color: '#ffffff' }}><i className="bi bi-instagram"></i></a>
              <a href="#" style={{ color: '#ffffff' }}><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4 style={{ color: '#ffffff' }}>Useful Links</h4>
            <ul>
              <li><Link to="/" style={{ color: '#ffffff' }}>Home</Link></li>
              <li><Link to="/AboutUs" style={{ color: '#ffffff' }}>About Us</Link></li>
              <li><Link to="/DonationSociety" style={{ color: '#ffffff' }}>Donations</Link></li>
              <li><Link to="/Activity" style={{ color: '#ffffff' }}>Activity</Link></li>
              <li><Link to="/AssociatedWings" style={{ color: '#ffffff' }}>Associated Wings</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4 style={{ color: '#ffffff' }}>Registration</h4>
            <ul>
              <li><Link to="/Registration" style={{ color: '#ffffff' }}>Member Registration</Link></li>
              <li><Link to="/MembersList" style={{ color: '#ffffff' }}>Members List</Link></li>
              <li><Link to="/Login" style={{ color: '#ffffff' }}>Login</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Terms of service</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Privacy policy</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4 style={{ color: '#ffffff' }}>Events</h4>
            <ul>
              <li><Link to="#" style={{ color: '#ffffff' }}>Upcoming Events</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Past Events</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Event Calendar</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Event Gallery</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Event Reports</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4 style={{ color: '#ffffff' }}>Contact</h4>
            <ul>
              <li><Link to="#" style={{ color: '#ffffff' }}>Get in Touch</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Support</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>FAQ</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Volunteer</Link></li>
              <li><Link to="#" style={{ color: '#ffffff' }}>Partnerships</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p style={{ color: '#ffffff' }}>© <span>Copyright</span> <strong className="px-1 sitename">NGO Events</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Designed by <a href="https://bootstrapmade.com/" style={{ color: '#ffffff' }}>Brainrock</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
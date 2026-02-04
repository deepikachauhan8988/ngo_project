import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Modal, Badge, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaTag, FaRupeeSign, FaCashRegister, FaUsers, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../../assets/css/Activity.css'; // We'll create this CSS file for custom styles

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [joiningForActivity, setJoiningForActivity] = useState(null);
  const [payingForActivity, setPayingForActivity] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [pendingActivityId, setPendingActivityId] = useState(null);
  const [joinedActivities, setJoinedActivities] = useState([]);
  const navigate = useNavigate();

  // District options for display
  const districtOptions = [
    { value: "haridwar", label: "Haridwar" },
    { value: "dehradun", label: "Dehradun" },
    { value: "uttarkashi", label: "Uttarkashi" },
    { value: "chamoli", label: "Chamoli" },
    { value: "rudraprayag", label: "Rudraprayag" },
    { value: "tehri_garhwal", label: "Tehri Garhwal" },
    { value: "pauri_garhwal", label: "Pauri Garhwal" },
    { value: "nainital", label: "Nainital" },
    { value: "almora", label: "Almora" },
    { value: "pithoragarh", label: "Pithoragarh" },
    { value: "udham_singh_nagar", label: "Udham Singh Nagar" },
    { value: "bageshwar", label: "Bageshwar" },
    { value: "champawat", label: "Champawat" }
  ];

  // Helper function to get district label by value
  const getDistrictLabel = (value) => {
    if (!value) return "Not specified";
    const district = districtOptions.find(d => d.value === value);
    return district ? district.label : value;
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Response is not valid JSON:', responseText.substring(0, 200));
          throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
        }
        
        if (data.success) {
          setActivities(data.data);
        } else {
          setError('Failed to fetch activities: ' + (data.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Error fetching activities: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const fetchJoinedActivities = async (userId) => {
    try {
      const response = await fetch(`https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-participant/?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Joined activities response is not valid JSON:', responseText.substring(0, 200));
        return [];
      }

      if (data.success && Array.isArray(data.data)) {
        return data.data.map(registration => registration.activity_id);
      }
      return [];
    } catch (err) {
      console.error('Error fetching joined activities:', err);
      return [];
    }
  };

  const checkUserExists = async (email) => {
    if (!email) {
      setError('Please enter your email address');
      return false;
    }

    setCheckingUser(true);
    setError(null);

    try {
      const response = await fetch(`https://mahadevaaya.com/ngoproject/ngoproject_backend/api/get-userid/?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setUserId(null);
          return false;
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('User check response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      if (data.user_id) {
        setUserId(data.user_id);
        const userJoinedActivities = await fetchJoinedActivities(data.user_id);
        setJoinedActivities(userJoinedActivities);
        return true;
      } else {
        setUserId(null);
        return false;
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setError('Error checking user: ' + err.message);
      return false;
    } finally {
      setCheckingUser(false);
    }
  };

  const joinActivity = async (activityId) => {
    if (!userId) {
      setShowEmailModal(true);
      setPendingActivityId(activityId);
      return;
    }

    setJoiningForActivity(activityId);
    setRegistrationMessage('');

    try {
      const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-participant/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          activity_id: activityId,
          user_id: userId
        })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Join response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        throw new Error(errorMessage);
      }
      
      setRegistrationMessage('Successfully joined the activity!');
      console.log('Join successful:', data);
      if (!joinedActivities.includes(activityId)) {
        setJoinedActivities(prev => [...prev, activityId]);
      }
    } catch (err) {
      console.error('Error joining activity:', err);
      setRegistrationMessage('Error joining activity: ' + err.message);
    } finally {
      setJoiningForActivity(null);
    }
  };

  const payForActivity = async (activityId) => {
    if (!userId) {
      setShowEmailModal(true);
      setPendingActivityId(activityId);
      return;
    }

    setPayingForActivity(activityId);
    setRegistrationMessage('');

    const activity = activities.find(a => a.activity_id === activityId);
    if (!activity) {
      setRegistrationMessage('Activity not found');
      setPayingForActivity(null);
      return;
    }

    try {
      // This is a placeholder for the payment API
      const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/payment/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          activity_id: activityId,
          user_id: userId,
          amount: activity.total_amount,
          activity_fee: activity.activity_fee,
          portal_charges: activity.portal_charges,
          transaction_charges: activity.transaction_charges,
          tax_amount: activity.tax_amount
        })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Payment response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        throw new Error(errorMessage);
      }
      
      setRegistrationMessage('Payment successful! You are now registered for the activity.');
      console.log('Payment successful:', data);
      if (!joinedActivities.includes(activityId)) {
        setJoinedActivities(prev => [...prev, activityId]);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setRegistrationMessage('Error processing payment: ' + err.message);
    } finally {
      setPayingForActivity(null);
    }
  };

  const handleJoinClick = (activityId) => {
    const activity = activities.find(a => a.activity_id === activityId);
    if (activity) {
      navigate('/DonateActivity', {
        state: { 
          activity_id: activityId, 
          activity_fee: activity.activity_fee,
          portal_charges: activity.portal_charges,
          transaction_charges: activity.transaction_charges,
          tax_amount: activity.tax_amount,
          total_amount: activity.total_amount,
          activityData: activity 
        }
      });
    }
  };

  const handlePayClick = (activityId) => {
    const activity = activities.find(a => a.activity_id === activityId);
    if (activity) {
      navigate('/DonateActivity', {
        state: { 
          activity_id: activityId, 
          activity_fee: activity.activity_fee,
          portal_charges: activity.portal_charges,
          transaction_charges: activity.transaction_charges,
          tax_amount: activity.tax_amount,
          total_amount: activity.total_amount,
          activityData: activity 
        }
      });
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!userEmail) {
      setError('Please enter your email address');
      return;
    }

    const userExists = await checkUserExists(userEmail);
    
    if (userExists) {
      setShowEmailModal(false);
      setRegistrationMessage('Now you can join activities or make payments');
      if (pendingActivityId) {
        joinActivity(pendingActivityId);
        setPendingActivityId(null);
      }
    } else {
      setShowEmailModal(false);
      setShowRegistrationModal(true);
    }
  };

  const handleCheckEmail = async () => {
    const userExists = await checkUserExists(userEmail);
    
    if (userExists) {
      setRegistrationMessage('Now you can join activities or make payments');
    } else {
      setShowRegistrationModal(true);
    }
  };

  const handleRegistrationSuccess = (userData) => {
    setUserEmail(userData.email);
    setUserId(userData.user_id);
    setShowRegistrationModal(false);
    setRegistrationMessage('Now you can join activities or make payments');
    
    fetchJoinedActivities(userData.user_id).then(userJoinedActivities => {
      setJoinedActivities(userJoinedActivities);
    });
    
    if (pendingActivityId) {
      joinActivity(pendingActivityId);
      setPendingActivityId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { day: 'N/A', monthYear: 'N/A' };
    
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    const parts = formattedDate.split(' ');
    return {
      day: parts[0],
      monthYear: `${parts[1]} ${parts[2]}`
    };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const getStatusBadge = (activity) => {
    if (activity.is_past) {
      return { text: 'Past', className: 'status-past' };
    } else if (activity.is_present) {
      return { text: 'Ongoing', className: 'status-ongoing' };
    } else if (activity.is_upcoming) {
      return { text: 'Upcoming', className: 'status-upcoming' };
    }
    return { text: 'Unknown', className: 'status-unknown' };
  };

  const filteredActivities = activities.filter(activity => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'past') return activity.is_past;
    if (activeFilter === 'present') return activity.is_present;
    if (activeFilter === 'upcoming') return activity.is_upcoming;
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center py-5">
        <div className="alert alert-danger" role="alert">
          <h5>Error loading activities</h5>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="container border rounded-3 shadow-lg p-4 bg-white mt-2">
      <section id="activities" className="activities-section">
        {registrationMessage && (
          <div className="alert-container mb-4">
            <div className={`alert ${registrationMessage.includes('Successfully') || registrationMessage.includes('Payment successful') ? 'alert-success' : 'alert-info'}`} role="alert">
              {registrationMessage}
            </div>
          </div>
        )}

        <div className=" text-center">
          <h2 className="section-title">Activities</h2>
         
        </div>

        <Tabs
          activeKey={activeFilter}
          onSelect={(k) => setActiveFilter(k)}
          className="activity-filters mb-4"
          justify
        >
          <Tab eventKey="all" title="All Activities" />
          <Tab eventKey="upcoming" title="Upcoming" />
          <Tab eventKey="present" title="Ongoing" />
          <Tab eventKey="past" title="Past" />
        </Tabs>

        <Row className="activity-cards">
          {filteredActivities.map((activity, index) => {
            const { day, monthYear } = formatDate(activity.activity_date_time);
            const time = formatTime(activity.activity_date_time);
            const status = getStatusBadge(activity);
            const imageSrc = activity.image ? 
              `https://mahadevaaya.com/ngoproject/ngoproject_backend${activity.image}` : 
              'https://picsum.photos/seed/activity/400/250.jpg';

            return (
              <Col lg={4} md={6} className="mb-4" key={activity.id}>
                <Card className="activity-card h-100">
                  <div className="card-img-container">
                    <Card.Img variant="top" src={imageSrc} className="activity-image" />
                    <div className="date-badge">
                      <span className="day">{day}</span>
                      <span className="month">{monthYear}</span>
                      <span className="time">{time}</span>
                    </div>
                    <Badge className={`status-badge ${status.className}`}>{status.text}</Badge>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="activity-title">{activity.activity_name}</Card.Title>
                    <Card.Text className="activity-objective flex-grow-1">
                      {activity.objective}
                    </Card.Text>
                    <div className="activity-info">
                      <div className="info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>{activity.venue}</span>
                      </div>
                      <div className="info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>{getDistrictLabel(activity.allocated_district)}</span>
                      </div>
                      <div className="info-item">
                        <FaClock className="info-icon" />
                        <span>{time}</span>
                      </div>
                      <div className="info-item">
                        <FaTag className="info-icon" />
                        <span>{activity.activity_id}</span>
                      </div>
                      <div className="info-item price">
                        <FaRupeeSign className="info-icon" />
                        <span>{activity.activity_fee}</span>
                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer className="activity-footer">
                    {!activity.is_past && (
                      <div className="action-buttons">
                        <Button 
                          variant="primary" 
                          className="join-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinClick(activity.activity_id);
                          }}
                          disabled={joiningForActivity === activity.activity_id || joinedActivities.includes(activity.activity_id)}
                        >
                          {joinedActivities.includes(activity.activity_id) 
                            ? 'Joined' 
                            : (joiningForActivity === activity.activity_id ? 'Joining...' : 'Join Now')}
                        </Button>
                        <Button 
                          variant="success" 
                          className="pay-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayClick(activity.activity_id);
                          }}
                          disabled={payingForActivity === activity.activity_id || joinedActivities.includes(activity.activity_id)}
                        >
                          {payingForActivity === activity.activity_id ? 'Processing...' : 'Pay Now'}
                        </Button>
                      </div>
                    )}
                    {activity.is_past && (
                      <Button variant="secondary" className="w-100" disabled>
                        Activity Ended
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      </section>

      {/* Email Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered className="email-modal">
        <Modal.Header closeButton>
          <Modal.Title>Enter Your Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEmailSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                We'll check if you have an account with us.
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowEmailModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={checkingUser}>
                {checkingUser ? 'Checking...' : 'Continue'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Activity;
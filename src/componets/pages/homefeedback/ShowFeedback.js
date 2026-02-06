import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../../assets/css/showfeedback.css";// Import the CSS file

const FEEDBACK_API = 'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/feedback/';

function ShowFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(FEEDBACK_API)
      .then(res => res.json())
      .then(data => {
        // Filter accepted feedbacks and get latest 10
        const accepted = data.filter(f => f.status === 'accepted');
        // Sort by created_at descending
        accepted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setFeedbacks(accepted.slice(0, 10));
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load feedbacks');
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderStars = (rating = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="star">
        {i < rating ? '★' : '☆'}
      </span>
    ));
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  if (feedbacks.length === 0) {
    return <div className="text-center py-5">No feedbacks to show.</div>;
  }

  return (
    <div>
      {/* Feedback Section */}
      <section id="feedback" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center g-5">
            {/* Feedback Content */}
            <div className="col-lg-12">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
                <h2 className="text-center">What Our Users Say</h2>
                <div className="feedback-carousel-container">
                  <Carousel 
                    interval={4000} 
                    indicators={true}
                    controls={true}
                    className="feedback-carousel"
                    prevIcon={<span aria-hidden="true" className="carousel-control-prev-icon" />}
                    nextIcon={<span aria-hidden="true" className="carousel-control-next-icon" />}
                  >
                    {feedbacks.map(fb => (
                      <Carousel.Item key={fb.id}>
                        <div className="feedback-card">
                          <div className="feedback-header">
                            <div className="feedback-avatar">
                              {getInitials(fb.full_name)}
                            </div>
                            <div className="feedback-info">
                              <h5 className="feedback-name">{fb.full_name}</h5>
                              <p className="feedback-date">{formatDate(fb.created_at)}</p>
                              {/* <div className="feedback-rating">
                                {renderStars(fb.rating || 5)}
                              </div> */}
                            </div>
                          </div>
                          <p className="feedback-message">{fb.message}</p>
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShowFeedback;
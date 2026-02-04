import React, { useState, useEffect } from 'react';
import "../../assets/css/ImageTransition.css";

const Events = () => {
  const [eventsData, setEventsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/aboutus-item/');
        const result = await response.json();
        
        if (result.success) {
          // Get only the id=3 data (Events)
          const eventItem = result.data.find(item => item.id === 3);
          setEventsData(eventItem);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  if (!eventsData) {
    return <div className="text-center py-5">No data available</div>;
  }

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If the path already starts with http, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the base URL
    return `https://mahadevaaya.com/ngoproject/ngoproject_backend${imagePath}`;
  };

  return (
    <div>
      {/* Events Section (id=3) */}
      <section id="events" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
            
                <h2>{eventsData?.title || "Events"}</h2>
                <p>{eventsData?.description || "Event description..."}</p>

                <div className="timeline">
                  {eventsData?.module && eventsData.module.map((item, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>{item[0] || `Event ${index + 1}`}</h4>
                        <p>{item[1] || "Event description"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-image image-transition-container" data-aos="zoom-in" data-aos-delay="300">
                {eventsData?.image ? (
                  <img src={getImageUrl(eventsData.image)} className="img-fluid image-transition" alt="Events Image" />
                ) : (
                  <div className="no-image-placeholder text-center p-5 bg-light rounded">
                    <i className="bi bi-calendar-event display-1 text-muted"></i>
                    <p className="mt-3 text-muted">No Image Available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
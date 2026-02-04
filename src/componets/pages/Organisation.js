import React, { useState, useEffect } from 'react';
import "../../assets/css/ImageTransition.css";

const Organisation = () => {
  const [organisationData, setOrganisationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/aboutus-item/');
        const result = await response.json();
        
        if (result.success) {
          // Get only the id=2 data (Why Choose Us)
          const organisationItem = result.data.find(item => item.id === 2);
          setOrganisationData(organisationItem);
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

  if (!organisationData) {
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
      {/* Why Choose Us Section (id=2) */}
      <section id="organisation" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center g-5">
            {/* Image Column (Left Side) */}
            <div className="col-lg-6">
              <div className="about-image image-transition-container" data-aos="zoom-in" data-aos-delay="300">
                <img src={getImageUrl(organisationData?.image)} className="img-fluid image-transition" alt="Organisation Image" />
              </div>
            </div>

            {/* Content Column (Right Side) */}
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
                <h2>{organisationData?.title || "Why Choose Us"}</h2>
                <p>{organisationData?.description || "Description content..."}</p>

                <div className="timeline">
                  {organisationData?.module && organisationData.module.map((item, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>{item[0] || `Feature ${index}`}</h4>
                        <p>{item[1] || "Feature description"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Organisation;
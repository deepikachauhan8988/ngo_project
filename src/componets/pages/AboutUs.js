import React, { useState, useEffect } from 'react';
import EducationImage from "../../assets/images/education/campus-5.webp";
import "../../assets/css/ImageTransition.css";

function AboutUs() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/aboutus-item/');
        const result = await response.json();
        
        if (result.success) {
          // Get only the id=1 data (About Us)
          const aboutUsItem = result.data.find(item => item.id === 1);
          setAboutData(aboutUsItem);
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

  if (!aboutData) {
    return <div className="text-center py-5">No data available</div>;
  }

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return EducationImage;
    // If the path already starts with http, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the base URL
    return `https://mahadevaaya.com/ngoproject/ngoproject_backend${imagePath}`;
  };

  return (
    <div>
      {/* About Us Section (id=1) */}
      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
               
                <h2>{aboutData?.title || "Educating Minds, Inspiring Hearts"}</h2>
                <p>{aboutData?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vitae odio ac nisi tristique venenatis. Nullam feugiat ipsum vitae justo finibus, in sagittis dolor malesuada. Aenean vel fringilla est, a vulputate massa."}</p>

                <div className="timeline">
                  {aboutData?.module && aboutData.module.map((item, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>{item[0] || `Year ${index}`}</h4>
                        <p>{item[1] || "Content description"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-image image-transition-container" data-aos="zoom-in" data-aos-delay="300">
                <img src={getImageUrl(aboutData?.image)} className="img-fluid image-transition" alt="About Us Image" />
              </div>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  );
}

export default AboutUs;
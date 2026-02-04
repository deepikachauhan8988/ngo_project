import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Image } from 'react-bootstrap';

const MembersList = () => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch members data from API
    useEffect(() => {
        const fetchMembers = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/');
                const data = await response.json();

                if (data.success) {
                    // Filter to only include members with "accepted" status
                    const acceptedMembers = data.data.filter(member => member.status === 'accepted');
                    setMembers(acceptedMembers);
                } else {
                    setError('Failed to fetch members data');
                }
            } catch (err) {
                setError('An error occurred while fetching members data');
                console.error('Error fetching members:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, []);

    // Handle card click to show member details
    const handleCardClick = (member) => {
        setSelectedMember(member);
    };

    // Handle back button to return to card list
    const handleBackToList = () => {
        setSelectedMember(null);
    };

    // Get occupation-specific details for display
    const getOccupationDetails = (member) => {
        const details = [];
        
        if (member.occupation === 'Government' && member.department_name) {
            details.push({ label: 'Department', value: member.department_name });
        }
        
        if (member.occupation === 'Private' && member.organization_name) {
            details.push({ label: 'Organization', value: member.organization_name });
        }
        
        if (member.occupation === 'Self Employed' && member.nature_of_work) {
            details.push({ label: 'Nature of Work', value: member.nature_of_work });
        }
        
        if (member.occupation === 'Student' && member.education_level) {
            details.push({ label: 'Education Level', value: member.education_level });
        }
        
        if (member.occupation === 'Others' && member.other_text) {
            details.push({ label: 'Other Details', value: member.other_text });
        }
        
        if (member.designation) {
            details.push({ label: 'Designation', value: member.designation });
        }
        
        return details;
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Render member card
    const renderMemberCard = (member) => {
        // Updated image path with the correct backend URL
        const imageUrl = member.image 
            ? `https://mahadevaaya.com/ngoproject/ngoproject_backend${member.image}` 
            : 'https://picsum.photos/seed/member/150/150.jpg';

        return (
            <Col key={member.id} md={4} className="mb-4">
                <Card 
                    className="h-100 shadow-sm member-card" 
                    onClick={() => handleCardClick(member)}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                   
                    <div className="text-center p-3">
                        <Image 
                            src={imageUrl} 
                            roundedCircle 
                            width={100} 
                            height={100} 
                            className="mb-3" 
                            alt={member.full_name}
                        />
                    </div>
                    <Card.Body>
                        <Card.Title className="text-center">{member.full_name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted text-center">{member.occupation}</Card.Subtitle>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <Badge bg="info">{member.designation || 'N/A'}</Badge>
                          
                        </div>
                    </Card.Body>
                    <Card.Footer className="card-footer-view">
                        <small className='click-view'>Click to view details</small>
                    </Card.Footer>
                </Card>
            </Col>
        );
    };

    // Render member details
    const renderMemberDetails = () => {
        if (!selectedMember) return null;

        // Updated image path with the correct backend URL
        const imageUrl = selectedMember.image 
            ? `https://mahadevaaya.com/ngoproject/ngoproject_backend${selectedMember.image}` 
            : 'https://picsum.photos/seed/member/200/200.jpg';
        
        const occupationDetails = getOccupationDetails(selectedMember);

        return (
             <div className="container border rounded-3 shadow-lg p-4 bg-white mt-2">
                <Button variant="secondary" onClick={handleBackToList} className="mb-4">
                    ← Back to Members List
                </Button>
                
                <Card className="shadow">
                    <div className="bg-secondary text-white d-flex justify-content-between align-items-center">
                       
                      
                    </div>
                    
                    <Card.Body>
                        <Row>
                            <Col md={4} className="text-center mb-4">
                                <Image 
                                    src={imageUrl} 
                                    rounded 
                                    width={200} 
                                    height={200} 
                                    className="mb-3" 
                                    alt={selectedMember.full_name}
                                />
                                <h4>{selectedMember.full_name}</h4>
                                <Badge bg="info" className="mb-2">{selectedMember.occupation}</Badge>
                                {selectedMember.designation && (
                                    <p className="text-muted">{selectedMember.designation}</p>
                                )}
                            </Col>
                            
                            <Col md={8}>
                                <h5 className="mb-3 fw-bold">Contact Information</h5>
                                <Row className="mb-4">
                                    <Col sm={6} className="mb-2">
                                        <strong>Email:</strong> {selectedMember.email}
                                    </Col>
                                  
                                    <Col sm={12} className="mb-2">
                                        <strong>Address:</strong> {selectedMember.address}
                                    </Col>
                                </Row>
                                
                                <h5 className="mb-3 fw-bold">Professional Information</h5>
                                <Row className="mb-4">
                                    {occupationDetails.map((detail, index) => (
                                        <Col sm={6} className="mb-2" key={index}>
                                            <strong>{detail.label}:</strong> {detail.value}
                                        </Col>
                                    ))}
                                </Row>
                                
                               
                                
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>
        );
    };

    return (
          <div className="">
            <h1 className="text-center mb-4">Members List</h1>
            
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {isLoading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading members data...</p>
                </div>
            ) : selectedMember ? (
                renderMemberDetails()
            ) : (
                <Container>
                    {members.length > 0 ? (
                        <Row>
                            {members.map(member => renderMemberCard(member))}
                        </Row>
                    ) : (
                        <Alert variant="info">
                            No members found.
                        </Alert>
                    )}
                </Container>
            )}
        </div>
    );
};

export default MembersList;
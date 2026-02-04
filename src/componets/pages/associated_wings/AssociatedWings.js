import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Image } from 'react-bootstrap';

const AssociatedWings = () => {
    const [wings, setWings] = useState([]);
    const [selectedWing, setSelectedWing] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch wings data from API
    useEffect(() => {
        const fetchWings = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wings/');
                const data = await response.json();

                if (data.success) {
                    setWings(data.data);
                } else {
                    setError('Failed to fetch wings data');
                }
            } catch (err) {
                setError('An error occurred while fetching wings data');
                console.error('Error fetching wings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWings();
    }, []);

    // Handle card click to show wing details
    const handleCardClick = (wing) => {
        setSelectedWing(wing);
    };

    // Handle back button to return to card list
    const handleBackToList = () => {
        setSelectedWing(null);
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

    // Render wing card
    const renderWingCard = (wing) => {
        // Updated image path with the correct backend URL
        const imageUrl = wing.image 
            ? `https://mahadevaaya.com/ngoproject/ngoproject_backend${wing.image}` 
            : 'https://picsum.photos/seed/wing/150/150.jpg';

        return (
            <Col key={wing.id} md={4} className="mb-4">
                <Card 
                    className="h-100 shadow-sm wing-card" 
                    onClick={() => handleCardClick(wing)}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Card.Header className="bg-secondary text-white text-center">
                        <h5 className="mb-0">{wing.native_wing}</h5>
                    </Card.Header>
                    <div className="text-center p-3">
                        <Image 
                            src={imageUrl} 
                            rounded 
                            width={150} 
                            height={120} 
                            className="mb-3" 
                            alt={wing.organization_name}
                        />
                    </div>
                    <Card.Body>
                        <Card.Title className="text-center">{wing.organization_name}</Card.Title>
                        <Card.Text className="text-center">{wing.short_description}</Card.Text>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <Badge bg="info">{wing.contact_person_name}</Badge>
                        </div>
                    </Card.Body>
                    <Card.Footer className="text-muted">
                        <small>Click to view details</small>
                    </Card.Footer>
                </Card>
            </Col>
        );
    };

    // Render wing details
    const renderWingDetails = () => {
        if (!selectedWing) return null;

        // Updated image path with the correct backend URL
        const imageUrl = selectedWing.image 
            ? `https://mahadevaaya.com/ngoproject/ngoproject_backend${selectedWing.image}` 
            : 'https://picsum.photos/seed/wing/300/200.jpg';

        return (
            <Container>
                <Button variant="secondary" onClick={handleBackToList} className="mb-4">
                    ← Back to Wings List
                </Button>
                
                <Card className="shadow">
                    <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Associated Wing Details</h4>
                      
                    </Card.Header>
                    
                    <Card.Body>
                        <Row>
                            <Col md={5} className="text-center mb-4">
                                <Image 
                                    src={imageUrl} 
                                    rounded 
                                    width={300} 
                                    height={200} 
                                    className="mb-3" 
                                    alt={selectedWing.organization_name}
                                />
                                <h4>{selectedWing.organization_name}</h4>
                                <p className="text-muted">{selectedWing.short_description}</p>
                            </Col>
                            
                            <Col md={7}>
                                <h5 className="mb-3 fw-bold">Contact Information</h5>
                                <Row className="mb-4">
                                    <Col sm={6} className="mb-2">
                                        <strong>Contact Person:</strong> {selectedWing.contact_person_name}
                                    </Col>
                                   
                                    <Col sm={12} className="mb-2">
                                        <strong>Email:</strong> {selectedWing.email}
                                    </Col>
                                    <Col sm={12} className="mb-2">
                                        <strong>Address:</strong> {selectedWing.address}
                                    </Col>
                                </Row>
                                
                                <h5 className="mb-3 fw-bold">Additional Information</h5>
                                <Row className="mb-4">
                                    <Col sm={6} className="mb-2">
                                        <strong>Nature Of Work:</strong> {selectedWing.native_wing}
                                    </Col>
                                    <Col sm={6} className="mb-2">
                                        <strong>Established:</strong> {formatDate(selectedWing.created_at)}
                                    </Col>
                                    <Col sm={6} className="mb-2">
                                        <strong>Last Updated:</strong> {formatDate(selectedWing.updated_at)}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        );
    };

    return (
        <div className="container border rounded-3 shadow-lg p-4 bg-white mt-2">
            <h1 className="text-center  mb-4">Associated Wings</h1>
            
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
                    <p className="mt-2">Loading wings data...</p>
                </div>
            ) : selectedWing ? (
                renderWingDetails()
            ) : (
                <Container>
                    {wings.length > 0 ? (
                        <Row>
                            {wings.map(wing => renderWingCard(wing))}
                        </Row>
                    ) : (
                        <Alert variant="info">
                            No associated wings found.
                        </Alert>
                    )}
                </Container>
            )}
        </div>
    );
};

export default AssociatedWings;
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Card, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';

const DonateActivity = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;
    const [activityData, setActivityData] = useState(state?.activityData || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [charges, setCharges] = useState({
        activity_fee: 0,
        portal_charges: 0,
        transaction_charges: 0,
        tax_amount: 0,
        total_amount: 0
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [formData, setFormData] = useState({
        activity_id: state?.activity_id || '',
        full_name: '',
        email: '',
        phone: '',
        amount: 0,
    });

    useEffect(() => {
        if (!state?.activity_id) {
            setError('Activity information not found. Please go back and select an activity.');
            return;
        }

        // First, check if we have activityData passed from Activity component
        if (state?.activityData) {
            const activity = state.activityData;
            setActivityData(activity);
            
            // Set charges from the passed activity data
            const chargesData = {
                activity_fee: parseFloat(activity.activity_fee) || 0,
                portal_charges: parseFloat(activity.portal_charges) || 0,
                transaction_charges: parseFloat(activity.transaction_charges) || 0,
                tax_amount: parseFloat(activity.tax_amount) || 0,
                total_amount: parseFloat(activity.total_amount) || 0
            };
            setCharges(chargesData);
            
            // Set the amount field initially with the activity_fee
            setFormData(prev => ({
                ...prev,
                amount: chargesData.activity_fee,
            }));
            return;
        }

        // Fallback: Fetch activity details if not passed
        const fetchActivityDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://mahadevaaya.com/ngoproject/ngoproject_backend/api/activity-items/`
                );
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    // Find the activity by activity_id
                    const activity = response.data.data.find(
                        item => item.activity_id === state.activity_id
                    );
                    
                    if (activity) {
                        setActivityData(activity);
                        
                        // Set charges from the API response
                        const chargesData = {
                            activity_fee: parseFloat(activity.activity_fee) || 0,
                            portal_charges: parseFloat(activity.portal_charges) || 0,
                            transaction_charges: parseFloat(activity.transaction_charges) || 0,
                            tax_amount: parseFloat(activity.tax_amount) || 0,
                            total_amount: parseFloat(activity.total_amount) || 0
                        };
                        setCharges(chargesData);
                        
                        // Set the amount field initially with the activity_fee
                        setFormData(prev => ({
                            ...prev,
                            amount: chargesData.activity_fee,
                        }));
                    } else {
                        setError('Activity not found. Please go back and select again.');
                    }
                } else {
                    setError('Failed to load activity details.');
                }
            } catch (err) {
                console.error('Error fetching activity details:', err);
                setError('Failed to load activity details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchActivityDetails();
    }, [state?.activity_id, state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        let error = '';

        // Validation for full_name - only alphabets and spaces
        if (name === 'full_name') {
            newValue = value.replace(/[^a-zA-Z\s]/g, '');
            if (newValue && !/^[a-zA-Z\s]+$/.test(newValue)) {
                error = 'Only alphabets are allowed';
            }
        }

        // Validation for phone - exactly 10 digits
        if (name === 'phone') {
            newValue = value.replace(/[^0-9]/g, '');
            if (newValue.length > 10) {
                newValue = newValue.slice(0, 10);
            }
            if (newValue && newValue.length !== 10) {
                error = 'Phone number must be exactly 10 digits';
            }
        }

        // Validation for email
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                error = 'Invalid email format';
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (error) {
            setFormErrors(prev => ({
                ...prev,
                [name]: error
            }));
        } else {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Determine whether all required fields are filled and valid
    const isFormValid = (
        formData.full_name && formData.full_name.toString().trim() !== '' &&
        formData.email && formData.email.toString().trim() !== '' &&
        formData.phone && formData.phone.toString().trim().length === 10 &&
        !formErrors.full_name && !formErrors.email && !formErrors.phone
    );

    const handleOpenPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
    };

    const handleConfirmPayment = async () => {
        // Validate all fields before payment
        if (!formData.full_name) {
            setFormErrors(prev => ({ ...prev, full_name: 'Full name is required' }));
            return;
        }
        if (!formData.email) {
            setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
            return;
        }
        if (!formData.phone || formData.phone.length !== 10) {
            setFormErrors(prev => ({ ...prev, phone: 'Phone must be exactly 10 digits' }));
            return;
        }

        // Check for existing errors
        if (formErrors.full_name || formErrors.email || formErrors.phone) {
            return;
        }

        try {
            setPaymentProcessing(true);
            // Simulate delay
            await new Promise(res => setTimeout(res, 1000));

            // After successful payment simulation, use total_amount as final amount
            setFormData(prev => ({
                ...prev,
                amount: charges.total_amount
            }));
            setPaymentSuccess(true);
            setShowPaymentModal(false);
        } catch (err) {
            console.error('Payment error:', err);
            setError('Payment failed. Please try again.');
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            
            // Validate required fields
            if (!formData.full_name || !formData.email || !formData.phone) {
                setError('Please fill in all required fields.');
                setLoading(false);
                return;
            }

            // Prepare the payload to send to the backend - only 5 fields as per API requirement
            const payload = {
                activity_id: formData.activity_id,
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                amount: formData.amount.toString(),
            };

            console.log('Submitting donation with payload:', payload);

            const response = await axios.post(
                'https://mahadevaaya.com/ngoproject/ngoproject_backend/api/donate/',
                payload
            );
            
            console.log('Donation response:', response);
            
            if (response.data.success || response.status === 201 || response.status === 200) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/Activity');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to process donation.');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            console.error('Error response data:', err.response?.data);
            
            // Try to extract meaningful error message
            let errorMessage = 'Error processing donation.';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!state?.activity_id) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Activity information not found. <Button onClick={() => navigate('/Activity')}>Go Back</Button></Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="text-center mb-4">Donate for Activity</h1>

            <div className="container border rounded-3 shadow-lg p-4 bg-white">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Donation submitted successfully! Redirecting...</Alert>}

                {activityData && (
                    <Card className="mb-4">
                        <Card.Body>
                            <h5 className="card-title">{activityData.activity_name || 'Activity'}</h5>
                            <p className="text-muted">{activityData.activity_description}</p>
                            <div className="activity-info mb-3">
                                <p><strong>Activity ID:</strong> {activityData.activity_id}</p>
                            </div>
                            {/* Charges breakdown is hidden by default; available in payment modal */}
                        </Card.Body>
                    </Card>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="full_name">
                                <Form.Label>
                                    Full Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your full name"
                                    isInvalid={!!formErrors.full_name}
                                    aria-required="true"
                                    aria-describedby="full_name-error"
                                />
                                <Form.Control.Feedback type="invalid" id="full_name-error">
                                    {formErrors.full_name}
                                </Form.Control.Feedback>
                                <Form.Text id="full_name-help" muted>
                                    Only alphabets are allowed
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group controlId="email">
                                <Form.Label>
                                    Email <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your email"
                                    isInvalid={!!formErrors.email}
                                    aria-required="true"
                                    aria-describedby="email-error"
                                />
                                <Form.Control.Feedback type="invalid" id="email-error">
                                    {formErrors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="phone">
                                <Form.Label>
                                    Phone <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter 10-digit phone number"
                                    maxLength="10"
                                    isInvalid={!!formErrors.phone}
                                    aria-required="true"
                                    aria-describedby="phone-error"
                                />
                                <Form.Control.Feedback type="invalid" id="phone-error">
                                    {formErrors.phone}
                                </Form.Control.Feedback>
                                <Form.Text id="phone-help" muted>
                                    Enter exactly 10 digits
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group controlId="amount">
                                <Form.Label>
                                    Amount (₹) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    disabled={true}
                                    className="fw-bold text-success"
                                    step="0.01"
                                    aria-describedby="amount-help"
                                />
                                <Form.Text id="amount-help" muted>
                                    Auto-calculated including all charges
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mt-4">
                        <Col sm={12} className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                                {!paymentSuccess && (
                                    <Button 
                                        variant="primary" 
                                        type="button"
                                        size="md"
                                        onClick={handleOpenPaymentModal}
                                        disabled={!activityData || !isFormValid}
                                        className="px-5"
                                        aria-label="Proceed to payment"
                                    >
                                        Pay
                                    </Button>
                                )}

                                {paymentSuccess && (
                                    <Button 
                                        variant="success" 
                                        type="submit" 
                                        size="md"
                                        disabled={loading}
                                        className="px-5"
                                    >
                                        {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                                        {loading ? 'Processing...' : 'Submit Donation'}
                                    </Button>
                                )}
                                <Button 
                                    variant="secondary" 
                                    onClick={() => navigate('/Activity')}
                                    size="md"
                                    disabled={loading}
                                    className="px-5"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold">Confirm Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {activityData && (
                        <>
                            {/* Activity and Charges Card */}
                            <Card className="mb-4 border-0 shadow-sm">
                                
                                <Card.Body>
                                    <p className="text-muted small mb-3">{activityData.activity_description}</p>
                                    
                                    {/* Charges Breakdown */}
                                    <div className="charges-section">
                                        <div className="d-flex justify-content-between mb-3 pb-2">
                                            <span className="text-muted">Activity Fee:</span>
                                            <strong>₹ {charges.activity_fee.toFixed(2)}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3 pb-2">
                                            <span className="text-muted">Portal Charges:</span>
                                            <strong>₹ {charges.portal_charges.toFixed(2)}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3 pb-2">
                                            <span className="text-muted">Transaction Charges:</span>
                                            <strong>₹ {charges.transaction_charges.toFixed(2)}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3 pb-2">
                                            <span className="text-muted">Tax Amount:</span>
                                            <strong>₹ {charges.tax_amount.toFixed(2)}</strong>
                                        </div>
                                        <hr className="my-3" />
                                        <div className="d-flex justify-content-between p-2 bg-success bg-opacity-10 rounded">
                                            <span className="h6 fw-bold text-success mb-0">Total Amount</span>
                                            <strong className="h5 text-success mb-0">₹ {charges.total_amount.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Form Fields */}
                            <Form>
                                <h6 className="mb-3 fw-bold text-secondary">Enter Your Details</h6>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Full Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="full_name" 
                                        value={formData.full_name} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="Enter your full name"
                                        isInvalid={!!formErrors.full_name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.full_name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Email <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="Enter your email"
                                        isInvalid={!!formErrors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Phone <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="tel" 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleInputChange} 
                                        required 
                                        placeholder="Enter 10-digit phone number"
                                        maxLength="10"
                                        isInvalid={!!formErrors.phone}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.phone}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Final Amount (₹) <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        value={charges.total_amount.toFixed(2)} 
                                        disabled 
                                        className="fw-bold text-success bg-light"
                                    />
                                </Form.Group>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={handleClosePaymentModal} disabled={paymentProcessing}>
                        Close
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handleConfirmPayment} 
                        disabled={paymentProcessing || paymentSuccess || !isFormValid}
                        size="lg"
                    >
                        {paymentProcessing ? 'Processing...' : (paymentSuccess ? 'Payment Successful' : 'Confirm & Pay')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DonateActivity;
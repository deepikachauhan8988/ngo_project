import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';

const DonationSociety = () => {
    // State for all form fields
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        amount: '',
        purpose: '',
    });

    // State for form submission
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [donationId, setDonationId] = useState(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for full_name to only allow alphabets and spaces
        if (name === 'full_name') {
            // Remove any numbers from the input
            const alphabetOnlyValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData({
                ...formData,
                [name]: alphabetOnlyValue,
            });

            // Clear error when user starts typing
            if (errors[name]) {
                setErrors({
                    ...errors,
                    [name]: null,
                });
            }
            return;
        }
        
        // Special handling for phone to only allow numbers
        if (name === 'phone') {
            // Remove any non-digit characters and limit to 10 digits
            const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData({
                ...formData,
                [name]: numbersOnly,
            });

            // Clear error when user starts typing
            if (errors[name]) {
                setErrors({
                    ...errors,
                    [name]: null,
                });
            }
            return;
        }
        
        // Special handling for amount to only allow numbers and decimal point
        if (name === 'amount') {
            // Remove any non-digit characters except decimal point
            const numbersOnly = value.replace(/[^\d.]/g, '');
            
            // Ensure only one decimal point and at most 2 decimal places
            const parts = numbersOnly.split('.');
            if (parts.length > 2) {
                return; // Don't update if there are multiple decimal points
            }
            
            if (parts[1] && parts[1].length > 2) {
                return; // Don't update if more than 2 decimal places
            }
            
            setFormData({
                ...formData,
                [name]: numbersOnly,
            });

            // Clear error when user starts typing
            if (errors[name]) {
                setErrors({
                    ...errors,
                    [name]: null,
                });
            }
            return;
        }
        
        // Normal handling for other fields
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            });
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Full Name validation
        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        } else if (formData.full_name.trim().length < 2) {
            newErrors.full_name = 'Full name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) {
            newErrors.full_name = 'Full name should contain only alphabets';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Phone validation
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        }

        // Amount validation
        if (!formData.amount.trim()) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }

        // Purpose validation
        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Purpose is required';
        } else if (formData.purpose.trim().length < 5) {
            newErrors.purpose = 'Purpose must be at least 5 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission - initiate payment
    const handlePayment = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setShowPayment(true);
        }
    };

    // Handle payment confirmation
    const handlePaymentConfirm = async () => {
        setIsLoading(true);
        setApiError(null);

        try {
            // Create FormData for API
            const data = new FormData();

            // Add all form fields to FormData
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('amount', formData.amount);
            data.append('purpose', formData.purpose);

            // Log the form data for debugging
            console.log('Submitting donation data:');
            for (let [key, value] of data.entries()) {
                console.log(key, value);
            }

            // Make API call
            const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/donate-society/', {
                method: 'POST',
                body: data,
            });

            const responseText = await response.text();
            console.log('API Response:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);

                // Handle successful JSON response
                if (result.success || response.ok) {
                    // Store donation ID for success message
                    setDonationId(result.donation_id || result.id);
                    setSubmitted(true);
                    setShowPayment(false);

                    // Reset form after successful submission
                    setTimeout(() => {
                        setFormData({
                            full_name: '',
                            email: '',
                            phone: '',
                            amount: '',
                            purpose: '',
                        });
                        setSubmitted(false);
                        setDonationId(null);
                    }, 5000);
                    return; // Exit early for successful case
                } else {
                    throw new Error(result.message || 'Donation failed. Please try again.');
                }
            } catch (e) {
                console.error('Invalid JSON response:', e);

                // Check if it's an HTML error page
                if (responseText.startsWith('<!DOCTYPE')) {
                    // Check for IntegrityError (duplicate entry)
                    if (responseText.includes('IntegrityError') &&
                        responseText.includes('Duplicate entry') &&
                        (responseText.includes('email') || responseText.includes('&#x27;email&#x27;'))) {
                        throw new Error('This email is already registered. Please use a different email.');
                    }

                    // Check for other specific errors
                    if (responseText.includes('ValidationError')) {
                        throw new Error('Please check your input and try again.');
                    }

                    // Generic server error
                    throw new Error('Server error occurred. Please try again later.');
                }

                throw new Error('Server returned an invalid response. Please try again later.');
            }
        } catch (error) {
            console.error('Donation error:', error);
            setApiError(error.message || 'An error occurred during donation. Please try again.');
            setShowPayment(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel payment
    const handlePaymentCancel = () => {
        setShowPayment(false);
    };

    return (
       
          

            <div className="container border rounded-3 shadow-lg p-4 bg-white mt-2">
                  <h1 className="text-center mb-4">Donation Form</h1>
                {submitted ? (
                    <Alert variant="success" className="text-center">
                        <Alert.Heading>Thank You for Your Donation!</Alert.Heading>
                        <p>
                            Your generous donation has been successfully processed.
                            {donationId && <span> Your donation ID is: <strong>{donationId}</strong></span>}
                        </p>
                        <p>
                            We appreciate your contribution to our society's welfare programs.
                        </p>
                    </Alert>
                ) : showPayment ? (
                    <div className="text-center py-4">
                        <h3 className="mb-4">Payment Confirmation</h3>
                        <p className="mb-4">
                            You are about to donate <strong>₹{formData.amount}</strong> for <strong>{formData.purpose}</strong>.
                        </p>
                        <p className="mb-4">
                            Please confirm to proceed with the payment.
                        </p>
                        
                        {apiError && (
                            <Alert variant="danger" dismissible onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}
                        
                        <div className="d-flex justify-content-center gap-3">
                            <Button 
                                variant="primary" 
                                onClick={handlePaymentConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        <span className="visually-hidden">Loading...</span>
                                        <span className="ms-2">Processing...</span>
                                    </>
                                ) : (
                                    'Confirm Payment'
                                )}
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={handlePaymentCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Form onSubmit={handlePayment} noValidate>
                        {apiError && (
                            <Alert variant="danger" dismissible onClose={() => setApiError(null)}>
                                {apiError}
                            </Alert>
                        )}

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
                                        onChange={handleChange}
                                        isInvalid={!!errors.full_name}
                                        required
                                        aria-required="true"
                                        aria-describedby="full_name-error"
                                        placeholder="Enter Name"
                                    />
                                    <Form.Control.Feedback type="invalid" id="full_name-error">
                                        {errors.full_name}
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
                                        onChange={handleChange}
                                        isInvalid={!!errors.email}
                                        required
                                        aria-required="true"
                                        aria-describedby="email-error"
                                        placeholder="Enter Email"
                                    />
                                    <Form.Control.Feedback type="invalid" id="email-error">
                                        {errors.email}
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
                                        onChange={handleChange}
                                        isInvalid={!!errors.phone}
                                        required
                                        aria-required="true"
                                        aria-describedby="phone-error"
                                        maxLength="10"
                                        placeholder="Enter Phone Number"   
                                    />
                                    <Form.Control.Feedback type="invalid" id="phone-error">
                                        {errors.phone}
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
                                        type="text"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        isInvalid={!!errors.amount}
                                        required
                                        aria-required="true"
                                        aria-describedby="amount-error"
                                        placeholder="0.00"
                                    />
                                    <Form.Control.Feedback type="invalid" id="amount-error">
                                        {errors.amount}
                                    </Form.Control.Feedback>
                                    <Form.Text id="amount-help" muted>
                                        Enter amount in rupees
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col sm={12}>
                                <Form.Group controlId="purpose">
                                    <Form.Label>
                                        Purpose of Donation <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleChange}
                                        rows="3"
                                        isInvalid={!!errors.purpose}
                                        required
                                        aria-required="true"
                                        aria-describedby="purpose-error"
                                        placeholder="e.g., Community Welfare Program, Education Support, etc."
                                    />
                                    <Form.Control.Feedback type="invalid" id="purpose-error">
                                        {errors.purpose}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col sm={12} className="text-center">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-5"
                                    aria-label="Proceed to payment"
                                >
                                    Pay Now
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                )}
            </div>
      
    );
};

export default DonationSociety;
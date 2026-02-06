import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';

const ProblemReport = () => {
    // State for all form fields
    const [formData, setFormData] = useState({
        full_name: '',
        problem_nature: '',
        department: '',
        description: '',
        district: '',
        remark: '',
    });

    // State for form submission
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [problemId, setProblemId] = useState(null);

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

        // Problem Nature validation
        if (!formData.problem_nature.trim()) {
            newErrors.problem_nature = 'Problem nature is required';
        }

        // Department validation
        if (!formData.department.trim()) {
            newErrors.department = 'Department is required';
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        // District validation
        if (!formData.district.trim()) {
            newErrors.district = 'District is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setIsLoading(true);
            setApiError(null);

            try {
                // Create FormData for API
                const data = new FormData();

                // Add all form fields to FormData
                data.append('full_name', formData.full_name);
                data.append('problem_nature', formData.problem_nature);
                data.append('department', formData.department);
                data.append('description', formData.description);
                data.append('district', formData.district);
                if (formData.remark.trim()) {
                    data.append('remark', formData.remark);
                }

                // Log the form data for debugging
                console.log('Submitting problem report data:');
                for (let [key, value] of data.entries()) {
                    console.log(key, value);
                }

                // Make API call
                const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/report-problem/', {
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
                        // Store problem ID for success message
                        setProblemId(result.id || result.problem_id);
                        setSubmitted(true);

                        // Reset form after successful submission
                        setTimeout(() => {
                            setFormData({
                                full_name: '',
                                problem_nature: '',
                                department: '',
                                description: '',
                                district: '',
                                remark: '',
                            });
                            setSubmitted(false);
                            setProblemId(null);
                        }, 5000);
                        return; // Exit early for successful case
                    } else {
                        throw new Error(result.message || 'Problem report submission failed. Please try again.');
                    }
                } catch (e) {
                    console.error('Invalid JSON response:', e);

                    // Check if it's an HTML error page
                    if (responseText.startsWith('<!DOCTYPE')) {
                        // Generic server error
                        throw new Error('Server error occurred. Please try again later.');
                    }

                    throw new Error('Server returned an invalid response. Please try again later.');
                }
            } catch (error) {
                console.error('Problem report error:', error);
                setApiError(error.message || 'An error occurred while submitting the problem report. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Options for district
    const districtOptions = [
        'pauri_garhwal',
        'dehradun',
        'haridwar',
        'nainital',
        'udham_singh_nagar',
        'chamoli',
        'rudraprayag',
        'tehri_garhwal',
        'uttarkashi',
        'champawat',
        'pithoragarh',
        'bageshwar',
        'almona'
    ];

    return (
        <div className="container border rounded-3 shadow-lg p-4 bg-white mt-2">
            <h1 className="text-center mb-4">Report a Problem</h1>
            {submitted ? (
                <Alert variant="success" className="text-center">
                    <Alert.Heading>Problem Report Submitted Successfully!</Alert.Heading>
                    <p>
                        Your problem report has been successfully submitted.
                        {problemId && <span> Your report ID is: <strong>{problemId}</strong></span>}
                    </p>
                    <p>
                        We will review your report and take appropriate action. You will be notified about the status.
                    </p>
                </Alert>
            ) : (
                <Form onSubmit={handleSubmit} noValidate>
                    {apiError && (
                        <Alert variant="danger" dismissible onClose={() => setApiError(null)}>
                            {apiError}
                        </Alert>
                    )}

                    <Row className="mb-3">
                        <Col sm={12}>
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
                                    placeholder="Enter Your Name"
                                />
                                <Form.Control.Feedback type="invalid" id="full_name-error">
                                    {errors.full_name}
                                </Form.Control.Feedback>
                                <Form.Text id="full_name-help" muted>
                                    Only alphabets are allowed
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="problem_nature">
                                <Form.Label>
                                    Nature of Problem <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="problem_nature"
                                    value={formData.problem_nature}
                                    onChange={handleChange}
                                    isInvalid={!!errors.problem_nature}
                                    required
                                    aria-required="true"
                                    aria-describedby="problem_nature-error"
                                    placeholder="e.g., Water Supply Issue"
                                />
                                <Form.Control.Feedback type="invalid" id="problem_nature-error">
                                    {errors.problem_nature}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group controlId="department">
                                <Form.Label>
                                    Department <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    isInvalid={!!errors.department}
                                    required
                                    aria-required="true"
                                    aria-describedby="department-error"
                                    placeholder="e.g., Public Works Department"
                                />
                                <Form.Control.Feedback type="invalid" id="department-error">
                                    {errors.department}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={12}>
                            <Form.Group controlId="description">
                                <Form.Label>
                                    Problem Description <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    isInvalid={!!errors.description}
                                    required
                                    aria-required="true"
                                    aria-describedby="description-error"
                                    placeholder="Please provide a detailed description of the problem..."
                                />
                                <Form.Control.Feedback type="invalid" id="description-error">
                                    {errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="district">
                                <Form.Label>
                                    District <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    isInvalid={!!errors.district}
                                    required
                                    aria-required="true"
                                    aria-describedby="district-error"
                                >
                                    <option value="">Select District</option>
                                    {districtOptions.map(option => (
                                        <option key={option} value={option}>{option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid" id="district-error">
                                    {errors.district}
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
                                aria-label="Submit problem report"
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
                                        <span className="ms-2">Submitting...</span>
                                    </>
                                ) : (
                                    'Submit Report'
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )}
        </div>
    );
};

export default ProblemReport;
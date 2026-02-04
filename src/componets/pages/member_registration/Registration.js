import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner, Image } from 'react-bootstrap';

const Registration = () => {
    // State for all form fields
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        image: null,
        address: '',
        short_description: '',
        occupation: '',
        designation: '',
        department_name: '',
        organization_name: '',
        nature_of_work: '',
        education_level: '',
        other_text: '',
        district: '',
        state: 'Uttarakhand', // Default state value
        // New fields
        gender: '',
        date_of_birth: '',
        registration_fee: '',
        primary_membership: '',
    });

    // State for form submission
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [memberId, setMemberId] = useState(null);
    
    // State for membership options
    const [membershipOptions, setMembershipOptions] = useState([]);
    const [membershipLoading, setMembershipLoading] = useState(true);
    const [membershipError, setMembershipError] = useState(null);

    // District options
    const districtOptions = [
        "haridwar", "dehradun", "uttarkashi", "chamoli", "rudraprayag",
        "tehri_garhwal", "pauri_garhwal", "nainital", "almora", "pithoragarh",
        "udham_singh_nagar", "bageshwar", "champawat"
    ];

    // Gender options
    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ];

    // Fetch membership options on component mount
    useEffect(() => {
        const fetchMembershipOptions = async () => {
            try {
                console.log('Starting to fetch membership options from API...');
                const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/associative-wing-names/');
                console.log('API response status:', response.status);
                console.log('API response headers:', response.headers);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch membership options: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('API response data:', data);
                
                // Check if data is an array
                if (!Array.isArray(data)) {
                    console.error('API response is not an array:', data);
                    throw new Error('API response is not in expected array format');
                }
                
                // Convert the array to the format expected by the dropdown
                const formattedOptions = data.map(option => ({
                    value: option,
                    label: option
                }));
                
                console.log('Formatted membership options:', formattedOptions);
                setMembershipOptions(formattedOptions);
                setMembershipLoading(false);
            } catch (error) {
                console.error('Error fetching membership options:', error);
                setMembershipError(error.message);
                setMembershipLoading(false);
                
                // Fallback options in case of error
                const fallbackOptions = [
                    { value: 'Green Future Foundation', label: 'Green Future Foundation' },
                    { value: 'Blue Future Foundation', label: 'Blue Future Foundation' },
                ];
                console.log('Using fallback membership options:', fallbackOptions);
                setMembershipOptions(fallbackOptions);
            }
        };

        fetchMembershipOptions();
    }, []);

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
        
        // Special handling for registration fee to only allow numbers
        if (name === 'registration_fee') {
            // Remove any non-digit characters except decimal point
            const feeValue = value.replace(/[^\d.]/g, '');
            setFormData({
                ...formData,
                [name]: feeValue,
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

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
            });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
        
        // Clear image error when file is selected
        if (errors.image) {
            setErrors({
                ...errors,
                image: null,
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

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // Image validation - now required
        if (!formData.image) {
            newErrors.image = 'Image is required';
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        // District validation
        if (!formData.district) {
            newErrors.district = 'District is required';
        }

        // Short Description validation
        if (!formData.short_description.trim()) {
            newErrors.short_description = 'Short description is required';
        } else if (formData.short_description.trim().length < 10) {
            newErrors.short_description = 'Description must be at least 10 characters';
        }

        // Occupation validation
        if (!formData.occupation) {
            newErrors.occupation = 'Occupation is required';
        }

        // Gender validation
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        // Date of Birth validation
        if (!formData.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required';
        }

        // Registration Fee validation - only validate if value is provided (not required)
        if (formData.registration_fee && (isNaN(formData.registration_fee) || parseFloat(formData.registration_fee) < 0)) {
            newErrors.registration_fee = 'Registration fee must be a valid number';
        }

        // Primary Membership validation - removed required validation
        // No validation for primary_membership as it's not required anymore

        // Conditional field validations
        if (formData.occupation === 'Government' && !formData.department_name.trim()) {
            newErrors.department_name = 'Department name is required';
        }
        if (formData.occupation === 'Private' && !formData.organization_name.trim()) {
            newErrors.organization_name = 'Organization name is required';
        }
        if (formData.occupation === 'Self Employed' && !formData.nature_of_work.trim()) {
            newErrors.nature_of_work = 'Nature of work is required';
        }
        if (formData.occupation === 'Others' && !formData.other_text.trim()) {
            newErrors.other_text = 'This field is required';
        }
        if (formData.occupation === 'Student' && !formData.education_level) {
            newErrors.education_level = 'Education level is required';
        }

        // Designation validation (not required for students)
        if (formData.occupation !== 'Student' && !formData.designation.trim()) {
            newErrors.designation = 'Designation is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Update your handleSubmit function with this improved error handling section:
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
            setApiError(null);

            try {
                // Create FormData for file upload
                const data = new FormData();

                // Add all form fields to FormData
                data.append('full_name', formData.full_name);
                data.append('email', formData.email);
                data.append('phone', formData.phone);
                data.append('password', formData.password);
                data.append('address', formData.address);
                data.append('district', formData.district);
                data.append('state', formData.state);
                data.append('short_description', formData.short_description);
                data.append('occupation', formData.occupation);
                
                // Add new fields
                data.append('gender', formData.gender);
                data.append('date_of_birth', formData.date_of_birth);
                
                // Only add registration_fee if it has a value
                if (formData.registration_fee) {
                    data.append('registration_fee', formData.registration_fee);
                }
                
                // Only add primary_membership if it has a value
                if (formData.primary_membership) {
                    data.append('primary_membership', formData.primary_membership);
                }

                // Add image if available
                if (formData.image) {
                    data.append('image', formData.image);
                }

                // Add conditional fields
                if (formData.occupation !== 'Student') {
                    data.append('designation', formData.designation);
                }

                if (formData.occupation === 'Government') {
                    data.append('department_name', formData.department_name);
                }

                if (formData.occupation === 'Private') {
                    data.append('organization_name', formData.organization_name);
                }

                if (formData.occupation === 'Self Employed') {
                    data.append('nature_of_work', formData.nature_of_work);
                }

                if (formData.occupation === 'Student') {
                    data.append('education_level', formData.education_level);
                }

                if (formData.occupation === 'Others') {
                    data.append('other_text', formData.other_text);
                }

                // Log the form data for debugging
                console.log('Submitting form data:');
                for (let [key, value] of data.entries()) {
                    console.log(key, value);
                }

                // Make API call
                const response = await fetch('https://mahadevaaya.com/ngoproject/ngoproject_backend/api/member-reg/', {
                    method: 'POST',
                    body: data,
                });

                // Get response as text first
                const responseText = await response.text();
                console.log('API Response:', responseText);

                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error('Invalid JSON response:', e);
                    
                    // Check if it's an HTML error page
                    if (responseText.startsWith('<!DOCTYPE')) {
                        // Check for IntegrityError (duplicate entry)
                        if (responseText.includes('IntegrityError') &&
                            responseText.includes('Duplicate entry') &&
                            (responseText.includes('email') || responseText.includes('&#x27;email&#x27;'))) {
                            throw new Error('This email is already registered. Please use a different email or try logging in.');
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

                // Handle successful JSON response
                if (result.success) {
                    // Store member ID for success message
                    setMemberId(result.member_id);
                    setSubmitted(true);

                    // Reset form after successful submission
                    setTimeout(() => {
                        setFormData({
                            full_name: '',
                            email: '',
                            phone: '',
                            password: '',
                            image: null,
                            address: '',
                            short_description: '',
                            occupation: '',
                            designation: '',
                            department_name: '',
                            organization_name: '',
                            nature_of_work: '',
                            education_level: '',
                            other_text: '',
                            district: '',
                            state: 'Uttarakhand', // Keep default state
                            // Reset new fields
                            gender: '',
                            date_of_birth: '',
                            registration_fee: '',
                            primary_membership: '',
                        });
                        setImagePreview(null);
                        setSubmitted(false);
                        setMemberId(null);
                    }, 5000);
                } else {
                    // Handle error response - check for field-specific errors
                    if (result.email && result.email.length > 0) {
                        throw new Error(result.email[0]);
                    }
                    
                    if (result.phone && result.phone.length > 0) {
                        throw new Error(result.phone[0]);
                    }
                    
                    // Handle other field-specific errors
                    if (result.errors) {
                        const errorMessages = Object.values(result.errors).flat().join(', ');
                        throw new Error(errorMessages || 'Registration failed. Please check your input and try again.');
                    }
                    
                    // Handle general error message
                    if (result.message) {
                        throw new Error(result.message);
                    }
                    
                    throw new Error('Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                setApiError(error.message || 'An error occurred during registration. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Render conditional fields based on occupation
    const renderConditionalFields = () => {
        switch (formData.occupation) {
            case 'Government':
                return (
                    <>
                        <Row className="mb-3">
                            <Col sm={6}>
                                <Form.Group controlId="department_name">
                                    <Form.Label>
                                        Department Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="department_name"
                                        value={formData.department_name}
                                        onChange={handleChange}
                                        isInvalid={!!errors.department_name}
                                        aria-required="true"
                                        aria-describedby="department_name-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="department_name-error">
                                        {errors.department_name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group controlId="designation">
                                    <Form.Label>
                                        Designation <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        isInvalid={!!errors.designation}
                                        aria-required="true"
                                        aria-describedby="designation-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="designation-error">
                                        {errors.designation}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            case 'Private':
                return (
                    <>
                        <Row className="mb-3">
                            <Col sm={6}>
                                <Form.Group controlId="organization_name">
                                    <Form.Label>
                                        Organization Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="organization_name"
                                        value={formData.organization_name}
                                        onChange={handleChange}
                                        isInvalid={!!errors.organization_name}
                                        aria-required="true"
                                        aria-describedby="organization_name-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="organization_name-error">
                                        {errors.organization_name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group controlId="designation">
                                    <Form.Label>
                                        Designation <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        isInvalid={!!errors.designation}
                                        aria-required="true"
                                        aria-describedby="designation-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="designation-error">
                                        {errors.designation}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            case 'Self Employed':
                return (
                    <>
                        <Row className="mb-3">
                            <Col sm={6}>
                                <Form.Group controlId="nature_of_work">
                                    <Form.Label>
                                        Nature of Work <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nature_of_work"
                                        value={formData.nature_of_work}
                                        onChange={handleChange}
                                        isInvalid={!!errors.nature_of_work}
                                        aria-required="true"
                                        aria-describedby="nature_of_work-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="nature_of_work-error">
                                        {errors.nature_of_work}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group controlId="designation">
                                    <Form.Label>
                                        Designation <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        isInvalid={!!errors.designation}
                                        aria-required="true"
                                        aria-describedby="designation-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="designation-error">
                                        {errors.designation}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            case 'Others':
                return (
                    <>
                        <Row className="mb-3">
                            <Col sm={6}>
                                <Form.Group controlId="other_text">
                                    <Form.Label>
                                        Specify <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="other_text"
                                        value={formData.other_text}
                                        onChange={handleChange}
                                        isInvalid={!!errors.other_text}
                                        aria-required="true"
                                        aria-describedby="other_text-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="other_text-error">
                                        {errors.other_text}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group controlId="designation">
                                    <Form.Label>
                                        Designation <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        isInvalid={!!errors.designation}
                                        aria-required="true"
                                        aria-describedby="designation-error"
                                    />
                                    <Form.Control.Feedback type="invalid" id="designation-error">
                                        {errors.designation}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            case 'Student':
                return (
                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="education_level">
                                <Form.Label>
                                    Education Level <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="education_level"
                                    value={formData.education_level}
                                    onChange={handleChange}
                                    isInvalid={!!errors.education_level}
                                    aria-required="true"
                                    aria-describedby="education_level-error"
                                >
                                    <option value="">Select Education Level</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Post Graduate">Post Graduate</option>
                                    <option value="PHD">PHD</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid" id="education_level-error">
                                    {errors.education_level}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            {/* No designation field for students */}
                        </Col>
                    </Row>
                );
            default:
                return null;
        }
    };

    // Get today's date for date of birth validation
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="container border rounded-3 shadow-lg p-4 bg-white mt-2">
            <h1 className="text-center mb-4">Registration Form</h1>
            {submitted ? (
                <Alert variant="success" className="text-center">
                    <Alert.Heading>Registration Successful!</Alert.Heading>
                    <p>
                        Thank you for registering. 
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
                                    placeholder="Enter Phone Number "
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
                            <Form.Group controlId="password">
                                <Form.Label>
                                    Password <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    isInvalid={!!errors.password}
                                    required
                                    aria-required="true"
                                    aria-describedby="password-error"
                                    placeholder="Enter Password"
                                />
                                <Form.Control.Feedback type="invalid" id="password-error">
                                    {errors.password}
                                </Form.Control.Feedback>
                                <Form.Text id="password-help" muted>
                                    Password must be at least 8 characters with uppercase, lowercase, and number.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="gender">
                                <Form.Label>
                                    Gender <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    isInvalid={!!errors.gender}
                                    required
                                    aria-required="true"
                                    aria-describedby="gender-error"
                                >
                                    <option value="">Select Gender</option>
                                    {genderOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid" id="gender-error">
                                    {errors.gender}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group controlId="date_of_birth">
                                <Form.Label>
                                    Date of Birth <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    isInvalid={!!errors.date_of_birth}
                                    required
                                    aria-required="true"
                                    aria-describedby="date_of_birth-error"
                                    max={today} // Prevent selection of future dates
                                />
                                <Form.Control.Feedback type="invalid" id="date_of_birth-error">
                                    {errors.date_of_birth}
                                </Form.Control.Feedback>
                                <Form.Text id="date_of_birth-help" muted>
                                    Date of birth cannot be in the future
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="image">
                                <Form.Label>
                                    Image <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    aria-required="true"
                                    aria-describedby="image-help image-error"
                                    isInvalid={!!errors.image}
                                    required
                                />
                                <Form.Text id="image-help" muted>
                                    Upload a recent photo (JPG, PNG format)
                                </Form.Text>
                                {errors.image && (
                                    <div className="text-danger mt-1" id="image-error">{errors.image}</div>
                                )}
                                {imagePreview && (
                                    <div className="mt-2">
                                        <Image src={imagePreview} alt="Image preview" thumbnail width={100} height={100} />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group controlId="registration_fee">
                                <Form.Label>
                                    Registration Fee
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="registration_fee"
                                    value={formData.registration_fee}
                                    onChange={handleChange}
                                    isInvalid={!!errors.registration_fee}
                                    aria-describedby="registration_fee-error"
                                    placeholder="Enter amount"
                                />
                                <Form.Control.Feedback type="invalid" id="registration_fee-error">
                                    {errors.registration_fee}
                                </Form.Control.Feedback>
                                <Form.Text id="registration_fee-help" muted>
                                    Enter a valid amount (optional)
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="primary_membership">
                                <Form.Label>
                                    Membership Type
                                </Form.Label>
                                {membershipLoading ? (
                                    <div className="d-flex align-items-center">
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span className="ms-2">Loading membership options...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Form.Select
                                            name="primary_membership"
                                            value={formData.primary_membership}
                                            onChange={handleChange}
                                            isInvalid={!!errors.primary_membership}
                                            aria-describedby="primary_membership-error"
                                        >
                                            <option value="">Select Membership Type</option>
                                            {membershipOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid" id="primary_membership-error">
                                            {errors.primary_membership}
                                        </Form.Control.Feedback>
                                    </>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={12}>
                            <Form.Group controlId="address">
                                <Form.Label>
                                    Address <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    isInvalid={!!errors.address}
                                    required
                                    aria-required="true"
                                    aria-describedby="address-error"
                                    placeholder="Enter Address"
                                />
                                <Form.Control.Feedback type="invalid" id="address-error">
                                    {errors.address}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* New District and State Fields */}
                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="state">
                                <Form.Label>
                                    State <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    disabled
                                    aria-label="State field is disabled and prefilled with Uttarakhand"
                                />
                            </Form.Group>
                        </Col>
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
                                    {districtOptions.map(district => (
                                        <option key={district} value={district}>
                                            {district.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid" id="district-error">
                                    {errors.district}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={12}>
                            <Form.Group controlId="short_description">
                                <Form.Label>
                                    Short Description <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="short_description"
                                    value={formData.short_description}
                                    onChange={handleChange}
                                    rows="3"
                                    isInvalid={!!errors.short_description}
                                    required
                                    aria-required="true"
                                    aria-describedby="short_description-error"
                                    placeholder="Enter a brief description about yourself"
                                />
                                <Form.Control.Feedback type="invalid" id="short_description-error">
                                    {errors.short_description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col sm={6}>
                            <Form.Group controlId="occupation">
                                <Form.Label>
                                    Occupation <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    isInvalid={!!errors.occupation}
                                    required
                                    aria-required="true"
                                    aria-describedby="occupation-error"
                                >
                                    <option value="">Select Occupation</option>
                                    <option value="Government">Government</option>
                                    <option value="Private">Private</option>
                                    <option value="Self Employed">Self Employed</option>
                                    <option value="Student">Student</option>
                                    <option value="Others">Others</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid" id="occupation-error">
                                    {errors.occupation}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {formData.occupation && (
                        <div className="border rounded p-3 mb-3 bg-light">
                            {renderConditionalFields()}
                        </div>
                    )}

                    <Row className="mt-4">
                        <Col sm={12} className="text-center">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                className="px-5"
                                aria-label="Submit registration form"
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
                                    'Register'
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )}
        </div>
    );
};

export default Registration;
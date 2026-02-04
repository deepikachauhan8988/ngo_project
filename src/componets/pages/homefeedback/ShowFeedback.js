
import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';

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

	if (loading) return <div>Loading feedbacks...</div>;
	if (error) return <div>{error}</div>;
	if (feedbacks.length === 0) return <div>No feedbacks to show.</div>;

	return (
		<div className="container my-4">
			<h2 className="text-center mb-4">User Feedback</h2>
			<Carousel interval={3000} indicators={false}>
				{feedbacks.map(fb => (
					<Carousel.Item key={fb.id}>
						<div className="row justify-content-center">
							<div className="col-12 text-center">
								<div className="p-4 shadow rounded bg-light">
									<h5 className="mb-2">{fb.full_name}</h5>
									<p className="mb-0">{fb.message}</p>
								</div>
							</div>
						</div>
					</Carousel.Item>
				))}
			</Carousel>
		</div>
	);
}

export default ShowFeedback;

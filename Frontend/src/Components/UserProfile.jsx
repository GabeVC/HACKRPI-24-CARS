import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './UserProfile.css'

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);

  useEffect(() => {
    // Fetch user details
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          username: currentUser.displayName || 'Anonymous',
          email: currentUser.email,
        });
        await fetchUserReviews(currentUser.uid);
      } else {
        setUser(null);
        setUserReviews([]);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserReviews = async (userId) => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
  
      const reviews = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Fetched review data:", data);  // Detailed log for each review document
        return {
          id: doc.id,
          ...data,
        };
      });
      
      setUserReviews(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="user-profile">
      <h2>{user.username}'s Profile</h2>
      <p><strong>Email:</strong> {user.email}</p>

      <h3>Your Reviews</h3>
      {userReviews.length > 0 ? (
        <ul className="review-list">
          {userReviews.map((review) => (
            <li key={review.id} className="review-item">
              <h4>Review for {review.locationId}</h4>
              <p><strong>Content:</strong> {review.reviewContent}</p>
              <p><strong>Overall Score:</strong> {review.overallScore}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews found.</p>
      )}
    </div>
  );
};

export default UserProfile;

"use client";
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Smartphone, MessageSquare, User } from 'lucide-react';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [wantsMobileApp, setWantsMobileApp] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Backend API URL - store in environment variable in production
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cumeal.vercel.app/api';

  // Check if user already submitted feedback
  useEffect(() => {
    const previousFeedback = localStorage.getItem('messFeedbackSubmitted');
    if (previousFeedback) {
      setAlreadySubmitted(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (wantsMobileApp === null) {
      setError('Please select whether you want a mobile app');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          message,
          wantsMobileApp,
          deviceId: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }
      
      // Prevent multiple submissions
      localStorage.setItem('messFeedbackSubmitted', 'true');
      
      // Show success message
      setIsSubmitting(false);
      setHasSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  // If user already submitted feedback
  if (alreadySubmitted) {
    return (
      <div className="bg-amber-50 dark:bg-slate-800 p-6 rounded-xl shadow-md max-w-md mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400">Thank You!</h2>
          <p className="text-slate-700 dark:text-slate-300">
            You've already submitted your feedback. We appreciate your input!
          </p>
        </div>
      </div>
    );
  }

  // If the feedback was just submitted successfully
  if (hasSubmitted) {
    return (
      <div className="bg-amber-50 dark:bg-slate-800 p-6 rounded-xl shadow-md max-w-md mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400">Thank You for Your Feedback!</h2>
          <p className="text-slate-700 dark:text-slate-300">
            We appreciate your input about the mobile application. Your feedback helps us improve!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 p-8 rounded-xl shadow-lg max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400">We Value Your Opinion!</h2>
        <p className="text-slate-700 dark:text-slate-300 mt-2">
          Should we create a mobile application for the hostel mess menu?
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-800 dark:text-red-400">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center text-amber-700 dark:text-amber-400 font-medium">
            <User className="w-5 h-5 mr-2" />
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none transition"
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-amber-700 dark:text-amber-400 font-medium">
            <Smartphone className="w-5 h-5 mr-2" />
            Would you like a mobile app?
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setWantsMobileApp(true)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                wantsMobileApp === true
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setWantsMobileApp(false)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                wantsMobileApp === false
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-amber-700 dark:text-amber-400 font-medium">
            <MessageSquare className="w-5 h-5 mr-2" />
            Additional Feedback (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 outline-none transition min-h-20"
            placeholder="Any suggestions or comments?"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
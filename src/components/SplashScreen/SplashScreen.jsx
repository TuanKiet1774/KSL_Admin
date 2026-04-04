import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen = () => {
    const location = useLocation();
    const [displayText, setDisplayText] = useState('');
    const [isTypingDone, setIsTypingDone] = useState(false);

    // Determine mode
    const isLogout = location.state?.mode === 'logout';
    const isLogin = location.state?.fromLogin;
    
    const fullText = isLogout ? "Hẹn gặp lại..." : "Simply, Your Voice";

    useEffect(() => {
        if (!isLogin && !isLogout) return;

        // Reset text
        setDisplayText('');
        setIsTypingDone(false);

        // Typing Effect logic
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                setDisplayText(fullText.substring(0, index + 1));
                index++;
            } else {
                clearInterval(typingInterval);
                setIsTypingDone(true);
            }
        }, 80); // Speed of typing

        return () => clearInterval(typingInterval);
    }, [fullText, isLogin, isLogout]);

    useEffect(() => {
        if (isTypingDone) {
            // Stay for a moment before transitioning
            const timer = setTimeout(() => {
                if (isLogout) {
                    window.location.href = '/login';
                } else {
                    window.location.href = '/';
                }
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [isTypingDone, isLogout]);

    // Guard: Only allow if coming from Login or Logout trigger
    if (!isLogin && !isLogout) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="splash-screen-container">
            <div className={`splash-screen-content ${isTypingDone ? 'exit-animation' : ''}`}>
                <img src="/Logo_Nobackground.png" alt="Logo" className="splash-screen-logo" />
                <h2 className="splash-screen-text">
                    {displayText}
                    <span className="typing-cursor">|</span>
                </h2>
                <div className="splash-screen-loader"></div>
            </div>
        </div>
    );
};

export default SplashScreen;

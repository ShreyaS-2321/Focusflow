import React, { useState, useEffect, useRef } from 'react';

// Main App component for the Pomodoro Timer
const App = () => {
  // Define work and break durations in seconds
  const WORK_TIME = 60 * 60; // 25 minutes
  const SHORT_BREAK_TIME = 5 * 60; // 5 minutes
  const LONG_BREAK_TIME = 15 * 60; // 15 minutes
  const LONG_BREAK_INTERVAL = 4; // Long break after 4 work sessions

  // State variables for the timer
  const [timer, setTimer] = useState(WORK_TIME); // Current time in seconds
  const [isActive, setIsActive] = useState(false); // Is the timer running?
  const [isBreak, setIsBreak] = useState(false); // Is it a break period?
  const [sessionCount, setSessionCount] = useState(0); // Number of completed work sessions
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [modalMessage, setModalMessage] = useState(''); // Message for the modal

  // useRef to hold the interval ID, preventing re-renders from breaking it
  const intervalRef = useRef(null);

  // useEffect hook for timer logic
  useEffect(() => {
    // If timer is active, start the interval
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          // If timer reaches 0
          if (prevTimer <= 1) { // Check for 1 second to ensure it goes to 0
            clearInterval(intervalRef.current); // Clear the current interval
            setIsActive(false); // Stop the timer

            // Play a sound to indicate session end
            const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3'); // Example sound
            audio.play();

            // Handle session completion
            if (!isBreak) { // If it was a work session
              setSessionCount((prevCount) => prevCount + 1); // Increment session count
              // Check if it's time for a long break
              if ((sessionCount + 1) % LONG_BREAK_INTERVAL === 0) {
                setIsBreak(true);
                setTimer(LONG_BREAK_TIME);
                setModalMessage('Time for a long break!');
              } else {
                setIsBreak(true);
                setTimer(SHORT_BREAK_TIME);
                setModalMessage('Time for a short break!');
              }
            } else { // If it was a break session
              setIsBreak(false);
              setTimer(WORK_TIME);
              setModalMessage('Time to work!');
            }
            setShowModal(true); // Show the modal with the message
            return 0; // Set timer to 0
          }
          return prevTimer - 1; // Decrement timer by 1 second
        });
      }, 1000); // Update every second
    } else {
      // If timer is not active, clear any existing interval
      clearInterval(intervalRef.current);
    }

    // Cleanup function: Clear interval when component unmounts or isActive changes
    return () => clearInterval(intervalRef.current);
  }, [isActive, isBreak, sessionCount]); // Dependencies for useEffect

  // Function to format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handler for Start/Pause button
  const handleStartPause = () => {
    setIsActive(!isActive); // Toggle isActive state
  };

  // Handler for Reset button
  const handleReset = () => {
    clearInterval(intervalRef.current); // Clear any running interval
    setIsActive(false); // Stop the timer
    setIsBreak(false); // Reset to work phase
    setTimer(WORK_TIME); // Reset timer to work duration
    setSessionCount(0); // Reset session count
  };

  // Handler for Skip button (to move to next phase immediately)
  const handleSkip = () => {
    clearInterval(intervalRef.current); // Clear current interval
    setIsActive(false); // Stop the timer

    if (!isBreak) { // If currently in work phase, skip to break
      setSessionCount((prevCount) => prevCount + 1);
      if ((sessionCount + 1) % LONG_BREAK_INTERVAL === 0) {
        setIsBreak(true);
        setTimer(LONG_BREAK_TIME);
      } else {
        setIsBreak(true);
        setTimer(SHORT_BREAK_TIME);
      }
    } else { // If currently in break phase, skip to work
      setIsBreak(false);
      setTimer(WORK_TIME);
    }
    setIsActive(true); // Start the timer for the new phase
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setIsActive(true); // Automatically start the next session after closing modal
  };

  return (
    <div className="min-h-screen bg-blue-300 flex items-center justify-center p-4 font-inter">
      <div className="bg-blue-700 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center text-white ">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
          Pomodoro Timer
        </h1>

        {/* Current phase display */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-semibold opacity-90">
            {isBreak ? 'Break Time!' : 'Work Time!'}
          </p>
          <p className="text-lg opacity-80">
            Session: {sessionCount}
          </p>
        </div>

        {/* Timer display */}
        <div className="text-7xl md:text-8xl font-bold mb-10 drop-shadow-xl">
          {formatTime(timer)}
        </div>

        {/* Control buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleStartPause}
            className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSkip}
            className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Custom Modal for session completion */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm w-full transform transition-all duration-300 scale-100">
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">Session Complete!</h2>
            <p className="text-xl text-gray-800 mb-6">{modalMessage}</p>
            <button
              onClick={handleCloseModal}
              className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

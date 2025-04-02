import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

export default function CelebrationPage() {
  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger the celebration animation as soon as the page loads
  useEffect(() => {
    // Set showCelebration to true as soon as the page loads
    setShowCelebration(true);
    
    // Hide the celebration after 5 seconds
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 5000); // Adjust the time as needed (5000ms = 5 seconds)

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Render the celebration only if showCelebration is true
  if (!showCelebration) {
    return null; // Hide the entire component when the celebration ends
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center">
        {/* Confetti animation */}
        <ReactConfetti />
        {/* Animated Text */}
        <h1 className="text-5xl font-bold text-blue-600 animate-celebration bg-opacity-0">
          🎉 Congratulations! 🎉
        </h1>
      </div>
    </div>
  );
}
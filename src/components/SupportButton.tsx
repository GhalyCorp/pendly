'use client';
import { useState } from 'react';

export default function SupportButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleSupportClick = () => {
    setIsClicked(true);
    
    const subject = encodeURIComponent('Pendly Support Request');
    const body = encodeURIComponent(`Hi there,

I'm having trouble with Pendly and would appreciate your help.

Issue description:
[Please describe your issue here]

Additional details:
- Browser: ${navigator.userAgent}
- Page: ${window.location.href}
- Date: ${new Date().toLocaleDateString()}

Thank you!`);
    
    const mailtoLink = `mailto:adamghaly@pendly.org?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    
    setTimeout(() => setIsClicked(false), 1000);
  };

  return (
    <div className="fixed bottom-6 right-8 z-50">
      {/* Support Tooltip */}
      {isHovered && (
        <div className="absolute bottom-16 right-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 transform transition-all duration-300">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">💬</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Need Help?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Having trouble with Pendly? We&apos;re here to help! Click to send us an email and we&apos;ll get back to you as soon as possible.
              </p>
              <div className="text-xs text-blue-600 font-medium">
                📧 adamghaly@pendly.org
              </div>
            </div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}

      {/* Floating Support Button */}
      <button
        onClick={handleSupportClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 
          rounded-full shadow-lg hover:shadow-xl 
          transform transition-all duration-300 
          flex items-center justify-center
          ${isClicked ? 'scale-95' : 'hover:scale-110'}
          ${isHovered ? 'from-blue-600 to-blue-700' : ''}
        `}
        title="Get Support"
      >
        {/* Main icon */}
        <span className="text-white text-xl">💬</span>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        
        {/* Success checkmark (appears briefly when clicked) */}
        {isClicked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-lg animate-bounce">✓</span>
          </div>
        )}
      </button>
    </div>
  );
} 
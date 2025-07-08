'use client';
import { useState } from 'react';

export default function SearchBarNav({ value, onChangeAction }: { value: string; onChangeAction: (v: string) => void }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full md:w-96">
      {/* Background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl transition-all duration-300 ${
        isFocused ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
      }`}></div>
      
      {/* Main search container */}
      <div className={`relative bg-white border-2 rounded-2xl shadow-lg transition-all duration-300 ${
        isFocused 
          ? 'shadow-2xl shadow-blue-500/25 border-blue-500 scale-105' 
          : 'hover:shadow-xl hover:shadow-blue-500/10 border-gray-200 hover:border-blue-300'
      }`}>
        {/* Search icon */}
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg 
            className={`h-5 w-5 transition-colors duration-300 ${
              isFocused ? 'text-blue-600' : 'text-blue-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        
        {/* Input field */}
        <input
          type="text"
          placeholder="Search businesses and campaigns..."
          value={value}
          onChange={e => onChangeAction(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent border-none outline-none px-4 py-3 pl-12 text-gray-800 placeholder-gray-500 font-medium transition-all duration-300 focus:placeholder-gray-400"
        />
        
        {/* Clear button (appears when there's text) */}
        {value && (
          <button
            onClick={() => onChangeAction('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      
      {/* Animated search indicator */}
      {isFocused && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function LoginBranding() {
  return (
    <div className="login-branding">
      <div className="branding-content">
        <div style={{ marginBottom: 24 }}>
          <svg width="96" height="64" viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg" aria-label="Battery logo">
            <defs>
              <clipPath id="clip">
                <rect x="8" y="12" width="80" height="44" rx="8" ry="8" />
              </clipPath>
            </defs>
            {/* Battery body */}
            <rect x="8" y="12" width="80" height="44" rx="8" ry="8" fill="#ffffff"/>
            {/* Terminals bump */}
            <rect x="38" y="6" width="20" height="8" rx="2" ry="2" fill="#ffffff"/>
            {/* Symbols */}
            <g clipPath="url(#clip)" fill="#1e3a8a">
              {/* minus */}
              <rect x="24" y="32" width="16" height="4" rx="2"/>
              {/* plus */}
              <rect x="58" y="26" width="4" height="16" rx="2"/>
              <rect x="52" y="32" width="16" height="4" rx="2"/>
            </g>
          </svg>
        </div>
        
        <h1 className="branding-title">
          Smart Car Health Monitor
        </h1>
        
        <p className="branding-tagline">
          Your car's health at your fingertips
        </p>
      </div>
    </div>
  );
} 
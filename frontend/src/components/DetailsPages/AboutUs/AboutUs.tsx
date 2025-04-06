import React from 'react';

interface AboutUsProps {
  handleTabLink: (to: string) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({handleTabLink}) => {
  return (
    <div>
      <h1>About Us</h1>
      <p>We are excited to celebrate our special day with you!</p>
      <p>More details coming soon.</p>
    </div>
  );
}

export default AboutUs;
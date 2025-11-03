import React from 'react';

interface UserProfileHeaderProps {
  title: string;
  description?: string;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ 
  title, 
  description 
}) => {
  return (
    <div className="mb-6">
      <h1 
        className="text-2xl font-bold mb-2"
        style={{ color: '#014091' }}
      >
        {title}
      </h1>
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
    </div>
  );
};
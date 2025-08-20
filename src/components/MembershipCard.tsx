import React from 'react';
import { User } from '../types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MembershipCardProps {
  user: User;
  isPreview?: boolean;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ user, isPreview = false }) => {
  return (
    <div 
      id="membership-card" 
      className={`bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-lg shadow-lg ${isPreview ? 'max-w-md mx-auto' : 'w-full max-w-md'}`}
      style={{ minHeight: '350px' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">KMCC Membership Card</h2>
          <div className="w-16 h-1 bg-white mx-auto mt-2"></div>
        </div>

        {/* Photo and Basic Info */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white bg-white/20">
            {user.photo ? (
              <img 
                src={user.photo} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                <span className="text-2xl">👤</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{user.fullName}</h3>
            <p className="text-sm opacity-90">{user.emirate}</p>
            <Badge className="mt-1 bg-white text-blue-700">
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Member Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="opacity-80">Member ID:</span>
            <span className="font-mono">{user.id.substring(0, 8).toUpperCase()}</span>
          </div>
          
          {user.kmccMembershipNumber && (
            <div className="flex justify-between">
              <span className="opacity-80">KMCC No:</span>
              <span className="font-mono">{user.kmccMembershipNumber}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="opacity-80">Emirates ID:</span>
            <span className="font-mono">{user.emiratesId}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="opacity-80">Joined:</span>
            <span>{new Date(user.registrationDate).toLocaleDateString()}</span>
          </div>
          
          {user.mandalam && (
            <div className="flex justify-between">
              <span className="opacity-80">Mandalam:</span>
              <span>{user.mandalam}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 text-center">
          <div className="text-xs opacity-75">
            Kerala Muslim Cultural Centre
          </div>
          <div className="text-xs opacity-60 mt-1">
            Valid until renewed
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
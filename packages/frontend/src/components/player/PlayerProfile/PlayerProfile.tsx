import React from 'react';
import { PlayerProfile } from 'shared';
import MaterialCard from '../../../ui/MaterialCard';

interface PlayerProfileProps {
  profile: PlayerProfile;
}

const PlayerProfileComponent: React.FC<PlayerProfileProps> = ({ profile }) => {
  return (
    <MaterialCard title={`${profile.displayName} - Level ${profile.level}`} subtitle={`${profile.class}`}>
      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">{profile.avatar}</div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Bio</h3>
        <p className="text-gray-300">{profile.bio}</p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Achievements</h3>
        <ul className="list-disc list-inside">
          {profile.achievements.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Titles</h3>
        <ul className="list-disc list-inside">
          {profile.titles.map((title, index) => (
            <li key={index}>{title}</li>
          ))}
        </ul>
      </div>
    </MaterialCard>
  );
};

export default PlayerProfileComponent;

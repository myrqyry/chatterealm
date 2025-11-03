import React from 'react';
import { PlayerProfile } from 'shared';

interface PlayerProfileProps {
  profile: PlayerProfile;
}

const PlayerProfileComponent: React.FC<PlayerProfileProps> = ({ profile }) => {
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">{profile.avatar}</div>
        <div>
          <h2 className="text-2xl font-bold">{profile.displayName}</h2>
          <p className="text-gray-400">Level {profile.level} {profile.class}</p>
        </div>
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
    </div>
  );
};

export default PlayerProfileComponent;

import React from 'react';
import { render, screen } from '@testing-library/react';
import PlayerProfileComponent from './PlayerProfile';
import { PlayerClass, PlayerProfile } from 'shared';

const mockProfile: PlayerProfile = {
  id: '1',
  displayName: 'Test Player',
  avatar: '😊',
  class: PlayerClass.KNIGHT,
  level: 5,
  bio: 'A test player.',
  achievements: ['Achievement 1', 'Achievement 2'],
  titles: ['Title 1', 'Title 2'],
};

describe('PlayerProfileComponent', () => {
  it('renders the player profile information', () => {
    render(<PlayerProfileComponent profile={mockProfile} />);

    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(screen.getByText('Level 5 knight')).toBeInTheDocument();
    expect(screen.getByText('A test player.')).toBeInTheDocument();
    expect(screen.getByText('Achievement 1')).toBeInTheDocument();
    expect(screen.getByText('Title 1')).toBeInTheDocument();
  });
});

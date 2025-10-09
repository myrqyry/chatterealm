import React, { useState } from 'react';
import { PanelState } from './types';
import PlayerStatusCard from './components/PlayerStatusCard';
import AutoWanderControls from './components/AutoWanderControls';
import LootPreferences from './components/LootPreferences';
import CombatStyleSelector from './components/CombatStyleSelector';

const PanelApp: React.FC = () => {
  const [panelState, setPanelState] = useState<PanelState>({
    player: {
        id: '1',
        displayName: 'Stream_Viewer',
        level: 1,
        health: 100,
        maxHealth: 100
    },
    autoWander: false,
    preferredLootTypes: [],
    combatStyle: 'balanced',
    notifications: { deaths: true, levelUps: true, rareItems: true }
  });

  const handleAutoWanderToggle = async () => {
    const newState = !panelState.autoWander;
    setPanelState(prev => ({ ...prev, autoWander: newState }));

    // In a real implementation, this would send a request to the backend
    console.log('Toggled auto-wander to:', newState);
    // await fetch('/api/player/settings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     username: getUsername(), // This would need to be implemented
    //     autoWander: newState,
    //     wanderSettings: {
    //       maxDistance: 5,
    //       avoidHighLevelAreas: true,
    //       prioritizeLoot: panelState.preferredLootTypes
    //     }
    //   })
    // });
  };

  return (
    <div className="panel-container">
      <h1>ChatterRealm</h1>
      <PlayerStatusCard player={panelState.player} />
      <AutoWanderControls
        enabled={panelState.autoWander}
        onToggle={handleAutoWanderToggle}
      />
      <LootPreferences
        preferences={panelState.preferredLootTypes}
        onChange={(prefs) => setPanelState(prev => ({ ...prev, preferredLootTypes: prefs }))}
      />
      <CombatStyleSelector
        style={panelState.combatStyle}
        onChange={(style) => setPanelState(prev => ({ ...prev, combatStyle: style }))}
      />
    </div>
  );
};

export default PanelApp;
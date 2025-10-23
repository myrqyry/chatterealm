import React from 'react';
import { NPC } from '@shared/types/CoveNPC';

interface NpcComponentProps {
  npc: NPC;
  onClick: (npc: NPC) => void;
}

const NpcComponent: React.FC<NpcComponentProps> = ({ npc, onClick }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${npc.position.x * 32}px`,
        top: `${npc.position.y * 32}px`,
        width: '32px',
        height: '32px',
        backgroundColor: 'red',
        textAlign: 'center',
        color: 'white',
      }}
      onClick={() => onClick(npc)}
    >
      {npc.name}
    </div>
  );
};

export default NpcComponent;

import React from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { COLORS } from '../../utils/tokens';

interface SpectatorSidebarProps {
  className?: string;
}

const SpectatorSidebar: React.FC<SpectatorSidebarProps> = ({ className }) => {
  const { gameWorld, currentPlayer } = useGameStore();

  return (
    <div className={[className || '', 'h-full flex flex-col overflow-auto font-inter'].join(' ').trim()}>
      {/* Header */}
      <div className="p-4 border-b border-[rgba(196,167,231,0.2)] bg-[rgba(25,23,36,0.8)]">
        <h2 className="text-text-primary text-lg font-semibold m-0 flex items-center gap-2">👁️ Spectate Mode</h2>
        <p className="text-text-secondary text-sm mt-1">Watching all players and world activity</p>
      </div>

      {/* World Overview */}
      <div className="p-4 space-y-4">
        <div className="bg-[rgba(25,23,36,0.8)] backdrop-blur-md border border-[rgba(196,167,231,0.2)] rounded-lg mb-4">
          <div className="p-4">
            <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">🌍 World Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-text-secondary"><strong>Phase:</strong> {gameWorld?.phase || 'Unknown'}</div>
              <div className="text-text-secondary"><strong>Players:</strong> {gameWorld?.players?.length || 0}</div>
              <div className="text-text-secondary"><strong>NPCs:</strong> {gameWorld?.npcs?.length || 0}</div>
              <div className="text-text-secondary"><strong>Items:</strong> {gameWorld?.items?.length || 0}</div>
              <div className="text-text-secondary col-span-2"><strong>World Age:</strong> {gameWorld?.worldAge || 0} cycles</div>
              <div className="text-text-secondary col-span-2"><strong>Cataclysm:</strong> {gameWorld?.cataclysmCircle?.isActive ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        </div>

        {/* All Players */}
        <div className="bg-[rgba(25,23,36,0.8)] backdrop-blur-md border border-[rgba(196,167,231,0.2)] rounded-lg mb-4">
          <div className="p-4">
            <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">👥 All Players ({gameWorld?.players?.length || 0})</h3>
            <div className="flex flex-col gap-2">
              {gameWorld?.players?.map(player => (
                <Link to={`/profile/${player.id}`} key={player.id} className={
                  `rounded-md p-3 border text-sm ` +
                  (currentPlayer?.id === player.id
                    ? 'bg-[rgba(196,167,231,0.1)] border-[rgba(196,167,231,0.3)]'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]')
                }>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{player.avatar}</span>
                    <div>
                      <div className="text-text-primary font-medium text-sm">
                        {player.name}
                        {currentPlayer?.id === player.id && (
                          <span className="ml-2 text-[0.7rem] h-4 inline-flex items-center px-2 rounded bg-[rgba(196,167,231,0.2)] text-text-primary">You</span>
                        )}
                      </div>
                      <div className="text-text-secondary text-xs">Level {player.level} {player.class}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="text-text-secondary"><strong>HP:</strong> {player.health}/{player.stats?.maxHp || 100}</div>
                    <div className="text-text-secondary"><strong>Pos:</strong> {player.position.x},{player.position.y}</div>
                    <div className="text-text-secondary"><strong>XP:</strong> {player.experience}</div>
                    <div className="text-text-secondary"><strong>Buffs:</strong> {player.buffs?.length ? player.buffs.join(', ') : 'None'}</div>
                  </div>
                </Link>
              )) || (
                <div className="text-text-secondary text-center p-5 text-sm">No players in game</div>
              )}
            </div>
          </div>
        </div>

        {/* NPCs */}
        <div className="bg-[rgba(25,23,36,0.8)] backdrop-blur-md border border-[rgba(196,167,231,0.2)] rounded-lg mb-4">
          <div className="p-4">
            <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">🤖 NPCs ({gameWorld?.npcs?.length || 0})</h3>
            <div className="flex flex-col gap-2">
              {gameWorld?.npcs?.slice(0, 10).map(npc => (
                <div key={npc.id} className="bg-[rgba(255,255,255,0.03)] rounded-md p-2 text-xs">
                  <div className="text-text-primary font-medium">{npc.name} ({npc.type})</div>
                  <div className="text-text-secondary">Pos: {npc.position.x},{npc.position.y} | HP: {npc.stats.hp}</div>
                </div>
              )) || (
                <div className="text-text-secondary text-center p-2 text-xs">No NPCs</div>
              )}
              {(gameWorld?.npcs?.length || 0) > 10 && (
                <div className="text-text-secondary text-center text-xs mt-2">... and {(gameWorld?.npcs?.length || 0) - 10} more</div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-[rgba(25,23,36,0.8)] backdrop-blur-md border border-[rgba(196,167,231,0.2)] rounded-lg">
          <div className="p-4">
            <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">🎒 Items ({gameWorld?.items?.length || 0})</h3>
            <div className="flex flex-col gap-2">
              {gameWorld?.items?.slice(0, 15).map(item => (
                <div key={item.id} className="bg-[rgba(255,255,255,0.03)] rounded-md p-2 text-xs">
                  <div className="text-text-primary font-medium">{item.name} ({item.type})</div>
                  <div className="text-text-secondary">Pos: {item.position.x},{item.position.y} | Rarity: {item.rarity}</div>
                </div>
              )) || (
                <div className="text-text-secondary text-center p-2 text-xs">No items</div>
              )}
              {(gameWorld?.items?.length || 0) > 15 && (
                <div className="text-text-secondary text-center text-xs mt-2">... and {(gameWorld?.items?.length || 0) - 15} more</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorSidebar;

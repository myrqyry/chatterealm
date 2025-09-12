import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MaterialCard, MaterialChip } from '../index';
import { COLORS } from '../../constants/colors';

interface SpectatorSidebarProps {
  className?: string;
}

const SpectatorSidebar: React.FC<SpectatorSidebarProps> = ({ className }) => {
  const { gameWorld, currentPlayer } = useGameStore();

  return (
    <div className={className} style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, Roboto, sans-serif',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(196, 167, 231, 0.2)',
        background: 'rgba(25, 23, 36, 0.8)'
      }}>
        <h2 style={{
          color: 'var(--color-text-primary)',
          fontSize: '1.2em',
          fontWeight: '600',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👁️ Spectate Mode
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.9em',
          margin: '4px 0 0 0'
        }}>
          Watching all players and world activity
        </p>
      </div>

      {/* World Overview */}
      <div style={{ padding: '16px 20px' }}>
        <MaterialCard sx={{
          backgroundColor: 'rgba(25, 23, 36, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(196, 167, 231, 0.2)',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{
              color: 'var(--color-text-primary)',
              fontSize: '1em',
              fontWeight: '600',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🌍 World Status
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '0.85em'
            }}>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Phase:</strong> {gameWorld?.phase || 'Unknown'}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Players:</strong> {gameWorld?.players?.length || 0}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                <strong>NPCs:</strong> {gameWorld?.npcs?.length || 0}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Items:</strong> {gameWorld?.items?.length || 0}
              </div>
              <div style={{
                color: 'var(--color-text-secondary)',
                gridColumn: '1 / -1'
              }}>
                <strong>World Age:</strong> {gameWorld?.worldAge || 0} cycles
              </div>
              <div style={{
                color: 'var(--color-text-secondary)',
                gridColumn: '1 / -1'
              }}>
                <strong>Cataclysm:</strong> {gameWorld?.cataclysmCircle?.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </MaterialCard>

        {/* All Players */}
        <MaterialCard sx={{
          backgroundColor: 'rgba(25, 23, 36, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(196, 167, 231, 0.2)',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{
              color: 'var(--color-text-primary)',
              fontSize: '1em',
              fontWeight: '600',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👥 All Players ({gameWorld?.players?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gameWorld?.players?.map(player => (
                <div key={player.id} style={{
                  background: currentPlayer?.id === player.id ? 'rgba(196, 167, 231, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: currentPlayer?.id === player.id ? '1px solid rgba(196, 167, 231, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '1.2em' }}>{player.avatar}</span>
                    <div>
                      <div style={{
                        color: 'var(--color-text-primary)',
                        fontWeight: '500',
                        fontSize: '0.9em'
                      }}>
                        {player.name}
                        {currentPlayer?.id === player.id && (
                          <MaterialChip
                            label="You"
                            size="small"
                            sx={{
                              ml: 1,
                              fontSize: '0.7em',
                              height: '16px',
                              backgroundColor: 'rgba(196, 167, 231, 0.2)',
                              color: 'var(--color-text-primary)'
                            }}
                          />
                        )}
                      </div>
                      <div style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.8em'
                      }}>
                        Level {player.level} {player.class}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    fontSize: '0.8em'
                  }}>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      <strong>HP:</strong> {player.health}/{player.stats?.maxHp || 100}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      <strong>Pos:</strong> {player.position.x},{player.position.y}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      <strong>XP:</strong> {player.experience}
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      <strong>Buffs:</strong> {player.buffs?.length ? player.buffs.join(', ') : 'None'}
                    </div>
                  </div>
                </div>
              )) || (
                <div style={{
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  padding: '20px',
                  fontSize: '0.9em'
                }}>
                  No players in game
                </div>
              )}
            </div>
          </div>
        </MaterialCard>

        {/* NPCs */}
        <MaterialCard sx={{
          backgroundColor: 'rgba(25, 23, 36, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(196, 167, 231, 0.2)',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{
              color: 'var(--color-text-primary)',
              fontSize: '1em',
              fontWeight: '600',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🤖 NPCs ({gameWorld?.npcs?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gameWorld?.npcs?.slice(0, 10).map(npc => (
                <div key={npc.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '0.8em'
                }}>
                  <div style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>
                    {npc.name} ({npc.type})
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    Pos: {npc.position.x},{npc.position.y} | HP: {npc.stats.hp}
                  </div>
                </div>
              )) || (
                <div style={{
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  padding: '10px',
                  fontSize: '0.8em'
                }}>
                  No NPCs
                </div>
              )}
              {(gameWorld?.npcs?.length || 0) > 10 && (
                <div style={{
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  fontSize: '0.8em',
                  marginTop: '8px'
                }}>
                  ... and {(gameWorld?.npcs?.length || 0) - 10} more
                </div>
              )}
            </div>
          </div>
        </MaterialCard>

        {/* Items */}
        <MaterialCard sx={{
          backgroundColor: 'rgba(25, 23, 36, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(196, 167, 231, 0.2)',
          borderRadius: '12px'
        }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{
              color: 'var(--color-text-primary)',
              fontSize: '1em',
              fontWeight: '600',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎒 Items ({gameWorld?.items?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gameWorld?.items?.slice(0, 15).map(item => (
                <div key={item.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '0.8em'
                }}>
                  <div style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>
                    {item.name} ({item.type})
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    Pos: {item.position.x},{item.position.y} | Rarity: {item.rarity}
                  </div>
                </div>
              )) || (
                <div style={{
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  padding: '10px',
                  fontSize: '0.8em'
                }}>
                  No items
                </div>
              )}
              {(gameWorld?.items?.length || 0) > 15 && (
                <div style={{
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                  fontSize: '0.8em',
                  marginTop: '8px'
                }}>
                  ... and {(gameWorld?.items?.length || 0) - 15} more
                </div>
              )}
            </div>
          </div>
        </MaterialCard>
      </div>
    </div>
  );
};

export default SpectatorSidebar;
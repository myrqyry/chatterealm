import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Player } from 'shared/src/types/game';

interface EnhancedPlayerStatusProps {
  player: Player;
}

const EnhancedPlayerStatus: React.FC<EnhancedPlayerStatusProps> = ({ player }) => {
  const [previousStats, setPreviousStats] = useState(player.stats);
  const healthBarRef = useRef<HTMLDivElement>(null);
  const expBarRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);

  // Animate health bar changes
  useEffect(() => {
    if (healthBarRef.current) {
      const healthPercentage = (player.stats.hp / player.stats.maxHp) * 100;
      
      gsap.to(healthBarRef.current, {
        width: `${healthPercentage}%`,
        duration: 0.8,
        ease: "power2.out"
      });

      // Flash red if health decreased
      if (player.stats.hp < previousStats.hp) {
        gsap.fromTo(healthBarRef.current, 
          { backgroundColor: '#ff4444' },
          { backgroundColor: '#e74c3c', duration: 0.5, ease: "power2.out" }
        );
      }
    }
  }, [player.stats.hp, player.stats.maxHp, previousStats.hp]);

  // Animate experience bar changes
  useEffect(() => {
    if (expBarRef.current) {
      const expPercentage = (player.experience % 100);
      
      gsap.to(expBarRef.current, {
        width: `${expPercentage}%`,
        duration: 1.2,
        ease: "power2.out"
      });

      // Level up effect
      if (player.level > Math.floor(previousStats.hp / 100)) {
        gsap.fromTo(expBarRef.current,
          { boxShadow: '0 0 20px #f39c12' },
          { boxShadow: '0 0 0px #f39c12', duration: 2, ease: "power2.out" }
        );
      }
    }
  }, [player.experience, player.level, previousStats]);

  // Avatar breathing animation
  useEffect(() => {
    if (avatarRef.current) {
      gsap.to(avatarRef.current, {
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
  }, []);

  // Stats change animation
  useEffect(() => {
    if (statsContainerRef.current) {
      const hasStatsChanged = 
        player.stats.attack !== previousStats.attack ||
        player.stats.defense !== previousStats.defense ||
        player.stats.speed !== previousStats.speed;

      if (hasStatsChanged) {
        gsap.fromTo(statsContainerRef.current,
          { scale: 1.05, boxShadow: '0 0 15px rgba(46, 204, 113, 0.5)' },
          { scale: 1, boxShadow: '0 0 0px rgba(46, 204, 113, 0)', duration: 1, ease: "power2.out" }
        );
      }
    }

    setPreviousStats(player.stats);
  }, [player.stats, previousStats]);

  // Calculate health status for color coding
  const getHealthStatus = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100;
    if (percentage > 75) return 'healthy';
    if (percentage > 50) return 'wounded';
    if (percentage > 25) return 'critical';
    return 'dying';
  };

  const healthStatus = getHealthStatus(player.stats.hp, player.stats.maxHp);

  // Calculate stat bars for visual representation
  const getStatBarWidth = (stat: number, max: number = 50) => {
    return Math.min((stat / max) * 100, 100);
  };

  return (
    <div className="enhanced-player-status">
      {/* Player Header */}
      <div className="player-header">
        <div ref={avatarRef} className="enhanced-avatar">
          {player.avatar}
        </div>
        <div className="player-identity">
          <h3 className="player-name">{player.displayName}</h3>
          <div className="player-class-level">
            <span className={`class-badge class-${player.class}`}>{player.class}</span>
            <span className="level-indicator">Level {player.level}</span>
          </div>
          <div className="position-indicator">
            📍 ({player.position.x}, {player.position.y})
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="stat-section">
        <div className="stat-label">
          <span>Health</span>
          <span className={`health-value ${healthStatus}`}>
            {player.stats.hp}/{player.stats.maxHp}
          </span>
        </div>
        <div className={`stat-bar-container health-bar ${healthStatus}`}>
          <div
            ref={healthBarRef}
            className="stat-bar-fill health-fill"
            style={{ width: `${(player.stats.hp / player.stats.maxHp) * 100}%` }}
          />
          <div className="stat-bar-gradient" />
        </div>
      </div>

      {/* Experience Bar */}
      <div className="stat-section">
        <div className="stat-label">
          <span>Experience</span>
          <span className="exp-value">{player.experience} XP</span>
        </div>
        <div className="stat-bar-container exp-bar">
          <div
            ref={expBarRef}
            className="stat-bar-fill exp-fill"
            style={{ width: `${player.experience % 100}%` }}
          />
          <div className="stat-bar-gradient" />
        </div>
      </div>

      {/* Combat Stats */}
      <div ref={statsContainerRef} className="combat-stats">
        <h4>Combat Stats</h4>
        <div className="stats-grid">
          {/* Attack Stat */}
          <div className="stat-item enhanced">
            <div className="stat-info">
              <span className="stat-icon">⚔️</span>
              <span className="stat-name">Attack</span>
              <span className="stat-value">{player.stats.attack}</span>
            </div>
            <div className="stat-bar-mini">
              <div 
                className="stat-bar-fill attack-fill"
                style={{ width: `${getStatBarWidth(player.stats.attack)}%` }}
              />
            </div>
          </div>

          {/* Defense Stat */}
          <div className="stat-item enhanced">
            <div className="stat-info">
              <span className="stat-icon">🛡️</span>
              <span className="stat-name">Defense</span>
              <span className="stat-value">{player.stats.defense}</span>
            </div>
            <div className="stat-bar-mini">
              <div 
                className="stat-bar-fill defense-fill"
                style={{ width: `${getStatBarWidth(player.stats.defense)}%` }}
              />
            </div>
          </div>

          {/* Speed Stat */}
          <div className="stat-item enhanced">
            <div className="stat-info">
              <span className="stat-icon">💨</span>
              <span className="stat-name">Speed</span>
              <span className="stat-value">{player.stats.speed}</span>
            </div>
            <div className="stat-bar-mini">
              <div 
                className="stat-bar-fill speed-fill"
                style={{ width: `${getStatBarWidth(player.stats.speed)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Effects (placeholder for future implementation) */}
      <div className="status-effects">
        <h4>Status Effects</h4>
        <div className="effects-container">
          {player.isAlive ? (
            <div className="status-effect active">
              <span className="effect-icon">💚</span>
              <span className="effect-name">Alive</span>
            </div>
          ) : (
            <div className="status-effect negative">
              <span className="effect-icon">💀</span>
              <span className="effect-name">Deceased</span>
            </div>
          )}
          
          {/* Add more status effects based on game mechanics */}
          {player.stats.hp < player.stats.maxHp * 0.3 && (
            <div className="status-effect negative">
              <span className="effect-icon">🩸</span>
              <span className="effect-name">Badly Wounded</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-button heal" disabled={player.stats.hp === player.stats.maxHp}>
          <span className="action-icon">❤️</span>
          Heal
        </button>
        <button className="action-button rest">
          <span className="action-icon">💤</span>
          Rest
        </button>
      </div>
    </div>
  );
};

export default EnhancedPlayerStatus;
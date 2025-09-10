import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SettingSlider } from '../shared/settings';
import { MaterialCard } from '../index';

const WorldModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { unifiedSettings, updateWorldSettings } = useGameStore();

  return (
    <div style={{
      padding: '24px',
      height: '100%',
      overflow: 'auto',
      fontFamily: 'JetBrains Mono',
      background: 'linear-gradient(145deg, rgba(25, 23, 36, 0.95) 0%, rgba(31, 29, 46, 0.9) 100%)'
    }}>
      {/* Modal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid rgba(0, 188, 212, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🌍</span>
          </div>
          <div>
            <h1 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.8rem',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              World
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 400
            }}>
              Environment and world generation
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            minWidth: '40px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 188, 212, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 188, 212, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 188, 212, 0.15)',
              borderColor: 'rgba(0, 188, 212, 0.3)'
            }
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>📐</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              World Dimensions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SettingSlider
              label="World Width"
              value={unifiedSettings.world.worldWidth}
              min={20} max={100} step={5}
              onChange={(v) => updateWorldSettings({ worldWidth: v })}
              unit=" tiles" showReset resetValue={40}
              description="Horizontal size"
            />
            <SettingSlider
              label="World Height"
              value={unifiedSettings.world.worldHeight}
              min={15} max={75} step={3}
              onChange={(v) => updateWorldSettings({ worldHeight: v })}
              unit=" tiles" showReset resetValue={30}
              description="Vertical size"
            />
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 188, 212, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 188, 212, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 188, 212, 0.15)',
              borderColor: 'rgba(0, 188, 212, 0.3)'
            }
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🌿</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Environment Animation
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SettingSlider
              label="Grass Wave Speed"
              value={unifiedSettings.world.grassWaveSpeed}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ grassWaveSpeed: v })}
              showReset resetValue={0.1}
              description="Grass sway speed"
            />
            <SettingSlider
              label="Tree Sway Speed"
              value={unifiedSettings.world.treeSwaySpeed}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ treeSwaySpeed: v })}
              showReset resetValue={0.03}
              description="Tree movement speed"
            />
            <SettingSlider
              label="Flower Spawn Rate"
              value={unifiedSettings.world.flowerSpawnRate}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ flowerSpawnRate: v })}
              showReset resetValue={0.01}
              description="Spawn rate of flowers"
            />
            <SettingSlider
              label="Wind Speed"
              value={unifiedSettings.world.windSpeed}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ windSpeed: v })}
              showReset resetValue={0.02}
              description="Global wind agitation"
            />
          </div>
        </MaterialCard>
      </div>
    </div>
  );
};

export default WorldModal;

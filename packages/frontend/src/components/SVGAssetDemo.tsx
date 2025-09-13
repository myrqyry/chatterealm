import React, { useState, useRef, useEffect } from 'react';
import { MaterialAppBar, MaterialCard, MaterialButton, MaterialChip } from './index';
import { assetConverter, AssetConversionOptions } from '../services/assetConverter';

const SVGAssetDemo: React.FC = () => {
  const [inputSvg, setInputSvg] = useState<string>('');
  const [convertedSvg, setConvertedSvg] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string>('');
  const [conversionOptions, setConversionOptions] = useState<AssetConversionOptions>({
    roughness: 1,
    bowing: 1,
    randomize: true,
    backgroundColor: 'transparent',
    pencilFilter: false,
    sketchPatterns: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample SVG examples
  const sampleSvgs = {
    sword: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#C0C0C0"/>
          <stop offset="50%" style="stop-color:#FFFFFF"/>
          <stop offset="100%" style="stop-color:#C0C0C0"/>
        </linearGradient>
        <linearGradient id="handle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#8B4513"/>
          <stop offset="100%" style="stop-color:#654321"/>
        </linearGradient>
      </defs>
      <rect x="45" y="10" width="10" height="60" fill="url(#blade)" stroke="#666" stroke-width="1"/>
      <rect x="40" y="70" width="20" height="20" fill="url(#handle)" stroke="#654321" stroke-width="1"/>
      <circle cx="50" cy="75" r="2" fill="#FFD700"/>
      <circle cx="50" cy="85" r="2" fill="#FFD700"/>
    </svg>`,
    shield: `<svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shield" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:#4682B4"/>
          <stop offset="70%" style="stop-color:#1e40af"/>
          <stop offset="100%" style="stop-color:#1e3a8a"/>
        </radialGradient>
      </defs>
      <path d="M50 10 L80 30 L80 90 L50 110 L20 90 L20 30 Z" fill="url(#shield)" stroke="#1e3a8a" stroke-width="2"/>
      <circle cx="50" cy="50" r="15" fill="#FFD700" opacity="0.8"/>
      <path d="M35 35 L50 50 L65 35" stroke="#FFD700" stroke-width="3" fill="none"/>
      <path d="M35 65 L50 50 L65 65" stroke="#FFD700" stroke-width="3" fill="none"/>
    </svg>`,
    potion: `<svg width="60" height="100" viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="liquid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B"/>
          <stop offset="50%" style="stop-color:#4ECDC4"/>
          <stop offset="100%" style="stop-color:#45B7D1"/>
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="20" height="60" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      <rect x="15" y="15" width="30" height="10" fill="#654321"/>
      <rect x="22" y="22" width="16" height="50" fill="url(#liquid)"/>
      <circle cx="30" cy="35" r="8" fill="#FF6B6B" opacity="0.7"/>
      <circle cx="30" cy="50" r="6" fill="#4ECDC4" opacity="0.6"/>
      <circle cx="30" cy="65" r="4" fill="#45B7D1" opacity="0.5"/>
    </svg>`,
    castle: `<svg width="120" height="100" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#D3D3D3"/>
          <stop offset="50%" style="stop-color:#A9A9A9"/>
          <stop offset="100%" style="stop-color:#808080"/>
        </linearGradient>
      </defs>
      <!-- Main building -->
      <rect x="20" y="40" width="80" height="50" fill="url(#stone)" stroke="#696969" stroke-width="1"/>
      <!-- Towers -->
      <rect x="10" y="20" width="20" height="70" fill="url(#stone)" stroke="#696969" stroke-width="1"/>
      <rect x="90" y="20" width="20" height="70" fill="url(#stone)" stroke="#696969" stroke-width="1"/>
      <!-- Tower tops -->
      <rect x="5" y="15" width="30" height="10" fill="#654321"/>
      <rect x="85" y="15" width="30" height="10" fill="#654321"/>
      <!-- Windows -->
      <rect x="35" y="50" width="10" height="15" fill="#87CEEB"/>
      <rect x="55" y="50" width="10" height="15" fill="#87CEEB"/>
      <rect x="75" y="50" width="10" height="15" fill="#87CEEB"/>
      <!-- Door -->
      <rect x="45" y="70" width="15" height="20" fill="#654321"/>
      <circle cx="47" cy="75" r="1" fill="#FFD700"/>
    </svg>`
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputSvg(content);
        setError('');
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid SVG file');
    }
  };

  const handleConvert = async () => {
    if (!inputSvg.trim()) {
      setError('Please provide SVG content first');
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      const result = await assetConverter.convertSvgToRough(inputSvg, conversionOptions);
      setConvertedSvg(result.svg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const loadSample = (name: keyof typeof sampleSvgs) => {
    setInputSvg(sampleSvgs[name]);
    setConvertedSvg('');
    setError('');
  };

  const applyPreset = (preset: 'sketch' | 'cartoon' | 'technical' | 'wild') => {
    const options = assetConverter.getPresetOptions(preset);
    setConversionOptions(options);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-primary)',
      padding: '20px'
    }}>
      {/* Header */}
      <MaterialAppBar
        sx={{
          backgroundColor: 'rgba(25, 23, 36, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(196, 167, 231, 0.2)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{
            margin: 0,
            color: 'var(--color-text-primary)',
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            🎨 SVG Asset Converter
          </h1>
          <MaterialChip
            label="svg2roughjs"
            size="small"
            sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
      </MaterialAppBar>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Left Column - Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sample SVGs */}
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                📚 Sample Assets
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {Object.keys(sampleSvgs).map((key) => (
                  <MaterialButton
                    key={key}
                    onClick={() => loadSample(key as keyof typeof sampleSvgs)}
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(196, 167, 231, 0.5)',
                      color: 'var(--color-text-primary)',
                      '&:hover': {
                        borderColor: 'rgba(196, 167, 231, 0.8)',
                        backgroundColor: 'rgba(196, 167, 231, 0.1)'
                      }
                    }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </MaterialButton>
                ))}
              </div>
            </div>
          </MaterialCard>

          {/* File Upload */}
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                📁 Upload SVG
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <MaterialButton
                onClick={() => fileInputRef.current?.click()}
                variant="outlined"
                sx={{
                  borderColor: 'rgba(196, 167, 231, 0.5)',
                  color: 'var(--color-text-primary)',
                  '&:hover': {
                    borderColor: 'rgba(196, 167, 231, 0.8)',
                    backgroundColor: 'rgba(196, 167, 231, 0.1)'
                  }
                }}
              >
                Choose SVG File
              </MaterialButton>
            </div>
          </MaterialCard>

          {/* Conversion Options */}
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                ⚙️ Conversion Options
              </h3>

              {/* Presets */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                  Presets
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(['sketch', 'cartoon', 'technical', 'wild'] as const).map((preset) => (
                    <MaterialChip
                      key={preset}
                      label={preset.charAt(0).toUpperCase() + preset.slice(1)}
                      onClick={() => applyPreset(preset)}
                      sx={{
                        backgroundColor: 'rgba(196, 167, 231, 0.2)',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(196, 167, 231, 0.4)'
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Manual Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Roughness: {conversionOptions.roughness}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={conversionOptions.roughness}
                    onChange={(e) => setConversionOptions(prev => ({
                      ...prev,
                      roughness: parseFloat(e.target.value)
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Bowing: {conversionOptions.bowing}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={conversionOptions.bowing}
                    onChange={(e) => setConversionOptions(prev => ({
                      ...prev,
                      bowing: parseFloat(e.target.value)
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={conversionOptions.randomize || false}
                    onChange={(e) => setConversionOptions(prev => ({
                      ...prev,
                      randomize: e.target.checked
                    }))}
                  />
                  Randomize
                </label>
              </div>

              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={conversionOptions.pencilFilter || false}
                    onChange={(e) => setConversionOptions(prev => ({
                      ...prev,
                      pencilFilter: e.target.checked
                    }))}
                  />
                  Pencil Filter
                </label>
              </div>
            </div>
          </MaterialCard>

          {/* Convert Button */}
          <MaterialButton
            onClick={handleConvert}
            disabled={!inputSvg.trim() || isConverting}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(196, 167, 231, 0.8)',
              color: 'white',
              fontSize: '1.1rem',
              padding: '15px',
              '&:hover': {
                backgroundColor: 'rgba(196, 167, 231, 1)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(196, 167, 231, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            {isConverting ? '🔄 Converting...' : '🎨 Convert to Rough!'}
          </MaterialButton>

          {error && (
            <div style={{
              color: '#ff6b6b',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.3)'
            }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* Right Column - Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Original SVG */}
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                📄 Original SVG
              </h3>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {inputSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: inputSvg }} />
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Load a sample or upload an SVG to see the original
                  </p>
                )}
              </div>
            </div>
          </MaterialCard>

          {/* Converted Rough SVG */}
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px' }}>
                🎨 Rough Conversion
              </h3>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {convertedSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: convertedSvg }} />
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {isConverting ? 'Converting...' : 'Convert an SVG to see the rough version'}
                  </p>
                )}
              </div>
            </div>
          </MaterialCard>
        </div>
      </div>
    </div>
  );
};

export default SVGAssetDemo;
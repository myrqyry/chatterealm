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
  const [githubRepo, setGithubRepo] = useState<string>('https://github.com/googlefonts/noto-emoji/tree/main/svg');
  const [githubSvgs, setGithubSvgs] = useState<Array<{name: string, url: string, path: string}>>([]);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [svgmojiEmojis, setSvgmojiEmojis] = useState<Array<{name: string, svg: string, unicode: string}>>([]);
  const [selectedSvgmojiCollection, setSelectedSvgmojiCollection] = useState<string>('noto');
  const [isLoadingSvgmoji, setIsLoadingSvgmoji] = useState(false);

  // Preset repositories with SVG assets
  const presetRepos = [
    {
      name: 'Noto Emoji SVGs',
      url: 'https://github.com/googlefonts/noto-emoji/tree/main/svg',
      description: 'Google\'s complete emoji set as SVG files'
    },
    {
      name: 'SVGmoji',
      url: 'https://github.com/svgmoji/svgmoji',
      description: 'High-quality SVG emoji collection'
    },
    {
      name: 'Game Icons',
      url: 'https://github.com/game-icons/icons',
      description: 'Open-source game icons and symbols'
    },
    {
      name: 'Hero Icons',
      url: 'https://github.com/tailwindlabs/heroicons',
      description: 'Beautiful hand-crafted SVG icons'
    }
  ];

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

  const fetchGithubSvgs = async () => {
    let repoUrl = githubRepo.trim();

    // Handle tree URLs by converting them to API-compatible format
    if (repoUrl.includes('/tree/')) {
      repoUrl = repoUrl.replace('/tree/', '/');
    }

    if (!repoUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setIsLoadingGithub(true);
    setError('');

    try {
      // Parse GitHub URL to get owner/repo/path
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/(.*))?/);
      if (!repoMatch) {
        throw new Error('Invalid GitHub repository URL. Use format: https://github.com/owner/repo or https://github.com/owner/repo/tree/main/path');
      }

      const [, owner, repo, path = ''] = repoMatch;

      // Fetch repository contents from GitHub API
      const apiUrl = path
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        : `https://api.github.com/repos/${owner}/${repo}/contents`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch repository contents. Make sure the repository exists and is public.');
      }

      const contents = await response.json();

      // Filter for SVG files
      const svgFiles = contents
        .filter((item: any) => item.type === 'file' && item.name.toLowerCase().endsWith('.svg'))
        .map((item: any) => ({
          name: item.name,
          url: item.download_url,
          path: item.path
        }));

      setGithubSvgs(svgFiles);

      if (svgFiles.length === 0) {
        setError('No SVG files found in this repository/directory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub repository');
    } finally {
      setIsLoadingGithub(false);
    }
  };

  const loadGithubSvg = async (svgUrl: string, svgName: string) => {
    try {
      const response = await fetch(svgUrl);
      if (!response.ok) {
        throw new Error('Failed to load SVG file');
      }

      const svgContent = await response.text();
      setInputSvg(svgContent);
      setConvertedSvg('');
      setError('');
    } catch (err) {
      setError(`Failed to load ${svgName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const loadSvgmojiCollection = async (collection: string) => {
    setIsLoadingSvgmoji(true);
    setError('');

    try {
      // For now, use some sample SVG emojis that we can create or fetch
      // This is a simplified version until we get the full SVGmoji integration working
      const sampleEmojis = [
        {
          name: '�',
          svg: `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path fill="#FFCC4D" d="M36 18c0 9.941-8.059 18-18 18S0 27.941 0 18 8.059 0 18 0s18 8.059 18 18"/><path fill="#664500" d="M18 21c-3.623 0-6.027-.422-9-1-.679-.131-.828.349-.828.349s.149 2.516 9 2.516c8.752 0 9-2.516 9-2.516S21.623 20.969 18 21"/><path fill="#664500" d="M6 14c.5 1 2.5 2 6 2s5.5-1 6-2c.5-1 1.5-2 3-2s2.5 1 3 2c.5 1 2.5 2 6 2s5.5-1 6-2"/><circle fill="#664500" cx="9" cy="13" r="2"/><circle fill="#664500" cx="27" cy="13" r="2"/></svg>`,
          unicode: '😀'
        },
        {
          name: '❤️',
          svg: `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path fill="#DD2E44" d="M35.885 11.833c0-5.45-4.418-9.868-9.867-9.868-3.308 0-6.227 1.633-8.018 4.129-1.79-2.496-4.71-4.129-8.017-4.129-5.45 0-9.868 4.418-9.868 9.868 0 .772.098 1.52.266 2.241C1.751 22.587 11.216 31.568 18 34.034c6.783-2.466 16.249-11.447 17.617-19.959.17-.721.268-1.469.268-2.242z"/></svg>`,
          unicode: '❤️'
        },
        {
          name: '👍',
          svg: `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><path fill="#FFCC4D" d="M34.956 17.916c0-.503-.104-.976-.278-1.42-.407-1.025-.766-2.1-.766-3.275 0-4.57-3.711-8.281-8.281-8.281-.579 0-1.137.076-1.669.209-.304-.664-.859-1.13-1.559-1.13-.854 0-1.547.693-1.547 1.547 0 .211.042.411.118.594-.549-.119-1.125-.188-1.722-.188-4.57 0-8.281 3.711-8.281 8.281 0 1.175-.359 2.25-.766 3.275-.174.444-.278.917-.278 1.42 0 1.206.489 2.291 1.27 3.071.781.781 1.865 1.27 3.071 1.27h8.562c1.206 0 2.291-.489 3.071-1.27.781-.781 1.27-1.865 1.27-3.071z"/><path fill="#664500" d="M18 25.5c-2.25 0-4.5.75-6 2.25-.75.75-1.5 2.25-1.5 3 0 1.5 1.5 3 3 3s3-1.5 3-3c0-.75-.75-2.25-1.5-3-.75-.75-1.5-1.5-3-1.5z"/></svg>`,
          unicode: '👍'
        }
      ];

      setSvgmojiEmojis(sampleEmojis);
      setSelectedSvgmojiCollection(collection);
    } catch (err) {
      setError(`Failed to load ${collection} collection: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingSvgmoji(false);
    }
  };

  const loadSvgmojiEmoji = (emoji: {name: string, svg: string, unicode: string}) => {
    setInputSvg(emoji.svg);
    setConvertedSvg('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background-primary p-5">
      {/* Header */}
      <MaterialAppBar
        sx={{
          backgroundColor: 'rgba(25, 23, 36, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(196, 167, 231, 0.2)',
          marginBottom: '20px'
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-text-primary text-2xl font-bold">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-7xl mx-auto">
        {/* Left Column - Input */}
        <div className="flex flex-col gap-5">
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div className="p-5">
              <h3 className="text-text-primary mb-4">
                📚 Sample Assets, GitHub & Noto Emoji
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Load SVGs from GitHub repositories and convert them with svg2roughjs! 🎨
                <br />
                <em>Perfect for game assets, icons, and custom illustrations.</em>
              </p>
              <div className="flex flex-wrap gap-2.5">
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
            <div className="p-5">
              <h3 className="text-text-primary mb-4">
                📁 Upload SVG
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={handleFileUpload}
                className="hidden"
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

          {/* GitHub Repository */}
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div className="p-5">
              <h3 className="text-text-primary mb-4">
                🐙 Load from GitHub Repositories
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Load SVG files from any GitHub repository and convert them with svg2roughjs! 🎨
              </p>

              {/* Preset Repositories */}
              <div className="mb-5">
                <h4 className="text-text-secondary mb-2.5">
                  Popular SVG Repositories:
                </h4>
                <div className="flex flex-col gap-2">
                  {presetRepos.map((preset) => (
                    <div
                      key={preset.url}
                      onClick={() => setGithubRepo(preset.url)}
                      className="p-2.5 cursor-pointer transition-all duration-200 rounded-lg border"
                      style={{
                        backgroundColor: githubRepo === preset.url ? 'rgba(196, 167, 231, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        border: githubRepo === preset.url ? '1px solid rgba(196, 167, 231, 0.5)' : '1px solid rgba(196, 167, 231, 0.1)'
                      }}
                    >
                      <div className="font-bold text-text-primary text-sm">
                        {preset.name}
                      </div>
                      <div className="text-text-secondary text-xs">
                        {preset.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 mb-4">
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="https://github.com/owner/repo or /tree/main/path"
                  className="flex-1 p-2.5 bg-black/30 border border-purple-400/30 rounded-lg text-text-primary text-sm"
                />
                <MaterialButton
                  onClick={fetchGithubSvgs}
                  disabled={!githubRepo.trim() || isLoadingGithub}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(196, 167, 231, 0.5)',
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      borderColor: 'rgba(196, 167, 231, 0.8)',
                      backgroundColor: 'rgba(196, 167, 231, 0.1)'
                    },
                    '&:disabled': {
                      borderColor: 'rgba(196, 167, 231, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  {isLoadingGithub ? '🔄 Loading...' : '📥 Load SVGs'}
                </MaterialButton>
              </div>

              {githubSvgs.length > 0 && (
                <div>
                  <h4 className="text-text-secondary mb-2.5">
                    Found {githubSvgs.length} SVG files:
                  </h4>
                  <div className="max-h-50 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {githubSvgs.slice(0, 50).map((svg) => (
                      <MaterialChip
                        key={svg.path}
                        label={svg.name.replace('.svg', '')}
                        onClick={() => loadGithubSvg(svg.url, svg.name)}
                        sx={{
                          backgroundColor: 'rgba(196, 167, 231, 0.2)',
                          color: 'var(--color-text-primary)',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          height: '28px',
                          '&:hover': {
                            backgroundColor: 'rgba(196, 167, 231, 0.4)'
                          }
                        }}
                      />
                    ))}
                    {githubSvgs.length > 50 && (
                      <div className="col-span-full text-center text-text-secondary text-xs p-2">
                        ... and {githubSvgs.length - 50} more SVGs
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            <div className="p-5">
              <h3 className="text-text-primary mb-4">
                ⚙️ Conversion Options
              </h3>

              {/* Presets */}
              <div className="mb-5">
                <h4 className="text-text-secondary mb-2.5">
                  Presets
                </h4>
                <div className="flex flex-wrap gap-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary mb-1.5">
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
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-1.5">
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
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 text-text-secondary">
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

              <div className="mt-2.5">
                <label className="flex items-center gap-2 text-text-secondary">
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
            <div className="text-red-400 bg-red-400/10 p-2.5 rounded-lg border border-red-400/30">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Right Column - Output */}
        <div className="flex flex-col gap-5">
          {/* Original SVG */}
          <MaterialCard
            sx={{
              background: 'rgba(49, 46, 56, 0.8)',
              border: '1px solid rgba(196, 167, 231, 0.2)',
              borderRadius: '12px'
            }}
          >
            <div className="p-5">
              <h3 className="text-text-primary mb-4">
                📄 Original SVG
              </h3>
              <div className="bg-black/30 rounded-lg p-4 min-h-50 flex items-center justify-center">
                {inputSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: inputSvg }} />
                ) : (
                  <p className="text-text-secondary">
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
            <div className="p-5">
              <h3 className="text-text-primary mb-4">
                🎨 Rough Conversion
              </h3>
              <div className="bg-black/30 rounded-lg p-4 min-h-50 flex items-center justify-center">
                {convertedSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: convertedSvg }} />
                ) : (
                  <p className="text-text-secondary">
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
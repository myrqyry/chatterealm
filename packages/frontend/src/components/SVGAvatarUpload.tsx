import React, { useState, useRef } from 'react';
import { MaterialCard, MaterialButton, MaterialChip } from './index';
import { assetConverter } from '../services/assetConverter';

interface SVGAvatarUploadProps {
  onAvatarSelect: (svg: string, roughSvg: string) => void;
  currentAvatar?: string;
}

const SVGAvatarUpload: React.FC<SVGAvatarUploadProps> = ({
  onAvatarSelect,
  currentAvatar
}) => {
  const [uploadedSvg, setUploadedSvg] = useState<string>('');
  const [roughSvg, setRoughSvg] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml') {
      setError('Please select a valid SVG file');
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      setError('File size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setUploadedSvg(content);
      setError('');

      // Auto-convert to rough style
      setIsConverting(true);
      try {
        const result = await assetConverter.convertSvgToRough(content, {
          roughness: 1.2,
          bowing: 1.5,
          randomize: true,
          pencilFilter: true
        });
        setRoughSvg(result.svg);
      } catch (err) {
        setError('Failed to convert SVG');
        console.error('SVG conversion error:', err);
      } finally {
        setIsConverting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleUseAvatar = () => {
    if (roughSvg) {
      onAvatarSelect(uploadedSvg, roughSvg);
    }
  };

  const resetUpload = () => {
    setUploadedSvg('');
    setRoughSvg('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <MaterialCard
      sx={{
        background: 'rgba(49, 46, 56, 0.8)',
        border: '1px solid rgba(196, 167, 231, 0.2)',
        borderRadius: '12px'
      }}
    >
      <div style={{ padding: '16px' }}>
        <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          🎨 Custom SVG Avatar
        </h4>

        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {!uploadedSvg ? (
          <MaterialButton
            onClick={() => fileInputRef.current?.click()}
            variant="outlined"
            fullWidth
            sx={{
              borderColor: 'rgba(196, 167, 231, 0.5)',
              color: 'var(--color-text-primary)',
              '&:hover': {
                borderColor: 'rgba(196, 167, 231, 0.8)',
                backgroundColor: 'rgba(196, 167, 231, 0.1)'
              }
            }}
          >
            📁 Upload SVG Avatar
          </MaterialButton>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Preview */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  Original
                </p>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(196, 167, 231, 0.2)'
                }}>
                  <div
                    style={{ fontSize: '2rem' }}
                    dangerouslySetInnerHTML={{ __html: uploadedSvg }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  Rough Style
                </p>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(196, 167, 231, 0.2)'
                }}>
                  {isConverting ? (
                    <div style={{ color: 'var(--color-text-secondary)' }}>🔄</div>
                  ) : roughSvg ? (
                    <div
                      style={{ fontSize: '2rem' }}
                      dangerouslySetInnerHTML={{ __html: roughSvg }}
                    />
                  ) : (
                    <div style={{ color: 'var(--color-text-secondary)' }}>❌</div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <MaterialButton
                onClick={handleUseAvatar}
                disabled={!roughSvg || isConverting}
                variant="contained"
                size="small"
                sx={{
                  flex: 1,
                  backgroundColor: 'rgba(76, 175, 80, 0.8)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 1)'
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(76, 175, 80, 0.3)'
                  }
                }}
              >
                ✓ Use This
              </MaterialButton>

              <MaterialButton
                onClick={resetUpload}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: 'rgba(244, 67, 54, 0.5)',
                  color: 'var(--color-text-primary)',
                  '&:hover': {
                    borderColor: 'rgba(244, 67, 54, 0.8)',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                ↻ Reset
              </MaterialButton>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '12px',
            color: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            fontSize: '0.8rem'
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{ marginTop: '12px' }}>
          <MaterialChip
            label="SVG → Rough.js conversion"
            size="small"
            sx={{
              backgroundColor: 'rgba(196, 167, 231, 0.2)',
              color: 'var(--color-text-primary)',
              fontSize: '0.7rem'
            }}
          />
        </div>
      </div>
    </MaterialCard>
  );
};

export default SVGAvatarUpload;
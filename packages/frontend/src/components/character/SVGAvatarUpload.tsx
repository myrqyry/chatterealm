import React, { useState, useRef } from 'react';
import { MaterialCard, MaterialButton, MaterialChip } from '../index';
import { assetConverter } from '../../services/assetConverter';

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
      <div className="p-4">
        <h4 className="text-[var(--color-text-primary)] mb-3">🎨 Custom SVG Avatar</h4>

        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          onChange={handleFileUpload}
          className="hidden"
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
          <div className="flex flex-col gap-3">
            {/* Preview */}
            <div className="flex gap-3 items-center justify-center">
              <div className="text-center">
                <p className="text-[var(--color-text-secondary)] text-sm mb-1">Original</p>
                <div className="w-[60px] h-[60px] bg-[rgba(0,0,0,0.2)] rounded-md flex items-center justify-center border border-[var(--color-outline)]">
                  <div className="text-2xl" dangerouslySetInnerHTML={{ __html: uploadedSvg }} />
                </div>
              </div>

              <div className="text-center">
                <p className="text-[var(--color-text-secondary)] text-sm mb-1">Rough Style</p>
                <div className="w-[60px] h-[60px] bg-[rgba(0,0,0,0.2)] rounded-md flex items-center justify-center border border-[var(--color-outline)]">
                  {isConverting ? (
                    <div className="text-[var(--color-text-secondary)]">🔄</div>
                  ) : roughSvg ? (
                    <div className="text-2xl" dangerouslySetInnerHTML={{ __html: roughSvg }} />
                  ) : (
                    <div className="text-[var(--color-text-secondary)]">❌</div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
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
          <div className="mt-3 text-[#ff6b6b] bg-[rgba(255,107,107,0.1)] p-2 rounded-md border border-[rgba(255,107,107,0.3)] text-sm">
            ❌ {error}
          </div>
        )}

        <div className="mt-3">
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
import React from 'react';
import { MaterialButton } from '../index';
import { COLORS } from '../../utils/tokens';

type CategoryButtonProps = {
  id: string;
  Icon: React.ComponentType<any>;
  onClick: () => void;
  ariaLabel?: string;
  colorToken?: string; // dot-path into COLORS, e.g. 'primary' or 'health.healthy'
  buttonRef?: (el: HTMLButtonElement | null) => void;
};

function getTokenColor(path?: string): string {
  if (!path) return '#888888';
  const parts = path.split('.');
  let cur: any = COLORS;
  for (const p of parts) {
    if (!cur) return '#888888';
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : '#888888';
}

function hexToRgb(hex: string) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function rgba(hex: string, a: number) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb}, ${a})`;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ id, Icon, onClick, ariaLabel, colorToken, buttonRef }) => {
  const base = getTokenColor(colorToken);
  const bg = rgba(base, 0.12);
  const bgHover = rgba(base, 0.18);
  const border = rgba(base, 0.22);
  const shadow = rgba(base, 0.16);

  return (
    <MaterialButton
      key={id}
      ref={buttonRef as any}
      onClick={onClick}
      sx={{
        minWidth: '60px',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
        borderRadius: 1,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: 'var(--color-text-primary)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: bgHover,
          borderColor: base,
          transform: 'translateY(-6px) scale(1.05)',
          boxShadow: `0 8px 20px ${shadow}`,
        },
      }}
    >
      <Icon sx={{ fontSize: '2.2rem' }} aria-label={ariaLabel || id} />
    </MaterialButton>
  );
};

export default CategoryButton;

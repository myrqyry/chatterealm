import React from 'react';
import { MaterialCard } from '../index';

type PanelProps = {
  title?: React.ReactNode;
  children?: React.ReactNode;
  sx?: any;
};

const Panel: React.FC<PanelProps> = ({ title, children, sx }) => {
  const mergedSx = { p: 2, backgroundColor: 'var(--color-surface-variant)', ...(sx || {}) };
  return (
    <MaterialCard sx={mergedSx}>
      {title ? <h4 className="m-0 mb-3 text-text-primary">{title}</h4> : null}
      {children}
    </MaterialCard>
  );
};

export default Panel;

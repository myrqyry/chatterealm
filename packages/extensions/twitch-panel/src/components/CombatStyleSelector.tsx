import React from 'react';

type CombatStyle = 'aggressive' | 'defensive' | 'balanced';

interface CombatStyleSelectorProps {
    style: CombatStyle;
    onChange: (style: CombatStyle) => void;
}

const CombatStyleSelector: React.FC<CombatStyleSelectorProps> = ({ style, onChange }) => {
    return (
        <div>
            <h3>Combat Style</h3>
            <select value={style} onChange={(e) => onChange(e.target.value as CombatStyle)}>
                <option value="aggressive">Aggressive</option>
                <option value="defensive">Defensive</option>
                <option value="balanced">Balanced</option>
            </select>
        </div>
    );
};

export default CombatStyleSelector;
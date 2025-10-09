import React from 'react';

interface AutoWanderControlsProps {
    enabled: boolean;
    onToggle: () => void;
}

const AutoWanderControls: React.FC<AutoWanderControlsProps> = ({ enabled, onToggle }) => {
    return (
        <div>
            <label>
                Auto-Wander:
                <input type="checkbox" checked={enabled} onChange={onToggle} />
            </label>
        </div>
    );
};

export default AutoWanderControls;
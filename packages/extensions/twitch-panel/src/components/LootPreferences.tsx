import React from 'react';

interface LootPreferencesProps {
    preferences: string[];
    onChange: (preferences: string[]) => void;
}

const LootPreferences: React.FC<LootPreferencesProps> = ({ preferences, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        const newPreferences = checked
            ? [...preferences, value]
            : preferences.filter(pref => pref !== value);
        onChange(newPreferences);
    };

    return (
        <div>
            <h3>Loot Preferences</h3>
            <label>
                <input type="checkbox" value="weapon" checked={preferences.includes('weapon')} onChange={handleChange} />
                Weapons
            </label>
            <label>
                <input type="checkbox" value="armor" checked={preferences.includes('armor')} onChange={handleChange} />
                Armor
            </label>
            <label>
                <input type="checkbox" value="consumable" checked={preferences.includes('consumable')} onChange={handleChange} />
                Consumables
            </label>
        </div>
    );
};

export default LootPreferences;
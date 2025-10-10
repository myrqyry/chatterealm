import React from 'react';

const BiomeVisualizer = () => <div>Biome Visualizer Placeholder</div>;
const RoughFillTester = () => <div>Rough Fill Tester Placeholder</div>;
const PerformanceMonitor = () => <div>Performance Monitor Placeholder</div>;
const BiomeConfigEditor = () => <div>Biome Config Editor Placeholder</div>;

export const BiomeDebugTools: React.FC = () => {
  return (
    <div className="biome-debug-tools" style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: 10, zIndex: 1000 }}>
      <h3>Biome Debug Tools</h3>
      <BiomeVisualizer />
      <RoughFillTester />
      <PerformanceMonitor />
      <BiomeConfigEditor />
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { assetConverter } from '../../services/assetConverter';

const EMOJIS = ['😀', '👩\u200d👩\u200d👧', '👍\u{1f3fd}'];

const EmojiSvgSmokeTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, { svg?: string; error?: string }>>({});

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const out: Record<string, { svg?: string; error?: string }> = {};

      for (const e of EMOJIS) {
        try {
          // Try svgmoji first then fallback to noto via the service
          const svg = await assetConverter.fetchEmojiSvg(e, 'svgmoji');
          const converted = await assetConverter.convertSvgToRough(svg, assetConverter.getDefaultOptions());
          out[e] = { svg: converted.svg };
        } catch (err) {
          out[e] = { error: String(err) };
        }

        if (!mounted) break;
        setResults({ ...out });
      }
    };

    run();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: 12, color: 'white' }}>
      <h3>Emoji SVG Smoke Test (dev only)</h3>
      {EMOJIS.map(e => (
        <div key={e} style={{ marginBottom: 12, background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6 }}>
          <div style={{ fontSize: 28 }}>{e}</div>
          <div style={{ marginTop: 8 }}>
            {results[e]?.svg ? (
              <div dangerouslySetInnerHTML={{ __html: results[e].svg }} />
            ) : results[e]?.error ? (
              <div style={{ color: 'salmon' }}>Error: {results[e].error}</div>
            ) : (
              <div style={{ color: '#ccc' }}>Loading...</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmojiSvgSmokeTest;

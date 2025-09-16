import { Svg2Roughjs, OutputType } from 'svg2roughjs';

export interface AssetConversionOptions {
  roughness?: number;
  bowing?: number;
  seed?: number;
  randomize?: boolean;
  backgroundColor?: string;
  pencilFilter?: boolean;
  sketchPatterns?: boolean;
}

export interface ConvertedAsset {
  svg: string;
  canvas?: HTMLCanvasElement;
  originalSvg: string;
  options: AssetConversionOptions;
}

export class AssetConverterService {
  private converter: Svg2Roughjs | null = null;

  /**
   * Convert an SVG string to a rough hand-drawn version
   */
  async convertSvgToRough(
    svgString: string,
    options: AssetConversionOptions = {}
  ): Promise<ConvertedAsset> {
    try {
      // Create a temporary container for the conversion
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      // Create SVG element from string
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      if (!svgElement || svgElement.tagName !== 'svg') {
        throw new Error('Invalid SVG content');
      }

      const typedSvgElement = svgElement as unknown as SVGSVGElement;

      // Initialize converter if not exists
      if (!this.converter) {
        this.converter = new Svg2Roughjs(container, OutputType.SVG);
      } else {
        // Reset target if converter already exists
        this.converter = new Svg2Roughjs(container, OutputType.SVG);
      }

      // Set the SVG source
      this.converter.svg = typedSvgElement;

      // Apply conversion options
      this.applyOptions(this.converter, options);

      // Perform the conversion
      const result = await this.converter.sketch();

      // Get the resulting SVG
      let resultSvg = '';
      if (result && result instanceof SVGSVGElement) {
        resultSvg = new XMLSerializer().serializeToString(result);
      } else if (container.innerHTML) {
        resultSvg = container.innerHTML;
      }

      // Clean up
      document.body.removeChild(container);

      return {
        svg: resultSvg,
        originalSvg: svgString,
        options
      };
    } catch (error) {
      console.error('SVG conversion failed:', error);
      throw new Error(`Failed to convert SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch an emoji SVG from a collection (default: Noto Emoji raw GitHub)
   * Currently supports 'noto' collection via raw.githubusercontent URLs.
   */
  async fetchEmojiSvg(emoji: string, collection: 'noto' | 'svgmoji' = 'noto', opts?: { rough?: boolean; preset?: 'sketch' | 'cartoon' | 'technical' | 'wild'; options?: AssetConversionOptions }): Promise<string> {
    try {
      // First, try the backend API if available (helps centralize fetching + caching)
      try {
        const apiBase = (import.meta as any)?.env?.VITE_API_BASE || 'http://localhost:3001';
        let url = `${apiBase.replace(/\/$/, '')}/api/emoji?char=${encodeURIComponent(emoji)}`;
        if (opts?.rough) {
          url += '&rough=true';
          if (opts?.preset) {
            // Map preset to query params for the backend
            const mapping = this.getPresetOptions(opts.preset);
            Object.entries(mapping).forEach(([k, v]) => {
              if (v !== undefined && v !== null) url += `&${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
            });
          } else if (opts?.options) {
            Object.entries(opts.options).forEach(([k, v]) => {
              if (v !== undefined && v !== null) url += `&${encodeURIComponent(k)}=${encodeURIComponent(String((v as any)))}`;
            });
          }
        }
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().startsWith('<svg')) return text;
        }
      } catch (e) {
        // ignore backend fetch errors and fall back to local resolution
      }

      const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
      const filename = `emoji_u${codepoints.join('_')}.svg`;

      // Prefer the installed @svgmoji/noto package when requesting svgmoji collection
      if (collection === 'svgmoji') {
        try {
          // dynamic import so build doesn't require the package at top-level if absent
          const mod = await import('@svgmoji/noto');

          // Build a set of candidate keys to try against the svgmoji map
          const buildCandidates = (emojiStr: string) => {
            const cps = Array.from(emojiStr).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
            const candidates: string[] = [];

            // Common svgmoji key format: 'u1f600' or 'u1f1fa_1f1f8' etc.
            candidates.push(`u${cps.join('_')}`);

            // Also try without 'u' prefix
            candidates.push(cps.join('_'));

            // Also try the short form (first codepoint) as a fallback
            if (cps.length > 1) candidates.push(`u${cps[0]}`);

            // Also try lowercase hex with hyphens (some collections use this)
            candidates.push(cps.join('-'));

            // Try a normalized sequence collapsing zero-width joiners (ZWJ)
            const collapsed = cps.filter(cp => cp !== '200d').join('_');
            if (collapsed) candidates.push(`u${collapsed}`);

            return Array.from(new Set(candidates));
          };

          const tryResolveFromModule = (moduleAny: any, emojiStr: string): string | null => {
            const candidates = buildCandidates(emojiStr);

            // Try function-style APIs first
            if (typeof moduleAny.get === 'function') {
              try {
                const out = moduleAny.get(emojiStr);
                if (out) return out;
              } catch {}
            }
            if (typeof moduleAny.toSvg === 'function') {
              try {
                const out = moduleAny.toSvg(emojiStr);
                if (out) return out;
              } catch {}
            }

            // Try common export maps
            const def = moduleAny.default || moduleAny;
            if (def && typeof def === 'object') {
              for (const k of candidates) {
                if (def[k]) return def[k];
              }
            }

            // Try direct export by candidate keys
            for (const k of candidates) {
              if (moduleAny[k]) return moduleAny[k];
            }

            return null;
          };

          const resolved = tryResolveFromModule(mod, emoji);
          if (resolved) return resolved;

          // If module looks like an object containing a nested 'svgmoji' map
          if (mod && (mod as any).svgmoji) {
            const nested = tryResolveFromModule((mod as any).svgmoji, emoji);
            if (nested) return nested;
          }

          // If we couldn't resolve via package, fall back to raw fetch below
        } catch (err) {
          // dynamic import failed or package didn't provide usable API; fallback
          console.warn('svgmoji dynamic import failed or no usable API, falling back to raw fetch', err);
        }
      }

      // Default: fetch from Noto raw GitHub (covers many emojis)
      const url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/${filename}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch Noto SVG: ${res.status}`);
      return await res.text();
    } catch (err) {
      console.error('fetchEmojiSvg error:', err);
      throw err;
    }
  }

  /**
   * Convert SVG to canvas for direct rendering
   */
  async convertSvgToCanvas(
    svgString: string,
    options: AssetConversionOptions = {}
  ): Promise<ConvertedAsset> {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;

      const converter = new Svg2Roughjs(canvas, OutputType.CANVAS);

      // Create SVG element from string
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      if (!svgElement || svgElement.tagName !== 'svg') {
        throw new Error('Invalid SVG content');
      }

      const typedSvgElement = svgElement as unknown as SVGSVGElement;

      converter.svg = typedSvgElement;
      this.applyOptions(converter, options);

      await converter.sketch();

      return {
        svg: '', // Canvas mode doesn't produce SVG
        canvas,
        originalSvg: svgString,
        options
      };
    } catch (error) {
      console.error('Canvas conversion failed:', error);
      throw new Error(`Failed to convert SVG to canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply conversion options to the converter
   */
  private applyOptions(converter: Svg2Roughjs, options: AssetConversionOptions) {
    if (options.roughness !== undefined) {
      converter.roughConfig.roughness = options.roughness;
    }
    if (options.bowing !== undefined) {
      converter.roughConfig.bowing = options.bowing;
    }
    if (options.seed !== undefined) {
      converter.seed = options.seed;
    }
    if (options.randomize !== undefined) {
      converter.randomize = options.randomize;
    }
    if (options.backgroundColor !== undefined) {
      converter.backgroundColor = options.backgroundColor;
    }
    if (options.pencilFilter !== undefined) {
      converter.pencilFilter = options.pencilFilter;
    }
    if (options.sketchPatterns !== undefined) {
      converter.sketchPatterns = options.sketchPatterns;
    }
  }

  /**
   * Validate SVG content
   */
  validateSvg(svgString: string): boolean {
    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      return svgElement && svgElement.tagName === 'svg';
    } catch {
      return false;
    }
  }

  /**
   * Get default conversion options
   */
  getDefaultOptions(): AssetConversionOptions {
    return {
      roughness: 1,
      bowing: 1,
      randomize: true,
      backgroundColor: 'transparent',
      pencilFilter: false,
      sketchPatterns: true
    };
  }

  /**
   * Get preset options for different styles
   */
  getPresetOptions(preset: 'sketch' | 'cartoon' | 'technical' | 'wild'): AssetConversionOptions {
    const presets = {
      sketch: {
        roughness: 1.5,
        bowing: 1,
        randomize: true,
        pencilFilter: true,
        sketchPatterns: true
      },
      cartoon: {
        roughness: 0.5,
        bowing: 2,
        randomize: false,
        seed: 42,
        pencilFilter: false,
        sketchPatterns: true
      },
      technical: {
        roughness: 0.3,
        bowing: 0.5,
        randomize: false,
        seed: 123,
        pencilFilter: false,
        sketchPatterns: false
      },
      wild: {
        roughness: 3,
        bowing: 3,
        randomize: true,
        pencilFilter: true,
        sketchPatterns: true
      }
    };

    return { ...this.getDefaultOptions(), ...presets[preset] };
  }
}

// Singleton instance
export const assetConverter = new AssetConverterService();
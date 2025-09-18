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
   * Fetch an emoji SVG from a collection (default: Noto Emoji via @svgmoji/noto CDN)
   * Currently supports 'svgmoji' collection via CDN URLs.
   */
  async fetchEmojiSvg(emoji: string, collection: 'svgmoji' = 'svgmoji', opts?: { rough?: boolean; preset?: 'sketch' | 'cartoon' | 'technical' | 'wild'; options?: AssetConversionOptions }): Promise<string> {
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

      // Use @svgmoji/noto CDN URLs for emoji SVGs
      try {
        // Generate CDN URL using the correct format for @svgmoji/noto
        const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).padStart(4, '0').toLowerCase());
        const hexCode = codepoints.join('-');
        const cdnUrl = `https://cdn.jsdelivr.net/npm/@svgmoji/noto@latest/svg/${hexCode}.svg`;
        
        console.log(`Trying CDN URL for ${emoji}: ${cdnUrl}`);
        const response = await fetch(cdnUrl);
        if (response.ok) {
          const svgText = await response.text();
          console.log(`Successfully fetched emoji ${emoji} from CDN`);
          if (opts?.rough) {
            // Convert to rough version if requested
            const roughOptions = opts.preset ? this.getPresetOptions(opts.preset) : (opts.options || {});
            const converted = await this.convertSvgToRough(svgText, roughOptions);
            return converted.svg;
          }
          return svgText;
        } else {
          console.warn(`CDN fetch failed for ${emoji}: ${response.status} ${response.statusText}`);
        }
      } catch (cdnError) {
        console.warn(`CDN fetch error for ${emoji}:`, cdnError);
      }

      // Fallback: Try GitHub raw URLs for Noto Emoji
      try {
        const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
        const filename = `emoji_u${codepoints.join('_')}.svg`;
        const githubUrl = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/${filename}`;
        
        console.log(`Trying GitHub fallback for ${emoji}: ${githubUrl}`);
        const response = await fetch(githubUrl);
        if (response.ok) {
          const svgText = await response.text();
          console.log(`Successfully fetched emoji ${emoji} from GitHub fallback`);
          if (opts?.rough) {
            // Convert to rough version if requested
            const roughOptions = opts.preset ? this.getPresetOptions(opts.preset) : (opts.options || {});
            const converted = await this.convertSvgToRough(svgText, roughOptions);
            return converted.svg;
          }
          return svgText;
        } else {
          console.warn(`GitHub fallback failed for ${emoji}: ${response.status} ${response.statusText}`);
        }
      } catch (githubError) {
        console.warn(`GitHub fallback error for ${emoji}:`, githubError);
      }

      // Last resort: Return a simple SVG with the emoji character
      console.log(`All fetch methods failed for ${emoji}, using fallback SVG`);
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">${emoji}</text></svg>`;
      
      if (opts?.rough) {
        // Convert fallback to rough version if requested
        const roughOptions = opts.preset ? this.getPresetOptions(opts.preset) : (opts.options || {});
        const converted = await this.convertSvgToRough(fallbackSvg, roughOptions);
        return converted.svg;
      }
      
      return fallbackSvg;
    } catch (err) {
      console.error('fetchEmojiSvg error:', err);
      // Always return a fallback SVG, never throw
      const emergencyFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">❓</text></svg>`;
      return emergencyFallback;
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
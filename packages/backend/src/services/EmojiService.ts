import { JSDOM } from 'jsdom';
import { Svg2Roughjs } from 'svg2roughjs';

type CachedEmoji = {
    svg: string;
    fetchedAt: number;
};

export class EmojiService {
    private emojiCache = new Map<string, CachedEmoji>();
    private convertedCache = new Map<string, CachedEmoji>();

    async resolveEmojiSvg(emoji: string): Promise<string> {
        const cacheKey = emoji;
        const cached = this.emojiCache.get(cacheKey);
        if (cached && (Date.now() - cached.fetchedAt) < 1000 * 60 * 60) { // 1h cache
            return cached.svg;
        }

        const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
        const filename = `emoji_u${codepoints.join('_')}.svg`;

        try {
            const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).padStart(4, '0').toLowerCase());
            const hexCode = codepoints.join('-');
            const cdnUrl = `https://cdn.jsdelivr.net/npm/@svgmoji/noto@latest/svg/${hexCode}.svg`;

            console.log(`Backend: Trying CDN URL for ${emoji}: ${cdnUrl}`);
            const response = await fetch(cdnUrl);
            if (response.ok) {
                const svgText = await response.text();
                console.log(`Backend: Successfully fetched emoji ${emoji} from CDN`);
                this.emojiCache.set(cacheKey, { svg: svgText, fetchedAt: Date.now() });
                return svgText;
            } else {
                console.warn(`Backend: CDN fetch failed for ${emoji}: ${response.status} ${response.statusText}`);
            }
        } catch (cdnError) {
            console.warn('Backend: CDN fetch error:', cdnError);
        }

        try {
            const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
            const candidates = [
                `emoji_u${codepoints.join('_')}.svg`,
                `emoji_u${codepoints.join('-')}.svg`,
                `emoji_${codepoints.join('_')}.svg`,
            ];

            for (const candidate of candidates) {
                const url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/${candidate}`;
                try {
                    const resp = await fetch(url);
                    if (resp.ok) {
                        const svgText = await resp.text();
                        this.emojiCache.set(cacheKey, { svg: svgText, fetchedAt: Date.now() });
                        return svgText;
                    }
                } catch (e) {
                    // try next candidate
                }
            }
        } catch (err) {
            // network fetch failed or not available; continue to fallback
        }

        try {
            console.log(`All fetch methods failed for ${emoji}, using fallback SVG`);
            const safeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">${emoji}</text></svg>`;
            this.emojiCache.set(cacheKey, { svg: safeSvg, fetchedAt: Date.now() });
            return safeSvg;
        } catch (err) {
            console.error(`Failed to create fallback SVG for ${emoji}:`, err);
            const emergencyFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">❓</text></svg>`;
            this.emojiCache.set(cacheKey, { svg: emergencyFallback, fetchedAt: Date.now() });
            return emergencyFallback;
        }
    }

    async convertToRoughSvg(svg: string, options: any, emoji: string): Promise<string> {
        const optKey = JSON.stringify(options);
        const convertedCacheKey = `${emoji}::${optKey}`;
        const cachedConverted = this.convertedCache.get(convertedCacheKey);
        if (cachedConverted && (Date.now() - cachedConverted.fetchedAt) < 1000 * 60 * 60) {
            return cachedConverted.svg;
        }

        try {
            const dom = new JSDOM(`<!doctype html><html><body></body></html>`);
            (global as any).window = dom.window;
            (global as any).document = dom.window.document;
            (global as any).DOMParser = dom.window.DOMParser;
            (global as any).XMLSerializer = dom.window.XMLSerializer;
            (global as any).SVGElement = (dom.window as any).SVGElement;
            (global as any).SVGSVGElement = (dom.window as any).SVGSVGElement;

            const document = dom.window.document as unknown as Document;
            const parser = new dom.window.DOMParser();
            const svgDoc = parser.parseFromString(svg, 'image/svg+xml');

            if (!svgDoc || svgDoc.getElementsByTagName('parsererror').length > 0) {
                console.error('Failed to parse SVG document');
                return svg;
            }

            const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;
            const container = document.createElement('div');

            let converter: any;
            try {
                const Svg2Roughjs = require('svg2roughjs').Svg2Roughjs || require('svg2roughjs').default;
                if (!Svg2Roughjs) {
                    throw new Error('Svg2Roughjs not found in library');
                }
                converter = new Svg2Roughjs(container);
                converter.svg = svgElement;
            } catch (converterError) {
                console.warn('SVG converter initialization failed, using original SVG:', (converterError as Error).message);
                return svg;
            }

            if (options.roughness !== undefined) converter.roughConfig.roughness = options.roughness as any;
            if (options.bowing !== undefined) converter.roughConfig.bowing = options.bowing as any;
            if (options.seed !== undefined) converter.seed = options.seed as any;
            if (options.randomize !== undefined) converter.randomize = options.randomize as any;
            if (options.pencilFilter !== undefined) converter.pencilFilter = options.pencilFilter as any;
            if (options.sketchPatterns !== undefined) converter.sketchPatterns = options.sketchPatterns as any;

            const result = await converter.sketch();
            let resultSvg = '';
            if (result && result instanceof dom.window.SVGSVGElement) {
                resultSvg = new dom.window.XMLSerializer().serializeToString(result);
            } else if (container.innerHTML) {
                resultSvg = container.innerHTML;
            }

            if (!resultSvg) {
                console.warn('SVG conversion produced no output, using original SVG');
                return svg;
            }

            this.convertedCache.set(convertedCacheKey, { svg: resultSvg, fetchedAt: Date.now() });
            return resultSvg;
        } catch (conversionError) {
            console.error('Server-side rough conversion failed:', conversionError);
            return svg;
        }
    }
}
import { JSDOM } from 'jsdom';
import { Svg2Roughjs } from 'svg2roughjs';

// Simple emoji validation data (subset of common emojis)
const emojiHexMap: Record<string, string> = {
  '😀': '1F600',
  '😃': '1F603',
  '😄': '1F604',
  '😁': '1F601',
  '😆': '1F606',
  '😅': '1F605',
  '😂': '1F602',
  '🤣': '1F923',
  '😊': '1F60A',
  '😇': '1F607',
  '🙂': '1F642',
  '🙃': '1F643',
  '😉': '1F609',
  '😌': '1F60C',
  '😍': '1F60D',
  '🥰': '1F970',
  '😘': '1F618',
  '😗': '1F617',
  '😙': '1F619',
  '😚': '1F61A',
  '😋': '1F60B',
  '😛': '1F61B',
  '😝': '1F61D',
  '😜': '1F61C',
  '🤪': '1F92A',
  '🤨': '1F928',
  '🧐': '1F9D0',
  '🤓': '1F913',
  '😎': '1F60E',
  '🤩': '1F929',
  '🥳': '1F973',
  '😏': '1F60F',
  '😒': '1F612',
  '😞': '1F61E',
  '😔': '1F614',
  '😟': '1F61F',
  '😕': '1F615',
  '🙁': '1F641',
  '☹️': '2639-FE0F',
  '😣': '1F623',
  '😖': '1F616',
  '😫': '1F62B',
  '😩': '1F629',
  '🥺': '1F97A',
  '😢': '1F622',
  '😭': '1F62D',
  '😤': '1F624',
  '😠': '1F620',
  '😡': '1F621',
  '🤬': '1F92C',
  '🤯': '1F92F',
  '😳': '1F633',
  '🥵': '1F975',
  '🥶': '1F976',
  '😱': '1F631',
  '😨': '1F628',
  '😰': '1F630',
  '😥': '1F625',
  '😓': '1F613',
  '🤗': '1F917',
  '🤔': '1F914',
  '🤭': '1F92D',
  '🤫': '1F92B',
  '🤥': '1F925',
  '😶': '1F636',
  '😐': '1F610',
  '😑': '1F611',
  '😬': '1F62C',
  '🙄': '1F644',
  '😯': '1F62F',
  '😦': '1F626',
  '😧': '1F627',
  '😮': '1F62E',
  '😲': '1F632',
  '🥱': '1F971',
  '😴': '1F634',
  '🤤': '1F924',
  '😪': '1F62A',
  '😵': '1F635',
  '🤐': '1F910',
  '🥴': '1F974',
  '🤢': '1F922',
  '🤮': '1F92E',
  '🤧': '1F927',
  '😷': '1F637',
  '🤒': '1F912',
  '🤕': '1F915',
  '🤑': '1F911',
  '🤠': '1F920',
  '😈': '1F608',
  '👿': '1F47F',
  '👹': '1F479',
  '👺': '1F47A',
  '🤡': '1F921',
  '💩': '1F4A9',
  '👻': '1F47B',
  '💀': '1F480',
  '☠️': '2620-FE0F',
  '👽': '1F47D',
  '👾': '1F47E',
  '🤖': '1F916',
  '🎃': '1F383',
  '😺': '1F63A',
  '😸': '1F638',
  '😹': '1F639',
  '😻': '1F63B',
  '😼': '1F63C',
  '😽': '1F63D',
  '🙀': '1F640',
  '😿': '1F63F',
  '😾': '1F63E',
  '👋': '1F44B',
  '🤚': '1F91A',
  '🖐️': '1F590-FE0F',
  '✋': '270B',
  '🖖': '1F596',
  '👌': '1F44C',
  '🤏': '1F90F',
  '✌️': '270C-FE0F',
  '🤞': '1F91E',
  '🤟': '1F91F',
  '🤘': '1F918',
  '🤙': '1F919',
  '👈': '1F448',
  '👉': '1F449',
  '👆': '1F446',
  '🖕': '1F595',
  '👇': '1F447',
  '☝️': '261D-FE0F',
  '👍': '1F44D',
  '👎': '1F44E',
  '👊': '1F44A',
  '✊': '270A',
  '👏': '1F44F',
  '🙌': '1F64C',
  '👐': '1F450',
  '🤲': '1F932',
  '🤝': '1F91D',
  '🙏': '1F64F',
  '✍️': '270D-FE0F',
  '💅': '1F485',
  '🤳': '1F933',
  '💪': '1F4AA',
  '🦾': '1F9BE',
  '🦿': '1F9BF',
  '🦵': '1F9B5',
  '🦶': '1F9B6',
  '👂': '1F442',
  '🦻': '1F9BB',
  '👃': '1F443',
  '🧠': '1F9E0',
  '🫀': '1F9E1',
  '🫁': '1F9E2',
  '🦷': '1F9B7',
  '🦴': '1F9B4',
  '👀': '1F440',
  '👁️': '1F441-FE0F',
  '👅': '1F445',
  '👄': '1F444',
  '💋': '1F48B',
  '🩸': '1F9E7'
};

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

        // Validate emoji using local map
        const hexCode = emojiHexMap[emoji];
        if (!hexCode) {
            console.warn(`Emoji ${emoji} not supported, using fallback`);
            return this.getFallbackSvg(emoji);
        }

        try {
            const cdnUrl = `https://cdn.jsdelivr.net/npm/@svgmoji/noto@latest/svg/${hexCode}.svg`;
            const response = await fetch(cdnUrl);
            if (response.ok) {
                const svgText = await response.text();
                this.emojiCache.set(cacheKey, { svg: svgText, fetchedAt: Date.now() });
                return svgText;
            } else {
                console.warn(`CDN fetch failed for ${emoji}: ${response.status}`);
            }
        } catch (cdnError) {
            console.warn('CDN fetch error:', cdnError);
        }

        // Fallback SVG
        return this.getFallbackSvg(emoji);
    }

    private getFallbackSvg(emoji: string): string {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">${emoji}</text></svg>`;
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
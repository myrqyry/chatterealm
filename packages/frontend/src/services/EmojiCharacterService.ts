import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { createNoise2D } from 'simplex-noise';
import { CharacterClass, CharacterVisual } from 'shared';

export class EmojiCharacterService {
  private canvas: HTMLCanvasElement;
  private roughCanvas: RoughCanvas;
  private animationFrames: Map<string, SVGElement[]> = new Map();
  private noise2D = createNoise2D();
  private roughGenerator = rough.generator();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 64;
    this.canvas.height = 64;
    this.roughCanvas = rough.canvas(this.canvas);
  }

  async createCharacterFromEmoji(emoji: string, characterClass: CharacterClass): Promise<CharacterVisual> {
    const baseSvg = await this.emojiToSvg(emoji);
    const classModifiedSvg = this.applyClassVisuals(baseSvg, characterClass);
    const animationFrames = this.generateRoughAnimationFrames(classModifiedSvg, characterClass);

    return {
      id: `char_${Date.now()}`,
      baseEmoji: emoji,
      baseSvg: classModifiedSvg,
      animationFrames: animationFrames.map(frame => frame.outerHTML),
      characterClass,
      animationSpeed: this.getClassAnimationSpeed(characterClass),
      roughnessVariation: this.getClassRoughnessVariation(characterClass)
    };
  }

  private async emojiToSvg(emoji: string): Promise<string> {
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 64, 64);
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 32, 32);
    const imageData = ctx.getImageData(0, 0, 64, 64);
    return this.traceToSvgPath(imageData);
  }

  private traceToSvgPath(imageData: ImageData): string {
    const paths: string[] = [];
    const { data, width, height } = imageData;
    const visited = new Set<string>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 128 && !visited.has(`${x},${y}`)) {
          const path = this.traceContour(data, width, height, x, y, visited);
          if (path.length > 10) {
            paths.push(path);
          }
        }
      }
    }

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">`;
    paths.forEach((path, index) => {
      const color = this.getPathColor(index);
      svg += `<path d="${path}" fill="${color}" stroke="none"/>`;
    });
    svg += `</svg>`;
    return svg;
  }

  private generateRoughAnimationFrames(baseSvg: string, characterClass: CharacterClass): SVGElement[] {
    const frames: SVGElement[] = [];
    const frameCount = 8;
    const baseRoughness = this.getClassBaseRoughness(characterClass);

    for (let frame = 0; frame < frameCount; frame++) {
      const frameElement = this.createRoughFrame(
        baseSvg,
        baseRoughness,
        frame,
        characterClass
      );
      frames.push(frameElement);
    }
    return frames;
  }

  private createRoughFrame(baseSvg: string, baseRoughness: number, frameIndex: number, characterClass: CharacterClass): SVGElement {
    const timeOffset = frameIndex * 0.1;
    const roughnessNoise = this.noise2D(timeOffset, 0) * 0.3;
    const bowingNoise = this.noise2D(0, timeOffset) * 0.2;

    const organicRoughness = baseRoughness + roughnessNoise;
    const organicBowing = 1 + bowingNoise;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(baseSvg, 'image/svg+xml');
    const svgElement = svgDoc.documentElement.cloneNode(true) as SVGElement;
    const paths = svgElement.querySelectorAll('path');

    paths.forEach((path, index) => {
      const roughPathData = this.pathToRoughPath(path.getAttribute('d') || '', {
        roughness: organicRoughness,
        bowing: organicBowing,
        strokeWidth: this.getClassStrokeWidth(characterClass),
        stroke: this.getClassStrokeColor(characterClass, frameIndex),
        fill: this.getClassFillColor(characterClass, frameIndex, index),
        fillStyle: this.getClassFillStyle(characterClass)
      });
      path.setAttribute('d', roughPathData);
      path.setAttribute('stroke', this.getClassStrokeColor(characterClass, frameIndex));
      path.setAttribute('fill', this.getClassFillColor(characterClass, frameIndex, index));
      path.setAttribute('stroke-width', this.getClassStrokeWidth(characterClass).toString());
    });

    this.addClassEffects(svgElement, characterClass, frameIndex);
    return svgElement;
  }

  private addClassEffects(svgElement: SVGElement, characterClass: CharacterClass, frameIndex: number): void {
    switch (characterClass.id) {
      case 'quantum-drifter': this.addQuantumShimmer(svgElement, frameIndex); break;
      // Add other class effects here...
    }
  }

  private addQuantumShimmer(svgElement: SVGElement, frameIndex: number): void {
    const shimmerIntensity = Math.sin((frameIndex / 8) * Math.PI * 2) * 0.3 + 0.7;
    const filter = `
      <defs>
        <filter id="quantum-shimmer-${frameIndex}">
          <feGaussianBlur stdDeviation="${shimmerIntensity}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `;
    svgElement.insertAdjacentHTML('afterbegin', filter);
    svgElement.setAttribute('filter', `url(#quantum-shimmer-${frameIndex})`);
  }

  private applyClassVisuals(baseSvg: string, characterClass: CharacterClass): string {
    return baseSvg
      .replace(/fill="[^"]*"/g, `fill="${characterClass.primaryColor}"`)
      .replace(/stroke="[^"]*"/g, `stroke="${characterClass.secondaryColor}"`);
  }

  private getClassBaseRoughness(characterClass: CharacterClass): number {
    return characterClass.roughnessBase;
  }

  private getClassAnimationSpeed(characterClass: CharacterClass): number {
    return characterClass.animationSpeed;
  }

  private getClassRoughnessVariation(characterClass: CharacterClass): number {
    switch (characterClass.id) {
      case 'quantum-drifter': return 0.8;
      case 'void-walker': return 1.2;
      case 'bio-hacker': return 1.0;
      default: return 0.9;
    }
  }

  private getClassStrokeWidth(characterClass: CharacterClass): number {
    return characterClass.roughnessBase * 0.8;
  }

  private getClassStrokeColor(characterClass: CharacterClass, frameIndex: number): string {
    const opacity = 0.7 + Math.sin((frameIndex / 8) * Math.PI * 2) * 0.3;
    return `${characterClass.secondaryColor}${Math.floor(opacity * 255).toString(16)}`;
  }

  private getClassFillColor(characterClass: CharacterClass, frameIndex: number, pathIndex: number): string {
    return characterClass.primaryColor;
  }

  private getClassFillStyle(characterClass: CharacterClass): string {
    switch (characterClass.id) {
      case 'tech-shaman': return 'zigzag-line';
      case 'bio-hacker': return 'dots';
      case 'void-walker': return 'cross-hatch';
      default: return 'solid';
    }
  }

  private traceContour(data: Uint8ClampedArray, width: number, height: number, startX: number, startY: number, visited: Set<string>): string {
    const path = [`M ${startX} ${startY}`];
    let x = startX, y = startY;
    const directions = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
    let dir = 0;

    for (let i = 0; i < 2000; i++) { // Limit steps to prevent infinite loops
      visited.add(`${x},${y}`);
      let foundNext = false;
      for (let j = 0; j < 8; j++) {
        const checkDir = (dir + j + 5) % 8; // Start searching from a different direction
        const [dx, dy] = directions[checkDir];
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
          const alpha = data[(newY * width + newX) * 4 + 3];
          if (alpha > 128) {
            if (!visited.has(`${newX},${newY}`)) {
              path.push(`L ${newX} ${newY}`);
              x = newX;
              y = newY;
              dir = checkDir;
              foundNext = true;
              break;
            }
          }
        }
      }
      if (!foundNext || (x === startX && y === startY)) {
        break;
      }
    }
    path.push('Z');
    return path.join(' ');
  }

  private getPathColor(pathIndex: number): string {
    const colors = ['#333333', '#666666', '#999999', '#CCCCCC'];
    return colors[pathIndex % colors.length];
  }

  private pathToRoughPath(pathData: string, options: any): string {
    try {
      const drawable = this.roughGenerator.path(pathData, {
        ...options,
        curveStepCount: 9,
        curveTightness: 0,
        disableMultiStroke: false,
        disableMultiStrokeFill: false,
      });
      return this.drawableToPath(drawable);
    } catch (error) {
      console.warn('Failed to roughen path:', error);
      return pathData;
    }
  }

  private drawableToPath(drawable: any): string {
    let pathString = '';
    if (drawable && drawable.sets) {
      drawable.sets.forEach((set: any) => {
        if (set.ops) {
          set.ops.forEach((op: any) => {
            switch (op.op) {
              case 'move': pathString += `M${op.data[0]},${op.data[1]} `; break;
              case 'bcurveTo': pathString += `C${op.data[0]},${op.data[1]} ${op.data[2]},${op.data[3]} ${op.data[4]},${op.data[5]} `; break;
              case 'lineTo': pathString += `L${op.data[0]},${op.data[1]} `; break;
              case 'closePath': pathString += 'Z '; break;
            }
          });
        }
      });
    }
    return pathString.trim();
  }
}
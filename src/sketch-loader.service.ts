import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SketchLoaderService {
  async loadSketch(path: string): Promise<(p: any) => void> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load sketch from ${path}: ${response.statusText}`);
      }
      const code = await response.text();

      // Create a function that returns a p5 instance mode sketch
      return (p: any) => {
        // Shared state for the sketch instance
        const state: any = {};

        // Functions to extract from the code
        const setupMatch = this.extractFunction(code, 'setup');
        const drawMatch = this.extractFunction(code, 'draw');
        const mouseClickedMatch = this.extractFunction(code, 'mouseClicked');

        // Strip function definitions from code to leave only global initialization
        let globalInitCode = code
          .replace(/function\s+setup\s*\([\s\S]*?\)\s*\{[\s\S]*?\}(?=\s*function|\s*$)/g, '')
          .replace(/function\s+draw\s*\([\s\S]*?\)\s*\{[\s\S]*?\}(?=\s*function|\s*$)/g, '')
          .replace(/function\s+mouseClicked\s*\([\s\S]*?\)\s*\{[\s\S]*?\}(?=\s*function|\s*$)/g, '');
      
        // We also need to remove 'let', 'const', 'var' keywords from the global init code
        // so they become assignments to our state object when executed in context
        globalInitCode = globalInitCode.replace(/(?:^|\n|;)\s*(?:let|const|var)\s+(\w+)/g, (match, p1) => {
            return match.replace(new RegExp(`\\b(?:let|const|var)\\s+${p1}\\b`), p1);
        });
      
        // Additional safety for let/const/var that might be missed
        globalInitCode = globalInitCode.replace(/\b(let|const|var)\s+/g, '');

        const executeWithState = (funcCode: string) => {
            this.executeInP5Context(p, funcCode, state);
        };

        // Initialize global state by executing the stripped code
        if (globalInitCode.trim()) {
            executeWithState(globalInitCode);
        }

        if (setupMatch) {
          p.setup = () => {
            executeWithState(setupMatch);
          };
        }

        if (drawMatch) {
          p.draw = () => {
            executeWithState(drawMatch);
          };
        }

        if (mouseClickedMatch) {
          p.mouseClicked = () => {
            executeWithState(mouseClickedMatch);
          };
        }
      };
    } catch (e) {
      console.error('SketchLoaderService: Load failed', e);
      return () => {};
    }
  }

  private extractFunction(code: string, functionName: string): string | null {
    const regex = new RegExp(`function\\s+${functionName}\\s*\\([\\s\\S]*?\\)\\s*\\{`, 'g');
    const match = regex.exec(code);

    if (!match) return null;

    let braceCount = 1;
    let startIndex = match.index + match[0].length;
    let endIndex = startIndex;

    while (braceCount > 0 && endIndex < code.length) {
      if (code[endIndex] === '{') braceCount++;
      if (code[endIndex] === '}') braceCount--;
      endIndex++;
    }

    return code.substring(startIndex, endIndex - 1).trim();
  }

  private executeInP5Context(p: any, code: string, state: any = {}): void {
    // Create a context object with all p5 functions and properties
    const context: any = {
      // Drawing functions
      createCanvas: () => {}, // No-op: createCanvas is handled by P5SketchComponent
      fill: p.fill.bind(p),
      noFill: p.noFill.bind(p),
      stroke: p.stroke.bind(p),
      noStroke: p.noStroke.bind(p),
      strokeWeight: p.strokeWeight.bind(p),
      strokeCap: p.strokeCap ? p.strokeCap.bind(p) : undefined,
      background: p.background.bind(p),
      line: p.line.bind(p),
      rect: p.rect.bind(p),
      ellipse: p.ellipse.bind(p),
      circle: p.circle.bind(p),
      square: p.square.bind(p),
      triangle: p.triangle.bind(p),
      point: p.point.bind(p),
      arc: p.arc ? p.arc.bind(p) : undefined,
      quad: p.quad ? p.quad.bind(p) : undefined,
      beginShape: p.beginShape ? p.beginShape.bind(p) : undefined,
      endShape: p.endShape ? p.endShape.bind(p) : undefined,
      vertex: p.vertex ? p.vertex.bind(p) : undefined,
      curveVertex: p.curveVertex ? p.curveVertex.bind(p) : undefined,
      bezierVertex: p.bezierVertex ? p.bezierVertex.bind(p) : undefined,
      colorMode: p.colorMode ? p.colorMode.bind(p) : undefined,
      color: p.color ? p.color.bind(p) : undefined,
      push: p.push ? p.push.bind(p) : undefined,
      pop: p.pop ? p.pop.bind(p) : undefined,
      translate: p.translate ? p.translate.bind(p) : undefined,
      rotate: p.rotate ? p.rotate.bind(p) : undefined,
      scale: p.scale ? p.scale.bind(p) : undefined,
      shearX: p.shearX ? p.shearX.bind(p) : undefined,
      shearY: p.shearY ? p.shearY.bind(p) : undefined,
      map: p.map ? p.map.bind(p) : undefined,
      lerp: p.lerp ? p.lerp.bind(p) : undefined,
      lerpColor: p.lerpColor ? p.lerpColor.bind(p) : undefined,
      constrain: p.constrain ? p.constrain.bind(p) : undefined,
      dist: p.dist ? p.dist.bind(p) : undefined,
      norm: p.norm ? p.norm.bind(p) : undefined,
      mag: p.mag ? p.mag.bind(p) : undefined,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      min: Math.min,
      max: Math.max,
      abs: Math.abs,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      atan2: Math.atan2,
      sqrt: Math.sqrt,
      pow: Math.pow,
      exp: Math.exp,
      log: Math.log,
      random: p.random ? p.random.bind(p) : Math.random,
      noise: p.noise ? p.noise.bind(p) : undefined,

      // Constants
      get SQUARE() { return p.SQUARE; },
      get ROUND() { return p.ROUND; },
      get PROJECT() { return p.PROJECT; },
      get HSB() { return p.HSB; },
      get RGB() { return p.RGB; },
      get DEGREES() { return p.DEGREES; },
      get RADIANS() { return p.RADIANS; },
      get PI() { return p.PI; },
      get HALF_PI() { return p.HALF_PI; },
      get QUARTER_PI() { return p.QUARTER_PI; },
      get TWO_PI() { return p.TWO_PI; },
      get TAU() { return p.TAU; },

      // Mouse properties (use getters for real-time values)
      get mouseX() { return p.mouseX; },
      get mouseY() { return p.mouseY; },
      get mouseIsPressed() { return p.mouseIsPressed; },

      // Window properties
      get width() { return p.width; },
      get height() { return p.height; },
      get windowWidth() { return p.width; },
      get windowHeight() { return p.height; },
      get displayWidth() { return p.width; },
      get displayHeight() { return p.height; },

      // p object itself for any direct access
      p: p
    };

    // Add state to context
    Object.keys(state).forEach(key => {
        if (!(key in context)) {
            Object.defineProperty(context, key, {
                get: () => state[key],
                set: (v) => state[key] = v,
                enumerable: true,
                configurable: true
            });
        }
    });

    // Filter out undefined methods
    const filteredContext: any = {};
    for (const [key, value] of Object.entries(context)) {
      if (value !== undefined) {
        filteredContext[key] = value;
      }
    }

    try {
      // Create function with context
      const func = new Function(...Object.keys(filteredContext), code);
      func(...Object.values(filteredContext));
    } catch (error) {
      console.error('Error executing p5 code:', error);
    }
  }
}

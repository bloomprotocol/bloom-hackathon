/**
 * Figma to Design JSON Converter
 *
 * Converts Figma design data into a simple, non-technical JSON format
 * that designers and product managers can easily understand and edit.
 *
 * Usage:
 * - Pass Figma design context data
 * - Get back a clean JSON with colors, text, sizes, etc.
 */

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  fills?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
    gradientStops?: Array<{
      color: { r: number; g: number; b: number; a: number };
      position: number;
    }>;
  }>;
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
  };
  absoluteBoundingBox?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  children?: FigmaNode[];
  effects?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
    offset?: { x: number; y: number };
    radius?: number;
  }>;
}

interface DesignJSON {
  name: string;
  description?: string;
  size: {
    width: string;
    height: string;
  };
  colors: {
    background?: string | string[];
    text?: string;
    accent?: string;
    shadow?: string;
  };
  text: {
    [key: string]: {
      content: string;
      size: string;
      weight: string;
      font: string;
    };
  };
  spacing: {
    padding?: string;
    gap?: string;
  };
  effects: {
    shadow?: string;
    blur?: string;
    border?: string;
  };
}

/**
 * Convert RGB color object to hex string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGBA to CSS rgba string
 */
function rgbaToString(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

/**
 * Extract gradient colors from fill
 */
function extractGradient(fill: any): string[] {
  if (!fill.gradientStops) return [];
  return fill.gradientStops.map((stop: any) =>
    rgbToHex(stop.color.r, stop.color.g, stop.color.b)
  );
}

/**
 * Extract text nodes from design
 */
function extractTextNodes(node: FigmaNode): Array<{ key: string; content: string; style: any }> {
  const textNodes: Array<{ key: string; content: string; style: any }> = [];

  if (node.type === 'TEXT' && node.characters) {
    textNodes.push({
      key: node.name.toLowerCase().replace(/\s+/g, '_'),
      content: node.characters,
      style: node.style || {},
    });
  }

  if (node.children) {
    node.children.forEach(child => {
      textNodes.push(...extractTextNodes(child));
    });
  }

  return textNodes;
}

/**
 * Extract colors from node
 */
function extractColors(node: FigmaNode): any {
  const colors: any = {};

  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];

    if (fill.type === 'SOLID' && fill.color) {
      colors.background = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
    } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
      colors.background = extractGradient(fill);
    }
  }

  if (node.effects) {
    node.effects.forEach(effect => {
      if (effect.type === 'DROP_SHADOW' && effect.color) {
        colors.shadow = rgbaToString(
          effect.color.r,
          effect.color.g,
          effect.color.b,
          effect.color.a
        );
      }
    });
  }

  return colors;
}

/**
 * Main conversion function
 */
export function figmaToDesignJSON(figmaNode: FigmaNode): DesignJSON {
  const size = figmaNode.absoluteBoundingBox || { width: 0, height: 0 };
  const textNodes = extractTextNodes(figmaNode);
  const colors = extractColors(figmaNode);

  const designJSON: DesignJSON = {
    name: figmaNode.name,
    size: {
      width: `${Math.round(size.width)}px`,
      height: `${Math.round(size.height)}px`,
    },
    colors,
    text: {},
    spacing: {},
    effects: {},
  };

  // Add text information
  textNodes.forEach(textNode => {
    designJSON.text[textNode.key] = {
      content: textNode.content,
      size: textNode.style.fontSize ? `${textNode.style.fontSize}px` : 'inherit',
      weight: textNode.style.fontWeight?.toString() || 'normal',
      font: textNode.style.fontFamily || 'inherit',
    };
  });

  return designJSON;
}

/**
 * Simplified conversion for the certificate cards
 */
export function certificateToJSON(level: 'seed' | 'sprout' | 'bloom', figmaData?: any) {
  const certificateData = {
    seed: {
      title: 'Seed',
      level: 'L1',
      subtitle: 'Early Seed Supporter',
      colors: {
        gradient: {
          top: '#DAA57D',
          middle: '#98798D',
          bottom: '#5B4662',
        },
        text: '#FFFFFF',
        shadow: 'rgba(152, 121, 141, 0.4)',
      },
      icon: 'plant-sprout',
      badge: 'Certificate',
    },
    sprout: {
      title: 'Sprout',
      level: 'L2',
      subtitle: 'Activated Sprout Supporter',
      colors: {
        gradient: {
          top: '#90EECD',
          middle: '#56B49B',
          bottom: '#2D6059',
        },
        text: '#FFFFFF',
        shadow: 'rgba(86, 180, 155, 0.4)',
      },
      icon: 'plant-sprout',
      badge: 'Certificate',
    },
    bloom: {
      title: 'Bloom',
      level: 'L3',
      subtitle: 'Bloom Supporter',
      colors: {
        gradient: {
          top: '#1A1932',
          middle: '#342C58',
          bottom: '#7851A9',
        },
        text: '#FFFFFF',
        shadow: 'rgba(120, 81, 169, 0.4)',
      },
      icon: 'plant-sprout',
      badge: 'Certificate',
    },
  };

  return {
    component: 'SeedPassCertificate',
    variant: level,
    size: {
      width: '272px',
      height: '320px',
      borderRadius: '16px',
    },
    design: certificateData[level],
  };
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { figmaToDesignJSON, certificateToJSON };
}

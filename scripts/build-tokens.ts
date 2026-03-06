/**
 * Figma Design Token to Tailwind CSS v4 Converter
 *
 * This script converts Figma Tokens Studio JSON files to Tailwind CSS v4 format.
 * It generates:
 * - theme.css: @theme block with CSS custom properties
 * - utilities.css: @utility classes for typography
 * - fonts.css: Font imports
 *
 * Usage: npx tsx scripts/build-tokens.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types
// ============================================================================

interface TokenValue {
  $type: string;
  $value: string | number | Record<string, unknown>;
  $description?: string;
}

interface TypographyValue {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
}

interface BorderValue {
  color: string;
  width: string;
  style: string;
}

type TokenObject = Record<string, TokenValue | TokenObject>;

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  input: {
    primitives: path.resolve(__dirname, '../design-tokens/Primitives.json'),
    semantic: path.resolve(__dirname, '../design-tokens/Semantic.json'),
  },
  output: {
    dir: path.resolve(__dirname, '../src/styles/generated'),
    theme: 'theme.css',
    utilities: 'utilities.css',
    fonts: 'fonts.css',
  },
  fonts: {
    sans: {
      name: 'SUIT Variable',
      fallback: 'SUIT, -apple-system, BlinkMacSystemFont, sans-serif',
      cdn: 'https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css',
    },
    mono: {
      name: 'JetBrains Mono',
      fallback: 'monospace',
      cdn: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
    },
    display: {
      name: 'SUIT Variable', // ABC Social 대체
      fallback: 'SUIT, sans-serif',
      cdn: null, // SUIT와 동일 CDN 사용
    },
  },
};

// ============================================================================
// Reference Resolver
// ============================================================================

/**
 * Resolves token references like {color.blue.500} to actual values
 */
function resolveReference(
  value: string,
  primitives: TokenObject,
  semantics: TokenObject,
  visited: Set<string> = new Set()
): string {
  const refPattern = /\{([^}]+)\}/g;

  if (!refPattern.test(value)) {
    return value;
  }

  return value.replace(refPattern, (match, refPath) => {
    if (visited.has(refPath)) {
      console.warn(`Circular reference detected: ${refPath}`);
      return match;
    }
    visited.add(refPath);

    // Try to resolve from primitives first, then semantics
    let resolved = getValueByPath(primitives, refPath);
    if (resolved === undefined) {
      resolved = getValueByPath(semantics, refPath);
    }

    if (resolved === undefined) {
      console.warn(`Unresolved reference: ${refPath}`);
      return match;
    }

    // If resolved value is also a reference, resolve recursively
    if (typeof resolved === 'string' && resolved.includes('{')) {
      return resolveReference(resolved, primitives, semantics, visited);
    }

    return String(resolved);
  });
}

/**
 * Gets a value from nested object by dot-separated path
 */
function getValueByPath(obj: TokenObject, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  // If it's a token object, return the $value
  if (current && typeof current === 'object' && '$value' in current) {
    const tokenValue = (current as TokenValue).$value;
    return typeof tokenValue === 'object' ? undefined : String(tokenValue);
  }

  return typeof current === 'string' ? current : undefined;
}

// ============================================================================
// Generators
// ============================================================================

/**
 * Generates fonts.css with font configuration documentation.
 * NOTE: Actual @import statements are in src/index.css at the top
 * to comply with CSS @import ordering rules (must precede all other statements).
 */
function generateFonts(): string {
  const lines: string[] = [
    '/* Auto-generated Font Configuration - DO NOT EDIT MANUALLY */',
    `/* Generated at: ${new Date().toISOString()} */`,
    '',
    '/*',
    ' * Font imports are in src/index.css at the top to comply with CSS @import rules.',
    ' * The following fonts are used in this project:',
    ' *',
  ];

  if (CONFIG.fonts.sans.cdn) {
    lines.push(` * ${CONFIG.fonts.sans.name}: ${CONFIG.fonts.sans.cdn}`);
  }

  if (CONFIG.fonts.mono.cdn) {
    lines.push(` * ${CONFIG.fonts.mono.name}: ${CONFIG.fonts.mono.cdn}`);
  }

  lines.push(' */');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generates theme.css with @theme block
 */
function generateTheme(primitives: TokenObject, semantics: TokenObject): string {
  const lines: string[] = [
    '/* Auto-generated Design Tokens - DO NOT EDIT MANUALLY */',
    `/* Generated at: ${new Date().toISOString()} */`,
    '',
    '@theme {',
  ];

  // Fonts
  lines.push('  /* Font Families */');
  lines.push(
    `  --font-sans: "${CONFIG.fonts.sans.name}", ${CONFIG.fonts.sans.fallback};`
  );
  lines.push(
    `  --font-mono: "${CONFIG.fonts.mono.name}", ${CONFIG.fonts.mono.fallback};`
  );
  lines.push(
    `  --font-display: "${CONFIG.fonts.display.name}", ${CONFIG.fonts.display.fallback};`
  );
  lines.push('');

  // Colors from Primitives
  const colors = primitives.color as TokenObject;
  if (colors) {
    for (const [colorName, shades] of Object.entries(colors)) {
      if (colorName === 'transparent') {
        const token = shades as TokenValue;
        lines.push(`  --color-transparent: ${token.$value};`);
        continue;
      }

      lines.push(`  /* Color - ${colorName} */`);
      if (typeof shades === 'object' && !('$value' in shades)) {
        for (const [shade, token] of Object.entries(shades as TokenObject)) {
          const t = token as TokenValue;
          lines.push(`  --color-${colorName}-${shade}: ${t.$value};`);
        }
      }
      lines.push('');
    }
  }

  // Semantic Colors
  lines.push('  /* Semantic - Background */');
  const background = semantics.background as TokenObject;
  if (background) {
    for (const [name, token] of Object.entries(background)) {
      const t = token as TokenValue;
      const value = resolveReference(String(t.$value), primitives, semantics);
      lines.push(`  --bg-${name}: ${value};`);
    }
  }
  lines.push('');

  lines.push('  /* Semantic - Text (using --fg- prefix to avoid Tailwind v4 text-* collision) */');
  const text = semantics.text as TokenObject;
  if (text) {
    for (const [name, token] of Object.entries(text)) {
      const t = token as TokenValue;
      const value = resolveReference(String(t.$value), primitives, semantics);
      lines.push(`  --fg-${name}: ${value};`);
    }
  }
  lines.push('');

  lines.push('  /* Semantic - Border */');
  const border = semantics.border as TokenObject;
  if (border) {
    for (const [name, token] of Object.entries(border)) {
      const t = token as TokenValue;
      const value = resolveReference(String(t.$value), primitives, semantics);
      const cleanName = name.replace('border-', '');
      lines.push(`  --border-${cleanName}: ${value};`);
    }
  }
  lines.push('');

  lines.push('  /* Semantic - Button */');
  const button = semantics.button as TokenObject;
  if (button) {
    generateButtonTokens(button, primitives, semantics, lines);
  }
  lines.push('');

  lines.push('  /* Semantic - Status */');
  const status = semantics.status as TokenObject;
  if (status) {
    generateStatusTokens(status, primitives, semantics, lines);
  }
  lines.push('');

  // Border Radius (rem for viewport-responsive scaling)
  lines.push('  /* Border Radius (rem for viewport-responsive scaling) */');
  const radius = primitives.radius as TokenObject;
  if (radius) {
    for (const [name, token] of Object.entries(radius)) {
      const t = token as TokenValue;
      const cssName = normalizeRadiusName(name);
      // radius-full은 큰 값으로 유지, 나머지는 rem 변환
      if (cssName === 'full') {
        lines.push(`  --radius-${cssName}: 999px;`);
      } else {
        lines.push(`  --radius-${cssName}: ${pxToRem(Number(t.$value))};`);
      }
    }
  }
  lines.push('');

  // Spacing (rem for viewport-responsive scaling)
  lines.push('  /* Spacing (rem for viewport-responsive scaling) */');
  const dimension = primitives.dimension as TokenObject;
  if (dimension) {
    for (const [name, token] of Object.entries(dimension)) {
      const t = token as TokenValue;
      const cssName = normalizeSpacingName(name);
      lines.push(`  --spacing-${cssName}: ${pxToRem(Number(t.$value))};`);
    }
  }

  lines.push('}');

  return lines.join('\n');
}

function generateButtonTokens(
  button: TokenObject,
  primitives: TokenObject,
  semantics: TokenObject,
  lines: string[]
): void {
  for (const [variant, states] of Object.entries(button)) {
    if (typeof states === 'object' && !('$value' in states)) {
      for (const [state, token] of Object.entries(states as TokenObject)) {
        const t = token as TokenValue;
        const value = resolveReference(String(t.$value), primitives, semantics);
        const stateName = state.split('-')[0]; // active-500 → active
        lines.push(`  --btn-${variant}-${stateName}: ${value};`);
      }
    }
  }
}

function generateStatusTokens(
  status: TokenObject,
  primitives: TokenObject,
  semantics: TokenObject,
  lines: string[]
): void {
  for (const [statusName, statusObj] of Object.entries(status)) {
    if (typeof statusObj === 'object' && !('$value' in statusObj)) {
      flattenStatusToken(statusName, statusObj as TokenObject, primitives, semantics, lines);
    }
  }
}

function flattenStatusToken(
  prefix: string,
  obj: TokenObject,
  primitives: TokenObject,
  semantics: TokenObject,
  lines: string[]
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && '$value' in value) {
      const t = value as TokenValue;
      const resolvedValue = resolveReference(String(t.$value), primitives, semantics);
      lines.push(`  --status-${prefix}-${key}: ${resolvedValue};`);
    } else if (typeof value === 'object') {
      flattenStatusToken(`${prefix}-${key}`, value as TokenObject, primitives, semantics, lines);
    }
  }
}

/**
 * Generates utilities.css with @utility classes for typography and semantic colors
 */
function generateUtilities(primitives: TokenObject, semantics: TokenObject): string {
  const lines: string[] = [
    '/* Auto-generated Typography & Semantic Utilities - DO NOT EDIT MANUALLY */',
    `/* Generated at: ${new Date().toISOString()} */`,
    '',
  ];

  // Title utilities (H1-H4)
  lines.push('/* Typography - Headings (rem for viewport-responsive scaling) */');
  const title = primitives.Title as TokenObject;
  if (title) {
    for (const [name, token] of Object.entries(title)) {
      const t = token as TokenValue;
      const typo = t.$value as TypographyValue;
      const className = `text-${name.toLowerCase()}`;
      const weight = resolveWeight(typo.fontWeight);
      const lineHeight = parseLineHeight(typo.lineHeight);

      lines.push(`@utility ${className} {`);
      lines.push('  font-family: var(--font-sans);');
      lines.push(`  font-size: ${pxToRem(Number(typo.fontSize))};`);
      lines.push(`  font-weight: ${weight};`);
      lines.push(`  line-height: ${lineHeight};`);
      lines.push('}');
      lines.push('');
    }
  }

  // Body utilities
  lines.push('/* Typography - Body (rem for viewport-responsive scaling) */');
  const body = primitives.Body as TokenObject;
  if (body) {
    for (const [name, token] of Object.entries(body)) {
      const t = token as TokenValue;
      const typo = t.$value as TypographyValue;
      const className = `text-body-${name.toLowerCase()}`;
      const weight = resolveWeight(typo.fontWeight);
      const lineHeight = parseLineHeight(typo.lineHeight);

      lines.push(`@utility ${className} {`);
      lines.push('  font-family: var(--font-sans);');
      lines.push(`  font-size: ${pxToRem(Number(typo.fontSize))};`);
      lines.push(`  font-weight: ${weight};`);
      lines.push(`  line-height: ${lineHeight};`);
      lines.push('}');
      lines.push('');
    }
  }

  // Label utilities
  lines.push('/* Typography - Labels (rem for viewport-responsive scaling) */');
  const label = primitives.Label as TokenObject;
  if (label) {
    for (const [name, token] of Object.entries(label)) {
      const t = token as TokenValue;
      const typo = t.$value as TypographyValue;
      const className = `text-label-${normalizeLabelName(name)}`;
      const weight = resolveWeight(typo.fontWeight);
      const lineHeight = parseLineHeight(typo.lineHeight);

      lines.push(`@utility ${className} {`);
      lines.push('  font-family: var(--font-sans);');
      lines.push(`  font-size: ${pxToRem(Number(typo.fontSize))};`);
      lines.push(`  font-weight: ${weight};`);
      lines.push(`  line-height: ${lineHeight};`);
      lines.push('}');
      lines.push('');
    }
  }

  // Mono utilities
  lines.push('/* Typography - Mono (rem for viewport-responsive scaling) */');
  const mono = primitives.Mono as TokenObject;
  if (mono) {
    for (const [name, token] of Object.entries(mono)) {
      const t = token as TokenValue;
      const typo = t.$value as TypographyValue;
      const className = `text-mono-${name.toLowerCase()}`;
      const weight = resolveWeight(typo.fontWeight);
      const lineHeight = parseLineHeight(typo.lineHeight);

      lines.push(`@utility ${className} {`);
      lines.push('  font-family: var(--font-mono);');
      lines.push(`  font-size: ${pxToRem(Number(typo.fontSize))};`);
      lines.push(`  font-weight: ${weight};`);
      lines.push(`  line-height: ${lineHeight};`);
      lines.push('}');
      lines.push('');
    }
  }

  // Display utilities
  lines.push('/* Typography - Display (rem for viewport-responsive scaling) */');
  const display = primitives.Display as TokenObject;
  if (display) {
    for (const [name, token] of Object.entries(display)) {
      const t = token as TokenValue;
      const typo = t.$value as TypographyValue;
      const className = `text-display-${name.toLowerCase()}`;
      const weight = resolveWeight(typo.fontWeight);
      const lineHeight = parseLineHeight(typo.lineHeight);

      lines.push(`@utility ${className} {`);
      lines.push('  font-family: var(--font-display);');
      lines.push(`  font-size: ${pxToRem(Number(typo.fontSize))};`);
      lines.push(`  font-weight: ${weight};`);
      lines.push(`  line-height: ${lineHeight};`);
      lines.push('}');
      lines.push('');
    }
  }

  // ============================================================================
  // Semantic Color Utilities
  // ============================================================================

  // Text semantic colors → text-* utilities (using --fg- variables to avoid Tailwind v4 collision)
  lines.push('/* Semantic Colors - Text */');
  const textSemantic = semantics.text as TokenObject;
  if (textSemantic) {
    for (const [name] of Object.entries(textSemantic)) {
      lines.push(`@utility text-${name} {`);
      lines.push(`  color: var(--fg-${name});`);
      lines.push('}');
      lines.push('');
    }
  }

  // Background semantic colors → bg-* utilities
  lines.push('/* Semantic Colors - Background */');
  const bgSemantic = semantics.background as TokenObject;
  if (bgSemantic) {
    for (const [name] of Object.entries(bgSemantic)) {
      lines.push(`@utility bg-${name} {`);
      lines.push(`  background-color: var(--bg-${name});`);
      lines.push('}');
      lines.push('');
    }
  }

  // Border semantic colors → border-* utilities
  lines.push('/* Semantic Colors - Border */');
  const borderSemantic = semantics.border as TokenObject;
  if (borderSemantic) {
    for (const [name] of Object.entries(borderSemantic)) {
      const cleanName = name.replace('border-', '');
      lines.push(`@utility border-${cleanName} {`);
      lines.push(`  border-color: var(--border-${cleanName});`);
      lines.push('}');
      lines.push('');
    }
  }

  // Button semantic colors → btn-* utilities
  lines.push('/* Semantic Colors - Button */');
  const buttonSemantic = semantics.button as TokenObject;
  if (buttonSemantic) {
    for (const [variant, states] of Object.entries(buttonSemantic)) {
      if (typeof states === 'object' && !('$value' in states)) {
        for (const [state] of Object.entries(states as TokenObject)) {
          const stateName = state.split('-')[0];
          lines.push(`@utility btn-${variant}-${stateName} {`);
          lines.push(`  background-color: var(--btn-${variant}-${stateName});`);
          lines.push('}');
          lines.push('');
        }
      }
    }
  }

  // Status semantic colors → status-* utilities
  lines.push('/* Semantic Colors - Status */');
  const statusSemantic = semantics.status as TokenObject;
  if (statusSemantic) {
    generateStatusUtilities(statusSemantic, lines);
  }

  return lines.join('\n');
}

/**
 * Generates status semantic utilities recursively
 */
function generateStatusUtilities(
  obj: TokenObject,
  lines: string[],
  prefix: string = ''
): void {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && '$value' in value) {
      // It's a token, generate utility
      // Determine utility type based on key name
      if (currentPath.includes('bg')) {
        lines.push(`@utility bg-status-${currentPath.replace('-bg', '')} {`);
        lines.push(`  background-color: var(--status-${currentPath});`);
        lines.push('}');
        lines.push('');
      } else if (currentPath.includes('fg')) {
        lines.push(`@utility text-status-${currentPath.replace('-fg', '')} {`);
        lines.push(`  color: var(--status-${currentPath});`);
        lines.push('}');
        lines.push('');
      }
    } else if (typeof value === 'object') {
      // Recurse into nested object
      generateStatusUtilities(value as TokenObject, lines, currentPath);
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeRadiusName(name: string): string {
  // r0_5 → 0.5, r1 → 1, r1_5 → 1.5, full → full
  if (name === 'full') return 'full';
  return name.replace('r', '').replace('_', '.');
}

function normalizeSpacingName(name: string): string {
  // x0_5 → 0.5, x1 → 1, x1_5 → 1.5
  return name.replace('x', '').replace('_', '.');
}

function normalizeLabelName(name: string): string {
  // "L Strong" → "l-strong", "XXS" → "xxs"
  return name.toLowerCase().replace(/\s+/g, '-');
}

function parseLineHeight(value: string): string {
  // "100%" → "1", "130%" → "1.3", "148%" → "1.48"
  if (value.endsWith('%')) {
    return (parseInt(value) / 100).toString();
  }
  return value;
}

function resolveWeight(value: string): string {
  // "{font-weights.500}" → "500"
  // "Regular" → "400"
  // "Medium" → "500"
  if (value.includes('font-weights')) {
    const match = value.match(/\d+/);
    return match ? match[0] : '400';
  }
  const weightMap: Record<string, string> = {
    Regular: '400',
    Medium: '500',
    Bold: '700',
  };
  return weightMap[value] || '400';
}

/**
 * Converts px value to rem for viewport-responsive scaling
 * Base: 16px = 1rem
 */
function pxToRem(px: number): string {
  return `${px / 16}rem`;
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  console.log('Building design tokens...\n');

  // Read token files
  const primitivesRaw = fs.readFileSync(CONFIG.input.primitives, 'utf-8');
  const semanticsRaw = fs.readFileSync(CONFIG.input.semantic, 'utf-8');

  const primitives: TokenObject = JSON.parse(primitivesRaw);
  const semantics: TokenObject = JSON.parse(semanticsRaw);

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.output.dir)) {
    fs.mkdirSync(CONFIG.output.dir, { recursive: true });
  }

  // Generate files
  const fontsContent = generateFonts();
  const themeContent = generateTheme(primitives, semantics);
  const utilitiesContent = generateUtilities(primitives, semantics);

  // Write files
  fs.writeFileSync(path.join(CONFIG.output.dir, CONFIG.output.fonts), fontsContent);
  console.log(`  Created: ${CONFIG.output.fonts}`);

  fs.writeFileSync(path.join(CONFIG.output.dir, CONFIG.output.theme), themeContent);
  console.log(`  Created: ${CONFIG.output.theme}`);

  fs.writeFileSync(
    path.join(CONFIG.output.dir, CONFIG.output.utilities),
    utilitiesContent
  );
  console.log(`  Created: ${CONFIG.output.utilities}`);

  console.log('\nDesign tokens built successfully!');
}

main();

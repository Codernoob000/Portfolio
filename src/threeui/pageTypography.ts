import { useMemo } from "react";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type PageTypographyProps = {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
};

export type LandingPageCustomization = {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
};

export type PageTypographyRecipe = {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
};

/* ── Recipe constants ───────────────────────────────────────────────────── */

export const COMPLETE_SHELF_TYPOGRAPHY: PageTypographyRecipe = {
  headingFont: "iowan-old-style",
  bodyFont: "inter",
  headingWeight: "400",
  bodyWeight: "400",
  primaryColor: "#c87046",
  headingSize: 60,
  bodySize: 12,
  headingLetterSpacing: -0.055,
};

/* ── Utilities ──────────────────────────────────────────────────────────── */

/**
 * Splits typography props from frame/landing-page props so that each layer
 * receives only the keys it understands.
 */
export function splitTypographyProps<
  T extends PageTypographyProps,
>(
  props: T,
): [PageTypographyProps, Omit<T, keyof PageTypographyProps>] {
  const {
    headingFont,
    bodyFont,
    headingWeight,
    bodyWeight,
    primaryColor,
    headingSize,
    bodySize,
    headingLetterSpacing,
    ...rest
  } = props;
  return [
    {
      headingFont,
      bodyFont,
      headingWeight,
      bodyWeight,
      primaryColor,
      headingSize,
      bodySize,
      headingLetterSpacing,
    },
    rest as Omit<T, keyof PageTypographyProps>,
  ];
}

/**
 * Merges the recipe defaults with user-provided overrides and returns a
 * stable customization object.
 */
export function usePageTypography(
  recipe: PageTypographyRecipe,
  overrides: PageTypographyProps,
): LandingPageCustomization {
  return useMemo(() => {
    const merged: LandingPageCustomization = { ...recipe };
    if (overrides.headingFont !== undefined) merged.headingFont = overrides.headingFont;
    if (overrides.bodyFont !== undefined) merged.bodyFont = overrides.bodyFont;
    if (overrides.headingWeight !== undefined) merged.headingWeight = overrides.headingWeight;
    if (overrides.bodyWeight !== undefined) merged.bodyWeight = overrides.bodyWeight;
    if (overrides.primaryColor !== undefined) merged.primaryColor = overrides.primaryColor;
    if (overrides.headingSize !== undefined) merged.headingSize = overrides.headingSize;
    if (overrides.bodySize !== undefined) merged.bodySize = overrides.bodySize;
    if (overrides.headingLetterSpacing !== undefined)
      merged.headingLetterSpacing = overrides.headingLetterSpacing;
    return merged;
  }, [
    recipe,
    overrides.headingFont,
    overrides.bodyFont,
    overrides.headingWeight,
    overrides.bodyWeight,
    overrides.primaryColor,
    overrides.headingSize,
    overrides.bodySize,
    overrides.headingLetterSpacing,
  ]);
}

/* ── Style ID used by both apply and remove ─────────────────────────────── */

const CUSTOMIZATION_STYLE_ID = "threeui-page-customization";

/**
 * Font-family mapping: shorthand keys → CSS font stacks.
 * The canonical page already loads Inter from Google Fonts; Iowan Old Style
 * is a system font on macOS/iOS and falls back through the serif stack.
 */
function resolveFontFamily(shorthand?: string): string | undefined {
  if (!shorthand) return undefined;
  const lower = shorthand.toLowerCase().replace(/[\s_]+/g, "-");
  switch (lower) {
    case "iowan-old-style":
      return '"Iowan Old Style", Baskerville, "Times New Roman", serif';
    case "inter":
      return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    case "georgia":
      return "Georgia, serif";
    case "system-ui":
      return "system-ui, sans-serif";
    default:
      return `"${shorthand}", sans-serif`;
  }
}

/**
 * Builds the CSS text for the customization `<style>` block. The canonical
 * page defines `--serif` and `--mono` as its own typographic tokens; the
 * customization overrides those tokens plus direct property overrides on the
 * authored elements.
 */
function buildCustomizationCSS(c: LandingPageCustomization): string {
  const rules: string[] = [];

  const headingStack = resolveFontFamily(c.headingFont);
  const bodyStack = resolveFontFamily(c.bodyFont);

  if (headingStack) {
    rules.push(`:root { --serif: ${headingStack}; }`);
  }
  if (bodyStack) {
    rules.push(`:root { --mono: ${bodyStack}; }`);
  }
  if (c.primaryColor) {
    rules.push(`:root { --accent: ${c.primaryColor}; }`);
  }
  if (c.headingWeight) {
    rules.push(
      `.selection__title, .detail-title, .editorial-identity strong, .fallback-book strong { font-weight: ${c.headingWeight} !important; }`,
    );
  }
  if (c.headingLetterSpacing !== undefined) {
    rules.push(
      `.selection__title, .detail-title { letter-spacing: ${c.headingLetterSpacing}em !important; }`,
    );
  }

  return rules.join("\n");
}

/**
 * Injects (or replaces) a `<style>` tag in the iframe's document to apply
 * typography and colour customizations. The canonical file is never
 * rewritten — all overrides are additive.
 */
export function applyPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization,
): void {
  const doc = frame?.contentDocument;
  if (!doc) return;

  // Remove any previous customization style
  doc.getElementById(CUSTOMIZATION_STYLE_ID)?.remove();

  if (!customization) return;

  const css = buildCustomizationCSS(customization);
  if (!css) return;

  const style = doc.createElement("style");
  style.id = CUSTOMIZATION_STYLE_ID;
  style.textContent = css;
  doc.head.appendChild(style);
}

/**
 * Sends customization via postMessage for cross-origin (srcdoc) frames where
 * contentDocument access is blocked by the sandbox. The canonical source for
 * CompleteShelfLandingPage is same-origin so this is a no-op in most cases,
 * but the architecture keeps it for completeness.
 */
export function postPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization,
): void {
  if (!frame?.contentWindow || !customization) return;
  try {
    frame.contentWindow.postMessage(
      { type: "threeui-page-customization", customization },
      "*",
    );
  } catch {
    // Cross-origin post may fail silently in some sandbox configurations
  }
}

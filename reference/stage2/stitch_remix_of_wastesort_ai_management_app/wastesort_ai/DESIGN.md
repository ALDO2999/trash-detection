---
name: WasteSort AI
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#40493d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#7a5649'
  on-secondary: '#ffffff'
  secondary-container: '#fdcdbc'
  on-secondary-container: '#795548'
  tertiary: '#6d5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c6800'
  on-tertiary-container: '#ffefd6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ebbcac'
  on-secondary-fixed: '#2e150b'
  on-secondary-fixed-variant: '#603f33'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#fabd00'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: auto
  max-width: 1200px
---

## Brand & Style
The design system is built on the principles of **Environmental Responsibility, Cognitive Ease, and Trust**. It aims to transform the chore of waste management into a seamless, AI-driven experience that feels optimistic rather than clinical.

The visual style is **Modern Corporate**, blending the high-utility of SaaS interfaces with an organic, approachable warmth. It utilizes generous whitespace, soft edges, and a clear hierarchy to reduce the cognitive load of sorting complex materials. The interface should feel like a helpful assistant—clean, precise, and encouraging.

## Colors
This design system uses a palette inspired by the natural world, reinforced by high-visibility functional colors.

*   **Eco Green (Primary):** Representing growth and sustainability. Used for primary actions, success states, and key brand moments.
*   **Earth Brown (Secondary):** Providing a grounded, organic anchor. Used for secondary navigation elements and subtle accents to move away from a purely "tech" feel.
*   **Warning Yellow (Tertiary):** A high-contrast safety color used exclusively for urgent notifications, hazardous material warnings, and pending AI confirmations.
*   **Clean White & Neutrals:** The foundation of the UI, ensuring the AI-generated imagery and iconography remain the focal point.

## Typography
The typography strategy pairs **Plus Jakarta Sans** for headlines to provide a friendly, rounded, and optimistic character, with **Inter** for body and UI elements to ensure maximum legibility and functional clarity.

Scale headlines down on mobile devices using the `-mobile` tokens to maintain a comfortable reading rhythm. Use `label-md` for buttons and navigation items to ensure they are distinct from editorial body text.

## Layout & Spacing
This design system utilizes a **12-column fluid grid** for desktop and a **4-column fluid grid** for mobile. 

The rhythm is based on an **8px linear scale**. Use `md` (24px) for standard padding within cards and containers. For mobile views, margins should be set to `margin-mobile` to ensure content doesn't bleed into device edges, while desktop views should be constrained to a `max-width` centered on the screen to prevent excessive line lengths.

## Elevation & Depth
Depth is communicated through **Tonal Layering** supplemented by **Soft Ambient Shadows**. 

1.  **Background:** The lowest layer (Clean White).
2.  **Surface:** Cards and containers use a very subtle 1px border (#E0E0E0) and a broad, low-opacity shadow (0px 4px 20px rgba(0,0,0,0.04)) to appear "soft" and raised.
3.  **Interactive:** Hover states on cards should increase the shadow spread and slightly shift the Y-axis to provide tactile feedback.
4.  **Overlays:** Modals and dropdowns use a "Glassmorphism" effect with a 12px backdrop blur and 80% opacity to maintain context of the underlying environment.

## Shapes
The shape language is **Rounded**, favoring organic curves over sharp angles to reinforce the "approachable" brand personality.

*   **Standard Elements:** Buttons, inputs, and small widgets use a `0.5rem` radius.
*   **Large Containers:** Cards and educational modules use `rounded-lg` (1rem) or `rounded-xl` (1.5rem) to create a soft, inviting container for information.
*   **Icons:** Always use rounded caps and joins for iconography to match the corner radius of UI elements.

## Components
Consistent component execution is vital for a trustworthy AI experience:

*   **Buttons:** Primary buttons are fully rounded (pill-shaped) using Eco Green. Secondary buttons use a transparent background with a 1.5px Earth Brown border.
*   **Soft Cards:** Use for item identification. They must include a subtle inner padding and a light background tint (#F9FAF8) to separate them from the main background.
*   **Input Fields:** Use a solid #F1F1F1 background with no initial border. Upon focus, they transition to a white background with an Eco Green 2px border. Inline validation should appear immediately below the field in Earth Brown (for info) or a specialized Red (for errors).
*   **Progress Indicators:** For multi-step sorting forms, use a horizontal "step-and-line" indicator. Completed steps are marked with an Eco Green checkmark; the active step features a pulsing glow.
*   **Chips:** Used for waste categories (e.g., "Plastic," "Paper"). These use a low-saturation version of the primary color with `label-sm` typography.
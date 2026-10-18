import { createGlobalStyle } from 'styled-components'
import '@fontsource-variable/geist'
import '@fontsource-variable/jetbrains-mono'

export const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: light;
    --background: #f4f2ef;
    --foreground: #14100e;
    --foreground-muted: #5f5952;
    --foreground-subtle: #928a82;
    --surface: #fffefc;
    --surface-raised: #f8f6f2;
    --sidebar: #eeebe6;
    --accent: #eeebe6;
    --border: #e2ded8;
    --border-soft: #eeeae5;
    --editor-active-line: #f8f6f2;
    --selection: rgb(255 92 58 / 20%);
    --brand: #ff5c3a;
    --brand-soft: rgb(255 92 58 / 13%);
    --danger: #e81123;
    --success: #16845b;
  }

  :root.dark {
    color-scheme: dark;
    --background: #08090a;
    --foreground: #f2f3f3;
    --foreground-muted: #a3aaad;
    --foreground-subtle: #697174;
    --surface: #0e1011;
    --surface-raised: #131617;
    --sidebar: #0a0c0d;
    --accent: #1d2223;
    --border: #212527;
    --border-soft: #191d1f;
    --editor-active-line: #111415;
    --selection: rgb(255 92 58 / 22%);
    --brand: #ff5c3a;
    --brand-soft: rgb(255 92 58 / 13%);
    --danger: #e81123;
    --success: #4ade80;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  body {
    overflow: hidden;
    background: var(--background);
    color: var(--foreground);
    font-family: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar {
    width: 11px;
    height: 11px;
  }

  ::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: var(--foreground-muted);
    background-clip: padding-box;
  }

  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 220ms;
    animation-timing-function: ease;
  }

  .theme-switching *,
  .theme-switching *::before,
  .theme-switching *::after {
    transition: none !important;
  }
`

import { createGlobalStyle } from "styled-components";

export const GlobalStyled = createGlobalStyle`
/*Reset*/
/* 17a1f1 */
:root {
  --main: #4f46e5;
  --nav: #17a1f1;
  --light: #fff;
  --gray: #eeeeee;
  --dark: #000;

  /* tema claro (padrão) */
  --bg: #ffffff;
  --bg-card: #fafafa;
  --panel-bg: #f1f5f9;
  --panel-border: #e2e8f0;
  --bg-input: #f1f1f1;
  --text-primary: #000000;
  --text-secondary: #222222;
  --text-muted: #6b7280;
  --border-color: #cccccc;
  --border-light: #e6e6e6;
  --divider: #dddddd;
  --pre-border: #030303;
  --velocimetro-bg: #e9eef5;
  --velocimetro-hover: #d3dae6;
  --tom-btn-bg: #f1f1f1;
  --tom-active-bg: #222222;
  --tom-active-text: #ffffff;
  --card-head-bg: #e9e3ff;
  --card-head-text: #4c3fb3;
}

[data-theme="dark"] {
  --light: #1e1e1e;
  --gray: #2a2a2a;
  --dark: #e8e8e8;
  --bg: #111111;
  --bg-card: #1a1a1a;
  --bg-input: #2a2a2a;
  --text-primary: #e8e8e8;
  --text-secondary: #cccccc;
  --text-muted: #9ca3af;
  --border-color: #3f3f3f;
  --border-light: #2d2d2d;
  --divider: #333333;
  --pre-border: #3f3f3f;
  --panel-bg: #1a1f33;
  --panel-border: #2a2f4a;
  --velocimetro-bg: #1e2433;
  --velocimetro-hover: #2d3748;
  --tom-btn-bg: #2a2a2a;
  --tom-active-bg: #6b5cff;
  --tom-active-text: #ffffff;
  --card-head-bg: #2a1f52;
  --card-head-text: #c4b5fd;
}
html {
  box-sizing: border-box;
  scroll-behavior: smooth;
  cursor: default;
  font-family: "Roboto", sans-serif;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

body {
  min-height: 100vh;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
  background-color: var(--bg);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

body,
h1,
h2,
h3,
h4,
h5,
h6,
ul,
ol,
li,
p,
pre,
blockquote,
figure,
figcaption,
hr,
dl,
dd {
  margin: 0;
  padding: 0;
}

ul,
ol {
  list-style: none;
}

input,
textarea,
select,
button {
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
}

input[type="text"],
textarea {
  width: 100%;
}

input,
textarea,
button {
  border: 1px solid gray;
}

button {
  padding: 0;
  line-height: inherit;
  border-radius: 0;
  background-color: transparent;
  cursor: pointer;
}

img,
iframe,
video,
object,
embed {
  display: block;
  max-width: 100%;
}

svg {
  max-width: 100%;
}

table {
  table-layout: fixed;
  width: 100%;
}

[hidden] {
  opacity: 0;
  visibility: hidden;
}

noscript {
  display: block;
  margin-bottom: 1em;
  margin-top: 1em;
}

[tabindex="-1"] {
  outline: none !important;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: auto;
  margin: 0;
  padding: 0;
  border: 0;
  clip: rect(0 0 0 0);
  overflow: hidden;
  white-space: nowrap;
}

* {
  text-decoration: none;
  color: inherit;
  box-sizing: border-box;
}

h1,
h2,
h3,
h4,
h5,
h6,
p,
span {
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  line-height: inherit;
}

img {
  display: block;
  max-width: 100%;
}

a {
  margin: 0px;
  padding: 0px;
  display: block;
}

table {
  border-spacing: 0px;
}

button {
  border: none;
}
hr {
  border: none;
}

a,
button,
svg path {
  transition: 0.3s;
}

[data-theme="dark"] img[src$="back.svg"],
[data-theme="dark"] img[src$="update.svg"],
[data-theme="dark"] img[src$="delete.svg"],
[data-theme="dark"] img[src$="share.svg"],
[data-theme="dark"] img[src$="music.svg"],
[data-theme="dark"] img[src$="pause.svg"],
[data-theme="dark"] img[src$="closeeye.svg"],
[data-theme="dark"] img[src$="openeye.svg"] {
  filter: invert(1);
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--main);
  outline-offset: 2px;
}

#root {
 display: flex;
 flex-direction: column;
 align-items: center;
}
.btn {
  background-color: var(--main);
  max-width: fit-content;
  padding: 5px 20px;
  border-radius: 0.3em;
  color: var(--light);
  border: 1px solid var(--main);
  &:hover {
    background-color: var(--light);
    color: var(--main);
  }
}
.btn.adicionar-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6b5cff, #5a4ad9);
  color: #fff;
  font-size: 14px;
  line-height: 1.2;
  font-weight: 700;
  box-shadow: 0 6px 14px rgba(107, 92, 255, 0.3);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(107, 92, 255, 0.35);
    color: #fff;
  }
}

@media only screen and (max-width: 700px) {
  .btn.adicionar-primary {
    padding: 8px 10px;
    font-size: 14px;
    white-space: nowrap;
    border-radius: 5px;

  }
}

@media only screen and (max-width: 430px) {
  .btn.adicionar-primary {
    padding: 6px 9px;
    font-size: 12px;
    white-space: nowrap;
    border-radius: 5px;
  }
}
.btn-danger {
  background-color: red;
  border: 1px solid red;&:hover {
    background-color: transparent;
    color: red;
  }
}
.img-hover {
  transition: 0.3s;
  &:hover {
    filter: drop-shadow(0 0 3px var(--main));
  }
}

img[src$="back.svg"],
img[alt="Voltar"] {
  width: 38px !important;
  height: 38px !important;
  padding: 7px;
  border-radius: 8px;
  display: block;
}

button:hover img[src$="back.svg"],
button:hover img[alt="Voltar"] {
  background: var(--bg-input);
}

@media only screen and (max-width: 700px) {
  img[src$="back.svg"],
  img[alt="Voltar"] {
    width: 36px !important;
    height: 36px !important;
    padding: 8px;
  }
}

@media only screen and (max-width: 420px) {
  img[src$="back.svg"],
  img[alt="Voltar"] {
    width: 34px !important;
    height: 34px !important;
    padding: 9px;
  }
}
.btn-success {
  background-color: green;
  border: 1px solid green;
  &:hover {
    background-color: transparent;
    color: green;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.modal-actions .btn,
.modal-actions .btn-danger,
.modal-actions .btn-success {
  min-width: 104px;
  height: 34px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px;
}

/* ===== Tipos de toast ===== */
.toast[data-type="success"] {
  border-left: 5px solid #22c55e; /* verde */
}

.toast[data-type="error"] {
  border-left: 5px solid #ef4444; /* vermelho */
}

.toast[data-type="warning"] {
  border-left: 5px solid #f59e0b; /* amarelo */
}

.toast[data-type="info"] {
  border-left: 5px solid #3b82f6; /* azul */
}

.toast[data-type="loading"] {
  border-left: 5px solid #6366f1; /* roxo pro loading */
}`;

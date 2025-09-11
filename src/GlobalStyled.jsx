import { createGlobalStyle } from "styled-components";
import { Toaster } from "sonner";

export const GlobalStyled = createGlobalStyle`
/*Reset*/
/* 17a1f1 */
:root {
  --main: #4f46e5;
  --light: #fff;
  --gray: #eeeeee;
  --dark: #000;
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
.btn-success {
  background-color: green;
  border: 1px solid green;
  &:hover {
    background-color: transparent;
    color: green;
  }
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

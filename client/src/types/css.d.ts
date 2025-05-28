/// <reference types="@types/tailwindcss" />

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

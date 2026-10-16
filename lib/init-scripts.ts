/**
 * Inline scripts that run in <head> before first paint. They live in a plain
 * module (no "use client") so the server layout gets the real strings:
 * exports from a client module reach server components as stubs.
 */

export const THEME_KEY = "klyte-theme";
export const POUR_KEY = "klyte-poured";

/** Saved theme wins, otherwise the OS preference, so the page never flashes the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`;

/** Returning visitors (and reduced motion) skip the pour loader. */
export const pourInitScript = `(function(){try{if(localStorage.getItem('${POUR_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.poured='1'}}catch(e){document.documentElement.dataset.poured='1'}})();`;

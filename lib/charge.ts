/**
 * Shared "hold to recharge" charge, 0..1. The hero's hold loop writes it every
 * frame; the 3D can and fruit read it inside useFrame. A plain mutable object
 * on purpose: per-frame values must not go through React state.
 */
export const charge = {
  value: 0,
  /** performance.now() when the page hit 100%, or 0. */
  rechargedAt: 0,
};

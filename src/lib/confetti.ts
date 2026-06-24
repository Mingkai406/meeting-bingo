import confetti from 'canvas-confetti';

/**
 * Fire a silent confetti burst on win. canvas-confetti is silent by design;
 * `disableForReducedMotion` skips it entirely for users who prefer reduced motion.
 */
export function fireConfetti(): void {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    disableForReducedMotion: true,
  });
}

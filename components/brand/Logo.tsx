"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/** The traced crystal silhouette with the eighth-note carved out (even-odd). */
const CRYSTAL_PATH =
  "M 518.500 179.853 C 516.300 180.917, 511.110 184.649, 506.966 188.144 C 499.817 194.176, 452.664 234.936, 423.908 259.941 C 419.833 263.484, 405.925 275.564, 393 286.786 C 357.628 317.497, 361.132 311.386, 349.016 363.500 C 344.029 384.950, 338.776 407.225, 337.342 413 C 335.909 418.775, 334.615 426.650, 334.468 430.500 C 334.169 438.305, 330.686 448.025, 320.492 469.500 C 312.993 485.297, 294.358 525.018, 286.479 542 C 283.034 549.425, 276.749 562.925, 272.512 572 C 259.654 599.542, 257.998 603.751, 258.022 608.839 C 258.059 616.638, 258.969 618.102, 281.748 647 C 285.433 651.675, 297.023 666.750, 307.503 680.500 C 317.984 694.250, 333.973 714.725, 343.035 726 C 352.097 737.275, 364.189 752.575, 369.906 760 C 388.137 783.678, 395.326 788.913, 404.946 785.519 C 408.209 784.368, 409.801 784.367, 415.156 785.516 C 418.645 786.265, 433.425 788.734, 448 791.004 C 481.578 796.232, 513.526 801.866, 582 814.633 C 611.375 820.110, 617.198 820.142, 627.894 814.887 C 639.456 809.208, 643.616 803.880, 649.701 786.961 C 656.331 768.527, 680.030 700.661, 682.973 691.684 C 685.701 683.362, 693.022 668.951, 703.642 651 C 717.143 628.178, 725.448 613.918, 731.011 604 C 733.942 598.775, 737.722 592.250, 739.412 589.500 C 741.946 585.375, 742.483 583.450, 742.480 578.500 L 742.476 572.500 720.875 539.849 C 688.422 490.796, 683.468 477.136, 681.035 430 C 680.452 418.725, 679.545 401.850, 679.019 392.500 C 678.492 383.150, 677.767 370.100, 677.408 363.500 C 676.430 345.519, 674.805 342.321, 654.500 318.397 C 651.200 314.509, 645.963 308.217, 642.863 304.414 C 621.497 278.208, 597.588 250.241, 559.585 207 C 552.093 198.475, 544.424 189.216, 542.543 186.424 C 537.777 179.349, 536.850 178.784, 529.235 178.324 C 524.010 178.008, 521.603 178.351, 518.500 179.853 M 479.795 336.587 C 471.277 339.207, 472 326.967, 472 468.523 C 472 556.786, 471.679 594.921, 470.929 595.671 C 470.225 596.375, 465.354 596.572, 456.679 596.246 C 435.651 595.457, 422.972 598.341, 406.282 607.709 C 358.032 634.792, 347.299 692.856, 386.684 713.734 C 425.867 734.505, 483.474 714.580, 508.795 671.500 C 521.220 650.360, 521.069 652.230, 520.965 521.294 C 520.917 460.636, 521.156 410.556, 521.498 410.004 C 525.335 403.796, 563.815 424.330, 579.226 440.809 C 597.079 459.900, 604.297 480.911, 604.422 514.155 C 604.465 525.514, 604.846 534.595, 605.269 534.334 C 606.762 533.411, 610.798 524.401, 613.360 516.273 C 621.697 489.820, 622.377 465.821, 615.351 446 C 598.143 397.456, 566.880 367.061, 513.014 346.505 C 508.005 344.594, 502.016 341.937, 499.704 340.601 C 496.541 338.773, 485.055 334.575, 484.568 335.070 C 484.531 335.108, 482.383 335.791, 479.795 336.587";

/**
 * SilverStone Studio brand mark — a faceted crystal "stone" with an eighth-note
 * carved through it as negative space. Pure inline SVG; the crystal carries the
 * theme's brand-blue gradient (top-left light → bottom-right deep), and the note
 * is a transparent cut-out so it always shows the surface behind it. One mark,
 * used at any size.
 */
export function LogoMark({ className, title = "SilverStone Studio" }: { className?: string; title?: string }) {
  const uid = useId().replace(/:/g, "");
  const crystal = `ss-crystal-${uid}`;
  const sheen = `ss-sheen-${uid}`;
  const clip = `ss-clip-${uid}`;
  return (
    <svg
      viewBox="248 170 504 660"
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={crystal} x1="300" y1="210" x2="720" y2="800" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7cc4ff" />
          <stop offset="0.32" stopColor="#1c9bff" />
          <stop offset="0.62" stopColor="#0072e0" />
          <stop offset="0.84" stopColor="#0050a8" />
          <stop offset="1" stopColor="#00305e" />
        </linearGradient>
        <linearGradient id={sheen} x1="330" y1="200" x2="560" y2="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}>
          <path d={CRYSTAL_PATH} fillRule="evenodd" />
        </clipPath>
      </defs>
      {/* faceted crystal with the note carved out */}
      <path d={CRYSTAL_PATH} fill={`url(#${crystal})`} fillRule="evenodd" />
      {/* top-left facet sheen for dimension */}
      <g clipPath={`url(#${clip})`}>
        <path d="M 518 180 L 360 320 L 300 470 L 258 608 L 340 500 L 460 340 Z" fill={`url(#${sheen})`} />
      </g>
    </svg>
  );
}

/** Full lockup: mark + wordmark. */
export function Logo({
  className,
  showSub = true,
}: {
  className?: string;
  showSub?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8" />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
          SilverStone <span className="text-[var(--color-ink-muted)]">Studio</span>
        </div>
        {showSub && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-subtle)]">
            Music Studio
          </div>
        )}
      </div>
    </div>
  );
}

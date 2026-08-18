/* =====================================================================
   Shape Icon Library — assets/shape-icons.js
   ---------------------------------------------------------------------
   Centralized SVG icons for diamond / gem shapes. Used by the ring
   configurator templates in place of icons returned by the WBB plugin.

   The four base shapes (Round-Brilliant, Cushion, Emerald, Pear) come
   from the design package; the remaining shapes (Oval, Marquise,
   Princess, Asscher, Radiant, Heart, Trillion, Baguette) are drawn in
   the same line-art style: 50×50 viewBox, stroke="currentColor",
   stroke-width 0.5 (or 0.7 for Cushion to match the original artwork),
   fill="none".

   Usage:
       const svg = getShapeIcon('round-brilliant');
       el.innerHTML = svg;   // strokes follow CSS color

   Exposes:
       window.SHAPE_ICONS  — { [normalizedKey]: svgString }
       window.getShapeIcon — (rawKey) => svgString | null
   ===================================================================== */

(function () {
        'use strict';

        // ── 1. The icon table (JSON-shaped data) ─────────────────────────
        // Keys are normalized (lowercase, hyphenated). `getShapeIcon` does
        // the same normalization on lookup so callers can pass tag values
        // verbatim ("Round Brilliant", "round_brilliant", "ROUND-BRILLIANT").
        const SHAPE_ICONS = {

                // ── Provided artwork (normalized stroke to currentColor) ──

                'round-brilliant': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.9988 37.9998C32.1784 37.9998 37.9986 32.1796 37.9986 25C37.9986 17.8204 32.1784 12.0002 24.9988 12.0002C17.8192 12.0002 11.999 17.8204 11.999 25C11.999 32.1796 17.8192 37.9998 24.9988 37.9998Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M24.999 17.7117L30.0895 19.8213L32.1979 24.9118L30.0895 30.0035L24.999 32.112L19.9072 30.0035L17.7988 24.9118L19.9072 19.8213L24.999 17.7117Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M34.1829 28.6818V34.1886H28.8818" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M28.7358 15.8079H34.1827V21.1042" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M15.8022 21.2559V15.8079H21.1186" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M21.3079 34.1886H15.8022V28.8594" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M30.0895 36.9649L28.8783 34.1815L24.9989 37.9998L21.2689 34.2027L19.9072 36.9649" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.9072 13.0351L21.1184 15.8184L24.9989 12.0002L28.7278 15.7961L30.0895 13.0351" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.034 30.0847L15.8163 28.8735L11.998 24.9929L15.7951 21.2641L13.0329 19.9024" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M36.966 19.9023L34.1826 21.1135L38.0008 24.9929L34.205 28.7229L36.966 30.0846" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M21.1183 15.8184L19.9071 19.8212L15.7949 21.2641L17.7987 24.9118L15.8161 28.8735L19.9071 30.0035L21.2688 34.2027L24.9988 32.1119L28.8782 34.1815L30.0894 30.0035L34.2051 28.7229L32.1978 24.9118L34.1827 21.1136L30.0894 19.8212L28.7277 15.7961L24.9988 17.7116L21.1183 15.8184Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
</svg>`,

                'cushion': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30.2881 37.5776H19.7107C15.6855 37.5776 12.4224 34.3144 12.4224 30.2893V19.7119C12.4224 15.6867 15.6855 12.4236 19.7107 12.4236H30.2881C34.3132 12.4236 37.5764 15.6867 37.5764 19.7119V30.2893C37.5776 34.3144 34.3144 37.5776 30.2881 37.5776Z" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M14.5566 14.5567L19.7001 15.4163L25 17.4377L30.2998 15.4163L35.4421 14.5567L34.5825 19.7001L32.7328 25.1717L34.5825 30.2999L35.4421 35.4421L30.2998 34.5825L25 32.9045L19.7001 34.5825L14.5566 35.4421L15.4162 30.2999L17.266 25.1717L15.4162 19.7001L14.5566 14.5567Z" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M20.4116 31.0113L19.7002 30.2999" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M30.2998 30.2999L29.5884 31.0113" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M19.7002 19.7001L20.4116 18.9887L25.0001 17.4377L29.5885 18.9887L30.2999 19.7001" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M19.7003 30.2999L18.9888 29.5884L17.2661 25.1717L18.9888 20.4116L19.7003 19.7001" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M31.0112 29.5884L30.2998 30.2999" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M30.2998 19.7001L31.0112 20.4116" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M34.5825 19.7001L37.5776 25.1717L34.5825 30.2999L31.0112 29.5884L32.7328 25.1717L31.0112 20.4116L34.5825 19.7001Z" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.7002 34.5826L25.0001 37.5776L30.2999 34.5826L29.5885 31.0113L25.0001 32.9045L20.4116 31.0113L19.7002 34.5826Z" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M20.4116 18.9887L19.7002 15.4163L25.0001 12.4224L30.2999 15.4163L29.5885 18.9887" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.9887 29.5884L15.4162 30.2999L12.4224 25L15.4162 19.7001L18.9887 20.4116" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.9888 12.4224L19.7002 15.4163" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M31.0112 12.4577L30.2998 15.4163" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M31.0112 37.5423L30.2998 34.5826" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M18.9888 37.5776L19.7002 34.5826" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M12.4578 31.0113L15.4164 30.2999" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M12.5117 18.5689L15.4162 19.7001" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M37.5776 18.5689L34.5825 19.7001" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
<path d="M37.5423 31.0113L34.5825 30.2999" stroke="currentColor" stroke-width="0.7" stroke-miterlimit="10"/>
</svg>`,

                'emerald': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.682 10L14 12.6082V30.3909L16.682 33H27.7776L30.4597 30.3909V12.6082L27.7776 10H16.682Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.2818 11.082L15.0576 13.2712V29.728L17.2818 31.9172H27.1778L29.402 29.728V13.2712L27.1778 11.082H17.2818Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.8815 12.1648L16.1152 13.934V29.0658L17.8815 30.835H26.577L28.3443 29.0658V13.934L26.577 12.1648H17.8815Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4823 13.2468L17.1729 14.5971V28.4029L18.4823 29.7532H25.9772L27.2857 28.4029V14.5971L25.9772 13.2468H18.4823Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.6821 10L17.2819 11.082L17.8817 12.1649L18.4825 13.2468" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14 12.6082L15.0577 13.2711L16.1153 13.9341L17.173 14.5971" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M27.7779 10L25.9775 13.2468" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M30.4596 12.6082L27.2856 14.5971" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M30.4596 30.3908L27.2856 28.4028" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M27.7779 33L25.9775 29.7532" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.6821 33L18.4825 29.7532" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14 30.3908L17.173 28.4028" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
</svg>
`,

                'pear': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30.3997 21.5992L24.9999 38.9005L19.6001 21.5992" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M31.6332 25.2211L30.3997 21.5992" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M19.6 21.5992L18.3665 25.2211" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M24.9999 38.9005C24.9999 38.9005 32.8174 32.5988 34.2155 22.6211C35.3491 14.532 29.7823 11.0995 24.9999 11.0995C20.2174 11.0995 14.6506 14.5332 15.7842 22.6211C17.1824 32.5988 24.9999 38.9005 24.9999 38.9005Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M28.6994 14.1545L24.9999 11.0995L21.2993 14.1545" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M28.6994 14.1545L29.4003 17.0873L25 15.9325L28.6994 14.1545Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M20.5996 17.0873L21.2992 14.1545L24.9998 15.9325L20.5996 17.0873ZM20.5996 17.0873L17.675 17.9657" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M32.3247 17.9657L29.4001 17.0872" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M29.821 12.3189L28.6992 14.1545L32.3246 14.3779" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M17.675 14.3779L21.2992 14.1545L20.1786 12.3189" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M20.5996 17.0873L19.6 21.5993L17.675 17.9657V14.3779" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M29.4001 17.0873L30.3997 21.5993L32.3247 17.9657V14.3779" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M26.7168 33.3996L28.2137 35.6021" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.7849 35.6021L23.283 33.3996" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M26.7168 33.3996L31.3252 31.0607" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M18.6733 31.0607L23.2829 33.3996" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M15.6748 21.5992L18.3665 25.2211" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M26.7167 33.3996L18.3666 25.2211L16.5745 26.1606" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M15.9723 17.7716L17.675 17.9657L15.6748 21.5992" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M34.3249 21.5992L32.3247 17.9657L34.0263 17.7716" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.3665 25.2211L18.6734 31.0607" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M31.6333 25.2211L31.3252 31.0607" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M33.4252 26.1606L31.6331 25.2211L34.3248 21.5992L31.6331 25.2211L23.283 33.3996" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
</svg>`,

                // ── Derived line-art (matched style) ─────────────────────────

                // Oval — elongated round with cross + diagonal facets.
                'oval': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.9695 12.6775V32.3222" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.467 32.3222V12.6775" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M22.2188 34C26.2056 34 29.4376 28.8513 29.4376 22.5C29.4376 16.1487 26.2056 11 22.2188 11C18.232 11 15 16.1487 15 22.5C15 28.8513 18.232 34 22.2188 34Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M15 22.5H16.3023" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.467 12.6728L22.2189 14.0146V11" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.9753 12.6775L22.2186 14.0144L23.4458 16.2522H20.9905L22.2186 14.0144" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M29.4376 22.5001H28.1344L29.0363 18.7107L25.9697 16.6201L23.446 16.2524L25.9697 19.7887L28.1344 22.5001L29.0363 26.2885L25.9697 28.38L28.1344 29.0913" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M28.1343 22.5L25.9696 25.2114L23.4459 28.7476L22.2188 30.9854V34" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.3025 29.0912L18.4672 28.3799L20.9908 28.7476L22.219 30.9854L18.4623 32.3223" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4669 16.6201L15.3984 18.7463L16.3022 22.5001L15.3984 26.2846L18.4669 28.38" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M22.2188 30.9854L25.9754 32.3223" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.9695 16.62L28.1342 15.9087" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.9699 28.3799L23.4462 28.7475H20.9908L18.4672 25.2402L16.3025 22.4999L18.4672 19.7885L20.9908 16.2523L18.4672 16.62L16.3025 15.9087" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
</svg>
`,

                // Marquise — pointed oval (boat shape).
                'marquise': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25 10.5 C 33 17, 33 33, 25 39.5 C 17 33, 17 17, 25 10.5 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M25 15 C 30 19, 30 31, 25 35 C 20 31, 20 19, 25 15 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<line x1="25" y1="10.5" x2="25" y2="39.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="20" y1="25" x2="30" y2="25" stroke="currentColor" stroke-width="0.5"/>
<path d="M25 17 L 28 25 L 25 33 L 22 25 Z" stroke="currentColor" stroke-width="0.5" stroke-linejoin="bevel"/>
</svg>`,

                // Princess — square with diagonal facets meeting in centre.
                'princess': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="12" y="12" width="26" height="26" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<rect x="15.5" y="15.5" width="19" height="19" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<line x1="12" y1="12" x2="38" y2="38" stroke="currentColor" stroke-width="0.5"/>
<line x1="38" y1="12" x2="12" y2="38" stroke="currentColor" stroke-width="0.5"/>
<rect x="22" y="22" width="6" height="6" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                // Asscher — square with chamfered corners (step-cut).
                'asscher': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 12 L 34 12 L 38 16 L 38 34 L 34 38 L 16 38 L 12 34 L 12 16 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18 15.5 L 32 15.5 L 34.5 18 L 34.5 32 L 32 34.5 L 18 34.5 L 15.5 32 L 15.5 18 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<rect x="21.5" y="21.5" width="7" height="7" stroke="currentColor" stroke-width="0.5"/>
<line x1="16" y1="12" x2="18" y2="15.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="34" y1="12" x2="32" y2="15.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="38" y1="16" x2="34.5" y2="18" stroke="currentColor" stroke-width="0.5"/>
<line x1="38" y1="34" x2="34.5" y2="32" stroke="currentColor" stroke-width="0.5"/>
<line x1="34" y1="38" x2="32" y2="34.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="16" y1="38" x2="18" y2="34.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="12" y1="34" x2="15.5" y2="32" stroke="currentColor" stroke-width="0.5"/>
<line x1="12" y1="16" x2="15.5" y2="18" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                // Radiant — rectangle with chamfered corners + cross facets.
                'radiant': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 11 L 32 11 L 38 15 L 38 35 L 32 39 L 18 39 L 12 35 L 12 15 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.5 14 L 30.5 14 L 34.5 17 L 34.5 33 L 30.5 36 L 19.5 36 L 15.5 33 L 15.5 17 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<line x1="18" y1="11" x2="19.5" y2="14" stroke="currentColor" stroke-width="0.5"/>
<line x1="32" y1="11" x2="30.5" y2="14" stroke="currentColor" stroke-width="0.5"/>
<line x1="38" y1="15" x2="34.5" y2="17" stroke="currentColor" stroke-width="0.5"/>
<line x1="38" y1="35" x2="34.5" y2="33" stroke="currentColor" stroke-width="0.5"/>
<line x1="32" y1="39" x2="30.5" y2="36" stroke="currentColor" stroke-width="0.5"/>
<line x1="18" y1="39" x2="19.5" y2="36" stroke="currentColor" stroke-width="0.5"/>
<line x1="12" y1="35" x2="15.5" y2="33" stroke="currentColor" stroke-width="0.5"/>
<line x1="12" y1="15" x2="15.5" y2="17" stroke="currentColor" stroke-width="0.5"/>
<line x1="25" y1="14" x2="25" y2="36" stroke="currentColor" stroke-width="0.5"/>
<line x1="15.5" y1="25" x2="34.5" y2="25" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                // Heart — twin lobes meeting at top, point at bottom.
                'heart': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25 38.5 C 12 28.5, 12 15.5, 19 12.5 C 22.5 12.5, 25 15.5, 25 18 C 25 15.5, 27.5 12.5, 31 12.5 C 38 15.5, 38 28.5, 25 38.5 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M25 34.5 C 16 27, 16 17.5, 20.5 15.5 C 23 15.5, 25 17.5, 25 19.5 C 25 17.5, 27 15.5, 29.5 15.5 C 34 17.5, 34 27, 25 34.5 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<line x1="25" y1="19.5" x2="25" y2="34.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="17" y1="22" x2="33" y2="22" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                // Trillion — equilateral-style triangle with inner facets.
                'trillion': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25 12 L 38 35 L 12 35 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25 16 L 34.5 32.5 L 15.5 32.5 Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<line x1="25" y1="12" x2="25" y2="22" stroke="currentColor" stroke-width="0.5"/>
<line x1="38" y1="35" x2="25" y2="22" stroke="currentColor" stroke-width="0.5"/>
<line x1="12" y1="35" x2="25" y2="22" stroke="currentColor" stroke-width="0.5"/>
<line x1="25" y1="22" x2="25" y2="32.5" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                // Baguette — narrow rectangle with vertical step-cut facets.
                'baguette': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="13" y="17" width="24" height="16" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<rect x="15.5" y="19.5" width="19" height="11" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<line x1="13" y1="17" x2="15.5" y2="19.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="37" y1="17" x2="34.5" y2="19.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="37" y1="33" x2="34.5" y2="30.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="13" y1="33" x2="15.5" y2="30.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="20" y1="19.5" x2="20" y2="30.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="25" y1="19.5" x2="25" y2="30.5" stroke="currentColor" stroke-width="0.5"/>
<line x1="30" y1="19.5" x2="30" y2="30.5" stroke="currentColor" stroke-width="0.5"/>
</svg>`,
        };

        // ── 1.1 Head type icons (Top-down view of empty ring setting) ───
        const HEAD_ICONS = {

                'tulip': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.9995 30.0333C28.9019 30.0333 34.4974 24.4378 34.4974 17.5353C34.4974 10.6329 28.9019 5.03735 21.9995 5.03735C15.097 5.03735 9.50146 10.6329 9.50146 17.5353C9.50146 24.4378 15.097 30.0333 21.9995 30.0333Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.9989 10.5291L26.8929 12.5572L28.92 17.4513L26.8929 22.3465L21.9989 24.3735L17.1037 22.3465L15.0767 17.4513L17.1037 12.5572L21.9989 10.5291Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M30.8293 21.0752V26.3695H25.7329" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.5923 8.69849H30.8289V13.7904" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.1572 13.9362V8.69849H18.2683" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4504 26.3696H13.1572V21.2461" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.8942 29.0388L25.7298 26.3628L22.0002 30.0336L18.4141 26.3831L17.105 29.0388" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.105 6.03222L18.2694 8.70818L22.0002 5.03735L25.5851 8.6867L26.8942 6.03222" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M10.496 22.4243L13.1708 21.2598L9.5 17.5291L13.1505 13.9442L10.4949 12.635" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M33.5046 12.635L30.8286 13.7995L34.4994 17.5291L30.8501 21.1151L33.5046 22.4243" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.2683 8.70849L17.1038 12.5568L13.1504 13.944L15.0768 17.4509L13.1707 21.2596L17.1038 22.3461L18.413 26.3832L21.999 24.3731L25.7286 26.3628L26.8931 22.3461L30.8499 21.1149L28.9201 17.4509L30.8285 13.7993L26.8931 12.5568L25.5839 8.68701L21.999 10.5286L18.2683 8.70849Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M11.1628 6.40535C11.4923 6.07614 12.0233 5.96183 12.6606 6.10082C13.2951 6.23937 13.9999 6.62528 14.6106 7.23606C15.1985 7.82405 15.4788 8.62655 15.5663 9.33666C15.6099 9.69036 15.6044 10.0129 15.5691 10.262C15.5514 10.3867 15.527 10.4885 15.5 10.5644C15.4748 10.6356 15.4518 10.6686 15.4427 10.6798C15.435 10.6837 15.4108 10.6959 15.3599 10.7115C15.2883 10.7335 15.1882 10.7544 15.0636 10.7702C14.8153 10.8017 14.4875 10.8101 14.1266 10.7723C13.3997 10.696 12.5768 10.4376 11.9928 9.85387C11.382 9.24309 10.9961 8.53835 10.8576 7.90381C10.7185 7.26635 10.8333 6.73481 11.1628 6.40535Z" fill="white" stroke="currentColor" stroke-width="0.5"/>
<path d="M11.1628 28.6664C11.4923 28.9956 12.0233 29.1099 12.6606 28.971C13.2951 28.8324 13.9999 28.4465 14.6106 27.8357C15.1985 27.2477 15.4788 26.4452 15.5663 25.7351C15.6099 25.3814 15.6044 25.0588 15.5691 24.8098C15.5514 24.6851 15.527 24.5833 15.5 24.5073C15.4748 24.4362 15.4518 24.4032 15.4427 24.392C15.435 24.3881 15.4108 24.3759 15.3599 24.3603C15.2883 24.3383 15.1882 24.3174 15.0636 24.3016C14.8153 24.2701 14.4875 24.2616 14.1266 24.2995C13.3997 24.3758 12.5768 24.6341 11.9928 25.2179C11.382 25.8287 10.9961 26.5334 10.8576 27.168C10.7185 27.8054 10.8333 28.337 11.1628 28.6664Z" fill="white" stroke="currentColor" stroke-width="0.5"/>
<path d="M32.8372 6.4051C32.5077 6.07589 31.9767 5.96159 31.3394 6.10058C30.7049 6.23913 30.0001 6.62503 29.3894 7.23582C28.8015 7.8238 28.5212 8.6263 28.4337 9.33642C28.3901 9.69012 28.3956 10.0127 28.4309 10.2617C28.4486 10.3864 28.473 10.4882 28.5 10.5642C28.5252 10.6353 28.5482 10.6683 28.5573 10.6795C28.565 10.6834 28.5892 10.6957 28.6401 10.7113C28.7117 10.7332 28.8118 10.7542 28.9364 10.77C29.1847 10.8015 29.5125 10.8099 29.8734 10.772C30.6003 10.6958 31.4232 10.4374 32.0072 9.85363C32.618 9.24285 33.0039 8.53811 33.1424 7.90356C33.2815 7.2661 33.1667 6.73456 32.8372 6.4051Z" fill="white" stroke="currentColor" stroke-width="0.5"/>
<path d="M32.8372 28.6664C32.5077 28.9956 31.9767 29.1099 31.3394 28.971C30.7049 28.8324 30.0001 28.4465 29.3894 27.8357C28.8015 27.2477 28.5212 26.4452 28.4337 25.7351C28.3901 25.3814 28.3956 25.0588 28.4309 24.8098C28.4486 24.6851 28.473 24.5833 28.5 24.5073C28.5252 24.4362 28.5482 24.4032 28.5573 24.392C28.565 24.3881 28.5892 24.3759 28.6401 24.3603C28.7117 24.3383 28.8118 24.3174 28.9364 24.3016C29.1847 24.2701 29.5125 24.2616 29.8734 24.2995C30.6003 24.3758 31.4232 24.6341 32.0072 25.2179C32.618 25.8287 33.0039 26.5334 33.1424 27.168C33.2815 27.8054 33.1667 28.337 32.8372 28.6664Z" fill="white" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                'solitaire-bezel': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.0002 41.3475C23.9214 41.3475 25.4788 39.79 25.4788 37.8687C25.4788 35.9474 23.9214 34.3899 22.0002 34.3899C20.0789 34.3899 18.5215 35.9474 18.5215 37.8687C18.5215 39.79 20.0789 41.3475 22.0002 41.3475Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M22.0005 35.918L23.3627 36.4825L23.9269 37.8448L23.3627 39.2073L22.0005 39.7716L20.6379 39.2073L20.0737 37.8448L20.6379 36.4825L22.0005 35.918Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M24.4571 38.854V40.3277H23.0386" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.0005 35.4087H24.458V36.826" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.5391 36.8666V35.4087H20.9617" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M21.0123 40.3273H19.5391V38.9011" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.3629 41.0705L23.0388 40.3257L22.0007 41.3475L21.0026 40.3313L20.6382 41.0705" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M20.6382 34.6668L20.9623 35.4117L22.0007 34.3899L22.9985 35.4057L23.3629 34.6668" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.7987 39.2292L19.5432 38.9051L18.5215 37.8666L19.5376 36.8688L18.7984 36.5044" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.2033 36.5044L24.4585 36.8285L25.4802 37.8666L24.4645 38.8648L25.2033 39.2292" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M20.9621 35.4122L20.638 36.4834L19.5376 36.8695L20.0738 37.8457L19.5433 38.9058L20.638 39.2082L21.0024 40.332L22.0005 39.7724L23.0386 40.3263L23.3627 39.2082L24.4641 38.8655L23.9269 37.8457L24.4581 36.8292L23.3627 36.4834L22.9983 35.4062L22.0005 35.9189L20.9621 35.4122Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<rect x="17.3799" y="33.2483" width="9.24043" height="9.24043" rx="4.62021" stroke="currentColor" stroke-width="0.5"/>
<path d="M21.9999 30.0333C28.9024 30.0333 34.4979 24.4378 34.4979 17.5353C34.4979 10.6329 28.9024 5.03735 21.9999 5.03735C15.0975 5.03735 9.50195 10.6329 9.50195 17.5353C9.50195 24.4378 15.0975 30.0333 21.9999 30.0333Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.9994 10.5291L26.8934 12.5572L28.9205 17.4513L26.8934 22.3465L21.9994 24.3735L17.1042 22.3465L15.0771 17.4513L17.1042 12.5572L21.9994 10.5291Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M30.8298 21.0752V26.3695H25.7334" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.5928 8.69849H30.8294V13.7904" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.1577 13.9362V8.69849H18.2688" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4508 26.3696H13.1577V21.2461" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.8947 29.0388L25.7303 26.3628L22.0007 30.0336L18.4146 26.3831L17.1055 29.0388" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.1055 6.03222L18.2699 8.70818L22.0007 5.03735L25.5856 8.6867L26.8947 6.03222" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M10.4965 22.4243L13.1713 21.2598L9.50049 17.5291L13.151 13.9442L10.4954 12.635" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M33.5051 12.635L30.8291 13.7995L34.4999 17.5291L30.8506 21.1151L33.5051 22.4243" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.2688 8.70849L17.1043 12.5568L13.1509 13.944L15.0773 17.4509L13.1712 21.2596L17.1043 22.3461L18.4135 26.3832L21.9995 24.3731L25.7291 26.3628L26.8936 22.3461L30.8504 21.1149L28.9206 17.4509L30.8289 13.7993L26.8936 12.5568L25.5844 8.68701L21.9995 10.5286L18.2688 8.70849Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<circle cx="31.3026" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="12.6976" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.3026" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="12.6981" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                'plain': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.9999 30.0333C28.9024 30.0333 34.4979 24.4378 34.4979 17.5353C34.4979 10.6329 28.9024 5.03735 21.9999 5.03735C15.0975 5.03735 9.50195 10.6329 9.50195 17.5353C9.50195 24.4378 15.0975 30.0333 21.9999 30.0333Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.9996 10.5291L26.8937 12.5572L28.9207 17.4513L26.8937 22.3465L21.9996 24.3735L17.1044 22.3465L15.0774 17.4513L17.1044 12.5572L21.9996 10.5291Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M30.8298 21.0752V26.3695H25.7334" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.5928 8.69849H30.8294V13.7904" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.1577 13.9362V8.69849H18.2688" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4508 26.3696H13.1577V21.2461" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.8947 29.0388L25.7303 26.3628L22.0007 30.0336L18.4146 26.3831L17.1055 29.0388" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.1055 6.03222L18.2699 8.70818L22.0007 5.03735L25.5856 8.6867L26.8947 6.03222" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M10.4965 22.4243L13.1713 21.2598L9.50049 17.5291L13.151 13.9442L10.4954 12.635" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M33.5051 12.635L30.8291 13.7995L34.4999 17.5291L30.8506 21.1151L33.5051 22.4243" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.2688 8.70849L17.1043 12.5568L13.1509 13.944L15.0773 17.4509L13.1712 21.2596L17.1043 22.3461L18.4135 26.3832L21.9995 24.3731L25.7291 26.3628L26.8936 22.3461L30.8504 21.1149L28.9206 17.4509L30.8289 13.7993L26.8936 12.5568L25.5844 8.68701L21.9995 10.5286L18.2688 8.70849Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<circle cx="9.91218" cy="10.805" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="34.0191" cy="10.805" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="9.91218" cy="24.1978" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="34.0191" cy="24.1978" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="22.4122" cy="31.3406" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="22.4122" cy="4.555" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                'plain-4': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.9995 30.0333C28.9019 30.0333 34.4974 24.4378 34.4974 17.5353C34.4974 10.6329 28.9019 5.03735 21.9995 5.03735C15.097 5.03735 9.50146 10.6329 9.50146 17.5353C9.50146 24.4378 15.097 30.0333 21.9995 30.0333Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.9991 10.5291L26.8932 12.5572L28.9202 17.4513L26.8932 22.3465L21.9991 24.3735L17.1039 22.3465L15.0769 17.4513L17.1039 12.5572L21.9991 10.5291Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M30.8293 21.0752V26.3695H25.7329" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.5923 8.69849H30.8289V13.7904" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.1575 13.9362V8.69849H18.2686" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4506 26.3696H13.1575V21.2461" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.8942 29.0388L25.7298 26.3628L22.0002 30.0336L18.4141 26.3831L17.105 29.0388" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.105 6.03222L18.2694 8.70818L22.0002 5.03735L25.5851 8.6867L26.8942 6.03222" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M10.496 22.4243L13.1708 21.2598L9.5 17.5291L13.1505 13.9442L10.4949 12.635" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M33.5048 12.635L30.8289 13.7995L34.4997 17.5291L30.8503 21.1151L33.5048 22.4243" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.2683 8.70849L17.1038 12.5568L13.1504 13.944L15.0768 17.4509L13.1707 21.2596L17.1038 22.3461L18.413 26.3832L21.999 24.3731L25.7286 26.3628L26.8931 22.3461L30.8499 21.1149L28.9201 17.4509L30.8285 13.7993L26.8931 12.5568L25.5839 8.68701L21.999 10.5286L18.2683 8.70849Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<circle cx="12.6978" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.3023" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.3023" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="12.6978" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                'hidden-halo-solitaire': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.9999 30.0333C28.9024 30.0333 34.4979 24.4378 34.4979 17.5353C34.4979 10.6329 28.9024 5.03735 21.9999 5.03735C15.0975 5.03735 9.50195 10.6329 9.50195 17.5353C9.50195 24.4378 15.0975 30.0333 21.9999 30.0333Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.9994 10.5291L26.8934 12.5572L28.9205 17.4513L26.8934 22.3465L21.9994 24.3735L17.1042 22.3465L15.0771 17.4513L17.1042 12.5572L21.9994 10.5291Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M30.8298 21.0752V26.3695H25.7334" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.5928 8.69849H30.8294V13.7904" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.1577 13.9362V8.69849H18.2688" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4508 26.3696H13.1577V21.2461" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.8947 29.0388L25.7303 26.3628L22.0007 30.0336L18.4146 26.3831L17.1055 29.0388" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.1055 6.03222L18.2699 8.70818L22.0007 5.03735L25.5856 8.6867L26.8947 6.03222" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M10.4965 22.4243L13.1713 21.2598L9.50049 17.5291L13.151 13.9442L10.4954 12.635" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M33.5051 12.635L30.8291 13.7995L34.4999 17.5291L30.8506 21.1151L33.5051 22.4243" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.2688 8.70849L17.1043 12.5568L13.1509 13.944L15.0773 17.4509L13.1712 21.2596L17.1043 22.3461L18.4135 26.3832L21.9995 24.3731L25.7291 26.3628L26.8936 22.3461L30.8504 21.1149L28.9206 17.4509L30.8289 13.7993L26.8936 12.5568L25.5844 8.68701L21.9995 10.5286L18.2688 8.70849Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<circle cx="12.6988" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.303" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="30.303" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="12.6986" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<path d="M15.6792 40.1152C16.8727 40.1152 17.8403 38.748 17.8403 37.0614C17.8403 35.3748 16.8727 34.0076 15.6792 34.0076C14.4856 34.0076 13.5181 35.3748 13.5181 37.0614C13.5181 38.748 14.4856 40.1152 15.6792 40.1152Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M15.6794 35.3491L16.5256 35.8447L16.8761 37.0405L16.5256 38.2367L15.6794 38.7319L14.8329 38.2367L14.4824 37.0405L14.8329 35.8447L15.6794 35.3491Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M17.2055 37.9263V39.2199H16.3242" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.2998 34.9014H17.2053V36.1455" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14.1499 36.1812V34.9014H15.0337" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M15.0652 39.2194H14.1499V37.9675" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.5257 39.8719L16.3244 39.218L15.6795 40.115L15.0594 39.223L14.833 39.8719" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14.833 34.2507L15.0344 34.9045L15.6795 34.0076L16.2993 34.8993L16.5257 34.2507" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.6908 38.2557L14.1533 37.9712L13.5186 37.0596L14.1498 36.1837L13.6906 35.8638" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.6683 35.8638L17.2056 36.1483L17.8403 37.0596L17.2093 37.9358L17.6683 38.2557" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M15.0344 34.9044L14.833 35.8447L14.1494 36.1837L14.4825 37.0406L14.1529 37.9712L14.833 38.2367L15.0594 39.2231L15.6795 38.732L16.3244 39.2182L16.5257 38.2367L17.2099 37.9359L16.8762 37.0406L17.2062 36.1483L16.5257 35.8447L16.2994 34.8992L15.6795 35.3492L15.0344 34.9044Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M21.9286 40.1152C23.6152 40.1152 24.9824 38.748 24.9824 37.0614C24.9824 35.3748 23.6152 34.0076 21.9286 34.0076C20.242 34.0076 18.8748 35.3748 18.8748 37.0614C18.8748 38.748 20.242 40.1152 21.9286 40.1152Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M21.9292 35.3491L23.125 35.8447L23.6203 37.0405L23.125 38.2367L21.9292 38.7319L20.7331 38.2367L20.2378 37.0405L20.7331 35.8447L21.9292 35.3491Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M24.0861 37.9263V39.2199H22.8408" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M22.8076 34.9014H24.0872V36.1455" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.769 36.1812V34.9014H21.0179" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M21.0624 39.2194H19.769V37.9675" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.1249 39.8719L22.8403 39.218L21.929 40.115L21.0528 39.223L20.7329 39.8719" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M20.7329 34.2507L21.0174 34.9045L21.929 34.0076L22.805 34.8993L23.1249 34.2507" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.1179 38.2557L19.7715 37.9712L18.8745 37.0596L19.7665 36.1837L19.1176 35.8638" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M24.7403 35.8638L24.0864 36.1483L24.9834 37.0596L24.0917 37.9358L24.7403 38.2557" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M21.0181 34.9044L20.7336 35.8447L19.7676 36.1837L20.2383 37.0406L19.7726 37.9712L20.7336 38.2367L21.0535 39.2231L21.9297 38.732L22.841 39.2182L23.1255 38.2367L24.0924 37.9359L23.6208 37.0406L24.0871 36.1483L23.1255 35.8447L22.8057 34.8992L21.9297 35.3492L21.0181 34.9044Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M28.2494 40.1152C29.4821 40.1152 30.4813 38.748 30.4813 37.0614C30.4813 35.3748 29.4821 34.0076 28.2494 34.0076C27.0168 34.0076 26.0176 35.3748 26.0176 37.0614C26.0176 38.748 27.0168 40.1152 28.2494 40.1152Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M28.2498 35.3491L29.1238 35.8447L29.4858 37.0405L29.1238 38.2367L28.2498 38.7319L27.3757 38.2367L27.0137 37.0405L27.3757 35.8447L28.2498 35.3491Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M29.8271 37.9263V39.2199H28.917" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M28.8916 34.9014H29.8267V36.1455" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.6709 36.1812V34.9014H27.5836" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M27.6161 39.2194H26.6709V37.9675" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M29.1241 39.8719L28.9162 39.218L28.2502 40.115L27.6098 39.223L27.376 39.8719" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M27.376 34.2507L27.5839 34.9045L28.2502 34.0076L28.8903 34.8993L29.1241 34.2507" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.1954 38.2557L26.6731 37.9712L26.0176 37.0596L26.6695 36.1837L26.1952 35.8638" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M30.304 35.8638L29.8262 36.1483L30.4817 37.0596L29.83 37.9358L30.304 38.2557" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M27.5839 34.9044L27.3759 35.8447L26.6699 36.1837L27.0139 37.0406L26.6736 37.9712L27.3759 38.2367L27.6097 39.2231L28.2501 38.732L28.9161 39.2182L29.1241 38.2367L29.8307 37.9359L29.4861 37.0406L29.8268 36.1483L29.1241 35.8447L28.8903 34.8992L28.2501 35.3492L27.5839 34.9044Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<circle cx="17.5359" cy="34.4539" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="19.3221" cy="34.4539" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="17.5359" cy="39.8108" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="19.3221" cy="39.8108" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="24.6785" cy="39.8108" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="26.4641" cy="39.8108" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="26.4641" cy="34.4539" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="24.6785" cy="34.4539" r="0.742857" fill="white" stroke="currentColor" stroke-width="0.3"/>
<rect x="13.321" y="33.811" width="17.3571" height="6.64286" rx="2.75" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                'hidden-halo': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="31.4224" y="33.6133" width="1.93508" height="6.19647" rx="0.96754" stroke="currentColor" stroke-width="0.5"/>
<rect x="9.75" y="33.6133" width="1.93508" height="6.19647" rx="0.96754" stroke="currentColor" stroke-width="0.5"/>
<path d="M21.9722 39.6194C23.5821 39.6194 24.8872 38.3143 24.8872 36.7043C24.8872 35.0944 23.5821 33.7893 21.9722 33.7893C20.3622 33.7893 19.0571 35.0944 19.0571 36.7043C19.0571 38.3143 20.3622 39.6194 21.9722 39.6194Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M21.972 35.0701L23.1135 35.5431L23.5862 36.6846L23.1135 37.8264L21.972 38.2991L20.8302 37.8264L20.3574 36.6846L20.8302 35.5431L21.972 35.0701Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M24.0315 37.53V38.7649H22.8428" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M22.8105 34.6428H24.0319V35.8305" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.9097 35.8645V34.6428H21.1018" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M21.1442 38.7646H19.9097V37.5696" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.1138 39.3871L22.8422 38.7629L21.9723 39.6191L21.1359 38.7677L20.8306 39.3871" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M20.8306 34.0216L21.1022 34.6457L21.9723 33.7896L22.8085 34.6407L23.1138 34.0216" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.2889 37.8445L19.9128 37.5729L19.0566 36.7028L19.9081 35.8666L19.2887 35.5613" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M24.6559 35.5613L24.0317 35.8329L24.8879 36.7028L24.0367 37.5392L24.6559 37.8445" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M21.1024 34.6459L20.8308 35.5435L19.9087 35.867L20.358 36.685L19.9134 37.5733L20.8308 37.8267L21.1361 38.7683L21.9725 38.2995L22.8424 38.7636L23.114 37.8267L24.0369 37.5396L23.5868 36.685L24.0319 35.8333L23.114 35.5435L22.8087 34.6409L21.9725 35.0704L21.1024 34.6459Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M28.0596 39.6194C29.6695 39.6194 30.9746 38.3143 30.9746 36.7043C30.9746 35.0944 29.6695 33.7893 28.0596 33.7893C26.4496 33.7893 25.1445 35.0944 25.1445 36.7043C25.1445 38.3143 26.4496 39.6194 28.0596 39.6194Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M28.0599 35.0701L29.2013 35.5431L29.6741 36.6846L29.2013 37.8264L28.0599 38.2991L26.9181 37.8264L26.4453 36.6846L26.9181 35.5431L28.0599 35.0701Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M30.1189 37.53V38.7649H28.9302" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M28.8979 34.6428H30.1193V35.8305" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.9976 35.8645V34.6428H27.1897" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M27.2321 38.7646H25.9976V37.5696" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M29.2017 39.3871L28.9301 38.7629L28.0602 39.6191L27.2238 38.7677L26.9185 39.3871" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.9185 34.0216L27.1901 34.6457L28.0602 33.7896L28.8964 34.6407L29.2017 34.0216" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.3768 37.8445L26.0007 37.5729L25.1445 36.7028L25.996 35.8666L25.3766 35.5613" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M30.7433 35.5613L30.1191 35.8329L30.9753 36.7028L30.1242 37.5392L30.7433 37.8445" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M27.1903 34.6459L26.9187 35.5435L25.9966 35.867L26.4459 36.685L26.0013 37.5733L26.9187 37.8267L27.224 38.7683L28.0604 38.2995L28.9303 38.7636L29.2019 37.8267L30.1248 37.5396L29.6747 36.685L30.1198 35.8333L29.2019 35.5435L28.8966 34.6409L28.0604 35.0704L27.1903 34.6459Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M15.2754 39.6196C16.8853 39.6196 18.1904 38.3145 18.1904 36.7046C18.1904 35.0947 16.8853 33.7896 15.2754 33.7896C13.6655 33.7896 12.3604 35.0947 12.3604 36.7046C12.3604 38.3145 13.6655 39.6196 15.2754 39.6196Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M15.2757 35.0701L16.4172 35.5431L16.8899 36.6846L16.4172 37.8264L15.2757 38.2991L14.1339 37.8264L13.6611 36.6846L14.1339 35.5431L15.2757 35.0701Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<path d="M17.3347 37.53V38.7649H16.146" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.1138 34.6428H17.3352V35.8305" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.2134 35.8645V34.6428H14.4055" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14.4479 38.7646H13.2134V37.5696" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.4175 39.3871L16.1459 38.7629L15.276 39.6191L14.4396 38.7677L14.1343 39.3871" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14.1343 34.0216L14.4059 34.6457L15.276 33.7896L16.1122 34.6407L16.4175 34.0216" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M12.5927 37.8445L13.2165 37.5729L12.3604 36.7028L13.2118 35.8666L12.5924 35.5613" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.9591 35.5613L17.335 35.8329L18.1911 36.7028L17.34 37.5392L17.9591 37.8445" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14.4061 34.6459L14.1345 35.5435L13.2124 35.867L13.6617 36.685L13.2171 37.5733L14.1345 37.8267L14.4399 38.7683L15.2763 38.2995L16.1462 38.7636L16.4178 37.8267L17.3406 37.5396L16.8905 36.685L17.3356 35.8333L16.4178 35.5435L16.1124 34.6409L15.2763 35.0704L14.4061 34.6459Z" stroke="currentColor" stroke-width="0.3" stroke-miterlimit="10"/>
<rect x="12.1851" y="33.6133" width="18.7371" height="6.31822" rx="2.75" stroke="currentColor" stroke-width="0.5"/>
<circle cx="19.4826" cy="34.2156" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="24.3542" cy="34.2156" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="19.4826" cy="39.3291" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="24.3542" cy="39.3291" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="25.9368" cy="34.2156" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="25.9368" cy="39.3291" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="30.5637" cy="34.2156" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="30.5637" cy="39.3291" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="17.9001" cy="39.3291" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="12.7868" cy="39.3291" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="17.9001" cy="34.2156" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<circle cx="12.7868" cy="34.2156" r="0.702278" fill="white" stroke="currentColor" stroke-width="0.3"/>
<path d="M21.9999 30.0333C28.9024 30.0333 34.4979 24.4378 34.4979 17.5353C34.4979 10.6329 28.9024 5.03735 21.9999 5.03735C15.0975 5.03735 9.50195 10.6329 9.50195 17.5353C9.50195 24.4378 15.0975 30.0333 21.9999 30.0333Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.9994 10.5291L26.8934 12.5572L28.9205 17.4513L26.8934 22.3465L21.9994 24.3735L17.1042 22.3465L15.0771 17.4513L17.1042 12.5572L21.9994 10.5291Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M30.8298 21.0752V26.3695H25.7334" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.5928 8.69849H30.8294V13.7904" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M13.1577 13.9362V8.69849H18.2688" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.4508 26.3696H13.1577V21.2461" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.8947 29.0388L25.7303 26.3628L22.0007 30.0336L18.4146 26.3831L17.1055 29.0388" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.1055 6.03222L18.2699 8.70818L22.0007 5.03735L25.5856 8.6867L26.8947 6.03222" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M10.4965 22.4243L13.1713 21.2598L9.50049 17.5291L13.151 13.9442L10.4954 12.635" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M33.5051 12.635L30.8291 13.7995L34.4999 17.5291L30.8506 21.1151L33.5051 22.4243" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.2688 8.70849L17.1043 12.5568L13.1509 13.944L15.0773 17.4509L13.1712 21.2596L17.1043 22.3461L18.4135 26.3832L21.9995 24.3731L25.7291 26.3628L26.8936 22.3461L30.8504 21.1149L28.9206 17.4509L30.8289 13.7993L26.8936 12.5568L25.5844 8.68701L21.9995 10.5286L18.2688 8.70849Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<circle cx="12.6986" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.303" cy="8.23347" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.303" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="12.6981" cy="26.838" r="2.84065" fill="white" stroke="currentColor" stroke-width="0.5"/>
</svg>`,

                'halo': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.0988 32.4009C28.3571 32.4009 33.4305 27.3269 33.4305 21.0679C33.4305 14.8088 28.3571 9.73486 22.0988 9.73486C15.8405 9.73486 10.7671 14.8088 10.7671 21.0679C10.7671 27.3269 15.8405 32.4009 22.0988 32.4009Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M22.098 14.7148L26.5354 16.554L28.3733 20.9918L26.5354 25.4307L22.098 27.2688L17.6597 25.4307L15.8218 20.9918L17.6597 16.554L22.098 14.7148Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M30.1047 24.2778V29.0786H25.4839" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M25.356 13.0549H30.1039V17.6722" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M14.0815 17.8044V13.0549H18.7157" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.8807 29.0786H14.0815V24.4326" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.5364 31.4993L25.4806 29.0728L22.099 32.4014L18.8476 29.0912L17.6606 31.4993" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.6606 10.637L18.7164 13.0635L22.099 9.73486L25.3494 13.044L26.5364 10.637" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M11.6687 25.5013L14.0939 24.4454L10.7656 21.0624L14.0754 17.8116L11.6677 16.6245" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M32.5302 16.6245L30.104 17.6804L33.4323 21.0624L30.1235 24.3142L32.5302 25.5013" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M18.7155 13.0639L17.6597 16.5535L14.0752 17.8114L15.8218 20.9914L14.0936 24.4451L17.6597 25.4303L18.8467 29.0911L22.0981 27.2684L25.4797 29.0726L26.5355 25.4303L30.1231 24.3139L28.3733 20.9914L30.1036 17.6802L26.5355 16.5535L25.3485 13.0444L22.0981 14.7144L18.7155 13.0639Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M18.9475 8.7176C19.4308 9.55743 20.5038 9.84678 21.3437 9.36354C22.1835 8.88025 22.4728 7.80717 21.9897 6.96729C21.5064 6.12739 20.4334 5.83823 19.5934 6.32136C18.7534 6.80463 18.4642 7.87763 18.9475 8.7176Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M23.1462 8.9449C23.6295 9.78472 24.7026 10.0741 25.5425 9.59083C26.3822 9.10754 26.6715 8.03447 26.1884 7.19459C25.7052 6.35468 24.6321 6.06553 23.7921 6.54865C22.9522 7.03193 22.6629 8.10493 23.1462 8.9449Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M27.0046 10.3065C27.4879 11.1463 28.561 11.4356 29.4009 10.9524C30.2406 10.4691 30.5299 9.39604 30.0468 8.55616C29.5636 7.71625 28.4905 7.4271 27.6505 7.91022C26.8106 8.3935 26.5213 9.4665 27.0046 10.3065Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M18.0174 9.73909C17.534 10.5789 16.461 10.8683 15.6211 10.385C14.7813 9.90173 14.4921 8.82866 14.9752 7.98878C15.4584 7.14887 16.5315 6.85972 17.3714 7.34284C18.2114 7.82612 18.5006 8.89912 18.0174 9.73909Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M30.2956 12.8028C30.779 13.6426 31.852 13.932 32.6919 13.4487C33.5316 12.9655 33.8209 11.8924 33.3378 11.0525C32.8546 10.2126 31.7815 9.92344 30.9416 10.4066C30.1016 10.8898 29.8124 11.9628 30.2956 12.8028Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M14.4998 12.1219C14.0165 12.9617 12.9434 13.2511 12.1035 12.7678C11.2638 12.2845 10.9745 11.2115 11.4576 10.3716C11.9408 9.53168 13.0139 9.24253 13.8538 9.72565C14.6938 10.2089 14.9831 11.2819 14.4998 12.1219Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M32.6784 16.4342C33.1618 17.274 34.2348 17.5633 35.0747 17.0801C35.9145 16.5968 36.2037 15.5237 35.7206 14.6838C35.2374 13.8439 34.1643 13.5548 33.3244 14.0379C32.4844 14.5212 32.1952 15.5942 32.6784 16.4342Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M11.8899 15.4127C11.4066 16.2525 10.3336 16.5418 9.49367 16.0586C8.65391 15.5753 8.36465 14.5022 8.84774 13.6624C9.33098 12.8225 10.404 12.5333 11.244 13.0164C12.084 13.4997 12.3732 14.5727 11.8899 15.4127Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M33.8127 20.5196C34.296 21.3594 35.3691 21.6488 36.209 21.1655C37.0487 20.6822 37.338 19.6092 36.8549 18.7693C36.3717 17.9294 35.2986 17.6402 34.4587 18.1234C33.6187 18.6066 33.3294 19.6796 33.8127 20.5196Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M10.5281 19.3846C10.0448 20.2244 8.97176 20.5138 8.13186 20.0305C7.29209 19.5472 7.00283 18.4742 7.48592 17.6343C7.96916 16.7944 9.04222 16.5052 9.88217 16.9883C10.7221 17.4716 11.0114 18.5446 10.5281 19.3846Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M33.6999 24.6046C34.1833 25.4444 35.2563 25.7337 36.0962 25.2505C36.9359 24.7672 37.2252 23.6941 36.7421 22.8543C36.2589 22.0143 35.1858 21.7252 34.3459 22.2083C33.5059 22.6916 33.2166 23.7646 33.6999 24.6046Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M10.1878 23.4696C9.70444 24.3094 8.63143 24.5987 7.79152 24.1155C6.95176 23.6322 6.6625 22.5591 7.14559 21.7192C7.62883 20.8793 8.70189 20.5902 9.54184 21.0733C10.3818 21.5566 10.671 22.6296 10.1878 23.4696Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M32.2243 28.576C32.7077 29.4158 33.7807 29.7052 34.6206 29.2219C35.4604 28.7386 35.7496 27.6656 35.2665 26.8257C34.7833 25.9858 33.7102 25.6966 32.8703 26.1798C32.0303 26.663 31.7411 27.736 32.2243 28.576Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M11.3225 27.6685C10.8392 28.5084 9.7662 28.7977 8.92629 28.3145C8.08652 27.8312 7.79727 26.7581 8.28035 25.9182C8.76359 25.0783 9.83666 24.7892 10.6766 25.2723C11.5166 25.7556 11.8058 26.8286 11.3225 27.6685Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M29.5007 31.9801C29.984 32.8199 31.057 33.1092 31.897 32.626C32.7367 32.1427 33.026 31.0696 32.5429 30.2297C32.0596 29.3898 30.9866 29.1007 30.1466 29.5838C29.3067 30.0671 29.0174 31.1401 29.5007 31.9801Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M13.7053 31.0726C13.222 31.9124 12.149 32.2018 11.3091 31.7185C10.4693 31.2352 10.1801 30.1622 10.6632 29.3223C11.1464 28.4824 12.2195 28.1932 13.0594 28.6763C13.8994 29.1596 14.1886 30.2326 13.7053 31.0726Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M25.8698 34.2501C26.3532 35.0899 27.4262 35.3792 28.2661 34.896C29.1059 34.4127 29.3951 33.3396 28.912 32.4998C28.4288 31.6599 27.3557 31.3707 26.5158 31.8538C25.6758 32.3371 25.3866 33.4101 25.8698 34.2501Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M16.9964 33.6824C16.513 34.5223 15.44 34.8116 14.6001 34.3284C13.7604 33.8451 13.4711 32.772 13.9542 31.9321C14.4374 31.0922 15.5105 30.8031 16.3504 31.2862C17.1904 31.7695 17.4796 32.8425 16.9964 33.6824Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M22.0114 35.4981C22.4948 36.3379 23.5678 36.6273 24.4077 36.1441C25.2475 35.6608 25.5367 34.5877 25.0536 33.7478C24.5704 32.9079 23.4973 32.6188 22.6574 33.1019C21.8174 33.5852 21.5282 34.6581 22.0114 35.4981Z" stroke="currentColor" stroke-width="0.5"/>
<path d="M20.968 35.2713C20.4847 36.1111 19.4117 36.4005 18.5718 35.9172C17.732 35.434 17.4428 34.3609 17.9259 33.521C18.4091 32.6811 19.4822 32.3919 20.3221 32.8751C21.1621 33.3583 21.4513 34.4313 20.968 35.2713Z" stroke="currentColor" stroke-width="0.5"/>
<circle cx="22" cy="21.1167" r="15.8213" stroke="currentColor" stroke-width="0.5"/>
</svg>`,
        };

        // ── 2. Key aliases ───────────────────────────────────────────────
        // Tag values vary by project ("round", "round-brilliant", "rb"…) —
        // map common variants onto the canonical key.
        const ALIASES = {
                'round': 'round-brilliant',
                'rb': 'round-brilliant',
                'brilliant': 'round-brilliant',
                'round-cut': 'round-brilliant',
                'emerald-cut': 'emerald',
                'cushion-cut': 'cushion',
                'square': 'princess',
                'princess-cut': 'princess',
                'asscher-cut': 'asscher',
                'radiant-cut': 'radiant',
                'pear-shape': 'pear',
                'teardrop': 'pear',
                'oval-cut': 'oval',
                'marquise-cut': 'marquise',
                'navette': 'marquise',
                'heart-shape': 'heart',
                'triangle': 'trillion',
                'trilliant': 'trillion',
                'baguette-cut': 'baguette',
        };

        // ── 3. Lookup helper ─────────────────────────────────────────────
        function normalizeKey(raw) {
                if (raw == null) return '';
                return String(raw)
                        .toLowerCase()
                        .trim()
                        .replace(/[_\s]+/g, '-')
                        .replace(/-+/g, '-');
        }

        function getShapeIcon(rawKey) {
                const key = normalizeKey(rawKey);
                if (!key) return null;
                const resolved = ALIASES[key] || key;
                const svg = SHAPE_ICONS[resolved];
                return svg ? svg.trim() : null;
        }

        function getHeadIcon(rawKey) {
                const key = normalizeKey(rawKey);
                if (!key) return null;
                const svg = HEAD_ICONS[key];
                return svg ? svg.trim() : null;
        }

        // ── 4. Shank icons (plain band vs pavé band) ─────────────────────
        // Shank variations in the WBB project use a code like `SH8 PL` /
        // `SH4 PV` where the last token signals the band style (PL = plain,
        // PV = pavé). We keep two canonical drawings and let `getShankIcon`
        // pick the right one via suffix matching. If a project ever needs a
        // unique drawing per SH number, add an entry keyed by the full
        // normalized code (e.g. `'sh8-pl'`) — exact matches win over the
        // suffix fallback.
        const SHANK_ICONS = {

                // ── Unique Detailed Shank Profiles (Top-down Y-Axis horizontal views matching actual screenshots) ──

                // SH8 PL: Bypass Scroll/Bead Horizontal Solitaire
                'sh8-pl': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.28626 19.0438C9.87672 17.6047 13.0391 17.6566 15.5802 19.1813L18.5267 20.95C20.3567 22.0478 22.6428 22.0478 24.4728 20.95L27.4194 19.1813C29.9604 17.6566 33.1228 17.6047 35.7133 19.0438L41.2069 22.0954C41.8132 22.4325 42.0316 23.1978 41.6947 23.8043C41.3577 24.4106 40.5923 24.629 39.9859 24.2921L34.4923 21.2395C32.6869 20.2368 30.4839 20.2742 28.713 21.3367L25.7655 23.1044C23.1398 24.6797 19.8598 24.6797 17.234 23.1044L14.2865 21.3367C12.5156 20.2742 10.3126 20.2368 8.50728 21.2395L3.01367 24.2921C2.4072 24.629 1.64187 24.4106 1.30483 23.8043C0.967902 23.1978 1.18629 22.4325 1.79265 22.0954L7.28626 19.0438Z" fill="white" stroke="currentColor" stroke-width="0.5" stroke-linecap="round"/>
<circle cx="11.449" cy="22.6912" r="1.75763" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="32.0535" cy="22.6912" r="1.75763" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="21.4998" cy="19.6758" r="1.75763" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="2.40362" cy="19.6758" r="1.75763" fill="white" stroke="currentColor" stroke-width="0.5"/>
<circle cx="40.5965" cy="19.6758" r="1.75763" fill="white" stroke="currentColor" stroke-width="0.5"/>
</svg>
`,

                // SH7 PL: Cathedral Split-Shank Plain Horizontal Band
                'sh7-pl': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.5005 16.75C28.2992 16.7501 38.2254 18.3293 41.2407 18.8369C41.8895 18.9463 42.3539 19.5085 42.354 20.1621C42.354 20.2303 42.347 20.2971 42.3374 20.3623C42.3474 20.4345 42.354 20.508 42.354 20.583V21.4795C42.354 21.5538 42.3473 21.6266 42.3374 21.6982C42.3472 21.7641 42.354 21.8315 42.354 21.9004C42.3539 22.554 41.8895 23.1162 41.2407 23.2256C38.2254 23.7332 28.2992 25.3124 21.5005 25.3125C14.7019 25.3125 4.77592 23.7333 1.76025 23.2256C1.11125 23.1163 0.646091 22.5541 0.645996 21.9004C0.645996 21.8315 0.652845 21.7641 0.662598 21.6982C0.652746 21.6267 0.646011 21.5538 0.645996 21.4795V20.583C0.646011 20.5081 0.652572 20.4345 0.662598 20.3623C0.65303 20.2971 0.645996 20.2303 0.645996 20.1621C0.64609 19.5084 1.11125 18.9462 1.76025 18.8369C4.77592 18.3292 14.7019 16.75 21.5005 16.75ZM21.5005 19.4893C16.4405 19.4893 9.61854 20.3747 5.24658 21.0312C9.61854 21.6878 16.4405 22.5732 21.5005 22.5732C26.5599 22.5732 33.3805 21.6878 37.7524 21.0312C33.3805 20.3747 26.5599 19.4893 21.5005 19.4893Z" fill="white" stroke="currentColor" stroke-width="0.5"/>
</svg>
`,

                // SH6 PL: Twisted Crossover Plain Bypass Horizontal Band
                'sh6-pl': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M31.9706 19.9342C33.8299 20.6337 35.8797 20.636 37.7409 19.9415C38.3656 19.7083 38.9911 19.4757 39.6158 19.2426C40.0847 19.0677 40.5992 19.0993 41.0463 19.3308C41.4935 19.5625 41.8368 19.9758 42.0002 20.4786C42.1634 20.9812 42.1339 21.5325 41.9179 22.0117C41.7017 22.491 41.316 22.859 40.8469 23.034C40.2223 23.2671 39.5974 23.5008 38.9728 23.7339C36.3141 24.7262 33.3863 24.7239 30.7298 23.7257C29.7638 23.3627 28.7978 22.9994 27.8319 22.6361C23.7496 21.1005 19.2489 21.1005 15.1667 22.6364C14.2013 22.9996 13.2359 23.3627 12.2705 23.7255C9.61399 24.7239 6.68626 24.7262 4.02748 23.7339C3.40288 23.5008 2.77804 23.2671 2.15345 23.034C1.68429 22.859 1.29866 22.491 1.08244 22.0117C0.866425 21.5325 0.836944 20.9812 1.00012 20.4786C1.16349 19.9758 1.5068 19.5625 1.95406 19.3308C2.40112 19.0993 2.91558 19.0677 3.38451 19.2426C4.00923 19.4757 4.63474 19.7083 5.25946 19.9415C7.12015 20.6359 9.16917 20.6338 11.0281 19.9346C12.4144 19.4131 13.8007 18.8915 15.1871 18.3702C19.2569 16.8399 23.7434 16.8399 27.8132 18.3704C29.199 18.8915 30.5848 19.4129 31.9706 19.9342Z" fill="white" stroke="currentColor" stroke-width="0.5" stroke-linecap="round"/>
<path d="M31.9706 22.368C33.8299 21.6685 35.8797 21.6662 37.7409 22.3608C38.3656 22.5939 38.9911 22.8265 39.6158 23.0597C40.0847 23.2346 40.5992 23.203 41.0463 22.9715C41.4935 22.7397 41.8368 22.3264 42.0002 21.8236C42.1634 21.3211 42.1339 20.7697 41.9179 20.2906C41.7017 19.8112 41.316 19.4433 40.8469 19.2682C40.2223 19.0351 39.5974 18.8014 38.9728 18.5683C36.3141 17.5761 33.3863 17.5783 30.7298 18.5766C29.7638 18.9396 28.7978 19.3028 27.8319 19.6662C23.7496 21.2017 19.2489 21.2017 15.1667 19.6659C14.2013 19.3027 13.2359 18.9396 12.2705 18.5767C9.61399 17.5783 6.68626 17.5761 4.02748 18.5683C3.40288 18.8014 2.77804 19.0351 2.15345 19.2682C1.68429 19.4433 1.29866 19.8112 1.08244 20.2906C0.866425 20.7697 0.836944 21.3211 1.00012 21.8236C1.16349 22.3264 1.5068 22.7397 1.95406 22.9715C2.40112 23.203 2.91558 23.2346 3.38451 23.0597C4.00923 22.8265 4.63474 22.5939 5.25946 22.3608C7.12015 21.6664 9.16917 21.6684 11.0281 22.3677C12.4144 22.8891 13.8007 23.4107 15.1871 23.932C19.2569 25.4624 23.7434 25.4624 27.8132 23.9319C29.199 23.4107 30.5848 22.8893 31.9706 22.368Z" fill="white" stroke="currentColor" stroke-width="0.5" stroke-linecap="round"/>
</svg>
`,

                // SH5 PL: Twisted/Braided Plain Bypass
                'sh5-pl': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.78034 23.1754L4.24324 24.0937C3.81701 24.3482 3.38282 24.5526 2.94383 24.7068C1.85557 25.0891 0.895996 24.1275 0.895996 22.974C0.895996 21.8205 1.85549 20.912 2.94402 20.5305C3.38628 20.3754 3.82368 20.1696 4.25303 19.9131C4.76512 19.607 5.27753 19.3011 5.79007 18.9952C7.95375 17.704 10.3221 17.704 12.4858 18.9954C12.998 19.3011 13.51 19.607 14.0218 19.9128C16.1914 21.2097 18.5667 21.2096 20.7364 19.9131C23.7443 18.1155 27.4973 18.115 30.5051 19.9128C32.6747 21.2097 35.05 21.2096 37.2197 19.9131C37.7318 19.607 38.2442 19.3011 38.7567 18.9952C39.1832 18.7407 39.6176 18.5364 40.0568 18.3822C41.145 18.0003 42.1043 18.9617 42.1043 20.1149C42.1043 21.2681 41.1451 22.1764 40.0568 22.5577C39.6142 22.7128 39.1766 22.9187 38.747 23.1754L37.2099 24.0937C35.0468 25.3854 32.6791 25.3854 30.516 24.0938C27.5008 22.2933 23.7416 22.2931 20.7266 24.0937C18.5635 25.3854 16.1957 25.3854 14.0326 24.0938L12.495 23.1753C10.3253 21.8789 7.95002 21.8789 5.78034 23.1754Z" fill="white" stroke="currentColor" stroke-width="0.5" stroke-linecap="round"/>
<path d="M37.2197 23.1754L38.7568 24.0937C39.183 24.3482 39.6172 24.5526 40.0562 24.7068C41.1444 25.0891 42.104 24.1275 42.104 22.974C42.104 21.8205 41.1445 20.912 40.056 20.5305C39.6137 20.3754 39.1763 20.1696 38.747 19.9131C38.2349 19.607 37.7225 19.3011 37.2099 18.9952C35.0463 17.704 32.6779 17.704 30.5142 18.9954C30.002 19.3011 29.49 19.607 28.9782 19.9128C26.8086 21.2097 24.4333 21.2096 22.2636 19.9131C19.2557 18.1155 15.5027 18.115 12.4949 19.9128C10.3253 21.2097 7.94997 21.2096 5.7803 19.9131C5.26821 19.607 4.75581 19.3011 4.24326 18.9952C3.81681 18.7407 3.3824 18.5364 2.94318 18.3822C1.85504 18.0003 0.895672 18.9617 0.895672 20.1149C0.895672 21.2681 1.85493 22.1764 2.94325 22.5577C3.38577 22.7128 3.82341 22.9187 4.253 23.1754L5.79009 24.0937C7.95316 25.3854 10.3209 25.3854 12.484 24.0938C15.4992 22.2933 19.2584 22.2931 22.2734 24.0937C24.4365 25.3854 26.8043 25.3854 28.9674 24.0938L30.505 23.1753C32.6747 21.8789 35.05 21.8789 37.2197 23.1754Z" fill="white" stroke="currentColor" stroke-width="0.5" stroke-linecap="round"/>
</svg>
`,

                // SH4 PV: Cathedral Pavé Tapered
                'sh4-pv': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.27393" y="18.4895" width="40.4524" height="5.64286" rx="1.75" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.738" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="3.07154" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="15.3572" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="7.16676" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="19.4524" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="39.9285" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="35.8333" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="11.262" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="23.5476" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="27.6428" cy="21.3108" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="21.5002" cy="21.3732" r="5.37323" fill="white"/>
<path d="M21.5007 26.7465C24.4683 26.7465 26.8739 24.3408 26.8739 21.3732C26.8739 18.4057 24.4683 16 21.5007 16C18.5331 16 16.1274 18.4057 16.1274 21.3732C16.1274 24.3408 18.5331 26.7465 21.5007 26.7465Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.5005 18.3608L23.6046 19.2328L24.4761 21.3369L23.6046 23.4415L21.5005 24.313L19.3959 23.4415L18.5244 21.3369L19.3959 19.2328L21.5005 18.3608Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M25.2966 22.895V25.1712H23.1055" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.0449 17.574H25.2963V19.7631" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.6992 19.8258V17.574H19.8966" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.9749 25.1713H17.6992V22.9685" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.6047 26.3189L23.104 25.1685L21.5006 26.7467L19.9588 25.1772L19.396 26.3189" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.396 16.4277L19.8966 17.5782L21.5006 16L23.0418 17.569L23.6047 16.4277" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.5552 23.475L17.7051 22.9744L16.127 21.3705L17.6964 19.8292L16.5547 19.2664" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.4469 19.2664L25.2964 19.767L26.8746 21.3705L25.3056 22.9122L26.4469 23.475" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.8966 17.5781L19.396 19.2326L17.6963 19.829L18.5245 21.3367L17.705 22.9742L19.396 23.4413L19.9588 25.1769L21.5006 24.3127L23.104 25.1682L23.6047 23.4413L25.3058 22.912L24.4762 21.3367L25.2966 19.7668L23.6047 19.2326L23.0418 17.5688L21.5006 18.3606L19.8966 17.5781Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
</svg>
`,

                // SH4 PL: Cathedral Plain Tapered
                'sh4-pl': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.146" y="18.4895" width="40.7083" height="5.68125" rx="1.75" stroke="currentColor" stroke-width="0.5"/>
<circle cx="21.5002" cy="21.3732" r="5.37323" fill="white"/>
<path d="M21.5007 26.7465C24.4683 26.7465 26.8739 24.3408 26.8739 21.3732C26.8739 18.4057 24.4683 16 21.5007 16C18.5331 16 16.1274 18.4057 16.1274 21.3732C16.1274 24.3408 18.5331 26.7465 21.5007 26.7465Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M21.501 18.3608L23.6051 19.2328L24.4765 21.3369L23.6051 23.4415L21.501 24.313L19.3964 23.4415L18.5249 21.3369L19.3964 19.2328L21.501 18.3608Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
<path d="M25.2966 22.895V25.1712H23.1055" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.0454 17.5737H25.2968V19.7629" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M17.6992 19.8256V17.5737H19.8966" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.9749 25.171H17.6992V22.9683" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M23.6047 26.3187L23.104 25.1682L21.5006 26.7464L19.9588 25.177L19.396 26.3187" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.396 16.4277L19.8966 17.5782L21.5006 16L23.0418 17.569L23.6047 16.4277" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M16.5552 23.4748L17.7051 22.9742L16.127 21.3702L17.6964 19.829L16.5547 19.2661" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M26.4473 19.2661L25.2969 19.7667L26.8751 21.3702L25.3061 22.912L26.4473 23.4748" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10" stroke-linejoin="bevel"/>
<path d="M19.8966 17.5781L19.396 19.2326L17.6963 19.829L18.5245 21.3367L17.705 22.9742L19.396 23.4413L19.9588 25.1769L21.5006 24.3127L23.104 25.1682L23.6047 23.4413L25.3058 22.912L24.4762 21.3367L25.2966 19.7668L23.6047 19.2326L23.0418 17.5688L21.5006 18.3606L19.8966 17.5781Z" stroke="currentColor" stroke-width="0.5" stroke-miterlimit="10"/>
</svg>
`,

                // SH1 PV: Classic Micropave
                'sh1-pv': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.27393" y="18.25" width="40.4524" height="5.64286" rx="1.75" stroke="currentColor" stroke-width="0.5"/>
<circle cx="31.738" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="3.07154" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="15.3572" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="7.16676" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="19.4524" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="39.9285" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="35.8333" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="11.262" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="23.5476" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
<circle cx="27.6428" cy="21.0713" r="1.79762" stroke="currentColor" stroke-width="0.5"/>
</svg>
`,



                // SH1 PL: Classic Plain Solitaire
                'sh1-pl': `
<svg viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.146" y="18.25" width="40.7083" height="5.68125" rx="1.75" stroke="currentColor" stroke-width="0.5"/>
</svg>
`,

                // ── Legacy / Suffix Fallback Mappings ──

                // Plain fallback matching sh1-pl
                'plain': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 22H21V28H5A3 3 0 0 1 5 22Z" stroke="currentColor" stroke-width="0.5"/>
  <path d="M45 22H29V28H45A3 3 0 0 0 45 22Z" stroke="currentColor" stroke-width="0.5"/>
  <line x1="5" y1="25" x2="21" y2="25" stroke="currentColor" stroke-width="0.25" stroke-dasharray="2 1"/>
  <line x1="29" y1="25" x2="45" y2="25" stroke="currentColor" stroke-width="0.25" stroke-dasharray="2 1"/>
  <circle cx="25" cy="25" r="5" stroke="currentColor" stroke-width="0.5" fill="white"/>
  <path d="M25 22.2L26.9 23.1L27.8 25L26.9 26.9L25 27.8L23.1 26.9L22.2 25L23.1 23.1L25 22.2Z" stroke="currentColor" stroke-width="0.3"/>
  <path d="M25 20L25 22.2M25 27.8L25 30M20 25L22.2 25M27.8 25L30 25" stroke="currentColor" stroke-width="0.3"/>
  <path d="M21.5 21.5L23.1 23.1M28.5 28.5L26.9 26.9M21.5 28.5L23.1 26.9M28.5 21.5L26.9 23.1" stroke="currentColor" stroke-width="0.3"/>
  <circle cx="21.5" cy="21.5" r="0.8" fill="currentColor"/>
  <circle cx="28.5" cy="21.5" r="0.8" fill="currentColor"/>
  <circle cx="21.5" cy="28.5" r="0.8" fill="currentColor"/>
  <circle cx="28.5" cy="28.5" r="0.8" fill="currentColor"/>
</svg>`,

                // Pave fallback matching sh1-pv
                'pave': `
<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 22H21V28H5A3 3 0 0 1 5 22Z" stroke="currentColor" stroke-width="0.5"/>
  <path d="M45 22H29V28H45A3 3 0 0 0 45 22Z" stroke="currentColor" stroke-width="0.5"/>
  <path d="M5 23.5H21M5 26.5H21" stroke="currentColor" stroke-width="0.25"/>
  <path d="M45 23.5H29M45 26.5H29" stroke="currentColor" stroke-width="0.25"/>
  <g stroke="currentColor" stroke-width="0.2" fill="white">
    <circle cx="8" cy="25" r="1.1"/><line x1="7.1" y1="25" x2="8.9" y2="25"/><line x1="8" y1="24.1" x2="8" y2="25.9"/>
    <circle cx="12" cy="25" r="1.1"/><line x1="11.1" y1="25" x2="12.9" y2="25"/><line x1="12" y1="24.1" x2="12" y2="25.9"/>
    <circle cx="16" cy="25" r="1.1"/><line x1="15.1" y1="25" x2="16.9" y2="25"/><line x1="16" y1="24.1" x2="16" y2="25.9"/>
    <circle cx="20" cy="25" r="1.1"/><line x1="19.1" y1="25" x2="20.9" y2="25"/><line x1="20" y1="24.1" x2="20" y2="25.9"/>
    <circle cx="30" cy="25" r="1.1"/><line x1="29.1" y1="25" x2="30.9" y2="25"/><line x1="30" y1="24.1" x2="30" y2="25.9"/>
    <circle cx="34" cy="25" r="1.1"/><line x1="33.1" y1="25" x2="34.9" y2="25"/><line x1="34" y1="24.1" x2="34" y2="25.9"/>
    <circle cx="38" cy="25" r="1.1"/><line x1="37.1" y1="25" x2="38.9" y2="25"/><line x1="38" y1="24.1" x2="38" y2="25.9"/>
    <circle cx="42" cy="25" r="1.1"/><line x1="41.1" y1="25" x2="42.9" y2="25"/><line x1="42" y1="24.1" x2="42" y2="25.9"/>
  </g>
  <g fill="currentColor">
    <circle cx="10" cy="23.5" r="0.3"/><circle cx="10" cy="26.5" r="0.3"/>
    <circle cx="14" cy="23.5" r="0.3"/><circle cx="14" cy="26.5" r="0.3"/>
    <circle cx="18" cy="23.5" r="0.3"/><circle cx="18" cy="26.5" r="0.3"/>
    <circle cx="32" cy="23.5" r="0.3"/><circle cx="32" cy="26.5" r="0.3"/>
    <circle cx="36" cy="23.5" r="0.3"/><circle cx="36" cy="26.5" r="0.3"/>
    <circle cx="40" cy="23.5" r="0.3"/><circle cx="40" cy="26.5" r="0.3"/>
  </g>
  <circle cx="25" cy="25" r="5" stroke="currentColor" stroke-width="0.5" fill="white"/>
  <path d="M25 22.2L26.9 23.1L27.8 25L26.9 26.9L25 27.8L23.1 26.9L22.2 25L23.1 23.1L25 22.2Z" stroke="currentColor" stroke-width="0.3"/>
  <path d="M25 20L25 22.2M25 27.8L25 30M20 25L22.2 25M27.8 25L30 25" stroke="currentColor" stroke-width="0.3"/>
  <path d="M21.5 21.5L23.1 23.1M28.5 28.5L26.9 26.9M21.5 28.5L23.1 26.9M28.5 21.5L26.9 23.1" stroke="currentColor" stroke-width="0.3"/>
  <circle cx="21.5" cy="21.5" r="0.8" fill="currentColor"/>
  <circle cx="28.5" cy="21.5" r="0.8" fill="currentColor"/>
  <circle cx="21.5" cy="28.5" r="0.8" fill="currentColor"/>
  <circle cx="28.5" cy="28.5" r="0.8" fill="currentColor"/>
</svg>`,
        };

        // Suffix tokens (last segment of the normalized key) that should be
        // treated as a synonym for one of the canonical SHANK_ICONS keys.
        const SHANK_SUFFIX_ALIASES = {
                'pl': 'plain',
                'pv': 'pave',
                'pave': 'pave',
                'plain': 'plain',
                'solitaire': 'plain',
                'eternity': 'pave',
        };

        function getShankIcon(rawKey) {
                const key = normalizeKey(rawKey);
                if (!key) return null;
                if (SHANK_ICONS[key]) return SHANK_ICONS[key].trim();
                // Try each token of the key (right → left) so codes like
                // `sh8-pl` resolve via `pl` → `plain`.
                const parts = key.split('-');
                for (let i = parts.length - 1; i >= 0; i--) {
                        const alias = SHANK_SUFFIX_ALIASES[parts[i]];
                        if (alias && SHANK_ICONS[alias]) return SHANK_ICONS[alias].trim();
                }
                return null;
        }

        // ── 5. Expose ────────────────────────────────────────────────────
        window.SHAPE_ICONS = SHAPE_ICONS;
        window.getShapeIcon = getShapeIcon;
        window.SHANK_ICONS = SHANK_ICONS;
        window.getShankIcon = getShankIcon;
        window.HEAD_ICONS = HEAD_ICONS;
        window.getHeadIcon = getHeadIcon;
})();

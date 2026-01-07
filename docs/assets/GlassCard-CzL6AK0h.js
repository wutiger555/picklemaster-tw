import{j as C}from"./vendor-three-CDw6EIKg.js";import{r as E}from"./vendor-react-DcHhgIUw.js";import{g as G}from"./animations-DEHxLKRW.js";import{c as l,e as u,b as p,a as L}from"./vendor-framer-74RobQA8.js";const H=({children:m,variant:b="light",size:h="md",className:f="",hoverable:i=!0,magnetic:r=!1,magneticStrength:s=10,animated:t=!0,onClick:d,clickable:v=!1})=>{const o=E.useRef(null),a=l(0),n=l(0),w=u(p(n,[-.5,.5],[s,-s]),{stiffness:300,damping:20}),g=u(p(a,[-.5,.5],[-s,s]),{stiffness:300,damping:20}),x=c=>{if(!r||!o.current)return;const e=o.current.getBoundingClientRect(),R=e.left+e.width/2,X=e.top+e.height/2,Y=(c.clientX-R)/(e.width/2),j=(c.clientY-X)/(e.height/2);a.set(Y),n.set(j)},y=()=>{r&&(a.set(0),n.set(0))},M={light:"bg-white/70 border-white/30",medium:"bg-white/50 border-white/20",dark:"bg-neutral-900/50 border-white/10 text-white",primary:"bg-primary-500/20 border-primary-300/30 backdrop-saturate-150",secondary:"bg-secondary-500/20 border-secondary-300/30 backdrop-saturate-150",accent:"bg-accent-500/20 border-accent-300/30 backdrop-saturate-150"},$={sm:"p-4 rounded-lg",md:"p-6 rounded-xl",lg:"p-8 rounded-2xl",xl:"p-10 rounded-3xl"},k=`
    ${M[b]}
    ${$[h]}
    backdrop-blur-xl
    border
    shadow-glass
    transition-all duration-300
    ${i?"hover:shadow-glass-lg":""}
    ${v||d?"cursor-pointer":""}
    ${f}
  `.trim();return C.jsx(L.div,{ref:o,className:k,variants:t?G:void 0,initial:t?"hidden":void 0,whileInView:t?"visible":void 0,viewport:{once:!0,amount:.3},whileHover:i&&!r?"hover":void 0,onMouseMove:x,onMouseLeave:y,onClick:d,style:r?{rotateX:w,rotateY:g,transformStyle:"preserve-3d",perspective:1e3}:void 0,children:m})};export{H as G};
//# sourceMappingURL=GlassCard-CzL6AK0h.js.map

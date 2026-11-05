import{a as Ut,r as d}from"./vendor-react-BWu-_AVp.js";import{D as It,c as D,d as V,P as Te,O as De,g as Nt,h as ct,Q as lt,M as ye,i as xe,j as Bt,k as Ht,I as Ft,F as ut,l as Je,m as Ee,n as Wt,o as tt,p as Mt,q as kt,r as ft,s as dt,t as Vt,u as we,v as Yt,w as Gt,x as Pt,y as $t,z as Zt,H as Xt,E as ht,G as Kt,J as qt}from"./vendor-three-core-BS1nVvjk.js";import{u as W,a as je}from"./vendor-three-fiber-QiFbFOfb.js";var _t,pt=Ut;_t=pt.createRoot,pt.hydrateRoot;const Qt="modulepreload",Jt=function(r){return"/"+r},mt={},On=function(t,o,e){let i=Promise.resolve();if(o&&o.length>0){document.getElementsByTagName("link");const p=document.querySelector("meta[property=csp-nonce]"),a=p?.nonce||p?.getAttribute("nonce");i=Promise.allSettled(o.map(u=>{if(u=Jt(u),u in mt)return;mt[u]=!0;const y=u.endsWith(".css"),f=y?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${f}`))return;const l=document.createElement("link");if(l.rel=y?"stylesheet":Qt,y||(l.as="script"),l.crossOrigin="",l.href=u,a&&l.setAttribute("nonce",a),document.head.appendChild(l),y)return new Promise((g,h)=>{l.addEventListener("load",g),l.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(p){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=p,window.dispatchEvent(a),!a.defaultPrevented)throw p}return i.then(p=>{for(const a of p||[])a.status==="rejected"&&s(a.reason);return t().catch(s)})};function pe(){return pe=Object.assign?Object.assign.bind():function(r){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var e in o)({}).hasOwnProperty.call(o,e)&&(r[e]=o[e])}return r},pe.apply(null,arguments)}const Ce=new D,nt=new D,en=new D,gt=new V;function tn(r,t,o){const e=Ce.setFromMatrixPosition(r.matrixWorld);e.project(t);const i=o.width/2,s=o.height/2;return[e.x*i+i,-(e.y*s)+s]}function nn(r,t){const o=Ce.setFromMatrixPosition(r.matrixWorld),e=nt.setFromMatrixPosition(t.matrixWorld),i=o.sub(e),s=t.getWorldDirection(en);return i.angleTo(s)>Math.PI/2}function on(r,t,o,e){const i=Ce.setFromMatrixPosition(r.matrixWorld),s=i.clone();s.project(t),gt.set(s.x,s.y),o.setFromCamera(gt,t);const p=o.intersectObjects(e,!0);if(p.length){const a=p[0].distance;return i.distanceTo(o.ray.origin)<a}return!0}function sn(r,t){if(t instanceof De)return t.zoom;if(t instanceof Te){const o=Ce.setFromMatrixPosition(r.matrixWorld),e=nt.setFromMatrixPosition(t.matrixWorld),i=t.fov*Math.PI/180,s=o.distanceTo(e);return 1/(2*Math.tan(i/2)*s)}else return 1}function rn(r,t,o){if(t instanceof Te||t instanceof De){const e=Ce.setFromMatrixPosition(r.matrixWorld),i=nt.setFromMatrixPosition(t.matrixWorld),s=e.distanceTo(i),p=(o[1]-o[0])/(t.far-t.near),a=o[1]-p*t.far;return Math.round(p*s+a)}}const et=r=>Math.abs(r)<1e-10?0:r;function At(r,t,o=""){let e="matrix3d(";for(let i=0;i!==16;i++)e+=et(t[i]*r.elements[i])+(i!==15?",":")");return o+e}const an=(r=>t=>At(t,r))([1,-1,1,1,1,-1,1,1,1,-1,1,1,1,-1,1,1]),cn=(r=>(t,o)=>At(t,r(o),"translate(-50%,-50%)"))(r=>[1/r,1/r,1/r,1,-1/r,-1/r,-1/r,-1,1/r,1/r,1/r,1,1,1,1,1]);function ln(r){return r&&typeof r=="object"&&"current"in r}const Ln=d.forwardRef(({children:r,eps:t=.001,style:o,className:e,prepend:i,center:s,fullscreen:p,portal:a,distanceFactor:u,sprite:y=!1,transform:f=!1,occlude:l,onOcclude:g,castShadow:h,receiveShadow:A,material:_,geometry:b,zIndexRange:S=[16777271,0],calculatePosition:C=tn,as:x="div",wrapperClass:M,pointerEvents:O="auto",...E},j)=>{const{gl:k,camera:T,scene:w,size:R,raycaster:We,events:ee,viewport:Se}=W(),[U]=d.useState(()=>document.createElement(x)),me=d.useRef(),H=d.useRef(null),te=d.useRef(0),re=d.useRef([0,0]),$=d.useRef(null),ue=d.useRef(null),ne=a?.current||ee.connected||k.domElement.parentNode,Y=d.useRef(null),fe=d.useRef(!1),ge=d.useMemo(()=>l&&l!=="blending"||Array.isArray(l)&&l.length&&ln(l[0]),[l]);d.useLayoutEffect(()=>{const F=k.domElement;l&&l==="blending"?(F.style.zIndex=`${Math.floor(S[0]/2)}`,F.style.position="absolute",F.style.pointerEvents="none"):(F.style.zIndex=null,F.style.position=null,F.style.pointerEvents=null)},[l]),d.useLayoutEffect(()=>{if(H.current){const F=me.current=_t(U);if(w.updateMatrixWorld(),f)U.style.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else{const L=C(H.current,T,R);U.style.cssText=`position:absolute;top:0;left:0;transform:translate3d(${L[0]}px,${L[1]}px,0);transform-origin:0 0;`}return ne&&(i?ne.prepend(U):ne.appendChild(U)),()=>{ne&&ne.removeChild(U),F.unmount()}}},[ne,f]),d.useLayoutEffect(()=>{M&&(U.className=M)},[M]);const Me=d.useMemo(()=>f?{position:"absolute",top:0,left:0,width:R.width,height:R.height,transformStyle:"preserve-3d",pointerEvents:"none"}:{position:"absolute",transform:s?"translate3d(-50%,-50%,0)":"none",...p&&{top:-R.height/2,left:-R.width/2,width:R.width,height:R.height},...o},[o,s,p,R,f]),ke=d.useMemo(()=>({position:"absolute",pointerEvents:O}),[O]);d.useLayoutEffect(()=>{if(fe.current=!1,f){var F;(F=me.current)==null||F.render(d.createElement("div",{ref:$,style:Me},d.createElement("div",{ref:ue,style:ke},d.createElement("div",{ref:j,className:e,style:o,children:r}))))}else{var L;(L=me.current)==null||L.render(d.createElement("div",{ref:j,style:Me,className:e,children:r}))}});const ae=d.useRef(!0);je(F=>{if(H.current){T.updateMatrixWorld(),H.current.updateWorldMatrix(!0,!1);const L=f?re.current:C(H.current,T,R);if(f||Math.abs(te.current-T.zoom)>t||Math.abs(re.current[0]-L[0])>t||Math.abs(re.current[1]-L[1])>t){const Z=nn(H.current,T);let G=!1;ge&&(Array.isArray(l)?G=l.map(X=>X.current):l!=="blending"&&(G=[w]));const ce=ae.current;if(G){const X=on(H.current,T,We,G);ae.current=X&&!Z}else ae.current=!Z;ce!==ae.current&&(g?g(!ae.current):U.style.display=ae.current?"block":"none");const ve=Math.floor(S[0]/2),Ve=l?ge?[S[0],ve]:[ve-1,0]:S;if(U.style.zIndex=`${rn(H.current,T,Ve)}`,f){const[X,Pe]=[R.width/2,R.height/2],be=T.projectionMatrix.elements[5]*Pe,{isOrthographicCamera:ze,top:Ye,left:Ue,bottom:_e,right:de}=T,Ge=an(T.matrixWorldInverse),$e=ze?`scale(${be})translate(${et(-(de+Ue)/2)}px,${et((Ye+_e)/2)}px)`:`translateZ(${be}px)`;let K=H.current.matrixWorld;y&&(K=T.matrixWorldInverse.clone().transpose().copyPosition(K).scale(H.current.scale),K.elements[3]=K.elements[7]=K.elements[11]=0,K.elements[15]=1),U.style.width=R.width+"px",U.style.height=R.height+"px",U.style.perspective=ze?"":`${be}px`,$.current&&ue.current&&($.current.style.transform=`${$e}${Ge}translate(${X}px,${Pe}px)`,ue.current.style.transform=cn(K,1/((u||10)/400)))}else{const X=u===void 0?1:sn(H.current,T)*u;U.style.transform=`translate3d(${L[0]}px,${L[1]}px,0) scale(${X})`}re.current=L,te.current=T.zoom}}if(!ge&&Y.current&&!fe.current)if(f){if($.current){const L=$.current.children[0];if(L!=null&&L.clientWidth&&L!=null&&L.clientHeight){const{isOrthographicCamera:Z}=T;if(Z||b)E.scale&&(Array.isArray(E.scale)?E.scale instanceof D?Y.current.scale.copy(E.scale.clone().divideScalar(1)):Y.current.scale.set(1/E.scale[0],1/E.scale[1],1/E.scale[2]):Y.current.scale.setScalar(1/E.scale));else{const G=(u||10)/400,ce=L.clientWidth*G,ve=L.clientHeight*G;Y.current.scale.set(ce,ve,1)}fe.current=!0}}}else{const L=U.children[0];if(L!=null&&L.clientWidth&&L!=null&&L.clientHeight){const Z=1/Se.factor,G=L.clientWidth*Z,ce=L.clientHeight*Z;Y.current.scale.set(G,ce,1),fe.current=!0}Y.current.lookAt(F.camera.position)}});const Re=d.useMemo(()=>({vertexShader:f?void 0:`
          /*
            This shader is from the THREE's SpriteMaterial.
            We need to turn the backing plane into a Sprite
            (make it always face the camera) if "transfrom"
            is false.
          */
          #include <common>

          void main() {
            vec2 center = vec2(0., 1.);
            float rotation = 0.0;

            // This is somewhat arbitrary, but it seems to work well
            // Need to figure out how to derive this dynamically if it even matters
            float size = 0.03;

            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            vec2 scale;
            scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
            scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

            bool isPerspective = isPerspectiveMatrix( projectionMatrix );
            if ( isPerspective ) scale *= - mvPosition.z;

            vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
            vec2 rotatedPosition;
            rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
            rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
            mvPosition.xy += rotatedPosition;

            gl_Position = projectionMatrix * mvPosition;
          }
      `,fragmentShader:`
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `}),[f]);return d.createElement("group",pe({},E,{ref:H}),l&&!ge&&d.createElement("mesh",{castShadow:h,receiveShadow:A,ref:Y},b||d.createElement("planeGeometry",null),_||d.createElement("shaderMaterial",{side:It,vertexShader:Re.vertexShader,fragmentShader:Re.fragmentShader})))}),Ot=parseInt(Nt.replace(/\D+/g,"")),Lt=Ot>=125?"uv1":"uv2";var un=Object.defineProperty,fn=(r,t,o)=>t in r?un(r,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):r[t]=o,dn=(r,t,o)=>(fn(r,t+"",o),o);class hn{constructor(){dn(this,"_listeners")}addEventListener(t,o){this._listeners===void 0&&(this._listeners={});const e=this._listeners;e[t]===void 0&&(e[t]=[]),e[t].indexOf(o)===-1&&e[t].push(o)}hasEventListener(t,o){if(this._listeners===void 0)return!1;const e=this._listeners;return e[t]!==void 0&&e[t].indexOf(o)!==-1}removeEventListener(t,o){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const s=i.indexOf(o);s!==-1&&i.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const e=this._listeners[t.type];if(e!==void 0){t.target=this;const i=e.slice(0);for(let s=0,p=i.length;s<p;s++)i[s].call(this,t);t.target=null}}}var pn=Object.defineProperty,mn=(r,t,o)=>t in r?pn(r,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):r[t]=o,m=(r,t,o)=>(mn(r,typeof t!="symbol"?t+"":t,o),o);const Ne=new Bt,vt=new Ht,gn=Math.cos(70*(Math.PI/180)),bt=(r,t)=>(r%t+t)%t;let vn=class extends hn{constructor(t,o){super(),m(this,"object"),m(this,"domElement"),m(this,"enabled",!0),m(this,"target",new D),m(this,"minDistance",0),m(this,"maxDistance",1/0),m(this,"minZoom",0),m(this,"maxZoom",1/0),m(this,"minPolarAngle",0),m(this,"maxPolarAngle",Math.PI),m(this,"minAzimuthAngle",-1/0),m(this,"maxAzimuthAngle",1/0),m(this,"enableDamping",!1),m(this,"dampingFactor",.05),m(this,"enableZoom",!0),m(this,"zoomSpeed",1),m(this,"enableRotate",!0),m(this,"rotateSpeed",1),m(this,"enablePan",!0),m(this,"panSpeed",1),m(this,"screenSpacePanning",!0),m(this,"keyPanSpeed",7),m(this,"zoomToCursor",!1),m(this,"autoRotate",!1),m(this,"autoRotateSpeed",2),m(this,"reverseOrbit",!1),m(this,"reverseHorizontalOrbit",!1),m(this,"reverseVerticalOrbit",!1),m(this,"keys",{LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"}),m(this,"mouseButtons",{LEFT:ye.ROTATE,MIDDLE:ye.DOLLY,RIGHT:ye.PAN}),m(this,"touches",{ONE:xe.ROTATE,TWO:xe.DOLLY_PAN}),m(this,"target0"),m(this,"position0"),m(this,"zoom0"),m(this,"_domElementKeyEvents",null),m(this,"getPolarAngle"),m(this,"getAzimuthalAngle"),m(this,"setPolarAngle"),m(this,"setAzimuthalAngle"),m(this,"getDistance"),m(this,"getZoomScale"),m(this,"listenToKeyEvents"),m(this,"stopListenToKeyEvents"),m(this,"saveState"),m(this,"reset"),m(this,"update"),m(this,"connect"),m(this,"dispose"),m(this,"dollyIn"),m(this,"dollyOut"),m(this,"getScale"),m(this,"setScale"),this.object=t,this.domElement=o,this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=()=>f.phi,this.getAzimuthalAngle=()=>f.theta,this.setPolarAngle=n=>{let c=bt(n,2*Math.PI),v=f.phi;v<0&&(v+=2*Math.PI),c<0&&(c+=2*Math.PI);let P=Math.abs(c-v);2*Math.PI-P<P&&(c<v?c+=2*Math.PI:v+=2*Math.PI),l.phi=c-v,e.update()},this.setAzimuthalAngle=n=>{let c=bt(n,2*Math.PI),v=f.theta;v<0&&(v+=2*Math.PI),c<0&&(c+=2*Math.PI);let P=Math.abs(c-v);2*Math.PI-P<P&&(c<v?c+=2*Math.PI:v+=2*Math.PI),l.theta=c-v,e.update()},this.getDistance=()=>e.object.position.distanceTo(e.target),this.listenToKeyEvents=n=>{n.addEventListener("keydown",Ze),this._domElementKeyEvents=n},this.stopListenToKeyEvents=()=>{this._domElementKeyEvents.removeEventListener("keydown",Ze),this._domElementKeyEvents=null},this.saveState=()=>{e.target0.copy(e.target),e.position0.copy(e.object.position),e.zoom0=e.object.zoom},this.reset=()=>{e.target.copy(e.target0),e.object.position.copy(e.position0),e.object.zoom=e.zoom0,e.object.updateProjectionMatrix(),e.dispatchEvent(i),e.update(),u=a.NONE},this.update=(()=>{const n=new D,c=new D(0,1,0),v=new lt().setFromUnitVectors(t.up,c),P=v.clone().invert(),z=new D,oe=new lt,le=2*Math.PI;return function(){const at=e.object.position;v.setFromUnitVectors(t.up,c),P.copy(v).invert(),n.copy(at).sub(e.target),n.applyQuaternion(v),f.setFromVector3(n),e.autoRotate&&u===a.NONE&&Se(We()),e.enableDamping?(f.theta+=l.theta*e.dampingFactor,f.phi+=l.phi*e.dampingFactor):(f.theta+=l.theta,f.phi+=l.phi);let ie=e.minAzimuthAngle,se=e.maxAzimuthAngle;isFinite(ie)&&isFinite(se)&&(ie<-Math.PI?ie+=le:ie>Math.PI&&(ie-=le),se<-Math.PI?se+=le:se>Math.PI&&(se-=le),ie<=se?f.theta=Math.max(ie,Math.min(se,f.theta)):f.theta=f.theta>(ie+se)/2?Math.max(ie,f.theta):Math.min(se,f.theta)),f.phi=Math.max(e.minPolarAngle,Math.min(e.maxPolarAngle,f.phi)),f.makeSafe(),e.enableDamping===!0?e.target.addScaledVector(h,e.dampingFactor):e.target.add(h),e.zoomToCursor&&T||e.object.isOrthographicCamera?f.radius=Y(f.radius):f.radius=Y(f.radius*g),n.setFromSpherical(f),n.applyQuaternion(P),at.copy(e.target).add(n),e.object.matrixAutoUpdate||e.object.updateMatrix(),e.object.lookAt(e.target),e.enableDamping===!0?(l.theta*=1-e.dampingFactor,l.phi*=1-e.dampingFactor,h.multiplyScalar(1-e.dampingFactor)):(l.set(0,0,0),h.set(0,0,0));let Ae=!1;if(e.zoomToCursor&&T){let Oe=null;if(e.object instanceof Te&&e.object.isPerspectiveCamera){const Le=n.length();Oe=Y(Le*g);const Ie=Le-Oe;e.object.position.addScaledVector(j,Ie),e.object.updateMatrixWorld()}else if(e.object.isOrthographicCamera){const Le=new D(k.x,k.y,0);Le.unproject(e.object),e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/g)),e.object.updateProjectionMatrix(),Ae=!0;const Ie=new D(k.x,k.y,0);Ie.unproject(e.object),e.object.position.sub(Ie).add(Le),e.object.updateMatrixWorld(),Oe=n.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),e.zoomToCursor=!1;Oe!==null&&(e.screenSpacePanning?e.target.set(0,0,-1).transformDirection(e.object.matrix).multiplyScalar(Oe).add(e.object.position):(Ne.origin.copy(e.object.position),Ne.direction.set(0,0,-1).transformDirection(e.object.matrix),Math.abs(e.object.up.dot(Ne.direction))<gn?t.lookAt(e.target):(vt.setFromNormalAndCoplanarPoint(e.object.up,e.target),Ne.intersectPlane(vt,e.target))))}else e.object instanceof De&&e.object.isOrthographicCamera&&(Ae=g!==1,Ae&&(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/g)),e.object.updateProjectionMatrix()));return g=1,T=!1,Ae||z.distanceToSquared(e.object.position)>y||8*(1-oe.dot(e.object.quaternion))>y?(e.dispatchEvent(i),z.copy(e.object.position),oe.copy(e.object.quaternion),Ae=!1,!0):!1}})(),this.connect=n=>{e.domElement=n,e.domElement.style.touchAction="none",e.domElement.addEventListener("contextmenu",st),e.domElement.addEventListener("pointerdown",Ue),e.domElement.addEventListener("pointercancel",de),e.domElement.addEventListener("wheel",K)},this.dispose=()=>{var n,c,v,P,z,oe;e.domElement&&(e.domElement.style.touchAction="auto"),(n=e.domElement)==null||n.removeEventListener("contextmenu",st),(c=e.domElement)==null||c.removeEventListener("pointerdown",Ue),(v=e.domElement)==null||v.removeEventListener("pointercancel",de),(P=e.domElement)==null||P.removeEventListener("wheel",K),(z=e.domElement)==null||z.ownerDocument.removeEventListener("pointermove",_e),(oe=e.domElement)==null||oe.ownerDocument.removeEventListener("pointerup",de),e._domElementKeyEvents!==null&&e._domElementKeyEvents.removeEventListener("keydown",Ze)};const e=this,i={type:"change"},s={type:"start"},p={type:"end"},a={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let u=a.NONE;const y=1e-6,f=new ct,l=new ct;let g=1;const h=new D,A=new V,_=new V,b=new V,S=new V,C=new V,x=new V,M=new V,O=new V,E=new V,j=new D,k=new V;let T=!1;const w=[],R={};function We(){return 2*Math.PI/60/60*e.autoRotateSpeed}function ee(){return Math.pow(.95,e.zoomSpeed)}function Se(n){e.reverseOrbit||e.reverseHorizontalOrbit?l.theta+=n:l.theta-=n}function U(n){e.reverseOrbit||e.reverseVerticalOrbit?l.phi+=n:l.phi-=n}const me=(()=>{const n=new D;return function(v,P){n.setFromMatrixColumn(P,0),n.multiplyScalar(-v),h.add(n)}})(),H=(()=>{const n=new D;return function(v,P){e.screenSpacePanning===!0?n.setFromMatrixColumn(P,1):(n.setFromMatrixColumn(P,0),n.crossVectors(e.object.up,n)),n.multiplyScalar(v),h.add(n)}})(),te=(()=>{const n=new D;return function(v,P){const z=e.domElement;if(z&&e.object instanceof Te&&e.object.isPerspectiveCamera){const oe=e.object.position;n.copy(oe).sub(e.target);let le=n.length();le*=Math.tan(e.object.fov/2*Math.PI/180),me(2*v*le/z.clientHeight,e.object.matrix),H(2*P*le/z.clientHeight,e.object.matrix)}else z&&e.object instanceof De&&e.object.isOrthographicCamera?(me(v*(e.object.right-e.object.left)/e.object.zoom/z.clientWidth,e.object.matrix),H(P*(e.object.top-e.object.bottom)/e.object.zoom/z.clientHeight,e.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),e.enablePan=!1)}})();function re(n){e.object instanceof Te&&e.object.isPerspectiveCamera||e.object instanceof De&&e.object.isOrthographicCamera?g=n:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function $(n){re(g/n)}function ue(n){re(g*n)}function ne(n){if(!e.zoomToCursor||!e.domElement)return;T=!0;const c=e.domElement.getBoundingClientRect(),v=n.clientX-c.left,P=n.clientY-c.top,z=c.width,oe=c.height;k.x=v/z*2-1,k.y=-(P/oe)*2+1,j.set(k.x,k.y,1).unproject(e.object).sub(e.object.position).normalize()}function Y(n){return Math.max(e.minDistance,Math.min(e.maxDistance,n))}function fe(n){A.set(n.clientX,n.clientY)}function ge(n){ne(n),M.set(n.clientX,n.clientY)}function Me(n){S.set(n.clientX,n.clientY)}function ke(n){_.set(n.clientX,n.clientY),b.subVectors(_,A).multiplyScalar(e.rotateSpeed);const c=e.domElement;c&&(Se(2*Math.PI*b.x/c.clientHeight),U(2*Math.PI*b.y/c.clientHeight)),A.copy(_),e.update()}function ae(n){O.set(n.clientX,n.clientY),E.subVectors(O,M),E.y>0?$(ee()):E.y<0&&ue(ee()),M.copy(O),e.update()}function Re(n){C.set(n.clientX,n.clientY),x.subVectors(C,S).multiplyScalar(e.panSpeed),te(x.x,x.y),S.copy(C),e.update()}function F(n){ne(n),n.deltaY<0?ue(ee()):n.deltaY>0&&$(ee()),e.update()}function L(n){let c=!1;switch(n.code){case e.keys.UP:te(0,e.keyPanSpeed),c=!0;break;case e.keys.BOTTOM:te(0,-e.keyPanSpeed),c=!0;break;case e.keys.LEFT:te(e.keyPanSpeed,0),c=!0;break;case e.keys.RIGHT:te(-e.keyPanSpeed,0),c=!0;break}c&&(n.preventDefault(),e.update())}function Z(){if(w.length==1)A.set(w[0].pageX,w[0].pageY);else{const n=.5*(w[0].pageX+w[1].pageX),c=.5*(w[0].pageY+w[1].pageY);A.set(n,c)}}function G(){if(w.length==1)S.set(w[0].pageX,w[0].pageY);else{const n=.5*(w[0].pageX+w[1].pageX),c=.5*(w[0].pageY+w[1].pageY);S.set(n,c)}}function ce(){const n=w[0].pageX-w[1].pageX,c=w[0].pageY-w[1].pageY,v=Math.sqrt(n*n+c*c);M.set(0,v)}function ve(){e.enableZoom&&ce(),e.enablePan&&G()}function Ve(){e.enableZoom&&ce(),e.enableRotate&&Z()}function X(n){if(w.length==1)_.set(n.pageX,n.pageY);else{const v=Xe(n),P=.5*(n.pageX+v.x),z=.5*(n.pageY+v.y);_.set(P,z)}b.subVectors(_,A).multiplyScalar(e.rotateSpeed);const c=e.domElement;c&&(Se(2*Math.PI*b.x/c.clientHeight),U(2*Math.PI*b.y/c.clientHeight)),A.copy(_)}function Pe(n){if(w.length==1)C.set(n.pageX,n.pageY);else{const c=Xe(n),v=.5*(n.pageX+c.x),P=.5*(n.pageY+c.y);C.set(v,P)}x.subVectors(C,S).multiplyScalar(e.panSpeed),te(x.x,x.y),S.copy(C)}function be(n){const c=Xe(n),v=n.pageX-c.x,P=n.pageY-c.y,z=Math.sqrt(v*v+P*P);O.set(0,z),E.set(0,Math.pow(O.y/M.y,e.zoomSpeed)),$(E.y),M.copy(O)}function ze(n){e.enableZoom&&be(n),e.enablePan&&Pe(n)}function Ye(n){e.enableZoom&&be(n),e.enableRotate&&X(n)}function Ue(n){var c,v;e.enabled!==!1&&(w.length===0&&((c=e.domElement)==null||c.ownerDocument.addEventListener("pointermove",_e),(v=e.domElement)==null||v.ownerDocument.addEventListener("pointerup",de)),Rt(n),n.pointerType==="touch"?jt(n):Ge(n))}function _e(n){e.enabled!==!1&&(n.pointerType==="touch"?Ct(n):$e(n))}function de(n){var c,v,P;zt(n),w.length===0&&((c=e.domElement)==null||c.releasePointerCapture(n.pointerId),(v=e.domElement)==null||v.ownerDocument.removeEventListener("pointermove",_e),(P=e.domElement)==null||P.ownerDocument.removeEventListener("pointerup",de)),e.dispatchEvent(p),u=a.NONE}function Ge(n){let c;switch(n.button){case 0:c=e.mouseButtons.LEFT;break;case 1:c=e.mouseButtons.MIDDLE;break;case 2:c=e.mouseButtons.RIGHT;break;default:c=-1}switch(c){case ye.DOLLY:if(e.enableZoom===!1)return;ge(n),u=a.DOLLY;break;case ye.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(e.enablePan===!1)return;Me(n),u=a.PAN}else{if(e.enableRotate===!1)return;fe(n),u=a.ROTATE}break;case ye.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(e.enableRotate===!1)return;fe(n),u=a.ROTATE}else{if(e.enablePan===!1)return;Me(n),u=a.PAN}break;default:u=a.NONE}u!==a.NONE&&e.dispatchEvent(s)}function $e(n){if(e.enabled!==!1)switch(u){case a.ROTATE:if(e.enableRotate===!1)return;ke(n);break;case a.DOLLY:if(e.enableZoom===!1)return;ae(n);break;case a.PAN:if(e.enablePan===!1)return;Re(n);break}}function K(n){e.enabled===!1||e.enableZoom===!1||u!==a.NONE&&u!==a.ROTATE||(n.preventDefault(),e.dispatchEvent(s),F(n),e.dispatchEvent(p))}function Ze(n){e.enabled===!1||e.enablePan===!1||L(n)}function jt(n){switch(rt(n),w.length){case 1:switch(e.touches.ONE){case xe.ROTATE:if(e.enableRotate===!1)return;Z(),u=a.TOUCH_ROTATE;break;case xe.PAN:if(e.enablePan===!1)return;G(),u=a.TOUCH_PAN;break;default:u=a.NONE}break;case 2:switch(e.touches.TWO){case xe.DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;ve(),u=a.TOUCH_DOLLY_PAN;break;case xe.DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;Ve(),u=a.TOUCH_DOLLY_ROTATE;break;default:u=a.NONE}break;default:u=a.NONE}u!==a.NONE&&e.dispatchEvent(s)}function Ct(n){switch(rt(n),u){case a.TOUCH_ROTATE:if(e.enableRotate===!1)return;X(n),e.update();break;case a.TOUCH_PAN:if(e.enablePan===!1)return;Pe(n),e.update();break;case a.TOUCH_DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;ze(n),e.update();break;case a.TOUCH_DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;Ye(n),e.update();break;default:u=a.NONE}}function st(n){e.enabled!==!1&&n.preventDefault()}function Rt(n){w.push(n)}function zt(n){delete R[n.pointerId];for(let c=0;c<w.length;c++)if(w[c].pointerId==n.pointerId){w.splice(c,1);return}}function rt(n){let c=R[n.pointerId];c===void 0&&(c=new V,R[n.pointerId]=c),c.set(n.pageX,n.pageY)}function Xe(n){const c=n.pointerId===w[0].pointerId?w[1]:w[0];return R[c.pointerId]}this.dollyIn=(n=ee())=>{ue(n),e.update()},this.dollyOut=(n=ee())=>{$(n),e.update()},this.getScale=()=>g,this.setScale=n=>{re(n),e.update()},this.getZoomScale=()=>ee(),o!==void 0&&this.connect(o),this.update()}};const yt=new tt,Be=new D;class ot extends Ft{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],o=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],e=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(e),this.setAttribute("position",new ut(t,3)),this.setAttribute("uv",new ut(o,2))}applyMatrix4(t){const o=this.attributes.instanceStart,e=this.attributes.instanceEnd;return o!==void 0&&(o.applyMatrix4(t),e.applyMatrix4(t),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let o;t instanceof Float32Array?o=t:Array.isArray(t)&&(o=new Float32Array(t));const e=new Je(o,6,1);return this.setAttribute("instanceStart",new Ee(e,3,0)),this.setAttribute("instanceEnd",new Ee(e,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t,o=3){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const i=new Je(e,o*2,1);return this.setAttribute("instanceColorStart",new Ee(i,o,0)),this.setAttribute("instanceColorEnd",new Ee(i,o,o)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new Wt(t.geometry)),this}fromLineSegments(t){const o=t.geometry;return this.setPositions(o.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new tt);const t=this.attributes.instanceStart,o=this.attributes.instanceEnd;t!==void 0&&o!==void 0&&(this.boundingBox.setFromBufferAttribute(t),yt.setFromBufferAttribute(o),this.boundingBox.union(yt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mt),this.boundingBox===null&&this.computeBoundingBox();const t=this.attributes.instanceStart,o=this.attributes.instanceEnd;if(t!==void 0&&o!==void 0){const e=this.boundingSphere.center;this.boundingBox.getCenter(e);let i=0;for(let s=0,p=t.count;s<p;s++)Be.fromBufferAttribute(t,s),i=Math.max(i,e.distanceToSquared(Be)),Be.fromBufferAttribute(o,s),i=Math.max(i,e.distanceToSquared(Be));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(t){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(t)}}class Tt extends ot{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(t){const o=t.length-3,e=new Float32Array(2*o);for(let i=0;i<o;i+=3)e[2*i]=t[i],e[2*i+1]=t[i+1],e[2*i+2]=t[i+2],e[2*i+3]=t[i+3],e[2*i+4]=t[i+4],e[2*i+5]=t[i+5];return super.setPositions(e),this}setColors(t,o=3){const e=t.length-o,i=new Float32Array(2*e);if(o===3)for(let s=0;s<e;s+=o)i[2*s]=t[s],i[2*s+1]=t[s+1],i[2*s+2]=t[s+2],i[2*s+3]=t[s+3],i[2*s+4]=t[s+4],i[2*s+5]=t[s+5];else for(let s=0;s<e;s+=o)i[2*s]=t[s],i[2*s+1]=t[s+1],i[2*s+2]=t[s+2],i[2*s+3]=t[s+3],i[2*s+4]=t[s+4],i[2*s+5]=t[s+5],i[2*s+6]=t[s+6],i[2*s+7]=t[s+7];return super.setColors(i,o),this}fromLine(t){const o=t.geometry;return this.setPositions(o.attributes.position.array),this}}class it extends kt{constructor(t){super({type:"LineMaterial",uniforms:ft.clone(ft.merge([dt.common,dt.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new V(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${Ot>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(o){this.uniforms.diffuse.value=o}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(o){o===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(o){this.uniforms.linewidth.value=o}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(o){!!o!="USE_DASH"in this.defines&&(this.needsUpdate=!0),o===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(o){this.uniforms.dashScale.value=o}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(o){this.uniforms.dashSize.value=o}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(o){this.uniforms.dashOffset.value=o}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(o){this.uniforms.gapSize.value=o}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(o){this.uniforms.opacity.value=o}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(o){this.uniforms.resolution.value.copy(o)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(o){!!o!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),o===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(t)}}const Ke=new we,xt=new D,Et=new D,I=new we,N=new we,q=new we,qe=new D,Qe=new Gt,B=new Yt,wt=new D,He=new tt,Fe=new Mt,Q=new we;let J,he;function St(r,t,o){return Q.set(0,0,-t,1).applyMatrix4(r.projectionMatrix),Q.multiplyScalar(1/Q.w),Q.x=he/o.width,Q.y=he/o.height,Q.applyMatrix4(r.projectionMatrixInverse),Q.multiplyScalar(1/Q.w),Math.abs(Math.max(Q.x,Q.y))}function bn(r,t){const o=r.matrixWorld,e=r.geometry,i=e.attributes.instanceStart,s=e.attributes.instanceEnd,p=Math.min(e.instanceCount,i.count);for(let a=0,u=p;a<u;a++){B.start.fromBufferAttribute(i,a),B.end.fromBufferAttribute(s,a),B.applyMatrix4(o);const y=new D,f=new D;J.distanceSqToSegment(B.start,B.end,f,y),f.distanceTo(y)<he*.5&&t.push({point:f,pointOnLine:y,distance:J.origin.distanceTo(f),object:r,face:null,faceIndex:a,uv:null,[Lt]:null})}}function yn(r,t,o){const e=t.projectionMatrix,s=r.material.resolution,p=r.matrixWorld,a=r.geometry,u=a.attributes.instanceStart,y=a.attributes.instanceEnd,f=Math.min(a.instanceCount,u.count),l=-t.near;J.at(1,q),q.w=1,q.applyMatrix4(t.matrixWorldInverse),q.applyMatrix4(e),q.multiplyScalar(1/q.w),q.x*=s.x/2,q.y*=s.y/2,q.z=0,qe.copy(q),Qe.multiplyMatrices(t.matrixWorldInverse,p);for(let g=0,h=f;g<h;g++){if(I.fromBufferAttribute(u,g),N.fromBufferAttribute(y,g),I.w=1,N.w=1,I.applyMatrix4(Qe),N.applyMatrix4(Qe),I.z>l&&N.z>l)continue;if(I.z>l){const x=I.z-N.z,M=(I.z-l)/x;I.lerp(N,M)}else if(N.z>l){const x=N.z-I.z,M=(N.z-l)/x;N.lerp(I,M)}I.applyMatrix4(e),N.applyMatrix4(e),I.multiplyScalar(1/I.w),N.multiplyScalar(1/N.w),I.x*=s.x/2,I.y*=s.y/2,N.x*=s.x/2,N.y*=s.y/2,B.start.copy(I),B.start.z=0,B.end.copy(N),B.end.z=0;const _=B.closestPointToPointParameter(qe,!0);B.at(_,wt);const b=Pt.lerp(I.z,N.z,_),S=b>=-1&&b<=1,C=qe.distanceTo(wt)<he*.5;if(S&&C){B.start.fromBufferAttribute(u,g),B.end.fromBufferAttribute(y,g),B.start.applyMatrix4(p),B.end.applyMatrix4(p);const x=new D,M=new D;J.distanceSqToSegment(B.start,B.end,M,x),o.push({point:M,pointOnLine:x,distance:J.origin.distanceTo(M),object:r,face:null,faceIndex:g,uv:null,[Lt]:null})}}}class Dt extends Vt{constructor(t=new ot,o=new it({color:Math.random()*16777215})){super(t,o),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const t=this.geometry,o=t.attributes.instanceStart,e=t.attributes.instanceEnd,i=new Float32Array(2*o.count);for(let p=0,a=0,u=o.count;p<u;p++,a+=2)xt.fromBufferAttribute(o,p),Et.fromBufferAttribute(e,p),i[a]=a===0?0:i[a-1],i[a+1]=i[a]+xt.distanceTo(Et);const s=new Je(i,2,1);return t.setAttribute("instanceDistanceStart",new Ee(s,1,0)),t.setAttribute("instanceDistanceEnd",new Ee(s,1,1)),this}raycast(t,o){const e=this.material.worldUnits,i=t.camera;i===null&&!e&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const s=t.params.Line2!==void 0&&t.params.Line2.threshold||0;J=t.ray;const p=this.matrixWorld,a=this.geometry,u=this.material;he=u.linewidth+s,a.boundingSphere===null&&a.computeBoundingSphere(),Fe.copy(a.boundingSphere).applyMatrix4(p);let y;if(e)y=he*.5;else{const l=Math.max(i.near,Fe.distanceToPoint(J.origin));y=St(i,l,u.resolution)}if(Fe.radius+=y,J.intersectsSphere(Fe)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),He.copy(a.boundingBox).applyMatrix4(p);let f;if(e)f=he*.5;else{const l=Math.max(i.near,He.distanceToPoint(J.origin));f=St(i,l,u.resolution)}He.expandByScalar(f),J.intersectsBox(He)!==!1&&(e?bn(this,o):yn(this,i,o))}onBeforeRender(t){const o=this.material.uniforms;o&&o.resolution&&(t.getViewport(Ke),this.material.uniforms.resolution.value.set(Ke.z,Ke.w))}}class xn extends Dt{constructor(t=new Tt,o=new it({color:Math.random()*16777215})){super(t,o),this.isLine2=!0,this.type="Line2"}}const Dn=d.forwardRef(function({points:t,color:o=16777215,vertexColors:e,linewidth:i,lineWidth:s,segments:p,dashed:a,...u},y){var f,l;const g=W(S=>S.size),h=d.useMemo(()=>p?new Dt:new xn,[p]),[A]=d.useState(()=>new it),_=(e==null||(f=e[0])==null?void 0:f.length)===4?4:3,b=d.useMemo(()=>{const S=p?new ot:new Tt,C=t.map(x=>{const M=Array.isArray(x);return x instanceof D||x instanceof we?[x.x,x.y,x.z]:x instanceof V?[x.x,x.y,0]:M&&x.length===3?[x[0],x[1],x[2]]:M&&x.length===2?[x[0],x[1],0]:x});if(S.setPositions(C.flat()),e){o=16777215;const x=e.map(M=>M instanceof $t?M.toArray():M);S.setColors(x.flat(),_)}return S},[t,p,e,_]);return d.useLayoutEffect(()=>{h.computeLineDistances()},[t,h]),d.useLayoutEffect(()=>{a?A.defines.USE_DASH="":delete A.defines.USE_DASH,A.needsUpdate=!0},[a,A]),d.useEffect(()=>()=>{b.dispose(),A.dispose()},[b]),d.createElement("primitive",pe({object:h,ref:y},u),d.createElement("primitive",{object:b,attach:"geometry"}),d.createElement("primitive",pe({object:A,attach:"material",color:o,vertexColors:!!e,resolution:[g.width,g.height],linewidth:(l=i??s)!==null&&l!==void 0?l:1,dashed:a,transparent:_===4},u)))});function En(r,t,o){const e=W(g=>g.size),i=W(g=>g.viewport),s=typeof r=="number"?r:e.width*i.dpr,p=e.height*i.dpr,a=(typeof r=="number"?o:r)||{},{samples:u=0,depth:y,...f}=a,l=d.useMemo(()=>{const g=new Zt(s,p,{minFilter:ht,magFilter:ht,type:Xt,...f});return y&&(g.depthTexture=new Kt(s,p,qt)),g.samples=u,g},[]);return d.useLayoutEffect(()=>{l.setSize(s,p),u&&(l.samples=u)},[u,l,s,p]),d.useEffect(()=>()=>l.dispose(),[]),l}const wn=r=>typeof r=="function",jn=d.forwardRef(({envMap:r,resolution:t=256,frames:o=1/0,makeDefault:e,children:i,...s},p)=>{const a=W(({set:b})=>b),u=W(({camera:b})=>b),y=W(({size:b})=>b),f=d.useRef(null);d.useImperativeHandle(p,()=>f.current,[]);const l=d.useRef(null),g=En(t);d.useLayoutEffect(()=>{s.manual||(f.current.aspect=y.width/y.height)},[y,s]),d.useLayoutEffect(()=>{f.current.updateProjectionMatrix()});let h=0,A=null;const _=wn(i);return je(b=>{_&&(o===1/0||h<o)&&(l.current.visible=!1,b.gl.setRenderTarget(g),A=b.scene.background,r&&(b.scene.background=r),b.gl.render(b.scene,f.current),b.scene.background=A,b.gl.setRenderTarget(null),l.current.visible=!0,h++)}),d.useLayoutEffect(()=>{if(e){const b=u;return a(()=>({camera:f.current})),()=>a(()=>({camera:b}))}},[f,e,a]),d.createElement(d.Fragment,null,d.createElement("perspectiveCamera",pe({ref:f},s),!_&&i),d.createElement("group",{ref:l},_&&i(g.texture)))}),Cn=d.forwardRef(({makeDefault:r,camera:t,regress:o,domElement:e,enableDamping:i=!0,keyEvents:s=!1,onChange:p,onStart:a,onEnd:u,...y},f)=>{const l=W(E=>E.invalidate),g=W(E=>E.camera),h=W(E=>E.gl),A=W(E=>E.events),_=W(E=>E.setEvents),b=W(E=>E.set),S=W(E=>E.get),C=W(E=>E.performance),x=t||g,M=e||A.connected||h.domElement,O=d.useMemo(()=>new vn(x),[x]);return je(()=>{O.enabled&&O.update()},-1),d.useEffect(()=>(s&&O.connect(s===!0?M:s),O.connect(M),()=>void O.dispose()),[s,M,o,O,l]),d.useEffect(()=>{const E=T=>{l(),o&&C.regress(),p&&p(T)},j=T=>{a&&a(T)},k=T=>{u&&u(T)};return O.addEventListener("change",E),O.addEventListener("start",j),O.addEventListener("end",k),()=>{O.removeEventListener("start",j),O.removeEventListener("end",k),O.removeEventListener("change",E)}},[p,a,u,O,l,_]),d.useEffect(()=>{if(r){const E=S().controls;return b({controls:O}),()=>b({controls:E})}},[r,O]),d.createElement("primitive",pe({ref:f,object:O,enableDamping:i},y))}),Rn=d.forwardRef(({children:r,enabled:t=!0,speed:o=1,rotationIntensity:e=1,floatIntensity:i=1,floatingRange:s=[-.1,.1],autoInvalidate:p=!1,...a},u)=>{const y=d.useRef(null);d.useImperativeHandle(u,()=>y.current,[]);const f=d.useRef(Math.random()*1e4);return je(l=>{var g,h;if(!t||o===0)return;p&&l.invalidate();const A=f.current+l.clock.elapsedTime;y.current.rotation.x=Math.cos(A/4*o)/8*e,y.current.rotation.y=Math.sin(A/4*o)/8*e,y.current.rotation.z=Math.sin(A/4*o)/20*e;let _=Math.sin(A/4*o)/10;_=Pt.mapLinear(_,-.1,.1,(g=s?.[0])!==null&&g!==void 0?g:-.1,(h=s?.[1])!==null&&h!==void 0?h:.1),y.current.position.y=_*i,y.current.updateMatrix()}),d.createElement("group",a,d.createElement("group",{ref:y,matrixAutoUpdate:!1},r))}),Sn=d.createContext(null);function zn({iterations:r=10,ms:t=250,threshold:o=.75,step:e=.1,factor:i=.5,flipflops:s=1/0,bounds:p=g=>g>100?[60,100]:[40,60],onIncline:a,onDecline:u,onChange:y,onFallback:f,children:l}){const g=Math.pow(10,0),[h,A]=d.useState(()=>({fps:0,index:0,factor:i,flipped:0,refreshrate:0,fallback:!1,frames:[],averages:[],subscriptions:new Map,subscribe:b=>{const S=Symbol();return h.subscriptions.set(S,b.current),()=>void h.subscriptions.delete(S)}}));let _=0;return je(()=>{const{frames:b,averages:S}=h;if(!h.fallback&&S.length<r){b.push(performance.now());const C=b[b.length-1]-b[0];if(C>=t){if(h.fps=Math.round(b.length/C*1e3*g)/g,h.refreshrate=Math.max(h.refreshrate,h.fps),S[h.index++%r]=h.fps,S.length===r){const[x,M]=p(h.refreshrate),O=S.filter(j=>j>=M),E=S.filter(j=>j<x);O.length>r*o&&(h.factor=Math.min(1,h.factor+e),h.flipped++,a&&a(h),h.subscriptions.forEach(j=>j.onIncline&&j.onIncline(h))),E.length>r*o&&(h.factor=Math.max(0,h.factor-e),h.flipped++,u&&u(h),h.subscriptions.forEach(j=>j.onDecline&&j.onDecline(h))),_!==h.factor&&(_=h.factor,y&&y(h),h.subscriptions.forEach(j=>j.onChange&&j.onChange(h))),h.flipped>s&&!h.fallback&&(h.fallback=!0,f&&f(h),h.subscriptions.forEach(j=>j.onFallback&&j.onFallback(h))),h.averages=[]}h.frames=[]}}}),d.createElement(Sn.Provider,{value:h},l)}export{Rn as F,Ln as H,Dn as L,Cn as O,jn as P,On as _,zn as a,_t as c};
//# sourceMappingURL=vendor-three-drei-CFutg3IW.js.map

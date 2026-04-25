import{a as zt,r as f}from"./vendor-react-pFa7izqm.js";import{c as O,D as Ut,d as k,P as Te,O as De,g as It,M as ye,h as xe,i as ct,Q as lt,j as Nt,k as Bt,I as Ht,F as ut,l as Qe,m as Ee,n as Wt,o as et,p as Pt,q as Ft,r as dt,s as ft,t as kt,u as we,v as Vt,w as Yt,x as Gt,y as Zt,z as $t,H as Xt,E as ht,G as Kt,J as qt}from"./vendor-three-core-Dd_m_y-1.js";import{u as W,a as tt}from"./vendor-three-fiber-BeIi2gAp.js";var Mt,pt=zt;Mt=pt.createRoot,pt.hydrateRoot;const Qt="modulepreload",Jt=function(r){return"/"+r},mt={},On=function(t,i,e){let o=Promise.resolve();if(i&&i.length>0){document.getElementsByTagName("link");const h=document.querySelector("meta[property=csp-nonce]"),a=h?.nonce||h?.getAttribute("nonce");o=Promise.allSettled(i.map(u=>{if(u=Jt(u),u in mt)return;mt[u]=!0;const w=u.endsWith(".css"),d=w?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${d}`))return;const l=document.createElement("link");if(l.rel=w?"stylesheet":Qt,w||(l.as="script"),l.crossOrigin="",l.href=u,a&&l.setAttribute("nonce",a),document.head.appendChild(l),w)return new Promise((g,D)=>{l.addEventListener("load",g),l.addEventListener("error",()=>D(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(h){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=h,window.dispatchEvent(a),!a.defaultPrevented)throw h}return o.then(h=>{for(const a of h||[])a.status==="rejected"&&s(a.reason);return t().catch(s)})};function pe(){return pe=Object.assign?Object.assign.bind():function(r){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var e in i)({}).hasOwnProperty.call(i,e)&&(r[e]=i[e])}return r},pe.apply(null,arguments)}const je=new O,nt=new O,en=new O,gt=new k;function tn(r,t,i){const e=je.setFromMatrixPosition(r.matrixWorld);e.project(t);const o=i.width/2,s=i.height/2;return[e.x*o+o,-(e.y*s)+s]}function nn(r,t){const i=je.setFromMatrixPosition(r.matrixWorld),e=nt.setFromMatrixPosition(t.matrixWorld),o=i.sub(e),s=t.getWorldDirection(en);return o.angleTo(s)>Math.PI/2}function on(r,t,i,e){const o=je.setFromMatrixPosition(r.matrixWorld),s=o.clone();s.project(t),gt.set(s.x,s.y),i.setFromCamera(gt,t);const h=i.intersectObjects(e,!0);if(h.length){const a=h[0].distance;return o.distanceTo(i.ray.origin)<a}return!0}function sn(r,t){if(t instanceof De)return t.zoom;if(t instanceof Te){const i=je.setFromMatrixPosition(r.matrixWorld),e=nt.setFromMatrixPosition(t.matrixWorld),o=t.fov*Math.PI/180,s=i.distanceTo(e);return 1/(2*Math.tan(o/2)*s)}else return 1}function rn(r,t,i){if(t instanceof Te||t instanceof De){const e=je.setFromMatrixPosition(r.matrixWorld),o=nt.setFromMatrixPosition(t.matrixWorld),s=e.distanceTo(o),h=(i[1]-i[0])/(t.far-t.near),a=i[1]-h*t.far;return Math.round(h*s+a)}}const Je=r=>Math.abs(r)<1e-10?0:r;function _t(r,t,i=""){let e="matrix3d(";for(let o=0;o!==16;o++)e+=Je(t[o]*r.elements[o])+(o!==15?",":")");return i+e}const an=(r=>t=>_t(t,r))([1,-1,1,1,1,-1,1,1,1,-1,1,1,1,-1,1,1]),cn=(r=>(t,i)=>_t(t,r(i),"translate(-50%,-50%)"))(r=>[1/r,1/r,1/r,1,-1/r,-1/r,-1/r,-1,1/r,1/r,1/r,1,1,1,1,1]);function ln(r){return r&&typeof r=="object"&&"current"in r}const An=f.forwardRef(({children:r,eps:t=.001,style:i,className:e,prepend:o,center:s,fullscreen:h,portal:a,distanceFactor:u,sprite:w=!1,transform:d=!1,occlude:l,onOcclude:g,castShadow:D,receiveShadow:A,material:L,geometry:y,zIndexRange:T=[16777271,0],calculatePosition:N=tn,as:v="div",wrapperClass:S,pointerEvents:M="auto",...b},se)=>{const{gl:F,camera:_,scene:x,size:j,raycaster:We,events:J,viewport:Se}=W(),[R]=f.useState(()=>document.createElement(v)),me=f.useRef(),B=f.useRef(null),ee=f.useRef(0),re=f.useRef([0,0]),G=f.useRef(null),ue=f.useRef(null),te=a?.current||J.connected||F.domElement.parentNode,V=f.useRef(null),de=f.useRef(!1),ge=f.useMemo(()=>l&&l!=="blending"||Array.isArray(l)&&l.length&&ln(l[0]),[l]);f.useLayoutEffect(()=>{const H=F.domElement;l&&l==="blending"?(H.style.zIndex=`${Math.floor(T[0]/2)}`,H.style.position="absolute",H.style.pointerEvents="none"):(H.style.zIndex=null,H.style.position=null,H.style.pointerEvents=null)},[l]),f.useLayoutEffect(()=>{if(B.current){const H=me.current=Mt(R);if(x.updateMatrixWorld(),d)R.style.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else{const P=N(B.current,_,j);R.style.cssText=`position:absolute;top:0;left:0;transform:translate3d(${P[0]}px,${P[1]}px,0);transform-origin:0 0;`}return te&&(o?te.prepend(R):te.appendChild(R)),()=>{te&&te.removeChild(R),H.unmount()}}},[te,d]),f.useLayoutEffect(()=>{S&&(R.className=S)},[S]);const Pe=f.useMemo(()=>d?{position:"absolute",top:0,left:0,width:j.width,height:j.height,transformStyle:"preserve-3d",pointerEvents:"none"}:{position:"absolute",transform:s?"translate3d(-50%,-50%,0)":"none",...h&&{top:-j.height/2,left:-j.width/2,width:j.width,height:j.height},...i},[i,s,h,j,d]),Fe=f.useMemo(()=>({position:"absolute",pointerEvents:M}),[M]);f.useLayoutEffect(()=>{if(de.current=!1,d){var H;(H=me.current)==null||H.render(f.createElement("div",{ref:G,style:Pe},f.createElement("div",{ref:ue,style:Fe},f.createElement("div",{ref:se,className:e,style:i,children:r}))))}else{var P;(P=me.current)==null||P.render(f.createElement("div",{ref:se,style:Pe,className:e,children:r}))}});const ae=f.useRef(!0);tt(H=>{if(B.current){_.updateMatrixWorld(),B.current.updateWorldMatrix(!0,!1);const P=d?re.current:N(B.current,_,j);if(d||Math.abs(ee.current-_.zoom)>t||Math.abs(re.current[0]-P[0])>t||Math.abs(re.current[1]-P[1])>t){const Z=nn(B.current,_);let Y=!1;ge&&(Array.isArray(l)?Y=l.map($=>$.current):l!=="blending"&&(Y=[x]));const ce=ae.current;if(Y){const $=on(B.current,_,We,Y);ae.current=$&&!Z}else ae.current=!Z;ce!==ae.current&&(g?g(!ae.current):R.style.display=ae.current?"block":"none");const ve=Math.floor(T[0]/2),ke=l?ge?[T[0],ve]:[ve-1,0]:T;if(R.style.zIndex=`${rn(B.current,_,ke)}`,d){const[$,Me]=[j.width/2,j.height/2],be=_.projectionMatrix.elements[5]*Me,{isOrthographicCamera:Re,top:Ve,left:ze,bottom:_e,right:fe}=_,Ye=an(_.matrixWorldInverse),Ge=Re?`scale(${be})translate(${Je(-(fe+ze)/2)}px,${Je((Ve+_e)/2)}px)`:`translateZ(${be}px)`;let X=B.current.matrixWorld;w&&(X=_.matrixWorldInverse.clone().transpose().copyPosition(X).scale(B.current.scale),X.elements[3]=X.elements[7]=X.elements[11]=0,X.elements[15]=1),R.style.width=j.width+"px",R.style.height=j.height+"px",R.style.perspective=Re?"":`${be}px`,G.current&&ue.current&&(G.current.style.transform=`${Ge}${Ye}translate(${$}px,${Me}px)`,ue.current.style.transform=cn(X,1/((u||10)/400)))}else{const $=u===void 0?1:sn(B.current,_)*u;R.style.transform=`translate3d(${P[0]}px,${P[1]}px,0) scale(${$})`}re.current=P,ee.current=_.zoom}}if(!ge&&V.current&&!de.current)if(d){if(G.current){const P=G.current.children[0];if(P!=null&&P.clientWidth&&P!=null&&P.clientHeight){const{isOrthographicCamera:Z}=_;if(Z||y)b.scale&&(Array.isArray(b.scale)?b.scale instanceof O?V.current.scale.copy(b.scale.clone().divideScalar(1)):V.current.scale.set(1/b.scale[0],1/b.scale[1],1/b.scale[2]):V.current.scale.setScalar(1/b.scale));else{const Y=(u||10)/400,ce=P.clientWidth*Y,ve=P.clientHeight*Y;V.current.scale.set(ce,ve,1)}de.current=!0}}}else{const P=R.children[0];if(P!=null&&P.clientWidth&&P!=null&&P.clientHeight){const Z=1/Se.factor,Y=P.clientWidth*Z,ce=P.clientHeight*Z;V.current.scale.set(Y,ce,1),de.current=!0}V.current.lookAt(H.camera.position)}});const Ce=f.useMemo(()=>({vertexShader:d?void 0:`
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
      `}),[d]);return f.createElement("group",pe({},b,{ref:B}),l&&!ge&&f.createElement("mesh",{castShadow:D,receiveShadow:A,ref:V},y||f.createElement("planeGeometry",null),L||f.createElement("shaderMaterial",{side:Ut,vertexShader:Ce.vertexShader,fragmentShader:Ce.fragmentShader})))}),Ot=parseInt(It.replace(/\D+/g,"")),At=Ot>=125?"uv1":"uv2";var un=Object.defineProperty,dn=(r,t,i)=>t in r?un(r,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):r[t]=i,fn=(r,t,i)=>(dn(r,t+"",i),i);class hn{constructor(){fn(this,"_listeners")}addEventListener(t,i){this._listeners===void 0&&(this._listeners={});const e=this._listeners;e[t]===void 0&&(e[t]=[]),e[t].indexOf(i)===-1&&e[t].push(i)}hasEventListener(t,i){if(this._listeners===void 0)return!1;const e=this._listeners;return e[t]!==void 0&&e[t].indexOf(i)!==-1}removeEventListener(t,i){if(this._listeners===void 0)return;const o=this._listeners[t];if(o!==void 0){const s=o.indexOf(i);s!==-1&&o.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const e=this._listeners[t.type];if(e!==void 0){t.target=this;const o=e.slice(0);for(let s=0,h=o.length;s<h;s++)o[s].call(this,t);t.target=null}}}var pn=Object.defineProperty,mn=(r,t,i)=>t in r?pn(r,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):r[t]=i,p=(r,t,i)=>(mn(r,typeof t!="symbol"?t+"":t,i),i);const Ie=new Nt,vt=new Bt,gn=Math.cos(70*(Math.PI/180)),bt=(r,t)=>(r%t+t)%t;let vn=class extends hn{constructor(t,i){super(),p(this,"object"),p(this,"domElement"),p(this,"enabled",!0),p(this,"target",new O),p(this,"minDistance",0),p(this,"maxDistance",1/0),p(this,"minZoom",0),p(this,"maxZoom",1/0),p(this,"minPolarAngle",0),p(this,"maxPolarAngle",Math.PI),p(this,"minAzimuthAngle",-1/0),p(this,"maxAzimuthAngle",1/0),p(this,"enableDamping",!1),p(this,"dampingFactor",.05),p(this,"enableZoom",!0),p(this,"zoomSpeed",1),p(this,"enableRotate",!0),p(this,"rotateSpeed",1),p(this,"enablePan",!0),p(this,"panSpeed",1),p(this,"screenSpacePanning",!0),p(this,"keyPanSpeed",7),p(this,"zoomToCursor",!1),p(this,"autoRotate",!1),p(this,"autoRotateSpeed",2),p(this,"reverseOrbit",!1),p(this,"reverseHorizontalOrbit",!1),p(this,"reverseVerticalOrbit",!1),p(this,"keys",{LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"}),p(this,"mouseButtons",{LEFT:ye.ROTATE,MIDDLE:ye.DOLLY,RIGHT:ye.PAN}),p(this,"touches",{ONE:xe.ROTATE,TWO:xe.DOLLY_PAN}),p(this,"target0"),p(this,"position0"),p(this,"zoom0"),p(this,"_domElementKeyEvents",null),p(this,"getPolarAngle"),p(this,"getAzimuthalAngle"),p(this,"setPolarAngle"),p(this,"setAzimuthalAngle"),p(this,"getDistance"),p(this,"getZoomScale"),p(this,"listenToKeyEvents"),p(this,"stopListenToKeyEvents"),p(this,"saveState"),p(this,"reset"),p(this,"update"),p(this,"connect"),p(this,"dispose"),p(this,"dollyIn"),p(this,"dollyOut"),p(this,"getScale"),p(this,"setScale"),this.object=t,this.domElement=i,this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=()=>d.phi,this.getAzimuthalAngle=()=>d.theta,this.setPolarAngle=n=>{let c=bt(n,2*Math.PI),m=d.phi;m<0&&(m+=2*Math.PI),c<0&&(c+=2*Math.PI);let E=Math.abs(c-m);2*Math.PI-E<E&&(c<m?c+=2*Math.PI:m+=2*Math.PI),l.phi=c-m,e.update()},this.setAzimuthalAngle=n=>{let c=bt(n,2*Math.PI),m=d.theta;m<0&&(m+=2*Math.PI),c<0&&(c+=2*Math.PI);let E=Math.abs(c-m);2*Math.PI-E<E&&(c<m?c+=2*Math.PI:m+=2*Math.PI),l.theta=c-m,e.update()},this.getDistance=()=>e.object.position.distanceTo(e.target),this.listenToKeyEvents=n=>{n.addEventListener("keydown",Ze),this._domElementKeyEvents=n},this.stopListenToKeyEvents=()=>{this._domElementKeyEvents.removeEventListener("keydown",Ze),this._domElementKeyEvents=null},this.saveState=()=>{e.target0.copy(e.target),e.position0.copy(e.object.position),e.zoom0=e.object.zoom},this.reset=()=>{e.target.copy(e.target0),e.object.position.copy(e.position0),e.object.zoom=e.zoom0,e.object.updateProjectionMatrix(),e.dispatchEvent(o),e.update(),u=a.NONE},this.update=(()=>{const n=new O,c=new O(0,1,0),m=new lt().setFromUnitVectors(t.up,c),E=m.clone().invert(),C=new O,ne=new lt,le=2*Math.PI;return function(){const at=e.object.position;m.setFromUnitVectors(t.up,c),E.copy(m).invert(),n.copy(at).sub(e.target),n.applyQuaternion(m),d.setFromVector3(n),e.autoRotate&&u===a.NONE&&Se(We()),e.enableDamping?(d.theta+=l.theta*e.dampingFactor,d.phi+=l.phi*e.dampingFactor):(d.theta+=l.theta,d.phi+=l.phi);let ie=e.minAzimuthAngle,oe=e.maxAzimuthAngle;isFinite(ie)&&isFinite(oe)&&(ie<-Math.PI?ie+=le:ie>Math.PI&&(ie-=le),oe<-Math.PI?oe+=le:oe>Math.PI&&(oe-=le),ie<=oe?d.theta=Math.max(ie,Math.min(oe,d.theta)):d.theta=d.theta>(ie+oe)/2?Math.max(ie,d.theta):Math.min(oe,d.theta)),d.phi=Math.max(e.minPolarAngle,Math.min(e.maxPolarAngle,d.phi)),d.makeSafe(),e.enableDamping===!0?e.target.addScaledVector(D,e.dampingFactor):e.target.add(D),e.zoomToCursor&&_||e.object.isOrthographicCamera?d.radius=V(d.radius):d.radius=V(d.radius*g),n.setFromSpherical(d),n.applyQuaternion(E),at.copy(e.target).add(n),e.object.matrixAutoUpdate||e.object.updateMatrix(),e.object.lookAt(e.target),e.enableDamping===!0?(l.theta*=1-e.dampingFactor,l.phi*=1-e.dampingFactor,D.multiplyScalar(1-e.dampingFactor)):(l.set(0,0,0),D.set(0,0,0));let Oe=!1;if(e.zoomToCursor&&_){let Ae=null;if(e.object instanceof Te&&e.object.isPerspectiveCamera){const Le=n.length();Ae=V(Le*g);const Ue=Le-Ae;e.object.position.addScaledVector(se,Ue),e.object.updateMatrixWorld()}else if(e.object.isOrthographicCamera){const Le=new O(F.x,F.y,0);Le.unproject(e.object),e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/g)),e.object.updateProjectionMatrix(),Oe=!0;const Ue=new O(F.x,F.y,0);Ue.unproject(e.object),e.object.position.sub(Ue).add(Le),e.object.updateMatrixWorld(),Ae=n.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),e.zoomToCursor=!1;Ae!==null&&(e.screenSpacePanning?e.target.set(0,0,-1).transformDirection(e.object.matrix).multiplyScalar(Ae).add(e.object.position):(Ie.origin.copy(e.object.position),Ie.direction.set(0,0,-1).transformDirection(e.object.matrix),Math.abs(e.object.up.dot(Ie.direction))<gn?t.lookAt(e.target):(vt.setFromNormalAndCoplanarPoint(e.object.up,e.target),Ie.intersectPlane(vt,e.target))))}else e.object instanceof De&&e.object.isOrthographicCamera&&(Oe=g!==1,Oe&&(e.object.zoom=Math.max(e.minZoom,Math.min(e.maxZoom,e.object.zoom/g)),e.object.updateProjectionMatrix()));return g=1,_=!1,Oe||C.distanceToSquared(e.object.position)>w||8*(1-ne.dot(e.object.quaternion))>w?(e.dispatchEvent(o),C.copy(e.object.position),ne.copy(e.object.quaternion),Oe=!1,!0):!1}})(),this.connect=n=>{e.domElement=n,e.domElement.style.touchAction="none",e.domElement.addEventListener("contextmenu",st),e.domElement.addEventListener("pointerdown",ze),e.domElement.addEventListener("pointercancel",fe),e.domElement.addEventListener("wheel",X)},this.dispose=()=>{var n,c,m,E,C,ne;e.domElement&&(e.domElement.style.touchAction="auto"),(n=e.domElement)==null||n.removeEventListener("contextmenu",st),(c=e.domElement)==null||c.removeEventListener("pointerdown",ze),(m=e.domElement)==null||m.removeEventListener("pointercancel",fe),(E=e.domElement)==null||E.removeEventListener("wheel",X),(C=e.domElement)==null||C.ownerDocument.removeEventListener("pointermove",_e),(ne=e.domElement)==null||ne.ownerDocument.removeEventListener("pointerup",fe),e._domElementKeyEvents!==null&&e._domElementKeyEvents.removeEventListener("keydown",Ze)};const e=this,o={type:"change"},s={type:"start"},h={type:"end"},a={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let u=a.NONE;const w=1e-6,d=new ct,l=new ct;let g=1;const D=new O,A=new k,L=new k,y=new k,T=new k,N=new k,v=new k,S=new k,M=new k,b=new k,se=new O,F=new k;let _=!1;const x=[],j={};function We(){return 2*Math.PI/60/60*e.autoRotateSpeed}function J(){return Math.pow(.95,e.zoomSpeed)}function Se(n){e.reverseOrbit||e.reverseHorizontalOrbit?l.theta+=n:l.theta-=n}function R(n){e.reverseOrbit||e.reverseVerticalOrbit?l.phi+=n:l.phi-=n}const me=(()=>{const n=new O;return function(m,E){n.setFromMatrixColumn(E,0),n.multiplyScalar(-m),D.add(n)}})(),B=(()=>{const n=new O;return function(m,E){e.screenSpacePanning===!0?n.setFromMatrixColumn(E,1):(n.setFromMatrixColumn(E,0),n.crossVectors(e.object.up,n)),n.multiplyScalar(m),D.add(n)}})(),ee=(()=>{const n=new O;return function(m,E){const C=e.domElement;if(C&&e.object instanceof Te&&e.object.isPerspectiveCamera){const ne=e.object.position;n.copy(ne).sub(e.target);let le=n.length();le*=Math.tan(e.object.fov/2*Math.PI/180),me(2*m*le/C.clientHeight,e.object.matrix),B(2*E*le/C.clientHeight,e.object.matrix)}else C&&e.object instanceof De&&e.object.isOrthographicCamera?(me(m*(e.object.right-e.object.left)/e.object.zoom/C.clientWidth,e.object.matrix),B(E*(e.object.top-e.object.bottom)/e.object.zoom/C.clientHeight,e.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),e.enablePan=!1)}})();function re(n){e.object instanceof Te&&e.object.isPerspectiveCamera||e.object instanceof De&&e.object.isOrthographicCamera?g=n:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),e.enableZoom=!1)}function G(n){re(g/n)}function ue(n){re(g*n)}function te(n){if(!e.zoomToCursor||!e.domElement)return;_=!0;const c=e.domElement.getBoundingClientRect(),m=n.clientX-c.left,E=n.clientY-c.top,C=c.width,ne=c.height;F.x=m/C*2-1,F.y=-(E/ne)*2+1,se.set(F.x,F.y,1).unproject(e.object).sub(e.object.position).normalize()}function V(n){return Math.max(e.minDistance,Math.min(e.maxDistance,n))}function de(n){A.set(n.clientX,n.clientY)}function ge(n){te(n),S.set(n.clientX,n.clientY)}function Pe(n){T.set(n.clientX,n.clientY)}function Fe(n){L.set(n.clientX,n.clientY),y.subVectors(L,A).multiplyScalar(e.rotateSpeed);const c=e.domElement;c&&(Se(2*Math.PI*y.x/c.clientHeight),R(2*Math.PI*y.y/c.clientHeight)),A.copy(L),e.update()}function ae(n){M.set(n.clientX,n.clientY),b.subVectors(M,S),b.y>0?G(J()):b.y<0&&ue(J()),S.copy(M),e.update()}function Ce(n){N.set(n.clientX,n.clientY),v.subVectors(N,T).multiplyScalar(e.panSpeed),ee(v.x,v.y),T.copy(N),e.update()}function H(n){te(n),n.deltaY<0?ue(J()):n.deltaY>0&&G(J()),e.update()}function P(n){let c=!1;switch(n.code){case e.keys.UP:ee(0,e.keyPanSpeed),c=!0;break;case e.keys.BOTTOM:ee(0,-e.keyPanSpeed),c=!0;break;case e.keys.LEFT:ee(e.keyPanSpeed,0),c=!0;break;case e.keys.RIGHT:ee(-e.keyPanSpeed,0),c=!0;break}c&&(n.preventDefault(),e.update())}function Z(){if(x.length==1)A.set(x[0].pageX,x[0].pageY);else{const n=.5*(x[0].pageX+x[1].pageX),c=.5*(x[0].pageY+x[1].pageY);A.set(n,c)}}function Y(){if(x.length==1)T.set(x[0].pageX,x[0].pageY);else{const n=.5*(x[0].pageX+x[1].pageX),c=.5*(x[0].pageY+x[1].pageY);T.set(n,c)}}function ce(){const n=x[0].pageX-x[1].pageX,c=x[0].pageY-x[1].pageY,m=Math.sqrt(n*n+c*c);S.set(0,m)}function ve(){e.enableZoom&&ce(),e.enablePan&&Y()}function ke(){e.enableZoom&&ce(),e.enableRotate&&Z()}function $(n){if(x.length==1)L.set(n.pageX,n.pageY);else{const m=$e(n),E=.5*(n.pageX+m.x),C=.5*(n.pageY+m.y);L.set(E,C)}y.subVectors(L,A).multiplyScalar(e.rotateSpeed);const c=e.domElement;c&&(Se(2*Math.PI*y.x/c.clientHeight),R(2*Math.PI*y.y/c.clientHeight)),A.copy(L)}function Me(n){if(x.length==1)N.set(n.pageX,n.pageY);else{const c=$e(n),m=.5*(n.pageX+c.x),E=.5*(n.pageY+c.y);N.set(m,E)}v.subVectors(N,T).multiplyScalar(e.panSpeed),ee(v.x,v.y),T.copy(N)}function be(n){const c=$e(n),m=n.pageX-c.x,E=n.pageY-c.y,C=Math.sqrt(m*m+E*E);M.set(0,C),b.set(0,Math.pow(M.y/S.y,e.zoomSpeed)),G(b.y),S.copy(M)}function Re(n){e.enableZoom&&be(n),e.enablePan&&Me(n)}function Ve(n){e.enableZoom&&be(n),e.enableRotate&&$(n)}function ze(n){var c,m;e.enabled!==!1&&(x.length===0&&((c=e.domElement)==null||c.ownerDocument.addEventListener("pointermove",_e),(m=e.domElement)==null||m.ownerDocument.addEventListener("pointerup",fe)),Ct(n),n.pointerType==="touch"?Dt(n):Ye(n))}function _e(n){e.enabled!==!1&&(n.pointerType==="touch"?jt(n):Ge(n))}function fe(n){var c,m,E;Rt(n),x.length===0&&((c=e.domElement)==null||c.releasePointerCapture(n.pointerId),(m=e.domElement)==null||m.ownerDocument.removeEventListener("pointermove",_e),(E=e.domElement)==null||E.ownerDocument.removeEventListener("pointerup",fe)),e.dispatchEvent(h),u=a.NONE}function Ye(n){let c;switch(n.button){case 0:c=e.mouseButtons.LEFT;break;case 1:c=e.mouseButtons.MIDDLE;break;case 2:c=e.mouseButtons.RIGHT;break;default:c=-1}switch(c){case ye.DOLLY:if(e.enableZoom===!1)return;ge(n),u=a.DOLLY;break;case ye.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(e.enablePan===!1)return;Pe(n),u=a.PAN}else{if(e.enableRotate===!1)return;de(n),u=a.ROTATE}break;case ye.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(e.enableRotate===!1)return;de(n),u=a.ROTATE}else{if(e.enablePan===!1)return;Pe(n),u=a.PAN}break;default:u=a.NONE}u!==a.NONE&&e.dispatchEvent(s)}function Ge(n){if(e.enabled!==!1)switch(u){case a.ROTATE:if(e.enableRotate===!1)return;Fe(n);break;case a.DOLLY:if(e.enableZoom===!1)return;ae(n);break;case a.PAN:if(e.enablePan===!1)return;Ce(n);break}}function X(n){e.enabled===!1||e.enableZoom===!1||u!==a.NONE&&u!==a.ROTATE||(n.preventDefault(),e.dispatchEvent(s),H(n),e.dispatchEvent(h))}function Ze(n){e.enabled===!1||e.enablePan===!1||P(n)}function Dt(n){switch(rt(n),x.length){case 1:switch(e.touches.ONE){case xe.ROTATE:if(e.enableRotate===!1)return;Z(),u=a.TOUCH_ROTATE;break;case xe.PAN:if(e.enablePan===!1)return;Y(),u=a.TOUCH_PAN;break;default:u=a.NONE}break;case 2:switch(e.touches.TWO){case xe.DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;ve(),u=a.TOUCH_DOLLY_PAN;break;case xe.DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;ke(),u=a.TOUCH_DOLLY_ROTATE;break;default:u=a.NONE}break;default:u=a.NONE}u!==a.NONE&&e.dispatchEvent(s)}function jt(n){switch(rt(n),u){case a.TOUCH_ROTATE:if(e.enableRotate===!1)return;$(n),e.update();break;case a.TOUCH_PAN:if(e.enablePan===!1)return;Me(n),e.update();break;case a.TOUCH_DOLLY_PAN:if(e.enableZoom===!1&&e.enablePan===!1)return;Re(n),e.update();break;case a.TOUCH_DOLLY_ROTATE:if(e.enableZoom===!1&&e.enableRotate===!1)return;Ve(n),e.update();break;default:u=a.NONE}}function st(n){e.enabled!==!1&&n.preventDefault()}function Ct(n){x.push(n)}function Rt(n){delete j[n.pointerId];for(let c=0;c<x.length;c++)if(x[c].pointerId==n.pointerId){x.splice(c,1);return}}function rt(n){let c=j[n.pointerId];c===void 0&&(c=new k,j[n.pointerId]=c),c.set(n.pageX,n.pageY)}function $e(n){const c=n.pointerId===x[0].pointerId?x[1]:x[0];return j[c.pointerId]}this.dollyIn=(n=J())=>{ue(n),e.update()},this.dollyOut=(n=J())=>{G(n),e.update()},this.getScale=()=>g,this.setScale=n=>{re(n),e.update()},this.getZoomScale=()=>J(),i!==void 0&&this.connect(i),this.update()}};const yt=new et,Ne=new O;class it extends Ht{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],i=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],e=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(e),this.setAttribute("position",new ut(t,3)),this.setAttribute("uv",new ut(i,2))}applyMatrix4(t){const i=this.attributes.instanceStart,e=this.attributes.instanceEnd;return i!==void 0&&(i.applyMatrix4(t),e.applyMatrix4(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let i;t instanceof Float32Array?i=t:Array.isArray(t)&&(i=new Float32Array(t));const e=new Qe(i,6,1);return this.setAttribute("instanceStart",new Ee(e,3,0)),this.setAttribute("instanceEnd",new Ee(e,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t,i=3){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const o=new Qe(e,i*2,1);return this.setAttribute("instanceColorStart",new Ee(o,i,0)),this.setAttribute("instanceColorEnd",new Ee(o,i,i)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new Wt(t.geometry)),this}fromLineSegments(t){const i=t.geometry;return this.setPositions(i.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new et);const t=this.attributes.instanceStart,i=this.attributes.instanceEnd;t!==void 0&&i!==void 0&&(this.boundingBox.setFromBufferAttribute(t),yt.setFromBufferAttribute(i),this.boundingBox.union(yt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pt),this.boundingBox===null&&this.computeBoundingBox();const t=this.attributes.instanceStart,i=this.attributes.instanceEnd;if(t!==void 0&&i!==void 0){const e=this.boundingSphere.center;this.boundingBox.getCenter(e);let o=0;for(let s=0,h=t.count;s<h;s++)Ne.fromBufferAttribute(t,s),o=Math.max(o,e.distanceToSquared(Ne)),Ne.fromBufferAttribute(i,s),o=Math.max(o,e.distanceToSquared(Ne));this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(t){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(t)}}class Lt extends it{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(t){const i=t.length-3,e=new Float32Array(2*i);for(let o=0;o<i;o+=3)e[2*o]=t[o],e[2*o+1]=t[o+1],e[2*o+2]=t[o+2],e[2*o+3]=t[o+3],e[2*o+4]=t[o+4],e[2*o+5]=t[o+5];return super.setPositions(e),this}setColors(t,i=3){const e=t.length-i,o=new Float32Array(2*e);if(i===3)for(let s=0;s<e;s+=i)o[2*s]=t[s],o[2*s+1]=t[s+1],o[2*s+2]=t[s+2],o[2*s+3]=t[s+3],o[2*s+4]=t[s+4],o[2*s+5]=t[s+5];else for(let s=0;s<e;s+=i)o[2*s]=t[s],o[2*s+1]=t[s+1],o[2*s+2]=t[s+2],o[2*s+3]=t[s+3],o[2*s+4]=t[s+4],o[2*s+5]=t[s+5],o[2*s+6]=t[s+6],o[2*s+7]=t[s+7];return super.setColors(o,i),this}fromLine(t){const i=t.geometry;return this.setPositions(i.attributes.position.array),this}}class ot extends Ft{constructor(t){super({type:"LineMaterial",uniforms:dt.clone(dt.merge([ft.common,ft.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new k(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
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
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(i){this.uniforms.diffuse.value=i}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(i){i===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(i){this.uniforms.linewidth.value=i}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(i){!!i!="USE_DASH"in this.defines&&(this.needsUpdate=!0),i===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(i){this.uniforms.dashScale.value=i}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(i){this.uniforms.dashSize.value=i}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(i){this.uniforms.dashOffset.value=i}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(i){this.uniforms.gapSize.value=i}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(i){this.uniforms.opacity.value=i}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(i){this.uniforms.resolution.value.copy(i)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(i){!!i!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),i===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(t)}}const Xe=new we,xt=new O,Et=new O,z=new we,U=new we,K=new we,Ke=new O,qe=new Yt,I=new Vt,wt=new O,Be=new et,He=new Pt,q=new we;let Q,he;function St(r,t,i){return q.set(0,0,-t,1).applyMatrix4(r.projectionMatrix),q.multiplyScalar(1/q.w),q.x=he/i.width,q.y=he/i.height,q.applyMatrix4(r.projectionMatrixInverse),q.multiplyScalar(1/q.w),Math.abs(Math.max(q.x,q.y))}function bn(r,t){const i=r.matrixWorld,e=r.geometry,o=e.attributes.instanceStart,s=e.attributes.instanceEnd,h=Math.min(e.instanceCount,o.count);for(let a=0,u=h;a<u;a++){I.start.fromBufferAttribute(o,a),I.end.fromBufferAttribute(s,a),I.applyMatrix4(i);const w=new O,d=new O;Q.distanceSqToSegment(I.start,I.end,d,w),d.distanceTo(w)<he*.5&&t.push({point:d,pointOnLine:w,distance:Q.origin.distanceTo(d),object:r,face:null,faceIndex:a,uv:null,[At]:null})}}function yn(r,t,i){const e=t.projectionMatrix,s=r.material.resolution,h=r.matrixWorld,a=r.geometry,u=a.attributes.instanceStart,w=a.attributes.instanceEnd,d=Math.min(a.instanceCount,u.count),l=-t.near;Q.at(1,K),K.w=1,K.applyMatrix4(t.matrixWorldInverse),K.applyMatrix4(e),K.multiplyScalar(1/K.w),K.x*=s.x/2,K.y*=s.y/2,K.z=0,Ke.copy(K),qe.multiplyMatrices(t.matrixWorldInverse,h);for(let g=0,D=d;g<D;g++){if(z.fromBufferAttribute(u,g),U.fromBufferAttribute(w,g),z.w=1,U.w=1,z.applyMatrix4(qe),U.applyMatrix4(qe),z.z>l&&U.z>l)continue;if(z.z>l){const v=z.z-U.z,S=(z.z-l)/v;z.lerp(U,S)}else if(U.z>l){const v=U.z-z.z,S=(U.z-l)/v;U.lerp(z,S)}z.applyMatrix4(e),U.applyMatrix4(e),z.multiplyScalar(1/z.w),U.multiplyScalar(1/U.w),z.x*=s.x/2,z.y*=s.y/2,U.x*=s.x/2,U.y*=s.y/2,I.start.copy(z),I.start.z=0,I.end.copy(U),I.end.z=0;const L=I.closestPointToPointParameter(Ke,!0);I.at(L,wt);const y=Gt.lerp(z.z,U.z,L),T=y>=-1&&y<=1,N=Ke.distanceTo(wt)<he*.5;if(T&&N){I.start.fromBufferAttribute(u,g),I.end.fromBufferAttribute(w,g),I.start.applyMatrix4(h),I.end.applyMatrix4(h);const v=new O,S=new O;Q.distanceSqToSegment(I.start,I.end,S,v),i.push({point:S,pointOnLine:v,distance:Q.origin.distanceTo(S),object:r,face:null,faceIndex:g,uv:null,[At]:null})}}}class Tt extends kt{constructor(t=new it,i=new ot({color:Math.random()*16777215})){super(t,i),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const t=this.geometry,i=t.attributes.instanceStart,e=t.attributes.instanceEnd,o=new Float32Array(2*i.count);for(let h=0,a=0,u=i.count;h<u;h++,a+=2)xt.fromBufferAttribute(i,h),Et.fromBufferAttribute(e,h),o[a]=a===0?0:o[a-1],o[a+1]=o[a]+xt.distanceTo(Et);const s=new Qe(o,2,1);return t.setAttribute("instanceDistanceStart",new Ee(s,1,0)),t.setAttribute("instanceDistanceEnd",new Ee(s,1,1)),this}raycast(t,i){const e=this.material.worldUnits,o=t.camera;o===null&&!e&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const s=t.params.Line2!==void 0&&t.params.Line2.threshold||0;Q=t.ray;const h=this.matrixWorld,a=this.geometry,u=this.material;he=u.linewidth+s,a.boundingSphere===null&&a.computeBoundingSphere(),He.copy(a.boundingSphere).applyMatrix4(h);let w;if(e)w=he*.5;else{const l=Math.max(o.near,He.distanceToPoint(Q.origin));w=St(o,l,u.resolution)}if(He.radius+=w,Q.intersectsSphere(He)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),Be.copy(a.boundingBox).applyMatrix4(h);let d;if(e)d=he*.5;else{const l=Math.max(o.near,Be.distanceToPoint(Q.origin));d=St(o,l,u.resolution)}Be.expandByScalar(d),Q.intersectsBox(Be)!==!1&&(e?bn(this,i):yn(this,o,i))}onBeforeRender(t){const i=this.material.uniforms;i&&i.resolution&&(t.getViewport(Xe),this.material.uniforms.resolution.value.set(Xe.z,Xe.w))}}class xn extends Tt{constructor(t=new Lt,i=new ot({color:Math.random()*16777215})){super(t,i),this.isLine2=!0,this.type="Line2"}}const Tn=f.forwardRef(function({points:t,color:i=16777215,vertexColors:e,linewidth:o,lineWidth:s,segments:h,dashed:a,...u},w){var d,l;const g=W(T=>T.size),D=f.useMemo(()=>h?new Tt:new xn,[h]),[A]=f.useState(()=>new ot),L=(e==null||(d=e[0])==null?void 0:d.length)===4?4:3,y=f.useMemo(()=>{const T=h?new it:new Lt,N=t.map(v=>{const S=Array.isArray(v);return v instanceof O||v instanceof we?[v.x,v.y,v.z]:v instanceof k?[v.x,v.y,0]:S&&v.length===3?[v[0],v[1],v[2]]:S&&v.length===2?[v[0],v[1],0]:v});if(T.setPositions(N.flat()),e){i=16777215;const v=e.map(S=>S instanceof Zt?S.toArray():S);T.setColors(v.flat(),L)}return T},[t,h,e,L]);return f.useLayoutEffect(()=>{D.computeLineDistances()},[t,D]),f.useLayoutEffect(()=>{a?A.defines.USE_DASH="":delete A.defines.USE_DASH,A.needsUpdate=!0},[a,A]),f.useEffect(()=>()=>{y.dispose(),A.dispose()},[y]),f.createElement("primitive",pe({object:D,ref:w},u),f.createElement("primitive",{object:y,attach:"geometry"}),f.createElement("primitive",pe({object:A,attach:"material",color:i,vertexColors:!!e,resolution:[g.width,g.height],linewidth:(l=o??s)!==null&&l!==void 0?l:1,dashed:a,transparent:L===4},u)))});function En(r,t,i){const e=W(g=>g.size),o=W(g=>g.viewport),s=typeof r=="number"?r:e.width*o.dpr,h=e.height*o.dpr,a=(typeof r=="number"?i:r)||{},{samples:u=0,depth:w,...d}=a,l=f.useMemo(()=>{const g=new $t(s,h,{minFilter:ht,magFilter:ht,type:Xt,...d});return w&&(g.depthTexture=new Kt(s,h,qt)),g.samples=u,g},[]);return f.useLayoutEffect(()=>{l.setSize(s,h),u&&(l.samples=u)},[u,l,s,h]),f.useEffect(()=>()=>l.dispose(),[]),l}const wn=r=>typeof r=="function",Dn=f.forwardRef(({envMap:r,resolution:t=256,frames:i=1/0,makeDefault:e,children:o,...s},h)=>{const a=W(({set:y})=>y),u=W(({camera:y})=>y),w=W(({size:y})=>y),d=f.useRef(null);f.useImperativeHandle(h,()=>d.current,[]);const l=f.useRef(null),g=En(t);f.useLayoutEffect(()=>{s.manual||(d.current.aspect=w.width/w.height)},[w,s]),f.useLayoutEffect(()=>{d.current.updateProjectionMatrix()});let D=0,A=null;const L=wn(o);return tt(y=>{L&&(i===1/0||D<i)&&(l.current.visible=!1,y.gl.setRenderTarget(g),A=y.scene.background,r&&(y.scene.background=r),y.gl.render(y.scene,d.current),y.scene.background=A,y.gl.setRenderTarget(null),l.current.visible=!0,D++)}),f.useLayoutEffect(()=>{if(e){const y=u;return a(()=>({camera:d.current})),()=>a(()=>({camera:y}))}},[d,e,a]),f.createElement(f.Fragment,null,f.createElement("perspectiveCamera",pe({ref:d},s),!L&&o),f.createElement("group",{ref:l},L&&o(g.texture)))}),jn=f.forwardRef(({makeDefault:r,camera:t,regress:i,domElement:e,enableDamping:o=!0,keyEvents:s=!1,onChange:h,onStart:a,onEnd:u,...w},d)=>{const l=W(b=>b.invalidate),g=W(b=>b.camera),D=W(b=>b.gl),A=W(b=>b.events),L=W(b=>b.setEvents),y=W(b=>b.set),T=W(b=>b.get),N=W(b=>b.performance),v=t||g,S=e||A.connected||D.domElement,M=f.useMemo(()=>new vn(v),[v]);return tt(()=>{M.enabled&&M.update()},-1),f.useEffect(()=>(s&&M.connect(s===!0?S:s),M.connect(S),()=>void M.dispose()),[s,S,i,M,l]),f.useEffect(()=>{const b=_=>{l(),i&&N.regress(),h&&h(_)},se=_=>{a&&a(_)},F=_=>{u&&u(_)};return M.addEventListener("change",b),M.addEventListener("start",se),M.addEventListener("end",F),()=>{M.removeEventListener("start",se),M.removeEventListener("end",F),M.removeEventListener("change",b)}},[h,a,u,M,l,L]),f.useEffect(()=>{if(r){const b=T().controls;return y({controls:M}),()=>y({controls:b})}},[r,M]),f.createElement("primitive",pe({ref:d,object:M,enableDamping:o},w))});export{An as H,Tn as L,jn as O,Dn as P,On as _,Mt as c};
//# sourceMappingURL=vendor-three-drei-BHyfaNu_.js.map

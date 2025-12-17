const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HomeView-CdWOCCVv.js","assets/_plugin-vue_export-helper-DKZfpah6.js","assets/homeCardRender-CHQhGPHa.js","assets/vue-router-CjU1PN9w.js","assets/PullToRefresh-Y0fR0lU5.js","assets/MaterialSymbol-BcLKmkdh.js","assets/PullToRefresh-BfmaUdZD.css","assets/MobileTabLayout-BhSA-Y1y.js","assets/MobileTabLayout-Bs04Tvj-.css","assets/mockData-CNJqbgoH.js","assets/HomeView-CWlOvpFF.css","assets/FollowingView-B0lRyBae.js","assets/FollowingView-DC-KEoGA.css","assets/CollectionsView-C2PPJi7e.js","assets/CollectionsView-CbhkfhHH.css","assets/DailyView-pzqlaraE.js","assets/DailyView-7JiscOoy.css","assets/HistoryView-DeIBgy8i.js","assets/HistoryView-CL9thsIa.css","assets/SettingsView-MpyruTgB.js","assets/SettingsView-CxMIjo8S.css","assets/SearchPage-D57ozI7g.js"])))=>i.map(i=>d[i]);
import{_ as e,a as t,c as n,d as r,f as i,h as a,i as o,l as s,m as c,n as l,o as u,p as d,r as f,s as p,t as m,u as h}from"./homeCardRender-CHQhGPHa.js";import{A as g,C as _,D as v,E as y,J as b,N as x,O as S,T as C,X as w,Y as T,a as E,b as D,c as O,d as k,k as A,l as j,m as M,n as N,o as P,p as F,r as ee,s as I,t as L,v as te,x as R,y as z}from"./_plugin-vue_export-helper-DKZfpah6.js";import{a as B,i as V,n as ne,r as re,t as ie}from"./vue-router-CjU1PN9w.js";import{t as H}from"./MaterialSymbol-BcLKmkdh.js";import{n as ae,t as oe}from"./PullToRefresh-Y0fR0lU5.js";import{t as se}from"./MobileTabLayout-BhSA-Y1y.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();const ce={CSSStyleSheet:!0,CSSContainer:CSS.supports(`container-type`,`size`)};try{new CSSStyleSheet}catch{ce.CSSStyleSheet=!1}var le=(e,t)=>{for(let n of t){if(!ce.CSSStyleSheet){let t=document.createElement(`style`);t.textContent=n,e.insertBefore(t,e.firstChild);continue}let t=new CSSStyleSheet;t.replaceSync(n),e.adoptedStyleSheets=[...e.adoptedStyleSheets,t]}};const U=e=>{let t={},n={};for(let r in e){let i=e[r],a={key:r,sync:!0,types:[]};r.startsWith(`$`)&&(a.key=r.slice(1),a.sync=!1),Array.isArray(i)&&(a.types=i,i=a.types[0]),t[a.key]=i,n[a.key]={sync:a.sync,def:i,to:e=>{switch(typeof i){case`string`:let t=String(e);return a.types.length>0?a.types.includes(t)?t:a.types[0]:t;case`number`:let n=Number(e);return isNaN(n)?i:n;case`boolean`:return typeof e==`boolean`?e:e===`true`}}}}return Object.defineProperty(t,`$meta`,{value:n}),t},ue=e=>e;var de=`
:host{
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
*{
  outline: none;
}
`;const W=e=>{let t={observedAttributes:[],upperPropKeys:{},metaProps:e.props?.$meta??{},events:[]};for(let e in t.metaProps??{}){let n=e.toLowerCase();t.observedAttributes.push(n),t.upperPropKeys[n]=e}for(let n in e.events){let e=`on${n}`;t.observedAttributes.push(e),!(e in HTMLElement.prototype)&&t.events.push(e)}let n=new Map;class r extends HTMLElement{static observedAttributes=t.observedAttributes;static define(e){customElements.define(e,this)}constructor(){super();let r=this.attachShadow({mode:`open`});r.innerHTML=e.template??``,le(r,[de,...e.style?Array.isArray(e.style)?e.style:[e.style]:[]]);let i={...e.props},a,o={};for(let e in i){let n=this[e];n!==void 0&&(o[e]=n),Object.defineProperty(this,e,{configurable:!0,get:()=>{let t=a?.[e];return!t||typeof t==`function`||!t.get?i[e]:t.get?.(i[e])},set:n=>{let r=t.metaProps[e],o=n===void 0?r.def:r.to(n);if(r.sync){let t=e.toLowerCase(),n=this.getAttribute(t),i=String(o);if(o===r.def&&n!==null)return this.removeAttribute(t);if(o!==r.def&&n!==i)return this.setAttribute(t,i)}if(o===this[e])return;let s=i[e];i[e]=o;let c=a?.[e];if(c)try{typeof c==`function`?c(o,s):c.set?.(o,s)}catch(t){throw i[e]=s,t}}})}let s={};for(let e of t.events){let t=e;typeof this[t]==`function`&&(s[e]=this[t]),Object.defineProperty(this,e,{configurable:!0,get:()=>s[e]??null,set:t=>s[e]=typeof t==`function`?t:void 0}),this.addEventListener(e.slice(2),t=>s[e]&&s[e].bind(this)(t))}for(let t in a=e.setup?.call(this,r),a?.expose??{})Object.defineProperty(this,t,{get:()=>a?.expose?.[t]});for(let e in o)this[e]=o[e];this.connectedCallback=this.disconnectedCallback=this.adoptedCallback=this.attributeChangedCallback=void 0,n.set(this,a)}connectedCallback(){n.get(this)?.onMounted?.()}disconnectedCallback(){n.get(this)?.onUnmounted?.()}adoptedCallback(){n.get(this)?.onAdopted?.()}attributeChangedCallback(e,n,r){if(t.events.includes(e))return this[e]=r?Function(`event`,r):null;this[t.upperPropKeys[e]]=r??void 0}}for(let t in e.methods)r[t]=e.methods[t];return r};var fe=`s-alert`,pe=U({type:[`info`,`success`,`warning`,`error`]}),me=`
:host{
  display: inline-flex;
  padding: 8px 16px;
  align-items: center;
  line-height: 22px;
  font-size: .875rem;
  font-weight: 500;
  min-height: 48px;
  box-sizing: border-box;
  border-radius: 4px;
  color: var(--s-color-on-secondary-container, #354A53);
  background: var(--s-color-secondary-container, #CFE6F1);
}
:host([type=success]){
  color: var(--s-color-on-success-container, #002111);
  background: var(--s-color-success-container, #92f7bc);
}
:host([type=warning]){
  color: var(--s-color-on-warning-container, #221b00);
  background: var(--s-color-warning-container, #ffe169);
}
:host([type=error]){
  color: var(--s-color-on-error-container, #93000A);
  background: var(--s-color-error-container, #FFDAD6);
}
svg{
  width: 24px;
  height: 24px;
  fill: currentColor;
  margin-right: 8px;
  margin-left: -2px;
  box-sizing: border-box;
  flex-shrink: 0;
  display: none;
}
.text{
  flex-grow: 1;
  min-width: 0;
}
:host(:not([type])) .info,
:host([type=success]) .success,
:host([type=warning]) .warning,
:host([type=error]) .error{
  display: block;
}
::slotted(*){
  flex-shrink: 0;
}
::slotted(:is(svg[slot=start], s-icon[slot=start])){
  margin-right: 8px;
  margin-left: -2px;
}
::slotted(:is(svg[slot=end], s-icon[slot=end])){
  margin-right: -2px;
  margin-left: 8px;
}
::slotted(:is(svg, s-icon)){
  fill: currentColor;
  color: currentColor;
  width: 24px;
  height: 24px;
}
::slotted(:is(s-button[slot=end], s-icon-button[slot=end])){
  margin-left: 8px;
  margin-right: -8px;
  color: currentColor;
}
::slotted(s-button[slot=end]){
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;
  font-size: .8125rem;
}
::slotted(s-icon-button[slot=end]){
  width: 32px;
  padding: 5px;
}
`,he=`
<slot name="start">
  <svg viewBox="0 0 24 24" class="info">
    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z"></path>
  </svg>
  <svg viewBox="0 0 24 24" class="success">
    <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"></path>
  </svg>
  <svg viewBox="0 0 24 24" class="warning">
    <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path>
  </svg>
  <svg viewBox="0 0 24 24" class="error">
    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
  </svg>
</slot>
<div class="text" part="text"><slot></slot></div>
<slot name="end"></slot>
`;(class extends W({style:me,template:he,props:pe}){}).define(fe);var ge=`s-appbar`,_e=`
:host{
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 8px;
  box-sizing: border-box;
  container-name: s-appbar;
  container-type: inline-size;
  background: var(--s-color-surface-container, #ECEEF0);
}
::slotted([slot=navigation]){
  margin-left: 4px;
  flex-shrink: 0;
}
::slotted([slot=logo]){
  margin-left: 12px;
  height: 32px;
  color: var(--s-color-primary, #006782);
  fill: currentColor;
  flex-shrink: 0;
}
::slotted([slot=headline]){
  font-size: 1.5rem;
  font-weight: bold;
  overflow: hidden;
  text-transform: capitalize;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 12px;
  color: var(--s-color-primary, #006782);
}
.view{
  flex-grow: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  height: 64px;
  max-height: 100%;
  justify-content: flex-end;
}
.view.s-laptop{
  height: 56px;
}
.view.s-tablet ::slotted(s-search[slot=search]){
  width: auto;
  flex-grow: 1;
}
::slotted([slot=action]){
  margin: 0 4px;
  flex-shrink: 0;
}
::slotted(s-search[slot=search]){
  flex-shrink: 0;
  margin: 0 4px 0 8px;
}
@container s-appbar (max-width: 1024px){
  .view{
    height: 56px;
  }
}
@container s-appbar (max-width: 768px){
  ::slotted(s-search[slot=search]){
    width: auto;
    flex-grow: 1;
  }
}
`,ve=`
<slot name="start"></slot>
<slot name="navigation"></slot>
<slot name="logo"></slot>
<slot name="headline"></slot>
<div class="view" part="view">
  <slot></slot>
  <slot name="search"></slot>
</div>
<slot name="action"></slot>
<slot name="end"></slot>
`;(class extends W({style:_e,template:ve,setup(e){let t=e.querySelector(`.view`);ce.CSSContainer||new ResizeObserver(()=>{t.classList.toggle(`s-laptop`,this.offsetWidth<=1024),t.classList.toggle(`s-tablet`,this.offsetWidth<=768)}).observe(this)}}){}).define(ge);var ye=`s-avatar`,be=U({$src:``}),xe=`
:host{
  display: inline-flex;
  vertical-align: middle;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  position: relative;
  font-size: 1rem;
  font-weight: 600;
  width: 40px;
  border-radius: 50%;
  color: var(--s-color-on-tertiary, #ffffff);
  background: var(--s-color-tertiary, #5C5B7E);
}
::slotted(:is(svg, s-icon)){
  color: currentColor;
  fill: currentColor;
  width: 24px;
}
::slotted([slot=badge]){
  position: absolute;
  right: 0;
  bottom: 0;
  box-shadow: 0 0 0 2px var(--s-color-surface, #F8F9FB);
  color: var(--s-color-on-success, #ffffff);
  background: var(--s-color-success, #006d43);
}
img{
  width: 100%;
  height: 100%;
  border-radius: inherit;
  position: absolute;
  inset: 0;
}
`,Se=`
<slot></slot>
<slot name="badge"></slot>
`;(class extends W({style:xe,template:Se,props:be,setup(e){let t=document.createElement(`img`);return{src:n=>{t.src=n,t.onload=()=>{this.dispatchEvent(new Event(`load`)),e.insertBefore(t,e.children[0])},t.onerror=()=>{this.dispatchEvent(new ErrorEvent(`error`)),t.isConnected&&e.removeChild(t)}}}}}){}).define(ye);var Ce=`s-badge`,we=`
:host{
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  font-size: .625rem;
  vertical-align: middle;
  box-sizing: border-box;
  background: var(--s-color-error, #BA1A1A);
  color: var(--s-color-on-error, #ffffff);
}
:host(:not(:empty)) .text{
  height: 16px;
  padding: 0 5px;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  background: inherit;
  color: inherit;
  box-shadow: inherit;
  border-radius: 8px;
}
`,Te=`
<slot class="text" part="text"></slot>
`;(class extends W({style:we,template:Te}){}).define(Ce);const G=e=>{let t=e.trim().match(/^([\d\.]+)(s|ms)$/);if(!t)throw Error();let n=Number(t[1]);return t[2]===`s`?n*1e3:n};var Ee=`s-bottom-sheet`,De=U({showed:!1,disabledGesture:!1}),Oe=ue({show:CustomEvent,showed:Event,close:CustomEvent,closed:Event}),ke=`
:host{
  display: inline-block;
  vertical-align: middle;
}
dialog{
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  padding: 0;
  max-width: none;
  max-height: none;
  outline: none;
  justify-content: center;
  align-items: flex-end;
  color: inherit;
  overflow: hidden;
}
dialog::backdrop{
  background: none;
}
dialog[open]{
  display: flex;
}
.scrim{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  backdrop-filter: saturate(180%) blur(2px);
}
.scrim::before{
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  opacity: .75;
  background: var(--s-color-scrim, #000000);
}
dialog.show .scrim{
  opacity: 1;
}
.container{
  outline: none;
  position: relative;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-height: calc(100% - 56px);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
  max-width: 425px;
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
  background: var(--s-color-surface-container-low, #F2F4F5);
}
.indicator{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}
.indicator::before{
  content: '';
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--s-color-outline, #70787D);
  opacity: .4;
}
::slotted([slot=text]){
  padding: 24px;
  line-height: 22px;
}
::slotted(:not([slot])){
  overscroll-behavior: none;
}
@media (max-width: 768px){
  .container{
    max-width: 768px;
  }
}
`,Ae=`
<slot name="trigger"></slot>
<dialog part="popup">
  <div class="scrim" part="scrim"></div>
  <div class="container" part="container">
    <div class="indicator" part="indicator"></div>
    <slot name="text"></slot>
    <slot id="view"></slot>
  </div>
</dialog>
`,je=e=>{let t=document.body,n=document.body.firstElementChild;n&&n.tagName===`S-PAGE`&&(t=n);let r=new Me,i=document.createElement(`div`);return i.slot=`text`,typeof e==`function`||e instanceof HTMLElement?e instanceof HTMLElement?r.appendChild(e):e(r):typeof e==`string`?(i.textContent=e,r.appendChild(i)):(e.root&&(t=e.root),e.disabledGesture&&(r.disabledGesture=e.disabledGesture),typeof e.view==`string`&&(i.textContent=e.view,r.appendChild(i)),e.view instanceof HTMLElement&&r.appendChild(e.view),typeof e.view==`function`&&e.view(r)),r.addEventListener(`closed`,()=>t.removeChild(r)),r.showed=!0,t.appendChild(r),r},Me=class extends W({style:ke,template:Ae,props:De,events:Oe,methods:{builder:je},setup(e){let t=e.querySelector(`dialog`),n=e.querySelector(`.container`),r=e.querySelector(`.scrim`),i=e.querySelector(`.indicator`),a=getComputedStyle(this),o=null,s=()=>({easing:a.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(a.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)});e.querySelector(`#view`).onslotchange=e=>{o=e.target.assignedElements()[0]??null},e.querySelector(`slot[name=trigger]`).onclick=()=>{this.showed||!this.dispatchEvent(new CustomEvent(`show`,{cancelable:!0,detail:{source:`TRIGGER`}}))||(this.showed=!0)};let c=e=>{!this.showed||!this.dispatchEvent(new CustomEvent(`close`,{cancelable:!0,detail:{source:e}}))||(this.showed=!1)};r.onclick=()=>c(`SCRIM`);let l=null;n.addEventListener(`touchmove`,e=>{let t=e.target;if(this.disabledGesture)return;let r=e.touches[0];if(!l)return l={y:r.pageY,x:r.pageX,disabled:!1,top:0,h:n.offsetHeight,now:Date.now()};if(l.disabled)return;let a=r.pageY-l.y,s=r.pageX-l.x;if(l.top=Math.min(l.h,Math.max(0,a)),t!==i&&o&&o.scrollTop>0||Math.abs(a)<Math.abs(s))return l.disabled=!0;n.style.transform=`translateY(${l.top}px)`},{passive:!1}),n.ontouchend=()=>{if(!l||l.disabled)return l=null;let e=Date.now()-l.now>300?l.h/3:20;if(l.top>e){if(!this.dispatchEvent(new CustomEvent(`close`,{cancelable:!0,detail:{source:`GESTURE`}})))return;this.showed=!1}else n.animate({transform:[n.style.transform,`translateY(0)`]},s()),n.style.removeProperty(`transform`);l=null};let u=()=>{if(!this.isConnected||t.open)return;t.showModal(),t.classList.add(`show`);let e=s();r.animate({opacity:[0,1]},e),n.animate({transform:[`translateY(100%)`,`translateY(0)`],opacity:[0,1]},e).finished.then(()=>this.dispatchEvent(new Event(`showed`)))},d=()=>{if(!this.isConnected||!t.open)return;t.classList.remove(`show`);let e=s(),i=n.style.transform;r.animate({opacity:[1,0]},e),n.animate({transform:[i===``?`translateY(0)`:i,`translateY(100%)`],opacity:[1,0]},e).finished.then(()=>{t.close(),i&&n.style.removeProperty(`transform`),this.dispatchEvent(new Event(`closed`))})};return{onMounted:()=>this.showed&&!t.open&&u(),showed:e=>e?u():d()}}}){};Me.define(Ee);const K={mobileS:matchMedia(`(max-width: 320px)`),mobileM:matchMedia(`(max-width: 375px)`),mobileL:matchMedia(`(max-width: 425px)`),tablet:matchMedia(`(max-width: 768px)`),laptop:matchMedia(`(max-width: 1024px)`),laptopL:matchMedia(`(max-width: 1440px)`),pointerCoarse:matchMedia(`(pointer: coarse)`),pointerFine:matchMedia(`(pointer: fine)`)};var Ne=`s-ripple`,Pe=U({centered:!1,attached:!1}),Fe=`
:host{
  display: inline-block;
  vertical-align: middle;
  position: relative;
  cursor: pointer;
}
:host([attached=true]),
.container,
.container::before,
.ripple{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: inherit;
}
.container{
  overflow: hidden;
}
.container::before{
  content: '';
  opacity: 0;
  background: var(--ripple-color, currentColor);
  transition: opacity var(--s-motion-duration-short4, 100ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
}
.container.hover::before{
  opacity: var(--ripple-hover-opacity, .12);
}
.ripple{
  opacity: 0;
  border-radius: 50%;
  background: currentColor;
  filter: blur(12px) opacity(var(--ripple-opacity, .18));
}
`,Ie=`
<slot></slot>
<div class="container" part="container">
  <div class="ripple"></div>
</div>
`,q=class extends W({style:Fe,template:Ie,props:Pe,setup(e){let t=e.querySelector(`.container`),n=e.querySelector(`.ripple`),r=getComputedStyle(this),i=()=>{let e=r.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,t=r.getPropertyValue(`--s-motion-duration-long4`)||`600ms`,n=r.getPropertyValue(`--s-motion-duration-short4`)||`200ms`;return{easing:e,duration:G(t),shortDuration:G(n)}},a=()=>K.pointerFine.matches&&t.classList.add(`hover`),o=()=>K.pointerFine.matches&&t.classList.remove(`hover`),s={parentNode:null,pressed:!1},c=e=>{let{offsetWidth:r,offsetHeight:a}=this,o=Math.sqrt(r**2+a**2),c={x:`50%`,y:`50%`};if(!this.centered){let{left:t,top:n}=this.getBoundingClientRect(),i=e.clientX-t,s=e.clientY-n,l=a/2,u=r/2,d=(Math.abs(l-s)+l)*2,f=(Math.abs(u-i)+u)*2;o=Math.sqrt(d**2+f**2),c.x=`${i}px`,c.y=`${s}px`}let l=n,u=()=>{};s.pressed?(l=n.cloneNode(),t.appendChild(l),u=()=>l.remove()):(s.pressed=!0,u=()=>s.pressed=!1);let d=s.parentNode??this,f=i();d.setAttribute(`pressed`,``);let p=l.animate({opacity:[1,1],width:[`${o}px`,`${o}px`],height:[`${o}px`,`${o}px`],transform:[`translate(-50%, -50%) scale(0)`,`translate(-50%, -50%) scale(1)`],left:[c.x,c.x],top:[c.y,c.y]},{...f,fill:`forwards`});return()=>{d.removeAttribute(`pressed`);let e=Number(p.currentTime),t=e>f.duration-f.shortDuration?f.shortDuration:f.duration-e;l.animate({opacity:[1,0]},{duration:t,easing:f.easing,fill:`forwards`}).finished.then(u)}},l=async e=>{if(e.button!==0)return;let t={};if(e.pointerType===`mouse`){document.addEventListener(`pointerup`,c(e),{once:!0});return}let n;t.timer=setTimeout(()=>{n=c(e),document.removeEventListener(`touchmove`,r),t.upper&&n()},50),document.addEventListener(`touchend`,()=>{if(!n)return t.upper=!0;n()},{once:!0});let r=()=>clearTimeout(t.timer);document.addEventListener(`touchmove`,r,{once:!0})},u=e=>{e.addEventListener(`mouseenter`,a),e.addEventListener(`mouseleave`,o),e.addEventListener(`wheel`,o,{passive:!0}),e.addEventListener(`pointerdown`,l)},d=()=>{s.parentNode&&=(s.parentNode.removeEventListener(`mouseenter`,a),s.parentNode.removeEventListener(`mouseleave`,o),s.parentNode.removeEventListener(`wheel`,o),s.parentNode.removeEventListener(`pointerdown`,l),null)};return u(this),{onMounted:()=>{this.attached&&this.parentNode&&(s.parentNode=this.parentNode instanceof ShadowRoot?this.parentNode.host:this.parentNode,u(s.parentNode))},onUnmounted:()=>this.attached&&d(),attached:e=>{if(this.isConnected){if(!e)return d();u(this.parentNode instanceof ShadowRoot?this.parentNode.host:this.parentNode)}}}}}){};q.define(Ne);var Le=`s-button`,Re=U({disabled:!1,type:[`filled`,`elevated`,`filled-tonal`,`outlined`,`text`]}),ze=`
:host{
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  display: inline-flex;
  vertical-align: middle;
  border-radius: 20px;
  padding: 0 24px;
  height: 40px;
  text-transform: capitalize;
  position: relative;
  cursor: pointer;
  font-size: .875rem;
  font-weight: 500;
  max-width: -moz-available;
  max-width: -webkit-fill-available;
  background: var(--s-color-primary, #006782);
  color: var(--s-color-on-primary, #ffffff);
  transition: box-shadow var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  overflow: hidden;
}
:host([disabled=true]){
  pointer-events: none !important;
  background: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
  color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 38%, transparent) !important;
}
:host([type=elevated]){
  background: var(--s-color-surface-container-low, #F2F4F5);
  color: var(--s-color-primary, #006782);
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
}
:host([type=elevated][disabled=true]){
  box-shadow: none !important;
}
:host([type=filled-tonal]){
  background: var(--s-color-secondary-container, #CFE6F1);
  color: var(--s-color-on-secondary-container, #354A53);
}
:host([type=outlined]){
  border: solid 1px var(--s-color-outline, #70787D);
  background: none;
  color: var(--s-color-primary, #006782);
}
:host([type=outlined][disabled=true]){
  background: none !important;
  border-color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
}
:host([type=text]){
  background: none;
  color: var(--s-color-primary, #006782);
  padding: 0 16px;
}
:host([type=text][disabled=true]){
  background: none !important;
}
::slotted(*){
  flex-shrink: 0;
}
::slotted(:is(svg, s-icon, s-circular-progress)){
  fill: currentColor;
  color: currentColor;
  width: 20px;
  height: 20px;
}
::slotted(:is(svg[slot=start], s-icon[slot=start])){
  margin-right: 4px;
  margin-left: -8px;
}
::slotted(:is(svg[slot=end], s-icon[slot=end])){
  margin-right: -8px;
  margin-left: 4px;
}
::slotted(s-circular-progress[slot=start]){
  margin-left: -8px;
  margin-right: 8px;
}
::slotted(s-circular-progress[slot=end]){
  margin-left: 8px;
  margin-right: -8px;
}
:host([type=text]) ::slotted(:is(s-icon[slot=start], svg[slot=start])){
  margin-left: -4px;
  margin-right: 4px;
}
:host([type=text]) ::slotted(:is(s-icon[slot=end], svg[slot=end])){
  margin-left: 4px;
  margin-right: -4px;
}
:host(:not([type])[pressed]){
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
}
:host([type=elevated][pressed]){
  box-shadow: var(--s-elevation-level2, 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12));
}
.text{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
@media (pointer: fine){
  :host(:not([type]):hover){
    box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
  }
  :host([type=elevated]:hover){
    box-shadow: var(--s-elevation-level2, 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12));
  }
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]){
    background: var(--s-color-surface-container-high, #E7E8EA) !important;
    color: var(--s-color-outline, #70787D) !important;
  }
  :host([type=outlined][disabled=true]){
    border-color: var(--s-color-surface-container-highest, #E1E3E4) !important;
  }
}
`,Be=`
<slot name="start"></slot>
<div class="text" part="text">
  <slot></slot>
</div>
<slot name="end"></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
`;(class extends W({style:ze,template:Be,props:Re}){}).define(Le);var Ve=`s-card`,He=U({type:[`elevated`,`filled`,`outlined`],clickable:!1}),Ue=`
:host{
  display: inline-block;
  vertical-align: middle;
  border-radius: 12px;
  position: relative;
  font-size: .875rem;
  box-sizing: border-box;
  max-width: 280px;
  overflow: hidden;
  color: var(--s-color-on-surface, #191C1E);
  background: var(--s-color-surface-container-low, #F2F4F5);
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
}
:host([type=filled]){
  box-shadow: none;
  background: var(--s-color-surface-container-highest, #E1E3E4);
}
:host([type=outlined]){
  box-shadow: none;
  background: var(--s-color-surface, #F8F9FB);
  border: solid 1px var(--s-color-outline-variant, #C0C8CC);
}
:host([clickable=true]){
  cursor: pointer;
  transition: box-shadow var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
}
:host([clickable=true]) .ripple{
  display: block;
}
.action{
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 16px;
}
.ripple{
  display: none;
  border-radius: 0;
}
::slotted([slot=image]){
  display: block;
  max-height: 160px;
  min-height: 96px;
  width: 100%;
  object-fit: cover;
  background: var(--s-color-surface-container, #ECEEF0);
}
::slotted([slot=headline]){
  font-size: 1.375rem;
  line-height: 22px;
  margin: 12px 16px;
}
::slotted([slot=subhead]){
  font-size: 1rem;
  margin: -8px 16px 12px 16px;
}
::slotted([slot=text]){
  line-height: 22px;
  margin: 12px 16px;
  color: var(--s-color-on-surface-variant, #40484C);
}
::slotted(s-button[slot=action]){
  margin-bottom: 16px;
}
::slotted([slot=headline]+[slot=subhead]){
  background: red;
}
@media (pointer: fine){
  :host([clickable=true][type=filled]:hover),
  :host([clickable=true][type=outlined]:hover){
    box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
  }
  :host([clickable=true]:hover){
    box-shadow: var(--s-elevation-level2, 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12));
  }
}
`,We=`
<slot name="start"></slot>
<slot name="image"></slot>
<slot name="headline"></slot>
<slot name="subhead"></slot>
<slot name="text"></slot>
<slot></slot>
<div class="action" part="action">
  <slot name="action"></slot>
</div>
<slot name="end"></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
`;(class extends W({style:Ue,template:We,props:He,setup(e){let t=e.querySelector(`slot[name=action]`);t.onpointerdown=e=>e.stopPropagation()}}){}).define(Ve);var Ge=class{list=[];select;selectValue;flag=!1;constructor(e){let{context:t}=e;t.addEventListener(`${t.tagName.toLocaleLowerCase()}:select`,n=>{if(n.stopPropagation(),!(n.target instanceof e.class))return;let r;this.flag=!0,n.target.selected=!0,this.list.forEach(e=>{e!==n.target&&(e.selected&&(r=e),e.selected=!1)}),this.select=n.target,this.flag=!1,t.dispatchEvent(new Event(`change`)),this.onUpdate?.(r),this.onSelect?.()}),t.addEventListener(`${t.tagName.toLocaleLowerCase()}:update`,t=>{if(t.stopPropagation(),this.flag||this.list.length===0||!(t.target instanceof e.class))return;this.flag=!0;let n;t.target.selected?(this.select=t.target,this.list.forEach(e=>{e!==t.target&&(e.selected&&(n=e),e.selected=!1)})):delete this.select,this.flag=!1,this.onUpdate?.(n)}),e.slot.addEventListener(`slotchange`,()=>{this.flag=!0,delete this.select,this.list=e.slot.assignedElements().filter(t=>{if(t instanceof e.class){if(this.selectValue!==void 0)t.value===this.selectValue?(this.select=t,t.selected=!0):t.selected=!1;else{if(!this.select&&t.selected)return this.select=t,!0;this.select&&(t.selected=!1)}return!0}}),this.flag=!1,this.onSlotChange?.(),this.onUpdate?.()})}get value(){return this.list[this.list.indexOf(this.select)]?.value??``}set value(e){this.selectValue=e,this.list.length!==0&&(this.flag=!0,this.list.forEach(t=>{if(t.value===e){t.selected=!0,this.select=t;return}t.selected=!1}),this.onUpdate?.(),this.flag=!1)}get selectedIndex(){return this.list.indexOf(this.select)}},Ke=`s-carousel`,qe=U({$value:``,$autoplay:!1,$duration:4e3}),Je=`
:host{
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  aspect-ratio: 2;
  -webkit-aspect-ratio: 2;
}
.container{
  display: flex;
  justify-content: flex-start;
  height: 100%;
  min-width: 100%;
  transition: transform var(--s-motion-duration-long4, 600ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
}
.track{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  padding: 12px 0;
}
.track .indicator{
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: white;
  opacity: .3;
  flex-shrink: 0;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
}
.track .indicator.checked{
  opacity: 1;
}
`,Ye=`
<div class="container" part="container">
  <slot></slot>
</div>
<div class="track"></div>
`,Xe=class extends W({style:Je,template:Ye,props:qe,setup(e){let t=e.querySelector(`.container`),n=e.querySelector(`.track`),r=e.querySelector(`slot`),i=new Ge({context:this,class:tt,slot:r}),a=-1;i.onUpdate=()=>{n.childNodes.forEach(e=>e.classList.remove(`checked`)),t.style.transform=`translateX(${-i.selectedIndex*100}%)`,i.selectedIndex!==-1&&(n.childNodes[i.selectedIndex].classList.add(`checked`),o())};let o=()=>{!this.autoplay||i.list.length===0||!this.isConnected||(s(),a=setTimeout(()=>{let e=i.selectedIndex+1;e>=i.list.length&&(e=0),i.list[e].selected=!0,this.dispatchEvent(new Event(`change`))},this.duration))},s=()=>clearInterval(a);return i.onSlotChange=()=>{n.innerHTML=``;let e=document.createDocumentFragment();i.list.forEach(t=>{let n=document.createElement(`div`);n.className=`indicator`,n.addEventListener(`click`,()=>t.dispatchEvent(new Event(`${Ke}:select`,{bubbles:!0}))),e.appendChild(n)}),n.appendChild(e)},t.onpointerdown=e=>{if(i.list.length<=1)return;s();let n=e.pageX,r=e.pageY,a=t.offsetWidth,c=i.list[i.selectedIndex-1],l=i.list[i.selectedIndex+1],u={now:0,left:0,next:void 0},d=e=>{let o=e instanceof TouchEvent?e.touches[0]:e,s=o.pageX-n,d=o.pageY-r;if(e instanceof TouchEvent&&Math.abs(s)<Math.abs(d)&&!u.next)return f();if(u.left=s,u.now===0&&(u.now=Date.now()),c&&(u.left=Math.min(u.left,a)),l&&(u.left=Math.max(u.left,a*-1)),(!c&&u.left>0||!l&&u.left<0)&&(u.left*=.2),u.left<0&&l||u.left>0&&c){let e=Math.abs(u.left)/a*.05;i.select.style.transition=`none`,i.select.style.transform=`scale(${.05-e+.95})`,u.next=u.left<0?l:c,u.next.style.transition=`none`,u.next.style.transform=`scale(${e+.95})`}t.style.transition=`none`,t.style.pointerEvents=`none`,t.style.transform=`translateX(calc(${-i.selectedIndex*100}% + ${u.left}px))`,e.cancelable&&e.preventDefault()},f=()=>{document.removeEventListener(p.up,f),document.removeEventListener(p.move,d),t.style.removeProperty(`pointer-events`),t.style.removeProperty(`transition`),i.select.style.removeProperty(`transition`),i.select.style.removeProperty(`transform`),u.next?.style.removeProperty(`transition`),u.next?.style.removeProperty(`transform`);let e=i.selectedIndex;if(!(e===0&&u.left>0||e===i.list.length-1&&u.left<0)){let e=Date.now()-u.now>300?a/2:20;if(Math.abs(u.left)>e){u.next?.dispatchEvent(new Event(`${Ke}:select`,{bubbles:!0}));return}}t.style.transform=`translateX(${-i.selectedIndex*100}%)`,o()},p={move:K.pointerCoarse.matches?`touchmove`:`pointermove`,up:K.pointerCoarse.matches?`touchend`:`pointerup`};document.addEventListener(p.move,d,{passive:!1}),document.addEventListener(p.up,f)},{expose:{get options(){return i.list},get selectedIndex(){return i.selectedIndex},togglePrevious:()=>{let e=i.list[i.selectedIndex-1];e&&(e.selected=!0)},toggleNext:()=>{let e=i.list[i.selectedIndex+1];e&&(e.selected=!0)}},onMounted:o,onUnmounted:s,value:{get:()=>i.value,set:e=>{i.value=e,o()}},autoplay:o}}}){},Ze=`s-carousel-item`,Qe=U({selected:!1,$value:``}),$e=`
:host{
  user-drag: none;
  -webkit-user-drag: none;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: var(--s-color-surface-container-high, #E7E8EA);
  transform: scale(.95);
  transition: transform var(--s-motion-duration-long4, 600ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  background-repeat: round;
}
:host([selected=true]){
  transform: scale(1);
}
`,et=`<slot></slot>`,tt=class extends W({style:$e,template:et,props:Qe,setup(){return{selected:()=>{this.parentNode instanceof Xe&&this.dispatchEvent(new Event(`${Ke}:update`,{bubbles:!0}))}}}}){};Xe.define(Ke),tt.define(Ze);var nt=`s-checkbox`,rt=U({disabled:!1,checked:!1,indeterminate:!1}),it=`
:host{
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  cursor: pointer;
  position: relative;
  height: 40px;
  color: var(--s-color-on-surface-variant, #40484C);
}
:host([checked=true]){
  color: var(--s-color-primary, #006782);
}
:host([disabled=true]){
  pointer-events: none;
}
.container{
  position: relative;
  height: 100%;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
:host([disabled=true]) .container{
  color: var(--s-color-on-surface, #191C1E) !important;
  opacity: .38 !important;
}
.unchecked,
.checked,
.indeterminate{
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.checked,
.indeterminate{
  position: absolute;
  transform: scale(.5);
  opacity: 0;
  transition-property: transform, opacity;
  transition-timing-function: var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
  transition-duration: var(--s-motion-duration-short4, 200ms);
}
:host([indeterminate=true]) .unchecked{
  opacity: 0;
}
:host([checked=true]:not([indeterminate=true])) .checked,
:host([indeterminate=true]) .indeterminate{
  opacity: 1;
  transform: scale(1);
}
.ripple{
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  height: 100%;
  width: auto;
  border-radius: 50%;
}
svg,
::slotted(:is([slot=checked], [slot=unchecked], [slot=indeterminate])){
  color: currentColor;
  fill: currentColor;
  width: 60%;
  height: 60%;
}
`,at=`
<div class="container" part="container">
  <slot class="unchecked" name="unchecked">
    <svg viewBox="0 -960 960 960">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"></path>
    </svg>
  </slot>
  <slot class="checked" name="checked">
    <svg viewBox="0 -960 960 960">
      <path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"></path>
    </svg>
  </slot>
  <slot class="indeterminate" name="indeterminate">
    <svg viewBox="0 -960 960 960">
      <path d="M280-440h400v-80H280v80Zm-80 320q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"></path>
    </svg>
  </slot>
</div>
<slot></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
`;(class extends W({style:it,template:at,props:rt,setup(){this.addEventListener(`click`,()=>{this.indeterminate&&=!1,this.checked=!this.checked,this.dispatchEvent(new Event(`change`))})}}){}).define(nt);var ot=`s-chip`,st=U({type:[`filled`,`outlined`],$value:``,checked:!1,disabled:!1,clickable:!1}),ct=`
:host{
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  padding: 0 16px;
  height: 32px;
  border-radius: 16px;
  box-sizing: border-box;
  font-size: .8125rem;
  font-weight: 500;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: var(--s-color-surface-container-high, #E7E8EA);
  color: var(--s-color-on-surface, #191C1E);
  transition-property: color, background-color, box-shadow;
  transition-timing-function: var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  transition-duration: var(--s-motion-duration-short4, 200ms);
}
:host([disabled=true]){
  pointer-events: none !important;
  border-color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
  color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 38%, transparent) !important;
  background: color-mix(in srgb, var(--s-color-surface-container-high, #E7E8EA) 38%, transparent) !important;
}
:host([checked=true]){
  border: none;
  background: var(--s-color-secondary-container, #CFE6F1);
  color: var(--s-color-primary, #006782);
}
:host([type=outlined]){
  background: none;
  border: solid 1px var(--s-color-outline-variant, #C0C8CC);
}
:host([type=outlined][checked=true]){
  border-color: var(--s-color-primary, #006782);
}
::slotted(:is(s-icon, svg)){
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: currentColor;
  color: currentColor;
}
::slotted(:is(s-icon[slot=start], svg[slot=start])){
  margin-left: -8px;
  margin-right: 8px;
}
::slotted(:is(s-icon[slot=end], svg[slot=end])){
  margin-left: 8px;
  margin-right: -8px;
}
::slotted(s-avatar){
  width: 24px;
  height: 24px;
  font-size: .75rem;
}
::slotted(s-avatar[slot=start]){
  margin-left: -12px;
  margin-right: 8px;
}
::slotted(s-icon-button[slot=action]){
  margin: 0 -12px 0 8px;
  width: 24px;
  height: 24px;
  padding: 3px;
  color: currentColor;
}
.text{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
:host(:not([clickable=true])) .ripple{
  display: none;
}
@supports not (color: color-mix()){
  :host([disabled=true]){
    background: var(--s-color-surface-container-high, #E7E8EA) !important;
    color: var(--s-color-outline, #70787D) !important;
    border-color: var(--s-color-surface-container-highest, #E1E3E4) !important;
  }
}
`,lt=`
<slot name="start"></slot>
<div class="text" part="text">
  <slot></slot>
</div>
<slot name="end"></slot>
<slot name="action"></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
`;(class extends W({style:ct,template:lt,props:st,setup(e){let t=e.querySelector(`slot[name=action]`);t.onclick=e=>e.stopPropagation(),t.onpointerdown=e=>e.stopPropagation(),this.addEventListener(`click`,()=>{this.clickable&&(this.checked=!this.checked,this.dispatchEvent(new Event(`change`)))})}}){}).define(ot);var ut=`s-circular-progress`,dt=U({indeterminate:!1,animated:!1,$max:100,$value:0}),ft=`
:host{
  display: inline-block;
  vertical-align: middle;
  position: relative;
  width: 48px;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  color: var(--s-color-primary, #006782);
}
:host([animated=true]) .known .block{
  transition-duration: var(--s-motion-duration-medium4, 400ms);
  transition-timing-function: var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
  transition-name: stroke-dashoffset, transform;
}
:host([indeterminate=true]) .known,
.unknown{
  display: none;
}
:host([indeterminate=true]) .unknown,
.known{
  display: block;
}
.container{
  width: 100%;
  height: 100%;
  border-radius: inherit;
  position: relative;
}
svg{
  height: inherit;
  width: inherit;
  stroke: currentColor;
}
circle{
  stroke-linecap: round;
  fill: none;
  stroke-dasharray: var(--dasharray);
}
.track{
  stroke: var(--s-color-secondary-container, #CFE6F1);
}
.unknown{
  animation: rotate 1568ms linear infinite;
}
@keyframes stroke{
  0% { stroke-dashoffset: var(--dasharray) }
  50% { stroke-dashoffset: calc(var(--dasharray) / 4) }
  100% { stroke-dashoffset: var(--dasharray) }
}
@keyframes stroke-rotate{
  0% { transform: rotate(0deg) }
  12.5% { transform: rotate(0deg) }
  25% {transform: rotate(270deg)}
  37.5% {transform: rotate(270deg)}
  50% {transform: rotate(540deg)}
  62.5% {transform: rotate(540deg)}
  75% {transform: rotate(810deg)}
  87.5% {transform: rotate(810deg)}
  100% { transform: rotate(1080deg) }
  100% { transform: rotate(1080deg) }
}
@keyframes rotate{
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}
`,J=48,Y=4,X=(J-Y)*Math.PI,pt=`
<div class="container known">
  <svg viewBox="0 0 48 48" style="transform: rotate(-90deg);--dasharray: ${X}px;">
    <circle class="track block" cx="${J/2}" cy="${J/2}" r="${(J-Y)/2}" style="stroke-width: ${Y}px" />
    <circle class="indicator block" cx="${J/2}" cy="${J/2}" r="${(J-Y)/2}" style="stroke-dashoffset: ${X}px;stroke-width: ${Y}px" />
  </svg>
</div>
<div class="container unknown">
  <svg viewBox="0 0 48 48" style="animation: stroke-rotate 5.2s ease-in-out infinite;--dasharray: ${X}px;">
    <circle transform="rotate(-90, ${J/2}, ${J/2})" cx="${J/2}" cy="${J/2}" r=" ${(J-Y)/2}" style="animation: stroke 1.3s ease-in-out infinite;stroke-width: ${Y}px"></circle>
  </svg>
</div>
`;(class extends W({style:ft,template:pt,props:dt,setup(e){let t=e.querySelector(`.known .track`),n=e.querySelector(`.known .indicator`),r=()=>{let e=Math.min(this.value,this.max)/this.max*100,r=X-X*(e/100),i=e/100*360;t.style.strokeDashoffset=`${e===0?0:Math.min(X+16-r,X)}px`,t.setAttribute(`transform`,`rotate(${i+20}, ${J/2}, ${J/2})`),n.style.strokeDashoffset=`${r}px`};return{max:r,value:r}}}){}).define(ut);const mt=(e,t=`yyyy-MM-dd`)=>{typeof e==`string`&&(e=new Date(e));let n=e.getFullYear(),r=e.getMonth()+1,i=e.getDate();return t.replace(`yyyy`,n.toString()).replace(`MM`,r.toString().padStart(2,`0`)).replace(`dd`,i.toString().padStart(2,`0`))};var Z=new class{list;locale=navigator.language;updates=new Map;constructor(e){this.list=e}getItem(e){if(e||=this.locale,e in this.list)return this.list[e];let[t]=e.split(`-`);return t in this.list?this.list[t]:this.list.zh}addItem(e,t){if(this.list[e])throw Error(`Locale ${e} already exists`);this.list[e]=t}setLocale(e){this.locale=e??navigator.language,this.updates.forEach(e=>e())}}({});Z.list={zh:{display:e=>`${e.getFullYear()}年${e.getMonth()+1}月${e.getDate()}日 星期${Z.list.zh.displayWeeks[e.getDay()]}`,displayMonth:e=>`${e.getFullYear()}年`,displayWeeks:[`日`,`一`,`二`,`三`,`四`,`五`,`六`]},en:{display:e=>`${[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`][e.getDay()]}, Jan ${e.getDate()}`,displayMonth:e=>`${[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`][e.getMonth()]} ${e.getFullYear()}`,displayWeeks:[`S`,`M`,`T`,`W`,`T`,`F`,`S`]}};var ht=`s-date`,gt=U({$value:``,$locale:``,$max:`2099-12-31`,$min:`1900-01-01`}),_t=`
:host{
  display: inline-block;
  vertical-align: middle;
  border-radius: 8px;
  font-size: .875rem;
  max-width: 360px;
  overflow: hidden;
  box-sizing: border-box;
  border: solid 1px var(--s-color-surface-variant, #DCE4E8);
  background: var(--s-color-surface-container-low, #F2F4F5);
  color: var(--s-color-on-surface, #191C1E);
}
.button,
.icon-button{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  box-sizing: border-box;
  font-size: .8125rem;
  color: var(--s-color-on-surface-variant, #40484C);
}
.icon-button{
  width: 36px;
  border-radius: 50%;
}
.button{
  border-radius: 18px;
  height: 36px;
  padding: 0 12px;
}
svg{
  width: 24px;
  fill: currentColor;
  box-sizing: border-box;
}
.header{
  padding: 24px 24px 16px 24px;
  font-size: 1.25rem;
  border-bottom: solid 1px var(--s-color-surface-variant, #DCE4E8);
  background: var(--s-color-surface-container, #ECEEF0);
}
.container{
  display: flex;
  flex-direction: column;
  position: relative;
}
.action{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.action>.year>svg{
  margin: 0 -8px 0 2px;
  padding: 1px;
}
.action>.toggle{
  display: flex;
}
.years{
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  gap: 4px;
  column-gap: 6px;
  padding: 0 16px 16px 16px;
  margin-top: -12px;
  max-height: 280px;
  counter-reset: year-counter 1899;
}
.years>.item{
  counter-increment: year-counter;
  flex-grow: 1;
}
.years>.item::before{
  content: counter(year-counter);
}
.weeks{
  display: flex;
  padding: 0 16px;
  font-size: .8125rem;
  color: var(--s-color-outline, #70787D);
}
.weeks>.item,
.days>.item{
  width: calc(100% / 7);
  display: inline-flex;
  justify-content: center;
}
.days{
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
}
.days>.overflow~.item{
  display: none;
}
.days>.item>s-ripple{
  margin: 2px;
}
.days>.checked>s-ripple,
.years>.checked{
  pointer-events: none;
  background: var(--s-color-primary, #006782);
  color: var(--s-color-on-primary, #ffffff);
}
.container:not(.show-years) .years,
.show-years :is(.weeks, .days, .action>.toggle){
  display: none;
}
`,vt={years:[],weeks:[],days:[]};for(let e=0;e<200;e++)e<7&&vt.weeks.push(`<div class="item"></div>`),e<31&&vt.days.push(`<div class="item"><s-ripple class="icon-button">${e+1}</s-ripple></div>`),vt.years.push(`<s-ripple class="button item"></s-ripple>`);var yt=`
<div class="header" part="header">
  <slot name="headline"></slot>
  <span></span>
</div>
<div class="container" part="container">
  <div class="action">
    <s-ripple class="button year" slot="trigger">
      <span></span>
      <svg viewBox="0 -960 960 960">
        <path d="M480-360 280-560h400L480-360Z"></path>
      </svg>
    </s-ripple>
    <div class="toggle">
      <s-ripple class="icon-button prev" part="prev-button">
        <svg viewBox="0 -960 960 960">
          <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"></path>
        </svg>
      </s-ripple>
      <s-ripple class="icon-button next" part="next-button">
        <svg viewBox="0 -960 960 960">
          <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"></path>
        </svg>
      </s-ripple>
    </div>
  </div>
  <s-scroll-view class="years">${vt.years.join(``)}</s-scroll-view>
  <div class="weeks">${vt.weeks.join(``)}</div>
  <div class="days">${vt.days.join(``)}</div>
</div>
`,bt=class{yearSelect;daySelect;dayOverflow;date;min;max;constructor(e,t,n){this.date=typeof e==`string`?new Date(e):e,this.min=new Date(t),this.max=new Date(n)}},xt=(e,t)=>{let n=new Date(e,t+1,1);return n.setDate(n.getDate()-1),n.getDate()},St=(e,t)=>{Z.addItem(e,t)},Ct=e=>{Z.setLocale(e)};(class extends W({style:_t,template:yt,props:gt,methods:{addLocale:St,setLocale:Ct},setup(e){let t=e.querySelector(`.container`),n=e.querySelector(`.header>span`),r=e.querySelector(`.action>.year`),i=e.querySelector(`.action>.toggle>.prev`),a=e.querySelector(`.action>.toggle>.next`),o=e.querySelector(`.years`),s=e.querySelector(`.weeks`),c=e.querySelector(`.days`),l=new bt(this.value||new Date,this.min,this.max),u=()=>{let e=Z.getItem(this.locale).display;n.textContent=e(l.date);let t=Z.getItem(this.locale).displayMonth;r.children[0].textContent=t(l.date)},d=()=>{let e=Z.getItem(this.locale).displayWeeks;s.childNodes.forEach((t,n)=>t.textContent=e[n])},f=()=>{let e=new Date(l.date.getFullYear(),l.date.getMonth(),1).getDay();c.children[0].setAttribute(`style`,`margin-left: calc((100% / 7) * ${e})`);let n=new Date(l.date.getFullYear(),l.date.getMonth()+1,0).getDate();l.dayOverflow?.classList.remove(`overflow`),l.dayOverflow=c.children[n-1],l.dayOverflow.classList.add(`overflow`),l.yearSelect?.classList.remove(`checked`),l.yearSelect=o.children[l.date.getFullYear()-l.min.getFullYear()],l.yearSelect.classList.add(`checked`),l.daySelect?.classList.remove(`checked`),l.daySelect=c.children[l.date.getDate()-1],l.daySelect.classList.add(`checked`),t.style.removeProperty(`height`)},p=()=>{let e=l.max.getFullYear()-l.min.getFullYear();o.innerHTML=``,o.style.counterReset=`year-counter ${l.min.getFullYear()-1}`;let t=document.createDocumentFragment();for(let n=0;n<=e;n++){let e=new q;e.classList.add(`button`,`item`),t.appendChild(e)}o.appendChild(t),f()},m=(e,t,n)=>{this.value=mt(new Date(e,t,n)),this.dispatchEvent(new Event(`change`))};r.onclick=()=>{let e=t.offsetHeight;if(t.classList.toggle(`show-years`),t.classList.contains(`show-years`)){t.style.height=`${e}px`,l.yearSelect&&o.scrollTo({top:l.yearSelect.offsetTop-o.offsetHeight/2+l.yearSelect.offsetHeight/2});return}},i.onclick=()=>{let e=xt(l.date.getFullYear(),l.date.getMonth()-1),t=Math.min(l.date.getDate(),e);m(l.date.getFullYear(),l.date.getMonth()-1,t)},a.onclick=()=>{let e=xt(l.date.getFullYear(),l.date.getMonth()+1),t=Math.min(l.date.getDate(),e);m(l.date.getFullYear(),l.date.getMonth()+1,t)},o.onclick=e=>{e.target instanceof q&&(t.classList.remove(`show-years`),m(Array.from(o.children).indexOf(e.target)+l.min.getFullYear(),l.date.getMonth(),l.date.getDate()))},c.onclick=e=>{if(!(e.target instanceof q))return;let t=Array.from(c.children).indexOf(e.target.parentElement)+1;m(l.date.getFullYear(),l.date.getMonth(),t)};let h=()=>{u(),d()};return f(),h(),{onMounted:()=>Z.updates.set(this,h),onUnmounted:()=>Z.updates.delete(this),min:e=>{let t=new Date(e);if(isNaN(t.getTime())||t.getTime()>l.date.getTime())throw Error(`invalid min date`);l.min=t,p()},max:e=>{let t=new Date(e);if(isNaN(t.getTime())||t.getTime()<l.date.getTime())throw Error(`invalid max date`);l.max=t,p()},value:{get:()=>mt(l.date),set:e=>{let t=new Date(e);if(isNaN(t.getTime())||t.getTime()<l.min.getTime()||t.getTime()>l.max.getTime())throw Error(`invalid date`);l.date=t,u(),f()}},locale:h}}}){}).define(ht);var wt=`s-date-picker`,Tt=U({$value:``,$min:``,$max:``,$label:``,$positiveText:`确定`,$negativeText:`取消`,$format:`yyyy-MM-dd`,$locale:``}),Et=`
:host{
  display: inline-block;
  vertical-align: middle;
  font-size: .875rem;
  --date-picker-border-radius: 4px;
  --date-picker-border-color: var(--s-color-outline, #70787D);
  --date-picker-border-width: 1px;
  --date-picker-padding: 16px;
  --date-picker-height: 48px;
}
s-dialog{
  display: block;
}
.field{
  --field-border-radius: var(--date-picker-border-radius);
  --field-border-color: var(--date-picker-border-color);
  --field-border-width: var(--date-picker-border-width);
  --field-padding: var(--date-picker-padding);
  height: var(--date-picker-height);
  position: relative;
  cursor: pointer;
}
.view{
  width: 100%;
  padding-top: 0;
  padding-bottom: 0;
  padding: 0 var(--date-picker-padding);
}
svg{
  width: 24px;
  height: 24px;
  padding: 2px;
  box-sizing: border-box;
  flex-shrink: 0;
  margin-left: min(0px, calc((var(--date-picker-padding) * -1) + 12px));
  margin-right: max(0px, calc(var(--date-picker-padding) - 4px));
  fill: var(--s-color-on-surface-variant, #40484C);
}
.ripple{
  border-radius: var(--date-picker-border-radius);
}
.date{
  border: none;
  width: 360px;
  border-radius: 0;
}
.positive,
.negative{
  border-radius: 20px;
}
`,Dt=`
<s-dialog part="dialog">
  <slot name="trigger" slot="trigger">
    <s-field class="field" fixed="false" part="field">
      <div class="label" part="label" slot="label"></div>
      <div class="view"></div>
      <svg viewBox="0 -960 960 960" slot="end">
        <path d="M320-400q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm160 0q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm160 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"></path>
      </svg>
      <s-ripple slot="custom" class="ripple" attached="true"></s-ripple>
    </s-field>
  </slot>
  <s-date class="date" part="date"></s-date>
  <s-ripple class="negative" slot="action" part="negative">${Tt.negativeText}</s-ripple>
  <s-ripple class="positive" slot="action" part="positive">${Tt.positiveText}</s-ripple>
</s-dialog>
`;(class extends W({style:Et,template:Dt,props:Tt,setup(e){let t=e.querySelector(`s-dialog`),n=e.querySelector(`s-date`),r=e.querySelector(`.negative`),i=e.querySelector(`.positive`),a=e.querySelector(`s-field`),o=e.querySelector(`.label`),s=e.querySelector(`.view`),c={date:``};return t.addEventListener(`show`,()=>{a.fixed=!0,a.focused=!0,c.date||(s.textContent=this.label,s.style.opacity=`0`)}),t.onclose=()=>{a.focused=!1,c.date||(a.fixed=!1)},i.onclick=()=>{this.value=n.value,s.style.removeProperty(`opacity`),this.dispatchEvent(new Event(`change`))},{value:{get:()=>c.date,set:e=>{if(c.date=e,e===``){n.value=mt(new Date),a.fixed=!1,s.textContent=``;return}a.fixed=!0,s.textContent=mt(e,this.format),n.value=e}},locale:{get:()=>n.locale,set:e=>n.locale=e},min:{get:()=>n.min,set:e=>n.min=e},max:{get:()=>n.max,set:e=>n.max=e},label:e=>o.textContent=e,positiveText:e=>i.textContent=e,negativeText:e=>r.textContent=e}}}){}).define(wt);var Ot=`s-scroll-view`,kt=`
:host{
  display: block;
  overflow: auto;
}
@media (pointer: fine){
  :host::-webkit-scrollbar{
    background: transparent;
    width: 6px;
    height: 6px;
  }
  :host::-webkit-scrollbar-thumb{
    background: var(--s-color-outline-variant, #C0C8CC);
    border-radius: 3px;
  }
  @supports not selector(::-webkit-scrollbar){
    :host{
      scrollbar-color: var(--s-color-outline-variant, #C0C8CC) transparent;
    }
  }
}
`,At=`<slot></slot>`;(class extends W({style:kt,template:At}){}).define(Ot);var jt=`s-dialog`,Mt=U({showed:!1,size:[`standard`,`full`]}),Nt=ue({show:CustomEvent,showed:Event,close:CustomEvent,closed:Event}),Pt=`
:host{
  display: inline-block;
  vertical-align: middle;
}
dialog{
  inset: 0;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  padding: 0;
  max-width: none;
  max-height: none;
  outline: none;
  color: inherit;
}
dialog::backdrop{
  background: none;
}
.wrapper{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  pointer-events: none;
}
.scrim{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  backdrop-filter: saturate(180%) blur(2px);
}
.scrim::before{
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  opacity: .75;
  background: var(--s-color-scrim, #000000);
}
dialog.show .scrim{
  opacity: 1;
}
.container,
::slotted([slot=custom]){
  max-width: calc(100% - 48px);
  max-height: calc(100% - 48px);
  pointer-events: auto;
  position: relative;
  border-radius: 28px;
  display: flex;
  outline: none;
  flex-direction: column;
  overflow: hidden;
  transition-timing-function: ease-out;
  box-shadow: var(--s-elevation-level5, 0 10px 14px -6px rgba(0, 0, 0, .2), 0 22px 35px 3px rgba(0, 0, 0, .14), 0 8px 42px 7px rgba(0, 0, 0, .12));
  background: var(--s-color-surface-container-high, #E7E8EA);
}
:host([size=full]) .container{
  width: 100%;
  height: 100%;
  border-radius: 0;
  max-width: none;
  max-height: none;
}
:host([size=full]) ::slotted(:is([slot=text],:not([slot]))){
  max-width: 100%;
  width: auto;
}
::slotted([slot=headline]){
  padding: 24px 24px 0 24px;
  font-size: 1.5rem;
  line-height: 22px;
  font-weight: 600;
  color: var(--s-color-on-surface, #191C1E);
  flex-shrink: 0;
}
.text{
  user-select: text;
  -webkit-user-select: text;
  flex-grow: 1;
}
::slotted([slot=text]){
  margin: 16px 24px;
  max-width: calc(100% - 48px);
  line-height: 22px;
}
::slotted(:is(:not([slot]), [slot=text])){
  width: 375px;
}
::slotted(:not([slot])){
  max-width: 100%;
}
.action{
  display: flex;
  justify-content: flex-end;
  padding: 0 14px;
  flex-shrink: 0;
}
::slotted([slot=action]){
  min-width: 72px;
  margin: 16px 2px;
  display: inline-flex;
  align-items: center;
  padding: 0 24px;
  color: var(--s-color-primary, #006782);
  box-sizing: border-box;
  height: 40px;
  font-size: .875rem;
  cursor: pointer;
}
`,Ft=`
<slot name="trigger"></slot>
<dialog part="popup">
  <div class="scrim" part="scrim"></div>
  <slot name="custom" class="wrapper" part="wrapper">
    <div class="container" part="container">
      <slot name="headline"></slot>
      <s-scroll-view class="text" part="view">
        <slot></slot>
        <slot name="text"></slot>
      </s-scroll-view>
      <div class="action" part="action">
        <slot name="action"></slot>
      </div>
    </div>
  </slot>
</dialog>
`,It=e=>{let t=document.body,n=new Lt,r=document.body.firstElementChild;if(r&&r.tagName===`S-PAGE`&&(t=r),typeof e==`string`){let t=document.createElement(`div`);t.slot=`text`,t.textContent=e,n.appendChild(t)}else{if(e.root&&(t=e.root),e.headline){let t=document.createElement(`div`);t.slot=`headline`,t.textContent=e.headline,n.appendChild(t)}if(e.text){let t=document.createElement(`div`);t.slot=`text`,t.textContent=e.text,n.appendChild(t)}e.view&&(typeof e.view==`function`?e.view(n):n.appendChild(e.view));let r=e.actions??[];for(let e of Array.isArray(r)?r:[r]){let t=document.createElement(`s-button`);t.slot=`action`,t.type=`text`,t.textContent=e.text,e.click&&(t.onclick=e.click),n.appendChild(t)}}return n.showed=!0,n.addEventListener(`closed`,()=>t.removeChild(n)),t.appendChild(n),n},Lt=class extends W({style:Pt,template:Ft,props:Mt,events:Nt,methods:{builder:It},setup(e){let t=e.querySelector(`dialog`),n=e.querySelector(`.scrim`),r=e.querySelector(`.wrapper`),i=getComputedStyle(this),a=()=>({easing:i.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(i.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)});e.querySelector(`slot[name=trigger]`).onclick=()=>{if(this.showed||!this.dispatchEvent(new CustomEvent(`show`,{cancelable:!0,detail:{source:`TRIGGER`}})))return console.log(`拒绝`);this.showed=!0};let o=e=>{!this.showed||!this.dispatchEvent(new CustomEvent(`close`,{cancelable:!0,detail:{source:e}}))||(this.showed=!1)};e.querySelector(`.scrim`).onclick=()=>o(`SCRIM`),e.querySelector(`slot[name=action]`).onclick=()=>o(`ACTION`);let s=()=>{if(!this.isConnected||t.open)return;let e=a();t.showModal(),t.classList.add(`show`),n.animate({opacity:[0,1]},e),r.animate({transform:[`scale(.9)`,`scale(1)`],opacity:[0,1]},e).addEventListener(`finish`,()=>this.dispatchEvent(new Event(`showed`)))},c=()=>{if(!this.isConnected||!t.open)return;let e=a();n.animate({opacity:[1,0]},e),r.animate({transform:[`scale(1)`,`scale(.9)`],opacity:[1,0]},e).addEventListener(`finish`,()=>{t.close(),t.classList.remove(`show`),this.dispatchEvent(new Event(`closed`))})};return{onMounted:()=>this.showed&&!t.open&&s(),showed:e=>e?s():c()}}}){};Lt.define(jt);var Rt=`s-divider`,zt=`
:host{
  display: flex;
  align-items: center;
  margin: 0 16px;
  gap: 8px;
  font-size: .75rem;
  color: var(--s-color-outline, #70787D);
 }
:host::before,
:host::after{
  content: '';
  flex-grow: 1;
  border-top: solid 1px var(--s-color-outline-variant, #C0C8CC);
}
:host(:empty){
  gap: 0;
}
`,Bt=`<slot></slot>`;(class extends W({style:zt,template:Bt}){}).define(Rt);var Vt=`s-drawer`,Ht=`
:host{
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
  container-name: s-drawer;
  container-type: inline-size;
}
.start,
.end{
  flex-shrink: 0;
  height: 100%;
  display: none;
  overflow: hidden;
}
.start{
  order: -1;
}
.scrim{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  backdrop-filter: saturate(180%) blur(2px);
  pointer-events: none;
}
.scrim::before{
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  opacity: .75;
  background: var(--s-color-scrim, #000000);
}
.view{
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
  height: 100%;
  position: relative;
}
::slotted(:is([slot=start], [slot=end])){
  width: 280px;
  border-width: 1px;
  height: 100%;
  box-sizing: border-box;
  pointer-events: auto;
  position: relative;
  background: var(--s-color-surface-container-low, #F2F4F5);
  border-color: var(--s-color-surface-variant, #DCE4E8);
}
::slotted([slot=start]){
  border-right-style: solid;
}
::slotted([slot=end]){
  border-left-style: solid;
}
::slotted(s-scroll-view:not([slot])){
  flex-grow: 1;
}
.start.show,
.end.show{
  display: block;
}
.scrim.s-laptop{
  display: block;
  z-index: 3;
}
.scrim.s-laptop.show-laptop{
  opacity: 1;
  pointer-events: auto;
}
.start.s-laptop,
.end.s-laptop{
  position: absolute;
  z-index: 3;
  max-width: 75%;
  display: none;
}
.end.s-laptop{
  left: auto;
  right: 0;
}
.start.s-laptop.show,
.end.s-laptop.show{
  display: none;
}
.start.s-laptop.show-laptop,
.end.s-laptop.show-laptop{
  display: block;
}
.s-laptop ::slotted(:is([slot=start], [slot=end])){
  border-left-style: none;
  border-right-style: none;
  box-shadow: var(--s-elevation-level-3, 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12));
}
@container s-drawer (max-width: 1024px){
  .scrim{
    display: block;
    z-index: 3;
  }
  .scrim.show-laptop{
    opacity: 1;
    pointer-events: auto;
  }
  .start,
  .end{
    position: absolute;
    z-index: 3;
    max-width: 75%;
    display: none;
  }
  .end{
    left: auto;
    right: 0;
  }
  .start.show,
  .end.show{
    display: none;
  }
  .start.show-laptop,
  .end.show-laptop{
    display: block;
  }
  ::slotted(:is([slot=start], [slot=end])){
    border-left-style: none;
    border-right-style: none;
    box-shadow: var(--s-elevation-level-3, 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12));
  }
}
`,Ut=`
<slot class="view" part="view"></slot>
<div class="scrim" part="scrim show"></div>
<slot name="start" class="start show" part="start"></slot>
<slot name="end" class="end show" part="end"></slot>
`;(class extends W({style:Ht,template:Ut,setup(e){let t=e.querySelector(`.scrim`),n={start:e.querySelector(`.start`),end:e.querySelector(`.end`)},r=getComputedStyle(this),i=()=>({easing:r.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(r.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)}),a=(e=`start`)=>n[e],o=e=>e??this.offsetWidth<=1024?`show-laptop`:`show`,s=(e=`start`)=>({start:-1,end:1})[e],c=(e,n)=>{let r=a(e),c=o(n);if(r.classList.contains(c))return;let l=s(e),u=i();r.classList.add(c),t.classList.add(c);let d=this.offsetWidth<=1024?{transform:[`translateX(${r.offsetWidth*l}px)`,`translateX(0)`]}:{width:[`0`,r.offsetWidth+`px`]};this.offsetWidth<=1024&&t.animate({opacity:[0,1]},u),r.animate(d,u)},l=(e,n)=>{let r=a(e),c=o(n);if(!r.classList.contains(c))return;let l=s(e),u=i(),d={...this.offsetWidth<=1024?{transform:[`translateX(0)`,`translateX(${r.offsetWidth*l}px)`]}:{width:[r.offsetWidth+`px`,`0px`]}};r.style.display=`block`,r.animate(d,u).finished.then(()=>r.style.removeProperty(`display`)),this.offsetWidth<=1024&&t.animate({opacity:[1,0]},u),r.classList.remove(c),t.classList.remove(c)};return t.addEventListener(`click`,()=>{l(`start`,!0),l(`end`,!0)}),ce.CSSContainer||new ResizeObserver(()=>{t.classList.toggle(`s-laptop`,this.offsetWidth<=1024),n.start.classList.toggle(`s-laptop`,this.offsetWidth<=1024),n.end.classList.toggle(`s-laptop`,this.offsetWidth<=1024)}).observe(this),{expose:{show:c,close:l,toggle:(e,t)=>{let n=a(e),r=o(t);n.classList.contains(r)?l(e,t):c(e,t)}}}}}){}).define(Vt);var Wt=`s-empty`,Gt=`
:host{
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 48px 16px;
  gap: 12px;
  font-size: .75rem;
  border-radius: 4px;
  box-sizing: border-box;
  color: var(--s-color-outline, #70787D);
}
.shadow{
  fill: var(--s-color-surface-container-high, #E7E8EA);
}
.box{
  fill: var(--s-color-surface-container-highest, #E1E3E4);
}
.border{
  stroke: var(--s-color-outline, #70787D);
}
::slotted(:is(svg, s-icon)){
  color: currentColor;
  fill: currentColor;
  width: 40px;
}
`,Kt=`
<slot name="icon">
  <svg width="64" height="41" viewBox="0 0 64 41">
    <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
      <ellipse cx="32" cy="33" rx="32" ry="7" class="shadow"></ellipse>
      <g fill-rule="nonzero" class="border">
        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
        <path class="box" d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"></path>
      </g>
    </g>
  </svg>
</slot>
<slot></slot>`;(class extends W({style:Gt,template:Kt}){}).define(Wt);var qt=`s-fab`,Jt=U({hidden:!1,disabled:!1}),Yt=`
:host{
  display: inline-flex;
  vertical-align: middle;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  min-height: 48px;
  font-size: .875rem;
  border-radius: 28px;
  font-weight: 500;
  white-space: nowrap;
  text-transform: capitalize;
  padding: 0 24px;
  transition-property: box-shadow, transform;
  transition-duration: var(--s-motion-duration-short4, 200ms);
  transition-timing-function: var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  box-shadow: var(--s-elevation-level3, 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12));
  background: var(--s-color-primary-container, #BAEAFF);
  color: var(--s-color-on-primary-container, #004D62);
}
:host([disabled=true]){
  pointer-events: none;
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
  background: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
  color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 38%, transparent) !important;
}
:host([hidden=true]){
  transform: scale(0);
  pointer-events: none;
}
::slotted(*){
  flex-shrink: 0;
}
::slotted(:is(svg, s-icon)){
  width: 24px;
  height: 24px;
  fill: currentColor;
  color: currentColor;
}
::slotted(:is(svg, s-icon):not([slot])){
  margin: 16px -8px;
}
::slotted(:is(svg[slot=start], s-icon[slot=start])){
  margin-left: -8px;
  margin-right: 8px;
}
::slotted(:is(svg[slot=end], s-icon[slot=end])){
  margin-left: 8px;
  margin-right: -8px;
}
:host([pressed]){
  box-shadow: var(--s-elevation-level4, 0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12));
}
@media (pointer: fine){
  :host(:hover){
    box-shadow: var(--s-elevation-level4, 0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12));
  }
}
@supports not (color: color-mix()){
  :host([disabled=true]){
    background: var(--s-color-surface-container-high, #E7E8EA) !important;
    color: var(--s-color-outline, #70787D) !important;
  }
}
`,Xt=`
<slot name="start"></slot>
<slot></slot>
<slot name="end"></slot>
<s-ripple attached="true" part="ripple"></s-ripple>
`;(class extends W({style:Yt,template:Xt,props:Jt}){}).define(qt);var Zt=`s-icon-button`,Qt=U({disabled:!1,type:[`standard`,`filled`,`filled-tonal`,`outlined`]}),$t=`
:host{
  display: inline-flex;
  vertical-align: middle;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  color: var(--s-color-on-surface-variant, #40484C);
  position: relative;
  box-sizing: border-box;
}
:host([disabled=true]){
  pointer-events: none !important;
  color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 38%, transparent) !important;
  background: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
}
:host([type=filled]){
  background: var(--s-color-primary, #006782);
  color: var(--s-color-on-primary, #ffffff);
}
:host([type=filled]) ::slotted([slot=badge]){
  box-shadow: 0 0 0 2px var(--s-color-surface, #F8F9FB);
}
:host([type=filled-tonal]){
  background: var(--s-color-secondary-container, #CFE6F1);
  color: var(--s-color-on-secondary-container, #354A53);
}
:host([type=outlined]){
  border: solid 1px var(--s-color-outline, #70787D)
}
:host([type=outlined][disabled=true]){
  background: none !important;
  border-color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
}
::slotted(:not([slot=badge])){
  color: inherit;
}
::slotted(svg){
  width: 24px;
  height: 24px;
  fill: currentColor;
}
::slotted([slot=badge]){
  position: absolute;
  right: 4px;
  top: 0;
  flex-shrink: 0;
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]){
    background: var(--s-color-surface-container-high, #E7E8EA) !important;
    color: var(--s-color-outline, #70787D) !important;
  }
  :host([type=outlined][disabled=true]){
    border-color: var(--s-color-surface-container-highest, #E1E3E4) !important;
  }
}
`,en=`
<slot name="start"></slot>
<slot></slot>
<slot name="end"></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
<slot name="badge"></slot>
`;(class extends W({style:$t,template:en,props:Qt}){}).define(Zt);var tn={none:``,home:`M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z`,add:`M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z`,search:`M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z`,menu:`M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z`,arrow_back:`m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z`,arrow_forward:{name:`arrow_back`,angle:180},arrow_upward:{name:`arrow_back`,angle:90},arrow_downward:{name:`arrow_back`,angle:-90},arrow_drop_up:`m280-400 200-200 200 200H280Z`,arrow_drop_down:{name:`arrow_drop_up`,angle:180},arrow_drop_left:{name:`arrow_drop_up`,angle:-90},arrow_drop_right:{name:`arrow_drop_up`,angle:90},more_vert:`M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z`,more_horiz:{name:`more_vert`,angle:90},close:`m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z`,done:`M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z`,chevron_up:`M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z`,chevron_down:{name:`chevron_up`,angle:180},chevron_left:{name:`chevron_up`,angle:-90},chevron_right:{name:`chevron_up`,angle:90},light_mode:`M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z`,dark_mode:`M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z`,star:`m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z`,favorite:`m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z`},nn=`s-icon`,rn=U({name:Object.keys(tn),$src:``}),an=`
:host{
  display: inline-flex;
  vertical-align: middle;
  justify-content: center;
  align-items: center;
  width: 24px;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  fill: currentColor;
  box-sizing: border-box;
  color: var(--s-color-on-surface-variant, #40484C);
}
svg,
img{
  width: 100%;
  height: 100%;
}
::slotted(*){
  width: 100%;
  height: 100%;
}
`,on=`<slot></slot>`;(class extends W({style:an,template:on,props:rn,setup(e){let t=e.querySelector(`slot`),n=document.createElement(`img`),r=(e=tn.none,t=``)=>`<svg viewBox="0 -960 960 960"><path d="${e}" transform="${t}"></path></svg>`;return{name:e=>{let n=tn[e];if(typeof n==`string`)return t.innerHTML=r(n);let i=n.name;typeof tn[i]==`string`&&(t.innerHTML=r(tn[i],`rotate(${n.angle} 480 -480)`))},src:async()=>{try{let e=new URL(this.src,location.href);if(e.pathname.endsWith(`.svg`)){let n=await(await fetch(e.href)).text(),r=document.createElement(`template`);r.innerHTML=n;let i=r.content.childNodes[0];if(!(i instanceof SVGElement))throw Error(`Invalid SVG`);t.innerHTML=``,t.appendChild(i),this.dispatchEvent(new Event(`load`))}else n.src=e.href,n.onload=()=>{t.innerHTML=``,t.appendChild(n),this.dispatchEvent(new Event(`load`))},n.onerror=()=>this.dispatchEvent(new ErrorEvent(`error`))}catch{this.dispatchEvent(new ErrorEvent(`error`))}}}}}){}).define(nn);var sn=`s-linear-progress`,cn=U({indeterminate:!1,animated:!1,$max:100,$value:0}),ln=`
:host{
  display: block;
  height: 4px;
  color: var(--s-color-primary, #006782);
  border-radius: 2px;
  overflow: hidden;
}
:host([animated=true]) .known>.block{
  transition: transform var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
}
:host([indeterminate=true]) .known,
.unknown{
  display: none;
}
:host([indeterminate=true]) .unknown,
.known{
  display: flex;
}
.container{
  height: 100%;
  border-radius: inherit;
  position: relative;
}
.block{
  position: absolute;
  height: 100%;
  border-radius: inherit;
  width: 100%;
  left: 0;
  top: 0;
}
.track{
  background: var(--s-color-secondary-container, #CFE6F1);
}
.indicator{
  background: currentColor;
}
.indicator-dot{
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  background: currentColor;
  border-radius: inherit;
}
@keyframes unknown{
  0%{
    transform: translateX(0);
  }
  100%{
    transform: translateX(150%);
  }
}
.unknown{
  justify-content: flex-end;
  gap: 4px;
  animation: unknown 2s linear infinite;
}
.unknown .block{
  position: static;
  flex-grow: 1;
  width: 100%;
  flex-shrink: 0;
}
.unknown .indicator{
  width: 50%;
}
`,un=`
<div class="container known" part="container">
  <div class="track block" style="transform: translateX(0%)" part="track"></div>
  <div class="indicator-dot" part="indicator-dot"></div>
  <div class="indicator block" style="transform: translateX(-100%)" part="indicator"></div>
</div>
<div class="container unknown" part="container">
  <div class="track block" part="track"></div>
  <div class="indicator block" part="indicator"></div>
  <div class="track block" part="indicator"></div>
</div>
`;(class extends W({style:ln,template:un,props:cn,setup(e){let t=e.querySelector(`.known>.track`),n=e.querySelector(`.known>.indicator`),r=()=>{let e=Math.min(this.value,this.max)/this.max*100;t.style.transform=`translateX(calc(${e}% + ${e===0?0:4}px))`,n.style.transform=`translateX(${e-100}%)`};return{max:r,value:r}}}){}).define(sn);var dn=`s-menu`,fn=`
:host{
  display: flex;
  flex-direction: column;
  font-size: .875rem;
  padding: 4px 0;
  background: var(--s-color-surface-container-low, #F2F4F5);
}
:host(:nth-of-type(n+2)){
  border-top: solid 1px var(--s-color-surface-variant, #DCE4E8);
}
::slotted([slot=label]){
  display: flex;
  align-items: center;
  height: 44px;
  margin: -4px 20px;
  font-size: .75rem;
  color: var(--s-color-on-surface-variant, #40484C);
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
}
`,pn=`
<slot name="label"></slot>
<slot></slot>
`,mn=class extends W({style:fn,template:pn}){},hn=`s-menu-item`,gn=U({checked:!1,folded:!0}),_n=`
:host{
  display: flex;
  flex-direction: column;
  margin: 4px 8px 4px 0;
  color: var(--s-color-on-surface, #191C1E);
}
.container{
  display: flex;
  align-items: center;
  height: 40px;
  border-radius: 0 24px 24px 0;
  padding: 0 20px;
  flex-shrink: 0;
}
:host([checked=true]) .container{
  background: var(--s-color-secondary-container, #CFE6F1);
  color: var(--s-color-on-secondary-container, #354A53);
}
.text{
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toggle-icon{
  width: 24px;
  height: 24px;
  display: none;
  margin-right: -8px;
  margin-left: 12px;
  transform: rotate(-90deg);
  transition: transform var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  fill: var(--s-color-on-surface-variant, #40484C);
}
.show-menu .toggle-icon{
  display: block;
}
:host([folded=false]) .toggle-icon{
  transform: rotate(0deg);
}
.fold{
  flex-shrink: 0;
}
.show-menu+.fold{
  margin: 0 -8px 0 0;
}
.menu{
  display: block;
  padding-top: 8px;
}
::slotted(:is(svg, s-icon)){
  color: var(--s-color-on-surface-variant, #40484C);
  fill: currentColor;
  height: 24px;
  width: 24px;
}
:host([checked=true]) ::slotted(:is(svg, s-icon)){
  color: currentColor;
}
::slotted([slot]){
  flex-shrink: 0;
}
::slotted([slot=start]){
  margin-left: -4px;
  margin-right: 12px;
}
::slotted([slot=end]){
  margin-right: -8px;
  margin-left: 12px;
}
::slotted([slot=menu]){
  background: var(--s-color-surface-container-high, #E7E8EA);
}
`,vn=`
<s-ripple class="container" part="container">
  <slot name="start"></slot>
  <div class="text" part="text">
    <slot></slot>
  </div>
  <slot name="end">
    <svg viewBox="0 -960 960 960" class="toggle-icon">
      <path d="M480-360 280-560h400L480-360Z"></path>
    </svg>
  </slot>
</s-ripple>
<s-fold class="fold" part="fold" folded="${gn.folded}">
  <slot name="menu" class="menu"></slot>
</s-fold>
`,yn=class extends W({style:_n,template:vn,props:gn,setup(e){let t=e.querySelector(`.container`),n=e.querySelector(`.fold`),r=e.querySelector(`slot[name=menu]`);return n.onclick=e=>e.stopPropagation(),r.onslotchange=()=>t.classList[r.assignedElements().length>0?`add`:`remove`](`show-menu`),t.onclick=()=>{t.classList.contains(`show-menu`)&&(this.folded=!this.folded)},{folded:e=>n.folded=e}}}){};mn.define(dn),yn.define(hn);var bn=`s-navigation`,xn=U({mode:[`bottom`,`rail`],$value:``}),Sn=`
:host{
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: var(--s-color-surface, #F8F9FB);
  box-shadow: var(--s-elevation-level2, 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12));
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
}
:host([mode=rail]){
  flex-direction: column;
  justify-content: flex-start;
  width: 80px;
  box-shadow: none;
  height: 100%;
  background: none;
  padding-bottom: 0;
}
::slotted(s-navigation-item){
  height: 64px;
}
:host([mode=rail]) ::slotted(s-navigation-item){
  height: 72px;
}
:host([mode=rail]) ::slotted(s-icon-button[slot=start]){
  width: 56px;
  height: 56px;
  margin: 16px 0 8px 0;
  border-radius: 12px;
}
:host([mode=rail]) ::slotted([slot=end]){
  flex-grow: 1;
}
`,Cn=`
<slot name="start"></slot>
<slot id="slot"></slot>
<slot name="end"></slot>
`,wn=class extends W({style:Sn,template:Cn,props:xn,setup(e){let t=e.querySelector(`#slot`),n=new Ge({context:this,class:kn,slot:t});return{expose:{get options(){return n.list},get selectedIndex(){return n.selectedIndex}},value:{get:()=>n.value,set:e=>n.value=e}}}}){},Tn=`s-navigation-item`,En=U({selected:!1,$value:``}),Dn=`
:host{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  font-size: .75rem;
  font-weight: 500;
  box-sizing: border-box;
  width: 100%;
  max-width: 80px;
  text-transform: capitalize;
  transition: color var(--s-motion-duration-short4, 400ms) var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
  color: var(--s-color-on-surface, #191C1E);
}
:host([selected=true]){
  color: var(--s-color-primary, #006782);
}
.icon{
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  width: 48px;
  border-radius: 14px;
  transition: background-color var(--s-motion-duration-short4, 400ms) var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
}
:host([selected=true]) .icon{
  background: var(--s-color-secondary-container, #CFE6F1);
}
::slotted(*){
  flex-shrink: 0;
}
::slotted(svg){
  color: var(--s-color-on-surface-variant, #40484C);
  fill: currentColor;
  width: 24px;
  height: 24px;
}
:host([selected=true]) ::slotted(:is(svg, s-icon)){
  color: currentColor;
}
::slotted([slot=badge]){
  position: absolute;
  right: 4px;
  top: 0;
}
::slotted([slot=text]){
  margin-top: 4px;
}
`,On=`
<s-ripple attached="true" class="icon" part="icon">
  <slot name="icon"></slot>
  <slot name="badge"></slot>
</s-ripple>
<slot name="text"></slot>
`,kn=class extends W({style:Dn,template:On,props:En,setup(){return this.addEventListener(`click`,()=>{this.selected||this.parentNode instanceof wn&&this.dispatchEvent(new Event(`${bn}:select`,{bubbles:!0}))}),{selected:()=>{this.parentNode instanceof wn&&this.dispatchEvent(new Event(`${bn}:update`,{bubbles:!0}))}}}}){};wn.define(bn),kn.define(Tn);var An=`s-field`,jn=U({focused:!1,fixed:!0}),Mn=`
:host{
  display: inline-block;
  vertical-align: middle;
  font-size: .875rem;
  --field-padding: 16px;
  --field-padding-top: var(--field-padding);
  --field-padding-bottom: var(--field-padding);
  --field-padding-left: var(--field-padding);
  --field-padding-right: var(--field-padding);
  --field-border-radius: 4px;
  --field-border-width: 1px;
  --field-focused-border-width: 2px;
  --field-border-color: var(--s-color-outline, #70787D);
}
.container{
  display: flex;
  height: 100%;
  min-height: inherit;
}
.line{
  position: relative;
}
.line::before,
.line::after{
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  border-width: var(--field-border-width);
  border-color: var(--field-border-color);
  pointer-events: none;
}
.line::after{
  border-width: var(--field-focused-border-width);
  border-color: var(--s-color-primary, #006782);
  opacity: 0;
  transition: opacity .2s ease-out;
}
:host([focused=true]) .line::after{
  opacity: 1;
}
.start,
.end{
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: var(--field-border-radius);
}
.start::before,
.end::before,
.start::after,
.end::after{
  border-top-style: solid;
  border-bottom-style: solid;
}
.start::before,
.start::after{
  border-left-style: solid;
  border-top-left-radius: var(--field-border-radius);
  border-bottom-left-radius: var(--field-border-radius);
}
.end::before,
.end::after{
  border-right-style: solid;
  border-top-right-radius: var(--field-border-radius);
  border-bottom-right-radius: var(--field-border-radius);
  left: auto;
  right: 0;
}
.box{
  display: grid;
  grid-template-areas: "a" "a";
  flex-grow: 1;
}
.box::before,
.box::after{
  border-bottom-style: solid;
}
.top,
.view{
  height: 100%;
  display: flex;
  grid-area: a;
  position: relative;
  box-sizing: border-box;
  margin-left: calc(var(--field-border-radius) * -1);
  margin-right: calc(var(--field-border-radius) * -1);
}
.view{
  align-items: center;
}
.top{
  pointer-events: none;
}
.top>.left::before,
.top>.right::before,
.top>.left::after,
.top>.right::after{
  border-top-style: solid;
}
.top>.left{
  width: calc(var(--field-padding-left) - var(--field-border-radius) - 4px);
  margin-left: max(4px, var(--field-border-radius));
  margin-right: min(4px, calc(var(--field-padding-left) - var(--field-border-radius)));
  flex-shrink: 0;
}
:host([fixed=false]) .top>.left{
  width: calc(var(--field-padding-left) - var(--field-border-radius));
  margin-right: 0;
}
.top>.right{
  flex-grow: 1;
  width: calc(var(--field-padding-right) - var(--field-border-radius) - 4px);
  margin-left: min(4px, calc(var(--field-padding-right) - var(--field-border-radius)));
  margin-right: max(4px, var(--field-border-radius));
}
:host([fixed=false]) .top>.right{
  width: calc(var(--field-padding-left) - var(--field-border-radius));
  margin-left: 0;
}
.label{
  display: block;
  height: 100%;
  flex-shrink: 0;
}
.label>.line::before,
.label>.line::after,
:host([fixed=false]) .label::before,
:host([fixed=false]) .label::after{
  border-top-style: solid;
}
.label>.line::before,
.label>.line::after{
  transform: translateX(-50%);
  width: min(calc(var(--field-padding-right) - var(--field-border-radius)), 8px);
}
::slotted([slot=label]){
  display: flex;
  align-items: center;
  height: 100%;
  font-size: .75rem;
  align-items: center;
  transform: translateY(-50%);
  color: var(--field-border-color);
  transition: transform .2s ease-out, font-size .2s ease-out;
  box-sizing: border-box;
  position: relative;
}
:host([fixed=false]) ::slotted([slot=label]),
::slotted([slot=label]:empty){
  font-size: inherit;
  transform: translateY(0);
}
::slotted([slot=label]:empty)::before,
::slotted([slot=label]:empty)::after{
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-50%);
  width: min(calc(var(--field-padding-right) - var(--field-border-radius)), 8px);
  border-top: solid var(--field-border-width); var(--field-border-color);
}
::slotted([slot=label]:empty)::after{
  opacity: 0;
  border-width: var(--field-focused-border-width);
  transition: opacity .2s ease-out;
  border-color: var(--s-color-primary, #006782);
}
:host([focused=true]) ::slotted([slot=label]:empty)::after{
  opacity: 1;
}
:host([focused=true]) ::slotted([slot=label]){
  color: var(--s-color-primary, #006782);
}
::slotted(:not([slot])){
  padding-left: var(--field-padding-left);
  padding-right: var(--field-padding-right);
  padding-top: var(--field-padding-top);
  padding-bottom: var(--field-padding-bottom);
  display: flex;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
}
`,Nn=`
<div class="container" part="container">
  <div class="start line" part="start">
    <slot name="start"></slot>
  </div>
  <div class="box line" part="box">
    <slot class="view"></slot>
    <div class="top" part="top">
      <div class="line left"></div>
      <slot name="label" class="label line">
        <div class="line"></div>
      </slot>
      <div class="line right"></div>
    </div>
  </div>
  <div class="end line" part="end">
    <slot name="end"></slot>
  </div>
  <slot name="custom"></slot>
</div>
`;(class extends W({style:Mn,template:Nn,props:jn}){}).define(An);var Pn=`s-fold`,Fn=U({folded:!1}),In=`
:host{
  display: block;
}
.container{
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
  transition: grid-template-rows var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
}
:host([folded=true]) .container{
  grid-template-rows: 0fr;
}
.view{
  display: block;
  min-height: 0;
  overflow: hidden;
}
`,Ln=`
<slot name="trigger"></slot>
<div class="container" part="container">
  <slot class="view" part="view"></slot>
</div>
`;(class extends W({style:In,template:Ln,props:Fn,setup(e){e.querySelector(`slot[name=trigger]`).onclick=()=>this.folded=!this.folded}}){}).define(Pn);var Rn=`s-page`,zn=U({theme:[`light`,`auto`,`dark`]}),Bn=`
:host{
  display: flow-root;
  height: 100%;
  font-family: Roboto, system-ui;
  color: var(--s-color-on-background);
  background: var(--s-color-background);
  --s-color-scrim: #000000;
  --s-color-primary: #006782;
  --s-color-on-primary: #ffffff;
  --s-color-primary-container: #BAEAFF;
  --s-color-on-primary-container: #004D62;
  --s-color-secondary: #4C616B;
  --s-color-on-secondary: #ffffff;
  --s-color-secondary-container: #CFE6F1;
  --s-color-on-secondary-container: #354A53;
  --s-color-tertiary: #5C5B7E;
  --s-color-on-tertiary: #ffffff;
  --s-color-tertiary-container: #E2DFFF;
  --s-color-on-tertiary-container: #444465;
  --s-color-error: #BA1A1A;
  --s-color-on-error: #ffffff;
  --s-color-error-container: #FFDAD6;
  --s-color-on-error-container: #93000A;
  --s-color-background: #F8F9FB;
  --s-color-on-background: #191C1E;
  --s-color-outline: #70787D;
  --s-color-outline-variant: #C0C8CC;
  --s-color-surface: #F8F9FB;
  --s-color-on-surface: #191C1E;
  --s-color-surface-variant: #DCE4E8;
  --s-color-on-surface-variant: #40484C;
  --s-color-inverse-surface: #2E3132;
  --s-color-inverse-on-surface: #EFF1F3;
  --s-color-inverse-primary: #60D4FE;
  --s-color-surface-container: #ECEEF0;
  --s-color-surface-container-high: #E7E8EA;
  --s-color-surface-container-highest: #E1E3E4;
  --s-color-surface-container-low: #F2F4F5;
  --s-color-surface-container-lowest: #FFFFFF;
  --s-color-success: #006d43;
  --s-color-on-success: #ffffff;
  --s-color-success-container: #92f7bc;
  --s-color-on-success-container: #002111;
  --s-color-warning: #6f5d00;
  --s-color-on-warning: #ffffff;
  --s-color-warning-container: #ffe169;
  --s-color-on-warning-container: #221b00;
  --s-color-dark-primary: #60D4FE;
  --s-color-dark-on-primary: #003545;
  --s-color-dark-primary-container: #004D62;
  --s-color-dark-on-primary-container: #BAEAFF;
  --s-color-dark-secondary: #B4CAD5;
  --s-color-dark-on-secondary: #1E333C;
  --s-color-dark-secondary-container: #354A53;
  --s-color-dark-on-secondary-container: #CFE6F1;
  --s-color-dark-tertiary: #C4C3EA;
  --s-color-dark-on-tertiary: #2D2D4D;
  --s-color-dark-tertiary-container: #444465;
  --s-color-dark-on-tertiary-container: #E2DFFF;
  --s-color-dark-error: #FFB4AB;
  --s-color-dark-on-error: #690005;
  --s-color-dark-error-container: #93000A;
  --s-color-dark-on-error-container: #FFDAD6;
  --s-color-dark-background: #111415;
  --s-color-dark-on-background: #E1E3E4;
  --s-color-dark-outline: #8A9296;
  --s-color-dark-outline-variant: #40484C;
  --s-color-dark-surface: #111415;
  --s-color-dark-on-surface: #E1E3E4;
  --s-color-dark-surface-variant: #40484C;
  --s-color-dark-on-surface-variant: #C0C8CC;
  --s-color-dark-inverse-surface: #E1E3E4;
  --s-color-dark-inverse-on-surface: #2E3132;
  --s-color-dark-inverse-primary: #006782;
  --s-color-dark-surface-container: #1D2022;
  --s-color-dark-surface-container-high: #272A2C;
  --s-color-dark-surface-container-highest: #323537;
  --s-color-dark-surface-container-low: #191C1E;
  --s-color-dark-surface-container-lowest: #0C0F10;
  --s-color-dark-success: #76daa1;
  --s-color-dark-on-success: #003920;
  --s-color-dark-success-container: #005231;
  --s-color-dark-on-success-container: #92f7bc;
  --s-color-dark-warning: #e2c54b;
  --s-color-dark-on-warning: #3a3000;
  --s-color-dark-warning-container: #544600;
  --s-color-dark-on-warning-container: #ffe169;
  --s-elevation-level1: 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12);
  --s-elevation-level2: 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12);
  --s-elevation-level3: 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12);
  --s-elevation-level4: 0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12);
  --s-elevation-level5: 0 10px 14px -6px rgba(0, 0, 0, .2), 0 22px 35px 3px rgba(0, 0, 0, .14), 0 8px 42px 7px rgba(0, 0, 0, .12);
  --s-motion-duration-Short1: 50ms;
  --s-motion-duration-short2: 100ms;
  --s-motion-duration-short3: 150ms;
  --s-motion-duration-short4: 200ms;
  --s-motion-duration-medium1: 250ms;
  --s-motion-duration-medium2: 300ms;
  --s-motion-duration-medium3: 350ms;
  --s-motion-duration-medium4: 400ms;
  --s-motion-duration-long1: 450ms;
  --s-motion-duration-long2: 500ms;
  --s-motion-duration-long3: 550ms;
  --s-motion-duration-long4: 600ms;
  --s-motion-duration-extra-long1: 700ms;
  --s-motion-duration-extra-long2: 800ms;
  --s-motion-duration-extra-long3: 900ms;
  --s-motion-duration-extra-long4: 1000ms;
  --s-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1.0);
  --s-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1.0);
  --s-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --s-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1.0);
  --s-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1);
  --s-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);
}
:host([dark]){
  --s-color-primary: var(--s-color-dark-primary) !important;
  --s-color-on-primary: var(--s-color-dark-on-primary) !important;
  --s-color-primary-container: var(--s-color-dark-primary-container) !important;
  --s-color-on-primary-container: var(--s-color-dark-on-primary-container) !important;
  --s-color-secondary: var(--s-color-dark-secondary) !important;
  --s-color-on-secondary: var(--s-color-dark-on-secondary) !important;
  --s-color-secondary-container: var(--s-color-dark-secondary-container) !important;
  --s-color-on-secondary-container: var(--s-color-dark-on-secondary-container) !important;
  --s-color-tertiary: var(--s-color-dark-tertiary) !important;
  --s-color-on-tertiary: var(--s-color-dark-on-tertiary) !important;
  --s-color-tertiary-container: var(--s-color-dark-tertiary-container) !important;
  --s-color-on-tertiary-container: var(--s-color-dark-on-tertiary-container) !important;
  --s-color-error: var(--s-color-dark-error) !important;
  --s-color-on-error: var(--s-color-dark-on-error) !important;
  --s-color-error-container: var(--s-color-dark-error-container) !important;
  --s-color-on-error-container: var(--s-color-dark-on-error-container) !important;
  --s-color-background: var(--s-color-dark-background) !important;
  --s-color-on-background: var(--s-color-dark-on-background) !important;
  --s-color-outline: var(--s-color-dark-outline) !important;
  --s-color-outline-variant: var(--s-color-dark-outline-variant) !important;
  --s-color-surface: var(--s-color-dark-surface) !important;
  --s-color-on-surface: var(--s-color-dark-on-surface) !important;
  --s-color-surface-variant: var(--s-color-dark-surface-variant) !important;
  --s-color-on-surface-variant: var(--s-color-dark-on-surface-variant) !important;
  --s-color-inverse-surface: var(--s-color-dark-inverse-surface) !important;
  --s-color-inverse-on-surface: var(--s-color-dark-inverse-on-surface) !important;
  --s-color-inverse-primary: var(--s-color-dark-inverse-primary) !important;
  --s-color-surface-container: var(--s-color-dark-surface-container) !important;
  --s-color-surface-container-high: var(--s-color-dark-surface-container-high) !important;
  --s-color-surface-container-highest: var(--s-color-dark-surface-container-highest) !important;
  --s-color-surface-container-low: var(--s-color-dark-surface-container-low) !important;
  --s-color-surface-container-lowest: var(--s-color-dark-surface-container-lowest) !important;
  --s-color-success: var(--s-color-dark-success) !important;
  --s-color-on-success: var(--s-color-dark-on-success) !important;
  --s-color-success-container: var(--s-color-dark-success-container) !important;
  --s-color-on-success-container: var(--s-color-dark-on-success-container) !important;
  --s-color-warning: var(--s-color-dark-warning) !important;
  --s-color-on-warning: var(--s-color-dark-on-warning) !important;
  --s-color-warning-container: var(--s-color-dark-warning-container) !important;
  --s-color-on-warning-container: var(--s-color-dark-on-warning-container) !important;
}
`,Vn=`<slot></slot>`,Hn=document.createElement(`style`);Hn.textContent=`::view-transition-old(root),::view-transition-new(root) { animation: none; mix-blend-mode: normal}`,class extends W({style:Bn,template:Vn,props:zn,setup(){let e=getComputedStyle(this),t=matchMedia(`(prefers-color-scheme: dark)`),n=()=>({easing:e.getPropertyValue(`--s-motion-easing-standard-accelerate`)||`cubic-bezier(0.3, 0, 1, 1)`,duration:G(e.getPropertyValue(`--s-motion-duration-long4`)||`600ms`)}),r=()=>this.theme===`auto`?t.matches:this.theme===`dark`;return{expose:{toggle:(e,r)=>new Promise(i=>{if(this.theme===e)return;let a=t.matches,o=e=>e===`auto`?a?`dark`:`light`:e;if(o(this.theme)===o(e)||!document.startViewTransition)return this.theme=e,i();let s=innerWidth,c=innerHeight,l={clipPath:[`circle(0px at 50% ${c/2}px)`,`circle(${Math.sqrt(s**2+c**2)/2}px at 50% ${c/2}px)`]};if(r&&r.isConnected){let{left:e,top:t}=r.getBoundingClientRect(),n=e+r.offsetWidth/2,i=t+r.offsetHeight/2,a=Math.max(s-n,n),o=Math.max(c-i,i),u=Math.sqrt(a**2+o**2);l.clipPath[0]=`circle(0px at ${n}px ${i}px)`,l.clipPath[1]=`circle(${u}px at ${n}px ${i}px)`}let u=document.startViewTransition(()=>{this.theme=e,document.head.appendChild(Hn)});u.ready.then(async()=>{i(document.documentElement.animate(l,{...n(),pseudoElement:`::view-transition-new(root)`})),await u.finished,Hn.remove()})}),get isDark(){return r()}},theme:e=>{if(e===`light`)return this.removeAttribute(`dark`);if(e===`dark`)return this.setAttribute(`dark`,``);let n=()=>{t.matches?this.setAttribute(`dark`,``):this.removeAttribute(`dark`),this.dispatchEvent(new Event(`change`))};t.onchange=n,n()}}}}){}.define(Rn);var Un=`s-pagination`,Wn=U({$value:1,$total:20,$count:20,type:[`standard`,`outlined`]}),Gn=`
:host{
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: .875rem;
  border-radius: 18px;
  gap: 4px;
  color: var(--s-color-on-surface, #191C1E);
}
:host([type=outlined]) :is(.icon-button, .button){
  border-width: 1px;
  border-color: var(--s-color-outline-variant, #C0C8CC);
  border-style: solid;
}
.container{
  display: flex;
  flex-wrap: wrap;
  gap: inherit;
  height: 100%;
  border-radius: inherit;
  justify-content: space-evenly;
}
.icon-button,
.button{
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  height: 36px;
}
.icon-button{
  border-radius: inherit;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
}
.button{
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  padding: 0 8px;
  border-radius: inherit;
  box-sizing: border-box;
}
.checked{
  background: var(--s-color-secondary-container, #CFE6F1);
  color: var(--s-color-on-secondary-container, #354A53);
  border-color: var(--s-color-secondary, #4C616B) !important;
}
.disabled{
  pointer-events: none;
  opacity: .38;
}
.text{
  pointer-events: none;
  border: none !important;
}
svg{
  width: 24px;
  height: 24px;
  padding: 1px;
  box-sizing: border-box;
  fill: var(--s-color-on-surface-variant, #40484C);
}
`,Kn=`
<s-ripple class="prev icon-button disabled" part="prev">
  <svg viewBox="0 -960 960 960">
    <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"></path>
  </svg>
</s-ripple>
<div class="container">
  <s-ripple class="button checked">1</s-ripple>
</div>
<s-ripple class="next icon-button disabled" part="next">
  <svg viewBox="0 -960 960 960">
    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"></path>
  </svg>
</s-ripple>
`;(class extends W({style:Gn,template:Kn,props:Wn,setup(e){let t=e.querySelector(`.prev`),n=e.querySelector(`.next`),r=e.querySelector(`.container`),i=()=>this.dispatchEvent(new Event(`change`)),a=()=>{let e=Math.ceil(this.total/this.count),i=Math.max(Math.min(e-7,Math.max(0,this.value-4)),0);if(r.childNodes.forEach(e=>{i++;let t=e;t.textContent=i.toString(),t.classList.toggle(`checked`,this.value===i),t.classList.remove(`text`)}),t.classList.toggle(`disabled`,this.value===1),n.classList.toggle(`disabled`,this.value===e),e>7){if(this.value>=5){r.childNodes.item(0).textContent=`1`;let e=r.childNodes.item(1);e.textContent=`...`,e.classList.add(`text`)}if(this.value<=e-4){r.childNodes.item(r.childNodes.length-1).textContent=e.toString();let t=r.childNodes.item(r.childNodes.length-2);t.textContent=`...`,t.classList.add(`text`)}}};return r.onclick=e=>{if(!(e.target instanceof q))return;let t=Number(e.target.textContent);t!==this.value&&(this.value=t,i())},t.onclick=()=>{let e=Math.max(this.value-1,1);e!==this.value&&(this.value=e,i())},n.onclick=()=>{let e=Math.min(this.value+1,Math.ceil(this.total/this.count));e!==this.value&&(this.value=e,i())},{total:()=>{let e=Math.ceil(this.total/this.count),t=Math.min(e,7),n=document.createDocumentFragment();for(let e=1;e<=t;e++){let e=new q;e.classList.add(`button`),n.appendChild(e)}r.innerHTML=``,r.appendChild(n),a()},value:a}}}){}).define(Un);var qn=`s-picker`,Jn=U({disabled:!1,$label:``,$value:``}),Yn=`
:host{
  display: inline-block;
  vertical-align: middle;
  font-size: .875rem;
  --picker-border-radius: 4px;
  --picker-border-color: var(--s-color-outline, #70787D);
  --picker-border-width: 1px;
  --picker-padding: 16px;
  --picker-height: 48px;
}
:host([disabled=true]){
  pointer-events: none;
  opacity: .38;
}
.popup{
  display: block;
  cursor: pointer;
  position: relative;
}
.ripple{
  border-radius: var(--picker-border-radius);
}
.field{
  --field-border-radius: var(--picker-border-radius);
  --field-border-color: var(--picker-border-color);
  --field-border-width: var(--picker-border-width);
  --field-padding: var(--picker-padding);
  height: var(--picker-height);
  width: 100%;
  position: relative;
}
.view{
  width: 100%;
  padding-top: 0;
  padding-bottom: 0;
  padding: 0 var(--picker-padding);
}
svg{
  width: 24px;
  height: 24px;
  padding: 2px;
  box-sizing: border-box;
  flex-shrink: 0;
  margin-left: min(0px, calc((var(--picker-padding) * -1) + 4px));
  margin-right: max(0px, calc(var(--picker-padding) - 12px));
  fill: var(--s-color-on-surface-variant, #40484C);
}
.container{
  max-height: 408px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-size: .875rem;
  padding: 4px 0;
  gap: 4px;
}
`,Xn=`
<s-popup class="popup">
  <slot name="trigger" slot="trigger">
    <s-field fixed="false" class="field" part="field">
      <div class="label" slot="label"></div>
      <div class="view"></div>
      <svg viewBox="0 -960 960 960" slot="end">
        <path d="M480-360 280-560h400L480-360Z"></path>
      </svg>
      <s-ripple slot="custom" class="ripple" attached="true"></s-ripple>
    </s-field>
  </slot>
  <s-scroll-view class="container" part="container">
    <slot id="slot"></slot>
  </s-scroll-view>
</s-popup>
`,Zn=class extends W({style:Yn,template:Xn,props:Jn,setup(e){let t=e.querySelector(`.popup`),n=e.querySelector(`.field`),r=e.querySelector(`.label`),i=e.querySelector(`.view`),a=e.querySelector(`#slot`),o=e.querySelector(`.container`),s=new Ge({context:this,class:nr,slot:a});return t.addEventListener(`show`,()=>{n.focused=!0,n.fixed=!0,s.select||(i.textContent=this.label,i.style.opacity=`0`),o.style.minWidth=`${this.offsetWidth}px`,s.select&&o.scrollTo({top:s.select.offsetTop-o.offsetTop-(o.offsetHeight/2-s.select.offsetHeight/2)})}),t.onclose=()=>{n.focused=!1,!s.select&&(n.fixed=!1)},t.addEventListener(`closed`,()=>o.style.removeProperty(`min-width`)),s.onUpdate=()=>{if(!s.select){n.fixed=!1,i.textContent=``;return}n.fixed=!0,i.style.removeProperty(`opacity`),i.textContent=s.select.textContent},s.onSelect=()=>t.close(),{expose:{get options(){return s.list},get selectedIndex(){return s.selectedIndex},get show(){return t.show},get toggle(){return t.toggle},get close(){return t.close}},label:e=>r.textContent=e,value:{get:()=>s.value,set:e=>s.value=e}}}}){},Qn=`s-picker-item`,$n=U({selected:!1,$value:``}),er=`
:host{
  display: flex;
  align-items: center;
  height: 40px;
  margin: 0 4px;
  cursor: pointer;
  position: relative;
  border-radius: 4px;
  flex-shrink: 0;
  padding: 0 12px;
  color: var(--s-color-on-surface, #191C1E);
}
:host([selected=true]){
  background: var(--s-color-secondary-container, #CFE6F1);
  color: var(--s-color-on-secondary-container, #354A53);
}
.text{
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
::slotted(:is(svg, s-icon)){
  color: var(--s-color-on-surface-variant, #40484C);
  fill: currentColor;
  height: 24px;
  width: 24px;
}
:host([selected=true]) ::slotted(:is(svg, s-icon)){
  color: currentColor;
}
::slotted([slot]){
  flex-shrink: 0;
}
::slotted([slot=start]){
  margin-left: -4px;
  margin-right: 8px;
}
::slotted([slot=end]){
  margin-left: 8px;
  margin-right: -4px;
}
`,tr=`
<slot name="start"></slot>
<div class="text" part="text">
  <slot></slot>
</div>
<slot name="end"></slot>
<s-ripple part="ripple" attached="true" ></s-ripple>
`,nr=class extends W({style:er,template:tr,props:$n,setup(){return this.addEventListener(`click`,()=>{this.selected||this.parentNode instanceof Zn&&this.dispatchEvent(new Event(`${qn}:select`,{bubbles:!0}))}),{selected:()=>{this.parentNode instanceof Zn&&this.dispatchEvent(new Event(`${qn}:update`,{bubbles:!0}))}}}}){};Zn.define(qn),nr.define(Qn);var rr=`s-popup`,ir=U({align:[`center`,`left`,`right`]}),ar=ue({show:Event,showed:Event,closed:Event}),or=`
:host{
  display: inline-block;
  vertical-align: middle;
  text-align: left;
}
dialog{
  inset: 0;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  padding: 0;
  max-width: none;
  max-height: none;
  position: relative;
  overflow: hidden;
  color: inherit;
  outline: none;
}
dialog::backdrop{
  background: none;
}
.scrim{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.container{
  display: block;
  position: absolute;
  max-width: 100%;
  max-height: 100%;
  width: fit-content;
  height: fit-content;
  outline: none;
}
::slotted(:not([slot])){
  border-radius: 4px;
  max-width: inherit;
  max-height: inherit;
  box-shadow: var(--s-elevation-level2, 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12));
  background: var(--s-color-surface-container, #ECEEF0);
}
`,sr=`
<slot name="trigger"></slot>
<dialog class="popup" part="popup">
  <div class="scrim" part="scrim"></div>
  <slot class="container" part="container"></slot>
</dialog>
`,cr=(e,t,n,r)=>{let i={top:0,left:0,origin:[]},a=r===`center`,o=a?e.top+e.height:e.top,s=a?e.top-n:e.top-n+e.height;if(o+n<=innerHeight)i.top=o,i.origin[1]=`top`;else if(s>=0)i.top=s,i.origin[1]=`bottom`;else{let t=(innerHeight-n)/2;i.top=t,i.origin[1]=`${e.top+e.height/2-t}px`}if(a)i.left=e.left-(t-e.width)/2,i.origin[0]=`center`,i.left<0?(i.left=e.left,i.origin[0]=`${e.width/2}px`):i.left+t>innerWidth&&(i.left=e.left+e.width-t,i.origin[0]=`${t-e.width+e.width/2}px`);else{let n=n=>{i.left=e.left-t,i.origin[0]=`right`,i.left<0&&n&&n()},a=n=>{i.left=e.left+e.width,i.origin[0]=`left`,i.left+t>innerWidth&&n&&n()},o=()=>{let n=(innerWidth-t)/2;i.left=n,i.origin[0]=`${e.left+e.width/2-n}px`};r===`left`?n(()=>a(o)):a(()=>n(o))}return i};(class extends W({style:or,template:sr,props:ir,events:ar,setup(e){let t=e.querySelector(`dialog`),n=e.querySelector(`.container`),r=getComputedStyle(this),i=()=>({easing:r.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(r.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)}),a=e=>{if(!this.isConnected||t.open)return;let r={top:0,left:0,origin:[]};if(t.showModal(),!this.dispatchEvent(new Event(`show`,{cancelable:!0})))return t.close();n.style.maxHeight=`${innerHeight}px`,n.style.maxWidth=`${innerWidth}px`;let a=n.offsetWidth,o=n.offsetHeight;if(!e||e instanceof HTMLElement){let t=cr((e??this).getBoundingClientRect(),a,o,this.align);r.top=t.top,r.left=t.left,r.origin=t.origin}else r.top=e.y,r.left=e.x,r.origin=e.origin?.split(` `)??[`left`,`top`],e.x+a>innerWidth&&(r.left=e.x-a,r.origin[0]=`right`),e.y+o>innerHeight&&(r.top=e.y-o,r.origin[1]=`bottom`);n.style.transformOrigin=r.origin.join(` `),n.style.top=`${r.top}px`,n.style.left=`${r.left}px`;let s=n.animate({transform:[`scale(.9)`,`scale(1)`],opacity:[0,1]},i());this.setAttribute(`showed`,``),s.finished.then(()=>this.dispatchEvent(new Event(`showed`)))},o=()=>{if(!this.isConnected||!t.open||n.getAnimations().length>0||!this.dispatchEvent(new Event(`close`,{cancelable:!0})))return;let e=n.animate({transform:[`scale(1)`,`scale(.9)`],opacity:[1,0]},i());this.removeAttribute(`showed`),e.finished.then(()=>{t.close(),this.dispatchEvent(new Event(`closed`))})};return e.querySelector(`slot[name=trigger]`).addEventListener(`click`,()=>a()),e.querySelector(`.scrim`).addEventListener(`pointerdown`,o),{expose:{show:a,toggle:e=>t.open?o():a(e),close:o},onMounted:()=>addEventListener(`resize`,o),onUnmounted:()=>removeEventListener(`resize`,o)}}}){}).define(rr);var lr=`s-popup-menu`,ur=U({group:[``,`start`,`end`]}),dr=`
:host{
  display: inline-block;
  vertical-align: middle;
  font-size: .875rem;
}
.popup{
  display: block;
}
.container{
  box-sizing: border-box;
  padding: 4px 0;
  max-width: 224px;
  min-height: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
::slotted(s-popup-menu[group=start]){
  border-top: solid 1px var(--s-color-outline-variant, #C0C8CC);
  margin-top: 4px;
  padding-top: 4px;
}
::slotted(s-popup-menu[group=end]){
  border-bottom: solid 1px var(--s-color-outline-variant, #C0C8CC);
  margin-bottom: 4px;
  padding-bottom: 4px;
}
`,fr=`
<s-popup class="popup">
  <slot slot="trigger" name="trigger"></slot>
  <s-scroll-view class="container" part="container">
    <slot></slot>
  </s-scroll-view>
</s-popup>
`,pr=class e extends W({style:dr,template:fr,props:ur,setup(t){let n=t.querySelector(`.popup`),r=t.querySelector(`slot[name=trigger]`);return r.onclick=e=>{e.stopPropagation(),n.show()},this.addEventListener(`${lr}:click`,e=>{e.stopPropagation(),n.close()}),n.onclose=t=>{let n=t.target;if(n.parentNode instanceof ShadowRoot){let t=n.parentNode.host;t.parentNode instanceof e&&t.parentNode.close()}},{onMounted:()=>{this.parentNode instanceof e&&n.setAttribute(`align`,`right`)},expose:{get show(){return n.show},get toggle(){return n.toggle},get close(){return n.close}}}}}){},mr=`s-popup-menu-item`,hr=`
:host{
  display: flex;
  align-items: center;
  height: 40px;
  margin: 0 4px;
  padding: 0 12px;
  cursor: pointer;
  position: relative;
  border-radius: 4px;
  color: var(--s-color-on-surface, #191C1E);
}
.text{
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
::slotted(:is(svg, s-icon)){
  fill: currentColor;
  height: 24px;
  width: 24px;
  color: var(--s-color-on-surface-variant, #40484C);
}
::slotted([slot]){
  flex-shrink: 0;
}
::slotted([slot=start]){
  margin-left: -4px;
  margin-right: 8px;
}
::slotted([slot=end]){
  margin-left: 8px;
  margin-right: -6px;
}
`,gr=`
<slot name="start"></slot>
<div class="text" part="text">
  <slot></slot>
</div>
<slot name="end"></slot>
<s-ripple attached="true"></s-ripple>
`,_r=class extends W({style:hr,template:gr,setup(){this.addEventListener(`click`,()=>this.dispatchEvent(new Event(`${lr}:click`,{bubbles:!0})))}}){};pr.define(lr),_r.define(mr);var vr=`s-radio-button`,yr=U({disabled:!1,checked:!1,name:``,$value:``}),br=`
:host{
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  cursor: pointer;
  position: relative;
  height: 40px;
  color: var(--s-color-on-surface-variant, #40484C);
}
:host([checked=true]){
  color: var(--s-color-primary, #006782);
}
:host([disabled=true]){
  pointer-events: none;
}
.container{
  position: relative;
  height: 100%;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
:host([disabled=true]) .container{
  color: var(--s-color-on-surface, #191C1E) !important;
  opacity: .38 !important;
}
.unchecked,
.checked{
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.checked{
  position: absolute;
  transform: scale(.5);
  opacity: 0;
  transition-property: transform, opacity;
  transition-timing-function: var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
  transition-duration: var(--s-motion-duration-short4, 200ms);
}
:host([checked=true]:not([indeterminate=true])) .checked{
  opacity: 1;
  transform: scale(1);
}
.dot{
  width: 60%;
  height: 60%;
  transform: scale(0.4);
  background: currentColor;
  border-radius: 50%;
}
.ripple{
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  height: 100%;
  width: auto;
  border-radius: 50%;
}
svg,
::slotted(:is([slot=checked], [slot=unchecked])){
  color: currentColor;
  fill: currentColor;
  width: 60%;
  height: 60%;
}
`,xr=`
<div class="container" part="container">
  <slot class="unchecked" name="unchecked">
    <svg viewBox="0 -960 960 960">
      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path>
    </svg>
  </slot>
  <slot class="checked" name="checked">
    <div class="dot"></div>
  </slot>
</div>
<slot></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
`;(class extends W({style:br,template:xr,props:yr,setup(){this.addEventListener(`click`,()=>{this.checked=!0,this.name&&document.querySelectorAll(`${this.tagName}[name='${this.name}']`).forEach(e=>{e!==this&&(e.checked=!1)}),this.dispatchEvent(new Event(`change`))})}}){}).define(vr);var Sr=`s-rate`,Cr=U({readOnly:!1,$max:10,$min:0,$value:5,$step:1}),wr=`
:host{
  display: inline-flex;
  vertical-align: middle;
  overflow: hidden;
  position: relative;
  font-size: 24px;
  width: calc(1em * 5);
  height: 1em;
}
.track{
  width: 100%;
  display: flex;
}
.track svg,
::slotted([slot=track]){
  fill: var(--s-color-secondary-container, #CFE6F1);
  filter: drop-shadow(1em 0 0 var(--s-color-secondary-container, #CFE6F1)) drop-shadow(2em 0 0 var(--s-color-secondary-container, #CFE6F1)) drop-shadow(3em 0 0 var(--s-color-secondary-container, #CFE6F1));
}
.indicator{
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 50%;
  overflow: hidden;
  display: flex;
}
.indicator svg,
::slotted([slot=indicator]){
  fill: var(--s-color-primary, #006782);
  filter: drop-shadow(1em 0 0 var(--s-color-primary, #006782)) drop-shadow(2em 0 0 var(--s-color-primary, #006782)) drop-shadow(3em 0 0 var(--s-color-primary, #006782)) drop-shadow(4em 0 0 var(--s-color-primary, #006782));
}
svg,
::slotted(*){
  height: 100%;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  flex-shrink: 0;
}
input{
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  opacity: 0;
  margin: 0;
}
:host([readonly=true]) input{
  display: none;
}
`,Tr=`
<slot name="track" class="track" part="track">
  <svg viewBox="0 -960 960 960">
    <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/>
  </svg>
</slot>
<slot name="indicator" class="indicator" part="indicator">
  <svg viewBox="0 -960 960 960">
    <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
  </svg>
</slot>
<input
  type="range"
  max="${Cr.max}"
  min="${Cr.min}"
  step="${Cr.step}"
  value="${Cr.value}"
/>
`;(class extends W({style:wr,template:Tr,props:Cr,setup(e){let t=e.querySelector(`.indicator`),n=e.querySelector(`input`),r=()=>{let e=(Number(n.value)-this.min)*100/this.max-this.min;t.style.width=`${e}%`};return n.onchange=()=>this.dispatchEvent(new Event(`change`)),n.oninput=()=>{this.value=Number(n.value),this.dispatchEvent(new Event(`input`))},{max:e=>{n.max=String(e),r()},min:e=>{n.min=String(e),r()},step:e=>{n.step=String(e),r()},value:e=>{n.value=String(e),r()}}}}){}).define(Sr);var Er=`s-search`,Dr=U({$placeholder:``,disabled:!1,$value:``,$maxLength:-1,readOnly:!1}),Or=`
:host{
  display: inline-flex;
  vertical-align: middle;
  min-height: 40px;
  width: 220px;
  border-radius: 20px;
  font-size: .875rem;
  position: relative;
  background: var(--s-color-surface-container-low, #F2F4F5);
  color: var(--s-color-on-surface, #191C1E);
  --search-outline-width: 1px;
  --search-outline-color: var(--s-color-surface-variant, #DCE4E8);
}
.wrapper{
  display: grid;
  position: relative;
  border-radius: inherit;
  overflow: hidden;
  background: inherit;
  min-height: inherit;
  flex-grow: 1;
  width: 100%;
  box-shadow: 0 0 0 var(--search-outline-width) var(--search-outline-color);
}
:host(:focus-within) .wrapper{
  position: absolute;
}
.container{
  display: flex;
  align-items: center;
  position: relative;
  min-height: inherit;
}
input{
  border: none;
  padding: 0 16px;
  height: 100%;
  width: 0;
  flex-grow: 1;
  background: none;
  outline: none;
  font-size: inherit;
  color: inherit;
  box-sizing: border-box;
  line-height: 1;
  font-family: inherit;
  caret-color: var(--s-color-primary, #006782);
}
input::placeholder{
  color: var(--s-color-outline, #70787D);
}
input::selection{
  background: var(--s-color-primary, #006782);
  color: var(--s-color-on-primary, #ffffff);
}
::slotted([slot=dropdown]){
  position: absolute;
  pointer-events: none;
  left: 0;
  height: 0;
  opacity: 0;
  border-top: solid 1px var(--s-color-surface-variant, #DCE4E8);
  height: auto;
}
:host(:focus-within) ::slotted([slot=dropdown]){
  pointer-events: auto;
  position: relative;
  opacity: 1;
}
::slotted([slot]){
  flex-shrink: 0;
}
.clear{
  display: none;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  border-radius: 50%;
}
svg,
::slotted(svg){
  height: 24px;
  width: 24px;
  fill: var(--s-color-on-surface-variant, #40484C);
}
.icon,
::slotted(:is(s-icon[slot=start], svg[slot=start])){
  margin: 0 -8px 0 8px;
}
::slotted(:is(s-icon[slot=end], svg[slot=end])){
  margin: 0 8px 0 -8px;
}
::slotted(s-icon-button[slot=start]){
  margin-right: -16px;
}
.clear,
::slotted(s-icon-button[slot=end]){
  margin-left: -16px;
}
`,kr=`
<div class="wrapper" part="wrapper">
  <div class="container" part="container">
    <slot name="start">
      <svg viewBox="0 -960 960 960" class="icon">
        <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"></path>
      </svg>
    </slot>
    <input type="text">
    <slot name="end">
      <s-ripple class="clear">
        <svg viewBox="0 -960 960 960">
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"></path>
        </svg>
      </s-ripple>
    </slot>
  </div>
  <slot name="dropdown"></slot>
</div>
`;(class extends W({style:Or,template:kr,props:Dr,setup(e){let t=e.querySelector(`input`),n=e.querySelector(`.clear`),r=e.querySelector(`[name=dropdown]`),i=()=>n.style.display=t.value===``?`none`:`flex`;return r.onmousedown=e=>e.preventDefault(),t.onchange=()=>this.dispatchEvent(new Event(`change`)),n.onclick=()=>{t.value=``,i(),this.dispatchEvent(new Event(`input`)),this.dispatchEvent(new Event(`change`))},t.oninput=i,{expose:{get native(){return t}},value:{get:()=>t.value,set:e=>{t.value=e,i()}},placeholder:e=>t.placeholder=e,maxLength:e=>t.maxLength=e,readOnly:e=>t.readOnly=e}}}){}).define(Er);var Ar=`s-segmented-button`,jr=U({$value:``,mode:[`auto`,`fixed`]}),Mr=`
:host{
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  border-radius: 20px;
  height: 40px;
  padding: 3px;
  overflow: hidden;
  box-sizing: border-box;
  border: solid 1px var(--s-color-surface-variant, #C0C8CC);
  background: var(--s-color-surface-container, #ECEEF0);
}
:host([mode=fixed]){
  display: flex;
}
:host([mode=fixed]) ::slotted(s-segmented-button-item){
  flex-basis: 100%;
}
`,Nr=`<slot></slot>`,Pr=class extends W({style:Mr,template:Nr,props:jr,setup(e){let t=e.querySelector(`slot`),n=new Ge({context:this,class:zr,slot:t}),r=getComputedStyle(this),i=()=>({easing:r.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(r.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)});return n.onUpdate=e=>{if(!e||!n.select||!this.isConnected)return;let t=e.shadowRoot.querySelector(`.indicator`).getBoundingClientRect(),r=n.select.shadowRoot.querySelector(`.indicator`),a=r.getBoundingClientRect(),o=t.left-a.left;r.style.transform=`translateX(${a.left>t.left?o:Math.abs(o)}px)`,r.style.width=`${t.width}px`,e.style.zIndex=`1`;let s=r.animate([{transform:`translateX(0)`,width:`${a.width}px`}],i());s.onfinish=s.oncancel=s.onremove=()=>{r.style.removeProperty(`transform`),r.style.removeProperty(`width`),e.style.removeProperty(`z-index`)}},{expose:{get options(){return n.list},get selectedIndex(){return n.selectedIndex}},value:{get:()=>n.value,set:e=>n.value=e}}}}){},Fr=`s-segmented-button-item`,Ir=U({selected:!1,disabled:!1,selectable:!0,$value:``}),Lr=`
:host{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-width: 64px;
  padding: 0 16px;
  text-transform: capitalize;
  cursor: pointer;
  font-weight: 500;
  font-size: .8125rem;
  position: relative;
  box-sizing: border-box;
  border-radius: 20px;
  transition: color var(--s-motion-duration-medium4, 400ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  color: var(--s-color-on-surface, #191C1E);
}
:host([selected=true]){
  color: var(--s-color-on-primary, #ffffff);
}
:host([disabled=true]){
  pointer-events: none;
  color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 38%, transparent);
}
.indicator{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border-radius: inherit;
  background: var(--s-color-primary, #006782);
}
:host([selected=true]) .indicator{
  opacity: 1;
}
::slotted([slot]){
  width: 18px;
  height: 18px;
  color: inherit;
  fill: currentColor;
  flex-shrink: 0;
  position: relative;
}
::slotted([slot=start]){
  margin-right: 4px;
}
::slotted([slot=end]){
  margin-right: 4px;
}
.text{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  position: relative;
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]){
    opacity: .38;
    color: var(--s-color-on-surface, #191C1E);
  }
}
`,Rr=`
<div class="indicator" part="indicator"></div>
<slot name="start"></slot>
<div class="text" part="text">
  <slot></slot>
</div>
<slot name="end"></slot>
<s-ripple attached="true" part="ripple"></s-ripple>
`,zr=class extends W({style:Lr,template:Rr,props:Ir,setup(){return this.addEventListener(`click`,()=>{!(this.parentNode instanceof Pr)||this.selected||this.selectable&&this.dispatchEvent(new Event(`${Ar}:select`,{bubbles:!0}))}),{selected:()=>{this.parentNode instanceof Pr&&this.dispatchEvent(new CustomEvent(`${Ar}:update`,{bubbles:!0,detail:{}}))}}}}){};Pr.define(Ar),zr.define(Fr);var Br=`s-skeleton`,Vr=`
:host{
  display: block;
  height: 16px;
  animation: skeleton var(--s-motion-duration-extra-long4, 1000ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0)) infinite;
  background: linear-gradient(90deg, var(--s-color-surface-container-high, #E7E8EA) 25%, var(--s-color-surface-container-highest, #E1E3E4) 37%, var(--s-color-surface-container-high, #E7E8EA) 63%);
  background-size: 400% 100%;
  border-radius: 8px;
}
@keyframes skeleton{
  0%{
    background-position: 100% 50%;
  }
  100%{
    background-position: 0 50%;
  }
}
`;(class extends W({style:Vr}){}).define(Br);var Hr=`s-slider`,Ur=U({disabled:!1,$labeled:!1,$max:100,$min:0,$step:1,$value:0}),Wr=`
:host{
  display: block;
  color: var(--s-color-primary, #006782);
  height: 16px;
  cursor: pointer;
  position: relative;
}
:host([disabled=true]){
  pointer-events: none;
  color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 38%, transparent) !important;
}
.container{
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  pointer-events: none;
}
.track,
.indicator{
  height: 4px;
  border-radius: 2px;
  position: absolute;
  right: 0;
}
.track{
  background: var(--s-color-secondary-container, #CFE6F1);
  width: calc(100% - 20px);
}
:host([disabled=true]) .track{
  background: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
}
.indicator{
  left: 0;
  width: 0;
  background: currentColor;
}
.handle{
  position: relative;
  height: 16px;
  width: 16px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.thumb{
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 50%;
  background: currentColor;
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
}
.thumb::before{
  content: '';
  position: absolute;
  left: -10px;
  top: -10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: color-mix(in srgb, currentColor 20%, transparent);
  transform: scale(0);
  transition: transform var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
}
.active .thumb::before{
  transform: scale(1);
}
.label{
  position: absolute;
  bottom: 100%;
  margin-bottom: 12px;
  background: var(--s-color-inverse-surface, #2E3132);
  color: var(--s-color-inverse-on-surface, #EFF1F3);
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0 6px;
  height: 24px;
  font-size: .75rem;
  transform: scale(0);
  transform-origin: center bottom;
  transition: transform var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  opacity: .85;
  z-index: 1;
  display: none;
}
.active .label{
  transform: scale(1);
}
:host([labeled=true]) .label{
  display: flex;
}
input{
  margin: 0;
  height: 100%;
  width: 100%;
  cursor: inherit;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]){
    color: var(--s-color-on-surface, #191C1E) !important;
  }
  :host([disabled=true]) .track{
    background: var(--s-color-surface-container-high, #E7E8EA) !important;
  }
  :host([disabled=true]) .thumb{
    opacity: .38;
  }
}
`,Gr=`
<div class="container" part="container">
  <div class="indicator" part="indicator"></div>
  <div class="track" part="track"></div>
  <div class="handle" part="handle">
    <div class="thumb" part="thumb"></div>
    <div class="label" part="label">${Ur.value}</div>
  </div>
</div>
<input
  type="range"
  max="${Ur.max}"
  min="${Ur.min}"
  step="${Ur.step}"
  value="${Ur.value}"
/>
`;(class extends W({style:Wr,template:Gr,props:Ur,setup(e){let t=e.querySelector(`.container`),n=e.querySelector(`.indicator`),r=e.querySelector(`.track`),i=e.querySelector(`.handle`),a=e.querySelector(`.label`),o=e.querySelector(`input`),s=()=>{let e=Number(o.value),t=(e-this.min)*100/(this.max-this.min);i.style.left=`calc(${t}% - ${t*.16}px)`,n.style.width=`calc(${t}% - ${4+t*.16}px)`,r.style.width=`calc(${100-t}% - ${20-t*.16}px)`,a.textContent=String(e)};return o.onchange=()=>this.dispatchEvent(new Event(`change`)),o.oninput=()=>{this.value=Number(o.value),this.dispatchEvent(new Event(`input`))},o.onmousedown=e=>e.button===0&&K.pointerFine.matches&&t.classList.add(`active`),o.onmouseup=()=>K.pointerFine.matches&&t.classList.remove(`active`),o.ontouchstart=()=>K.pointerCoarse.matches&&t.classList.add(`active`),o.ontouchend=()=>K.pointerCoarse.matches&&t.classList.remove(`active`),o.ontouchcancel=()=>K.pointerCoarse.matches&&t.classList.remove(`active`),{max:e=>{o.max=String(e),s()},min:e=>{o.min=String(e),s()},step:e=>{o.step=String(e),s()},value:e=>{o.value=String(e),s()}}}}){}).define(Hr);var Kr=document.createElement(`div`);Kr.setAttribute(`style`,`position: fixed;right: 0;bottom: 0;width: 100%;height: 100%;pointer-events: none`);const qr=e=>{e.appendChild(Kr);let t=Kr.getBoundingClientRect();return e.removeChild(Kr),{left:t.left,top:t.top,width:t.width,height:t.height}};var Jr=`s-snackbar`,Yr=U({type:[`none`,`info`,`success`,`warning`,`error`],align:[`auto`,`top`,`bottom`],$duration:4e3}),Xr=ue({show:Event,showed:Event,closed:Event}),Zr=`
:host{
  display: inline-block;
  vertical-align: middle;
}
.popup{
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  outline: none;
  max-width: none;
  max-height: none;
  display: none;
  overflow: hidden;
  box-sizing: border-box;
  pointer-events: none;
  padding: 16px;
  justify-content: center;
  transition: transform var(--s-motion-duration-medium4, 400ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
}
.popup.show{
  display: flex;
}
.container{
  outline: none;
  align-self: flex-end;
  width: fit-content;
  display: flex;
  align-items: center;
  min-height: 48px;
  line-height: 22px;
  border-radius: 4px;
  padding: 6px 16px;
  font-size: .875rem;
  font-weight: 500;
  box-sizing: border-box;
  max-width: 320px;
  transition: box-shadow var(--s-motion-duration-medium4, 400ms) var(--s-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1.0));
  box-shadow: var(--s-elevation-level3, 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12));
  background: var(--s-color-inverse-surface, #2E3132);
  color: var(--s-color-inverse-on-surface, #EFF1F3);
}
.text{
  flex-grow: 1;
  min-width: 0;
  user-select: text;
  -webkit-user-select: text;
}
.icon{
  display: none;
}
:host([type=info]) .info,
:host([type=success]) .success,
:host([type=warning]) .warning,
:host([type=error]) .error{
  display: block;
}
:host([type=info]) .container{
  color: var(--s-color-on-secondary, #ffffff);
  background: var(--s-color-secondary, #4C616B);
}
:host([type=success]) .container{
  color: var(--s-color-on-success, #ffffff);
  background: var(--s-color-success, #006d43);
}
:host([type=warning]) .container{
  color: var(--s-color-on-warning, #ffffff);
  background: var(--s-color-warning, #6f5d00);
}
:host([type=error]) .container{
  color: var(--s-color-on-error, #ffffff);
  background: var(--s-color-error, #BA1A1A);
}
:host([type=info]) ::slotted([slot=action]),
:host([type=success]) ::slotted([slot=action]),
:host([type=warning]) ::slotted([slot=action]),
:host([type=error]) ::slotted([slot=action]){
  color: currentColor;
}
svg,
::slotted([slot=icon]){
  width: 24px;
  height: 24px;
  color: currentColor;
  fill: currentColor;
  margin-right: 12px;
  margin-left: -4px;
}
::slotted([slot=action]){
  font-size: inherit;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 4px;
  margin-right: -8px;
  margin-left: 12px;
  cursor: pointer;
  height: 36px;
  font-size: .875rem;
  color: var(--s-color-inverse-primary, #60D4FE);
}
@media (max-width: 375px){
  .popup{
    padding: 8px;
  }
}
@media (pointer: fine){
  .container:hover{
    box-shadow: var(--s-elevation-level4, 0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12));
  }
}
`,Qr=`
<slot name="trigger"></slot>
<div class="popup" popover="manual" part="popup">
  <div class="container" part="container">
    <slot name="icon">
      <svg viewBox="0 0 24 24" class="icon info">
        <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z"></path>
      </svg>
      <svg viewBox="0 0 24 24" class="icon success">
        <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"></path>
      </svg>
      <svg viewBox="0 0 24 24" class="icon warning">
        <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path>
      </svg>
      <svg viewBox="0 0 24 24" class="icon error">
        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
      </svg>
    </slot>
    <div class="text" part="text">
      <slot></slot>
    </div>
    <slot name="action"></slot>
  </div>
</div>
`,$r=e=>{let t=document.body,n=new ti;n.style.display=`block`;let r=document.body.firstElementChild;if(r&&r.tagName===`S-PAGE`&&(t=r),typeof e==`string`)n.textContent=e;else{if(e.root&&(t=e.root),e.align&&(n.align=e.align),e.icon&&(e.icon instanceof Element&&(e.icon.slot=`icon`,n.appendChild(e.icon)),typeof e.icon==`string`&&(n.innerHTML=e.icon)),n.append(e.text),e.type&&(n.type=e.type),e.action){let t=document.createElement(`s-button`);t.type=`text`,t.slot=`action`,typeof e.action==`string`?t.textContent=e.action:(t.textContent=e.action.text,t.addEventListener(`click`,e.action.click)),n.appendChild(t)}typeof e.duration==`number`&&(n.duration=e.duration)}return t.appendChild(n),n.addEventListener(`closed`,()=>t.removeChild(n)),n.show(),n},ei={top:[],bottom:[]},ti=class extends W({style:Zr,template:Qr,props:Yr,events:Xr,methods:{builder:$r},setup(e){let t=e.querySelector(`.popup`),n=e.querySelector(`.container`),r=getComputedStyle(this),i=()=>({easing:r.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(r.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)}),a={timer:0,gap:8},o=()=>this.align===`auto`?K.pointerCoarse.matches?`top`:`bottom`:this.align,s=()=>{if(!this.isConnected||t.classList.contains(`show`))return;if(t.classList.add(`show`),t.showPopover)t.showPopover();else{let n=qr(e);t.style.width=`${innerWidth}px`,t.style.height=`${innerHeight}px`,t.style.marginLeft=`${-n.left}px`,t.style.marginTop=`${-n.top}px`,t.style.zIndex=`3`}let r=o();n.style.alignSelf={top:`flex-start`,bottom:`flex-end`}[r];let s=ei[r],l={top:1,bottom:-1}[r],u=n.offsetHeight+a.gap;for(let e of s)e.style.transform=`translateY(${u*l}px)`,u+=e.firstElementChild.offsetHeight+a.gap;let d=n.animate({opacity:[0,1],transform:[`translateY(calc(${l*-100}% + 16px))`,``],pointerEvents:`auto`},{...i(),fill:`forwards`});this.dispatchEvent(new Event(`show`)),this.duration>0&&(a.timer=setTimeout(c,this.duration)),t.dataset.align=r,s.unshift(t),d.finished.then(()=>this.dispatchEvent(new Event(`showed`)))},c=()=>{if(!this.isConnected||!t.classList.contains(`show`))return;clearTimeout(a.timer);let e=t.dataset.align,r=ei[e],o={top:1,bottom:-1}[e],s=r.indexOf(t);for(let e=s+1;e<r.length;e++){let t=r[e],i=Math.abs(Number(t.style.transform.slice(11).slice(0,-3)));t.style.transform=`translateY(${(i-n.offsetHeight-a.gap)*o}px)`}let c=n.animate({opacity:[1,0],transform:`translateY(calc(${o*-100}% + 16px))`},i());this.dispatchEvent(new Event(`close`)),c.finished.then(()=>{t.hidePopover&&t.hidePopover(),t.removeAttribute(`style`),t.classList.remove(`show`),this.dispatchEvent(new Event(`closed`))}),r.splice(s,1)};return n.onmouseenter=()=>clearTimeout(a.timer),n.onmouseleave=()=>t.classList.contains(`show`)&&this.duration>0&&(a.timer=setTimeout(c,this.duration)),e.querySelector(`slot[name=trigger]`).onclick=s,e.querySelector(`slot[name=action]`).onclick=c,{expose:{show:s,close:c}}}}){};ti.define(Jr);var ni=`s-switch`,ri=U({disabled:!1,checked:!1}),ii=`
:host{
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  position: relative;
  cursor: pointer;
  color: var(--s-color-primary, #006782);
  width: 52px;
  aspect-ratio: 1.625;
  -webkit-aspect-ratio: 1.625;
  border-radius: 16px;
}
:host([disabled=true]){
  pointer-events: none;
}
.track{
  width: 100%;
  height: 100%;
  border: solid 2px var(--s-color-outline, #70787D);
  box-sizing: border-box;
  border-radius: inherit;
}
:host([disabled=true]) .track{
  border-color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
}
:host([checked=true]) .track{
  border-width: 0;
  background: currentColor;
}
:host([disabled=true][checked=true]) .track{
  background: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent) !important;
}
.ripple{
  height: 125%;
  width: auto;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  border-radius: 50%;
  inset: auto;
  transition: transform var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  color: var(--s-color-outline, #70787D);
  transform: translateX(-10%);
}
:host([checked=true]) .ripple{
  transform: translateX(40%);
  color: currentColor;
}
.thumb{
  background: var(--s-color-outline, #70787D);
  border-radius: 50%;
  width: 40%;
  height: 40%;
  transition: transform var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
  position: relative;
}
:host([disabled=true]) .thumb{
  background: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 38%, transparent);
}
:host([checked=true]) .thumb{
  background: var(--s-color-on-primary, #ffffff);
  transform: scale(1.5);
  box-shadow: var(--s-elevation-level1, 0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12));
}
:host([disabled=true][checked=true]) .thumb{
  background: var(--s-color-surface, #F8F9FB);
  box-shadow: none;
}
.icon{
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity var(--s-motion-duration-short4, 200ms) var(--s-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1.0));
  color: currentColor;
}
::slotted([slot=icon]),
svg{
  color: currentColor;
  fill: currentColor;
  width: 70%;
  height: 70%;
}
:host([checked=true]) .icon{
  opacity: 1;
}
:host([checked=true][disabled=true]) .icon{
  color: color-mix(in srgb, var(--s-color-on-surface, #191C1E) 12%, transparent);
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]) .track{
    border-color: var(--s-color-surface-container-highest, #E1E3E4) !important;
  }
  :host([disabled=true][checked=true]) .track{
    background: var(--s-color-surface-container-highest, #E1E3E4) !important;
  }
  :host([disabled=true]) .thumb{
    background: var(--s-color-surface-container-highest, #E1E3E4) !important;
  }
  :host([disabled=true][checked=true]) .thumb{
    background: var(--s-color-surface, #F8F9FB) !important;
  }
}
`,ai=`
<div class="track" part="track"></div>
<s-ripple attached="true" class="ripple" part="ripple">
  <div class="thumb" part="thumb">
    <slot name="icon" class="icon"></slot>
  </div>
</s-ripple>
`;(class extends W({style:ii,template:ai,props:ri,setup(){this.addEventListener(`click`,()=>{this.checked=!this.checked,this.dispatchEvent(new Event(`change`))})}}){}).define(ni);var oi=`s-tab`,si=U({mode:[`scrollable`,`fixed`],$value:``}),ci=`
:host{
  display: flex;
  justify-content: flex-start;
  position: relative;
  background: var(--s-color-surface, #F8F9FB);
  color: var(--s-color-on-surface-variant, #40484C);
}
:host::before{
  content: '';
  position: absolute;
  width: 100%;
  border-bottom: solid 1px var(--s-color-surface-variant, #DCE4E8);
  bottom: 0;
  left: 0;
}
.container{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  scrollbar-width: none;
  overflow-x: auto;
}
.container::-webkit-scrollbar{
  display: none;
}
:host([mode=fixed]) .container{
  overflow: hidden;
  width: 100%;
}
::slotted(s-tab-item){
  flex-shrink: 0;
  flex-basis: auto;
}
:host([mode=fixed]) ::slotted(s-tab-item){
  flex-basis: 100%;
  flex-shrink: 1;
}
`,li=`
<div class="container" part="container">
  <slot></slot>
</div>
`,ui=class extends W({style:ci,template:li,props:si,setup(e){let t=e.querySelector(`slot`),n=e.querySelector(`.container`),r=new Ge({context:this,class:hi,slot:t}),i=getComputedStyle(this),a=()=>({easing:i.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(i.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)});return r.onUpdate=e=>{if(r.select&&n.scrollWidth!==n.offsetWidth){let e=r.select.offsetLeft-n.offsetLeft-(n.offsetWidth/2-r.select.offsetWidth/2);n.scrollTo({left:e,behavior:`smooth`})}if(!e||!r.select||!this.isConnected)return;let t=e.shadowRoot.querySelector(`.indicator`).getBoundingClientRect(),i=r.select.shadowRoot?.querySelector(`.indicator`),o=i.getBoundingClientRect(),s=t.left-o.left;i.style.transform=`translateX(${o.left>t.left?s:Math.abs(s)}px)`,i.style.width=`${t.width}px`;let c=i.animate([{transform:`translateX(0)`,width:`${o.width}px`}],a());c.onfinish=c.oncancel=c.onremove=()=>{i.style.removeProperty(`transform`),i.style.removeProperty(`width`)}},{expose:{get options(){return r.list},get selectedIndex(){return r.selectedIndex}},value:{get:()=>r.value,set:e=>r.value=e}}}}){},di=`s-tab-item`,fi=U({selected:!1,$value:``}),pi=`
:host{
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  position: relative;
  cursor: pointer;
  font-size: .875rem;
  font-weight: 500;
  text-transform: capitalize;
  padding: 0 16px;
}
:host([selected=true]){
  color: var(--s-color-primary, #006782);
}
.container{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  min-height: inherit;
}
.indicator{
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: var(--s-color-primary, #006782);
  border-radius: 1.5px 1.5px 0 0;
  opacity: 0;
}
:host([selected=true]) .indicator{
  opacity: 1;
}
.text{
  display: flex;
  align-items: center;
  line-height: 1;
}
::slotted([slot=icon]){
  width: 24px;
  height: 24px;
  color: currentColor;
  fill: currentColor;
  margin: 10px 0;
}
::slotted([slot=text]){
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 1;
}
.icon ::slotted([slot=text]){
  margin-top: -6px;
  height: 26px;
}
::slotted([slot=badge]){
  margin-left: 4px;
}
::slotted([slot=badge]:not(:empty)){
  width: auto;
}
.icon ::slotted([slot=badge]){
  position: absolute;
  right: 0;
  width: 8px;
  top: 12px;
  margin-left: 0;
}
`,mi=`
<div class="container" part="container">
  <slot name="icon"></slot>
  <div class="text" part="text">
    <slot name="text"></slot>
    <slot name="badge"></slot>
  </div>
  <div class="indicator" part="indicator"></div>
</div>
<s-ripple attached="true" part="ripple"></s-ripple>
`,hi=class extends W({style:pi,template:mi,props:fi,setup(e){let t=e.querySelector(`.container`);return e.querySelector(`[name=icon]`).addEventListener(`slotchange`,e=>{let n=e.target.assignedElements().length;t.classList[n>0?`add`:`remove`](`icon`)}),this.addEventListener(`click`,()=>{!(this.parentNode instanceof ui)||this.selected||this.dispatchEvent(new Event(`${oi}:select`,{bubbles:!0}))}),{selected:()=>{this.parentNode instanceof ui&&this.dispatchEvent(new Event(`${oi}:update`,{bubbles:!0}))}}}}){};ui.define(oi),hi.define(di);var gi=`s-table`,_i=`
:host{
  display: inline-block;
  font-size: .875rem;
  overflow: auto;
  border: solid 1px var(--s-color-outline-variant, #C0C8CC);
  border-radius: 4px;
  white-space: nowrap;
}
slot{
  display: table;
  border-collapse: collapse;
  min-width: 100%;
}
@media (pointer: fine){
  :host::-webkit-scrollbar{
    width: 6px;
    height: 6px;
    background: transparent;
  }
  :host::-webkit-scrollbar-thumb{
    background: var(--s-color-outline-variant, #C0C8CC);
    border-radius: 3px;
  }
  @supports not selector(::-webkit-scrollbar){
    :host{
      scrollbar-color: var(--s-color-outline-variant, #C0C8CC) transparent;
    }
  }
}
`,vi=`
<slot></slot>
`,yi=class extends W({style:_i,template:vi}){},bi=`s-thead`,xi=`
:host{
  display: table-header-group;
  font-weight: 600;
  position: sticky;
  top: 0;
  border-bottom: solid 1px var(--s-color-outline-variant, #C0C8CC);
  background: var(--s-color-surface-container, #ECEEF0);
  color: var(--s-color-on-surface-variant, #40484C);
}
`,Si=`<slot></slot>`,Ci=class extends W({style:xi,template:Si}){},wi=`s-tbody`,Ti=`
:host{
  display: table-row-group;
  color: var(--s-color-on-surface, #191C1E);
}
::slotted(s-tr:not(:first-child)){
  border-top: solid 1px var(--s-color-outline-variant, #C0C8CC);
}
`,Ei=`<slot></slot>`,Di=class extends W({style:Ti,template:Ei}){},Oi=`s-tr`,ki=`
:host{
  display: table-row;
}
`,Ai=`<slot></slot>`,ji=class extends W({style:ki,template:Ai}){},Mi=`s-th`,Ni=`
:host{
  display: table-cell;
  padding: 12px 16px;
  text-transform: capitalize;
}
`,Pi=`<slot></slot>`,Fi=class extends W({style:Ni,template:Pi}){},Ii=`s-td`,Li=`
:host{
  display: table-cell;
  user-select: text;
  padding: 12px 16px;
}
`,Ri=`<slot></slot>`,zi=class extends W({style:Li,template:Ri}){};yi.define(gi),Ci.define(bi),Di.define(wi),ji.define(Oi),Fi.define(Mi),zi.define(Ii);var Bi=`s-text-field`,Vi=U({$label:``,$placeholder:``,disabled:!1,type:[`text`,`number`,`password`,`multiline`],error:!1,$value:``,$maxLength:-1,readOnly:!1,multiLine:!1,countered:!1}),Hi=`
:host{
  display: inline-grid;
  vertical-align: middle;
  font-size: .875rem;
  min-height: 48px;
  width: 280px;
  color: var(--s-color-on-surface, #191C1E);
  --text-field-border-radius: 4px;
  --text-field-border-color: var(--s-color-outline, #70787D);
  --text-field-padding: 16px;
  --text-field-padding-top: var(--text-field-padding);
  --text-field-padding-bottom: var(--text-field-padding);
  --text-field-padding-left: var(--text-field-padding);
  --text-field-padding-right: var(--text-field-padding);
}
:host([disabled=true]){
  pointer-events: none;
  opacity: .38;
}
:host([type=multiline]){
  line-height: 24px;
  --text-field-padding-top: 12px;
  --text-field-padding-bottom: 12px;
}
.field{
  display: block;
  min-height: inherit;
  font-size: inherit;
  --field-border-radius: var(--text-field-border-radius);
  --field-border-color: var(--text-field-border-color);
  --field-padding: var(--text-field-padding);
  --field-padding-top: var(--text-field-padding-top);
  --field-padding-bottom: var(--text-field-padding-bottom);
  --field-padding-left: var(--text-field-padding-left);
  --field-padding-right: var(--text-field-padding-right);
}
:host([error=true]) .field{
  --s-color-primary: var(--s-color-error, #BA1A1A);
  --field-border-color: var(--s-color-error, #BA1A1A);
  --field-border-width: 2px;
}
:host([type=multiline]) .label{
  height: fit-content;
  padding-top: var(--text-field-padding-top);
  padding-bottom: var(--text-field-padding-bottom);
}
.view{
  flex-grow: 1;
  padding: 0;
  flex-direction: column;
  position: relative;
}
input,
textarea{
  border: none;
  height: 100%;
  width: 100%;
  padding-left: var(--field-padding-left);
  padding-right: var(--field-padding-right);
  background: none;
  outline: none;
  font-size: inherit;
  color: inherit;
  box-sizing: border-box;
  line-height: inherit;
  font-family: inherit;
  caret-color: var(--s-color-primary, #006782);
  display: block;
  -moz-appearance: textfield;
}
textarea{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  resize: none;
  scrollbar-width: none;
  display: none;
}
input::placeholder,
textarea::placeholder{
  color: var(--text-field-border-color);
}
input::selection,
textarea::selection{
  background: var(--s-color-primary, #006782);
  color: var(--s-color-on-primary, #ffffff);
}
:host([type=multiline]) input,
.text>.counter{
  display: none;
}
textarea,
.shadow{
  line-height: inherit;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  box-sizing: border-box;
  padding-top: var(--text-field-padding-top);
  padding-bottom: var(--text-field-padding-bottom);
  padding-left: var(--text-field-padding-left);
  padding-right: var(--text-field-padding-right);
}
:host([type=multiline]) :is(textarea, .shadow),
:host([countered=true]) .counter{
  display: block;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button{
  -webkit-appearance: none;
}
input:is(::-ms-clear, ::-ms-reveal){
  display: none;
}
.shadow{
  pointer-events: none;
  display: none;
  opacity: 0;
  width: 100%;
  min-height: 100%;
}
.shadow::after{
  content: ' ';
}
.text{
  display: flex;
  align-items: flex-end;
  width: 100%;
  box-sizing: border-box;
  font-size: .75rem;
  color: var(--text-field-border-color);
}
:host([error=true]) .text{
  color: var(--s-color-error, #BA1A1A);
}
.text>slot[name=text]{
  display: block;
  flex-grow: 1;
}
.text>.counter,
::slotted([slot=text]){
  margin-top: 8px;
}
.toggle{
  flex-direction: column;
}
.toggle,
.toggle>s-ripple{
  display: flex;
  justify-content: center;
  align-items: center;
}
.toggle svg{
  pointer-events: none;
}
.toggle>s-ripple{
  display: none;
}
.toggle>.up,
.toggle>.down{
  height: 16px;
  width: 24px;
  border-radius: 4px;
  margin-right: 8px;
  margin-left: -4px;
}
.toggle>.visibility{
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 4px 0 -4px;
}
.toggle>.visibility>svg{
  display: none;
}
:host([type=number]) .toggle>:is(.up, .down),
:host([type=password]) :is(.toggle>.visibility, .toggle:not(.show-password)>.visibility>.on, .toggle.show-password>.visibility>.off){
  display: flex;
}
svg,
::slotted(svg){
  fill: var(--s-color-on-surface-variant, #40484C);
  height: 24px;
  width: 24px;
  flex-shrink: 0;
}
::slotted(s-icon-button[slot=start]){
  margin-left: 4px;
  margin-right: calc(var(--text-field-border-radius) - var(--text-field-padding-left) + 4px);
}
::slotted(s-icon-button[slot=end]){
  margin-right: 4px;
  margin-left: calc(var(--text-field-border-radius) - var(--text-field-padding-right) + 4px);
}
::slotted(:is(s-icon[slot=start], svg[slot=start])){
  margin-left: 12px;
  margin-right: calc(var(--text-field-border-radius) - var(--text-field-padding-left) + 8px);
}
::slotted(:is(s-icon[slot=end], svg[slot=end])){
  margin-right: 12px;
  margin-left: calc(var(--text-field-border-radius) - var(--text-field-padding-right) + 8px);
}
`,Ui=`
<s-field class="field" fixed="false">
  <div slot="label" class="label"></div>
  <div class="view">
    <div class="shadow"></div>
    <input type="text" part="input">
    <textarea part="textarea"></textarea>
  </div>
  <slot slot="start" name="start"></slot>
  <slot slot="end" name="end">
    <div class="toggle" part="toggle">
      <s-ripple class="up">
        <svg viewBox="0 -960 960 960">
          <path d="m280-400 200-200 200 200H280Z"></path>
        </svg>
      </s-ripple>
      <s-ripple class="down">
        <svg viewBox="0 -960 960 960">
          <path d="M480-360 280-560h400L480-360Z"></path>
        </svg>
      </s-ripple>
      <s-ripple class="visibility">
        <svg viewBox="0 -960 960 960" class="on">
          <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"></path>
        </svg>
        <svg viewBox="0 -960 960 960" class="off">
          <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"></path>
        </svg>
      </s-ripple>
    </div>
  </slot>
</s-field>
<div class="text" part="text">
  <slot name="text"></slot>
  <div class="counter" part="counter"></div>
</div>
`;(class extends W({style:Hi,template:Ui,props:Vi,setup(e){let t=e.querySelector(`.field`),n=e.querySelector(`.label`),r=e.querySelector(`.shadow`),i=e.querySelector(`.counter`),a=e.querySelector(`.toggle`),o={input:e.querySelector(`input`),textarea:e.querySelector(`textarea`)},s=()=>this.type===`multiline`?o.textarea:o.input,c=()=>{this.countered&&(i.textContent=`${s().value.length}/${this.maxLength}`)},l=()=>this.dispatchEvent(new Event(`change`)),u=()=>{t.fixed=!0,t.focused=!0},d=()=>{t.focused=!1,s().value===``&&!this.error&&(t.fixed=!1)};o.input.oninput=c,o.input.onfocus=u,o.input.onblur=d,o.input.onchange=l,o.textarea.onfocus=u,o.textarea.onblur=d,o.textarea.onchange=l,o.textarea.oninput=()=>{r.textContent=o.textarea.value,c()};let f=e=>{this.value=`${parseInt(this.value||`0`)+e}`,this.dispatchEvent(new Event(`input`)),this.dispatchEvent(new Event(`change`))};return e.querySelector(`.up`).onclick=()=>f(1),e.querySelector(`.down`).onclick=()=>f(-1),e.querySelector(`.visibility`).onclick=()=>{o.input.type=a.classList.contains(`show-password`)?`password`:`text`,a.classList.toggle(`show-password`)},{expose:{get native(){return s()}},label:e=>n.textContent=e,type:(e,t)=>{o.input.type=e===`password`?a.classList.contains(`show-password`)?`text`:`password`:e,e===`multiline`&&(o.textarea.value=o.input.value,r.textContent=o.input.value),t===`multiline`&&(o.input.value=o.textarea.value)},error:e=>{if(e)return t.fixed=!0;s().value===``&&(t.fixed=!1)},value:{get:()=>s().value,set:e=>{o.input.value=e,o.textarea.value=e,r.textContent=e,c(),this.error||(t.fixed=e!==``)}},placeholder:e=>{o.input.placeholder=e,o.textarea.placeholder=e},readOnly:e=>{o.input.readOnly=e,o.textarea.readOnly=e},disabled:e=>{o.input.disabled=e,o.textarea.disabled=e},maxLength:e=>{o.input.maxLength=e,o.textarea.maxLength=e,c()},multiLine:e=>this.type=e?`multiline`:`text`,countered:c}}}){}).define(Bi);var Wi=`s-tooltip`,Gi=U({align:[`top`,`bottom`,`left`,`right`],disabled:!1}),Ki=`
:host{
  display: inline-flex;
  vertical-align: middle;
  text-align: left;
}
.popup{
  position: fixed;
  display: none;
  inset: 0;
  margin: 0;
  width: fit-content;
  height: fit-content;
  background: none;
  border: none;
  outline: none;
  max-width: none;
  max-height: none;
  font-size: .875rem;
  font-weight: 400;
  padding: 6px 8px;
  border-radius: 4px;
  white-space: nowrap;
  filter: opacity(.88);
  background: var(--s-color-inverse-surface, #2E3132);
  color: var(--s-color-inverse-on-surface, #EFF1F3);
}
::slotted(img){
  display: block;
  border-radius: 4px;
  margin: 2px 0;
  max-width: 280px;
}
`,qi=`
<slot name="trigger" part="trigger"></slot>
<div class="popup" popover="manual" part="popup">
  <slot></slot>
</div>
`;(class extends W({style:Ki,template:qi,props:Gi,setup(e){let t=e.querySelector(`slot[name=trigger]`),n=e.querySelector(`.popup`),r=getComputedStyle(this),i=!1,a=()=>({easing:r.getPropertyValue(`--s-motion-easing-standard`)||`cubic-bezier(0.2, 0, 0, 1.0)`,duration:G(r.getPropertyValue(`--s-motion-duration-medium4`)||`400ms`)}),o=()=>{if(!this.isConnected||this.disabled)return;if(n.style.display=`block`,i=!0,n.showPopover)n.showPopover();else{let t=qr(e);n.style.marginLeft=`${-t.left}px`,n.style.marginTop=`${-t.top}px`,n.style.zIndex=`3`}let t=this.getBoundingClientRect(),r=n.offsetWidth,o=n.offsetHeight,s={top:0,left:0},c={middle(e){s.left=t.left-(r-t.width)/2;let n=()=>(s.top=t.top+t.height+4,s.top+o>innerHeight),i=()=>(s.top=t.top-o-4,s.top<0);s.left<0&&(s.left=t.left),s.left+r>innerWidth&&(s.left=t.left+t.width-r),e===`top`&&i()&&n(),e===`bottom`&&n()&&i()},left(){return s.left=t.left-r-4,s.top=t.top-(o-t.height)/2,s.left<0},right(){return s.left=t.left+t.width+4,s.top=t.top-(o-t.height)/2,s.left+r>innerWidth}};switch(this.align){case`bottom`:case`top`:c.middle(this.align);break;case`left`:c.left()&&c.right();break;case`right`:c.right()&&c.left();break}n.style.top=`${s.top}px`,n.style.left=`${s.left}px`,n.animate({opacity:[0,1]},a())},s=0,c=()=>{clearTimeout(s),i=!1,n.animate({opacity:[1,0]},a()).finished.then(()=>{i||(n.hidePopover&&n.hidePopover(),n.style.removeProperty(`display`))})};t.addEventListener(`touchstart`,()=>{K.pointerFine.matches||(clearTimeout(s),s=setTimeout(()=>o(),600))},{passive:!0}),t.ontouchend=()=>{clearTimeout(s),c()},t.onmouseenter=()=>K.pointerFine.matches&&o(),t.onmouseleave=()=>K.pointerFine.matches&&c()}}){}).define(Wi);var Q=A({currentUser:null,isLoading:!1}),Ji={subscribers:{},on(e,t){return this.subscribers[e]||(this.subscribers[e]=[]),this.subscribers[e].push(t),()=>this.off(e,t)},off(e,t){this.subscribers[e]&&(this.subscribers[e]=this.subscribers[e].filter(e=>e!==t))},emit(e,t){this.subscribers[e]&&this.subscribers[e].forEach(e=>e(t))}},Yi=E(()=>d.getAccessToken()&&!d.isGuest);async function Xi(){if(!Yi.value)return Q.currentUser=null,Ji.emit(`user:updated`,null),null;Q.isLoading=!0;try{let e=await $zhihu.get(`https://api.zhihu.com/me`);return Q.currentUser=e,Ji.emit(`user:updated`,e),e}catch(e){return console.error(`Failed to refresh user data:`,e),Q.currentUser=null,Ji.emit(`user:error`,e),null}finally{Q.isLoading=!1}}function Zi(){Q.currentUser=null,Ji.emit(`user:reset`)}function Qi(e){let t=g(!1);return{refresh:async(...n)=>{t.value=!0;try{return await e(...n)}catch(e){throw console.error(`Data refresh failed:`,e),e}finally{t.value=!1}},isRefreshing:t}}function $i(){let{refresh:e,isRefreshing:t}=Qi(Xi);return{currentUser:E(()=>Q.currentUser),isLoading:E(()=>Q.isLoading),isLoggedIn:Yi,isRefreshing:t,refreshUser:e,resetUser:Zi,onUserUpdate:e=>Ji.on(`user:updated`,e)}}var ea={key:0},ta={style:{width:`100%`,"max-width":`none`,margin:`0`,height:`100%`,border:`none`}},na=[`checked`,`onClick`],ra={key:1,mode:`rail`,style:{height:`100%`,border:`none`,"background-color":`transparent`}},ia=[`selected`,`onClick`],aa={slot:`text`},oa={slot:`end`,class:`rail-footer`},sa=L({__name:`AdaptiveNavigation`,props:{onLogout:{type:Function,default:()=>{}},onMoreClick:{type:Function,default:()=>{}}},setup(e){let t=e,n=B(),r=V(),i=g(!1),{refreshUser:a}=$i(),o=async()=>{if(await a(),i.value){let e=document.querySelector(`s-drawer`);e&&(e.showed=!1)}},s=()=>{typeof window<`u`&&(i.value=window.innerWidth<768)};z(()=>{s(),window.addEventListener(`resize`,s)}),D(()=>{window.removeEventListener(`resize`,s)});let c=[{id:`home`,label:`主页`,icon:`home`,path:`/`},{id:`following`,label:`关注`,icon:`group`,path:`/following`},{id:`collections`,label:`收藏`,icon:`bookmark`,path:`/collections`},{id:`daily`,label:`日报`,icon:`newspaper`,path:`/daily`},{id:`history`,label:`历史`,icon:`history`,path:`/history`},{id:`refresh`,label:`刷新`,icon:`refresh`,action:o},{id:`settings`,label:`设置`,icon:`settings`,path:`/settings`}],l=e=>{if(e.action)e.action();else if(e.path&&(n.push(e.path),i.value)){let e=document.querySelector(`s-drawer`);e&&(e.showed=!1)}},u=()=>{if(t.onMoreClick(),i.value){let e=document.querySelector(`s-drawer`);e&&(e.showed=!1)}},d=e=>e?!!(e===`/`&&r.path===`/`||e!==`/`&&r.path.startsWith(e)):!1;return(t,n)=>i.value?(R(),j(`s-scroll-view`,ea,[P(`s-menu`,ta,[(R(),j(N,null,_(c,e=>P(`s-menu-item`,{key:e.id,checked:d(e.path),onClick:t=>l(e)},[M(H,{slot:`start`,icon:e.icon},null,8,[`icon`]),F(` `+w(e.label),1)],8,na)),64)),n[5]||=P(`s-divider`,null,null,-1),P(`s-menu-item`,{onClick:u},[M(H,{slot:`start`,icon:`menu`}),n[3]||=F(` 更多 `,-1)]),P(`s-menu-item`,{onClick:n[0]||=(...t)=>e.onLogout&&e.onLogout(...t)},[M(H,{slot:`start`,icon:`logout`}),n[4]||=F(` 退出登录 `,-1)])])])):(R(),j(`s-navigation`,ra,[n[6]||=P(`s-avatar`,{class:`logo-box`},`Z`,-1),(R(),j(N,null,_(c,e=>P(`s-navigation-item`,{key:e.id,selected:d(e.path),onClick:t=>l(e)},[M(H,{slot:`icon`,icon:e.icon,fill:d(e.path)},null,8,[`icon`,`fill`]),P(`div`,aa,w(e.label),1)],8,ia)),64)),P(`div`,oa,[P(`s-icon-button`,{onClick:n[1]||=(...t)=>e.onMoreClick&&e.onMoreClick(...t),type:`standard`},[M(H,{icon:`menu`})]),P(`s-icon-button`,{type:`outlined`,onClick:n[2]||=(...t)=>e.onLogout&&e.onLogout(...t)},[M(H,{icon:`logout`})])])]))}},[[`__scopeId`,`data-v-1d39a618`]]),ca=[`showed`],la={slot:`headline`},ua={slot:`text`},da={key:0,class:`captcha-container`},fa=[`src`],pa=[`disabled`],ma={key:0,class:`error-message`},ha={key:1,class:`login-form`},ga={key:1,class:`code-input-group`},_a=[`disabled`],va={key:2,class:`error-message`},ya=[`disabled`],ba=L({__name:`LoginDialog`,props:{modelValue:Boolean},emits:[`update:modelValue`,`login-success`],setup(e,{emit:o}){let c=e,l=o,f=g(`password`),m=g(`login`),h=g(``),_=g(``),v=g(``),b=g(``),x=g(!1),C=g(``),T=g(0),E=g(!1),k=g(null),A=g(``),N=g(null),ee=g(!1),I=e=>{let t=(e?.cookie||``).match(/capsion_ticket=([^;\s]+)/);return t?decodeURIComponent(t[1]):null},L=e=>{C.value=e},te=()=>{C.value=``},z=()=>{c.modelValue&&(ee.value=!0,l(`update:modelValue`,!1))},B=()=>{m.value=`login`,h.value=``,_.value=``,v.value=``,b.value=``,C.value=``,E.value=!1,k.value=null,A.value=``,N.value&&(clearInterval(N.value),N.value=null,T.value=0)},V=async()=>{try{b.value=``,te();let e=await u(),t=I(e);return k.value=t,e.show_captcha?t?(A.value=await p(t),E.value=!0,{canProceed:!1}):(L(`验证码服务异常，请稍后重试`),{canProceed:!1}):{canProceed:!0}}catch(e){return console.error(`Check captcha failed:`,e),L(`验证码服务异常，请稍后重试`),{canProceed:!1}}},ne=async()=>{if(!b.value){L(`请输入验证码`);return}if(!k.value){L(`验证码无效，请刷新重试`);return}try{x.value=!0,te(),await i(b.value,k.value),E.value=!1,A.value=``,m.value===`send-sms`?await se():await ie()}catch{L(`验证码错误，请重试`),k.value&&(A.value=await p(k.value))}finally{x.value=!1}},re=e=>/^1[3-9]\d{9}$/.test(e),ie=async()=>{try{x.value=!0,te();let e;if(e=f.value===`password`?await s(h.value,_.value,k.value):await n(h.value,v.value,k.value),e?.error){L(e.error.message||`登录失败`);return}t(d.getLoginData()),l(`login-success`),z()}catch(e){console.error(`Login failed:`,e),L(e.message||`登录失败，请重试`)}finally{x.value=!1}},ae=async()=>{if(!h.value)return L(`请输入手机号`);if(!re(h.value))return L(`手机号格式不正确`);if(f.value===`password`&&!_.value)return L(`请输入密码`);if(f.value===`code`&&m.value===`login`&&!v.value)return L(`请输入验证码`);let{canProceed:e}=await V();e&&await ie()},oe=()=>{N.value&&clearInterval(N.value),T.value=60,N.value=setInterval(()=>{T.value--,T.value<=0&&(clearInterval(N.value),N.value=null)},1e3)},se=async()=>{try{x.value=!0,te(),v.value=``,await r(h.value,k.value),oe()}catch(e){console.error(`Send SMS failed:`,e),L(`发送验证码失败`)}finally{x.value=!1,m.value=`login`}},ce=async()=>{if(T.value>0)return;if(!h.value)return L(`请输入手机号`);if(!re(h.value))return L(`手机号格式不正确`);m.value=`send-sms`;let{canProceed:e}=await V();e&&await se()},le=()=>{f.value=f.value===`password`?`code`:`password`,C.value=``},U=e=>{if(!ee.value){e.preventDefault();return}ee.value=!1},ue=()=>{z()},de=()=>{B(),ee.value=!1};return y(v,e=>{e.length>4&&(v.value=e.slice(0,6))}),y(b,e=>{e.length>4&&(b.value=e.slice(0,4))}),D(()=>{N.value&&=(clearInterval(N.value),null)}),(t,n)=>(R(),j(`s-dialog`,{ref:`dialogRef`,showed:e.modelValue,onClose:U,onClosed:de},[P(`div`,la,w(E.value?`验证`:`登录`),1),P(`div`,ua,[E.value?(R(),j(`div`,da,[P(`img`,{src:A.value,class:`captcha-image`,alt:`验证码`},null,8,fa),S(P(`s-text-field`,{"onUpdate:modelValue":n[0]||=e=>b.value=e,label:`请输入图中验证码`,class:`input-field`,disabled:!k.value},null,8,pa),[[a,b.value]]),k.value?O(``,!0):(R(),j(`div`,ma,[M(H,{icon:`error`,size:16}),n[5]||=F(` 验证码加载失败，请重试 `,-1)]))])):(R(),j(`div`,ha,[S(P(`s-text-field`,{"onUpdate:modelValue":n[1]||=e=>h.value=e,label:`手机号`,type:`tel`,inputmode:`numeric`,class:`input-field`},null,512),[[a,h.value]]),f.value===`password`?S((R(),j(`s-text-field`,{key:0,"onUpdate:modelValue":n[2]||=e=>_.value=e,label:`密码`,type:`password`,class:`input-field`},null,512)),[[a,_.value]]):(R(),j(`div`,ga,[S(P(`s-text-field`,{"onUpdate:modelValue":n[3]||=e=>v.value=e,label:`验证码`,inputmode:`numeric`,class:`input-field code-field`},null,512),[[a,v.value]]),P(`s-button`,{type:`outlined`,onClick:ce,disabled:T.value>0||x.value,class:`send-code-btn`},w(T.value>0?`${T.value}s`:`发送验证码`),9,_a)])),P(`s-button`,{type:`text`,onClick:le,class:`switch-btn`},w(f.value===`password`?`验证码登录`:`密码登录`),1)])),C.value&&!E.value?(R(),j(`div`,va,[M(H,{icon:`error`,size:16}),F(` `+w(C.value),1)])):O(``,!0)]),P(`s-button`,{slot:`action`,type:`text`,onClick:ue},`取消`),P(`s-button`,{slot:`action`,type:`text`,onClick:n[4]||=e=>E.value?ne():ae(),disabled:x.value},w(x.value?`处理中...`:E.value?`确认`:`登录`),9,ya)],40,ca))}},[[`__scopeId`,`data-v-6333a41e`]]),xa={style:{width:`100%`,"z-index":`0`}},Sa={slot:`action`,class:`action-container`},Ca={class:`desktop-only`},wa={class:`tablet-only`},Ta=[`src`],Ea={key:0},Da=L({__name:`TopBar`,setup(e){let t=B(),n=g(!1),r=()=>{let e=document.querySelector(`s-drawer`);e&&typeof e.toggle==`function`&&e.toggle()},i=()=>{t.push(`/search`)},a=()=>{s.value||(n.value=!0)},{currentUser:o,isLoggedIn:s,isRefreshing:c,refreshUser:l,onUserUpdate:u}=$i(),d=null;z(()=>{l(),d=u(e=>{console.log(`User data updated in TopBar:`,e)})}),D(()=>{d&&d()});let f=()=>{n.value=!1,l()};return(e,t)=>(R(),j(N,null,[P(`s-appbar`,xa,[P(`s-icon-button`,{slot:`navigation`,onClick:r},[M(H,{icon:`menu`})]),t[1]||=P(`div`,{slot:`headline`,class:`headline`},` Zyphron `,-1),P(`s-search`,{slot:`search`,placeholder:`搜索关键字...`,readonly:``,onClick:i,style:{cursor:`pointer`}}),P(`div`,Sa,[P(`s-icon-button`,Ca,[M(H,{icon:`notifications`})]),P(`s-icon-button`,wa,[M(H,{icon:`chat_bubble`})]),P(`s-avatar`,{src:x(o)?.avatar_url,class:`avatar`,onClick:a},[x(s)?O(``,!0):(R(),j(`span`,Ea,`游客`))],8,Ta)])]),M(ba,{modelValue:n.value,"onUpdate:modelValue":t[0]||=e=>n.value=e,onLoginSuccess:f},null,8,[`modelValue`])],64))}},[[`__scopeId`,`data-v-f2890e42`]]),Oa={key:0,class:`more-menu`},ka={__name:`MoreMenuDialog`,props:[`isOpen`,`onClose`],setup(e){return(t,n)=>e.isOpen?(R(),j(`div`,Oa,`More Menu`)):O(``,!0)}},Aa={theme:`auto`,class:`app-page`},ja={class:`app-drawer`},Ma={class:`main-content`},Na={key:0},Pa={class:`view-container`},Fa=L({__name:`App`,setup(e){let t=B(),n=V(),{resetUser:r,refreshUser:i}=$i(),a=g(!1),o=g(!1),s=()=>{typeof window<`u`&&(o.value=window.innerWidth<768)};z(async()=>{s(),window.addEventListener(`resize`,s)}),D(()=>{window.removeEventListener(`resize`,s)});let c=()=>{window.confirm(`确定要退出登录吗？`)&&h().then(()=>{r(),i(),t.push(`/`)})},l=()=>{a.value=!1},u=E(()=>{let e=n.path;return e.startsWith(`/article/`)||e.startsWith(`/question/`)||e.startsWith(`/user/`)||e.startsWith(`/topic/`)||e===`/search`});return(e,t)=>(R(),j(`s-page`,Aa,[P(`s-drawer`,ja,[P(`div`,{slot:`start`,style:T({width:o.value?`280px`:`auto`})},[M(sa,{onLogout:c,onMoreClick:()=>a.value=!0},null,8,[`onMoreClick`])],4),P(`div`,Ma,[u.value?O(``,!0):(R(),j(`div`,Na,[M(Da)])),P(`div`,Pa,[M(x(ie),null,{default:v(({Component:e,route:t})=>[(R(),I(ee,null,[t.meta.keepAlive?(R(),I(C(e),{key:t.path})):O(``,!0)],1024)),t.meta.keepAlive?O(``,!0):(R(),I(C(e),{key:t.path}))]),_:1})])])]),M(ka,{isOpen:a.value,onClose:l},null,8,[`isOpen`])]))}},[[`__scopeId`,`data-v-ec3b7b2b`]]),Ia={key:0},La=[`href`],Ra={key:2,class:`styled-bold`},za={key:3,class:`styled-italic`},Ba={key:4,class:`styled-highlight`},Va=L({__name:`RenderStyledText`,props:{text:{type:String,required:!0},marks:{type:Array,default:()=>[]}},setup(t){let n=t,r=E(()=>{if(!n.marks||n.marks.length===0)return[{type:`text`,content:n.text}];let e=[...n.marks].sort((e,t)=>e.start_index-t.start_index),t=[],r=0;return e.forEach(e=>{e.start_index>r&&t.push({type:`text`,content:n.text.substring(r,e.start_index)});let i=n.text.substring(e.start_index,e.end_index);t.push({type:`mark`,markType:e.type,content:i,link:e.link}),r=e.end_index}),r<n.text.length&&t.push({type:`text`,content:n.text.substring(r)}),t});return(t,n)=>(R(),j(`span`,null,[(R(!0),j(N,null,_(r.value,(t,r)=>(R(),j(N,{key:r},[t.type===`text`?(R(),j(`span`,Ia,w(t.content),1)):t.markType===`link`&&t.link?(R(),j(`a`,{key:1,href:t.link.href,target:`_blank`,class:`styled-link`,onClick:n[0]||=e(()=>{},[`stop`])},w(t.content),9,La)):t.markType===`bold`?(R(),j(`strong`,Ra,w(t.content),1)):t.markType===`italic`?(R(),j(`em`,za,w(t.content),1)):(R(),j(`span`,Ba,w(t.content),1))],64))),128))]))}},[[`__scopeId`,`data-v-2b03d9cd`]]),Ha={class:`content-renderer`},Ua={key:0,class:`paragraph`},Wa=[`id`],Ga={key:2,class:`blockquote-wrapper`},Ka={class:`quote-icon`},qa={class:`blockquote`},Ja={key:3,class:`code-block`},Ya={class:`code-content`},Xa={key:5,class:`image-figure`},Za=[`src`,`alt`],Qa={key:0,class:`image-caption`},$a=[`href`],eo={class:`card-content`},to={class:`card-title`},no={class:`card-desc`},ro={class:`card-meta`},io=[`src`],ao={key:7,class:`video-container`},oo=[`src`,`poster`],so={key:8,class:`app-tip`},co={class:`tip-icon`},lo={key:9,class:`hr-divider`},uo=L({__name:`ContentRenderer`,props:{segments:{type:Array,default:()=>[]}},setup(e){let t=e=>{if(!e.card)return{};try{let t=e.card.extra_info?JSON.parse(e.card.extra_info):{};return{title:e.card.title,desc:t.desc||t.description||``,url:t.url||`#`,cover:e.card.cover}}catch{return{title:e.card.title,desc:``,url:`#`}}};return(n,r)=>(R(),j(`div`,Ha,[(R(!0),j(N,null,_(e.segments,(e,n)=>(R(),j(N,{key:n},[e.type===`paragraph`?(R(),j(`p`,Ua,[M(Va,{text:e.paragraph.text,marks:e.paragraph.marks},null,8,[`text`,`marks`])])):e.type===`heading`?(R(),j(`h3`,{key:1,id:`heading-${n}`,class:`heading`},w(e.heading.text),9,Wa)):e.type===`blockquote`?(R(),j(`div`,Ga,[P(`div`,Ka,[M(H,{icon:`format_quote`,size:24,fill:``})]),P(`blockquote`,qa,[M(Va,{text:e.blockquote.text,marks:e.blockquote.marks},null,8,[`text`,`marks`])])])):e.type===`code_block`?(R(),j(`div`,Ja,[P(`pre`,Ya,[P(`code`,null,w(e.code_block.content),1)])])):e.type===`list_node`?(R(),I(C(e.list_node.ordered?`ol`:`ul`),{key:4,class:b([`list-node`,{ordered:e.list_node.ordered}])},{default:v(()=>[(R(!0),j(N,null,_(e.list_node.items,(e,t)=>(R(),j(`li`,{key:t,class:`list-item`},[M(Va,{text:e.text,marks:e.marks},null,8,[`text`,`marks`])]))),128))]),_:2},1032,[`class`])):e.type===`image`?(R(),j(`figure`,Xa,[P(`img`,{src:e.image.urls?.[0],alt:e.image.description||`Article Image`,class:`article-image`,loading:`lazy`},null,8,Za),e.image.description?(R(),j(`figcaption`,Qa,w(e.image.description),1)):O(``,!0)])):e.type===`card`?(R(),j(`a`,{key:6,href:t(e).url,target:`_blank`,rel:`noopener`,class:`link-card group`},[P(`div`,eo,[P(`h4`,to,w(t(e).title),1),P(`p`,no,w(t(e).desc),1),P(`div`,ro,[M(H,{icon:`open_in_new`,size:12}),r[0]||=P(`span`,null,`Link Card`,-1)])]),t(e).cover?(R(),j(`img`,{key:0,src:t(e).cover,class:`card-cover`},null,8,io)):O(``,!0)],8,$a)):e.type===`video`?(R(),j(`div`,ao,[P(`video`,{controls:``,class:`video-player`,src:e.video.url,poster:e.video.poster},` Your browser does not support the video tag. `,8,oo)])):e.type===`myapptip`?(R(),j(`div`,so,[P(`div`,co,[M(H,{icon:`info`,size:20})]),P(`div`,null,w(e.myapptip.text),1)])):e.type===`hr`?(R(),j(`hr`,lo)):O(``,!0)],64))),128))]))}},[[`__scopeId`,`data-v-5194f69e`]]),fo=[`showed`],po={class:`comments-container`},mo={class:`header`},ho={key:0,class:`header-left`},go={class:`title`},_o={key:1,class:`header-left`},vo={class:`title`},yo={class:`scroll-view`},bo={key:0,class:`replies-view`},xo={class:`comment-item main-comment`},So=[`src`],Co={class:`comment-content`},wo={class:`comment-header`},To={class:`username`},Eo={class:`timestamp`},Do={class:`text`},Oo={class:`comments-list replies-container`},ko=[`src`],Ao={class:`comment-content`},jo={class:`comment-header`},Mo={class:`user-info`},No={class:`username`},Po={key:0,class:`reply-badge`},Fo={class:`timestamp`},Io={class:`text`},Lo={class:`actions`},Ro=[`onClick`],zo=[`onClick`],Bo={key:0,class:`loading-spinner`},Vo={key:1},Ho={key:0,class:`loading-state`},Uo={key:1,class:`error-state`},Wo={key:2,class:`empty-state`},Go={key:3,class:`comments-list`},Ko=[`src`],qo={class:`comment-content`},Jo={class:`comment-header`},Yo={class:`user-info`},Xo={class:`username`},Zo={key:0,class:`location-badge`},Qo={class:`timestamp`},$o={class:`text`},es={class:`actions`},ts=[`onClick`],ns=[`onClick`],rs={key:0,class:`replies-toggle`},is=[`onClick`],as={key:0,class:`text-center mt-4`},os=[`disabled`],ss={key:0,class:`loading-spinner mr-2`},cs={class:`footer`},ls={key:0,class:`reply-context`},us=[`label`],ds={type:`filled`,class:`send-btn`,slot:`end`},fs=L({__name:`CommentsSheet`,props:{modelValue:Boolean,resourceType:{type:String,required:!0},resourceId:{type:[String,Number],required:!0}},emits:[`update:modelValue`,`reply`,`like`],setup(e,{emit:t}){let n=e,r=t,i=g([]),o=g(0),s=g(null),c=g(!1),u=g(null),d=g(null),f=g(``),p=g(null),m=g(!1),h=e=>{let t=e.replies_count||e.child_comment_count||0;return{id:e.id,author_name:e.author?.member?.name||`匿名用户`,author_avatar:e.author?.member?.avatar_url,ip_location:e.address_text||null,content:e.content,like_count:e.vote_count||0,created_time:new Date(e.created_time*1e3).toLocaleDateString(),replies_count:t,reply_to_author:e.reply_to_author?.member?.name||null,child_result:null,child_comments:[],child_comments_loading:!1}},v=e=>e===`p`?`articles`:e===`answer`?`answers`:e,b=async(e=!1)=>{if(!c.value){c.value=!0,u.value=null;try{let t;if(e&&s.value)t=await s.value.next();else{let e=`https://api.zhihu.com/${v(n.resourceType)}/${n.resourceId}/comments?limit=20&order=normal`;t=await l.get(e)}if(!t){c.value=!1;return}let r=t.data.map(h);e?i.value.push(...r):(i.value=r,o.value=t.paging?.totals||t.data.length),s.value=t}catch(e){console.error(`Failed to load comments:`,e),u.value=`评论加载失败`}finally{c.value=!1}}},x=async e=>{p.value=e,e.replies_count>0&&(m.value=!0,await T(e),m.value=!1)},C=()=>{p.value&&(p.value.child_comments=[]),p.value=null},T=async(e,t=!1)=>{if(!e.child_comments_loading){e.child_comments_loading=!0;try{let n;if(t&&e.child_result)n=await e.child_result.next();else{let t=`https://api.zhihu.com/comments/${e.id}/replies?limit=20`;n=await l.get(t),n.data.length>0&&n.data[0].id==e.id&&(n.data=n.data.slice(1))}if(!n){e.child_comments_loading=!1;return}let r=n.data.map(h);t?e.child_comments.push(...r):e.child_comments=r,e.child_result=n}catch(e){console.error(`Failed to load child comments:`,e)}finally{e.child_comments_loading=!1}}},E=()=>{r(`update:modelValue`,!1)},D=e=>{d.value=e.author_name},k=()=>{d.value=null,f.value=``};return y(()=>n.modelValue,e=>{e&&(i.value=[],o.value=0,s.value=null,u.value=null,p.value=null,d.value=null,f.value=``,n.resourceType&&n.resourceId&&b())}),(t,n)=>(R(),j(`s-dialog`,{showed:e.modelValue,onClose:E},[n[7]||=P(`div`,{slot:`trigger`,style:{display:`none`}},null,-1),P(`div`,po,[P(`div`,mo,[p.value?(R(),j(`div`,ho,[P(`s-icon-button`,{onClick:C},[M(H,{icon:`arrow_back`})]),P(`span`,go,`评论回复 (`+w(p.value.replies_count)+`)`,1)])):(R(),j(`div`,_o,[P(`span`,vo,w(o.value)+` 条评论`,1)])),P(`s-icon-button`,{onClick:E},[M(H,{icon:`close`})])]),P(`s-scroll-view`,yo,[p.value?(R(),j(`div`,bo,[P(`div`,xo,[P(`img`,{src:p.value.author_avatar,class:`avatar`,onerror:`this.src='https://placehold.co/40x40/6366f1/ffffff?text=U'`},null,8,So),P(`div`,Co,[P(`div`,wo,[P(`span`,To,w(p.value.author_name),1),P(`span`,Eo,w(p.value.created_time),1)]),P(`p`,Do,w(p.value.content),1)])]),n[4]||=P(`div`,{class:`replies-label`},`全部回复`,-1),P(`div`,Oo,[(R(!0),j(N,null,_(p.value.child_comments,e=>(R(),j(`div`,{key:e.id,class:`comment-item`},[P(`img`,{src:e.author_avatar,class:`avatar small`,onerror:`this.src='https://placehold.co/30x30/6366f1/ffffff?text=U'`},null,8,ko),P(`div`,Ao,[P(`div`,jo,[P(`div`,Mo,[P(`span`,No,w(e.author_name),1),e.reply_to_author?(R(),j(`span`,Po,[M(H,{icon:`arrow_right`,size:14}),F(` `+w(e.reply_to_author),1)])):O(``,!0)]),P(`span`,Fo,w(e.created_time),1)]),P(`p`,Io,w(e.content),1),P(`div`,Lo,[P(`button`,{class:`action-btn`,onClick:t=>r(`like`,e.id)},[M(H,{icon:`thumb_up`,size:16}),F(` `+w(e.like_count),1)],8,Ro),P(`button`,{class:`action-btn`,onClick:t=>D(e)},[M(H,{icon:`chat_bubble`,size:16}),n[3]||=F(` 回复 `,-1)],8,zo)])])]))),128)),p.value.child_result?.paging?.next?(R(),j(`button`,{key:0,class:`load-more-btn`,onClick:n[0]||=e=>T(p.value,!0)},[p.value.child_comments_loading?(R(),j(`span`,Bo,[M(H,{icon:`progress_activity`,size:16,class:`spin`})])):O(``,!0),F(` `+w(p.value.child_comments_loading?`正在加载...`:`加载更多回复...`),1)])):O(``,!0)])])):(R(),j(`div`,Vo,[c.value&&i.value.length===0?(R(),j(`div`,Ho,[M(H,{icon:`progress_activity`,size:24,class:`spin primary-color`}),n[5]||=F(` 正在加载评论... `,-1)])):u.value?(R(),j(`div`,Uo,[M(H,{icon:`error`,size:24}),F(` `+w(u.value),1)])):i.value.length===0?(R(),j(`div`,Wo,` 暂无评论，快来抢沙发吧~ `)):(R(),j(`div`,Go,[(R(!0),j(N,null,_(i.value,e=>(R(),j(`div`,{key:e.id,class:`comment-item`},[P(`img`,{src:e.author_avatar,class:`avatar`,onerror:`this.src='https://placehold.co/40x40/6366f1/ffffff?text=U'`},null,8,Ko),P(`div`,qo,[P(`div`,Jo,[P(`div`,Yo,[P(`span`,Xo,w(e.author_name),1),e.ip_location?(R(),j(`span`,Zo,[M(H,{icon:`location_on`,size:14}),F(` `+w(e.ip_location),1)])):O(``,!0)]),P(`span`,Qo,w(e.created_time),1)]),P(`p`,$o,w(e.content),1),P(`div`,es,[P(`button`,{class:`action-btn`,onClick:t=>r(`like`,e.id)},[M(H,{icon:`thumb_up`,size:16}),F(` `+w(e.like_count),1)],8,ts),P(`button`,{class:`action-btn`,onClick:t=>D(e)},[M(H,{icon:`chat_bubble`,size:16}),n[6]||=F(` 回复 `,-1)],8,ns)]),e.replies_count>0?(R(),j(`div`,rs,[P(`button`,{class:`toggle-btn`,onClick:t=>x(e)},[F(` 查看全部 `+w(e.replies_count)+` 条回复 `,1),M(H,{icon:`chevron_right`,size:16})],8,is)])):O(``,!0)])]))),128)),s.value?.paging?.next?(R(),j(`div`,as,[P(`button`,{class:`load-more-btn`,disabled:c.value,onClick:n[1]||=e=>b(!0)},[c.value?(R(),j(`span`,ss,[M(H,{icon:`progress_activity`,size:16,class:`spin`})])):O(``,!0),F(` `+w(c.value?`正在加载更多评论...`:`加载更多评论`),1)],8,os)])):O(``,!0)]))]))]),P(`div`,cs,[d.value?(R(),j(`div`,ls,[P(`span`,null,`回复: @`+w(d.value),1),P(`button`,{onClick:k,class:`close-reply`},[M(H,{icon:`close`,size:16})])])):O(``,!0),S(P(`s-text-field`,{label:d.value?`回复 ${d.value}...`:`友善评论，精彩互动...`,"onUpdate:modelValue":n[2]||=e=>f.value=e,class:`input-field`},[P(`s-icon-button`,ds,[M(H,{icon:`send`,size:18})])],8,us),[[a,f.value]])])])],40,fo))}},[[`__scopeId`,`data-v-b337231f`]]),ps={class:`article-detail`},ms={key:0,class:`loading-container`},hs={class:`top-bar glass`},gs={class:`left-actions`},_s={class:`article-title`},vs={class:`right-actions`},ys={key:0,class:`toc-popover glass`},bs={class:`toc-list`},xs=[`onClick`],Ss={class:`main-scroll`},Cs={key:0,class:`hero-image-container`},ws=[`src`],Ts={class:`content-wrapper`},Es=[`src`],Ds={class:`card-info`},Os={class:`card-name`},ks={key:0,class:`toc-card`},As=[`onClick`],js={key:1,class:`image-gallery`},Ms=[`value`],Ns={class:`bottom-float-container`},Ps={class:`float-bar glass`},Fs={class:`action-group`},Is={class:`action-count`},Ls={class:`action-count`},Rs=L({__name:`ArticleDetail`,setup(e){let t=V(),n=B(),r=g(null),i=g(!0),o=g(!1),s=g(!1),c=g([]),l=g(!1);g(null);let u=g([]),d=g(0),{type:f,id:p}=t.params,m=E(()=>c.value.length<=3||l.value?c.value:c.value.slice(0,3)),h=async()=>{i.value=!0;try{let e=f===`p`?`article`:f,t=await $zhihu.get(`https://api.zhihu.com/${e}s/v2/${p}`),n=t.structured_content?.segments?[...t.structured_content.segments]:[];t.relationship_tips&&n.unshift({type:`myapptip`,myapptip:{text:t.relationship_tips.text}}),t.video&&n.unshift({type:`video`,video:{id:t.video.attachment_id,title:t.video.title}});let i=`未知`,a=t.content_end_info;a&&(i=a.update_time_text||a.create_time_text||`未知`,a.ip_info&&(i+=` · ${a.ip_info}`)),n.push({type:`myapptip`,myapptip:{text:i}});let o={id:t.id,title:t.header?.text||`无标题`,author:t.author?.fullname||`匿名用户`,authorId:t.author?.id,avatarUrl:t.author.avatar?.avatar_image?.day||``,imageUrl:t.image_url||t.title_image||``,structured_content:n,content:t.content||``,metrics:{votes:t.reaction.statistics.up_vote_count||0,comments:t.reaction.statistics.comment_count||0}};f===`p`&&(c.value=v(n)),t.image_list?.images&&(u.value=t.image_list.images),r.value=o}catch(e){console.error(`Failed to fetch article`,e)}finally{i.value=!1}},v=e=>{let t=[];return e.forEach((e,n)=>{e.type===`heading`&&e.heading?.text&&t.push({id:`heading-${n}`,text:e.heading.text})}),t},y=e=>e?e>1e3?`${(e/1e3).toFixed(1)}k`:e:0,b=e=>{s.value=!1,te(()=>{let t=document.getElementById(e);t&&t.scrollIntoView({behavior:`smooth`,block:`start`})})};return z(()=>{p&&h()}),(e,t)=>(R(),j(`div`,ps,[i.value?(R(),j(`div`,ms,[...t[6]||=[P(`s-circular-progress`,{indeterminate:`true`},null,-1)]])):r.value?(R(),j(N,{key:1},[P(`div`,hs,[P(`div`,gs,[P(`s-icon-button`,{onClick:t[0]||=e=>x(n).back()},[M(H,{icon:`arrow_back`})]),P(`span`,_s,w(r.value.title),1)]),P(`div`,vs,[P(`s-icon-button`,null,[M(H,{icon:`more_horiz`})])])]),s.value?(R(),j(`s-card`,ys,[t[7]||=P(`div`,{class:`toc-title`},`目录`,-1),P(`s-scroll-view`,bs,[(R(!0),j(N,null,_(c.value,e=>(R(),j(`div`,{key:e.id,class:`toc-item`,onClick:t=>b(e.id)},w(e.text),9,xs))),128))])])):O(``,!0),P(`s-scroll-view`,Ss,[r.value.imageUrl?(R(),j(`div`,Cs,[P(`img`,{src:r.value.imageUrl,class:`hero-image`},null,8,ws),t[8]||=P(`div`,{class:`hero-gradient`},null,-1)])):O(``,!0),P(`div`,Ts,[P(`s-card`,{clickable:`true`,onClick:t[1]||=e=>x(n).push(`/user/${r.value.authorId}`),class:`author-card`},[P(`img`,{src:r.value.avatarUrl,class:`card-avatar`},null,8,Es),P(`div`,Ds,[P(`div`,Os,w(r.value.author),1),t[9]||=P(`div`,{class:`card-desc`},`知乎用户`,-1)])]),c.value.length>0?(R(),j(`s-card`,ks,[t[10]||=P(`div`,{class:`toc-header`},`目录`,-1),(R(!0),j(N,null,_(m.value,e=>(R(),j(`div`,{key:e.id,class:`toc-link`,onClick:t=>b(e.id)},w(e.text),9,As))),128)),c.value.length>3?(R(),j(`div`,{key:0,class:`toc-toggle`,onClick:t[2]||=e=>l.value=!l.value},[P(`span`,null,w(l.value?`收起`:`展开更多`),1),M(H,{icon:l.value?`expand_less`:`expand_more`,class:`toggle-icon`},null,8,[`icon`])])):O(``,!0)])):O(``,!0),M(uo,{segments:r.value.structured_content},null,8,[`segments`]),u.value.length>0?(R(),j(`div`,js,[S(P(`s-carousel`,{"onUpdate:modelValue":t[3]||=e=>d.value=e},[(R(!0),j(N,null,_(u.value,(e,t)=>(R(),j(`s-carousel-item`,{key:t,value:t,style:T({backgroundImage:`url(${e.url})`,backgroundSize:`contain`,backgroundRepeat:`no-repeat`,backgroundPosition:`center`})},null,12,Ms))),128))],512),[[a,d.value,void 0,{lazy:!0}]])])):O(``,!0)])]),P(`div`,Ns,[P(`div`,Ps,[P(`div`,Fs,[P(`s-icon-button`,null,[M(H,{icon:`thumb_up`,size:20})]),P(`span`,Is,w(y(r.value.metrics.votes)),1)]),t[11]||=P(`div`,{class:`vertical-divider`},null,-1),P(`div`,{class:`action-group`,onClick:t[4]||=e=>o.value=!0},[P(`s-icon-button`,null,[M(H,{icon:`chat_bubble`,size:20})]),P(`span`,Ls,w(y(r.value.metrics.comments)),1)]),t[12]||=P(`div`,{class:`vertical-divider`},null,-1),P(`s-icon-button`,null,[M(H,{icon:`bookmark`,size:20})]),P(`s-icon-button`,null,[M(H,{icon:`share`,size:20})])])]),M(fs,{modelValue:o.value,"onUpdate:modelValue":t[5]||=e=>o.value=e,resourceId:x(p),resourceType:x(f)},null,8,[`modelValue`,`resourceId`,`resourceType`])],64)):O(``,!0)]))}},[[`__scopeId`,`data-v-3b0adbc3`]]),zs={class:`user-profile`},Bs={class:`top-bar glass`},Vs={key:0,class:`top-title`},Hs={class:`main-scroll`},Us={key:0,class:`profile-header`},Ws={class:`info-container`},Gs={class:`avatar-row`},Ks=[`src`],qs={class:`name-row`},Js={class:`name`},Ys={key:0,class:`gender-badge`},Xs={key:0,class:`headline`},Zs={class:`stats-row`},Qs={class:`stat-item`},$s={class:`stat-val`},ec={class:`stat-item`},tc={class:`stat-val`},nc={class:`stat-item`},rc={class:`stat-val`},ic={class:`tabs-container`},ac={class:`content-list`},oc={key:0,class:`loading-state`},sc={key:0,class:`empty-state`},cc=L({__name:`UserProfile`,setup(e){let t=V(),n=B(),r=t.params.id,i=g(null),a=g(!1),o=g(`activities`),s=A({}),c=g([]),u=async()=>{let e={activities:`https://api.zhihu.com/moments/${r}/activities?limit=20`,zvideo:`https://api.zhihu.com/people/${r}/zvideos?offset=0&limit=20`,answer:`https://api.zhihu.com/people/${r}/answers?order_by=created&offset=0&limit=20`,vote:`https://api.zhihu.com/moments/${r}/vote?limit=20`,article:`https://api.zhihu.com/people/${r}/articles?offset=0&limit=20`,column:`https://api.zhihu.com/people/${r}/column-contributions?offset=0&limit=20`,pin:`https://api.zhihu.com/v2/pins/${r}/moments`,question:`https://api.zhihu.com/people/${r}/questions?offset=0&limit=20`};try{let t=await $zhihu.get(`https://api.zhihu.com/people/${r}/profile/tab`),n=(t.data||t).tabs_v3||[],i=[],a=e=>{if(e.name===`全部`||e.key===`all`)return;let t=e.name;e.number>0&&(t+=` ${e.number}`),i.push({key:e.key,title:t,url:e.url})};n.forEach(e=>{e.sub_tab?e.sub_tab.forEach(a):a(e)});let l=[],u=e=>{for(let[t,n]of Object.entries({"/activities":`activities`,"/answers":`answer`,"/articles":`article`,"/zvideos":`zvideo`,"/questions":`question`,"/vote":`vote`,"/pins":`pin`,"/column":`column`}))if(e&&e.includes(t))return n;return`unknown`};i.forEach(t=>{let n=u(t.url),r=t.key;if(r===`share`)return;let i=e[r]||t.url;if(i){let e=r||n;l.push({id:e,label:t.title,url:i,key:r}),s[e]||(s[e]={list:[],page:1,hasMore:!0,loading:!1,url:i})}});let d=l.findIndex(e=>e.id===`activities`);if(d>0){let e=l.splice(d,1)[0];l.unshift(e)}else if(d===-1){let t=e.activities;l.unshift({id:`activities`,label:`动态`,url:t}),s.activities||={list:[],page:1,hasMore:!0,loading:!1,url:t}}c.value=l,l.length>0&&(o.value=l[0].id)}catch(t){console.error(`Fetch tabs failed`,t);let n=[{id:`activities`,label:`动态`,url:e.activities}];n.forEach(e=>{s[e.id]||(s[e.id]={list:[],page:1,hasMore:!0,loading:!1,url:e.url})}),c.value=n,o.value=`activities`}},d=async()=>{a.value=!0;try{let e=await $zhihu.get(`https://api.zhihu.com/people/${r}`);i.value=e.data||e}catch(e){console.error(`Failed to fetch user info`,e)}finally{a.value=!1}},f=async(e,t=!1)=>{let n=s[e];if(!n||n.loading)return;let r=!n.lastResult;if(!(!t&&!n.hasMore&&!r)){n.loading=!0;try{let e;if(t||r){let t=n.url;e=await l.get(t)}else n.lastResult&&(e=await n.lastResult.next());if(!e)n.hasMore=!1;else{n.lastResult=e;let a=e.data||[];n.hasMore=!!e.paging?.next;let o=a.map(e=>{let t=e.target||e;t.column&&(t=t.column);let n=t.type||e.type||`article`;n===`moments_pin`&&(n=`pin`);let r=m.formatTitle(e)||t.title||t.name||t.content?.[0]?.title||`无标题`;return{...e,title:r,excerpt:t.excerpt||t.excerpt_new||t.intro||t.description||``,metrics:{likes:t.voteup_count||t.like_count||0,comments:t.comment_count||t.items_count||0},author:t.author||i.value,type:n,id:t.id}});if(t||r)n.list=o;else{let e=o.filter(e=>!n.list.some(t=>t.id===e.id));n.list=[...n.list,...e]}}}catch(t){console.error(`Failed to fetch content for ${e}`,t),n.hasMore=!1}finally{n.loading=!1}}};z(()=>{d(),u().then(()=>{o.value&&f(o.value)})}),y(o,e=>{e&&f(e)});let p=async()=>{o.value&&await f(o.value,!0)},h=()=>{if(o.value){let e=s[o.value];e&&e.hasMore&&f(o.value,!1)}},b=()=>{n.back()},x=e=>{let t=e.target?.id||e.id,r=e.target?.type||e.type||`article`;r===`question`?n.push(`/question/${t}`):n.push(`/article/${r}/${t}`)};return(e,t)=>(R(),j(`div`,zs,[P(`div`,Bs,[P(`s-icon-button`,{onClick:b},[M(H,{icon:`arrow_back`})]),i.value?(R(),j(`div`,Vs,w(i.value.name),1)):O(``,!0),P(`s-icon-button`,null,[M(H,{icon:`more_vert`})])]),P(`s-scroll-view`,Hs,[M(oe,{onRefresh:p,onLoadMore:h,hasMore:s[o.value]?.hasMore},{default:v(()=>[i.value?(R(),j(`div`,Us,[t[4]||=P(`div`,{class:`cover-image`},null,-1),P(`div`,Ws,[P(`div`,Gs,[P(`img`,{src:i.value.avatar_url,class:`avatar`},null,8,Ks),t[0]||=P(`s-button`,{class:`follow-btn`,type:`filled`},`关注`,-1)]),P(`div`,qs,[P(`h1`,Js,w(i.value.name),1),i.value.gender===-1?O(``,!0):(R(),j(`div`,Ys,[M(H,{icon:i.value.gender===1?`male`:`female`,size:16},null,8,[`icon`])]))]),i.value.headline?(R(),j(`div`,Xs,w(i.value.headline),1)):O(``,!0),P(`div`,Zs,[P(`div`,Qs,[P(`span`,$s,w(i.value.following_count||0),1),t[1]||=P(`span`,{class:`stat-label`},`关注`,-1)]),P(`div`,ec,[P(`span`,tc,w(i.value.follower_count||0),1),t[2]||=P(`span`,{class:`stat-label`},`粉丝`,-1)]),P(`div`,nc,[P(`span`,rc,w(i.value.voteup_count||0),1),t[3]||=P(`span`,{class:`stat-label`},`获赞`,-1)])])])])):O(``,!0),P(`div`,ic,[c.value.length>0?(R(),I(se,{key:0,expanded:``,tabs:c.value,activeId:o.value,onChange:e=>o.value=e},k({_:2},[_(c.value,e=>({name:e.id,fn:v(()=>[P(`div`,ac,[s[e.id]?.loading&&(!s[e.id]?.list||s[e.id].list.length===0)?(R(),j(`div`,oc,[...t[5]||=[P(`s-circular-progress`,{indeterminate:`true`},null,-1)]])):(R(),j(N,{key:1},[s[e.id]?.list.length===0?(R(),j(`div`,sc,` 暂无内容 `)):O(``,!0),(R(!0),j(N,null,_(s[e.id]?.list,(e,t)=>(R(),I(ae,{key:t,item:e,onClick:t=>x(e)},null,8,[`item`,`onClick`]))),128))],64))])])}))]),1032,[`tabs`,`activeId`,`onChange`])):O(``,!0)])]),_:1},8,[`hasMore`])])]))}},[[`__scopeId`,`data-v-5cbd8db0`]]),lc={class:`question-detail`},uc={key:0,class:`loading-state`},dc={class:`top-bar glass`},fc={class:`title-text`},pc={class:`main-scroll`},mc={class:`content-wrapper`},hc={class:`question-header`},gc={class:`max-container`},_c={class:`tags-row`},vc=[`onClick`],yc={class:`tag-text`},bc={class:`author-info`},xc=[`src`],Sc={class:`author-details`},Cc={class:`author-name`},wc={class:`author-bio`},Tc={class:`description-preview`},Ec=[`innerHTML`],Dc={class:`action-bar`},Oc={class:`action-buttons`},kc=[`type`],Ac={slot:`icon`},jc={class:`metrics`},Mc={class:`metric-item`},Nc={class:`metric-item`},Pc={class:`max-container`},Fc={class:`answers-header`},Ic={class:`answers-title`},Lc={class:`sort-option`},Rc={class:`answers-list`},zc=[`onClick`],Bc={class:`answer-author`},Vc=[`src`],Hc={class:`answer-author-name`},Uc={class:`answer-excerpt`},Wc={class:`answer-metrics`},Gc={class:`metric-item primary`},Kc={class:`metric-item`},qc={class:`timestamp`},Jc=[`showed`],Yc=[`innerHTML`],Xc=L({__name:`QuestionDetail`,setup(e){let t=V(),n=B(),r=E(()=>t.params.id),i=g(null),a=g([]),o=g(!0),s=g(!1),c=g(!1),l=e=>e>1e3?`${(e/1e3).toFixed(1)}k`:e,u=async()=>{o.value=!0;try{let e=await window.$zhihu.get(`https://api.zhihu.com/questions/${r.value}`),t=e.data||e;i.value={id:t.id,title:t.title,description:t.detail||t.excerpt||``,tags:(t.topics||[]).slice(0,5).map(e=>({id:e.id,name:e.name})),answerCount:t.answer_count||0,followerCount:t.follower_count||0,author:{name:t.author?.name||`匿名用户`,avatarUrl:t.author?.avatar_url,bio:t.author?.headline||``}};let n=await window.$zhihu.get(`https://api.zhihu.com/questions/${r.value}/answers?limit=20&order=default`),o=n.data||n;a.value=(Array.isArray(o)?o:[]).map(e=>({id:e.id,author:e.author?.name||`匿名用户`,avatarUrl:e.author?.avatar_url,excerpt:e.excerpt||e.content?.substring(0,200)||``,voteCount:e.voteup_count||0,commentCount:e.comment_count||0,timestamp:new Date(e.created_time*1e3).toLocaleDateString()}))}catch(e){console.error(`Failed to fetch question:`,e)}finally{o.value=!1}},d=()=>{n.back()},f=e=>{n.push(`/article/answer/${e.id}`)},p=e=>{n.push(`/topic/${e.id}`)};return z(()=>{u()}),(e,t)=>(R(),j(`div`,lc,[o.value?(R(),j(`div`,uc,[M(H,{icon:`progress_activity`,size:32,class:`spin`})])):i.value?(R(),j(N,{key:1},[P(`div`,dc,[P(`s-icon-button`,{onClick:d},[M(H,{icon:`arrow_back`})]),P(`div`,fc,w(i.value.title),1),P(`s-icon-button`,null,[M(H,{icon:`more_vert`})])]),P(`s-scroll-view`,pc,[P(`div`,mc,[P(`div`,hc,[P(`div`,gc,[P(`div`,_c,[(R(!0),j(N,null,_(i.value.tags,e=>(R(),j(`s-chip`,{key:e.id,class:`tag-chip`,clickable:`true`,onClick:t=>p(e)},[P(`span`,yc,w(e.name),1)],8,vc))),128))]),P(`div`,bc,[P(`img`,{src:i.value.author.avatarUrl,class:`author-avatar`,onerror:`this.src='https://placehold.co/32x32/6366f1/ffffff?text=U'`},null,8,xc),P(`div`,Sc,[P(`span`,Cc,w(i.value.author.name),1),P(`span`,wc,w(i.value.author.bio),1)])]),P(`div`,Tc,[P(`div`,{class:`description-text`,innerHTML:i.value.description},null,8,Ec),i.value.description?(R(),j(`button`,{key:0,onClick:t[0]||=e=>s.value=!0,class:`expand-button`},[t[4]||=F(` 展开阅读全文 `,-1),M(H,{icon:`keyboard_arrow_down`,size:18})])):O(``,!0)]),P(`div`,Dc,[P(`div`,Oc,[P(`s-button`,{type:c.value?`filled-tonal`:`filled`,onClick:t[1]||=e=>c.value=!c.value,class:`action-btn`},[P(`s-icon`,Ac,[M(H,{icon:c.value?`check`:`add`},null,8,[`icon`])]),F(` `+w(c.value?`已关注`:`关注问题`),1)],8,kc)]),P(`div`,jc,[P(`div`,Mc,[M(H,{icon:`star`,size:20}),P(`span`,null,w(l(i.value.followerCount))+` 收藏`,1)]),P(`div`,Nc,[M(H,{icon:`chat_bubble`,size:18}),P(`span`,null,w(i.value.answerCount)+` 评论`,1)])])])])]),t[6]||=P(`s-divider`,null,null,-1),P(`div`,Pc,[P(`div`,Fc,[P(`h2`,Ic,w(i.value.answerCount)+` 个回答`,1),P(`div`,Lc,[t[5]||=P(`span`,null,`默认排序`,-1),M(H,{icon:`sort`,size:16})])]),P(`div`,Rc,[(R(!0),j(N,null,_(a.value,e=>(R(),j(`s-card`,{key:e.id,class:`answer-item`,clickable:`true`,onClick:t=>f(e)},[P(`div`,Bc,[P(`img`,{src:e.avatarUrl,class:`answer-avatar`,onerror:`this.src='https://placehold.co/24x24/6366f1/ffffff?text=U'`},null,8,Vc),P(`span`,Hc,w(e.author),1)]),P(`div`,Uc,[P(`p`,null,w(e.excerpt),1)]),P(`div`,Wc,[P(`div`,Gc,[M(H,{icon:`thumb_up`,size:18,fill:!0}),P(`span`,null,w(l(e.voteCount)),1)]),P(`div`,Kc,[M(H,{icon:`chat_bubble`,size:18}),P(`span`,null,w(l(e.commentCount)),1)]),P(`div`,qc,w(e.timestamp),1)])],8,zc))),128))])])])]),P(`s-dialog`,{showed:s.value,onClose:t[3]||=e=>s.value=!1},[t[7]||=P(`div`,{slot:`headline`},`问题描述`,-1),P(`div`,{slot:`text`,class:`dialog-content`,innerHTML:i.value.description},null,8,Yc),P(`s-button`,{slot:`action`,type:`text`,onClick:t[2]||=e=>s.value=!1},`关闭`)],40,Jc)],64)):O(``,!0)]))}},[[`__scopeId`,`data-v-1d54ba8c`]]),Zc={class:`topic-detail`},Qc={class:`top-bar glass`},$c={class:`title`},el={class:`main-scroll`},tl={key:0},nl={key:0,class:`topic-header`},rl={class:`info-container`},il=[`src`],al={class:`topic-info`},ol={class:`topic-name`},sl={class:`topic-excerpt`},cl={class:`stats`},ll={class:`stat-item`},ul={class:`stat-val`},dl={class:`stat-item`},fl={class:`stat-val`},pl={type:`filled`,class:`follow-btn`},ml={slot:`icon`},hl={class:`tabs-container`},gl={class:`detail-content`},_l={class:`detail-card`},vl={class:`detail-title`},yl={class:`detail-text`},bl={key:0,class:`topic-header`},xl={class:`info-container`},Sl=[`src`],Cl={class:`topic-info`},wl={class:`topic-name`},Tl={class:`topic-excerpt`},El={class:`stats`},Dl={class:`stat-item`},Ol={class:`stat-val`},kl={class:`stat-item`},Al={class:`stat-val`},jl={type:`filled`,class:`follow-btn`},Ml={slot:`icon`},Nl={class:`tabs-container`},Pl={class:`content-list`},Fl={key:0,class:`loading-state`},Il={key:1,class:`empty-state`},Ll={key:2,class:`card-grid`},Rl=L({__name:`TopicDetail`,setup(e){let t=V(),n=B(),r=E(()=>t.params.id),i=g(null),a=g(!1),o=g(`detail`),s=g({detail:{list:[],result:null,hasMore:!0,loading:!1},discussion:{list:[],result:null,hasMore:!0,loading:!1},ideas:{list:[],result:null,hasMore:!0,loading:!1},videos:{list:[],result:null,hasMore:!0,loading:!1},questions:{list:[],result:null,hasMore:!0,loading:!1}}),c=[{id:`detail`,label:`详情`},{id:`discussion`,label:`讨论`},{id:`ideas`,label:`想法`},{id:`videos`,label:`视频`},{id:`questions`,label:`问题`}],l=async()=>{a.value=!0;try{let e=await $zhihu.get(`https://api.zhihu.com/topics/${r.value}`),t=e.data||e;i.value={id:t.id,name:t.name,avatar:t.avatar_url,excerpt:t.excerpt||t.introduction||``,followerCount:t.followers_count||0,questionCount:t.questions_count||0}}catch(e){console.error(`Failed to fetch topic info`,e)}finally{a.value=!1}},u=e=>{let t=e.target||e;return{id:t.id,type:t.type||`article`,title:t.title||t.question?.title||``,excerpt:t.excerpt||t.content?.substring(0,200)||``,author:t.author?.name||`匿名用户`,avatarUrl:t.author?.avatar_url,imageUrl:t.thumbnail||t.image_url,metrics:{votes:t.voteup_count||0,comments:t.comment_count||0},timestamp:t.created_time?new Date(t.created_time*1e3).toLocaleDateString():``}},d=async(e,t=!1)=>{if(e===`detail`)return;let n=s.value[e];if(!n.loading&&!(!t&&!n.hasMore)){n.loading=!0;try{let i,a={discussion:`https://api.zhihu.com/topics/${r.value}/feeds/timeline_activity?limit=20`,ideas:`https://api.zhihu.com/topics/${r.value}/feeds/top_activity?limit=20`,videos:`https://api.zhihu.com/topics/${r.value}/feeds/top_activity?limit=20`,questions:`https://api.zhihu.com/topics/${r.value}/questions?limit=20`};if(i=t||!n.result?await window.$http.get(a[e]):await n.result.next(),!i)n.hasMore=!1;else{n.result=i;let e=i.data||[];n.hasMore=!!i.paging?.next;let r=e.map(u);if(t)n.list=r;else{let e=r.filter(e=>!n.list.some(t=>t.id===e.id));n.list=[...n.list,...e]}}}catch(t){console.error(`Failed to fetch content for ${e}`,t),n.hasMore=!1}finally{n.loading=!1}}},f=()=>{n.back()},p=e=>{e.type===`question`?n.push(`/question/${e.id}`):n.push(`/article/${e.type}/${e.id}`)},m=async()=>{await d(o.value,!0)},h=async()=>{await d(o.value,!1)};return z(()=>{l(),d(`detail`)}),(e,t)=>(R(),j(`div`,Zc,[P(`div`,Qc,[P(`s-icon-button`,{onClick:f},[M(H,{icon:`arrow_back`})]),P(`span`,$c,w(i.value?.name||`话题`),1)]),P(`s-scroll-view`,el,[o.value===`detail`?(R(),j(`div`,tl,[i.value?(R(),j(`div`,nl,[t[3]||=P(`div`,{class:`cover-image`},null,-1),P(`div`,rl,[P(`img`,{src:i.value.avatar,class:`topic-avatar`,onerror:`this.src='https://placehold.co/80x80/6366f1/ffffff?text=T'`},null,8,il),P(`div`,al,[P(`h1`,ol,w(i.value.name),1),P(`p`,sl,w(i.value.excerpt),1),P(`div`,cl,[P(`div`,ll,[P(`span`,ul,w(i.value.followerCount),1),t[0]||=P(`span`,{class:`stat-label`},`关注者`,-1)]),P(`div`,dl,[P(`span`,fl,w(i.value.questionCount),1),t[1]||=P(`span`,{class:`stat-label`},`问题`,-1)])]),P(`s-button`,pl,[P(`s-icon`,ml,[M(H,{icon:`add`})]),t[2]||=F(` 关注话题 `,-1)])])])])):O(``,!0),P(`div`,hl,[M(se,{expanded:``,tabs:c,activeId:o.value,onChange:e=>{o.value=e,e!==`detail`&&!s.value[e].list.length&&d(e)}},{detail:v(()=>[P(`div`,gl,[P(`s-card`,_l,[P(`h3`,vl,w(i.value?.name),1),P(`p`,yl,w(i.value?.excerpt||`暂无简介`),1)])])]),_:1},8,[`activeId`,`onChange`])])])):(R(),I(oe,{key:1,onRefresh:m,onLoadMore:h,hasMore:s.value[o.value]?.hasMore},{default:v(()=>[i.value?(R(),j(`div`,bl,[t[7]||=P(`div`,{class:`cover-image`},null,-1),P(`div`,xl,[P(`img`,{src:i.value.avatar,class:`topic-avatar`,onerror:`this.src='https://placehold.co/80x80/6366f1/ffffff?text=T'`},null,8,Sl),P(`div`,Cl,[P(`h1`,wl,w(i.value.name),1),P(`p`,Tl,w(i.value.excerpt),1),P(`div`,El,[P(`div`,Dl,[P(`span`,Ol,w(i.value.followerCount),1),t[4]||=P(`span`,{class:`stat-label`},`关注者`,-1)]),P(`div`,kl,[P(`span`,Al,w(i.value.questionCount),1),t[5]||=P(`span`,{class:`stat-label`},`问题`,-1)])]),P(`s-button`,jl,[P(`s-icon`,Ml,[M(H,{icon:`add`})]),t[6]||=F(` 关注话题 `,-1)])])])])):O(``,!0),P(`div`,Nl,[M(se,{expanded:``,tabs:c,activeId:o.value,onChange:e=>{o.value=e,e!==`detail`&&!s.value[e].list.length&&d(e)}},k({_:2},[_(c.filter(e=>e.id!==`detail`),e=>({name:e.id,fn:v(()=>[P(`div`,Pl,[s.value[e.id].loading&&s.value[e.id].list.length===0?(R(),j(`div`,Fl,[M(H,{icon:`progress_activity`,size:24,class:`spin`}),t[8]||=F(` 加载中... `,-1)])):s.value[e.id].list.length===0?(R(),j(`div`,Il,` 暂无内容 `)):(R(),j(`div`,Ll,[(R(!0),j(N,null,_(s.value[e.id].list,e=>(R(),j(`div`,{key:e.id,class:`masonry-item`},[M(ae,{item:e,onClick:t=>p(e)},null,8,[`item`,`onClick`])]))),128))]))])])}))]),1032,[`activeId`,`onChange`])])]),_:1},8,[`hasMore`]))])]))}},[[`__scopeId`,`data-v-900102e2`]]),zl=`modulepreload`,Bl=function(e){return`/zhihu_web/`+e},Vl={};const $=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=Bl(t,n),t in Vl)return;Vl[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:zl,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};var Hl=[{path:`/`,component:()=>$(()=>import(`./HomeView-CdWOCCVv.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10])),meta:{keepAlive:!0}},{path:`/following`,component:()=>$(()=>import(`./FollowingView-B0lRyBae.js`),__vite__mapDeps([11,1,3,7,8,9,12])),meta:{keepAlive:!0}},{path:`/collections`,component:()=>$(()=>import(`./CollectionsView-C2PPJi7e.js`),__vite__mapDeps([13,1,4,5,6,7,8,9,14])),meta:{keepAlive:!0}},{path:`/daily`,component:()=>$(()=>import(`./DailyView-pzqlaraE.js`),__vite__mapDeps([15,1,4,5,6,16])),meta:{keepAlive:!0}},{path:`/history`,component:()=>$(()=>import(`./HistoryView-DeIBgy8i.js`),__vite__mapDeps([17,1,4,5,6,18])),meta:{keepAlive:!0}},{path:`/settings`,component:()=>$(()=>import(`./SettingsView-MpyruTgB.js`),__vite__mapDeps([19,1,5,20])),meta:{keepAlive:!0}},{path:`/search`,component:()=>$(()=>import(`./SearchPage-D57ozI7g.js`),__vite__mapDeps([21,1])),meta:{keepAlive:!0}},{path:`/article/:type/:id`,component:Rs},{path:`/user/:id`,component:cc},{path:`/question/:id`,component:Xc},{path:`/topic/:id`,component:Rl}],Ul=ne({history:re(),routes:Hl});await o(),window.$http=l,window.$zhihu=f(),c(Fa).use(Ul).mount(`#app`);
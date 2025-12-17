import{X as e,Y as t,a as n,l as r,x as i}from"./_plugin-vue_export-helper-DKZfpah6.js";var a=`material-symbols-style`,o={__name:`MaterialSymbol`,props:{icon:{type:String,required:!0},family:{type:String,default:`rounded`,validator:e=>[`outlined`,`rounded`,`sharp`].includes(e)},fill:{type:Boolean,default:!1},weight:{type:Number,default:400},grade:{type:Number,default:0},size:{type:[Number,String],default:24},color:{type:String,default:void 0},alignText:{type:Boolean,default:!1}},setup(o){if(typeof document<`u`&&!document.getElementById(a)){let e=document.createElement(`style`);e.id=a,e.innerHTML=`
    @import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    @import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    @import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    
    .material-symbols {
      line-height: 1;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      user-select: none;
    }
  `,document.head.appendChild(e)}let s=o,c=n(()=>({fontFamily:`"${`Material Symbols ${s.family.charAt(0).toUpperCase()+s.family.slice(1)}`}"`,fontWeight:`normal`,fontStyle:`normal`,fontSize:typeof s.size==`number`?`${s.size}px`:s.size,color:s.color,position:s.alignText?`relative`:void 0,top:s.alignText?`0.125em`:void 0,fontVariationSettings:`'FILL' ${s.fill?1:0}, 'wght' ${s.weight}, 'GRAD' ${s.grade}, 'opsz' ${s.size}`}));return(n,a)=>(i(),r(`span`,{class:`material-symbols`,style:t(c.value)},e(o.icon),5))}};export{o as t};
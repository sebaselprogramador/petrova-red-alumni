/* Petrova en 3D para el chatbot.
   No cambia el motor: el personaje SVG sigue existiendo (invisible) y este script copia en 3D
   lo que el motor le pide: estados, gestos, objetos, labios, ojos, parpadeo y rubor.
   Si no hay internet para Three.js o el equipo no soporta WebGL, se queda la Petrova 2D. */
(function(){
const P=document.getElementById("personaje"), esc=document.getElementById("escenario"),
      bocaEl=document.getElementById("boca"), pupilas=document.getElementById("pupilas");
if(!window.THREE||!P||!esc) return;
let render;
try{ render=new THREE.WebGLRenderer({antialias:true, alpha:true}); }catch(e){ return; }
render.setPixelRatio(Math.min(devicePixelRatio,2)); render.shadowMap.enabled=true;
render.domElement.className="alumi3d"; esc.insertBefore(render.domElement,P);
const estilo=document.createElement("style");
estilo.textContent=".con3d #personaje{opacity:0}.alumi3d{position:absolute;inset:0;width:100%!important;height:100%!important;z-index:2;pointer-events:none}";
document.head.appendChild(estilo); document.body.classList.add("con3d");

const escena=new THREE.Scene();
const camara=new THREE.PerspectiveCamera(30,1,.1,100);
function ajustar(){ const w=esc.clientWidth||1, h=esc.clientHeight||1; render.setSize(w,h,false); camara.aspect=w/h;
  // encuadra a Petrova de pies a birrete (con espacio arriba para los emotes); si el escenario es angosto, se aleja para que entren los brazos
  const alto=4.0, ancho=2.9, tan=Math.tan(THREE.MathUtils.degToRad(camara.fov/2));
  const dist=Math.max(alto/(2*tan), ancho/(2*tan*camara.aspect));
  camara.position.set(0,1.85,dist); camara.lookAt(0,1.78,0); camara.updateProjectionMatrix(); }
new ResizeObserver(ajustar).observe(esc); ajustar();

escena.add(new THREE.HemisphereLight(0xffffff,0x553344,.55));
const sol=new THREE.DirectionalLight(0xffffff,.55); sol.position.set(3,6,4); sol.castShadow=true; sol.shadow.mapSize.set(1024,1024); escena.add(sol);

const mat=c=>new THREE.MeshToonMaterial({color:c});
const ROJO=mat(0xc8102e), DORADO=mat(0xf2c14e), PIEL=mat(0xffd9b8), PELO=mat(0x3b2418), NEGRO=mat(0x1d2330), BLANCO=mat(0xffffff), ROSA=mat(0xff8fa3), BOCA=mat(0x8f1d2c), ZAPATO=mat(0x2b3245);
const malla=(g,m,x=0,y=0,z=0)=>{ const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.castShadow=true; return o; };

const piso=new THREE.Mesh(new THREE.CircleGeometry(1.6,48), new THREE.ShadowMaterial({opacity:.18}));
piso.rotation.x=-Math.PI/2; piso.receiveShadow=true; escena.add(piso);

// Cuerpo con toga, estola dorada y zapatos
const alumi=new THREE.Group(); escena.add(alumi);
const cuerpo=new THREE.Group(); alumi.add(cuerpo);
cuerpo.add(malla(new THREE.CylinderGeometry(.42,.82,1.55,32),ROJO,0,.85,0));
cuerpo.add(malla(new THREE.SphereGeometry(.13,16,16),ZAPATO,-.25,.07,.25), malla(new THREE.SphereGeometry(.13,16,16),ZAPATO,.25,.07,.25));
cuerpo.add(malla(new THREE.CylinderGeometry(.13,.15,.25,16),PIEL,0,1.72,0));
const cuelloV=malla(new THREE.ConeGeometry(.2,.35,3),BLANCO,0,1.5,.36); cuelloV.rotation.x=Math.PI; cuelloV.scale.z=.3; cuerpo.add(cuelloV);
[-1,1].forEach(l=>{ const e=malla(new THREE.BoxGeometry(.12,1.35,.04),DORADO,.18*l,.95,.62); e.rotation.x=-.27; e.rotation.z=.08*l; cuerpo.add(e); });

// Brazos con pivote en el hombro; la mano derecha sostiene los objetos
function brazo(lado){ const piv=new THREE.Group(); piv.position.set(.6*lado,1.5,.08);
  piv.add(malla(new THREE.CylinderGeometry(.11,.14,.75,16),ROJO,0,-.36,0), malla(new THREE.SphereGeometry(.12,16,16),PIEL,0,-.78,0));
  cuerpo.add(piv); return piv; }
const brazoI=brazo(-1), brazoD=brazo(1);

// Objeto en la mano: un emoji que siempre mira a la cámara
const lienzo=document.createElement("canvas"); lienzo.width=lienzo.height=256;
const texObjeto=new THREE.CanvasTexture(lienzo);
const objeto=new THREE.Sprite(new THREE.SpriteMaterial({map:texObjeto,transparent:true}));
objeto.scale.set(.75,.75,.75); objeto.position.set(0,-1.05,.1); objeto.visible=false; brazoD.add(objeto);
let emojiActual="";
function ponerObjeto(e){ if(e===emojiActual) return; emojiActual=e; objeto.visible=!!e; if(!e) return;
  const c=lienzo.getContext("2d"); c.clearRect(0,0,256,256); c.font="200px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";
  c.textAlign="center"; c.textBaseline="middle"; c.fillText(e,128,140); texObjeto.needsUpdate=true; }
// Emote sobre la cabeza: el logo de Unifranz (si pones logo-unifranz.png junto al chatbot, usa ese) o un emoji
const lienzoEmote=document.createElement("canvas"); lienzoEmote.width=512; lienzoEmote.height=256;
const texEmote=new THREE.CanvasTexture(lienzoEmote);
const emote=new THREE.Sprite(new THREE.SpriteMaterial({map:texEmote,transparent:true,depthTest:false}));
emote.renderOrder=10; emote.visible=false; alumi.add(emote);
let emoteActual="", logoImg=null;
const imgLogo=new Image(); imgLogo.onload=()=>{ logoImg=imgLogo; if(emoteActual==="logo"){ emoteActual=""; } }; imgLogo.src="logo-unifranz.png";
function dibujarLogo(c){
  if(logoImg){ const r=Math.min(500/logoImg.width,240/logoImg.height), w=logoImg.width*r, h=logoImg.height*r;
    c.fillStyle="#fff"; c.beginPath(); c.roundRect(256-w/2-16,128-h/2-12,w+32,h+24,36); c.fill(); c.drawImage(logoImg,256-w/2,128-h/2,w,h); return; }
  c.fillStyle="#c8102e"; c.beginPath(); c.roundRect(16,40,480,176,44); c.fill();
  c.strokeStyle="#f2c14e"; c.lineWidth=10; c.stroke();
  c.fillStyle="#fff"; c.font="900 104px 'Segoe UI',Arial,sans-serif"; c.textAlign="center"; c.textBaseline="middle"; c.fillText("UNIFRANZ",256,132);
}
function ponerEmote(e){ if(e===emoteActual) return; emoteActual=e; if(!e) return;
  const c=lienzoEmote.getContext("2d"); c.clearRect(0,0,512,256);
  if(e==="logo") dibujarLogo(c);
  else { c.font="200px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(e,256,140); }
  texEmote.needsUpdate=true; }
const EMOJI={cv:"📄",lupa:"🔍",maletin:"💼",trofeo:"🏆",foco:"💡",reloj:"⏰",corazon:"❤️",regalo:"🎁"};

// Cabeza
const cabeza=new THREE.Group(); cabeza.position.set(0,2.32,0); cuerpo.add(cabeza);
cabeza.add(malla(new THREE.SphereGeometry(.62,40,40),PIEL));
const pelo=malla(new THREE.SphereGeometry(.65,40,40,0,Math.PI*2,0,Math.PI*.55),PELO,0,.03,-.04); pelo.rotation.x=-.35; cabeza.add(pelo);
const coleta=new THREE.Group(); coleta.position.set(.35,.15,-.45); coleta.add(malla(new THREE.SphereGeometry(.2,20,20),PELO,0,-.15,-.05), malla(new THREE.SphereGeometry(.07,12,12),ROJO,0,.05,0)); cabeza.add(coleta);
[-1,1].forEach(l=>cabeza.add(malla(new THREE.SphereGeometry(.1,16,16),PIEL,.6*l,-.02,0)));
const ojos=[-1,1].map(l=>{ const g=new THREE.Group(); g.position.set(.22*l,.05,.53);
  const b=malla(new THREE.SphereGeometry(.13,24,24),BLANCO); b.scale.set(1,1.15,.5);
  const p=malla(new THREE.SphereGeometry(.075,20,20),NEGRO,0,-.01,.05); p.scale.z=.5;
  g.add(b,p,malla(new THREE.SphereGeometry(.025,8,8),BLANCO,.03,.04,.09)); cabeza.add(g); return {g,p}; });
const cachetes=[-1,1].map(l=>{ const c=malla(new THREE.SphereGeometry(.09,16,16),ROSA.clone(),.36*l,-.2,.47); c.scale.set(1.3,.6,.4); c.material.transparent=true; c.material.opacity=.5; cabeza.add(c); return c; });
const cejas=[-1,1].map(l=>{ const c=malla(new THREE.BoxGeometry(.2,.035,.03),PELO,.22*l,.27,.57); c.rotation.z=-.12*l; cabeza.add(c); return c; });
// Boca: sonrisa en reposo, sonrisa abierta para vocales abiertas, "O" para o/u
const sonrisa=malla(new THREE.TorusGeometry(.16,.032,12,32,Math.PI),BOCA,0,-.2,.6); sonrisa.rotation.set(.35,0,Math.PI); cabeza.add(sonrisa);
const risa=new THREE.Group(); risa.position.set(0,-.2,.6); risa.rotation.x=.35; cabeza.add(risa);
risa.add(malla(new THREE.CircleGeometry(.17,32,Math.PI,Math.PI),BOCA), malla(new THREE.BoxGeometry(.24,.04,.01),BLANCO,0,-.02,.004),
  malla(new THREE.CircleGeometry(.08,20,0,Math.PI),ROSA,0,-.165,.003));
const bocaO=malla(new THREE.SphereGeometry(.11,24,24),BOCA,0,-.28,.55); cabeza.add(bocaO);

// Birrete con borla
const birrete=new THREE.Group(); birrete.position.set(0,.55,-.02); cabeza.add(birrete);
birrete.add(malla(new THREE.CylinderGeometry(.42,.45,.2,32),NEGRO));
const tabla=malla(new THREE.BoxGeometry(1.15,.05,1.15),NEGRO,0,.12,0); tabla.rotation.y=Math.PI/4; birrete.add(tabla);
const borla=new THREE.Group(); borla.position.set(0,.16,0); birrete.add(borla);
borla.add(malla(new THREE.SphereGeometry(.04,8,8),DORADO));
const hilo=malla(new THREE.CylinderGeometry(.012,.012,.55,6),DORADO,.4,-.1,0); hilo.rotation.z=1.2; borla.add(hilo);
borla.add(malla(new THREE.SphereGeometry(.06,10,10),DORADO,.62,-.3,0));

// Labios: traduce el visema que el motor pone en la boca del SVG a {abrir, oh}
const FORMA={reposo:[0,0],cerrada:[0,0],sonrisa:[.5,0],medio:[.45,0],a:[1,0],e:[.65,0],o:[0,.85],u:[0,.5]};
const visemaDe={}; if(typeof VISEMAS!=="undefined") for(const [k,d] of Object.entries(VISEMAS)) visemaDe[d]=k;

const suave=t=>t<0?0:t>1?1:t*t*(3-2*t);
const ola=(t,f)=>Math.sin(t*Math.PI*2*f);
const entrada=k=>suave(k*5)*(1-suave((k-.8)*5));
const DUR=typeof DURACION!=="undefined"?DURACION:{};

let gestoAct=null, tGesto=0, birreteListo=false;
const reloj=new THREE.Clock(); let parpadeo=2.5;
const B={iX:0,iZ:-.2,dX:0,dZ:.2,cX:0,cY:0,cZ:0}; // pose suavizada de brazos y cabeza

function animar(){
  requestAnimationFrame(animar);
  const dt=Math.min(reloj.getDelta(),.05), t=reloj.elapsedTime; tGesto+=dt;
  const cl=P.classList;
  // gesto que el motor acaba de pedir
  const g=[...cl].find(c=>c.startsWith("g-")); const gn=g?g.slice(2):null;
  if(gn && gn!==gestoAct){ gestoAct=gn; tGesto=0; }
  const d=gestoAct?(DUR[gestoAct]||1500)/1000:0, k=gestoAct?Math.min(1,tGesto/d):0, e=entrada(k);
  if(gestoAct && tGesto>d && !gn) gestoAct=null;

  // pose objetivo
  const T={iX:0,iZ:-.2+ola(t,.3)*.03,dX:0,dZ:.2-ola(t,.3)*.03,cX:0,cY:0,cZ:ola(t,.17)*.05};
  let emoteQuiere=null;
  let abrir=0, oh=0, ojoI=1, ojoD=1, cejaY=0, cejaD=0, rubor=.5, py=0, px=0, pz=0, giroY=ola(t,.12)*.06, inclX=0;
  cuerpo.scale.set(1,1+ola(t,.3)*.012,1);
  // mirada: copia hacia dónde mira el SVG
  const m=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(pupilas.style.transform||""); const mx=m?+m[1]:0, my=m?+m[2]:0;
  let ojoX=mx*.005, ojoY=-.01-my*.005; T.cY=mx*.03; T.cX=my*.02;

  // estados
  const habla=cl.contains("hablando"), enfasis=cl.contains("enfasis");
  if(habla){ const amp=enfasis?1.6:1; T.cZ+=ola(t,1.3)*.05; T.cX+=ola(t,2.1)*.03;
    T.dZ=.35+(.35+ola(t,.45)*.3)*amp; T.dX=-.35-ola(t,.6)*.25*amp; T.iZ=-.25-(.15+ola(t,.35)*.15)*amp; T.iX=-.2-ola(t,.5)*.15*amp; }
  if(cl.contains("pregunta")){ T.cZ+=.16; cejaD=.06; T.dX=-1.1; T.dZ=.55; }
  if(cl.contains("escuchando")){ T.cZ+=.12; inclX=.05; T.iZ=-2.85; T.iX=-.15; cejaY=.03; }
  if(cl.contains("pensando")){ T.dX=-2.2; T.dZ=-.5; T.cZ+=.2; T.cX-=.15; ojoY=.04; ojoX=.03; cejaD=.07; oh=.3; T.iZ=-.35; }
  if(cl.contains("mostrar")){ const p=[...cl].find(c=>c.startsWith("p-")); ponerObjeto(p?EMOJI[p.slice(2)]||"":""); T.dX=-1.25; T.dZ=.3; }
  else if(gestoAct!=="pulgar") ponerObjeto("");
  const feliz=cl.contains("feliz"); if(feliz){ ojoI=ojoD=.2; abrir=.5; }
  if(cl.contains("sonrojo")) rubor=.95;

  // gestos (mandan sobre el estado)
  switch(gestoAct){
    case "saludar": T.dZ=.12+suave(k*4)*2.6-suave((k-.8)*5)*2.6+ola(tGesto,2.2)*.35*(k<.85); T.dX=0; T.cZ+=.12; break;
    case "bailar": px=ola(tGesto,1)*.35; py=Math.abs(ola(tGesto,2))*.25; giroY+=ola(tGesto,.5)*.6;
      T.iZ=-1.2-ola(tGesto,2)*.9; T.dZ=1.2-ola(tGesto,2)*.9; T.iX=T.dX=0; T.cZ+=ola(tGesto,2)*.18; break;
    case "saltar": { const s=Math.sin(k*Math.PI); py=s*.8; T.iZ=-1.6*s; T.dZ=1.6*s; T.iX=T.dX=0; abrir=Math.max(abrir,.6); break; }
    case "girar": giroY+=suave(k)*Math.PI*2; py=Math.sin(k*Math.PI)*.4; abrir=Math.max(abrir,.5); break;
    case "celebrar": py=Math.abs(ola(tGesto,1.6))*.5; T.iZ=-2.6; T.dZ=2.6; T.iX=T.dX=0; abrir=.9; ojoI=ojoD=.15; break;
    case "birrete": { T.dZ=.12+suave(k*3)*2.7-suave((k-.8)*5)*2.7; T.dX=0; const v=Math.sin(Math.min(1,k/.85)*Math.PI);
      birrete.position.y=.55+v*2.6; birrete.rotation.set(v*.6,k*Math.PI*6,0); T.cX=-v*.35; ojoY=.03*v; abrir=.7*v; birreteListo=true; break; }
    case "aplaudir": { const c=Math.abs(ola(tGesto,2.6)); T.dX=T.iX=-1.25*e; T.dZ=(-.42-.24*c)*e; T.iZ=(.42+.24*c)*e; py=c*.05; abrir=.7*e; ojoI=ojoD=1-.8*e; break; }
    case "sorpresa": py=Math.sin(Math.min(1,k*3)*Math.PI)*.2; oh=e; abrir=0; cejaY=.08*e; ojoI=ojoD=1+.3*e; T.dZ=.2+1.1*e; T.iZ=-.2-1.1*e; T.dX=T.iX=0; T.cX-=.1*e; break;
    case "guino": ojoD=1-.88*e; T.cZ-=.2*e; abrir=.3*e; T.dX=-1.3*e; T.dZ=.15; rubor=Math.max(rubor,.5+.3*e); break;
    case "voltereta": { const r=-suave(k)*Math.PI*2, h=1.3, sal=Math.sin(k*Math.PI)*1.1; inclX=r; py=h+sal-h*Math.cos(r); pz=-h*Math.sin(r); T.iZ=-2.4; T.dZ=2.4; T.iX=T.dX=0; abrir=.8; break; }
    case "estirar": T.iZ=-.2-2.7*e; T.dZ=.2+2.7*e; T.iX=T.dX=0; cuerpo.scale.y*=1+.06*e; ojoI=ojoD=1-.88*e; oh=.85*e; abrir=0; T.cX-=.2*e; break;
    case "asentir": T.cX+=ola(tGesto,2.2)*.25*e; break;
    case "asentirMini": T.cX+=ola(tGesto,2.2)*.15*e; break;
    case "corazon": T.dX=T.iX=-1.4*e; T.dZ=-.6*e; T.iZ=.6*e; rubor=.95; abrir=Math.max(abrir,.45*e); ojoI=ojoD=1-.8*e; break;
    case "timida": T.cZ+=.25*e; T.cX+=.18*e; ojoY=-.01-.05*e; rubor=.95; T.dX=T.iX=-.5*e; T.dZ=-.35*e; T.iZ=.35*e; giroY+=ola(tGesto,.7)*.22*e; break;
    case "carcajada": abrir=Math.max(.15,e*(.6+Math.abs(Math.sin(tGesto*14))*.4)); oh=0; ojoI=ojoD=1-.85*e; T.cX-=.25*e;
      py=Math.abs(ola(tGesto,4))*.08*e; T.dX=T.iX=-.9*e; T.dZ=-.5*e; T.iZ=.5*e; break;
    case "reir": abrir=Math.max(.15,e*(.45+Math.abs(Math.sin(tGesto*12))*.35)); oh=0; ojoI=ojoD=1-.8*e; T.cZ+=ola(tGesto,2)*.1*e; py=Math.abs(ola(tGesto,3))*.05*e; break;
    case "encoger": T.dX=T.iX=-.6*e; T.dZ=.75*e; T.iZ=-.75*e; T.cZ+=.15*e; cejaY=.05*e; py=Math.sin(Math.min(1,k*2.5)*Math.PI)*.05; break;
    case "pulgar": T.dX=-1.3*e; T.dZ=.15; T.cZ-=.12*e; abrir=Math.max(abrir,.4*e); ponerObjeto(e>.1?"👍":""); break;
    case "empatia": T.dX=T.iX=-1.0*e; T.dZ=-.55*e; T.iZ=.55*e; T.cZ+=.2*e; ojoI=ojoD=1-.35*e; cejaY=.03*e; rubor=Math.max(rubor,.7); break;
    case "peinar": T.dX=-.4*e; T.dZ=(2.55+ola(tGesto,1.5)*.15)*e; T.cZ-=.15*e; ojoI=ojoD=1-.6*e; abrir=Math.max(abrir,.3*e); break;
    case "tararear": T.cZ+=ola(tGesto,.9)*.15*e; giroY+=ola(tGesto,.45)*.15*e; ojoI=ojoD=1-.85*e; oh=(.3+Math.abs(ola(tGesto,2))*.2)*e; abrir=0; T.iZ=-.35-ola(tGesto,.9)*.15; T.dZ=.35-ola(tGesto,.9)*.15; break;
    case "mirar": T.cY=Math.sin(k*Math.PI*2)*.6*e; ojoX=Math.sin(k*Math.PI*2)*.04*e; T.dX=-2.6*e; T.dZ=-.3*e; break;
    case "reloj": T.iX=-1.3*e; T.iZ=.5*e; T.cX+=.25*e; T.cY-=.3*e; ojoY=-.05*e; ojoX=-.03*e; cejaY=.04*e; break;
    case "senalar": T.dX=-.4*e; T.dZ=(1.45+ola(tGesto,2)*.08)*e; T.cY+=.4*e; ojoX=.04*e; abrir=Math.max(abrir,.35*e); break;
    case "rascar": T.dX=-.3*e; T.dZ=(2.5+ola(tGesto,4)*.12)*e; T.cZ-=.15*e; cejaD=.06*e; ojoY=.04*e; oh=Math.max(oh,.3*e); break;
    case "estrella": { const s=Math.sin(k*Math.PI); py=s*.7; T.iZ=-2.3*s; T.dZ=2.3*s; T.iX=T.dX=0; cuerpo.scale.x=1+.08*s; abrir=.8; break; }
    // ¡Unifranz! sube las dos manos y aparece el logo sobre su cabeza
    case "unifranz": T.iZ=-(2.55+ola(tGesto,1.6)*.12)*e; T.dZ=(2.55+ola(tGesto,1.6)*.12)*e; T.iX=T.dX=-.15*e;
      py=Math.abs(ola(tGesto,1.6))*.12*e; abrir=Math.max(abrir,.85*e); oh=0; ojoI=ojoD=1-.8*e; T.cX-=.12*e; emoteQuiere=["logo",e]; break;
    case "idea": T.dX=-.3*e; T.dZ=(2.2+ola(tGesto,2)*.1)*e; T.cZ-=.1*e; cejaY=.06*e; ojoY=.04*e; abrir=Math.max(abrir,.45*e); emoteQuiere=["💡",e]; break;
    case "fuerza": T.dX=-.2*e; T.dZ=(2.75+Math.abs(ola(tGesto,2.4))*.2)*e; T.iZ=-.2-.3*e; py=Math.abs(ola(tGesto,2.4))*.06*e; cejaY=-.03*e; abrir=Math.max(abrir,.6*e); emoteQuiere=["💪",e]; break;
    case "abrazo": { const c=suave((k-.35)*4); T.dX=T.iX=-1.05*e; T.dZ=(1.15-1.7*c)*e; T.iZ=(-1.15+1.7*c)*e; ojoI=ojoD=1-.85*c; rubor=.95; abrir=Math.max(abrir,.5*e);
      giroY+=ola(tGesto,.8)*.12*c; emoteQuiere=["🤗",e]; break; }
  }
  // emote: aparece con un rebote y se va encogiendo
  if(emoteQuiere){ ponerEmote(emoteQuiere[0]); const v=emoteQuiere[1], rebote=1+.18*Math.sin(Math.min(1,k*3)*Math.PI);
    const ancho=emoteQuiere[0]==="logo"?1.2:.62, alto=emoteQuiere[0]==="logo"?.6:.62;
    emote.visible=v>.03; emote.scale.set(ancho*v*rebote,alto*v*rebote,1); emote.position.set(0,3.28+.06*v+Math.sin(t*3)*.03,.3); }
  else emote.visible=false;
  if(gestoAct!=="birrete" && birreteListo){ birrete.position.y=.55; birrete.rotation.set(0,0,0); birreteListo=false; }

  // pose suavizada (los gestos rápidos siguen siendo rápidos, pero sin saltos entre estados)
  const f=1-Math.exp(-dt*14);
  for(const c in B) B[c]+=(T[c]-B[c])*f;
  brazoI.rotation.set(B.iX,0,B.iZ); brazoD.rotation.set(B.dX,0,B.dZ); cabeza.rotation.set(B.cX,B.cY,B.cZ);
  alumi.position.set(px,py,pz); alumi.rotation.set(inclX,giroY,0);
  coleta.rotation.z=ola(t,.4)*.15+(habla?ola(t,1.3)*.08:0); borla.rotation.z=ola(t,.5)*.12;
  ojos.forEach(o=>{ o.p.position.x=ojoX; o.p.position.y=ojoY; });

  // labios: el visema del motor manda mientras habla
  const vis=visemaDe[bocaEl.getAttribute("d")]||"reposo";
  if(habla || vis!=="reposo"){ const [a,o]=FORMA[vis]||[0,0]; if(a||o||habla){ abrir=a; oh=o; } }
  // una sola boca a la vez: la forma que más se abre manda y la otra desaparece al instante
  if(oh>abrir){ abrir=0; risa.scale.y=.001; } else if(abrir>0){ oh=0; bocaO.scale.set(.001,.001,.4); }
  risa.scale.y+=(Math.max(.001,abrir)-risa.scale.y)*.45; risa.visible=risa.scale.y>.06;
  const ohS=bocaO.scale.y/1.05; const ohN=ohS+(oh-ohS)*.45;
  bocaO.scale.set(.75*ohN+.001,1.05*ohN+.001,.4); bocaO.visible=ohN>.05;
  sonrisa.visible=!risa.visible&&!bocaO.visible;

  // parpadeo (el del motor y uno propio por si acaso), cejas y rubor
  parpadeo-=dt; if(parpadeo<0) parpadeo=2.5+Math.random()*3;
  const cerrado=cl.contains("parpadeo")||parpadeo<.1;
  ojos[0].g.scale.y=cerrado?.1:ojoI; ojos[1].g.scale.y=cerrado?.1:ojoD;
  cejas[0].position.y=.27+cejaY; cejas[1].position.y=.27+cejaY+cejaD;
  cachetes.forEach(c=>c.material.opacity+=(rubor-c.material.opacity)*.12);
  render.render(escena,camara);
}
animar();
window.alumi3d={escena,camara,alumi};
})();

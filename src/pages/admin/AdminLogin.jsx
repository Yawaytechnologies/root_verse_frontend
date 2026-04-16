// src/modules/admin/pages/AdminLoginPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginAdminThunk, isSessionValid, clearSession } from "../../redux/action/adminLoginActions";
import { initFromStorage, logout, selectAuthLoading, selectAuthError, selectIsAuthenticated } from "../../redux/reducer/adminLoginSlice";

// ─── Constants ───────────────────────────────────────────────────────────────

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";

const FISH_COLORS = [
  { body: "0,200,180",  fin: "0,160,150"  },
  { body: "80,200,220", fin: "40,160,180" },
  { body: "0,180,160",  fin: "0,140,130"  },
  { body: "100,220,200",fin: "60,180,165" },
];

const SEAWEEDS = [
  { x:"3%",  h:120, p: 12, c:"rgba(0,150,100,0.7)",  d:0   },
  { x:"8%",  h: 90, p: -8, c:"rgba(0,120,80,0.6)",   d:0.4 },
  { x:"13%", h:140, p: 15, c:"rgba(0,170,110,0.65)", d:0.8 },
  { x:"83%", h:115, p: 12, c:"rgba(0,160,100,0.65)", d:0.6 },
  { x:"88%", h: 85, p: -8, c:"rgba(0,130,85,0.55)",  d:1   },
  { x:"93%", h:150, p: 14, c:"rgba(0,170,105,0.7)",  d:0.3 },
];

const VESSELS = [
  { x:"5%",  y:"6%",  sc:0.85, op:0.22 },
  { x:"73%", y:"4%",  sc:0.55, op:0.15 },
  { x:"41%", y:"3.5%",sc:0.4,  op:0.10 },
];

const HUD = {
  left: [
    { l:"SPECIES",  v:"L. vannamei",   a:"rgba(0,210,170," },
    { l:"POND ID",  v:"PD-TN-0042",    a:"rgba(0,200,180," },
    { l:"DO LEVEL", v:"7.2 mg/L",      a:"rgba(0,190,220," },
    { l:"SALINITY", v:"15.3 ppt",      a:"rgba(0,200,180," },
    { l:"TEMP",     v:"28.4°C",        a:"rgba(80,210,200,"},
  ],
  right: [
    { l:"VESSEL ID", v:"VES-KA-1187",   a:"rgba(0,200,220," },
    { l:"BATCH",     v:"BTH-2026-0391", a:"rgba(0,210,190," },
    { l:"COC",       v:"VERIFIED ✓",    a:"rgba(0,220,160," },
    { l:"GS1 GLN",   v:"8904289001024", a:"rgba(60,200,210,"},
    { l:"GDST",      v:"COMPLIANT",     a:"rgba(0,215,185," },
  ],
  bl: [
    { l:"AQUA NODES",   v:"142 ACTIVE", a:"rgba(0,200,180," },
    { l:"WILD CAPTURE", v:"Zone 57-W",  a:"rgba(0,190,200," },
  ],
  br: [
    { l:"HARVEST LOT", v:"HL-2026-1104",   a:"rgba(0,200,180," },
    { l:"CHAIN EPOCH", v:"2026.Q2.#4891",  a:"rgba(0,215,190," },
  ],
};

const FEATURES = [
  { icon:"🚢", title:"Wild Capture",         desc:"Vessel tracking, catch zones & landing site management." },
  { icon:"🌊", title:"Mariculture",          desc:"Seaweed & marine cultivation unit registry."            },
  { icon:"🦐", title:"Aquaculture",          desc:"Land-based ponds, farms & hatchery oversight."          },
  { icon:"⛓",  title:"Participant Registry", desc:"PCCs, processors, transport partners & cold stores."    },
];

// ─── Canvas factories ─────────────────────────────────────────────────────────

const mkBubble = (W, H) => ({
  x: Math.random()*W, y: H + Math.random()*80,
  r: Math.random()*3.5+0.8, speed: Math.random()*0.5+0.2,
  wobble: Math.random()*Math.PI*2, wSpd: Math.random()*0.02+0.01,
  alpha: Math.random()*0.28+0.08,
});

const mkFish = (i, W, H) => {
  const dir = Math.random() > 0.5 ? 1 : -1;
  return {
    x: dir===1 ? -120 : W+120, y: H*(0.25+Math.random()*0.55),
    vx: dir*(Math.random()*0.55+0.3), vy:0,
    len: Math.random()*26+16, dir,
    wag:0, wSpd: Math.random()*0.08+0.04,
    wAmp: Math.random()*0.22+0.1,
    col: FISH_COLORS[i % FISH_COLORS.length],
    alpha: Math.random()*0.32+0.22,
  };
};

const mkJelly = (W, H) => ({
  x: Math.random()*W, y: Math.random()*H*0.65,
  vy: Math.random()*0.14+0.04,
  phase: Math.random()*Math.PI*2, pSpd: Math.random()*0.014+0.007,
  r: Math.random()*20+10, alpha: Math.random()*0.18+0.06,
});

const mkCaustic = (W, H) => ({
  x: Math.random()*W, y: Math.random()*H*0.5,
  r: Math.random()*55+18, phase: Math.random()*Math.PI*2,
  speed: Math.random()*0.011+0.004, alpha: Math.random()*0.055+0.018,
});

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawFish(ctx, f, t) {
  ctx.save();
  ctx.translate(f.x, f.y); ctx.scale(f.dir, 1); ctx.globalAlpha = f.alpha;
  const wag = Math.sin(t*f.wSpd*60+f.wag)*f.wAmp;
  const { len: L, col } = f;
  const g = ctx.createRadialGradient(0,0,0,0,0,L*0.5);
  g.addColorStop(0, `rgba(${col.body},0.9)`); g.addColorStop(1, `rgba(${col.body},0.4)`);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.55,L*0.22,wag*0.3,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-L*0.5,wag*L*0.3); ctx.lineTo(-L*0.85,-L*0.28+wag*L*0.5); ctx.lineTo(-L*0.85,L*0.28+wag*L*0.5); ctx.closePath();
  ctx.fillStyle=`rgba(${col.fin},0.6)`; ctx.fill();
  ctx.beginPath(); ctx.moveTo(L*0.1,-L*0.2); ctx.quadraticCurveTo(0,-L*0.42,-L*0.2,-L*0.18); ctx.closePath();
  ctx.fillStyle=`rgba(${col.fin},0.5)`; ctx.fill();
  ctx.beginPath(); ctx.arc(L*0.32,-L*0.04,L*0.045,0,Math.PI*2); ctx.fillStyle="rgba(200,240,255,0.9)"; ctx.fill();
  ctx.beginPath(); ctx.arc(L*0.33,-L*0.04,L*0.022,0,Math.PI*2); ctx.fillStyle="rgba(0,30,40,0.9)"; ctx.fill();
  ctx.restore();
}

function drawJelly(ctx, j, t) {
  ctx.save(); ctx.translate(j.x, j.y); ctx.globalAlpha = j.alpha;
  const r = j.r*(Math.sin(j.phase+t*j.pSpd*60)*0.2+0.9);
  const g = ctx.createRadialGradient(0,-r*0.2,0,0,0,r);
  g.addColorStop(0,"rgba(150,230,255,0.6)"); g.addColorStop(0.5,"rgba(80,200,230,0.3)"); g.addColorStop(1,"rgba(40,160,200,0.05)");
  ctx.beginPath(); ctx.ellipse(0,0,r,r*0.6,0,Math.PI,0); ctx.fillStyle=g; ctx.fill();
  for (let i=-3;i<=3;i++) {
    const tx=i*r*0.28, wv=Math.sin(t*1.8+i)*8;
    ctx.beginPath(); ctx.moveTo(tx,0); ctx.bezierCurveTo(tx+wv,r*0.6,tx-wv,r*1.2,tx+wv*0.5,r*1.8);
    ctx.strokeStyle="rgba(130,210,240,0.25)"; ctx.lineWidth=0.8; ctx.stroke();
  }
  ctx.restore();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OceanCanvas({ mousePos }) {
  const cvs=useRef(null), st=useRef(null), raf=useRef(null), mp=useRef(mousePos);
  useEffect(() => { mp.current = mousePos; }, [mousePos]);
  useEffect(() => {
    const c=cvs.current, ctx=c.getContext("2d");
    const W=()=>c.width, H=()=>c.height;
    const resize=()=>{ c.width=window.innerWidth; c.height=window.innerHeight; };
    resize(); window.addEventListener("resize",resize);
    st.current={
      bubbles:  Array.from({length:70},  ()=>mkBubble(W(),H())),
      fishes:   Array.from({length:16},  (_,i)=>mkFish(i,W(),H())),
      jellies:  Array.from({length:7},   ()=>mkJelly(W(),H())),
      caustics: Array.from({length:20},  ()=>mkCaustic(W(),H())),
    };
    let t=0;
    const tick=()=>{
      t+=1/60; ctx.clearRect(0,0,W(),H());
      const {bubbles,fishes,jellies,caustics}=st.current;
      const {x:mx,y:my}=mp.current;
      caustics.forEach(c2=>{
        c2.phase+=c2.speed;
        const p=(Math.sin(c2.phase)+1)/2;
        const g=ctx.createRadialGradient(c2.x,c2.y,0,c2.x,c2.y,c2.r*(0.8+p*0.4));
        g.addColorStop(0,`rgba(0,220,200,${c2.alpha*(0.5+p*0.5)})`); g.addColorStop(0.5,`rgba(0,180,210,${c2.alpha*0.3})`); g.addColorStop(1,"rgba(0,150,200,0)");
        ctx.beginPath(); ctx.ellipse(c2.x,c2.y,c2.r*(0.6+Math.sin(c2.phase*1.3)*0.3),c2.r*(0.4+Math.cos(c2.phase*0.9)*0.2),c2.phase*0.2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      });
      jellies.forEach(j=>{ j.y-=j.vy; j.x+=Math.sin(j.phase+t)*0.3; if(j.y<-60){j.y=H()+60;j.x=Math.random()*W();} drawJelly(ctx,j,t); });
      fishes.forEach((f,i)=>{
        const dx=mx-f.x, dy=my-f.y, dist=Math.hypot(dx,dy);
        if(dist<150) f.vy+=(-dy/dist)*0.04;
        f.vy*=0.96; f.x+=f.vx; f.y+=f.vy; f.wag+=f.wSpd;
        if(f.dir===1?f.x>W()+140:f.x<-140) Object.assign(f,mkFish(i,W(),H()));
        drawFish(ctx,f,t);
      });
      bubbles.forEach(b=>{
        b.wobble+=b.wSpd; b.x+=Math.sin(b.wobble)*0.35; b.y-=b.speed;
        if(b.y<-20) Object.assign(b,mkBubble(W(),H()));
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.strokeStyle=`rgba(150,230,255,${b.alpha})`; ctx.lineWidth=0.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x-b.r*0.28,b.y-b.r*0.28,b.r*0.25,0,Math.PI*2); ctx.fillStyle=`rgba(200,245,255,${b.alpha*0.8})`; ctx.fill();
      });
      raf.current=requestAnimationFrame(tick);
    };
    tick();
    return()=>{ window.removeEventListener("resize",resize); cancelAnimationFrame(raf.current); };
  }, []);
  return <canvas ref={cvs} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1}}/>;
}

function Seaweed({ x, h, p, c, d }) {
  return (
    <div style={{position:"absolute",bottom:0,left:x,width:24,height:h,overflow:"visible",zIndex:2}}>
      <svg viewBox="0 0 28 120" style={{width:"100%",height:"100%",transformOrigin:"50% 100%",animation:`sway 3.5s ease-in-out ${d}s infinite`}}>
        {[0,1,2,3,4].map(i=><ellipse key={i} cx={14+(i%2===0?10:-10)} cy={120-i*22} rx={6} ry={9} fill={c} opacity={0.52-i*0.06}/>)}
        <path d={`M14,120 Q${14+p},90 14,70 Q${14-p},50 14,30 Q${14+p},15 14,0`} stroke={c} strokeWidth="1.8" fill="none" opacity="0.4"/>
      </svg>
    </div>
  );
}

function Vessel({ x, y, sc, op }) {
  return (
    <div style={{position:"absolute",left:x,top:y,transform:`scale(${sc})`,transformOrigin:"center bottom",opacity:op,zIndex:3,pointerEvents:"none"}}>
      <svg viewBox="0 0 160 70" width="160" height="70" fill="none">
        <path d="M10 45 Q80 55 150 45 L140 58 Q80 65 20 58 Z" fill="rgba(0,30,45,0.9)"/>
        <rect x="50" y="28" width="40" height="18" rx="2" fill="rgba(0,40,60,0.8)"/>
        <rect x="55" y="31" width="8" height="8" fill="rgba(0,120,150,0.3)"/>
        <rect x="68" y="31" width="8" height="8" fill="rgba(0,120,150,0.3)"/>
        <line x1="75" y1="5" x2="75" y2="28" stroke="rgba(0,80,100,0.7)" strokeWidth="2"/>
        <line x1="75" y1="10" x2="110" y2="20" stroke="rgba(0,80,100,0.5)" strokeWidth="1.5"/>
        {[0,1,2].map(i=><line key={i} x1={90+i*8} y1={12+i*3} x2={90+i*8} y2={22+i*2} stroke="rgba(0,150,180,0.2)" strokeWidth="0.8"/>)}
        <circle cx="75" cy="5" r="3" fill="rgba(0,255,200,0.5)"/>
        <circle cx="75" cy="5" r="6" fill="rgba(0,255,200,0.1)"/>
      </svg>
    </div>
  );
}

function HudChip({ l, v, a, style }) {
  return (
    <div style={{position:"absolute",fontFamily:"'Inter',sans-serif",fontSize:"8px",fontWeight:500,letterSpacing:"0.1em",...style}}>
      <div style={{display:"inline-flex",flexDirection:"column",gap:"1px",border:`1px solid ${a}0.18)`,borderRadius:"3px",padding:"4px 7px",background:"linear-gradient(135deg,rgba(0,15,30,0.7),rgba(0,20,40,0.5))",backdropFilter:"blur(6px)"}}>
        <span style={{color:`${a}0.38)`}}>{l}</span>
        <span style={{color:`${a}0.82)`,fontSize:"10px",fontWeight:600}}>{v}</span>
      </div>
    </div>
  );
}

// ─── Background layers ────────────────────────────────────────────────────────

function OceanBg({ px, py }) {
  return (
    <>
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse 100% 60% at ${50+px*4}% ${60+py*4}%,rgba(0,60,80,0.7) 0%,transparent 55%),radial-gradient(ellipse 80% 50% at ${30+px*2}% 80%,rgba(0,40,60,0.8) 0%,transparent 50%),linear-gradient(180deg,#000810 0%,#001220 25%,#001830 55%,#002035 100%)`,transform:`translate(${px*-6}px,${py*-6}px)`,transition:"transform 0.2s ease-out"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,background:`repeating-linear-gradient(${175+px*3}deg,transparent 0px,transparent 80px,rgba(0,160,180,0.025) 82px,transparent 84px,transparent 140px,rgba(0,200,200,0.02) 143px,transparent 145px)`,transform:`translate(${px*-18}px,${py*-10}px)`,transition:"transform 0.3s ease-out"}}/>
      <div style={{position:"fixed",top:0,left:0,right:0,height:"100px",zIndex:1,background:"linear-gradient(180deg,rgba(0,80,100,0.25) 0%,transparent 100%)"}}/>
      <div style={{position:"fixed",top:0,left:0,right:0,height:"3px",zIndex:2,background:"linear-gradient(90deg,transparent,rgba(0,200,200,0.5),rgba(80,220,200,0.8),rgba(0,200,200,0.5),transparent)",filter:"blur(1px)"}}/>
    </>
  );
}

// ─── HUD overlay ─────────────────────────────────────────────────────────────

function HudOverlay({ px, py }) {
  const s  = (side, i) => ({ [side]: "1.5%", top:    `${12+i*9}%`  });
  const bs = (side, i) => ({ [side]: "1.5%", bottom: `${8+i*6}%`   });
  return (
    <div style={{position:"fixed",inset:0,zIndex:5,pointerEvents:"none",transform:`translate(${px*-22}px,${py*-14}px)`,transition:"transform 0.28s ease-out"}}>
      {HUD.left.map(  (d,i) => <HudChip key={d.l} {...d} style={s("left",   i)} />)}
      {HUD.right.map( (d,i) => <HudChip key={d.l} {...d} style={s("right",  i)} />)}
      {HUD.bl.map(    (d,i) => <HudChip key={d.l} {...d} style={bs("left",  i)} />)}
      {HUD.br.map(    (d,i) => <HudChip key={d.l} {...d} style={bs("right", i)} />)}
    </div>
  );
}

// ─── Brand panel (desktop left) ───────────────────────────────────────────────

function BrandPanel({ px, py }) {
  return (
    <div className="brand-left" style={{flex:"0 0 auto",maxWidth:400,transform:`translate(${px*-14}px,${py*-8}px)`,transition:"transform 0.3s ease-out"}}>

      {/* Logo + brand names */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="rgba(0,200,170,0.6)" strokeWidth="1.2"/>
          <path d="M16,24 Q22,18 30,24 Q22,30 16,24Z" fill="rgba(0,200,170,0.7)"/>
          <path d="M12,24 L10,20 L10,28Z" fill="rgba(0,200,170,0.5)"/>
          <circle cx="27" cy="22" r="1.8" fill="rgba(200,240,255,0.9)"/>
          <path d="M24,4 L24,12 M24,36 L24,44 M4,24 L12,24 M36,24 L44,24" stroke="rgba(0,180,160,0.3)" strokeWidth="0.8"/>
        </svg>
        <div>
          <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:16,letterSpacing:"0.1em",color:"rgba(0,225,185,0.92)"}}>ROOT VERSE</div>
          <div style={{fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:11,letterSpacing:"0.12em",color:"rgba(0,200,170,0.5)"}}>ONE BLUE</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{height:1,background:"linear-gradient(90deg,rgba(0,200,170,0.35),transparent)",margin:"10px 0 18px"}}/>

      {/* Headline */}
      <h1 style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"clamp(24px,3.2vw,40px)",lineHeight:1.08,color:"#ceeaf0",margin:"0 0 10px",letterSpacing:"0.02em",textShadow:"0 0 40px rgba(0,200,200,0.2)"}}>
        ONE BLUE<br/>
        <span style={{WebkitTextStroke:"1px rgba(0,200,180,0.7)",color:"transparent"}}>TRACEABILITY</span>
      </h1>

      <p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:12,color:"rgba(160,215,225,0.5)",margin:"0 0 24px",lineHeight:1.7,maxWidth:360}}>
        End-to-end traceability across wild capture fisheries, mariculture, aquaculture, and the full chain of custody — all managed from a single admin console.
      </p>

      {/* 4 sectors */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {FEATURES.map(({icon,title,desc})=>(
          <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:8,background:"rgba(0,160,140,0.1)",border:"1px solid rgba(0,200,170,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>
              {icon}
            </div>
            <div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,color:"rgba(200,240,235,0.85)",marginBottom:2}}>{title}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:11,color:"rgba(140,195,210,0.45)",lineHeight:1.55}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{marginTop:22,paddingTop:14,borderTop:"1px solid rgba(0,180,160,0.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:9,letterSpacing:"0.06em",color:"rgba(80,150,170,0.3)"}}>© 2026 ROOT VERSE · ONE BLUE</span>
        <span style={{fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:9,letterSpacing:"0.1em",color:"rgba(0,200,170,0.22)"}}>ADMIN USE ONLY</span>
      </div>
    </div>
  );
}

// ─── Login card ───────────────────────────────────────────────────────────────

function LoginCard({ tilt, px, py, form, setForm, focused, setFocused, isLoading, done, onSubmit, authError }) {
  const inp = (field) => ({
    width:"100%", boxSizing:"border-box",
    background:"rgba(0,18,32,0.75)",
    border:`1px solid ${focused===field?"rgba(0,210,180,0.65)":"rgba(0,130,150,0.22)"}`,
    borderRadius:6, padding:"10px 12px",
    fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:13, color:"#c8e8f0",
    outline:"none",
    boxShadow:focused===field?"0 0 16px rgba(0,210,180,0.13),inset 0 0 8px rgba(0,160,180,0.05)":"none",
    transition:"all 0.2s",
  });

  const corners = [
    {top:8,left:8,   borderTop:"1px solid rgba(0,210,180,0.45)",borderLeft:"1px solid rgba(0,210,180,0.45)"},
    {top:8,right:8,  borderTop:"1px solid rgba(0,210,180,0.45)",borderRight:"1px solid rgba(0,210,180,0.45)"},
    {bottom:8,left:8,  borderBottom:"1px solid rgba(0,210,180,0.45)",borderLeft:"1px solid rgba(0,210,180,0.45)"},
    {bottom:8,right:8, borderBottom:"1px solid rgba(0,210,180,0.45)",borderRight:"1px solid rgba(0,210,180,0.45)"},
  ];

  return (
    <div style={{flex:"0 0 auto",width:"100%",maxWidth:390,transform:`perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translate(${px*10}px,${py*10}px)`,transition:"transform 0.14s ease-out",transformStyle:"preserve-3d"}}>
      <div style={{position:"absolute",inset:"-40px",background:"radial-gradient(ellipse at center,rgba(0,160,140,0.16) 0%,transparent 68%)",filter:"blur(22px)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"relative",background:"linear-gradient(145deg,rgba(0,18,30,0.93) 0%,rgba(0,10,20,0.97) 100%)",border:"1px solid rgba(0,170,150,0.22)",borderRadius:"16px",padding:"28px 30px 26px",backdropFilter:"blur(28px)",boxShadow:"0 0 0 1px rgba(0,200,170,0.07),0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(0,220,190,0.12)",overflow:"hidden"}}>

        {corners.map((pos,i)=><div key={i} style={{position:"absolute",width:12,height:12,...pos}}/>)}
        <div style={{position:"absolute",top:0,left:"-100%",right:"-100%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,220,190,0.7),transparent)",animation:"scanLine 4s ease-in-out infinite"}}/>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,100,120,0.08) 0%,transparent 60%)",borderRadius:"inherit"}}/>

        {/* Card header */}
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="rgba(0,210,175,0.7)" strokeWidth="1"/>
              <path d="M6,9 Q8.5,6.5 11.5,9 Q8.5,11.5 6,9Z" fill="rgba(0,210,175,0.65)"/>
              <circle cx="10.2" cy="8" r="1.2" fill="rgba(200,240,255,0.8)"/>
            </svg>
            <span style={{fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.2em",color:"rgba(0,210,175,0.5)"}}>ROOT VERSE · ONE BLUE</span>
          </div>
          <h2 style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:26,letterSpacing:"0.06em",color:"#d5eef4",margin:"0 0 6px",lineHeight:1,textShadow:"0 0 28px rgba(0,180,180,0.2)"}}>
            ADMIN LOGIN
          </h2>
          <p style={{fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:11,color:"rgba(140,200,215,0.45)",margin:0}}>
            Authorized access for Root Verse operations staff.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>

            <div>
              <label style={{display:"block",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.18em",marginBottom:6,transition:"color 0.2s",color:focused==="login_id"?"rgba(0,215,180,0.85)":"rgba(120,190,210,0.42)"}}>
                WORK EMAIL / ADMIN ID
              </label>
              <div style={{position:"relative"}}>
                <input name="login_id" type="text" required value={form.login_id}
                  onChange={e=>setForm(p=>({...p,login_id:e.target.value}))}
                  onFocus={()=>setFocused("login_id")} onBlur={()=>setFocused(null)}
                  placeholder="Email or phone number" style={inp("login_id")}/>
                {focused==="login_id"&&<div style={{position:"absolute",bottom:-1,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,210,180,0.85),transparent)"}}/>}
              </div>
            </div>

            <div>
              <label style={{display:"block",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:9,letterSpacing:"0.18em",marginBottom:6,transition:"color 0.2s",color:focused==="password"?"rgba(0,215,180,0.85)":"rgba(120,190,210,0.42)"}}>
                PASSWORD
              </label>
              <div style={{position:"relative"}}>
                <input name="password" type="password" required value={form.password}
                  onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                  onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
                  placeholder="••••••••••" style={inp("password")}/>
                {focused==="password"&&<div style={{position:"absolute",bottom:-1,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,210,180,0.85),transparent)"}}/>}
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}}>
                <input type="checkbox" style={{width:11,height:11,accentColor:"#00d4b4"}}/>
                <span style={{fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:9,letterSpacing:"0.1em",color:"rgba(110,180,200,0.42)"}}>REMEMBER ME</span>
              </label>
              <button type="button" style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:9,letterSpacing:"0.1em",color:"rgba(0,190,170,0.52)",padding:0}}>
                FORGOT PASSWORD?
              </button>
            </div>

            {authError && (
              <div style={{padding:"8px 12px",borderRadius:6,background:"rgba(180,20,40,0.18)",border:"1px solid rgba(220,50,70,0.35)",fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:9,letterSpacing:"0.06em",color:"rgba(255,120,130,0.9)",lineHeight:1.5}}>
                ⚠ {authError}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              onMouseEnter={e=>{ if(!isLoading) e.currentTarget.style.boxShadow="0 0 42px rgba(0,200,180,0.5),inset 0 1px 0 rgba(255,255,255,0.18)"; }}
              onMouseLeave={e=>{ if(!isLoading) e.currentTarget.style.boxShadow="0 0 26px rgba(0,180,160,0.26),inset 0 1px 0 rgba(255,255,255,0.1)"; }}
              style={{position:"relative",width:"100%",padding:"13px 0",background:done?"linear-gradient(135deg,rgba(0,180,120,0.9),rgba(0,150,100,0.9))":isLoading?"rgba(0,40,50,0.8)":"linear-gradient(135deg,rgba(0,165,145,0.92),rgba(0,135,120,0.9))",border:`1px solid rgba(0,210,180,${isLoading?0.15:0.45})`,borderRadius:7,color:"#d0f5ee",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.22em",cursor:isLoading?"not-allowed":"pointer",overflow:"hidden",transition:"all 0.25s",boxShadow:isLoading?"none":"0 0 26px rgba(0,180,160,0.26),inset 0 1px 0 rgba(255,255,255,0.1)"}}>
              {done ? "ACCESS GRANTED" : isLoading
                ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9}}><span style={{display:"inline-block",animation:"spin 1.2s linear infinite"}}>◎</span>AUTHENTICATING</span>
                : "SIGN IN"}
              {!isLoading&&!done&&<div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",animation:"shimmer 3.5s ease-in-out infinite",pointerEvents:"none"}}/>}
            </button>
          </div>
        </form>

        <p style={{marginTop:16,fontFamily:"'Inter',sans-serif",fontWeight:400,fontSize:9,letterSpacing:"0.05em",color:"rgba(80,150,170,0.28)",lineHeight:1.7,textAlign:"center"}}>
          RESTRICTED — AUTHORIZED ROOT VERSE OPERATIONS STAFF ONLY
        </p>
      </div>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const isAuth    = useSelector(selectIsAuthenticated);

  const [form,    setForm]    = useState({ login_id:"", password:"" });
  const [mouse,   setMouse]   = useState({ x:600, y:400 });
  const [tilt,    setTilt]    = useState({ x:0, y:0 });
  const [focused, setFocused] = useState(null);
  const [done,    setDone]    = useState(false);
  const [ripples, setRipples] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const link = Object.assign(document.createElement("link"), { rel:"stylesheet", href:FONTS_URL });
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    if (isSessionValid()) {
      dispatch(initFromStorage());
    } else {
      clearSession();
      dispatch(logout());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuth) navigate("/admin/hub", { replace: true });
  }, [isAuth, navigate]);

  const handleMouseMove = useCallback((e) => {
    setMouse({ x:e.clientX, y:e.clientY });
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setTilt({ x:((e.clientY-r.top-r.height/2)/(r.height/2))*7, y:-((e.clientX-r.left-r.width/2)/(r.width/2))*7 });
    }
  }, []);

  const handleClick = (e) => {
    const id = Date.now();
    setRipples(p => [...p, { x:e.clientX, y:e.clientY, id }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAdminThunk({ login_id: form.login_id, password: form.password }))
      .then((result) => {
        if (loginAdminThunk.fulfilled.match(result)) setDone(true);
      });
  };

  const px = (mouse.x / window.innerWidth  - 0.5) * 2;
  const py = (mouse.y / window.innerHeight - 0.5) * 2;

  return (
    <div onMouseMove={handleMouseMove} onClick={handleClick}
      style={{height:"100vh",width:"100%",overflow:"hidden",position:"relative",background:"#00080f",fontFamily:"'Inter',sans-serif",cursor:"none",userSelect:"none"}}>

      {/* Sonar cursor */}
      <div style={{position:"fixed",zIndex:9999,pointerEvents:"none",left:mouse.x,top:mouse.y,transform:"translate(-50%,-50%)"}}>
        <svg width="36" height="36" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="15" stroke="rgba(0,220,180,0.5)" strokeWidth="1" fill="none"/>
          <circle cx="20" cy="20" r="7"  stroke="rgba(0,220,180,0.25)" strokeWidth="0.8" fill="none"/>
          <circle cx="20" cy="20" r="2.2" fill="rgba(0,220,180,0.9)"/>
          <line x1="20" y1="5"  x2="20" y2="11" stroke="rgba(0,220,180,0.5)" strokeWidth="1"/>
          <line x1="20" y1="29" x2="20" y2="35" stroke="rgba(0,220,180,0.5)" strokeWidth="1"/>
          <line x1="5"  y1="20" x2="11" y2="20" stroke="rgba(0,220,180,0.5)" strokeWidth="1"/>
          <line x1="29" y1="20" x2="35" y2="20" stroke="rgba(0,220,180,0.5)" strokeWidth="1"/>
        </svg>
      </div>

      {/* Click ripples */}
      {ripples.map(({x,y,id}) => (
        <div key={id} style={{position:"fixed",left:x,top:y,zIndex:9998,pointerEvents:"none",transform:"translate(-50%,-50%)",width:0,height:0,borderRadius:"50%",border:"1px solid rgba(0,220,180,0.6)",animation:"rippleOut 1.2s ease-out forwards"}}/>
      ))}

      <OceanBg px={px} py={py}/>

      {/* Vessels */}
      <div style={{position:"fixed",inset:0,zIndex:3,pointerEvents:"none",transform:`translate(${px*-25}px,${py*-12}px)`,transition:"transform 0.35s ease-out"}}>
        {VESSELS.map((v,i) => <Vessel key={i} {...v}/>)}
      </div>

      {/* Seaweed floor */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:"180px",zIndex:3,pointerEvents:"none",transform:`translate(${px*-10}px,0)`,transition:"transform 0.4s ease-out"}}>
        {SEAWEEDS.map((s,i) => <Seaweed key={i} {...s}/>)}
      </div>

      <OceanCanvas mousePos={mouse}/>
      <HudOverlay px={px} py={py}/>

      {/* Main layout */}
      <div ref={wrapRef} style={{position:"relative",zIndex:10,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:"clamp(24px,4vw,70px)",padding:"0 5vw"}}>
        <BrandPanel px={px} py={py}/>
        <LoginCard tilt={tilt} px={px} py={py} form={form} setForm={setForm} focused={focused} setFocused={setFocused} isLoading={isLoading} done={done} onSubmit={handleSubmit} authError={authError}/>
      </div>

      <style>{`
        @keyframes scanLine  { 0%{transform:translateX(-120%);opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{transform:translateX(120%);opacity:0} }
        @keyframes shimmer   { 0%{transform:translateX(-200%)} 100%{transform:translateX(200%)} }
        @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sway      { 0%,100%{transform:rotate(-3.5deg)} 50%{transform:rotate(3.5deg)} }
        @keyframes rippleOut { 0%{width:0;height:0;opacity:0.6} 100%{width:180px;height:180px;margin-left:-90px;margin-top:-90px;opacity:0} }
        .brand-left { display:none !important; flex-direction:column; }
        @media (min-width:1024px) { .brand-left { display:flex !important; } }
        input::placeholder { color:rgba(60,140,160,0.32); font-family:'Inter',sans-serif; }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
}
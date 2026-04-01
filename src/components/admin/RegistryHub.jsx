// src/modules/admin/pages/RegistryHubPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import wildImg from "../../assets/wild.jpg";
import aquaImg from "../../assets/aqua.jpg";
import mariImg from "../../assets/mari.jpg";
import cocImg  from "../../assets/logistics.jpg";

// ─── Constants ────────────────────────────────────────────────────────────────

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700" +
  "&family=Exo+2:wght@300;400;600&family=Share+Tech+Mono&display=swap";

const FISH_COLORS = [
  { body:"0,200,180",  fin:"0,160,150"   },
  { body:"80,200,220", fin:"40,160,180"  },
  { body:"0,180,160",  fin:"0,140,130"   },
  { body:"100,220,200",fin:"60,180,165"  },
];

/** Per-sector card configuration */
const SECTORS = [
  { key:"wild", tag:"Wild Capture",     title:"Vessel\nTracking",      desc:"All wild-capture fishing vessels and boats.", to:"/admin/wild-capture",        img:wildImg, accent:"0,160,220" },
  { key:"aqua", tag:"Aquaculture",      title:"Pond &\nFarm",          desc:"Land-based ponds and aquaculture farms.",    to:"/admin/aqua-culture",        img:aquaImg, accent:"0,210,170" },
  { key:"mari", tag:"Mariculture",      title:"Seaweed\nFarm",         desc:"Seaweed & marine cultivation units.",        to:"/admin/mari-culture",        img:mariImg, accent:"0,190,160" },
  { key:"coc",  tag:"Chain of Custody", title:"Participant\nRegistry", desc:"PCCs, processors, transport & cold stores.", to:"/admin/participant-registry", img:cocImg,  accent:"210,160,0" },
];

const SEAWEEDS = [
  { x:"1.5%", h:110, p:11, c:"rgba(0,150,100,0.65)", d:0    },
  { x:"5%",   h: 80, p:-8, c:"rgba(0,120,80,0.55)",  d:0.5  },
  { x:"24%",  h: 95, p:13, c:"rgba(0,160,105,0.6)",  d:0.9  },
  { x:"49%",  h:120, p:-9, c:"rgba(0,140,90,0.6)",   d:0.3  },
  { x:"74%",  h: 88, p:12, c:"rgba(0,155,100,0.6)",  d:0.7  },
  { x:"93%",  h:130, p:-11,c:"rgba(0,170,105,0.65)", d:0.2  },
  { x:"97%",  h: 75, p: 9, c:"rgba(0,130,85,0.5)",   d:1.1  },
];

// ─── Canvas factories ─────────────────────────────────────────────────────────

const mkBubble = (W,H) => ({
  x:Math.random()*W, y:H+Math.random()*80,
  r:Math.random()*3+0.8, speed:Math.random()*0.45+0.15,
  wobble:Math.random()*Math.PI*2, wSpd:Math.random()*0.02+0.01,
  alpha:Math.random()*0.25+0.07,
});

const mkFish = (i,W,H) => {
  const dir = Math.random()>0.5?1:-1;
  return {
    x:dir===1?-120:W+120, y:H*(0.2+Math.random()*0.65),
    vx:dir*(Math.random()*0.55+0.25), vy:0,
    len:Math.random()*26+14, dir,
    wag:0, wSpd:Math.random()*0.08+0.04,
    wAmp:Math.random()*0.22+0.09,
    col:FISH_COLORS[i%FISH_COLORS.length],
    alpha:Math.random()*0.3+0.2,
  };
};

const mkJelly = (W,H) => ({
  x:Math.random()*W, y:Math.random()*H*0.65,
  vy:Math.random()*0.12+0.04,
  phase:Math.random()*Math.PI*2, pSpd:Math.random()*0.013+0.006,
  r:Math.random()*18+9, alpha:Math.random()*0.16+0.05,
});

const mkCaustic = (W,H) => ({
  x:Math.random()*W, y:Math.random()*H*0.5,
  r:Math.random()*55+18, phase:Math.random()*Math.PI*2,
  speed:Math.random()*0.01+0.004, alpha:Math.random()*0.05+0.015,
});

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawFish(ctx, f, t) {
  ctx.save();
  ctx.translate(f.x, f.y); ctx.scale(f.dir, 1); ctx.globalAlpha=f.alpha;
  const wag=Math.sin(t*f.wSpd*60+f.wag)*f.wAmp, {len:L,col}=f;
  const g=ctx.createRadialGradient(0,0,0,0,0,L*0.5);
  g.addColorStop(0,`rgba(${col.body},0.9)`); g.addColorStop(1,`rgba(${col.body},0.4)`);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.55,L*0.22,wag*0.3,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-L*0.5,wag*L*0.3); ctx.lineTo(-L*0.85,-L*0.28+wag*L*0.5); ctx.lineTo(-L*0.85,L*0.28+wag*L*0.5); ctx.closePath();
  ctx.fillStyle=`rgba(${col.fin},0.6)`; ctx.fill();
  ctx.beginPath(); ctx.moveTo(L*0.1,-L*0.2); ctx.quadraticCurveTo(0,-L*0.42,-L*0.2,-L*0.18); ctx.closePath();
  ctx.fillStyle=`rgba(${col.fin},0.5)`; ctx.fill();
  ctx.beginPath(); ctx.arc(L*0.32,-L*0.04,L*0.045,0,Math.PI*2); ctx.fillStyle="rgba(200,240,255,0.9)"; ctx.fill();
  ctx.beginPath(); ctx.arc(L*0.33,-L*0.04,L*0.022,0,Math.PI*2); ctx.fillStyle="rgba(0,30,40,0.9)";    ctx.fill();
  ctx.restore();
}

function drawJelly(ctx, j, t) {
  ctx.save(); ctx.translate(j.x,j.y); ctx.globalAlpha=j.alpha;
  const r=j.r*(Math.sin(j.phase+t*j.pSpd*60)*0.2+0.9);
  const g=ctx.createRadialGradient(0,-r*0.2,0,0,0,r);
  g.addColorStop(0,"rgba(150,230,255,0.6)"); g.addColorStop(0.5,"rgba(80,200,230,0.3)"); g.addColorStop(1,"rgba(40,160,200,0.05)");
  ctx.beginPath(); ctx.ellipse(0,0,r,r*0.6,0,Math.PI,0); ctx.fillStyle=g; ctx.fill();
  for(let i=-3;i<=3;i++){
    const tx=i*r*0.28, wv=Math.sin(t*1.8+i)*8;
    ctx.beginPath(); ctx.moveTo(tx,0); ctx.bezierCurveTo(tx+wv,r*0.6,tx-wv,r*1.2,tx+wv*0.5,r*1.8);
    ctx.strokeStyle="rgba(130,210,240,0.22)"; ctx.lineWidth=0.8; ctx.stroke();
  }
  ctx.restore();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OceanCanvas({ mousePos }) {
  const cvs=useRef(null), st=useRef(null), raf=useRef(null), mp=useRef(mousePos);
  useEffect(()=>{mp.current=mousePos;},[mousePos]);

  useEffect(()=>{
    const c=cvs.current, ctx=c.getContext("2d");
    const W=()=>c.width, H=()=>c.height;
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize(); window.addEventListener("resize",resize);
    st.current={
      bubbles:  Array.from({length:65},  ()=>mkBubble(W(),H())),
      fishes:   Array.from({length:14},  (_,i)=>mkFish(i,W(),H())),
      jellies:  Array.from({length:6},   ()=>mkJelly(W(),H())),
      caustics: Array.from({length:18},  ()=>mkCaustic(W(),H())),
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
      jellies.forEach(j=>{j.y-=j.vy;j.x+=Math.sin(j.phase+t)*0.3;if(j.y<-60){j.y=H()+60;j.x=Math.random()*W();}drawJelly(ctx,j,t);});
      fishes.forEach((f,i)=>{
        const dx=mx-f.x,dy=my-f.y,dist=Math.hypot(dx,dy);
        if(dist<140)f.vy+=(-dy/dist)*0.04;
        f.vy*=0.96;f.x+=f.vx;f.y+=f.vy;f.wag+=f.wSpd;
        if(f.dir===1?f.x>W()+140:f.x<-140)Object.assign(f,mkFish(i,W(),H()));
        drawFish(ctx,f,t);
      });
      bubbles.forEach(b=>{
        b.wobble+=b.wSpd;b.x+=Math.sin(b.wobble)*0.35;b.y-=b.speed;
        if(b.y<-20)Object.assign(b,mkBubble(W(),H()));
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.strokeStyle=`rgba(150,230,255,${b.alpha})`;ctx.lineWidth=0.8;ctx.stroke();
        ctx.beginPath();ctx.arc(b.x-b.r*0.28,b.y-b.r*0.28,b.r*0.25,0,Math.PI*2);ctx.fillStyle=`rgba(200,245,255,${b.alpha*0.8})`;ctx.fill();
      });
      raf.current=requestAnimationFrame(tick);
    };
    tick();
    return()=>{window.removeEventListener("resize",resize);cancelAnimationFrame(raf.current);};
  },[]);

  return <canvas ref={cvs} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:2}}/>;
}

function Seaweed({x,h,p,c,d}){
  return(
    <div style={{position:"absolute",bottom:0,left:x,width:24,height:h,overflow:"visible",zIndex:3}}>
      <svg viewBox="0 0 28 120" style={{width:"100%",height:"100%",transformOrigin:"50% 100%",animation:`sway 3.5s ease-in-out ${d}s infinite`}}>
        {[0,1,2,3,4].map(i=><ellipse key={i} cx={14+(i%2===0?10:-10)} cy={120-i*22} rx={6} ry={9} fill={c} opacity={0.52-i*0.06}/>)}
        <path d={`M14,120 Q${14+p},90 14,70 Q${14-p},50 14,30 Q${14+p},15 14,0`} stroke={c} strokeWidth="1.8" fill="none" opacity="0.4"/>
      </svg>
    </div>
  );
}

/** One full-height sector panel with cursor spotlight */
function SectorCard({ s, i, mouse }){
  const cardRef  = useRef(null);
  const [local,  setLocal]  = useState({ x:50, y:50 }); // % within card
  const [hovered,setHovered]= useState(false);
  const a = s.accent;

  // Convert global mouse → local % inside card
  useEffect(()=>{
    if(!cardRef.current || !hovered) return;
    const r = cardRef.current.getBoundingClientRect();
    setLocal({
      x: Math.min(100, Math.max(0, ((mouse.x - r.left) / r.width)  * 100)),
      y: Math.min(100, Math.max(0, ((mouse.y - r.top)  / r.height) * 100)),
    });
  }, [mouse, hovered]);

  // Subtle image parallax driven by cursor
  const imgShift = hovered
    ? `translate(${(local.x-50)*-0.04}%,${(local.y-50)*-0.04}%) scale(1.08)`
    : "scale(1.02)";

  // Content tilt (very subtle 3-D feel)
  const tiltX = hovered ? (local.y - 50) * 0.06 : 0;
  const tiltY = hovered ? (local.x - 50) * -0.06 : 0;

  return(
    <Link
      ref={cardRef}
      to={s.to}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>{ setHovered(false); setLocal({x:50,y:50}); }}
      style={{
        position:"relative",flex:1,height:"100%",overflow:"hidden",
        display:"flex",flexDirection:"column",justifyContent:"flex-end",
        textDecoration:"none",
        borderRight: i<3 ? "1px solid rgba(0,200,180,0.08)" : "none",
        animation:`cardRise 0.6s ease-out ${i*0.12}s both`,
      }}
    >
      {/* Background photo with parallax */}
      <div style={{
        position:"absolute",inset:"-4%",zIndex:0,
        backgroundImage:`url(${s.img})`,backgroundSize:"cover",backgroundPosition:"center",
        transform: imgShift,
        transition: hovered ? "transform 0.12s ease-out" : "transform 0.6s ease",
        filter:"brightness(0.72)",
      }}/>

      {/* Base depth gradient */}
      <div style={{position:"absolute",inset:0,zIndex:1,
        background:"linear-gradient(180deg,rgba(0,8,16,0.1) 0%,rgba(0,10,20,0.25) 40%,rgba(0,6,14,0.75) 100%)"}}/>

      {/* ── CURSOR SPOTLIGHT ── follows mouse inside card */}
      <div style={{
        position:"absolute",inset:0,zIndex:2,
        background: hovered
          ? `radial-gradient(ellipse 38% 32% at ${local.x}% ${local.y}%,rgba(${a},0.22) 0%,rgba(${a},0.06) 40%,transparent 70%)`
          : "none",
        transition: hovered ? "background 0.06s linear" : "background 0.4s ease",
        mixBlendMode:"screen",
      }}/>

      {/* Dark vignette around edges — keeps spotlight pop */}
      <div style={{position:"absolute",inset:0,zIndex:2,
        background:"radial-gradient(ellipse 90% 90% at 50% 50%,transparent 40%,rgba(0,4,12,0.55) 100%)"}}/>

      {/* Accent floor glow on hover */}
      <div style={{
        position:"absolute",inset:0,zIndex:2,
        background:`radial-gradient(ellipse 80% 45% at 50% 100%,rgba(${a},0.2) 0%,transparent 65%)`,
        opacity: hovered ? 1 : 0, transition:"opacity 0.5s ease",
      }}/>

      {/* Top scan line */}
      <div style={{
        position:"absolute",top:0,left:"-100%",right:"-100%",height:1,zIndex:4,
        background:`linear-gradient(90deg,transparent,rgba(${a},0.8),transparent)`,
        animation:`scanLine 4s ease-in-out ${i*0.8}s infinite`,
      }}/>

      {/* Corner brackets */}
      {[
        {top:10,left:10,  borderTop:`1px solid rgba(${a},0.45)`,borderLeft:`1px solid rgba(${a},0.45)`},
        {top:10,right:10, borderTop:`1px solid rgba(${a},0.45)`,borderRight:`1px solid rgba(${a},0.45)`},
        {bottom:10,left:10,  borderBottom:`1px solid rgba(${a},0.2)`,borderLeft:`1px solid rgba(${a},0.2)`},
        {bottom:10,right:10, borderBottom:`1px solid rgba(${a},0.2)`,borderRight:`1px solid rgba(${a},0.2)`},
      ].map((pos,j)=>(
        <div key={j} style={{position:"absolute",width:12,height:12,zIndex:5,...pos}}/>
      ))}

      {/* Card content — subtle tilt */}
      <div style={{
        position:"relative",zIndex:5,padding:"0 22px 32px",
        display:"flex",flexDirection:"column",gap:10,
        transform:`perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transition: hovered ? "transform 0.12s ease-out" : "transform 0.5s ease",
      }}>

        {/* Tag */}
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{
            width:7,height:7,borderRadius:"50%",flexShrink:0,
            background:`rgba(${a},0.9)`,
            boxShadow:`0 0 10px rgba(${a},0.8),0 0 22px rgba(${a},0.4)`,
          }}/>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:`rgba(${a},0.8)`}}>
            {s.tag.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily:"'Cinzel',serif",
          fontSize:"clamp(24px,2.4vw,38px)",
          lineHeight:1.08,color:"#e8f4f8",margin:0,
          textShadow:`0 0 40px rgba(${a},0.35),0 2px 16px rgba(0,0,0,0.7)`,
          whiteSpace:"pre-line",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          transition:"transform 0.4s ease",
        }}>
          {s.title}
        </h2>

        {/* Desc */}
        <p style={{
          fontFamily:"'Exo 2',sans-serif",fontSize:12,
          color: hovered ? "rgba(200,235,240,0.75)" : "rgba(180,220,230,0.45)",
          margin:0,lineHeight:1.55,
          transition:"color 0.4s ease",
        }}>
          {s.desc}
        </p>

        {/* Manage button */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:8,alignSelf:"flex-start",marginTop:6,
          padding:"10px 20px",borderRadius:40,
          border:`1px solid rgba(${a},${hovered?0.6:0.3})`,
          background: hovered ? `rgba(${a},0.18)` : "rgba(0,15,28,0.45)",
          backdropFilter:"blur(12px)",
          color:`rgba(${a},0.95)`,
          fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"0.16em",
          boxShadow: hovered ? `0 0 28px rgba(${a},0.35),inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
          transition:"all 0.35s ease",
        }}>
          MANAGE
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"
            style={{transform:hovered?"translateX(4px)":"translateX(0)",transition:"transform 0.25s ease"}}>
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function RegistryHubPage(){
  const [mouse,   setMouse]   = useState({x:700,y:400});
  const [ripples, setRipples] = useState([]);

  useEffect(()=>{
    const link=Object.assign(document.createElement("link"),{rel:"stylesheet",href:FONTS_URL});
    document.head.appendChild(link);
    return()=>document.head.removeChild(link);
  },[]);

  const handleMouseMove = useCallback((e)=>setMouse({x:e.clientX,y:e.clientY}),[]);

  const handleClick=(e)=>{
    const id=Date.now();
    setRipples(p=>[...p,{x:e.clientX,y:e.clientY,id}]);
    setTimeout(()=>setRipples(p=>p.filter(r=>r.id!==id)),1200);
  };

  const px=(mouse.x/window.innerWidth -0.5)*2;
  const py=(mouse.y/window.innerHeight-0.5)*2;

  return(
    <div
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{height:"100vh",width:"100%",overflow:"hidden",position:"relative",background:"#00080f",fontFamily:"'Exo 2',sans-serif",cursor:"none",userSelect:"none"}}
    >
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
      {ripples.map(({x,y,id})=>(
        <div key={id} style={{position:"fixed",left:x,top:y,zIndex:9998,pointerEvents:"none",transform:"translate(-50%,-50%)",width:0,height:0,borderRadius:"50%",border:"1px solid rgba(0,220,180,0.6)",animation:"rippleOut 1.2s ease-out forwards"}}/>
      ))}

      {/* Surface sheen */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:"3px",zIndex:10,background:"linear-gradient(90deg,transparent,rgba(0,200,200,0.5),rgba(80,220,200,0.8),rgba(0,200,200,0.5),transparent)",filter:"blur(1px)"}}/>

      {/* Ocean canvas */}
      <OceanCanvas mousePos={mouse}/>

      {/* Seaweed floor */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:"160px",zIndex:3,pointerEvents:"none",transform:`translate(${px*-8}px,0)`,transition:"transform 0.4s ease-out"}}>
        {SEAWEEDS.map((s,i)=><Seaweed key={i} {...s}/>)}
      </div>

      {/* Top bar */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:48,zIndex:8,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",background:"linear-gradient(180deg,rgba(0,8,16,0.85) 0%,transparent 100%)",backdropFilter:"blur(8px)",borderBottom:"1px solid rgba(0,200,180,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="rgba(0,200,170,0.6)" strokeWidth="1.2"/>
            <path d="M16,24 Q22,18 30,24 Q22,30 16,24Z" fill="rgba(0,200,170,0.7)"/>
            <path d="M12,24 L10,20 L10,28Z"              fill="rgba(0,200,170,0.5)"/>
            <circle cx="27" cy="22" r="1.6"               fill="rgba(200,240,255,0.9)"/>
          </svg>
          <div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:"0.28em",color:"rgba(0,210,170,0.7)"}}>ROOTVERSE</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,letterSpacing:"0.14em",color:"rgba(0,180,160,0.35)"}}>REGISTRY HUB</div>
          </div>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:"0.18em",color:"rgba(0,200,180,0.35)"}}>
          ADMIN CONSOLE
        </div>
      </div>

      {/* 4-column sector grid */}
      <div style={{position:"relative",zIndex:4,height:"100vh",display:"flex",paddingTop:48}}>
        {SECTORS.map((s,i)=>(
          <SectorCard key={s.key} s={s} i={i} mouse={mouse}/>
        ))}
      </div>

      <style>{`
        @keyframes scanLine  { 0%{transform:translateX(-120%);opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{transform:translateX(120%);opacity:0} }
        @keyframes sway      { 0%,100%{transform:rotate(-3.5deg)} 50%{transform:rotate(3.5deg)} }
        @keyframes rippleOut { 0%{width:0;height:0;opacity:0.6} 100%{width:180px;height:180px;margin-left:-90px;margin-top:-90px;opacity:0} }
        @keyframes cardRise  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  );
}
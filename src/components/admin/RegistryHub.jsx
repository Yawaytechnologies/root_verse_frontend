// src/modules/admin/pages/RegistryHubPage.jsx
import { Link } from "react-router-dom";
import wildImg from "../../assets/wild.jpg";
import aquaImg from "../../assets/aqua.jpg";
import mariImg from "../../assets/mari.jpg";
import cocImg from "../../assets/logistics.jpg";

const sectors = [
  {
    key: "wild",
    tag: "Wild Capture",
    title: "Vessel Tracking",
    desc: "All wild-capture fishing vessels and boats.",
    to: "/admin/wild-capture",
    img: wildImg,
    btn: "bg-sky-500 text-slate-900 hover:bg-sky-400 focus-visible:ring-sky-300",
    dot: "bg-sky-300",
  },
  {
    key: "aqua",
    tag: "Aquaculture",
    title: "Pond & Farm",
    desc: "Land-based ponds and farms.",
    to: "/admin/aqua-culture",
    img: aquaImg,
    btn: "bg-emerald-500 text-slate-900 hover:bg-emerald-400 focus-visible:ring-emerald-300",
    dot: "bg-emerald-300",
  },
  {
    key: "mari",
    tag: "Mariculture",
    title: "Seaweed Farm",
    desc: "Seaweed & marine cultivation units.",
    to: "/admin/mari-culture",
    img: mariImg,
    btn: "bg-teal-500 text-slate-900 hover:bg-teal-400 focus-visible:ring-teal-300",
    dot: "bg-teal-300",
  },
  {
    key: "coc",
    tag: "Chain of Custody",
    title: "Participant Registry",
    desc: "PCCs, processors, transport & cold stores.",
    to: "/admin/participant-registry",
    img: cocImg,
    btn: "bg-amber-500 text-slate-900 hover:bg-amber-400 focus-visible:ring-amber-300",
    dot: "bg-amber-300",
  },
];

export default function RegistryHub() {
  return (
    <div className="h-screen w-screen bg-slate-950">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-4">
        {sectors.map((s, i) => {
          // 1st & 3rd => top→down, 2nd & 4th => bottom→up
          const slideClass = i === 0 || i === 2 ? "hub-slide-down" : "hub-slide-up";

          return (
            <Link
              key={s.key}
              to={s.to}
              className={`group relative isolate h-full w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                i !== sectors.length - 1 ? "md:border-r md:border-white/5" : ""
              } ${slideClass}`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-500 will-change-transform group-hover:scale-105"
                style={{ backgroundImage: `url(${s.img})` }}
              />
              {/* Readability overlays */}
              <div className="absolute inset-0 -z-10 bg-slate-950/45 transition-colors duration-300 group-hover:bg-slate-950/35" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-slate-950/25 to-slate-950/85" />

              {/* Centered content */}
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
                <div className="flex items-center gap-2 text-white/85">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.18em]">
                    {s.tag}
                  </span>
                </div>

                <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] md:text-5xl">
                  {s.title}
                </h2>

                <p className="mt-2 max-w-sm text-sm text-white/90 md:text-base">
                  {s.desc}
                </p>

                {/* Styled button (keeps whole card clickable) */}
                <span
                  role="button"
                  tabIndex={0}
                  className={`mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold shadow-lg shadow-black/30 backdrop-blur-md focus:outline-none focus-visible:ring-2 ${s.btn}`}
                >
                  Manage
                  <svg
                    className="h-4 w-4 translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M7 5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              {/* Bottom depth gradient */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { ArrowRight, Fan, Layers, Wind } from "lucide-react"

function PoultryShellSection() {
  return <figure className="min-w-0 border border-[#b8cdd7] bg-[#edf5f8]">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#b8cdd7] px-5 py-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#526c79]">Atlas / poultry shell interfaces</p>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0043f3]">Concept section</span>
    </div>
    <svg viewBox="0 0 700 440" role="img" aria-labelledby="poultry-section-title poultry-section-desc" className="block h-auto w-full">
      <title id="poultry-section-title">Four interfaces to coordinate in a poultry building shell</title>
      <desc id="poultry-section-desc">An illustrative steel building section marks the roof insulation zone, sidewall opening zone, equipment coordination zone and floor interface. Numbered markers correspond to the descriptions below. This is not a construction or ventilation design.</desc>
      <defs>
        <pattern id="poultry-section-grid" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M 35 0 L 0 0 0 35" fill="none" stroke="#d6e3e9" strokeWidth="0.6" /></pattern>
        <pattern id="poultry-insulation" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 10 10 0" stroke="#b38b20" strokeWidth="1" /></pattern>
      </defs>
      <rect width="700" height="440" fill="url(#poultry-section-grid)" />
      <path d="M125 216 350 130 575 216 570 229 350 146 130 229Z" fill="#fff1b8" />
      <path d="M125 216 350 130 575 216 570 229 350 146 130 229Z" fill="url(#poultry-insulation)" />
      <path d="M99 213 350 117 601 213" fill="none" stroke="#001d2e" strokeWidth="6" strokeLinejoin="round" />
      <path d="M125 223 350 138 575 223 M129 221V343 M571 221V343" fill="none" stroke="#526c79" strokeWidth="5" />
      <path d="M129 230V300 M571 230V300" stroke="#0043f3" strokeWidth="9" strokeDasharray="4 7" />
      <path d="M133 306V341 M567 306V341" stroke="#9fb7c3" strokeWidth="9" />
      <path d="M92 345H608V358H92Z" fill="#d0dce2" stroke="#8295a0" />
      <path d="M180 302H520 M220 202V302 M480 202V302" fill="none" stroke="#8295a0" strokeWidth="1.5" strokeDasharray="6 6" />
      <rect x="207" y="292" width="26" height="15" rx="3" fill="#c1d9e5" stroke="#526c79" />
      <rect x="467" y="292" width="26" height="15" rx="3" fill="#c1d9e5" stroke="#526c79" />
      <path d="M247 169 218 78H170 M127 265H70 M480 279 620 265 M548 352 600 393H628" fill="none" stroke="#526c79" strokeWidth="1.5" />
      {[[170, 78, "01"], [70, 265, "02"], [620, 265, "03"], [628, 393, "04"]].map(([x, y, number]) => <g key={number}><circle cx={x} cy={y} r="19" fill="#0043f3" stroke="#edf5f8" strokeWidth="4" /><text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="monospace">{number}</text></g>)}
      <text x="350" y="333" textAnchor="middle" fill="#526c79" fontSize="10" letterSpacing="2" fontFamily="monospace">EQUIPMENT / WORKING ZONE</text>
    </svg>
    <figcaption className="border-t border-[#b8cdd7] px-5 py-4 text-xs leading-5 text-[#526c79]">Illustrative interfaces only. Openings, insulation, equipment supports and floor details must be agreed for the project; they are not all standard inclusions.</figcaption>
  </figure>
}

export default function PoultryPlanningSection({ content }) {
  const icons = [Wind, Fan]
  return <section id="poultry-planning" className="scroll-mt-44 border-b border-[#b8cdd7] bg-white">
    <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Plan the house around the flock</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{content.title}</h2></div>
        <p className="self-end text-base leading-8 text-[#526c79]">{content.description}</p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {content.ventilation.map((item, index) => {
          const Icon = icons[index]
          return <article key={item.title} className="border border-[#b8cdd7] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4"><Icon className="h-7 w-7 text-[#0043f3]" aria-hidden="true" /><span className="font-mono text-xs font-bold text-[#8295a0]">0{index + 1}</span></div>
            <h3 className="mt-6 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.description}</p>
            <p className="mt-6 border-t border-[#b8cdd7] pt-4 text-sm font-semibold leading-6 text-[#264554]"><span className="text-[#0043f3]">For the steel brief: </span>{item.shellBrief}</p>
          </article>
        })}
      </div>
      <div className="mt-5 flex gap-4 border-l-4 border-[#ffcf1a] bg-[#001d2e] px-6 py-6 text-white sm:px-8"><Layers className="mt-1 h-5 w-5 shrink-0 text-[#ffcf1a]" aria-hidden="true" /><div><h3 className="font-black">Choose the ventilation approach before the span</h3><p className="mt-2 max-w-5xl text-sm leading-7 text-[#c1d9e5]">{content.widthNote}</p></div></div>
      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <PoultryShellSection />
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Four details to agree early</p><h3 className="mt-3 text-2xl font-black">Where the poultry brief meets the shell</h3>
          <ol className="mt-5 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7]">{content.interfaces.map((item, index) => <li key={item.title} className="flex gap-4 py-5"><span className="pt-1 font-mono text-xs font-bold text-[#0043f3]">0{index + 1}</span><div><h4 className="font-black">{item.title}</h4><p className="mt-1 text-sm leading-6 text-[#526c79]">{item.description}</p></div></li>)}</ol>
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-4 border-y border-[#b8cdd7] py-6 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black">Still working out the system?</h3><p className="mt-1 text-sm leading-6 text-[#526c79]">Start with your flock type, approximate capacity and location. Mark the rest as “not sure yet”.</p></div><a href="#agricultural-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-[#0043f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001d2e]">Share your poultry brief <ArrowRight className="h-4 w-4" /></a></div>
      <p className="mt-5 text-xs leading-6 text-[#708893]">Planning references: {content.sources.map((source, index) => <span key={source.url}>{index ? " · " : ""}<a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#0043f3]">{source.label}</a></span>)}. Project requirements are confirmed with the client’s poultry, equipment and professional team.</p>
    </div>
  </section>
}

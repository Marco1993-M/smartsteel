import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export function AtlasMasthead({ descriptor, meta }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 bg-[#001D2E] px-5 py-5 sm:px-8">
      <Image
        src="/atlas/atlas-logo-horizontal-light.png"
        alt="Atlas by Smart Steel"
        width={320}
        height={50}
        priority
        className="h-10 w-auto max-w-full object-contain object-left sm:h-12"
      />
      <div className="flex items-center gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">
        <span>{descriptor}</span>
        {meta ? <span className="h-6 w-px bg-white/18" aria-hidden="true" /> : null}
        {meta ? <span>{meta}</span> : null}
      </div>
    </div>
  );
}

export function AtlasSectionLabel({ children, tone = "blue", className = "" }) {
  const colour = tone === "light" ? "text-[#C1D9E5]" : "text-[#0043F3]";

  return (
    <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${colour} ${className}`}>
      {children}
    </p>
  );
}

export function AtlasPrimaryAction({ href, children }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 bg-[#0043F3] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#001D2E]"
    >
      {children}
      <ArrowUpRightIcon
        className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export function AtlasSecondaryAction({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-3 border border-[#001D2E]/20 bg-white px-5 py-3.5 text-sm font-semibold text-[#001D2E] transition hover:border-[#0043F3] hover:text-[#0043F3]"
    >
      {children}
      <span aria-hidden="true">↓</span>
    </a>
  );
}

export function AtlasMaterialStudy({
  src,
  alt,
  label,
  eyebrow,
  caption,
  reference,
  imageClassName = "object-cover",
}) {
  return (
    <div className="relative min-h-[440px] overflow-hidden bg-[#001D2E] sm:min-h-[560px] lg:min-h-[640px]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className={imageClassName}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,29,46,0.02)_45%,rgba(0,29,46,0.86)_100%)]" />
      <div className="absolute left-0 top-0 bg-[#0043F3] px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
        {label}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-5 text-white sm:p-7">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#C1D9E5]">{eyebrow}</p>
          <p className="mt-2 max-w-sm text-xl font-semibold leading-tight">{caption}</p>
        </div>
        {reference ? (
          <span className="hidden border-l border-white/30 pl-4 font-mono text-xs text-white/62 sm:block">
            {reference}
          </span>
        ) : null}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function BuilderEntryLink({ href, onClick, children, ...props }) {
  const pathname = typeof href === 'string' ? href.split('?')[0] : href?.pathname;
  const builder = pathname === '/warehouse-builder' ? 'warehouse'
    : pathname === '/tools/solar-carport-estimator' ? 'solar_carport' : null;

  function handleClick(event) {
    onClick?.(event);
    if (!builder || event.defaultPrevented || typeof window.gtag !== 'function') return;
    window.gtag('event', 'builder_entry_click', {
      builder_type: builder,
      source_page: window.location.pathname,
      link_text: event.currentTarget.textContent.trim(),
    });
  }

  return <Link href={href} onClick={handleClick} {...props}>{children}</Link>;
}

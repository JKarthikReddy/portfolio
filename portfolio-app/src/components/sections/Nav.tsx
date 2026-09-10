"use client";
import { BASE } from "@/lib/base";

import PillNav from "@/components/bits/PillNav";
import { StaggeredMenu } from "@/components/bits/StaggeredMenu";
import { profile } from "@/data/content";
import { Z } from "@/lib/z";

const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const STAGGERED_ITEMS = NAV_ITEMS.map((item) => ({
  label: item.label,
  ariaLabel: `Go to ${item.label}`,
  link: item.href,
}));

// Header box caps at 64px (<=72px budget). No full-width scroll-edge blur:
// the nav is a compact pill cluster, not a bar, so a viewport-wide blur band
// mostly floated over open content and read as an artifact. The pills carry
// their own backdrop blur, which handles content sliding under actual chrome.

export function Nav() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 h-16" style={{ zIndex: Z.nav }}>
        <div className="hidden md:block">
          <PillNav
            logo={`${BASE}/logo-nav.svg`}
            logoAlt={profile.name}
            items={NAV_ITEMS}
            baseColor="#38bdf8"
            navBgColor="rgba(19, 19, 22, 0.6)"
            pillColor="transparent"
            pillTextColor="#fafafa"
            hoveredPillTextColor="#09090b"
          />
        </div>
        <div className="md:hidden">
          <StaggeredMenu
            isFixed
            position="right"
            items={STAGGERED_ITEMS}
            displaySocials={false}
            displayItemNumbering={false}
            logoUrl={`${BASE}/logo-nav.svg`}
            colors={["#131316", "#38bdf8"]}
            accentColor="#38bdf8"
            menuButtonColor="#fafafa"
            openMenuButtonColor="#38bdf8"
            className="staggered-nav-compact"
          />
        </div>
      </header>
    </>
  );
}

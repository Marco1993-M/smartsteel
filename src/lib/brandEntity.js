export const SMART_STEEL_SITE_URL = "https://www.smartsteel.co.za";
export const SMART_STEEL_FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61565551157027";
export const PEQUENO_HOME_URL = "https://www.pequenohome.com";

export const smartSteelContact = {
  email: "info@smartsteel.co.za",
  telephone: "+27826576522",
  displayTelephone: "+27 82 657 6522",
};

export const smartSteelSameAs = [SMART_STEEL_FACEBOOK_URL];

export const smartSteelOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SMART_STEEL_SITE_URL}/#organization`,
  name: "Smart Steel",
  alternateName: ["Smart Steel South Africa", "SmartSteel"],
  url: `${SMART_STEEL_SITE_URL}/`,
  logo: `${SMART_STEEL_SITE_URL}/logo-512x512.png`,
  image: `${SMART_STEEL_SITE_URL}/images/hero.webp`,
  description:
    "Smart Steel is a South African steel building systems company supplying lightweight steel warehouses, roof trusses, solar carports, lip channel kits, and related steel structures.",
  email: smartSteelContact.email,
  telephone: smartSteelContact.telephone,
  foundingLocation: {
    "@type": "Place",
    name: "South Africa",
  },
  founder: [
    { "@type": "Person", name: "Stefan Steyn" },
    { "@type": "Person", name: "Niel Wannenburg" },
    { "@type": "Person", name: "Marco Gerritsen" },
  ],
  parentOrganization: {
    "@type": "Organization",
    name: "Pequeno Home",
    url: PEQUENO_HOME_URL,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: smartSteelContact.telephone,
      email: smartSteelContact.email,
      contactType: "sales",
      areaServed: "ZA",
      availableLanguage: ["en"],
    },
  ],
  areaServed: {
    "@type": "Country",
    name: "South Africa",
  },
  knowsAbout: [
    "lightweight steel warehouses",
    "steel warehouse systems",
    "lightweight steel framing",
    "steel roof trusses",
    "solar carports",
    "cold formed lip channel steel kits",
  ],
  sameAs: smartSteelSameAs,
};

export const smartSteelWebsiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SMART_STEEL_SITE_URL}/#website`,
  name: "Smart Steel",
  alternateName: "Smart Steel South Africa",
  url: `${SMART_STEEL_SITE_URL}/`,
  publisher: {
    "@id": `${SMART_STEEL_SITE_URL}/#organization`,
  },
  inLanguage: "en-ZA",
};

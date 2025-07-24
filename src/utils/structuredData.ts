
export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SafiriSmart",
  "description": "AI-powered safari planning platform for Kenya tours and wildlife experiences",
  "url": typeof window !== 'undefined' ? window.location.origin : "https://safirismart.com",
  "logo": {
    "@type": "ImageObject",
    "url": `${typeof window !== 'undefined' ? window.location.origin : "https://safirismart.com"}/safari-guide-og.jpg`
  },
  "foundingDate": "2024",
  "founders": [{
    "@type": "Person",
    "name": "SafiriSmart Team"
  }],
  "areaServed": {
    "@type": "Country",
    "name": "Kenya"
  },
  "serviceType": "Safari Planning and Tour Operations",
  "knowsAbout": [
    "Kenya Safari Tours",
    "Wildlife Conservation",
    "Tour Operations",
    "Travel Technology",
    "AI-Powered Planning"
  ]
});

export const createWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SafiriSmart - Complete Safari Solutions",
  "description": "AI-powered safari planning for Kenya. Create personalized itineraries and connect with expert operators.",
  "url": typeof window !== 'undefined' ? window.location.origin : "https://safirismart.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${typeof window !== 'undefined' ? window.location.origin : "https://safirismart.com"}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SafiriSmart"
  }
});

export const createServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Safari Planning Service",
  "description": "AI-powered personalized safari itinerary planning for Kenya wildlife tours",
  "provider": {
    "@type": "Organization",
    "name": "SafiriSmart"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Kenya"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Safari Packages",
    "itemListElement": [{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Custom Safari Itinerary",
        "description": "Personalized safari planning with AI assistance"
      }
    }]
  }
});

export const createTourPackageSchema = (packageData: any) => ({
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": packageData.title,
  "description": packageData.description,
  "touristType": "Wildlife Safari Enthusiast",
  "itinerary": {
    "@type": "ItemList",
    "name": `${packageData.title} Itinerary`,
    "description": packageData.description
  },
  "duration": `P${packageData.duration}D`,
  "offers": {
    "@type": "Offer",
    "priceRange": `$${packageData.minPrice}-${packageData.maxPrice}`,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "provider": {
    "@type": "Organization",
    "name": "SafiriSmart"
  }
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

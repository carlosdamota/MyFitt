export interface LogoAsset {
  src: string;
  alt: string;
}

export interface PwaIconAsset {
  src: string;
  sizes: string;
  type: string;
  purpose?: "any" | "maskable" | "monochrome" | "any maskable";
}

export const mainLogo: LogoAsset = {
  src: "/pwa-512x512.png",
  alt: "FITTWIZ logo",
};

export const iconLogo: LogoAsset = {
  src: "/pwa-192x192.png",
  alt: "FITTWIZ icon",
};

export const favicon: LogoAsset = {
  src: "/favicon.svg",
  alt: "FITTWIZ favicon",
};

export const pwaIcons: PwaIconAsset[] = [
  {
    src: "/pwa-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/pwa-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/pwa-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any maskable",
  },
];

export const socialPreview: LogoAsset = {
  src: "/pwa-512x512.png",
  alt: "FITTWIZ social preview",
};

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Расходы",
    short_name: "Расходы",
    description: "Трекер расходов",
    start_url: "/",
    display: "standalone",
    background_color: "#151f14",
    theme_color: "#151f14",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

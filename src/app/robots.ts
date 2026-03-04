import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/browse", "/how-it-works", "/categories", "/request", "/fixer", "/login", "/register", "/terms", "/privacy"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/admin",
          "/admin/*",
          "/messages",
          "/messages/*",
          "/settings",
          "/settings/*",
          "/profile/edit",
          "/api/*",
          "/my-requests",
          "/jobs",
          "/jobs/*",
          "/disputes",
          "/disputes/*",
          "/notifications",
          "/post",
        ],
      },
    ],
    sitemap: "https://fixme.nl/sitemap.xml",
  };
}

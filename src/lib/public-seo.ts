export type PublicSeo = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string | null;
};
export function staticSeo(
  seo: PublicSeo | undefined,
  fallbackTitle: string,
  fallbackDescription: string,
  path: string,
) {
  const title = seo?.metaTitle || fallbackTitle;
  const description = seo?.metaDescription || fallbackDescription;
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: path },
      { name: "twitter:card", content: "summary_large_image" },
      ...(seo?.ogImageUrl
        ? [
            { property: "og:image", content: seo.ogImageUrl },
            { name: "twitter:image", content: seo.ogImageUrl },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: path }],
  };
}

import Head from "next/head"

interface MetaTagsProps {
  title: string
  description: string
  ogImage?: string
  canonical?: string
}

export function MetaTags({ title, description, ogImage = "/og-image.jpg", canonical }: MetaTagsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://listingai.ro"

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || siteUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  )
}


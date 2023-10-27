import { NextSeo } from 'next-seo'

interface SeoProps {
  title?: string
  description?: string
  image?: string
  path?: string
}

export const Seo = (props: SeoProps) => {
  const { title, description, image, path = '' } = props

  return (
    <NextSeo
      title={title || 'ElevenFM - Enjoy unlimited free music!'}
      titleTemplate={title ? '%s | ElevenFM' : 'ElevenFM'}
      canonical={`${process.env.NEXT_PUBLIC_DOMAIN}${path}`}
      description={description}
      openGraph={
        image
          ? {
              url: `${process.env.NEXT_PUBLIC_DOMAIN}${path}`,
              title,
              description,
              images: [
                {
                  url: image,
                  alt: 'Og Image',
                  type: 'image/jpeg',
                },
              ],
              siteName: 'ElevenFM',
            }
          : undefined
      }
    />
  )
}

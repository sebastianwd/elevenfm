import { GlobeAltIcon } from '@heroicons/react/24/outline'

interface ArtistHeaderProps {
  externalUrls: {
    spotify?: string
    website?: string
  }
  title: string
  subtitle: string
  className?: string
}

export const ArtistHeader = (props: ArtistHeaderProps) => {
  const { externalUrls, title, subtitle, className } = props
  return (
    <div className={className}>
      <div className='flex items-center justify-center gap-4 md:justify-start'>
        <h1 className='text-2xl text-gray-50 md:text-3xl lg:text-5xl'>
          {title}
        </h1>
        {externalUrls
          ? externalUrls.website && (
              <a
                href={externalUrls.website}
                target='_blank'
                rel='noreferrer noopener'
              >
                <GlobeAltIcon className='h-6' />
              </a>
            )
          : null}
      </div>
      <h5 className='mt-1 text-center text-sm font-thin text-gray-300 md:text-left'>
        {subtitle}
      </h5>
    </div>
  )
}

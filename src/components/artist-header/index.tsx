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
      <div className='flex items-center gap-4 justify-center md:justify-start'>
        <h1 className='text-2xl md:text-3xl lg:text-5xl text-gray-50'>
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
      <h5 className='text-sm font-thin md:text-left text-center text-gray-300 mt-1'>
        {subtitle}
      </h5>
    </div>
  )
}

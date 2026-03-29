import NextImage, { ImageProps as NextImageProps } from 'next/image'

interface ImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
  src: string
  alt?: string
  // 常用預設尺寸
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  // 是否為圓形
  rounded?: boolean
  // 自定義 className
  className?: string
}

// 預設尺寸對應
const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 80, height: 80 },
  lg: { width: 120, height: 120 },
  xl: { width: 200, height: 200 },
  full: { fill: true }
} as const

export default function Image({ 
  src, 
  alt = '',
  size,
  rounded = false,
  className = '',
  width,
  height,
  fill,
  priority = false,
  quality = 75,
  placeholder,
  blurDataURL,
  ...rest 
}: ImageProps) {
  // 如果沒有提供 src，返回 null
  if (!src) return null

  // 處理尺寸
  let sizeProps: any = {}
  if (size && sizeMap[size]) {
    const mapped = sizeMap[size]
    if ('fill' in mapped) {
      sizeProps.fill = mapped.fill
    } else {
      sizeProps.width = mapped.width
      sizeProps.height = mapped.height
    }
  } else if (fill) {
    sizeProps.fill = true
  } else {
    sizeProps.width = width || 100
    sizeProps.height = height || 100
  }

  // 合併 className
  const combinedClassName = [
    className,
    rounded ? 'rounded-full' : '',
    sizeProps.fill ? 'object-cover' : ''
  ].filter(Boolean).join(' ')

  return (
    <NextImage
      src={src}
      alt={alt}
      {...sizeProps}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      className={combinedClassName}
      {...rest}
    />
  )
}
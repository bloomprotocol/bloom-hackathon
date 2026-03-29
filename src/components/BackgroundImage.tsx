import Image from 'next/image'

interface BackgroundImageProps {
  src: string
  alt?: string
  className?: string
  priority?: boolean
  quality?: number
  width?: number
  height?: number
  fullScreen?: boolean  // 全視窗模式
  customHeight?: string  // 自定義高度
}

export default function BackgroundImage({ 
  src, 
  alt = "Background", 
  className = "",
  priority = true,
  quality = 75,
  width,
  height,
  fullScreen = false,
  customHeight
}: BackgroundImageProps) {
  if (!src) return null
  
  // 判斷是否有指定寬高
  const hasFixedSize = width !== undefined && height !== undefined
  
  // 計算 aspect ratio（如果提供了兩個維度）
  const aspectRatio = hasFixedSize && height > 0 ? width / height : undefined
  
  // 根據 fullScreen 和 customHeight 決定容器樣式
  const containerClass = fullScreen || !customHeight
    ? `fixed inset-0 -z-10 ${className}` // 全視窗模式或沒指定高度：滿版
    : `fixed inset-x-0 top-0 ${customHeight} rounded-b-[20px] overflow-hidden -z-10 ${className}` // 有指定高度時：使用自定義高度並加圓角
  
  return (
    <div 
      className={containerClass}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
    >
      {hasFixedSize ? (
        // 有指定寬高時使用固定尺寸
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-cover object-center w-full h-full"
          quality={quality}
          priority={priority}
        />
      ) : (
        // 沒有指定寬高時使用 fill（保持原有行為）
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-[center_75%]"
          quality={quality}
          priority={priority}
          sizes="100vw"
        />
      )}
    </div>
  )
}
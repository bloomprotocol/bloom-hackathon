'use client'

import Image from 'next/image'

interface BackgroundVideoProps {
  src: string
  poster?: string
  className?: string
  customHeight?: string
}

export default function BackgroundVideo({
  src,
  poster,
  className = '',
  customHeight,
}: BackgroundVideoProps) {
  if (!src) return null

  // 根据 customHeight 决定容器样式
  const containerClass = !customHeight
    ? `fixed inset-0 -z-10 ${className}`
    : `fixed inset-x-0 top-0 ${customHeight} rounded-b-[20px] overflow-hidden -z-10 ${className}`

  return (
    <div className={containerClass}>
      {/* 移动端显示图片 */}
      {poster && (
        <div className="desktop:hidden w-full h-full">
          <Image
            src={poster}
            alt="Background"
            fill
            className="object-cover object-[center_75%]"
            priority
            sizes="100vw"
          />
        </div>
      )}
      {/* 桌面端显示视频 */}
      <video
        autoPlay
        muted
        playsInline
        poster={poster}
        className="hidden desktop:block w-full h-full object-cover object-[center_75%]"
        onTimeUpdate={(e) => {
          const video = e.currentTarget
          if (video.currentTime >= 2.5) {
            video.pause()
          }
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  )
}

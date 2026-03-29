// src/lib/hooks/useCountdown.ts
'use client'
import { useState, useEffect, useRef } from 'react'

export interface CountdownState {
  d: number
  h: number
  m: number
  s: number
}

/** 只在 client 端計算倒數，SSR/Hydration 時都渲染 00:00:00:00 */
export default function useCountdown(endTime: string | number | Date): CountdownState {
  // 初始 state 全為 0
  const [countdown, setCountdown] = useState<CountdownState>({ d: 0, h: 0, m: 0, s: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 計算一次剩餘時間
    const calc = () => {
      const now = Date.now()
      const target =
        typeof endTime === 'string' || endTime instanceof Date
          ? new Date(endTime).getTime()
          : endTime
      const diff = Math.max(target - now, 0)

      const d = Math.floor(diff / 86_400_000)
      const h = Math.floor((diff % 86_400_000) / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)

      setCountdown({ d, h, m, s })
    }

    // 用 0 延遲，確保這段只在客戶端執行
    const startTimeout = setTimeout(() => {
      calc()  // 第一次更新
      // 每秒再更新一次
      timerRef.current = setInterval(calc, 1000)
    }, 0)

    return () => {
      clearTimeout(startTimeout)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [endTime])

  return countdown
}
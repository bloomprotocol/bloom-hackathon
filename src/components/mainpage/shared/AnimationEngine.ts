import { useEffect, useRef } from 'react';

type AnimationCallback = (progress: number) => void;
type EasingFunction = (t: number) => number;

interface Animation {
  id: string;
  startTime: number;
  duration: number;
  callback: AnimationCallback;
  easing: EasingFunction;
  rafId?: number;
}

export class AnimationEngine {
  private animations: Map<string, Animation> = new Map();
  private isRunning = false;

  // 預設的 easing 函數
  private easings: Record<string, EasingFunction> = {
    linear: (t) => t,
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeIn: (t) => Math.pow(t, 3),
    easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  };

  start(
    id: string,
    duration: number,
    callback: AnimationCallback,
    easing: string | EasingFunction = 'easeOut'
  ): Promise<void> {
    return new Promise((resolve) => {
      // 停止現有的同 ID 動畫
      this.stop(id);

      const animation: Animation = {
        id,
        startTime: performance.now(),
        duration,
        callback,
        easing: typeof easing === 'string' ? this.easings[easing] : easing,
      };

      this.animations.set(id, animation);

      if (!this.isRunning) {
        this.isRunning = true;
        this.tick();
      }

      // 動畫完成時 resolve
      setTimeout(() => {
        this.stop(id);
        resolve();
      }, duration);
    });
  }

  stop(id: string): void {
    const animation = this.animations.get(id);
    if (animation?.rafId) {
      cancelAnimationFrame(animation.rafId);
    }
    this.animations.delete(id);

    if (this.animations.size === 0) {
      this.isRunning = false;
    }
  }

  stopAll(): void {
    this.animations.forEach((_, id) => this.stop(id));
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    
    this.animations.forEach((animation) => {
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const easedProgress = animation.easing(progress);
      
      animation.callback(easedProgress);

      if (progress >= 1) {
        this.stop(animation.id);
      }
    });

    if (this.isRunning) {
      requestAnimationFrame(this.tick);
    }
  };

  // 工具方法：動畫數值
  animateValue(
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    easing = 'easeOut'
  ): Promise<void> {
    return this.start(
      `value-${Date.now()}`,
      duration,
      (progress) => {
        const value = from + (to - from) * progress;
        onUpdate(Math.round(value));
      },
      easing
    );
  }

  // 工具方法：序列動畫
  async sequence(animations: Array<() => Promise<void>>): Promise<void> {
    for (const animation of animations) {
      await animation();
    }
  }

  // 工具方法：並行動畫
  parallel(animations: Array<() => Promise<void>>): Promise<void[]> {
    return Promise.all(animations.map(fn => fn()));
  }

  // 工具方法：延遲
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// React Hook
export function useAnimationEngine() {
  const engineRef = useRef<AnimationEngine | null>(null);
  
  // 確保總是有一個 engine 實例
  if (!engineRef.current) {
    engineRef.current = new AnimationEngine();
  }

  useEffect(() => {
    // 清理函數
    return () => {
      engineRef.current?.stopAll();
    };
  }, []);

  return engineRef.current;
} 
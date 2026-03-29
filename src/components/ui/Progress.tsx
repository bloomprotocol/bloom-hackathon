import React from 'react';
import styles from './Progress.module.css';

export interface ProgressProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 进度值，0-100 */
  value: number;
  /** 进度条大小 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 自定义样式类 */
  className?: string;
}

/**
 * 进度条组件
 */
export function Progress({
  value = 0,
  size = 'md',
  className = '',
  ...others
}: ProgressProps) {
  // 确保值在有效范围内
  const safeValue = Math.min(Math.max(0, value), 100);
  
  // 创建CSS类
  const rootClasses = [
    styles.root,
    styles[`size-${size}`],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div
      {...others}
      className={rootClasses}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      data-size={size}
    >
      <div className={styles.track}>
        <div 
          className={styles.bar}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
} 
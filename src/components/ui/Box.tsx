import React from 'react';
import styles from './Box.module.css';

export interface BoxProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 自定义样式类 */
  className?: string;
}

/**
 * 基础盒子组件
 */
export function Box({
  className = '',
  children,
  ...others
}: BoxProps) {
  return (
    <div className={`${styles.box} ${className}`} {...others}>
      {children}
    </div>
  );
} 
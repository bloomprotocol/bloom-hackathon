import React from 'react';
import styles from './Container.module.css';

export interface ContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 容器宽度 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 是否流体布局（占满宽度） */
  fluid?: boolean;
  /** 自定义样式类 */
  className?: string;
}

/**
 * 响应式容器组件
 */
export function Container({
  size = 'md',
  fluid = false,
  className = '',
  children,
  ...others
}: ContainerProps) {
  const containerClass = [
    styles.container,
    styles[`size-${size}`],
    fluid ? styles.fluid : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} {...others}>
      {children}
    </div>
  );
} 
import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建通用的上下文结构
type AccordionContextValue = {
  value: string | string[];
  onChange: (value: string) => void;
  multiple: boolean;
  chevron: React.ReactNode | null;
};

const AccordionContext = createContext<AccordionContextValue>({
  value: '',
  onChange: () => {},
  multiple: false,
  chevron: null
});

// 手风琴项上下文
type AccordionItemContextValue = {
  value: string;
  open: boolean;
};

const AccordionItemContext = createContext<AccordionItemContextValue>({
  value: '',
  open: false
});

// 主组件Props
export interface AccordionProps {
  /** 手风琴组件的当前值 */
  value?: string | string[];
  /** 默认展开的手风琴项的值 */
  defaultValue?: string | string[];
  /** 是否允许多个项同时展开 */
  multiple?: boolean;
  /** 自定义切换图标，为null时不显示 */
  chevron?: React.ReactNode | null;
  /** 未排序，无样式 */
  unstyled?: boolean;
  /** 子组件 */
  children: React.ReactNode;
  /** 默认转发的属性 */
  className?: string;
}

// 手风琴组件主体
export function Accordion({
  value: externalValue,
  defaultValue = '',
  multiple = false,
  chevron = <ChevronIcon />,
  unstyled = false,
  children,
  className = '',
  ...others
}: AccordionProps) {
  // 控制状态逻辑
  const [internalValue, setInternalValue] = useState<string | string[]>(defaultValue);
  
  // 使用受控或非受控模式
  const controlled = externalValue !== undefined;
  const value = controlled ? externalValue : internalValue;
  
  // 确保defaultValue在初始化时被正确设置
  useEffect(() => {
    if (defaultValue && !controlled) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, controlled]);
  
  const onChange = (itemValue: string) => {
    // 当前值
    const currentVal = value || '';
    
    // 处理多选情况
    if (multiple) {
      const values = Array.isArray(currentVal) ? [...currentVal] : [];
      const newValues = values.includes(itemValue)
        ? values.filter(v => v !== itemValue)
        : [...values, itemValue];
        
      if (!controlled) {
        setInternalValue(newValues);
      }
    } else {
      // 切换逻辑：如果当前值等于点击项，则折叠（设为空字符串）；否则展开（设为点击项的值）
      const newValue = currentVal === itemValue ? '' : itemValue;
      
      if (!controlled) {
        setInternalValue(newValue);
      }
    }
  };
  
  // 生成类名，不使用CSS模块
  const rootClassName = `accordion-root ${className}`.trim();
  
  return (
    <AccordionContext.Provider value={{ 
      value, 
      onChange, 
      multiple, 
      chevron 
    }}>
      <div className={rootClassName} {...others}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// 手风琴项组件
export interface AccordionItemProps {
  /** 项的唯一标识值 */
  value: string;
  /** 子组件 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

// 附加Item组件
Accordion.Item = function AccordionItem({
  value,
  children,
  className = '',
  ...others
}: AccordionItemProps) {
  const { value: contextValue, multiple } = useContext(AccordionContext);
  
  // 判断是否打开
  const isOpen = Array.isArray(contextValue)
    ? contextValue.includes(value)
    : contextValue === value;
  
  const itemClassName = `accordion-item ${className}`.trim();
  
  return (
    <AccordionItemContext.Provider value={{ value, open: isOpen }}>
      <div className={itemClassName} {...others}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

// 手风琴标题组件
export interface AccordionControlProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 标题是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义点击事件 */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

// 附加Control组件
Accordion.Control = function AccordionControl({
  children,
  disabled = false,
  className = '',
  onClick,
  ...others
}: AccordionControlProps) {
  const { chevron, onChange } = useContext(AccordionContext);
  const { value, open } = useContext(AccordionItemContext);
  
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) return;
    
    if (onClick) {
      onClick(event);
    } else {
      onChange(value);
    }
  };
  
  // 不使用CSS模块的类名生成
  const controlClassName = `accordion-control ${open ? 'accordion-control-open' : ''} ${disabled ? 'accordion-control-disabled' : ''} ${className}`.trim();
  
  return (
    <button
      type="button"
      disabled={disabled}
      className={controlClassName}
      onClick={handleClick}
      aria-expanded={open}
      {...others}
    >
      <div className="accordion-label">{children}</div>
      {chevron && <div className="accordion-chevron">{chevron}</div>}
    </button>
  );
};

// 手风琴内容组件
export interface AccordionPanelProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
}

// 附加Panel组件
Accordion.Panel = function AccordionPanel({
  children,
  className = '',
  ...others
}: AccordionPanelProps) {
  const { open } = useContext(AccordionItemContext);
  
  const panelClassName = `accordion-panel ${open ? 'accordion-panel-open' : ''} ${className}`.trim();
  
  if (!open) {
    return null;
  }
  
  return (
    <div className={panelClassName} {...others}>
      {children}
    </div>
  );
};

// 默认的箭头图标
function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z"
        fill="currentColor"
      />
    </svg>
  );
} 
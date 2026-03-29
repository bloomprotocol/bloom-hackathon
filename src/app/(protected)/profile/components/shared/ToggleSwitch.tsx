"use client";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
  /** Active color - default is #eb7cff (pink) */
  activeColor?: string;
}

/**
 * Reusable toggle switch component
 * Used across profile pages for settings toggles
 */
export function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
  activeColor = '#eb7cff',
}: ToggleSwitchProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{
        backgroundColor: enabled ? activeColor : '#e6e8ec',
      }}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

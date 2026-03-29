/**
 * Business logic for validating React hooks usage
 * Prevents hooks order errors
 */

interface HooksValidationParams {
  componentName: string;
  hooksCalled: string[];
  conditionalChecks: {
    condition: string;
    hooksInCondition: string[];
  }[];
}

interface HooksValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateHooksOrder({
  componentName,
  hooksCalled,
  conditionalChecks,
}: HooksValidationParams): HooksValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Hooks must be called at the top level
  conditionalChecks.forEach(({ condition, hooksInCondition }) => {
    if (hooksInCondition.length > 0) {
      errors.push(
        `${componentName}: Hooks (${hooksInCondition.join(', ')}) called inside condition "${condition}". ` +
        'Hooks must be called unconditionally at the top level.'
      );
    }
  });

  // Rule 2: Hooks must be called in the same order every render
  if (hooksCalled.includes('useContext') && conditionalChecks.length > 0) {
    warnings.push(
      `${componentName}: Using useContext with conditional logic. ` +
      'Make sure the hook is called unconditionally, then use the result conditionally.'
    );
  }

  // Rule 3: Custom hooks should follow naming convention
  const customHooks = hooksCalled.filter(hook => 
    hook.startsWith('use') && !['useState', 'useEffect', 'useContext', 'useCallback', 'useMemo', 'useRef'].includes(hook)
  );
  
  if (customHooks.length > 0) {
    customHooks.forEach(hook => {
      if (!hook.match(/^use[A-Z]/)) {
        warnings.push(`${componentName}: Custom hook "${hook}" should start with "use" followed by uppercase letter.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Safe pattern for conditional context usage
 */
export function safeConditionalContext<T>(
  context: T | null,
  condition: boolean
): T | undefined {
  // Always call hooks unconditionally
  // Then apply condition to the result
  return condition && context ? context : undefined;
}

/**
 * Example of correct hooks usage pattern
 */
export const CORRECT_HOOKS_PATTERN = `
// ✅ CORRECT: Hooks at top level
const MyComponent = ({ shouldUseFeature }) => {
  const context = useContext(MyContext);     // Always called
  const [state, setState] = useState(null);  // Always called
  
  // Use results conditionally
  if (shouldUseFeature && context) {
    // Use context here
  }
  
  return <div>...</div>;
};

// ❌ WRONG: Conditional hooks
const BadComponent = ({ shouldUseFeature }) => {
  if (shouldUseFeature) {
    const context = useContext(MyContext);  // ERROR: Conditional hook!
  }
  
  return <div>...</div>;
};
`;
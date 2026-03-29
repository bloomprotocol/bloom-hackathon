/**
 * Task Verification Business Logic
 * Extracted from builder-inbox.tsx for unit testing
 * 
 * Core Business Rules:
 * 1. Task verification requires specific API payload structure
 * 2. Error handling must provide user feedback
 * 3. Success responses must update local state
 * 4. Processing states must be managed correctly
 * 5. Different task types may have different verification flows
 */

export interface TaskVerificationRequest {
  taskType: string;
  payload: {
    action: 'approve' | 'reject' | 'resolve' | 'archive';
    recordId: number;
    taskId: string;
  };
}

export interface TaskVerificationResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
}

export interface ProcessingState {
  processingItems: Set<string>;
  processedItems: Map<string, string>;
  failedItems: Map<string, string>;
}

/**
 * Validates task verification request
 * Business Rule: All required fields must be present and valid
 */
export function validateVerificationRequest(request: TaskVerificationRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.taskType || typeof request.taskType !== 'string') {
    errors.push('Task type is required');
  }

  if (!request.payload) {
    errors.push('Payload is required');
    return { isValid: false, errors };
  }

  const validActions = ['approve', 'reject', 'resolve', 'archive'];
  if (!validActions.includes(request.payload.action)) {
    errors.push('Invalid action type');
  }

  if (!Number.isInteger(request.payload.recordId) || request.payload.recordId <= 0) {
    errors.push('Record ID must be a positive integer');
  }

  if (!request.payload.taskId || typeof request.payload.taskId !== 'string') {
    errors.push('Task ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Determines appropriate success message based on action type
 * Business Rule: Different actions should provide different user feedback
 */
export function getSuccessMessage(action: string): string {
  switch (action) {
    case 'approve':
      return 'Task approved successfully';
    case 'reject':
      return 'Task rejected successfully';
    case 'resolve':
      return 'Issue resolved successfully';
    case 'archive':
      return 'Item archived successfully';
    default:
      return 'Action completed successfully';
  }
}

/**
 * Determines appropriate error message based on response
 * Business Rule: Error messages should be user-friendly and informative
 */
export function getErrorMessage(response: TaskVerificationResponse): string {
  if (response.error) {
    // Check for specific known errors
    if (response.error.includes('already processed')) {
      return 'This item has already been processed';
    }
    if (response.error.includes('not found')) {
      return 'Item not found or no longer available';
    }
    if (response.error.includes('permission')) {
      return 'You do not have permission to perform this action';
    }
    return response.error;
  }

  if (response.statusCode) {
    switch (response.statusCode) {
      case 400:
        return 'Invalid request. Please check the data and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Item not found or no longer available.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Updates processing state when starting an action
 * Business Rule: Track processing state to prevent duplicate actions
 */
export function startProcessing(
  state: ProcessingState,
  itemId: string
): ProcessingState {
  return {
    processingItems: new Set(state.processingItems).add(itemId),
    processedItems: new Map(state.processedItems),
    failedItems: new Map(state.failedItems)
  };
}

/**
 * Updates processing state when action succeeds
 * Business Rule: Mark item as processed with the action taken
 */
export function completeProcessing(
  state: ProcessingState,
  itemId: string,
  action: string
): ProcessingState {
  const newProcessingItems = new Set(state.processingItems);
  newProcessingItems.delete(itemId);
  
  const newProcessedItems = new Map(state.processedItems);
  newProcessedItems.set(itemId, action);
  
  const newFailedItems = new Map(state.failedItems);
  newFailedItems.delete(itemId); // Clear any previous failure
  
  return {
    processingItems: newProcessingItems,
    processedItems: newProcessedItems,
    failedItems: newFailedItems
  };
}

/**
 * Updates processing state when action fails
 * Business Rule: Mark item as failed and track error for retry
 */
export function failProcessing(
  state: ProcessingState,
  itemId: string,
  error: string
): ProcessingState {
  const newProcessingItems = new Set(state.processingItems);
  newProcessingItems.delete(itemId);
  
  const newFailedItems = new Map(state.failedItems);
  newFailedItems.set(itemId, error);
  
  return {
    processingItems: new Set(newProcessingItems),
    processedItems: new Map(state.processedItems),
    failedItems: newFailedItems
  };
}

/**
 * Checks if an item is currently being processed
 * Business Rule: Prevent duplicate processing of the same item
 */
export function isItemProcessing(state: ProcessingState, itemId: string): boolean {
  return state.processingItems.has(itemId);
}

/**
 * Checks if an item has been processed
 * Business Rule: Show processed state in UI
 */
export function isItemProcessed(state: ProcessingState, itemId: string): boolean {
  return state.processedItems.has(itemId);
}

/**
 * Gets the processed action for an item
 * Business Rule: Display what action was taken on processed items
 */
export function getProcessedAction(state: ProcessingState, itemId: string): string | null {
  return state.processedItems.get(itemId) || null;
}

/**
 * Checks if an item has failed processing
 * Business Rule: Show error state and allow retry
 */
export function isItemFailed(state: ProcessingState, itemId: string): boolean {
  return state.failedItems.has(itemId);
}

/**
 * Gets the failure reason for an item
 * Business Rule: Display specific error for failed items
 */
export function getFailureReason(state: ProcessingState, itemId: string): string | null {
  return state.failedItems.get(itemId) || null;
}

/**
 * Clears the failure state for an item (for retry)
 * Business Rule: Allow users to retry failed actions
 */
export function clearItemFailure(state: ProcessingState, itemId: string): ProcessingState {
  const newFailedItems = new Map(state.failedItems);
  newFailedItems.delete(itemId);
  
  return {
    processingItems: new Set(state.processingItems),
    processedItems: new Map(state.processedItems),
    failedItems: newFailedItems
  };
}

/**
 * Gets processing statistics
 * Business Rule: Provide overview of processing state
 */
export function getProcessingStats(state: ProcessingState): {
  processing: number;
  processed: number;
  failed: number;
  total: number;
} {
  return {
    processing: state.processingItems.size,
    processed: state.processedItems.size,
    failed: state.failedItems.size,
    total: state.processingItems.size + state.processedItems.size + state.failedItems.size
  };
}

/**
 * Determines button state based on processing state
 * Business Rule: UI should reflect current processing state
 */
export function getButtonState(
  state: ProcessingState,
  itemId: string
): {
  disabled: boolean;
  loading: boolean;
  variant: 'default' | 'success' | 'error';
  text?: string;
} {
  if (isItemProcessing(state, itemId)) {
    return {
      disabled: true,
      loading: true,
      variant: 'default'
    };
  }

  if (isItemProcessed(state, itemId)) {
    const action = getProcessedAction(state, itemId);
    return {
      disabled: true,
      loading: false,
      variant: 'success',
      text: action ? `${action}d` : 'processed'
    };
  }

  if (isItemFailed(state, itemId)) {
    return {
      disabled: false,
      loading: false,
      variant: 'error',
      text: 'Retry'
    };
  }

  return {
    disabled: false,
    loading: false,
    variant: 'default'
  };
}

/**
 * Validates task type and action combination
 * Business Rule: Some actions may not be valid for certain task types
 */
export function isValidActionForTaskType(taskType: string, action: string): boolean {
  const validCombinations: Record<string, string[]> = {
    'CONTENT_SUBMISSION': ['approve', 'reject'],
    'BUG_REPORT': ['resolve', 'archive'],
    'QUALITY_REVIEW': ['approve', 'reject'],
    'URL_SUBMISSION': ['approve', 'reject'],
    'MISSION_TASK': ['approve', 'reject', 'resolve']
  };

  const validActions = validCombinations[taskType];
  if (!validActions) {
    // Unknown task type, allow all actions
    return true;
  }

  return validActions.includes(action);
}

/**
 * Creates a verification request object
 * Business Rule: Standardized request structure for all verifications
 */
export function createVerificationRequest(
  action: 'approve' | 'reject' | 'resolve' | 'archive',
  recordId: number,
  taskId: string,
  taskType: string = 'CONTENT_SUBMISSION'
): TaskVerificationRequest {
  return {
    taskType,
    payload: {
      action,
      recordId,
      taskId
    }
  };
}
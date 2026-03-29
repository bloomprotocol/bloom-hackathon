/**
 * Helper functions for working with the new tasks structure
 * Tasks are now grouped by category: Record<string, ProfileTask[]>
 */

import { ProfileTask } from '@/lib/api/services/profileService';

/**
 * Flattens the tasks object into a single array
 * @param tasks - The tasks object grouped by category
 * @returns A flat array of all tasks
 */
export function flattenTasks(tasks: Record<string, ProfileTask[]> | ProfileTask[] | undefined | null): ProfileTask[] {
  if (!tasks) return [];
  
  // Handle legacy array format
  if (Array.isArray(tasks)) {
    return tasks;
  }
  
  // Flatten the object structure
  return Object.values(tasks).flat();
}

/**
 * Gets all tasks categories
 * @param tasks - The tasks object grouped by category
 * @returns Array of category names
 */
export function getTaskCategories(tasks: Record<string, ProfileTask[]> | ProfileTask[] | undefined | null): string[] {
  if (!tasks || Array.isArray(tasks)) return [];
  return Object.keys(tasks);
}

/**
 * Gets tasks by category
 * @param tasks - The tasks object grouped by category
 * @param category - The category to get tasks for
 * @returns Array of tasks in that category
 */
export function getTasksByCategory(
  tasks: Record<string, ProfileTask[]> | ProfileTask[] | undefined | null, 
  category: string
): ProfileTask[] {
  if (!tasks) return [];
  
  // Handle legacy array format
  if (Array.isArray(tasks)) {
    return tasks.filter(task => task.category === category);
  }
  
  return tasks[category] || [];
}

/**
 * Finds a task by ID
 * @param tasks - The tasks object grouped by category
 * @param taskId - The ID of the task to find
 * @returns The task if found, null otherwise
 */
export function findTaskById(
  tasks: Record<string, ProfileTask[]> | ProfileTask[] | undefined | null,
  taskId: string
): ProfileTask | null {
  const allTasks = flattenTasks(tasks);
  return allTasks.find(task => task.id === taskId) || null;
}

/**
 * Counts total tasks
 * @param tasks - The tasks object grouped by category
 * @returns Total number of tasks
 */
export function countTotalTasks(tasks: Record<string, ProfileTask[]> | ProfileTask[] | undefined | null): number {
  return flattenTasks(tasks).length;
}

/**
 * Filters tasks by a predicate
 * @param tasks - The tasks object grouped by category
 * @param predicate - Function to filter tasks
 * @returns Filtered array of tasks
 */
export function filterTasks(
  tasks: Record<string, ProfileTask[]> | ProfileTask[] | undefined | null,
  predicate: (task: ProfileTask) => boolean
): ProfileTask[] {
  return flattenTasks(tasks).filter(predicate);
}
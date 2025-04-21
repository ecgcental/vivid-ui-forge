
/**
 * Material types used in fault reporting
 */
export interface Material {
  id: string;
  type: string;
  rating?: string;
  quantity?: number;
  conductorType?: string;
  length?: number;
  description?: string;
}

export interface MaterialUsed extends Material {
  id: string;
}

/**
 * Re-export OP5Fault type from lib/types
 */
export type { OP5Fault } from '@/lib/types';


export interface Material {
  id?: string;
  type: string;
  rating?: string;
  conductorType?: string;
  description?: string;
  quantity?: number;
  length?: number;
}

export interface MaterialUsed extends Material {
  id: string;
}

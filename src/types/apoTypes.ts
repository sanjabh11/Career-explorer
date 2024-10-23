export interface ItemData {
  name: string;
  description: string;
  importance?: number;
  level?: number;
  date?: string;
  category?: string;
  value?: number;
  genAIImpact?: string;
}

export interface APOItem extends ItemData {
  title?: string;
  scale?: string;
  commodityCode?: string;
  hotTechnology?: boolean;
}

export interface APOCategory {
  [key: string]: number;
}

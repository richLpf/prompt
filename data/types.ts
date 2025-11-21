export type PromptCategory = 'text' | 'image' | 'video';

export interface PromptItem {
  id: string;
  category: PromptCategory;
  title: string;
  description: string; // 提示词模板
  example?: string; // 提示词案例（实际使用示例）
  imageUrl?: string; // 图片URL（主要用于文生图提示词）
  videoUrl?: string; // 视频URL（主要用于文生视频提示词）
  tags: string[];
  source?: string;
  professions?: string[]; // 适合的职业
}


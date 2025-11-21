import { textPrompts } from './text';
import { imagePrompts } from './image';
import { videoPrompts } from './video';
import type { PromptCategory, PromptItem } from './types';

// 重新导出类型，方便外部使用
export type { PromptCategory, PromptItem } from './types';

export const promptCategories: Record<
  PromptCategory,
  { label: string; description: string }
> = {
  text: {
    label: '文生文提示词',
    description: '适合创作文章、营销文案、运营脚本等文本内容'
  },
  image: {
    label: '文生图提示词',
    description: '用于 Midjourney、Stable Diffusion 等 AI 绘图模型'
  },
  video: {
    label: '文生视频提示词',
    description: '为 Runway、Pika 等 AIGC 视频生成模型优化而来'
  }
};

// 合并所有分类的提示词
export const prompts: PromptItem[] = [
  ...textPrompts,
  ...imagePrompts,
  ...videoPrompts
];


import type { PromptItem } from './types';

export const imagePrompts: PromptItem[] = [
  {
    id: 'image-1',
    category: 'image',
    title: '霓虹城市赛博朋克',
    description:
      'Ultra wide shot of a neon cyberpunk megacity at midnight, rain reflections, volumetric lighting, 8k, rendered by octane. Cinematic composition with depth of field.',
    example:
      'Ultra wide shot of a neon cyberpunk megacity at midnight, rain reflections on wet streets, volumetric lighting from neon signs, 8k resolution, rendered by octane. Cinematic composition with shallow depth of field, flying cars in the distance, moody atmosphere.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
    tags: ['科幻', '夜景'],
    source: 'PromptManage 文生图精选',
    professions: ['概念设计师', '游戏美术', '影视后期', '数字艺术家']
  },
  {
    id: 'image-2',
    category: 'image',
    title: '东方水墨插画',
    description:
      'Traditional Chinese ink wash painting of misty mountains, minimalist composition, flowing brush strokes, soft gradients.',
    example:
      'Traditional Chinese ink wash painting of misty mountains in the morning, minimalist composition, flowing brush strokes creating soft gradients, birds flying in the distance, serene and peaceful atmosphere, black and white with subtle gray tones.',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    tags: ['国风', '水墨'],
    source: 'PromptManage 国风画册',
    professions: ['插画师', '平面设计师', '艺术指导', '文化创意设计师']
  },
  {
    id: 'image-3',
    category: 'image',
    title: '极简主义产品摄影',
    description:
      'Clean product photography on white background, soft natural lighting, minimal shadows, high detail, commercial style, professional studio setup.',
    example:
      'Clean product photography of a minimalist watch on pure white background, soft natural lighting from the left, minimal shadows, high detail showing texture and materials, commercial style, professional studio setup, 3/4 angle view.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    tags: ['产品', '极简', '商业'],
    source: 'PromptManage 商业摄影',
    professions: ['产品摄影师', '电商设计师', '商业摄影师', '广告设计师']
  },
  {
    id: 'image-4',
    category: 'image',
    title: '日系小清新风景',
    description:
      'Soft pastel colors, gentle sunlight filtering through trees, peaceful countryside scene, Japanese aesthetic, film grain texture, dreamy atmosphere.',
    example:
      'Soft pastel colors of pink cherry blossoms, gentle sunlight filtering through trees, peaceful countryside scene with a small wooden bridge, Japanese aesthetic, film grain texture, dreamy atmosphere, soft focus, spring morning.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    tags: ['日系', '风景', '清新'],
    source: 'PromptManage 日系风格',
    professions: ['摄影师', '视觉设计师', '社交媒体设计师', '内容创作者']
  },
  {
    id: 'image-5',
    category: 'image',
    title: '抽象艺术插画',
    description:
      'Abstract geometric patterns with vibrant colors, modern art style, bold shapes and lines, contemporary design, high contrast, dynamic composition.',
    example:
      'Abstract geometric patterns with vibrant colors of blue, orange, and purple, modern art style, bold shapes and flowing lines creating movement, contemporary design, high contrast between light and dark areas, dynamic composition with diagonal elements.',
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop',
    tags: ['抽象', '艺术', '现代'],
    source: 'PromptManage 艺术创作',
    professions: ['平面设计师', '艺术指导', '品牌设计师', '创意总监']
  },
  {
    id: 'image-6',
    category: 'image',
    title: '复古海报设计',
    description:
      'Vintage poster design with retro typography, muted color palette, classic composition, nostalgic feel, 1950s aesthetic.',
    example:
      'Vintage poster design for a jazz concert, retro typography with bold serif fonts, muted color palette of cream, burgundy, and gold, classic composition with central image, nostalgic feel, 1950s aesthetic, aged paper texture.',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
    tags: ['复古', '海报', '设计'],
    source: 'PromptManage 设计灵感',
    professions: ['平面设计师', '海报设计师', '品牌设计师', '视觉设计师']
  }
];


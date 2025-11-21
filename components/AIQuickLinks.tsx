import { Space, Typography } from 'antd';
import type { PromptCategory } from '../data/prompts';

const { Text } = Typography;

interface AIPlatform {
  name: string;
  url: string;
  color: string;
}

// 文生文平台（AI 聊天）
const textPlatforms: AIPlatform[] = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    color: '#10a37f'
  },
  {
    name: 'DeepSeek',
    url: 'https://www.deepseek.com',
    color: '#1e1e1e'
  },
  {
    name: '豆包',
    url: 'https://www.doubao.com',
    color: '#ff6b35'
  },
  {
    name: '通义千问',
    url: 'https://tongyi.aliyun.com',
    color: '#1890ff'
  },
  {
    name: '文心一言',
    url: 'https://yiyan.baidu.com',
    color: '#eb2f96'
  },
  {
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    color: '#722ed1'
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    color: '#fa8c16'
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: '#52c41a'
  }
];

// 文生图平台（AI 绘图）
const imagePlatforms: AIPlatform[] = [
  {
    name: 'Midjourney',
    url: 'https://www.midjourney.com',
    color: '#2d2d2d'
  },
  {
    name: 'Stable Diffusion',
    url: 'https://stability.ai',
    color: '#8b5cf6'
  },
  {
    name: 'DALL-E',
    url: 'https://openai.com/dall-e-3',
    color: '#10a37f'
  },
  {
    name: 'Leonardo.ai',
    url: 'https://leonardo.ai',
    color: '#ff6b35'
  },
  {
    name: '文心一格',
    url: 'https://yige.baidu.com',
    color: '#eb2f96'
  },
  {
    name: '通义万相',
    url: 'https://tongyi.aliyun.com/wanxiang',
    color: '#1890ff'
  },
  {
    name: '6pen',
    url: 'https://6pen.art',
    color: '#722ed1'
  },
  {
    name: 'Tiamat',
    url: 'https://www.tiamat.ai',
    color: '#fa8c16'
  }
];

// 文生视频平台
const videoPlatforms: AIPlatform[] = [
  {
    name: 'Runway',
    url: 'https://runwayml.com',
    color: '#000000'
  },
  {
    name: 'Pika',
    url: 'https://pika.art',
    color: '#ff6b35'
  },
  {
    name: 'Stable Video',
    url: 'https://stability.ai/stable-video',
    color: '#8b5cf6'
  },
  {
    name: 'Kling AI',
    url: 'https://klingai.com',
    color: '#1890ff'
  },
  {
    name: 'Gen-2',
    url: 'https://runwayml.com/gen2',
    color: '#000000'
  }
];

interface AIQuickLinksProps {
  activeCategory: PromptCategory;
}

export function AIQuickLinks({ activeCategory }: AIQuickLinksProps) {
  let platforms: AIPlatform[] = textPlatforms;
  let label = 'AI 聊天平台：';

  if (activeCategory === 'image') {
    platforms = imagePlatforms;
    label = 'AI 绘图平台：';
  } else if (activeCategory === 'video') {
    platforms = videoPlatforms;
    label = 'AI 视频平台：';
  }

  return (
    <div className="ai-quick-links">
      <Text type="secondary" className="ai-links-label" style={{ marginRight: 12, fontSize: 14 }}>
        {label}
      </Text>
      <Space size={12} wrap className="ai-links-space">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noreferrer"
            className="ai-link-item"
            style={{
              color: platform.color,
              borderColor: platform.color
            }}
          >
            <span>{platform.name}</span>
            <span style={{ fontSize: 12, marginLeft: 4 }}>↗</span>
          </a>
        ))}
      </Space>
    </div>
  );
}


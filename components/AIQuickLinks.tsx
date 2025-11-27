import { useEffect, useState, useMemo } from 'react';
import { Space, Typography, Spin } from 'antd';
import type { PromptCategory } from '../data/prompts';
import { fetchPlatforms, type PlatformResponse } from '../utils/api';

const { Text } = Typography;

interface AIPlatform {
  name: string;
  url: string;
  color: string;
}

// 预设颜色列表，用于为平台分配颜色
const colorPalette = [
  '#10a37f',
  '#1e1e1e',
  '#ff6b35',
  '#1890ff',
  '#eb2f96',
  '#722ed1',
  '#fa8c16',
  '#52c41a',
  '#2d2d2d',
  '#8b5cf6',
  '#000000'
];

// 根据平台名称生成颜色（确保相同名称总是得到相同颜色）
function getColorForPlatform(name: string, index: number): string {
  // 使用名称的哈希值来选择颜色，确保相同名称总是得到相同颜色
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

// 将 PromptCategory 映射到 API 的 ai_chat_type
function mapCategoryToAIChatType(
  category: PromptCategory
): 'text_generation' | 'image_generation' | 'video_generation' {
  switch (category) {
    case 'text':
      return 'text_generation';
    case 'image':
      return 'image_generation';
    case 'video':
      return 'video_generation';
    default:
      return 'text_generation';
  }
}

// 获取分类对应的标签文本
function getLabelForCategory(category: PromptCategory): string {
  switch (category) {
    case 'text':
      return 'AI 聊天平台：';
    case 'image':
      return 'AI 绘图平台：';
    case 'video':
      return 'AI 视频平台：';
    default:
      return 'AI 聊天平台：';
  }
}

interface AIQuickLinksProps {
  activeCategory: PromptCategory;
}

export function AIQuickLinks({ activeCategory }: AIQuickLinksProps) {
  const [allPlatforms, setAllPlatforms] = useState<PlatformResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 只在组件挂载时加载一次所有平台数据
  useEffect(() => {
    const loadPlatforms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const platformData = await fetchPlatforms();
        setAllPlatforms(platformData);
      } catch (err) {
        console.error('加载平台列表失败:', err);
        setError('加载平台列表失败');
        setAllPlatforms([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlatforms();
  }, []); // 只在组件挂载时执行一次

  // 根据当前分类过滤平台
  const platforms = useMemo(() => {
    const aiChatType = mapCategoryToAIChatType(activeCategory);
    const filtered = allPlatforms.filter(
      (platform) => platform.AIChatType === aiChatType
    );
    
    // 将接口返回的数据转换为组件需要的格式
    return filtered.map((platform: PlatformResponse, index: number) => ({
      name: platform.Title,
      url: platform.Link,
      color: getColorForPlatform(platform.Title, index)
    }));
  }, [allPlatforms, activeCategory]);

  const label = getLabelForCategory(activeCategory);

  if (loading) {
    return (
      <div className="ai-quick-links">
        <Text type="secondary" className="ai-links-label" style={{ marginRight: 12, fontSize: 14 }}>
          {label}
        </Text>
        <Spin size="small" />
      </div>
    );
  }

  if (error || platforms.length === 0) {
    return null; // 如果加载失败或没有平台，不显示任何内容
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


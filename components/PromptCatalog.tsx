import { useMemo, useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Image,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography
} from 'antd';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';
import type { PromptCategory, PromptItem } from '../data/prompts';
import { promptCategories } from '../data/prompts';
import { AIQuickLinks } from './AIQuickLinks';
import { fetchPrompts, type PromptResponse } from '../utils/api';

const { Paragraph, Text, Title } = Typography;

interface PromptCatalogProps {
  activeCategory: PromptCategory;
  onCategoryChange: (category: PromptCategory) => void;
}

// 将 API 返回的数据转换为 PromptItem 格式
// 将 API 返回的数据转换为 PromptItem 格式
function convertPromptResponseToItem(response: PromptResponse): PromptItem {
  return {
    id: response.ID.toString(),
    category: response.Category,
    title: response.Title,
    description: response.Description,
    example: response.Example && response.Example.trim() ? response.Example : undefined,
    imageUrl: response.ImageURL && response.ImageURL.trim() ? response.ImageURL : undefined,
    videoUrl: response.VideoURL && response.VideoURL.trim() ? response.VideoURL : undefined,
    tags: response.Tags.map((tag) => tag.Tag),
    source: response.Source && response.Source.trim() ? response.Source : undefined,
    professions: response.Professions.map((prof) => prof.Job)
  };
}

export function PromptCatalog({
  activeCategory,
  onCategoryChange
}: PromptCatalogProps) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(600);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allProfessions, setAllProfessions] = useState<string[]>([]);

  // 搜索防抖：延迟 500ms 更新搜索值
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // 获取提示词数据
  useEffect(() => {
    const loadPrompts = async () => {
      setLoading(true);
      try {
        const result = await fetchPrompts({
          category: activeCategory,
          page: 1,
          pageSize: 1000, // 获取所有数据，如果后端支持分页可以优化
          search: debouncedSearchValue || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          professions: selectedProfessions.length > 0 ? selectedProfessions : undefined
        });

        const convertedPrompts = result.items.map(convertPromptResponseToItem);
        setPrompts(convertedPrompts);

        // 提取所有标签和职业（用于筛选器）
        const tagSet = new Set<string>();
        const professionSet = new Set<string>();
        convertedPrompts.forEach((prompt) => {
          prompt.tags.forEach((tag) => tagSet.add(tag));
          if (prompt.professions) {
            prompt.professions.forEach((profession) => professionSet.add(profession));
          }
        });
        setAllTags(Array.from(tagSet).sort());
        setAllProfessions(Array.from(professionSet).sort());
      } catch (error) {
        console.error('加载提示词失败:', error);
        message.error('加载提示词失败，请稍后重试');
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrompts();
  }, [activeCategory, debouncedSearchValue, selectedTags, selectedProfessions]);

  useEffect(() => {
    const updateDrawerWidth = () => {
      if (typeof window !== 'undefined') {
        setDrawerWidth(window.innerWidth < 768 ? window.innerWidth : 600);
      }
    };

    updateDrawerWidth();
    window.addEventListener('resize', updateDrawerWidth);
    return () => window.removeEventListener('resize', updateDrawerWidth);
  }, []);

  const filteredPrompts = useMemo(() => {
    // 由于已经在 API 层面进行了筛选，这里直接返回 prompts
    // 如果需要前端二次筛选，可以在这里添加逻辑
    return prompts;
  }, [prompts]);

  const handleCopy = (prompt: PromptItem) => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') {
      return;
    }

    // 卡片复制只复制模板
    const textToCopy = prompt.description;
    
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        message.success('提示词已复制到剪贴板');
      }).catch(() => {
        // 降级方案：使用传统方法
        fallbackCopyTextToClipboard(textToCopy);
      });
    } else {
      // 降级方案：使用传统方法
      fallbackCopyTextToClipboard(textToCopy);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    // 双重检查浏览器环境
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      message.error('复制功能不可用');
      return;
    }
    
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      if (successful) {
        message.success('提示词已复制到剪贴板');
      } else {
        message.error('复制失败，请手动复制');
      }
      
      document.body.removeChild(textArea);
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
  };

  const handleViewDetail = (prompt: PromptItem) => {
    setSelectedPrompt(prompt);
    setDrawerVisible(true);
  };

  const handleCopyTemplate = (prompt: PromptItem) => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') {
      return;
    }

    const textToCopy = prompt.description;
    
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        message.success('提示词模板已复制到剪贴板');
      }).catch(() => {
        fallbackCopyTextToClipboard(textToCopy);
      });
    } else {
      fallbackCopyTextToClipboard(textToCopy);
    }
  };

  const handleCopyExample = (prompt: PromptItem) => {
    // 确保只在客户端执行
    if (typeof window === 'undefined' || !prompt.example) {
      return;
    }

    const textToCopy = prompt.example;
    
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        message.success('使用案例已复制到剪贴板');
      }).catch(() => {
        fallbackCopyTextToClipboard(textToCopy);
      });
    } else {
      fallbackCopyTextToClipboard(textToCopy);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* AI 快捷入口 */}
      <div className="ai-links-section">
        <AIQuickLinks activeCategory={activeCategory} />
      </div>

      {/* 顶部筛选栏 */}
      <div className="filter-bar">
        <Space size={16} wrap style={{ width: '100%' }} className="filter-space">
          <Input.Search
            allowClear
            placeholder="搜索提示词..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            style={{ flex: '1 1 300px', maxWidth: '400px' }}
          />
          <Select
            allowClear
            mode="multiple"
            value={selectedProfessions}
            placeholder="职业筛选"
            style={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '400px' }}
            maxTagCount="responsive"
            options={allProfessions.map((profession) => ({
              label: profession,
              value: profession
            }))}
            onChange={setSelectedProfessions}
          />
          <Select
            allowClear
            mode="multiple"
            value={selectedTags}
            placeholder="标签筛选"
            style={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '400px' }}
            maxTagCount="responsive"
            options={allTags.map((tag) => ({ label: tag, value: tag }))}
            onChange={setSelectedTags}
          />
        </Space>
      </div>

      {/* 卡片展示 */}
      {loading ? (
        <Card style={{ marginTop: 24 }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
          </div>
        </Card>
      ) : filteredPrompts.length === 0 ? (
        <Card style={{ marginTop: 24 }}>
          <Empty description="暂无匹配的提示词" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredPrompts.map((prompt) => (
            <Col
              key={prompt.id}
              xs={24}
              sm={12}
              md={12}
              lg={6}
              xl={6}
            >
              <Card
                hoverable
                bordered={false}
                style={{
                  height: '100%',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease'
                }}
              >
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ fontSize: 16, color: '#1f1f1f' }}>
                  {prompt.title}
                </Text>
                {prompt.source && (
                  <Text
                    type="secondary"
                    style={{ display: 'block', fontSize: 12, marginTop: 4 }}
                  >
                    {prompt.source}
                  </Text>
                )}
              </div>
              {prompt.category === 'image' && prompt.imageUrl ? (
                <div
                  style={{
                    marginBottom: 16,
                    height: '200px',
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <Image
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    preview={false}
                    fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E暂无图片%3C/text%3E%3C/svg%3E"
                  />
                </div>
              ) : prompt.category === 'video' && prompt.videoUrl ? (
                <div
                  style={{
                    marginBottom: 16,
                    height: '200px',
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: '#000'
                  }}
                >
                  <video
                    src={prompt.videoUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    controls={false}
                    loop
                    muted
                    playsInline
                    autoPlay
                    onMouseEnter={(e) => {
                      e.currentTarget.play();
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                    }}
                  />
                </div>
              ) : (
                <div
                  className="prompt-card-description"
                  style={{
                    marginBottom: 16,
                    height: '120px',
                    overflowY: 'auto',
                    paddingRight: 8
                  }}
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      color: '#595959',
                      lineHeight: 1.6,
                      fontSize: 14
                    }}
                  >
                    {prompt.description}
                  </Paragraph>
                </div>
              )}
              <div style={{ marginTop: 'auto' }}>
                <Space size={[6, 6]} wrap style={{ marginBottom: 12 }}>
                  {prompt.tags.map((tag) => (
                    <Tag
                      key={tag}
                      style={{
                        margin: 0,
                        borderRadius: 4,
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff'
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
                <Space size={8} style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(prompt);
                    }}
                  >
                    复制
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(prompt);
                    }}
                  >
                    详情
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      )}

      {/* 提示词详情抽屉 */}
      <Drawer
        title={selectedPrompt?.title}
        placement="right"
        width={drawerWidth}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedPrompt && (
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {selectedPrompt.category === 'image' && selectedPrompt.imageUrl && (
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  效果预览
                </Title>
                <Image
                  src={selectedPrompt.imageUrl}
                  alt={selectedPrompt.title}
                  style={{
                    width: '100%',
                    borderRadius: 8
                  }}
                  preview={{
                    mask: '查看大图'
                  }}
                />
              </div>
            )}
            {selectedPrompt.category === 'video' && selectedPrompt.videoUrl && (
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  效果预览
                </Title>
                <video
                  src={selectedPrompt.videoUrl}
                  style={{
                    width: '100%',
                    borderRadius: 8
                  }}
                  controls
                  loop
                />
              </div>
            )}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  提示词模板
                </Title>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopyTemplate(selectedPrompt)}
                >
                  复制模板
                </Button>
              </div>
              <Paragraph
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 8,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8
                }}
              >
                {selectedPrompt.description}
              </Paragraph>
            </div>

            {selectedPrompt.example && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    使用案例
                  </Title>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyExample(selectedPrompt)}
                  >
                    复制案例
                  </Button>
                </div>
                <Paragraph
                  style={{
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    padding: 16,
                    borderRadius: 8,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8,
                    color: '#0050b3'
                  }}
                >
                  {selectedPrompt.example}
                </Paragraph>
              </div>
            )}

            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                标签
              </Title>
              <Space size={[8, 8]} wrap>
                {selectedPrompt.tags.map((tag) => (
                  <Tag
                    key={tag}
                    style={{
                      borderRadius: 4,
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      padding: '4px 12px'
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            {selectedPrompt.professions && selectedPrompt.professions.length > 0 && (
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  适合职业
                </Title>
                <Space size={[8, 8]} wrap>
                  {selectedPrompt.professions.map((profession) => (
                    <Tag
                      key={profession}
                      color="blue"
                      style={{
                        borderRadius: 4,
                        padding: '4px 12px'
                      }}
                    >
                      {profession}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {selectedPrompt.source && (
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>
                  来源
                </Title>
                <Text type="secondary">{selectedPrompt.source}</Text>
              </div>
            )}

            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                分类
              </Title>
              <Tag color="purple">
                {promptCategories[selectedPrompt.category].label}
              </Tag>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
}


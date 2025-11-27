import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Layout,
  Card,
  List,
  Menu,
  Pagination,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Empty,
  Spin,
  message
} from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { articleCategories } from '../data/articles';
import type { Article } from '../data/articles';
import type { PromptCategory } from '../data/prompts';
import { promptCategories } from '../data/prompts';
import { fetchArticles, type ArticleResponse } from '../utils/api';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// 将 API 返回的数据转换为 Article 格式
function convertArticleResponseToItem(response: ArticleResponse): Article {
  // 将 ISO 8601 格式的日期转换为 YYYY-MM-DD 格式
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('日期格式转换失败:', error);
      return dateString.split('T')[0]; // 降级方案
    }
  };

  return {
    id: response.ID.toString(),
    title: response.Title,
    description: response.Description,
    content: response.Content,
    category: response.Category,
    publishDate: formatDate(response.PublishDate),
    views: response.Views,
    author: response.Author || undefined
  };
}

export default function NewsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['全部']);
  const pageSize = 10;

  const menuItems = [
    ...(Object.keys(promptCategories) as PromptCategory[]).map((key) => ({
      key,
      label: promptCategories[key].label
    })),
    {
      key: 'news',
      label: 'AI 资讯'
    }
  ];

  const handleMenuClick = (info: { key: string }) => {
    if (info.key === 'news') {
      // 已经在资讯页面，不需要跳转
      return;
    } else {
      router.push('/');
    }
  };

  // 获取文章数据
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const result = await fetchArticles({
          page: currentPage,
          pageSize,
          category: selectedCategory === '全部' ? undefined : selectedCategory
        });

        const convertedArticles = result.items.map(convertArticleResponseToItem);
        setArticles(convertedArticles);
        setTotal(result.total);

        // 从文章数据中提取所有分类（用于显示分类标签）
        // 如果 API 返回了所有分类，可以在这里更新
        // 目前使用静态分类列表，但保留扩展能力
      } catch (error) {
        console.error('加载文章失败:', error);
        message.error('加载文章失败，请稍后重试');
        setArticles([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentPage, selectedCategory]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/news/${articleId}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 切换分类时重置到第一页
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到顶部
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        className="site-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          width: '100%',
          padding: '0 16px'
        }}
      >
        <Title level={4} className="site-title" style={{ margin: '0 12px 0 0', fontSize: 16 }}>
          Prompt 管理
        </Title>
        <Menu
          mode="horizontal"
          items={menuItems}
          selectedKeys={['news']}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0 }}
          className="site-menu"
        />
      </Header>
      <Content style={{ padding: '16px', background: '#f7f5ff', marginTop: 64 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <Row gutter={24}>
            {/* 左侧：文章列表 */}
            <Col xs={24} lg={16}>
              <Card
                title={<div style={{ fontSize: 20, fontWeight: 600 }}>AI 资讯</div>}
                bordered={false}
                style={{ marginBottom: 24 }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
                  </div>
                ) : articles.length === 0 ? (
                  <Empty description="暂无文章" />
                ) : (
                  <List
                    dataSource={articles}
                    renderItem={(article) => (
                      <List.Item
                        style={{
                          padding: '20px 0',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleArticleClick(article.id)}
                      >
                        <List.Item.Meta
                          title={
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 600,
                                margin: 0,
                                marginBottom: 8,
                                color: '#1890ff',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArticleClick(article.id);
                              }}
                            >
                              {article.title}
                            </div>
                          }
                          description={
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                              <Paragraph
                                ellipsis={{ rows: 2 }}
                                style={{ margin: 0, color: '#595959' }}
                              >
                                {article.description}
                              </Paragraph>
                              <Space size={16}>
                                <Space size={4}>
                                  <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {article.publishDate}
                                  </Text>
                                </Space>
                                <Space size={4}>
                                  <EyeOutlined style={{ color: '#8c8c8c' }} />
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {article.views} 次浏览
                                  </Text>
                                </Space>
                                {article.author && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {article.author}
                                  </Text>
                                )}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 篇文章`}
                  />
                </div>
              </Card>
            </Col>

            {/* 右侧：分类标签 */}
            <Col xs={24} lg={8}>
              <Card
                title="文章分类"
                bordered={false}
                style={{ position: 'sticky', top: 24 }}
              >
                <Space size={[8, 8]} wrap>
                  {articleCategories.map((category) => {
                    // 检查该分类是否有文章（可选：根据实际数据动态显示）
                    return (
                      <Tag
                        key={category}
                        color={selectedCategory === category ? 'blue' : 'default'}
                        style={{
                          cursor: 'pointer',
                          padding: '4px 12px',
                          fontSize: 14
                        }}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </Tag>
                    );
                  })}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        <a
          href="https://chromewebstore.google.com/detail/prompt-manager/mpbmllfmbcbonjmlmkfkjhdfmlccffgp"
          target="_blank"
          rel="noreferrer"
        >
          chrome提示词插件
        </a>
      </Footer>
    </Layout>
  );
}


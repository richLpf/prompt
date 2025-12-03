import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layout, Card, Menu, Typography, Space, Button, Tag, Spin, message } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import type { Article } from '../../data/articles';
import ReactMarkdown from 'react-markdown';
import type { PromptCategory } from '../../data/prompts';
import { promptCategories } from '../../data/prompts';
import { fetchArticle, type ArticleResponse } from '../../utils/api';

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

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id || typeof id !== 'string') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetchArticle(id);
        const convertedArticle = convertArticleResponseToItem(response);
        setArticle(convertedArticle);
      } catch (error) {
        console.error('加载文章失败:', error);
        message.error('加载文章失败，请稍后重试');
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  const menuItems = [
    ...(Object.keys(promptCategories) as PromptCategory[]).map((key) => ({
      key,
      label: promptCategories[key].label
    })),
    {
      key: 'news',
      label: 'AI 资讯'
    },
    {
      key: 'contribute',
      label: '贡献提示词'
    }
  ];

  const handleMenuClick = (info: { key: string }) => {
    if (info.key === 'news') {
      router.push('/news');
    } else if (info.key === 'contribute') {
      window.open('https://d0p1dcsh17r.feishu.cn/share/base/form/shrcnqbnFz0I6finkDBLSFJjsRh', '_blank');
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px', textAlign: 'center', marginTop: 64 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
        </Content>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px', textAlign: 'center', marginTop: 64 }}>
          <Title level={3}>文章不存在</Title>
          <Button onClick={() => router.push('/news')}>返回列表</Button>
        </Content>
      </Layout>
    );
  }

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
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/news')}
            style={{ marginBottom: 24 }}
          >
            返回列表
          </Button>

          <Card bordered={false} style={{ background: '#fff' }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <h1 className="article-title">
                  {article.title}
                </h1>
                <Space size={16} wrap>
                  <Space size={4}>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">{article.publishDate}</Text>
                  </Space>
                  <Space size={4}>
                    <EyeOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">{article.views} 次浏览</Text>
                  </Space>
                  {article.author && (
                    <Text type="secondary">作者：{article.author}</Text>
                  )}
                  <Tag color="blue">{article.category}</Tag>
                </Space>
              </div>

              <div
                style={{
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: 24,
                  marginTop: 16
                }}
              >
                <div className="markdown-content">
                  <ReactMarkdown>{article.content}</ReactMarkdown>
                </div>
              </div>
            </Space>
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        数据参考自{' '}
        <a href="https://PromptManage.xin/prompts" target="_blank" rel="noreferrer">
          PromptManage
        </a>{' '}
        ，用于演示三大提示词目录
      </Footer>
    </Layout>
  );
}


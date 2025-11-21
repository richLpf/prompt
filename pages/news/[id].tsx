import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layout, Card, Menu, Typography, Space, Button, Tag } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { articles, type Article } from '../../data/articles';
import ReactMarkdown from 'react-markdown';
import type { PromptCategory } from '../../data/prompts';
import { promptCategories } from '../../data/prompts';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const foundArticle = articles.find((a) => a.id === id);
      setArticle(foundArticle || null);
    }
  }, [id]);

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
      router.push('/news');
    } else {
      router.push('/');
    }
  };

  if (!article) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px', textAlign: 'center' }}>
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


import { useState, useMemo } from 'react';
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
  Empty
} from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { articles, articleCategories } from '../data/articles';
import type { PromptCategory } from '../data/prompts';
import { promptCategories } from '../data/prompts';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function NewsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [currentPage, setCurrentPage] = useState(1);
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

  // 筛选文章
  const filteredArticles = useMemo(() => {
    if (selectedCategory === '全部') {
      return articles;
    }
    return articles.filter((article) => article.category === selectedCategory);
  }, [selectedCategory]);

  // 分页数据
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredArticles.slice(start, end);
  }, [filteredArticles, currentPage]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/news/${articleId}`);
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
                {paginatedArticles.length === 0 ? (
                  <Empty description="暂无文章" />
                ) : (
                  <List
                    dataSource={paginatedArticles}
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
                    total={filteredArticles.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
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
                  {articleCategories.map((category) => (
                    <Tag
                      key={category}
                      color={selectedCategory === category ? 'blue' : 'default'}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 12px',
                        fontSize: 14
                      }}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                    >
                      {category}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
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


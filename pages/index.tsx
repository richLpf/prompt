import { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout, Menu, Typography } from 'antd';
import { PromptCatalog } from '../components/PromptCatalog';
import type { PromptCategory } from '../data/prompts';
import { promptCategories } from '../data/prompts';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<PromptCategory>('text');

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
      setActiveCategory(info.key as PromptCategory);
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
          selectedKeys={[activeCategory]}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0 }}
          className="site-menu"
        />
      </Header>
      <Content style={{ padding: '16px', background: '#f7f5ff', marginTop: 64 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <PromptCatalog
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
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


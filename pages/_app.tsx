import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ConfigProvider, theme as antdTheme } from 'antd';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PromptManage 精选提示词</title>
        <meta
          name="description"
          content="借鉴 PromptManage 的三大提示词目录，快速筛选文生文、文生图、文生视频提示词。"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ConfigProvider
        theme={{
          algorithm: antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#722ed1',
            borderRadius: 8,
            fontFamily:
              'Inter, "PingFang SC", "Microsoft Yahei", system-ui, sans-serif'
          }
        }}
      >
        <Component {...pageProps} />
      </ConfigProvider>
    </>
  );
}


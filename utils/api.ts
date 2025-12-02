// API 服务工具函数

export interface PlatformResponse {
  ID: number;
  Title: string;
  AIChatType: 'text_generation' | 'image_generation' | 'video_generation';
  Link: string;
  SortOrder: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 提示词相关类型定义
export interface PromptTagResponse {
  ID: number;
  PromptID: number;
  Tag: string;
}

export interface PromptProfessionResponse {
  ID: number;
  PromptID: number;
  Job: string;
}

export interface PromptResponse {
  ID: number;
  Category: 'text' | 'image' | 'video';
  Title: string;
  Description: string;
  Example: string;
  ImageURL: string;
  VideoURL: string;
  Source: string;
  CopyCount: number;
  Tags: PromptTagResponse[];
  Professions: PromptProfessionResponse[];
  CreatedAt: string;
  UpdatedAt: string;
}

export interface PromptsListResponse {
  items: PromptResponse[];
  page: number;
  pageSize: number;
  total: number;
}

export interface FetchPromptsParams {
  category: 'text' | 'image' | 'video';
  page?: number;
  pageSize?: number;
  search?: string;
  tags?: string[];
  professions?: string[];
}

// 文章相关类型定义
export interface ArticleResponse {
  ID: number;
  Title: string;
  Description: string;
  Content: string;
  Category: string;
  PublishDate: string; // ISO 8601 格式
  Views: number;
  Author: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ArticlesListResponse {
  items: ArticleResponse[];
  page: number;
  pageSize: number;
  total: number;
}

export interface FetchArticlesParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

/**
 * 获取所有 AI 平台列表
 * @returns 平台列表
 */
export async function fetchPlatforms(): Promise<PlatformResponse[]> {
  try {
    // 优先使用环境变量，如果没有设置，生产环境使用 https://prompt-api.questionlearn.cn/api/platforms
    // 开发环境（localhost）继续使用代理路径
    const apiUrl = process.env.NEXT_PUBLIC_PLATFORMS_API_URL 
      || (typeof window !== 'undefined' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1'
          ? 'https://prompt-api.questionlearn.cn/api/platforms'
          : '/api/platforms');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PlatformResponse[]> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message || '获取平台列表失败');
    }

    // 只返回激活状态的平台，并按 SortOrder 排序
    return result.data
      .filter((platform) => platform.IsActive)
      .sort((a, b) => a.SortOrder - b.SortOrder);
  } catch (error) {
    console.error('获取平台列表失败:', error);
    throw error;
  }
}

/**
 * 获取提示词列表
 * @param params 查询参数
 * @returns 提示词列表及分页信息
 */
export async function fetchPrompts(
  params: FetchPromptsParams
): Promise<PromptsListResponse> {
  try {
    const { category, page = 1, pageSize = 10, search, tags, professions } = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      category,
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    if (search) {
      queryParams.append('search', search);
    }
    
    if (tags && tags.length > 0) {
      queryParams.append('tags', tags.join(','));
    }
    
    if (professions && professions.length > 0) {
      queryParams.append('professions', professions.join(','));
    }
    
    // 生产环境直接请求外部 API: http://47.100.3.71:9000/api/prompts
    // 优先使用环境变量，如果没有设置，生产环境使用 http://47.100.3.71:9000/api/prompts
    // 开发环境（localhost）继续使用代理路径
    const apiUrl = process.env.NEXT_PUBLIC_PROMPTS_API_URL 
      || (typeof window !== 'undefined' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1'
          ? 'https://prompt-api.questionlearn.cn/api/prompts'
          : '/api/prompts');
    
    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PromptsListResponse> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message || '获取提示词列表失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取提示词列表失败:', error);
    throw error;
  }
}

/**
 * 获取文章列表
 * @param params 查询参数
 * @returns 文章列表及分页信息
 */
export async function fetchArticles(
  params: FetchArticlesParams = {}
): Promise<ArticlesListResponse> {
  try {
    const { page = 1, pageSize = 10, category, search } = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    if (category && category !== '全部') {
      queryParams.append('category', category);
    }
    
    if (search) {
      queryParams.append('search', search);
    }
    
    // 优先使用环境变量，如果没有设置，生产环境使用 https://prompt-api.questionlearn.cn/api/articles
    // 开发环境（localhost）继续使用代理路径
    const apiUrl = process.env.NEXT_PUBLIC_ARTICLES_API_URL 
      || (typeof window !== 'undefined' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1'
          ? 'https://prompt-api.questionlearn.cn/api/articles'
          : '/api/articles');
    
    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<ArticlesListResponse> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message || '获取文章列表失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
}

/**
 * 获取单篇文章详情
 * @param id 文章ID
 * @returns 文章详情
 */
export async function fetchArticle(id: string | number): Promise<ArticleResponse> {
  try {
    // 优先使用环境变量，如果没有设置，生产环境使用 https://prompt-api.questionlearn.cn/api/articles
    // 开发环境（localhost）继续使用代理路径
    const baseUrl = process.env.NEXT_PUBLIC_ARTICLES_API_URL 
      || (typeof window !== 'undefined' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1'
          ? 'https://prompt-api.questionlearn.cn/api/articles'
          : '/api/articles');
    
    // 构建详情页 URL: baseUrl/{id}
    const apiUrl = `${baseUrl}/${id}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<ArticleResponse> = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message || '获取文章详情失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    throw error;
  }
}


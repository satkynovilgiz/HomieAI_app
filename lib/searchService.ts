import { SearchType } from './searchDetector';

const YOUTUBE_KEY = 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY';

export interface VideoResult {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  description: string;
  url: string;
  source: 'youtube';
  duration?: string;
}

export interface ArticleResult {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt?: string;
  thumbnail?: string;
}

export type SearchResult = VideoResult | ArticleResult;

export async function searchYouTube(query: string): Promise<VideoResult[]> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=4&q=${encodeURIComponent(query)}&key=${YOUTUBE_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || '',
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source: 'youtube' as const,
    }));
  } catch {
    return [];
  }
}

export async function searchWeb(query: string): Promise<ArticleResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url);
    const data = await res.json();

    const results: ArticleResult[] = [];

    if (data.Abstract) {
      results.push({
        id: 'abstract',
        title: data.Heading || query,
        description: data.Abstract,
        url: data.AbstractURL || `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        source: data.AbstractSource || 'Web',
        thumbnail: data.Image || undefined,
      });
    }

    (data.RelatedTopics || []).slice(0, 3).forEach((topic: any, i: number) => {
      if (topic.Text && topic.FirstURL) {
        results.push({
          id: `topic_${i}`,
          title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 60),
          description: topic.Text,
          url: topic.FirstURL,
          source: 'Web',
          thumbnail: topic.Icon?.URL || undefined,
        });
      }
    });

    if (results.length === 0) {
      results.push({
        id: 'google',
        title: `Search Google for "${query}"`,
        description: `Tap to search Google for "${query}" and find articles, websites and more.`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        source: 'Google',
      });
    }

    return results;
  } catch {
    return [{
      id: 'google',
      title: `Search Google for "${query}"`,
      description: `Tap to search Google for "${query}" and find articles, websites and more.`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      source: 'Google',
    }];
  }
}

function youtubeSearchFallback(query: string): ArticleResult {
  return {
    id: 'youtube_search',
    title: `Search YouTube for "${query}"`,
    description: `Couldn't pull specific videos right now — tap to see YouTube's search results for "${query}" instead.`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    source: 'YouTube',
  };
}

export async function smartSearch(query: string, type: SearchType): Promise<{
  videos: VideoResult[];
  articles: ArticleResult[];
}> {
  if (type === 'video') {
    const videos = await searchYouTube(query);
    return videos.length ? { videos, articles: [] } : { videos: [], articles: [youtubeSearchFallback(query)] };
  }
  if (type === 'article') {
    const articles = await searchWeb(query);
    return { videos: [], articles };
  }
  const [videos, articles] = await Promise.allSettled([
    searchYouTube(query),
    searchWeb(query),
  ]);
  return {
    videos: videos.status === 'fulfilled' ? videos.value.slice(0, 2) : [],
    articles: articles.status === 'fulfilled' ? articles.value.slice(0, 2) : [],
  };
}

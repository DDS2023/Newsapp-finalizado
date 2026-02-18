import axios from 'axios';
import 'dotenv/config';

const API_URL = 'https://newsapi.org/v2/everything';
const API_KEY = process.env.NEWS_API_KEY;

export async function searchNews(query, language = null) {
  if (!API_KEY) {
    throw new Error('API Key no configurada');
  }

  const languages = language ? language.split(',').map(l => l.trim()) : [null];

  // Crear una promesa para cada idioma
  const requests = languages.map(async (lang) => {
    const params = {
      q: query,
      apiKey: API_KEY
    };
    if (lang) {
      params.language = lang;
    }
    try {
      const response = await axios.get(API_URL, { params });
      return response.data.articles || [];
    } catch (error) {
      console.error(`Error fetching news for language ${lang}:`, error.message);
      return [];
    }
  });

  const results = await Promise.all(requests);

  // Aplanar y deduplicar por URL
  const allArticles = results.flat();
  const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.url, item])).values());

  return uniqueArticles;
}

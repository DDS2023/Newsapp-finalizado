import { searchNews } from '../infrastructure/NewsApiClient.js';

export async function searchNewsByText(text, language = null) {
  if (!text) {
    throw new Error('Texto de búsqueda requerido');
  }
  return await searchNews(text, language);
}

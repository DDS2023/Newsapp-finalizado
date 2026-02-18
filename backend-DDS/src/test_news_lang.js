import { searchNews } from './infrastructure/NewsApiClient.js';

async function testNewsFilter() {
    console.log('Testing News Filter...');

    try {
        // 1. Prueba con 'es'
        console.log('\n--- Searching for "technology" in Spanish (es) ---');
        const esNews = await searchNews('technology', 'es');
        console.log(`Found ${esNews.length} articles.`);
        if (esNews.length > 0) {
            console.log('Sample Title:', esNews[0].title);
            // Nota: No podemos asegurar fácilmente el idioma programáticamente sin una librería, 
            // pero el título probablemente debería estar en español o relacionado.
        }

        // 2. Prueba con 'en'
        console.log('\n--- Searching for "technology" in English (en) ---');
        const enNews = await searchNews('technology', 'en');
        console.log(`Found ${enNews.length} articles.`);
        if (enNews.length > 0) {
            console.log('Sample Title:', enNews[0].title);
        }

        // 3. Prueba sin idioma (todos)
        console.log('\n--- Searching for "technology" (No language filter) ---');
        const allNews = await searchNews('technology', null);
        console.log(`Found ${allNews.length} articles.`);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testNewsFilter();

// Migration utility để convert ảnh base64 cũ sang blob URL
import { migrateBase64ToBlob } from './imageStorage';
import { Product, NewsArticle } from '../types';

export const migrateProductsImages = async (products: Product[]): Promise<Product[]> => {
  const migratedProducts: Product[] = [];
  
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      try {
        const migratedImages = await migrateBase64ToBlob(product.images);
        migratedProducts.push({
          ...product,
          images: migratedImages
        });
      } catch (error) {
        console.error(`Error migrating images for product ${product.id}:`, error);
        migratedProducts.push(product); // Keep original on error
      }
    } else {
      migratedProducts.push(product);
    }
  }
  
  return migratedProducts;
};

export const migrateNewsImages = async (news: NewsArticle[]): Promise<NewsArticle[]> => {
  const migratedNews: NewsArticle[] = [];
  
  for (const article of news) {
    if (article.image) {
      try {
        // Migrate cover image
        if (article.image.startsWith('data:image/')) {
          const { saveBase64ToStorage } = await import('./imageStorage');
          article.image = await saveBase64ToStorage(article.image);
        }
        
        // Migrate images in content
        let content = article.content;
        const base64ImageRegex = /\[img\](data:image\/[^[]+)\[\/img\]/g;
        const matches = [...content.matchAll(base64ImageRegex)];
        
        for (const match of matches) {
          const base64Url = match[1];
          try {
            const { saveBase64ToStorage } = await import('./imageStorage');
            const blobUrl = await saveBase64ToStorage(base64Url);
            content = content.replace(match[0], `[img]${blobUrl}[/img]`);
          } catch (error) {
            console.error('Error migrating content image:', error);
          }
        }
        
        migratedNews.push({
          ...article,
          content
        });
      } catch (error) {
        console.error(`Error migrating images for news ${article.id}:`, error);
        migratedNews.push(article); // Keep original on error
      }
    } else {
      migratedNews.push(article);
    }
  }
  
  return migratedNews;
};


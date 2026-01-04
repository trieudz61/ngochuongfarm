// Utility functions để lưu trữ ảnh/video vào IndexedDB thay vì base64

// Khởi tạo IndexedDB
const DB_NAME = 'NgocHuongFarmImages';
const DB_VERSION = 1;
const STORE_NAME = 'images';

interface ImageData {
  id: string;
  blob: Blob;
  url: string;
}

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('url', 'url', { unique: false });
      }
    };
  });
};

// Chuyển File thành Blob và lưu vào IndexedDB
export const saveImageToStorage = async (file: File): Promise<string> => {
  try {
    const database = await initDB();
    
    // Tạo ID duy nhất
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Lưu Blob vào IndexedDB
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Tạo object URL từ file
      const url = URL.createObjectURL(file);
      
      // Lưu file như Blob
      const imageData: ImageData = {
        id,
        blob: file,
        url
      };
      
      const request = store.put(imageData);
      
      request.onsuccess = () => {
        // Trả về URL để lưu vào Redux store
        resolve(url);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving image to IndexedDB:', error);
    throw error;
  }
};

// Lưu từ base64 (cho backward compatibility)
export const saveBase64ToStorage = async (base64String: string): Promise<string> => {
  try {
    const database = await initDB();
    
    // Convert base64 to Blob
    const response = await fetch(base64String);
    const blob = await response.blob();
    
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const imageData: ImageData = {
        id,
        blob,
        url
      };
      
      const request = store.put(imageData);
      
      request.onsuccess = () => resolve(url);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving base64 to IndexedDB:', error);
    throw error;
  }
};

// Lấy URL từ IndexedDB (nếu là blob URL thì trả về luôn, nếu không thì tìm trong DB)
export const getImageUrl = async (urlOrId: string): Promise<string> => {
  // Nếu đã là blob URL hoặc http URL, trả về luôn
  if (urlOrId.startsWith('blob:') || urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) {
    return urlOrId;
  }
  
  // Nếu là base64, convert và lưu
  if (urlOrId.startsWith('data:image/') || urlOrId.startsWith('data:video/')) {
    return await saveBase64ToStorage(urlOrId);
  }
  
  // Tìm trong IndexedDB
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(urlOrId);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.url);
        } else {
          // Nếu không tìm thấy, trả về URL gốc (có thể là external URL)
          resolve(urlOrId);
        }
      };
      
      request.onerror = () => {
        resolve(urlOrId); // Fallback
      };
    });
  } catch (error) {
    console.error('Error getting image from IndexedDB:', error);
    return urlOrId; // Fallback
  }
};

// Xóa ảnh khỏi IndexedDB và revoke URL
export const deleteImageFromStorage = async (url: string): Promise<void> => {
  if (!url.startsWith('blob:')) {
    return; // Không phải blob URL, không cần xóa
  }
  
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('url');
      const request = index.get(url);
      
      request.onsuccess = () => {
        if (request.result) {
          // Revoke object URL
          URL.revokeObjectURL(url);
          
          // Xóa khỏi DB
          store.delete(request.result.id);
        }
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting image from IndexedDB:', error);
  }
};

// Migrate base64 images sang IndexedDB (chạy một lần)
export const migrateBase64ToBlob = async (base64Urls: string[]): Promise<string[]> => {
  const migratedUrls: string[] = [];
  
  for (const url of base64Urls) {
    if (url.startsWith('data:image/') || url.startsWith('data:video/')) {
      try {
        const blobUrl = await saveBase64ToStorage(url);
        migratedUrls.push(blobUrl);
      } catch (error) {
        console.error('Error migrating image:', error);
        migratedUrls.push(url); // Fallback
      }
    } else {
      migratedUrls.push(url);
    }
  }
  
  return migratedUrls;
};


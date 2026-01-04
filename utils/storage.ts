// Utility functions để lưu trữ dữ liệu lâu dài trong localStorage
// Đảm bảo dữ liệu không bị mất khi user quay lại

/**
 * Lưu dữ liệu vào localStorage với metadata
 */
export const savePersistentData = (key: string, data: any) => {
  try {
    const storageData = {
      data,
      timestamp: new Date().toISOString(),
      version: '1.0' // Có thể dùng để migrate data sau này
    };
    const serialized = JSON.stringify(storageData);
    localStorage.setItem(key, serialized);
    
    // Đặt một backup key để đảm bảo dữ liệu không bị mất
    localStorage.setItem(`${key}_backup`, serialized);
    
    console.log(`[Storage] Đã lưu ${key} vào localStorage`);
  } catch (err) {
    console.error(`[Storage] Lỗi khi lưu ${key}:`, err);
    
    // Nếu localStorage đầy, thử xóa backup cũ và lưu lại
    try {
      localStorage.removeItem(`${key}_backup`);
      const storageData = {
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(`${key}_backup`, JSON.stringify(storageData));
    } catch (backupErr) {
      console.error(`[Storage] Lỗi khi lưu backup ${key}:`, backupErr);
    }
  }
};

/**
 * Load dữ liệu từ localStorage, tự động restore từ backup nếu cần
 */
export const loadPersistentData = (key: string): any => {
  try {
    // Thử load từ key chính
    let item = localStorage.getItem(key);
    
    // Nếu không có, thử load từ backup
    if (!item) {
      item = localStorage.getItem(`${key}_backup`);
      if (item) {
        console.log(`[Storage] Đã restore ${key} từ backup`);
        // Restore lại vào key chính
        localStorage.setItem(key, item);
      }
    }
    
    if (!item) return undefined;
    
    const parsed = JSON.parse(item);
    
    // Trả về data nếu có structure với metadata, ngược lại trả về chính item (backward compatible)
    return parsed.data !== undefined ? parsed.data : parsed;
  } catch (err) {
    console.error(`[Storage] Lỗi khi load ${key}:`, err);
    
    // Thử load từ backup
    try {
      const backup = localStorage.getItem(`${key}_backup`);
      if (backup) {
        const parsed = JSON.parse(backup);
        // Restore lại
        localStorage.setItem(key, backup);
        return parsed.data !== undefined ? parsed.data : parsed;
      }
    } catch (backupErr) {
      console.error(`[Storage] Lỗi khi load backup ${key}:`, backupErr);
    }
    
    return undefined;
  }
};

/**
 * Xóa dữ liệu khỏi localStorage (cả backup)
 */
export const removePersistentData = (key: string) => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_backup`);
  } catch (err) {
    console.error(`[Storage] Lỗi khi xóa ${key}:`, err);
  }
};

/**
 * Kiểm tra localStorage có đủ dung lượng không
 */
export const checkStorageSpace = (): { available: boolean; size: number } => {
  try {
    // localStorage thường có giới hạn ~5-10MB
    const testKey = '__storage_test__';
    const testData = 'x'.repeat(1024 * 1024); // 1MB
    
    try {
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return { available: true, size: 1024 * 1024 };
    } catch (e) {
      return { available: false, size: 0 };
    }
  } catch (err) {
    return { available: false, size: 0 };
  }
};


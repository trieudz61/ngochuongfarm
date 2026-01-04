// Helper functions để xử lý tiếng Việt
// Chuyển tiếng Việt có dấu thành không dấu để search

export const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  
  str = str.toLowerCase();
  
  // Bảng chuyển đổi ký tự có dấu sang không dấu
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  
  // Loại bỏ các ký tự đặc biệt
  str = str.replace(/[^a-z0-9\s]/g, '');
  
  return str;
};

/**
 * So sánh 2 chuỗi tiếng Việt (bỏ dấu)
 * Trả về true nếu str1 chứa str2
 */
export const vietnameseIncludes = (str1: string, str2: string): boolean => {
  if (!str1 || !str2) return false;
  
  const normalized1 = removeVietnameseTones(str1);
  const normalized2 = removeVietnameseTones(str2);
  
  return normalized1.includes(normalized2);
};

/**
 * Search trong text tiếng Việt
 * Hỗ trợ tìm kiếm cả có dấu và không dấu
 */
export const vietnameseSearch = (text: string, query: string): boolean => {
  if (!query) return true; // Empty query matches everything
  if (!text) return false;
  
  // Search cả 2 cách: có dấu và không dấu
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // 1. Tìm chính xác (có dấu)
  if (lowerText.includes(lowerQuery)) {
    return true;
  }
  
  // 2. Tìm không dấu
  return vietnameseIncludes(text, query);
};



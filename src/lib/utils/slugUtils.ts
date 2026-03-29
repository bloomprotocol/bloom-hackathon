/**
 * 將標題轉換為 URL 友好的 slug
 * @param title 標題
 * @returns slug
 */
export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 空格和下劃線替換為連字符
    .replace(/^-+|-+$/g, ''); // 移除開頭和結尾的連字符
  
  console.log(`[generateSlug] Converting "${title}" to slug: "${slug}"`);
  return slug;
}

/**
 * 從 slug 反向生成可能的標題（用於搜索）
 * @param slug URL slug
 * @returns 可能的標題
 */
export function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()); // 每個單詞首字母大寫
}
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface LegalContent {
  title: string
  lastUpdated: string
  content: string
}

export function getLegalContent(type: 'privacy' | 'terms'): LegalContent {
  const filePath = path.join(process.cwd(), 'content', 'legal', `${type}.md`)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)
  
  return {
    title: data.title || '',
    lastUpdated: data.lastUpdated || '',
    content: content
  }
}
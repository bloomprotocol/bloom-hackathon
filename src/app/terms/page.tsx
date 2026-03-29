import { metadata } from './page.meta'
export { metadata }
import LegalPage from '@/components/legal/LegalPage'
import { getLegalContent } from '@/lib/utils/markdown'

export default function TermsPage() {
  const { title, lastUpdated, content } = getLegalContent('terms')
  
  return (
    <LegalPage 
      title={title}
      lastUpdated={lastUpdated}
      content={content}
    />
  )
}
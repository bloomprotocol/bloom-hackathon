import { metadata } from './page.meta'
export { metadata }
import LegalPage from '@/components/legal/LegalPage'
import { getLegalContent } from '@/lib/utils/markdown'

export default function PrivacyPage() {
  const { title, lastUpdated, content } = getLegalContent('privacy')
  
  return (
    <LegalPage 
      title={title}
      lastUpdated={lastUpdated}
      content={content}
    />
  )
}
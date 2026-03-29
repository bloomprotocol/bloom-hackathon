import { metadata } from './page.meta'
export { metadata }
import MissionsList from './MissionsList';

export default function MissionsPage() {
  return (
    <>
      {/* 固定背景覆蓋整個視窗（包括 Menu） */}
      <div className="fixed inset-0 bg-[url('https://statics.bloomprotocol.ai/images/body-light.jpg')] bg-cover bg-center bg-no-repeat -z-10" />
      
      {/* 內容區域 */}
      <div className="min-h-[calc(100vh-56px)] desktop:min-h-[calc(100vh-84px)] relative">
        <div className="mx-auto px-4 max-w-[1440px] w-full">
          <div>
            <h1 className="hidden desktop:block font-serif font-bold text-3xl text-[#1e1b4b] tracking-[-0.48px] mb-8">Missions</h1>
            <MissionsList />
          </div>
        </div>
      </div>
    </>
  );
}
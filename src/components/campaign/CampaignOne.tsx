// Campaign countdown timer component
'use client'

import { Container } from "@/components/ui";
import Image from 'next/image';
import randomWelcomeMessage from '@/lib/utils/welcomeMessages';
import { useEffect, useState } from 'react';

/**
 * 活动倒计时组件
 * 显示倒计时和宣传内容
 */
function CampaignOneContent() {
  // 添加點擊計數狀態
  const [clickCount, setClickCount] = useState(0);
  const [buttonText, setButtonText] = useState("Archived Drop: Early Community Pass");
  const [buttonColor, setButtonColor] = useState('rgba(142, 56, 255, 0.33)');

  useEffect(() => {
    console.log("%c" + randomWelcomeMessage.message, "font-size: 20px;");
  }, []);

  // 處理按鈕點擊 - 只改變文字和顏色
  const handleButtonClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    switch (newClickCount) {
      case 1:
        setButtonText("Early pass closed. Eyes up next time.");
        setButtonColor('rgba(142, 56, 255, 0.44)');
        break;
      case 2:
        setButtonText("*You'll want to be early next time.");
        setButtonColor('rgba(142, 56, 255, 0.55)');
        break;
      default:
        setButtonText("*You'll want to be early next time.");
        setButtonColor('rgba(142, 56, 255, 0.66)');
        break;
    }
  };

  return (
    <div className="relative">
      {/* Negative margin to offset the menu height */}
      <Container fluid className="relative px-4 flex items-center justify-center min-h-screen -mt-[12vh]">
        <div className="flex flex-col items-center w-full z-[2]">
          {/* Hero image */}
          <div className="relative w-full max-w-[535px] flex justify-center">
            <Image
              priority={true}
              src="https://statics.bloomprotocol.ai/campaign/one/campaign-one-hero.png"
              alt="heroImage"
              width={535}
              height={550}
              className="w-full h-auto"
            />
          </div>
          {/* Claim button - 使用動態顏色 */}
          <button
            onClick={handleButtonClick}
            className="border-none flex justify-center items-center text-white font-extrabold text-[18px] w-full max-w-[435px] h-[54px] rounded-[27px] z-[2] no-underline transition-all duration-300"
            style={{ 
              textDecoration: 'none',
              backgroundColor: buttonColor,
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)', // Safari 兼容
            }}
            onMouseEnter={(e) => {
              // hover 時增加 0.1 的透明度
              const currentOpacity = parseFloat(buttonColor.match(/[\d.]+(?=\))/)?.[0] || '0.33');
              e.currentTarget.style.backgroundColor = `rgba(142, 56, 255, ${Math.min(currentOpacity + 0.1, 1)})`;
            }}
            onMouseLeave={(e) => {
              // 恢復原本的顏色
              e.currentTarget.style.backgroundColor = buttonColor;
            }}
          >
            {buttonText}
          </button>
        </div>
      </Container>
      
      {/* Bottom grass image - positioned at viewport bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-[1] mobile:hidden">
        <Image
          src="https://statics.bloomprotocol.ai/campaign/one/grass.png"
          alt="bottomGrass"
          width={1440}
          height={149}
          className="w-full h-auto block"
          priority
        />
      </div>
    </div>
  );
}

export default function CampaignOne() {
  return <CampaignOneContent />;
}
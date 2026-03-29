export default function NotFound() {
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-[#e8e6e3] -z-10" />

      {/* Content */}
      <div className="relative mx-auto max-w-[1440px] w-full">
        <div className="px-4 desktop:px-[432px] desktop:pb-10 mobile:pb-6">
          <div className="flex flex-col gap-[24px] items-center justify-center py-[40px] min-h-[88vh]">
            <div className="flex flex-col gap-[12px] items-center justify-center w-full text-center">
              <p className="font-serif font-bold leading-[1.4] text-[#393f49] text-[32px]">
                404
              </p>
              <p className="font-light leading-[1.2] text-[#696f8c] text-[16px] tracking-[-0.32px]">
                Oops, this page got lost in time.
              </p>
            </div>
            <div className="overflow-clip relative shrink-0 size-[334px]">
              <div className="absolute flex items-center justify-center left-[-0.05px] top-[11px]" style={{ transform: 'rotate(345.114deg)', transformOrigin: 'center' }}>
                <div className="h-[245.672px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] w-[198.877px] bg-gradient-to-r from-[#d8d4cf] to-[#d8d4cf]" />
              </div>
              <div className="absolute flex items-center justify-center left-[46.99px] top-[26.93px]" style={{ transform: 'rotate(8.765deg)', transformOrigin: 'center' }}>
                <div className="bg-white h-[252px] overflow-clip relative shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] w-[204px]">
                  <div className="absolute flex flex-col font-light justify-center leading-[0] left-[10.91px] text-[#484848] text-[12px] top-[219.24px] translate-y-[-50%] w-[185.443px]">
                    <p className="leading-[normal]">"Where early support builds legends — even from the wrong turn."</p>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[64.72px] top-[36.2px]" style={{ transform: 'rotate(8.765deg)', transformOrigin: 'center' }}>
                <div className="relative size-[186px]">
                  <video autoPlay className="absolute max-w-none object-cover size-full" loop playsInline muted>
                    <source src="https://statics.bloomprotocol.ai/bp_404_animation.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
            <a href="/">
              <div className="bg-[#eb7cff] box-border flex gap-[6px] h-[48px] items-center justify-center overflow-clip px-[24px] py-[16px] relative rounded-[27px] shadow-[0px_1px_1px_0.05px_rgba(24,24,27,0.24)] shrink-0 w-[171px]">
                <p className="font-semibold leading-none text-[16px] text-center text-white">
                  Back to Home
                </p>
                <div className="flex gap-[8px] items-center relative shrink-0 w-[16px]">
                  <div className="overflow-clip relative shrink-0 size-[24px]">
                    <div className="absolute inset-[26.667%]">
                      <div className="absolute inset-[-7.143%]">
                        <svg className="block max-w-none size-full" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_0px_0px_inset_rgba(255,255,255,0.1),0px_8px_16px_0px_inset_rgba(255,255,255,0.16)]" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

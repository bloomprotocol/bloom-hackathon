"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  content: string;
}

export default function LegalPage({ title, lastUpdated, content }: LegalPageProps) {

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      {/* Content Container */}
      <div className="mx-auto max-w-[1440px]">
        <div className="px-4 py-12 desktop:px-[200px] desktop:py-20 flex flex-col gap-6 desktop:gap-10">
          {/* Title */}
          <h1 className="font-['Gilkys'] text-3xl desktop:text-[45px] text-[#434343] text-center tracking-[-0.9px] desktop:tracking-[-1.35px]">
            {title}
          </h1>
          
          {/* Content */}
          <div className="font-['Outfit'] text-base desktop:text-[18px] leading-7 desktop:leading-[32px] text-black">
            {/* Last Updated */}
            <p className="font-light mb-2">
              Last Updated: {lastUpdated}
            </p>
            
            {/* Markdown Content */}
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  // H2 標題樣式
                  h2: ({children}) => (
                    <p className="font-medium mb-2 mt-4">{children}</p>
                  ),
                  // H3 標題樣式
                  h3: ({children}) => (
                    <p className="font-medium mb-2 mt-3">{children}</p>
                  ),
                  // 段落樣式
                  p: ({children}) => (
                    <p className="font-light mb-2">{children}</p>
                  ),
                  // 列表樣式
                  ul: ({children}) => (
                    <ul className="list-disc ml-6 mb-2">{children}</ul>
                  ),
                  // 列表項樣式
                  li: ({children}) => (
                    <li className="font-light mb-1">{children}</li>
                  ),
                  // 粗體樣式
                  strong: ({children}) => (
                    <span className="font-medium">{children}</span>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
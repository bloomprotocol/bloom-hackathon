#!/bin/bash

# Playwright 測試產物清理腳本

echo "🧹 清理 Playwright 測試產物..."

# 清理測試結果目錄（保留最近的）
if [ -d "test-results" ]; then
    echo "清理 test-results 目錄..."
    # 保留最近 7 天的測試結果
    find test-results -type d -mtime +7 -exec rm -rf {} + 2>/dev/null
    echo "✅ 已清理 7 天前的測試結果"
fi

# 清理報告目錄
if [ -d "playwright-report" ]; then
    echo "清理 playwright-report 目錄..."
    rm -rf playwright-report
    echo "✅ 已清理測試報告"
fi

# 顯示剩餘大小
echo ""
echo "📊 清理後的狀態："
if [ -d "test-results" ]; then
    echo "test-results: $(du -sh test-results 2>/dev/null | cut -f1)"
fi

echo ""
echo "💡 提示："
echo "  - 運行 'npm run test:e2e' 會生成新的報告"
echo "  - 運行 'npx playwright show-report' 查看最新報告"
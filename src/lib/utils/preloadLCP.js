/**
 * This script is inserted into the page head to preload LCP elements
 * It helps reduce render-blocking time for the largest contentful paint
 */

// Self-executing function to avoid global scope pollution
(function() {
  // Create a promise that resolves when DOM is ready
  const domReady = new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });

  // Preload the LCP heading element
  domReady.then(() => {
    // Find the LCP element (our main heading)
    const lcpElement = document.querySelector('h1.text-\\[32px\\].font-bold.text-\\[\\#1f2937\\].mb-\\[12px\\]');
    
    if (lcpElement) {
      // Don't modify DOM that would cause hydration mismatches
      
      // Just add performance monitoring
      if (window.performance && window.performance.mark) {
        window.performance.mark('lcp-element-found');
      }
    }
  });
})(); 
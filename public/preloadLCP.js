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
      // Don't modify DOM attributes that would cause hydration mismatches
      // Just monitor the element for visibility
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Mark the entry time in performance timeline
              if (window.performance && window.performance.mark) {
                window.performance.mark('lcp-visible');
              }
              observer.disconnect();
            }
          });
        });
        observer.observe(lcpElement);
      }
    }
  });
})();

/**
 * Preload script for largest contentful paint (LCP) image
 * Also includes navigation change detection to fix menu styling issues
 */

(function() {
  // Function to fix menu styles
  const fixMenuStyles = function() {
    // Container styles
    const menuContainer = {
      paddingTop: '20px',
      paddingBottom: '20px',
      paddingLeft: '16px',
      paddingRight: '16px',
      height: '12vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '1440px',
      margin: '0 auto'
    };
    
    // Inner styles
    const menuInner = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };
    
    // Button base styles
    const menuButton = {
      display: 'inline-block',
      height: '40px',
      lineHeight: '40px',
      textDecoration: 'none',
      padding: '0 16px',
      border: 'none',
      outline: 'none',
      borderRadius: '20px',
      fontWeight: 'bold'
    };
    
    // Apply styles to menu container
    const containers = document.querySelectorAll('.menu-container');
    containers.forEach(function(container) {
      Object.keys(menuContainer).forEach(function(key) {
        container.style[key] = menuContainer[key];
      });
    });
    
    // Apply styles to menu inner
    const inners = document.querySelectorAll('.menu-inner');
    inners.forEach(function(inner) {
      Object.keys(menuInner).forEach(function(key) {
        inner.style[key] = menuInner[key];
      });
    });
    
    // Apply styles to buttons
    const buttons = document.querySelectorAll('.menu-connect-button');
    buttons.forEach(function(button) {
      // Apply base styles
      Object.keys(menuButton).forEach(function(key) {
        button.style[key] = menuButton[key];
      });
      
      // Apply specific styles based on class
      if (button.classList.contains('menu-link-cta')) {
        button.style.backgroundColor = '#2D174A';
        button.style.color = '#fff';
      } else if (button.classList.contains('menu-processing')) {
        button.style.backgroundColor = '#C496FF';
        button.style.color = '#FFFFFF';
      } else if (button.classList.contains('menu-authenticated')) {
        button.style.backgroundColor = '#8E38FF';
        button.style.color = '#fff';
      }
    });
    
    // Apply styles to X button
    const xButtons = document.querySelectorAll('.menu-x-button');
    xButtons.forEach(function(button) {
      button.style.marginRight = '12px';
      button.style.width = '40px';
      button.style.height = '40px';
      button.style.borderRadius = '50%';
      button.style.border = '1px solid rgba(0, 0, 0, 0.2)';
      button.style.backgroundColor = 'transparent';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
    });
  };
  
  // Apply styles with retry mechanism
  const applyWithRetry = function(maxRetries = 10, interval = 200) {
    let count = 0;
    
    const tryApply = function() {
      fixMenuStyles();
      count++;
      
      if (count < maxRetries) {
        setTimeout(tryApply, interval);
      }
    };
    
    tryApply();
  };
  
  // Apply styles on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applyWithRetry();
    });
  } else {
    applyWithRetry();
  }
  
  // Detect Next.js route changes
  if (typeof window !== 'undefined') {
    // Override pushState
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      originalPushState.apply(this, arguments);
      setTimeout(fixMenuStyles, 50);
    };
    
    // Handle back/forward navigation
    window.addEventListener('popstate', function() {
      setTimeout(fixMenuStyles, 50);
    });
    
    // Also listen for hashchange events
    window.addEventListener('hashchange', function() {
      setTimeout(fixMenuStyles, 50);
    });
    
    // Apply styles on page visibility changes
    // (sometimes helps with Chrome tab switching issues)
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        setTimeout(fixMenuStyles, 100);
      }
    });
    
    // Final fallback - retry after page is fully loaded
    window.addEventListener('load', function() {
      applyWithRetry(5, 300);
    });
  }
})(); 
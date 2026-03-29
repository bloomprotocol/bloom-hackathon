/**
 * This script is designed to be loaded very early (before the main bundle)
 * to ensure critical CSS is applied as soon as possible, reducing FOUC
 */

(function() {
  // Critical menu button styles applied directly in case CSS hasn't loaded
  const criticalStyles = {
    '.menu-container': {
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
    },
    '.menu-inner': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    '.menu-connect-button': {
      display: 'inline-block',
      height: '40px',
      lineHeight: '40px',
      textDecoration: 'none',
      padding: '0 16px',
      border: 'none',
      outline: 'none',
      borderRadius: '20px',
      fontWeight: 'bold'
    },
    '.menu-link-cta': {
      backgroundColor: '#2D174A',
      color: '#fff'
    },
    '.menu-processing': {
      backgroundColor: '#C496FF',
      color: '#FFFFFF' 
    },
    '.menu-authenticated': {
      backgroundColor: '#8E38FF',
      color: '#fff'
    },
    '.menu-x-button': {
      marginRight: '12px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '1px solid rgba(0, 0, 0, 0.2)',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  // Create style element with critical styles
  function injectCriticalStyles() {
    // Remove any existing injected styles to avoid duplicates
    const existingStyle = document.getElementById('preload-critical-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleEl = document.createElement('style');
    styleEl.id = 'preload-critical-styles';
    
    let cssText = '';
    for (const selector in criticalStyles) {
      cssText += `${selector} {`;
      for (const prop in criticalStyles[selector]) {
        // Convert camelCase to kebab-case for CSS properties
        const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssText += `${kebabProp}: ${criticalStyles[selector][prop]} !important;`;
      }
      cssText += '}';
    }
    
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);
  }

  // Apply direct inline styles to elements as a fallback
  function applyInlineStyles() {
    // Apply container styles
    const menuContainers = document.querySelectorAll('.menu-container');
    menuContainers.forEach(container => {
      Object.assign(container.style, criticalStyles['.menu-container']);
    });

    // Apply inner styles
    const menuInners = document.querySelectorAll('.menu-inner');
    menuInners.forEach(inner => {
      Object.assign(inner.style, criticalStyles['.menu-inner']);
    });
    
    // Apply button styles
    const menuButtons = document.querySelectorAll('.menu-connect-button');
    menuButtons.forEach(button => {
      // Apply base styles
      Object.assign(button.style, criticalStyles['.menu-connect-button']);
      
      // Apply specific button styles based on class
      if (button.classList.contains('menu-link-cta')) {
        Object.assign(button.style, criticalStyles['.menu-link-cta']);
      } else if (button.classList.contains('menu-processing')) {
        Object.assign(button.style, criticalStyles['.menu-processing']);
      } else if (button.classList.contains('menu-authenticated')) {
        Object.assign(button.style, criticalStyles['.menu-authenticated']);
      }
    });
    
    // Apply styles to X button
    const xButtons = document.querySelectorAll('.menu-x-button');
    xButtons.forEach(button => {
      Object.assign(button.style, criticalStyles['.menu-x-button']);
    });
  }

  // Persistent retry strategy to ensure styles are applied
  function persistentStyleApplication() {
    // Apply styles immediately
    injectCriticalStyles();
    applyInlineStyles();
    
    // Continue checking and applying for 5 seconds after load
    // This helps with dynamic content and delayed rendering
    let retryCount = 0;
    const maxRetries = 10; // 10 retries * 500ms = 5 seconds
    
    const retryInterval = setInterval(() => {
      applyInlineStyles();
      retryCount++;
      
      if (retryCount >= maxRetries) {
        clearInterval(retryInterval);
      }
    }, 500);
  }

  // Create a MutationObserver to watch for menu elements being added
  function setupMutationObserver() {
    if (!window.MutationObserver) return;
    
    const observer = new MutationObserver((mutations) => {
      let shouldApplyStyles = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (
                node.classList?.contains('menu-container') || 
                node.classList?.contains('menu-connect-button') ||
                node.querySelector?.('.menu-container, .menu-connect-button')
              ) {
                shouldApplyStyles = true;
              }
            }
          });
        }
      });
      
      if (shouldApplyStyles) {
        applyInlineStyles();
      }
    });
    
    // Start observing the document body for DOM changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Run as early as possible
  persistentStyleApplication();
  
  // Set up observer for dynamically added content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMutationObserver);
  } else {
    setupMutationObserver();
  }
  
  // Also ensure styles are applied on full page load
  window.addEventListener('load', persistentStyleApplication);

  // Handle route changes in Next.js
  // This ensures styles are applied after client-side navigation
  window.addEventListener('popstate', persistentStyleApplication);
})(); 
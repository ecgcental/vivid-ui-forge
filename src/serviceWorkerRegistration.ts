// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  // More reliable service worker detection
  const hasServiceWorker = typeof navigator !== 'undefined' && 
    'serviceWorker' in navigator && 
    typeof window !== 'undefined' && 
    'caches' in window;

  console.log('Service Worker Support Check:', {
    hasNavigator: typeof navigator !== 'undefined',
    hasServiceWorker: 'serviceWorker' in navigator,
    hasWindow: typeof window !== 'undefined',
    hasCaches: 'caches' in window,
    finalResult: hasServiceWorker,
    isLocalhost: isLocalhost,
    protocol: window.location.protocol,
    hostname: window.location.hostname
  });

  if (!hasServiceWorker) {
    console.error('Service workers are not supported or available in this context. Details:', {
      browser: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    });
    return;
  }

  // Check if the browser is in a secure context (HTTPS or localhost)
  if (!window.isSecureContext) {
    console.error(
      'Service workers require a secure context (HTTPS or localhost).\n' +
      'Current protocol: ' + window.location.protocol + '\n' +
      'Current hostname: ' + window.location.hostname + '\n\n' +
      'To fix this:\n' +
      '1. Use localhost instead of IP address: http://localhost:3000\n' +
      '2. Or use HTTPS in production\n' +
      '3. Or enable secure context for your development environment'
    );
    return;
  }

  // The URL constructor is available in all browsers that support SW.
  const publicUrl = new URL(process.env.BASE_URL || '', window.location.href);
  if (publicUrl.origin !== window.location.origin) {
    console.error('Service worker registration failed: Different origins', {
      publicUrl: publicUrl.origin,
      windowLocation: window.location.origin
    });
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = `${process.env.BASE_URL || ''}/sw.js`;
    console.log('Attempting to register service worker at:', swUrl);

    if (isLocalhost) {
      checkValidServiceWorker(swUrl, config);
    } else {
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service worker registered successfully:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
} 
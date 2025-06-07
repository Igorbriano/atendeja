// Marketing pixel utilities
export interface ConversionData {
  value: number
  currency: string
  orderId?: string
  customerPhone?: string
}

// Send conversion event to all configured pixels
export const sendConversionEvent = async (eventType: string, data: ConversionData) => {
  const promises = []

  // Facebook Pixel
  if (window.fbq) {
    promises.push(
      window.fbq('track', 'Purchase', {
        value: data.value,
        currency: data.currency,
        content_type: 'product'
      })
    )
  }

  // Google Analytics 4
  if (window.gtag) {
    promises.push(
      window.gtag('event', 'purchase', {
        transaction_id: data.orderId || `order_${Date.now()}`,
        value: data.value,
        currency: data.currency
      })
    )
  }

  // TikTok Pixel
  if (window.ttq) {
    promises.push(
      window.ttq.track('CompletePayment', {
        value: data.value,
        currency: data.currency
      })
    )
  }

  return Promise.all(promises)
}

// Initialize pixels based on configuration
export const initializePixels = (pixels: any) => {
  // Remove existing pixels
  const existingPixels = document.querySelectorAll('[data-pixel-script]')
  existingPixels.forEach(script => script.remove())

  // Facebook Pixel
  if (pixels.facebook_pixel_id) {
    const fbScript = document.createElement('script')
    fbScript.setAttribute('data-pixel-script', 'facebook')
    fbScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixels.facebook_pixel_id}');
      fbq('track', 'PageView');
    `
    document.head.appendChild(fbScript)
  }

  // Google Analytics
  if (pixels.google_analytics_id) {
    const gaScript = document.createElement('script')
    gaScript.setAttribute('data-pixel-script', 'google-analytics')
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.google_analytics_id}`
    gaScript.async = true
    document.head.appendChild(gaScript)

    const gaConfigScript = document.createElement('script')
    gaConfigScript.setAttribute('data-pixel-script', 'google-analytics-config')
    gaConfigScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${pixels.google_analytics_id}');
    `
    document.head.appendChild(gaConfigScript)
  }

  // Google Ads
  if (pixels.google_ads_conversion_id) {
    const gadsScript = document.createElement('script')
    gadsScript.setAttribute('data-pixel-script', 'google-ads')
    gadsScript.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.google_ads_conversion_id}`
    gadsScript.async = true
    document.head.appendChild(gadsScript)

    const gadsConfigScript = document.createElement('script')
    gadsConfigScript.setAttribute('data-pixel-script', 'google-ads-config')
    gadsConfigScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${pixels.google_ads_conversion_id}');
    `
    document.head.appendChild(gadsConfigScript)
  }

  // TikTok Pixel
  if (pixels.tiktok_pixel_id) {
    const ttScript = document.createElement('script')
    ttScript.setAttribute('data-pixel-script', 'tiktok')
    ttScript.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixels.tiktok_pixel_id}');
        ttq.page();
      }(window, document, 'ttq');
    `
    document.head.appendChild(ttScript)
  }

  // Custom scripts
  if (pixels.custom_scripts) {
    const customScript = document.createElement('script')
    customScript.setAttribute('data-pixel-script', 'custom')
    customScript.innerHTML = pixels.custom_scripts
    document.head.appendChild(customScript)
  }
}

// Declare global types for TypeScript
declare global {
  interface Window {
    fbq: any
    gtag: any
    ttq: any
  }
}
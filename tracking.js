(function(){
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  let config = null;
  let loaded = false;

  async function init(){
    try{
      const res = await fetch('/.netlify/functions/public-config?v=' + Date.now());
      if(!res.ok) return;
      config = await res.json();
      const primaryId = config.ga4MeasurementId || config.googleAdsId;
      if(!primaryId) return;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryId);
      document.head.appendChild(script);
      gtag('js', new Date());
      if(config.ga4MeasurementId) gtag('config', config.ga4MeasurementId);
      if(config.googleAdsId) gtag('config', config.googleAdsId);
      loaded = true;
    }catch(err){ console.warn('Tracking initialization failed', err); }
  }

  window.smbizTrackLead = function(){
    if(!config) return;
    if(config.ga4MeasurementId){
      gtag('event','generate_lead',{event_category:'consulting',event_label:'free_business_diagnosis'});
    }
    if(config.googleAdsId && config.googleAdsConversionLabel){
      gtag('event','conversion',{
        send_to: config.googleAdsId + '/' + config.googleAdsConversionLabel,
        value: Number(config.googleAdsConversionValue || 1),
        currency: config.googleAdsCurrency || 'KRW'
      });
    }
  };
  document.addEventListener('DOMContentLoaded', init);
})();

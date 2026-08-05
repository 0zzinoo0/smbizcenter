(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  let config = null;
  let initialized = false;
  let pendingLead = false;
  let pendingCallback = null;

  async function init() {
    try {
      const res = await fetch(
        '/.netlify/functions/public-config?v=' + Date.now()
      );

      if (!res.ok) {
        throw new Error('public-config HTTP ' + res.status);
      }

      config = await res.json();

      const primaryId =
        config.ga4MeasurementId || config.googleAdsId;

      if (!primaryId) {
        console.warn('GA4 measurement ID is missing.');
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src =
        'https://www.googletagmanager.com/gtag/js?id=' +
        encodeURIComponent(primaryId);

      document.head.appendChild(script);

      gtag('js', new Date());

      if (config.ga4MeasurementId) {
        gtag('config', config.ga4MeasurementId);
      }

      /*
       * Google Ads 고객번호에 임의로 AW-를 붙인 값은
       * 실제 Google Ads 태그 ID가 아니므로 사용하지 않습니다.
       * GA4 generate_lead 이벤트를 Ads로 가져오는 방식으로 진행합니다.
       */

      initialized = true;

      // 초기화 전에 상담 이벤트가 호출된 경우 여기서 다시 전송
      if (pendingLead) {
        sendLeadEvent(pendingCallback);
      }
    } catch (err) {
      console.warn('Tracking initialization failed', err);
    }
  }

  function sendLeadEvent(callback) {
    if (
      !initialized ||
      !config ||
      !config.ga4MeasurementId
    ) {
      pendingLead = true;
      pendingCallback = callback || null;
      return;
    }

    pendingLead = false;

    let completed = false;

    function finish() {
      if (completed) return;
      completed = true;

      if (typeof callback === 'function') {
        callback();
      }
    }

    gtag('event', 'generate_lead', {
      send_to: config.ga4MeasurementId,
      event_category: 'consulting',
      event_label: 'free_business_diagnosis',
      transport_type: 'beacon',
      event_callback: finish,
      event_timeout: 2000
    });

    // 콜백이 실행되지 않는 경우를 대비한 안전장치
    setTimeout(finish, 2200);
  }

  window.smbizTrackLead = function (callback) {
    sendLeadEvent(callback);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

import { json } from './_auth.js';

const esc = (value = '') => String(value).replace(/[&<>"']/g, (m) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]));

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'POST만 허용됩니다.' });
  try {
    const lead = await request.json();
    if (!lead?.name || !lead?.phone) return json(400, { error: '성함과 연락처가 필요합니다.' });

    const apiKey = process.env.RESEND_API_KEY || '';
    const to = process.env.LEAD_NOTIFY_EMAIL || '';
    const from = process.env.LEAD_FROM_EMAIL || '중소기업비지니스센터 <onboarding@resend.dev>';
    if (!apiKey || !to) return json(200, { sent: false, reason: 'email_not_configured' });

    const rows = [
      ['성함', lead.name], ['연락처', lead.phone], ['회사명', lead.company || '-'],
      ['기업 단계', lead.stage || '-'], ['상담 분야', lead.service || '-'],
      ['문의 내용', lead.message || '-'], ['유입 소스', lead.utm_source || '-'],
      ['유입 매체', lead.utm_medium || '-'], ['캠페인', lead.utm_campaign || '-']
    ].map(([k,v]) => `<tr><th style="text-align:left;padding:8px;border:1px solid #ddd;background:#f5f7fa">${esc(k)}</th><td style="padding:8px;border:1px solid #ddd">${esc(v)}</td></tr>`).join('');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from, to: [to], subject: `[홈페이지 상담접수] ${lead.name} / ${lead.phone}`,
        html: `<h2>새로운 무료 기업진단 신청</h2><table style="border-collapse:collapse;width:100%;max-width:680px">${rows}</table>`
      })
    });
    if (!response.ok) return json(502, { error: '이메일 발송 실패', detail: await response.text() });
    return json(200, { sent: true });
  } catch (error) {
    return json(500, { error: '알림 처리 실패', detail: error.message });
  }
};

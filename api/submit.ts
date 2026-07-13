import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SubmissionPayload {
  q1: string;
  q2: string[];
  q2_other: string;
  q3: string;
  q4_1: string;
  q4_2: string;
  q4_3: string;
  q5: string;
  q6: string;
  name: string;
  company: string;
  role: string;
  email: string;
  _id?: number;
  _timestamp?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body as SubmissionPayload;
    const email = data.email?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Format the submission into a readable email body
    const subject = `New Giant Survey Response${data.name ? ` — ${data.name}` : ''}`;
    const body = [
      '━━━ New Giant Survey Response ━━━',
      '',
      `Submitted: ${data._timestamp ? new Date(data._timestamp).toLocaleString() : 'Just now'}`,
      '',
      '── Contact Info ──',
      `Name:    ${data.name || 'N/A'}`,
      `Company: ${data.company || 'N/A'}`,
      `Role:    ${data.role || 'N/A'}`,
      `Email:   ${data.email}`,
      '',
      '── Answers ──',
      `1. Boring is bad for business:`,
      `   ${data.q1 || '(skipped)'}`,
      '',
      `2. Where do you get distracted most?`,
      `   ${[...data.q2, ...(data.q2_other ? [`Other: ${data.q2_other}`] : [])].join(', ') || '(skipped)'}`,
      '',
      `3. The frustration files:`,
      `   ${data.q3 || '(skipped)'}`,
      '',
      `4. Meet your Giant (handovers):`,
      `   ${[data.q4_1, data.q4_2, data.q4_3].filter(Boolean).join(', ') || '(skipped)'}`,
      '',
      `5. Who's carrying you:`,
      `   ${data.q5 || '(skipped)'}`,
      '',
      `6. Dream big:`,
      `   ${data.q6 || '(skipped)'}`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ].join('\n');

    // Try sending via Resend API if API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    let sentViaResend = false;

    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Giant Survey <survey@giant-agency.com>',
            to: ['hello@nikidot.studio'],
            subject,
            text: body,
          }),
        });

        if (resendRes.ok) {
          sentViaResend = true;
        } else {
          console.error('Resend API error:', await resendRes.text());
        }
      } catch (err) {
        console.error('Resend request failed:', err);
      }
    }

    // Fallback: try Google Apps Script webhook if configured
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;
    let sentViaGoogleSheet = false;

    if (googleScriptUrl) {
      try {
        await fetch(googleScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            submitted_at: data._timestamp || new Date().toISOString(),
            q1_boring: data.q1 || '',
            q2_distractions: data.q2 || [],
            q2_distractions_other: data.q2_other || '',
            q3_frustration: data.q3 || '',
            q4_handover_1: data.q4_1 || '',
            q4_handover_2: data.q4_2 || '',
            q4_handover_3: data.q4_3 || '',
            q5_waiting: data.q5 || '',
            q6_dream: data.q6 || '',
            name: data.name || '',
            company: data.company || '',
            role: data.role || '',
            email: data.email || '',
          }),
        });
        sentViaGoogleSheet = true;
      } catch (err) {
        console.error('Google Script request failed:', err);
      }
    }

    // If neither method worked, that's OK for static site — data is logged
    if (!resendApiKey && !googleScriptUrl) {
      console.log('No email delivery configured. Submission received:', body);
    }

    return res.status(200).json({
      success: true,
      delivered: { resend: sentViaResend, googleSheet: sentViaGoogleSheet },
    });
  } catch (err) {
    console.error('Submit handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

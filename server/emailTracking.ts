import { Express, Request, Response } from 'express';
import { recordEmailOpen, recordEmailClick } from './db';

// 1x1 transparent GIF pixel (43 bytes)
const TRANSPARENT_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * Parse tracking data from base64-encoded tracking ID
 * Format: base64(campaignId:email:eventType[:linkUrl])
 */
function parseTrackingData(encodedId: string): { campaignId: number; email: string; linkUrl?: string } | null {
  try {
    const decoded = Buffer.from(encodedId, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 2) return null;
    
    const campaignId = parseInt(parts[0], 10);
    const email = parts[1];
    const linkUrl = parts.length > 2 ? parts.slice(2).join(':') : undefined;
    
    if (isNaN(campaignId) || !email) return null;
    return { campaignId, email, linkUrl };
  } catch {
    return null;
  }
}

/**
 * Encode tracking data to base64url string
 */
export function encodeTrackingData(campaignId: number, email: string, linkUrl?: string): string {
  const data = linkUrl ? `${campaignId}:${email}:${linkUrl}` : `${campaignId}:${email}`;
  return Buffer.from(data, 'utf-8').toString('base64url');
}

/**
 * Generate tracking pixel URL for email opens
 */
export function getTrackingPixelUrl(baseUrl: string, campaignId: number, email: string): string {
  const trackingId = encodeTrackingData(campaignId, email);
  return `${baseUrl}/api/track/open/${trackingId}`;
}

/**
 * Generate tracked link URL for email clicks
 */
export function getTrackedLinkUrl(baseUrl: string, campaignId: number, email: string, originalUrl: string): string {
  const trackingId = encodeTrackingData(campaignId, email, originalUrl);
  return `${baseUrl}/api/track/click/${trackingId}`;
}

/**
 * Register email tracking routes on Express app
 */
export function registerEmailTrackingRoutes(app: Express) {
  // Open tracking - serves 1x1 transparent pixel
  app.get('/api/track/open/:trackingId', async (req: Request, res: Response) => {
    try {
      const data = parseTrackingData(req.params.trackingId);
      if (data) {
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.socket.remoteAddress || '';
        
        // Record asynchronously, don't block response
        recordEmailOpen(
          req.params.trackingId,
          data.campaignId,
          data.email,
          userAgent,
          ipAddress
        ).catch(err => console.error('[EmailTracking] Open record error:', err));
      }
    } catch (err) {
      console.error('[EmailTracking] Open tracking error:', err);
    }

    // Always return the pixel regardless of tracking success
    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': String(TRANSPARENT_PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(TRANSPARENT_PIXEL);
  });

  // Click tracking - redirects to original URL with UTM parameters
  app.get('/api/track/click/:trackingId', async (req: Request, res: Response) => {
    try {
      const data = parseTrackingData(req.params.trackingId);
      if (data && data.linkUrl) {
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.socket.remoteAddress || '';
        
        // Record click asynchronously
        recordEmailClick(
          req.params.trackingId,
          data.campaignId,
          data.email,
          data.linkUrl,
          userAgent,
          ipAddress
        ).catch(err => console.error('[EmailTracking] Click record error:', err));

        // Add UTM parameters to the original URL
        const url = new URL(data.linkUrl);
        url.searchParams.set('utm_source', 'email');
        url.searchParams.set('utm_medium', 'campaign');
        url.searchParams.set('utm_campaign', `campaign_${data.campaignId}`);
        
        return res.redirect(302, url.toString());
      }
    } catch (err) {
      console.error('[EmailTracking] Click tracking error:', err);
    }

    // Fallback redirect to homepage
    res.redirect(302, '/');
  });

  console.log('[EmailTracking] Tracking routes registered (/api/track/open/:id, /api/track/click/:id)');
}

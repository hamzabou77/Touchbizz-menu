import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.trim() === '') {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

function stripeApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-stripe-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/stripe/create-checkout-session') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const { planId, userEmail, returnUrl } = parsed;
              const stripe = getStripe();

              if (!stripe) {
                // Return simulated success URL if STRIPE_SECRET_KEY is not configured
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    simulated: true,
                    url: returnUrl ? returnUrl.replace('{CHECKOUT_SESSION_ID}', 'sim_session_' + Date.now()) : '/dashboard/settings?billing_status=success',
                  })
                );
                return;
              }

              // Real Stripe Checkout Session
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                  {
                    price_data: {
                      currency: 'eur',
                      product_data: {
                        name: planId === 'plan_starter' ? 'TouchBizz Starter (Abonnement Mensuel)' : 'TouchBizz Pro (Abonnement Mensuel)',
                        description: 'Abonnement SaaS Menu Digital NFC & QR Code TouchBizz',
                      },
                      unit_amount: planId === 'plan_starter' ? 1900 : 2900,
                      recurring: { interval: 'month' },
                    },
                    quantity: 1,
                  },
                ],
                mode: 'subscription',
                customer_email: userEmail || undefined,
                success_url: returnUrl || 'http://localhost:3000/dashboard/settings?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: parsed.cancelUrl || 'http://localhost:3000/dashboard/settings?canceled=true',
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, url: session.url }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Stripe error' }));
            }
          });
          return;
        }

        if (req.url && req.url.startsWith('/api/stripe/status') && req.method === 'GET') {
          const hasKey = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== '');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ configured: hasKey }));
          return;
        }

        next();
      });
    },
  };
}

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), stripeApiPlugin(), aistudioMediaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


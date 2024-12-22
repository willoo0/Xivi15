
import express from 'express';
import axios from 'axios';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const router = express.Router();

router.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send('URL is required');
    }

    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Inject script to handle link clicks
    const script = document.createElement('script');
    script.textContent = `
      window.addEventListener('message', function(event) {
        if (event.data.type === 'INIT_PROXY') {
          document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
              e.preventDefault();
              window.parent.postMessage({
                type: 'PROXY_NAVIGATE',
                url: e.target.href
              }, '*');
            }
          });
        }
      });
    `;
    document.head.appendChild(script);

    res.send(dom.serialize());
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Error fetching URL');
  }
});

export default router;

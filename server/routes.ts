
import { Router } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const router = Router()

router.use('/api/proxy', createProxyMiddleware({
  router: (req) => {
    const targetUrl = req.query.url as string
    return targetUrl
  },
  changeOrigin: true,
  secure: false,
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    delete proxyRes.headers['x-frame-options']
    delete proxyRes.headers['content-security-policy']
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err)
    res.status(500).send('Proxy Error')
  }
}))

export default router

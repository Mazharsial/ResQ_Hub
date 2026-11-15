import app from '../server/index.js';

export default function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.searchParams.get('path');

  if (path) {
    url.searchParams.delete('path');
    req.url = `/api/${path}${url.search}`;
  }

  return app(req, res);
}

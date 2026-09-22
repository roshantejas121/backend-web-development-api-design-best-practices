const assert = require('assert');
const http = require('http');
const { createApp, resetData } = require('../src/app');

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      port: server.address().port,
      method,
      path,
      headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  resetData();
  const server = createApp().listen(0);
  try {
    let response = await request(server, 'GET', '/posts');
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body.meta, { page: 1, limit: 2, total: 5, pages: 3 });
    assert.strictEqual(response.body.data.length, 2);

    response = await request(server, 'GET', '/posts?page=2&limit=1000000');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.meta.limit, 100);
    assert.strictEqual(response.body.data.length, 0);

    response = await request(server, 'GET', '/posts/1');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.data.id, 1);

    response = await request(server, 'POST', '/posts', { title: 'API contracts', author: 'lee' });
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.data.title, 'API contracts');

    response = await request(server, 'POST', '/posts/1/likes');
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.data.likes, 1);

    response = await request(server, 'GET', '/posts/999');
    assert.strictEqual(response.status, 404);
    assert.deepStrictEqual(response.body.error, { code: 'NOT_FOUND', message: 'Post not found' });

    response = await request(server, 'GET', '/explode');
    assert.strictEqual(response.status, 500);
    assert.deepStrictEqual(response.body.error, { code: 'INTERNAL_ERROR', message: 'Something went wrong' });
    assert.ok(!JSON.stringify(response.body).includes('stack'));
    assert.ok(!JSON.stringify(response.body).includes('SQLITE'));

    response = await request(server, 'GET', '/getPosts');
    assert.strictEqual(response.status, 404);
    console.log('All API contract smoke tests passed.');
  } finally {
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


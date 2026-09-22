const store = require('../data/postStore');

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 100;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function listPosts(query = {}) {
  const page = parsePositiveInteger(query.page, 1);
  const requestedLimit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);

  if (page === null || requestedLimit === null) {
    const error = new Error('page and limit must be positive integers');
    error.code = 'VALIDATION_ERROR';
    error.details = ['page and limit must be positive integers'];
    throw error;
  }

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const posts = store.getAllPosts();
  const total = posts.length;
  const pages = total === 0 ? 0 : Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    data: posts.slice(offset, offset + limit),
    meta: { page, limit, total, pages }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : '';

  if (!title || !author) {
    const error = new Error('title and author are required');
    error.code = 'VALIDATION_ERROR';
    error.details = ['title', 'author'];
    throw error;
  }

  return store.createPost({ title, author });
}

function likePost(id) {
  return store.incrementLikes(id);
}

function explode() {
  const err = new Error('simulated internal failure');
  err.code = 'INTERNAL_ERROR';
  throw err;
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};

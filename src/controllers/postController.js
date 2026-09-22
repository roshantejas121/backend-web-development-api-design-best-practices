const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res) {
  try {
    const result = service.listPosts(req.query);
    return http.sendData(res, result.data, 200, result.meta);
  } catch (err) {
    return handleError(res, err);
  }
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, 'NOT_FOUND', 'Post not found');
  }
  return http.sendData(res, post);
}

function createPost(req, res) {
  try {
    const post = service.createPost(req.body);
    return http.sendData(res, post, 201);
  } catch (err) {
    return handleError(res, err);
  }
}

function likePost(req, res) {
  const post = service.likePost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, 'NOT_FOUND', 'Post not found');
  }
  return http.sendData(res, post, 201);
}

function explode(req, res) {
  try {
    service.explode();
    return http.sendData(res, null);
  } catch (err) {
    console.error(err);
    return http.sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
  }
}

function handleError(res, err) {
  if (err.code === 'VALIDATION_ERROR') {
    return http.sendError(res, 400, err.code, err.message, err.details);
  }
  console.error(err);
  return http.sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};

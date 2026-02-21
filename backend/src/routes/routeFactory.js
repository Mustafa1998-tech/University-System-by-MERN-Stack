const express = require('express');
const mongoose = require('mongoose');
const BaseController = require('../controllers/BaseController');

function createModelRouter(Model, modelName) {
  const router = express.Router();
  const controller = new BaseController(Model, modelName);

  router.use((req, res, next) => {
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    return res.status(503).json({
      status: 'fail',
      message: `${modelName} service is temporarily unavailable because database is disconnected.`,
      module: modelName,
      data: [],
      meta: {
        database: 'disconnected'
      }
    });
  });

  router.get('/stats', controller.getStats);
  router.get('/search', controller.search);
  router.get('/export', controller.exportData);

  router
    .route('/bulk')
    .post(controller.bulkCreate)
    .patch(controller.bulkUpdate)
    .delete(controller.bulkDelete);

  router
    .route('/')
    .get(controller.getAll)
    .post(controller.createOne);

  router
    .route('/:id')
    .get(controller.getOne)
    .patch(controller.updateOne)
    .delete(controller.deleteOne);

  return router;
}

function createStubRouter(moduleName, seedItems = []) {
  const router = express.Router();
  const normalizedSeed = Array.isArray(seedItems)
    ? seedItems
    : seedItems
      ? [seedItems]
      : [];
  const store = [...normalizedSeed];

  const nowIso = () => new Date().toISOString();

  router.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      module: moduleName,
      results: store.length,
      data: store
    });
  });

  router.get('/stats', (req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        module: moduleName,
        total: store.length,
        generatedAt: nowIso()
      }
    });
  });

  router.post('/', (req, res) => {
    const item = {
      id: `${moduleName.toLowerCase()}-${Date.now()}`,
      ...req.body,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    store.push(item);
    res.status(201).json({ status: 'success', data: item });
  });

  router.get('/:id', (req, res) => {
    const item = store.find((entry) => String(entry.id) === String(req.params.id));
    if (!item) {
      return res.status(404).json({ status: 'fail', message: `${moduleName} item not found` });
    }
    return res.status(200).json({ status: 'success', data: item });
  });

  router.patch('/:id', (req, res) => {
    const index = store.findIndex((entry) => String(entry.id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ status: 'fail', message: `${moduleName} item not found` });
    }

    store[index] = {
      ...store[index],
      ...req.body,
      updatedAt: nowIso()
    };

    return res.status(200).json({ status: 'success', data: store[index] });
  });

  router.delete('/:id', (req, res) => {
    const index = store.findIndex((entry) => String(entry.id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ status: 'fail', message: `${moduleName} item not found` });
    }

    const [deleted] = store.splice(index, 1);
    return res.status(200).json({ status: 'success', data: deleted });
  });

  return router;
}

module.exports = {
  createModelRouter,
  createStubRouter
};

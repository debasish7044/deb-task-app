const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/task');

const router = new express.Router();

//task create method
router.post('/tasks', auth, async (req, res) => {
  // const task = await new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//read tasks method // pagnation with limiting and sorting
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sort) {
    parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    if (req.user.tasks.length === 0) {
      res.status(400).send();
    }
    res.send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

// read one task method
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(400).send();
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//task update method
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ['description', 'isCompleted'];

  const isValidateOperation = updates.every((update) =>
    allowedUpdate.includes(update)
  );

  if (!isValidateOperation) {
    return res.status(400).send({ error: 'invalid updates' });
  }

  const _id = await req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete task method
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;

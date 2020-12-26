const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// setting up log in method
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

//user create method (sign up)
router.post('/users', async (req, res) => {
  const user = await new User(req.body);
  if (req.body.email === req.body.password) {
    return res
      .status(400)
      .send('name & password should not be equal');
  }
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//setting up log out  method
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    console.log(req.user.tokens);
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//setting up log out all
router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// read users method
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

//user update method
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ['name', 'age', 'password', 'email'];

  const isValidateOperation = updates.some((update) =>
    allowedUpdate.includes(update)
  );
  console.log(isValidateOperation);

  if (!isValidateOperation) {
    return res.status(400).send({ error: 'invalid updates' });
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    if (
      req.body.email === req.user.password ||
      req.body.password === req.user.email
    ) {
      return res
        .status(400)
        .send('name & password should not be equal');
    }
    if (!req.user) {
      return res.status(404).send();
    }
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete user method

router.delete('/users/me', auth, async (req, res) => {
  try {
    req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//file uploading methods
const upload = multer({
  // dest: 'multerDocument',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match('.(jpg|jpeg|png)$')) {
      cb(new Error('please upload file with jpg, jpeg & png format'));
    }
    // cb(null, false)
    cb(undefined, true);
    // cb(new Error('I don\'t have a clue!'))
  },
});
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      res.status(400).send(error.message);
    } else if (error) {
      res.status(400).send(error.message);
    }
  }
);

//delete avatar profile
router.delete(
  '/users/me/avatar',
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      res.status(400).send(error.message);
    } else if (error) {
      res.status(400).send(error.message);
    }
  }
);

//find avatar profile image  method
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/jpg');
    res.send(user.avatar);
  } catch (e) {
    res.send(400).send(e);
  }
});

module.exports = router;

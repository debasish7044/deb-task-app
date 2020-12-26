const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
  keepAlive: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

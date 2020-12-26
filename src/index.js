const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

// const Task = require('./models/task');
// const User = require('./models/user');

// const main = async () => {
//   const task = await Task.findById('5fe484a19e49ef1b84bd679a');
//   await task.populate('owner').execPopulate();
//   console.log(task.owner);

//   const user = await User.findById('5fe483349e49ef1b84bd6797');
//   await user.populate('tasks').execPopulate();
//   console.log(user.tasks);
// };

// main();

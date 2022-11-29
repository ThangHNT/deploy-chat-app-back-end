const userRouter = require('./user.js');
const messageRouter = require('./message.js');
const settingRouter = require('./setting.js');
function route(app) {
    app.use('/', userRouter, messageRouter, settingRouter);
}

module.exports = route;

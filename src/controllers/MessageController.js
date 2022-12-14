const Message = require('../models/message');
const User = require('../models/user');

const checkMessageDeleted = (arr, userId) => {
    const ans = [];
    arr.forEach((msg) => {
        if (msg.userDeletedMessage) {
            const checkMsg = msg.userDeletedMessage.has(userId);
            if (!checkMsg) ans.push(msg);
        }
    });
    return ans;
};

class MessageController {
    getMessages(req, res, next) {
        const { sender, receiver } = req.body;
        let arr = [];
        Message.find({ sender: sender, receiver: receiver }, function (err, messages) {
            Message.find({ sender: receiver, receiver: sender }, function (err, messages2) {
                if (messages.length > 0 || messages2.length > 0) {
                    const arr1 = checkMessageDeleted(messages, sender);
                    const data1 = arr1.map((item) => {
                        const obj = {
                            id: item._id,
                            type: item.type,
                            text: item.text,
                            img: item.img,
                            file: item.file,
                            sender: item.sender,
                            time: item.time,
                            reactionIcon: item.reactionIcon,
                        };
                        return obj;
                    });
                    const arr2 = checkMessageDeleted(messages2, sender);
                    // console.log(arr1, arr2);
                    const data2 = arr2.map((item) => {
                        const obj = {
                            id: item._id,
                            type: item.type,
                            text: item.text,
                            img: item.img,
                            file: item.file,
                            sender: item.sender,
                            time: item.time,
                            reactionIcon: item.reactionIcon,
                        };
                        return obj;
                    });
                    arr = [...data1, ...data2];
                    arr.sort((a, b) => {
                        return a.time - b.time;
                    });
                    return res.json({ status: true, arr });
                } else {
                    return res.json({ status: false, msg: 'khong tim thay doan hoi thoai' });
                }
            });
        });
    }

    sendMessage(req, res, next) {
        const { sender, receiver, messages } = req.body;
        // console.log(messages);
        messages.content.forEach((msg) => {
            const message = new Message();
            message.sender = sender;
            message.receiver = receiver;
            message.time = msg.time;
            const type = msg.type;
            if (msg.type === 'text') {
                message.type = 'text';
                message.text = msg.text;
            } else if (msg.type == 'img') {
                message.type = 'img';
                message.img = msg.img;
            } else if (
                type == 'text-file' ||
                type == 'video' ||
                type == 'audio' ||
                type == 'doc-file' ||
                type == 'pdf-file' ||
                type == 'excel-file' ||
                type == 'powerpoint-file'
            ) {
                message.type = type;
                message.file.content = msg.file.content;
                message.file.filename = msg.file.filename;
                message.file.size = msg.file.size;
            }
            message.save();
            msg.id = String(message._id);
        });
        res.json({ status: true, messages });
    }

    sendReactionIcon(req, res) {
        const { time, reaction } = req.body;
        Message.findOne({ time: time }, function (err, message) {
            if (message) {
                message.reactionIcon = reaction;
                message.save();
                return res.json({ status: true });
            } else {
                res.json({ status: false });
            }
        });
    }

    removeReactionIcon(req, res) {
        const { time } = req.body;
        Message.findOne({ time: time }, function (err, message) {
            if (message) {
                message.reactionIcon = '';
                message.save();
                return res.json({ status: true });
            } else {
                res.json({ status: false });
            }
        });
    }

    getLastestMessage(req, res, next) {
        const { receiver, sender } = req.body;
        Message.find({ sender, receiver }, function (err, messages) {
            Message.find({ sender: receiver, receiver: sender }, function (err, messages2) {
                const arr1 = checkMessageDeleted(messages, sender);
                const arr2 = checkMessageDeleted(messages2, sender);
                let a = arr1[arr1.length - 1];
                let b = arr2[arr2.length - 1];
                let message = undefined;
                if (a && b) {
                    if (a.time > b.time) {
                        message = a;
                    } else message = b;
                } else if (a && !b) {
                    message = a;
                } else if (!a && b) {
                    message = b;
                }
                return res.json({ status: true, message });
            });
        });
    }

    revokeMessage(req, res) {
        const { sendat, action, senderId, type } = req.body;
        Message.findOne({ time: sendat }, function (err, message) {
            if (message) {
                if (action == 'revoke' && type != 'revoked') {
                    message.type = 'revoked';
                    message.text = 'Tin nh???n ???? b??? thu h???i';
                    message.audio = undefined;
                    message.video = undefined;
                    message.file = undefined;
                    message.save();
                    return res.json({ status: true, msg: 'thu h???i tin nh???n th??nh c??ng' });
                } else {
                    if (!message.userDeletedMessage.has(senderId)) {
                        if (message.userDeletedMessage.size > 0) {
                            message.remove();
                        } else {
                            message.userDeletedMessage.set(senderId, true);
                            message.save();
                        }
                    }
                    return res.json({ status: true, msg: 'X??a tin nh???n th??nh c??ng' });
                }
            }
        });
    }

    deleteChat(req, res) {
        const { sender, receiver } = req.body;
        Message.find({ sender, receiver }, (err, messages) => {
            Message.find({ sender: receiver, receiver: sender }, (err, messages2) => {
                messages.forEach((msg) => {
                    if (!msg.userDeletedMessage.has(sender)) {
                        if (msg.userDeletedMessage.has(receiver)) {
                            msg.remove();
                        } else {
                            msg.userDeletedMessage.set(sender, true);
                            msg.save();
                        }
                    }
                });
                messages2.forEach((msg2) => {
                    if (!msg2.userDeletedMessage.has(sender)) {
                        if (msg2.userDeletedMessage.has(receiver)) {
                            msg2.remove();
                        } else {
                            msg2.userDeletedMessage.set(sender, true);
                            msg2.save();
                        }
                    }
                });
                return res.json({ status: true, msg: 'xoa doan chat thanh cong' });
            });
        });
    }
}

module.exports = new MessageController();

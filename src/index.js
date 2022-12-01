const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const route = require('./routes/index');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;
const socket = require('socket.io');
require('dotenv').config();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '100mb' }));

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/chat');
        console.log('Connect database successfully');
    } catch (err) {
        console.log('connect database failed');
    }
}
connect();

route(app);

const server = app.listen(PORT, () => {
    console.log(`App listen on http://localhost:${PORT}`);
});

const io = socket(server, {
    cors: {
        orgin: 'http://localhost:5000',
        credentials: true,
    },
    maxHttpBufferSize: 1e8,
});

io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
        console.log('loi set id');
        return next(new Error('invalid user-id'));
    }
    socket.userId = userId;
    next();
});

var usersInCall = [];

const handleCheckUserInCall = (userId) => {
    return usersInCall.some((user) => {
        return userId === user;
    });
};

const handleAddUserInCall = (userId) => {
    let checkExistUser = usersInCall.some((user) => {
        return userId == user;
    });
    if (!checkExistUser) usersInCall.push(userId);
};

const handleRemoveUserInCall = (userId) => {
    usersInCall = usersInCall.filter((item) => {
        return item !== userId;
    });
};

const handleCheckUserOnline = (userList, userId) => {
    return userList.some((item) => {
        return userId == item.userId;
    });
};

io.on('connection', (socket) => {
    const users = [];
    for (let [id, socket] of io.of('/').sockets) {
        users.push({ socketId: id, userId: socket.userId });
    }
    socket.emit('users', users);
    // console.log(users);

    socket.broadcast.emit('user just connected', {
        socketId: socket.id,
        userId: socket.userId,
    });

    // console.log(io.allSockets());

    socket.on('send message', ({ sender, receiver, to, from, content }) => {
        socket.to(to).to(from).emit('private message', {
            content,
            to,
            from,
            sender,
            receiver,
        });
    });

    socket.on('send reaction icon', ({ sender, receiver, to, from, icon, time }) => {
        // console.log(time);
        socket.to(to).to(from).emit('private reaction message', {
            time,
            icon,
            sender,
            receiver,
        });
    });

    socket.on('block-user', ({ sender, to, from, receiver }) => {
        // console.log(sender, receiver);
        socket.to(to).to(from).emit('user is blocked', { sender, receiver });
    });

    socket.on('unblock-user', ({ sender, to, from, receiver }) => {
        // console.log(sender, receiver);
        socket.to(to).to(from).emit('user is unblocked', { sender, receiver });
    });

    socket.on('remove reaction icon', ({ from, to, receiver, sender, time }) => {
        socket.to(to).to(from).emit('remove reaction icon private', { sender, receiver, time });
    });

    socket.on('change theme', ({ sender, theme, to, from }) => {
        socket.to(to).to(from).emit('change theme private', { user: sender, theme });
    });

    socket.on('change background', ({ sender, background, to, from }) => {
        // console.log(sender);
        socket.to(to).to(from).emit('change background private', { user: sender, backgroundImage: background });
    });

    socket.on('revoke message', ({ to, from, sender, time }) => {
        // console.log(sender, time);
        socket.to(to).to(from).emit('revoke message private', { sender, time });
    });

    socket.on('callUser', ({ sender, receiver, signal, to, from }) => {
        // console.log(handleCheckUserOnline(users, receiver));
        if (handleCheckUserInCall(receiver) == false && handleCheckUserOnline(users, receiver)) {
            handleAddUserInCall(sender);
            socket.to(to).to(from).emit('callUser', { sender, signal });
        } else if (!handleCheckUserOnline(users, receiver)) {
            // console.log('ng dung ko online');
            setTimeout(async () => {
                await socket.emit('user busy', { value: true, msg: 'Người nhận không online' });
            }, 10000);
        } else {
            console.log('ng dung ban');
            socket.emit('user busy', { value: true, msg: 'Người nhận bận' });
        }
    });

    socket.on('answerCall', ({ to, from, signal, sender }) => {
        handleAddUserInCall(sender);
        socket.to(to).to(from).emit('callAccepted', signal);
    });

    socket.on('end call', ({ to, from, sender, receiver, msg }) => {
        handleRemoveUserInCall(sender);
        handleRemoveUserInCall(receiver);
        socket.to(to).to(from).emit('end call', { sender, msg });
    });

    socket.on('change media', ({ sender, kind, status, to, from }) => {
        socket.to(to).to(from).emit('change media', { sender, kind, status });
    });

    socket.on('disconnect', async () => {
        // console.log('Client disconnected:', socket.id);
        handleRemoveUserInCall(socket.id);
        socket.broadcast.emit('user disconnected', socket.id);
    });
});

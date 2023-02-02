const User = require('../models/user');
const Setting = require('../models/setting');
const Message = require('../models/message');
const bcrypt = require('bcrypt');
const { createJWT, verifyToken } = require('../middleware/JWT');
const FriendList = require('../models/friendList');

class UserController {
    home(req, res, next) {
        res.send('server is running');
    }

    async login(req, res, next) {
        try {
            const { account, password } = req.body;
            const currentUser = await User.findOne({ account });
            if (!currentUser) return res.json({ msg: 'Tài khoản này chưa được đăng ký.', status: false });
            const hashPassword = await bcrypt.compare(password, currentUser.password);
            if (!hashPassword) {
                return res.json({ msg: 'Tài khoản hoặc mật khẩu không đúng.', status: false });
            } else {
                const user = {
                    account: currentUser.account,
                    _id: currentUser._id,
                    avatar: currentUser.avatar,
                    username: currentUser.username,
                };
                Setting.findOne({ _id: currentUser.setting }, (err, setting) => {
                    user.setting = setting.general;
                    // let token = createJWT({ userId: user._id, admin: user.admin });
                    // user.token = token;
                    return res.json({ status: true, user });
                });
            }
        } catch (err) {
            console.log('login that bai');
        }
    }

    async register(req, res, next) {
        try {
            const { account, email, password } = req.body;
            const accountCheck = await User.findOne({ account });
            if (accountCheck) {
                return res.json({ msg: 'Tên người dùng đã tồn tại', status: false });
            }
            const emailCheck = await User.findOne({ email });
            if (emailCheck) {
                return res.json({ msg: 'Email đã được đăng ký', status: false });
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({
                account,
                password: hashPassword,
                email,
                avatar: 'https://png.pngtree.com/element_our/md/20180710/md_5b44128b4c192.jpg',
                username: account,
            });
            delete user.password;
            const setting = new Setting();
            user.setting = setting;
            setting.save();
            user.save();
            const newUser = {
                _id: user._id,
                account: user.account,
                username: user.account,
                avatar: user.avatar,
                // token: createJWT({ userId: user._id, admin: user.admin }),
            };
            return res.json({ status: true, newUser });
        } catch (e) {
            console.log('loi dang ky');
        }
    }

    async messageItem(req, res) {
        const { sender } = req.body;
        let friendList = await FriendList.find();
        if (friendList[0] && friendList[0].friend.get(sender)) {
            let list = friendList[0].friend.get(sender);
            let arr = list.map(async (item) => {
                let user = await User.findOne({ _id: item.id });
                return {
                    id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                };
            });
            let ans = Promise.all(arr);
            ans.then((data) => {
                return res.json({ status: true, userList: data });
            });
        } else {
            const users = await User.find();
            let arr = [];
            users.forEach((user) => {
                if (user._id != sender) {
                    arr.push(user);
                }
            });
            const userList = arr.map((user) => {
                return {
                    id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                };
            });
            return res.json({ status: true, userList });
        }
    }

    async getAMessageItem(req, res) {
        const userId = req.query.id;
        const user = await User.findOne({ _id: userId });
        if (!user) return res.json({ status: false, user: null });
        return res.json({ status: true, user: { username: user.username, avatar: user.avatar, id: userId } });
    }

    getReciever(req, res, next) {
        const userId = req.params.id;
        // res.json(req.params.id);
        User.findOne({ _id: userId }, function (err, user) {
            if (user) {
                const data = {
                    id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                };
                res.json({ status: true, data });
                // console.log(data);
            } else {
                res.json({ status: false, msg: 'Loi server' });
            }
        });
    }

    searchUser(req, res) {
        let name = req.query.q;
        const exceptionuser = req.query.exceptUser;
        let listUser = [];
        User.find({}, function (err, users) {
            users.forEach((user) => {
                const arr = name.split(' ');
                const data = {
                    username: user.username,
                    avatar: user.avatar,
                    userId: user._id,
                };
                if (arr.length == 1 && user.username.startsWith(name) && user._id != exceptionuser) {
                    listUser.push(data);
                } else {
                    for (let i = 0; i < arr.length; i++) {
                        if (user.username.indexOf(arr[i]) > -1 && user._id != exceptionuser) {
                            listUser.push(data);
                            break;
                        }
                    }
                }
            });
            if (listUser.length > 0) {
                return res.json({ status: true, listUser });
            } else {
                return res.json({ status: false, msg: 'ko co nguoi dung trong he thong' });
            }
        });
    }

    blockUser(req, res) {
        // console.log(req.body);
        const { sender, receiver } = req.body;
        User.findOne({ _id: sender }, function (err, user) {
            if (user) {
                const checkUserExist = user.blockList.some((item) => {
                    return item == receiver;
                });
                if (!checkUserExist) {
                    user.blockList.push(receiver);
                    // user.save();
                }
                res.json({ status: true });
            } else res.json({ status: false });
        });
    }

    unblockUser(req, res) {
        // console.log(req.body);
        const { sender, receiver } = req.body;
        User.findOne({ _id: sender }, function (err, user) {
            if (user) {
                let arr = [];
                user.blockList.forEach((item) => {
                    if (item != receiver) {
                        arr.push(item);
                    }
                });
                user.blockList = arr;
                user.save();
                res.json({ status: true });
            } else res.json({ status: false });
        });
    }

    checkBlockStatus(req, res) {
        const { currentUser, receiver } = req.body;
        User.findOne({ _id: currentUser }, function (err, users1) {
            const result = {};
            User.findOne({ _id: receiver }, function (err, users2) {
                const list = users1.blockList;
                const checkBlocked = list.some((userId) => {
                    return userId == receiver;
                });
                if (checkBlocked) {
                    result.block = true;
                }
                const list2 = users2.blockList;
                const checkBlocked2 = list2.some((userId) => {
                    return userId == currentUser;
                });
                if (checkBlocked2) {
                    result.blocked = true;
                }
                return res.json(result);
            });
        });
    }

    async updateAccount(req, res) {
        const { userId, username, oldpassword, newpassword, avatar } = req.body;
        // console.log(req.body);
        User.findOne({ _id: userId }, async function (err, user) {
            user.avatar = avatar ? avatar : user.avatar;
            user.username = username ? username : user.username;
            if (oldpassword && newpassword) {
                let checkPassword = await bcrypt.compare(oldpassword, user.password);
                if (!checkPassword) {
                    return res.json({ status: false, msg: 'Mật khẩu không đúng.' });
                } else {
                    let hashPassword = await bcrypt.hash(newpassword, 10);
                    user.password = hashPassword;
                }
            }
            user.save();
            return res.json({ status: true, msg: 'Đã cập nhật tài khoản.' });
        });
    }

    checkAdmin(req, res) {
        const { userId } = req.body;
        User.findOne({ _id: userId }, (err, user) => {
            if (user.admin) {
                return res.json({ status: true, admin: true });
            } else {
                return res.json({ status: true, admin: false });
            }
        });
    }

    async checkAccount(req, res) {
        const { userId } = req.body;
        const user = await User.findOne({ _id: userId });
        if (user) {
            return res.json({ exist: true });
        } else {
            return res.json({ exist: false });
        }
    }

    adminDeletePermission(req, res) {
        const { type } = req.body;
        // console.log(type);
        if (type == 'delete-all-message') {
            Message.deleteMany({}, (err, messages) => {});
            return res.json({ status: true, msg: 'xoa tat ca tin nhan thanh cong' });
        } else if (type == 'delete-all-user') {
            User.deleteMany({}, (err, users) => {});
            return res.json({ status: true, msg: 'xoa tat ca user thanh cong' });
        } else if (type == 'delete-all-setting') {
            Setting.deleteMany({}, (err, setting) => {});
            return res.json({ status: true, msg: 'xoa tat ca setting thanh cong' });
        }
    }
}

module.exports = new UserController();

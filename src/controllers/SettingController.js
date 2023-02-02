const Setting = require('../models/setting');
const User = require('../models/user');

class SettingController {
    getGeneralSettings(req, res) {
        const { userId } = req.query;
        User.findOne({ _id: userId }, (err, user) => {
            // console.log(user);
            if (user) {
                Setting.findOne({ _id: user.setting }, (err, setting) => {
                    res.json({ status: true, setting: setting.general });
                });
            } else {
                return res.json({ status: false });
            }
        });
    }

    getTheme(req, res) {
        const { sender, receiver } = req.body;
        // console.log(req.body);
        User.findOne({ _id: sender }, (err, user) => {
            Setting.findOne({ _id: user.setting }, (err, setting) => {
                let data = {};
                const theme = setting.chat.theme.get(receiver);
                const backgroundImage = setting.chat.backgroundImage.get(receiver);
                if (theme) {
                    data.theme = theme;
                } else {
                    setting.chat.theme.set(receiver, '0');
                    data.theme = '0';
                }
                if (backgroundImage) {
                    data.backgroundImage = backgroundImage;
                } else {
                    data.backgroundImage = '';
                }
                return res.json({ status: true, setting: data });
            });
        });
    }

    deleteAll(req, res) {
        Setting.deleteMany({}, function (err, setting) {
            return res.send('oke');
        });
    }

    changeTheme(req, res) {
        // console.log(req.body);
        const { sender, receiver, theme } = req.body;
        const promise = Promise.resolve();
        promise
            .then(() => {
                User.findOne({ _id: sender }, (err, user) => {
                    Setting.findOne({ _id: user.setting }, (err, setting) => {
                        // console.log(setting.chat.theme);
                        setting.chat.theme.set(receiver, theme);
                        setting.save();
                    });
                });
            })
            .then(() => {
                User.findOne({ _id: receiver }, (err, user) => {
                    Setting.findOne({ _id: user.setting }, (err, setting) => {
                        setting.chat.theme.set(sender, theme);
                        setting.save();
                    });
                });
            })
            .then(() => {
                return res.json({ status: true });
            })
            .catch((err) => {
                console.log('loi change them');
            });
    }

    setBackgroundImage(req, res) {
        const { sender, receiver, image } = req.body;
        // console.log(sender, receiver);
        const promise = Promise.resolve();
        promise
            .then(() => {
                User.findOne({ _id: sender }, (err, user) => {
                    Setting.findOne({ _id: user.setting }, (err, setting) => {
                        // console.log(setting.chat.theme);
                        setting.chat.backgroundImage.set(receiver, image);
                        setting.save();
                    });
                });
            })
            .then(() => {
                User.findOne({ _id: receiver }, (err, user) => {
                    Setting.findOne({ _id: user.setting }, (err, setting) => {
                        setting.chat.backgroundImage.set(sender, image);
                        setting.save();
                    });
                });
            })
            .then(() => {
                return res.json({ status: true });
            })
            .catch((err) => {
                console.log('loi change them');
            });
    }

    changeGenaralSettings(req, res) {
        // console.log(req.body);
        const { userId, type, value } = req.body;
        User.findOne({ _id: userId }, (err, user) => {
            Setting.findOne({ _id: user.setting }, (err, setting) => {
                if (type === 'dark mode') {
                    setting.general.darkMode = value;
                    setting.save();
                    res.json({ status: true });
                } else if (type == 'sound') {
                    const { notify, send, textting } = value;
                    setting.general.texttingSound = textting;
                    setting.general.sendMessageSound = send;
                    setting.general.notificationSound = notify;
                    setting.save();
                    res.json({ status: true });
                }
            });
        });
    }
}

module.exports = new SettingController();

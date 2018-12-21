"use strict";
cc._RF.push(module, 'f7e88yLkVlNjqndbdp6NqMq', 'facebook');
// Script/SDK/facebook.js

"use strict";

var Utils = require("../Utils/Utils");

var ELoadState = {
    AD_LOADING: "AD_LOADING",
    AD_LOAD_SUCCESS: "AD_LOAD_SUCCESS",
    AD_LOAD_FAIL: "AD_LOAD_FAIL",
    AD_COMPLETE: "AD_COMPLETE"
};

var GM_PIDS = [1609486632505587, 1759127554126047];
var video_ad_ids = '160840521263423_160841467929995';
var interstitial_ad_ids = '160840521263423_160841827929959';

var FB_SDK = function FB_SDK() {
    this.cb = null;
    this.videoAd = null;
    this.videoAdState = null;
    this.InterstitialAd = null;
    this.InterstitialAdState = null;
};

var MyPlayer = {};

/**
    初始化AD等
*/
FB_SDK.prototype.init = function (cb) {
    if (typeof FBInstant === 'undefined') return;
    // console.log("playerID",FBInstant.player.getID());

    this.loadVideoAd();
    this.loadInterstitialAd();

    var locale = FBInstant.getLocale(); // 'en_US'
    if (locale == 'zh_CN') {
        var i18n = require('LanguageData');
        i18n.init('en');
    }

    MyPlayer.name = FBInstant.player.getName();
    cc.loader.load(FBInstant.player.getPhoto(), function (err, texture) {
        MyPlayer.head = new cc.SpriteFrame(texture);
    });
    MyPlayer.id = FBInstant.player.getID();

    var locale = this.getLocale(); // 'en_US'
    /* FBInstant.startGameAsync().then(function () {
      }); */

    if (cb != null) {
        cb();
    }
};

FB_SDK.prototype.isGM = function () {
    if (typeof FBInstant === 'undefined') return false;

    var playerID = FBInstant.player.getID();
    // console.log("Utils.inArray(playerID,GM_PIDS):",Utils.inArray(playerID,GM_PIDS))
    return Utils.inArray(playerID, GM_PIDS);
};

FB_SDK.prototype.clearData = function () {
    if (typeof FBInstant === 'undefined') return false;

    SDK().setScore({ all: 0 }, null);
    SDK().setScore({ my_help: 0 }, null);
    var bid = 1;
    for (var mid = 1; mid <= 6; mid++) {
        for (var lid = 1; lid <= 100; lid++) {
            var param = {};
            param[bid + "_" + mid + "_" + lid] = 0;
            this.setScore(param, null);

            var param1 = {};
            param1[bid + "_" + mid + "_" + lid + "_moves"] = 0;
            this.setScore(param1, null);
        }

        var param2 = {};
        param2[bid + "_" + mid] = 0;
        this.setScore(param2, null);

        var param3 = {};
        param3["unlock_" + bid + "_" + mid] = 0;
        SDK().setScore(param3, null);
    }
};

FB_SDK.prototype.getLocale = function () {
    if (typeof FBInstant === 'undefined') return;

    return FBInstant.getLocale();
};

FB_SDK.prototype.share = function (score, cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(true);
        }
        return;
    }
    var self = this;

    FBInstant.context.chooseAsync().then(function () {
        // console.log("FBInstant.context.getID():",FBInstant.context.getID());
        self.doShare(score);
        if (cb != null) {
            cb(true);
        }
    }).catch(function (e) {
        // console.log("catch",e);
        if (e.code != null && e.code == "SAME_CONTEXT") {
            //相同的用户或group，不能再次发消息
            if (cb != null) {
                cb(false);
            }
        }
    });
};

FB_SDK.prototype.doShare = function (score) {
    var self = this;
    var en_text = self.getName() + " finish " + score + " missions,Can you beat me?";
    var cn_text = self.getName() + "向你发起挑战！他已过了 " + score + " 关！";
    // console.log("share:"+en_text);

    var framePath = "texture2d/game_icon";
    // console.log("framePath:",framePath)
    cc.loader.loadRes(framePath, cc.Texture2D, function (err, texture) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 420;

        var image = texture.getHtmlElementObj();
        ctx.drawImage(image, 0, 0);

        var base64Picture = canvas.toDataURL('image/png');

        FBInstant.updateAsync({
            action: 'CUSTOM',
            cta: 'Play Game',
            template: 'join_fight',
            image: base64Picture,
            text: en_text,
            data: { myReplayData: '...' },
            strategy: 'IMMEDIATE',
            notification: 'NO_PUSH'
        }).then(function () {
            //当消息发送后
            // console.log("____当消息发送后")
        });
    });
};

FB_SDK.prototype.loadInterstitialAd = function () {
    if (typeof FBInstant === 'undefined') return;

    // console.log("loadInterstitialAd")
    FBInstant.getInterstitialAdAsync(interstitial_ad_ids).then(function (interstitial) {
        // console.log("FBInstant.getInterstitialAdAsync:",interstitial);
        this.InterstitialAd = interstitial;
        this.InterstitialAdState = ELoadState.AD_LOADING;
        return this.InterstitialAd.loadAsync();
    }.bind(this)).catch(function (e) {
        // console.log("load.showInterstitialAd catch");
        // console.log(JSON.stringify(e));
    }.bind(this)).then(function () {
        // console.log("FBInstant.getInterstitialAdAsync done:");
        this.InterstitialAdState = ELoadState.AD_LOAD_SUCCESS;
    }.bind(this));
};

/**
 * 切换到别的游戏（互推游戏）
**/
FB_SDK.prototype.switchGameAsync = function (game_id) {
    if (typeof FBInstant === 'undefined') return false;
    FBInstant.switchGameAsync(game_id).catch(function (e) {
        // Handle game change failure
    });
};

FB_SDK.prototype.showInterstitialAd = function (cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb) {
            cb(false);
        }
        return;
    };

    // console.log("FB_SDK.prototype.showInterstitialAd",this.InterstitialAd);

    if (this.InterstitialAd != null) {
        // console.log("show Interstitial ad start");
        this.InterstitialAd.showAsync().then(function () {
            // console.log("this.showInterstitialAd.showAsync");
            this.InterstitialAdState = ELoadState.AD_COMPLETE;
            // this.game.paused = false;
            // window.sounds.toggleMusic(false);
            if (cb) {
                cb(true);
            }

            // console.log("show showInterstitialAd success");
            this.loadInterstitialAd();
        }.bind(this)).catch(function (e) {
            // console.log("this.showInterstitialAd catch");
            this.InterstitialAdState = ELoadState.AD_COMPLETE;
            // this.game.paused = false;
            // window.sounds.toggleMusic(false);
            // console.log(JSON.stringify(e));
            if (cb) {
                cb(false);
            }
        }.bind(this));
    } else {
        // console.log("show showInterstitialAd ad Stop");
        if (cb) {
            cb(false);
        }
        this.loadInterstitialAd();
    }
};

FB_SDK.prototype.loadVideoAd = function () {
    if (typeof FBInstant === 'undefined') return;

    // console.log("FB_SDK.prototype.loadVideoAd");
    FBInstant.getRewardedVideoAsync(video_ad_ids).then(function (rewardedVideo) {
        this.videoAd = rewardedVideo;
        this.videoAdState = ELoadState.AD_LOADING;
        return this.videoAd.loadAsync();
    }.bind(this)).then(function () {
        this.videoAdState = ELoadState.AD_LOAD_SUCCESS;
    }.bind(this)).catch(function (err) {
        this.videoAdState = ELoadState.AD_LOADING;
        this.loadVideoAd();
    }.bind(this));;
};

FB_SDK.prototype.hasVideoAd = function () {
    if (typeof FBInstant === 'undefined') {
        return false;
    };

    return this.videoAd != null;
};

FB_SDK.prototype.showVideoAd = function (cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb) {
            cb(true);
        }
        return;
    };

    // console.log("FB_SDK.prototype.showVideoAd",this.videoAd);

    if (this.videoAd != null) {
        cc.game.pause();
        // console.log("show video ad start");
        this.videoAd.showAsync().then(function () {
            // console.log("this.videoAd.showAsync");
            this.videoAdState = ELoadState.AD_COMPLETE;
            // this.game.paused = false;
            // window.sounds.toggleMusic(false);
            if (cb) {
                cb(true);
            }
            cc.game.resume();
            // console.log("show video ad success");
            this.loadVideoAd();
        }.bind(this)).catch(function (e) {
            // console.log("this.videoAd catch");
            this.videoAdState = ELoadState.AD_COMPLETE;
            // this.game.paused = false;
            // window.sounds.toggleMusic(false);
            // console.log(JSON.stringify(e));
            if (cb) {
                cb(false);
            }
            cc.game.resume();
        }.bind(this));
    } else {
        // console.log("show video ad Stop");
        if (cb) {
            cb(false);
        }
        cc.game.resume();
        this.loadVideoAd();
    }
};

FB_SDK.prototype.getInfo = function () {
    if (typeof FBInstant === 'undefined') {
        return { id: 1 };
    }
    return MyPlayer;
};

FB_SDK.prototype.getName = function () {
    if (typeof FBInstant === 'undefined') return "undefined";
    return FBInstant.player.getName();
};

FB_SDK.prototype.getScore = function (key, cb, node, lid) {
    if (typeof FBInstant === 'undefined') {
        var score = JSON.parse(cc.sys.localStorage.getItem(key));
        if (typeof score === 'undefined' || score == null) {
            score = 0;
        } else {
            score = parseInt(score);
        }
        cb(score, node, lid);
    } else {
        var datas = [];
        datas.push(key);
        var score = 0;
        FBInstant.player.getDataAsync(datas).then(function (data) {
            // console.log('data is loaded',key,data['key']);
            if (typeof data[key] === 'undefined') {
                score = 0;
            } else {
                score = parseInt(data[key]);
            }
            // console.log("--------------FB_SDK.prototype.getScore:",score)
            cb(score, node, lid);
        });
    }
};

FB_SDK.prototype.setScore = function (score, cb) {
    if (typeof FBInstant === 'undefined') {

        for (var p in score) {
            //遍历json对象的每个key/value对,p为key
            // cc.log("setScore:"+ p + "_" + score[p]);
            cc.sys.localStorage.setItem(p, score[p]);
        }
        // 
        if (cb != null) {
            cb();
        }
    } else {
        FBInstant.player.setDataAsync(score).then(function () {
            if (cb != null) {
                cb();
            }
            // console.log('------------data is set',score);
        });
    }
};

module.exports = function () {
    var instance;
    return function () {
        if (!instance) {
            instance = new FB_SDK();
        }
        return instance;
    };
}();

cc._RF.pop();
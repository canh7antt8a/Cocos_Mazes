"use strict";
cc._RF.push(module, 'f08152UaoRPB64U7d0m5V+q', 'GameApplication');
// Script/GameLogic/GameApplication.js

"use strict";

var _cc$Class;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Player = require("../GameLogic/Player");
var SoundManager = require("../GameLogic/SoundManager");
var DataAnalytics = require("../SDK/DataAnalytics");
var MainView = require("../UI/MainView");
var LevelView = require("../UI/LevelView");

cc.Class((_cc$Class = {
    extends: cc.Component,

    properties: {
        soundManager: {
            default: null,
            type: SoundManager
        },
        // audioSource: {
        //      type: cc.AudioSource,
        //      default: null
        // },
        missions: {
            default: []
        },
        missionsCB: {
            default: []
        },
        conf: {
            default: {}
        },
        confCB: {
            default: []
        },
        _playTimes: {
            default: 0,
            type: cc.Integer
        },
        playTimes: {
            get: function get() {
                return this._playTimes;
            },
            set: function set(val) {
                this._playTimes = val;

                if (this._playTimes % playTimesAD == 0 && this._playTimes != 1) {
                    console.log("播放插屏广告");
                    SDK().showInterstitialAd(function (isCompleted) {
                        if (isCompleted) {
                            gameApplication.DataAnalytics.doEvent("播放插屏广告成功");
                        } else {
                            gameApplication.DataAnalytics.doEvent("播放插屏广告失败");
                        }
                        console.log("播放Done");
                    });
                }
            }
        },
        PopGameView: {
            default: null,
            type: cc.Node
        }
    },

    start: function start() {
        var i18n = require('LanguageData');
        i18n.init('en');
        SDK().init(function () {
            DataAnalytics.login(SDK().getInfo().id);
            var levelDetail = {};
            levelDetail.level = "gameStart";
            gameApplication.DataAnalytics.levelBegin(levelDetail);
        }.bind(this));
    },
    getConf: function getConf(path, cb) {

        if (this.conf[path] != null) {
            if (cb) {
                // cc.log("从cache读取："+path)
                cb(this.conf[path]);
            }
        } else {
            // cc.log("从硬盘读取："+path)
            cc.loader.loadRes(path, function (err, results) {
                this.conf[path] = results;
                if (cb != null) {
                    cb(results);
                }
            }.bind(this));
        }
    },
    onLoad: function onLoad() {
        window.gameApplication = this;
        window.gameFirst = true;
        this.DataAnalytics = DataAnalytics;
        DataAnalytics.init();
        cc.game.addPersistRootNode(this.node);
        window.gameTimes = 1;
        // this.audioSource.play();
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = false;
        manager.enabledDrawBoundingBox = false;

        //Load Json
        cc.loader.loadRes("conf/missions", function (err, results) {
            this.missions = results;
            this.invokeMissionCB();
        }.bind(this));

        this.openMainView();

        //处理第一次进入游戏
        SDK().getScore("playingMid", function (mid) {
            if (mid == 0 || mid == undefined || mid == null) {
                mid = 1;
            }
            SDK().getScore("playingLid", function (lid) {
                if (lid == 0 || lid == undefined || lid == null) {
                    lid = 1;
                }
                window.bid = 1;
                window.mid = mid;
                window.lid = lid;
                cc.director.loadScene("game");
            }.bind(this));
        }.bind(this));
        // window.bid = 1;
        // window.mid = 1;
        // window.lid = 8;
        // cc.director.loadScene("game"); 

        cc.game.on(cc.game.EVENT_HIDE, function () {
            DataAnalytics.gameHideAndShow(true);
            cc.audioEngine.pauseAll();
        });

        cc.game.on(cc.game.EVENT_SHOW, function () {
            DataAnalytics.gameHideAndShow(false);
            cc.audioEngine.resumeAll();
        });
    },
    onDestroy: function onDestroy() {
        var levelDetail = {};
        levelDetail.level = "gameStart";
        gameApplication.DataAnalytics.levelResult(true, levelDetail);
        DataAnalytics.logout(SDK().getInfo().id);
    }
}, _defineProperty(_cc$Class, "onDestroy", function onDestroy() {
    cc.director.getCollisionManager().enabled = false;
}), _defineProperty(_cc$Class, "getMissions", function getMissions(cb) {

    if (this.missions != null && this.missions.length > 0) {
        cb(this.missions);
    } else {
        this.missionsCB.push(cb);
    }
}), _defineProperty(_cc$Class, "invokeMissionCB", function invokeMissionCB() {
    var self = this;
    if (this.missionsCB.length > 0) {
        this.missionsCB.forEach(function (cb) {
            if (cb != null) {
                cb(self.missions);
            }
        });
    }
}), _defineProperty(_cc$Class, "setNodeActive", function setNodeActive(nodePath, active) {
    cc.find("Canvas/" + nodePath).active = active;
}), _defineProperty(_cc$Class, "openMainView", function openMainView() {
    this.setNodeActive("levelView", false);
    this.setNodeActive("mainView", true);
}), _defineProperty(_cc$Class, "openLevelView", function openLevelView(bid, mid) {
    this.setNodeActive("levelView", true);
    this.setNodeActive("mainView", false);
    cc.find("Canvas/levelView").getComponent("LevelView").init(bid, mid);
}), _defineProperty(_cc$Class, "onQuitBtnClick", function onQuitBtnClick() {
    // console.log("用户中途退出");
}), _defineProperty(_cc$Class, "popClick", function popClick(event, type) {
    SDK().switchGameAsync(type);
}), _cc$Class));

cc._RF.pop();
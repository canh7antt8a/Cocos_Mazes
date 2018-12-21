var Player = require("../GameLogic/Player");
var SoundManager = require("../GameLogic/SoundManager");
var DataAnalytics = require("../SDK/DataAnalytics");
var MainView = require("../UI/MainView");
var LevelView = require("../UI/LevelView");

cc.Class({
    extends: cc.Component,

    properties: {
        soundManager: {
            default: null,
            type: SoundManager,
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
            default: {},
        },
        confCB: {
            default: []
        },
        _playTimes: {
            default: 0,
            type: cc.Integer,
        },
        playTimes: {
            get: function () {
                return this._playTimes;
            },
            set: function (val) {
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
            },
        },
        PopGameView:{
            default: null,
            type: cc.Node,
        },
    },

    start() {
        const i18n = require('LanguageData');
        i18n.init('en');
        SDK().init(function () {
            DataAnalytics.login(SDK().getInfo().id);
            var levelDetail = {};
            levelDetail.level = "gameStart"
            gameApplication.DataAnalytics.levelBegin(levelDetail);
        }.bind(this));
    },

    getConf(path, cb) {

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
                    cb(results)
                }
            }.bind(this));
        }
    },


    onLoad() {
        window.gameApplication = this;
        window.gameFirst = true;
        this.DataAnalytics = DataAnalytics;
        DataAnalytics.init()
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

    onDestroy() {
        var levelDetail = {};
        levelDetail.level = "gameStart"
        gameApplication.DataAnalytics.levelResult(true, levelDetail);
        DataAnalytics.logout(SDK().getInfo().id);
    },

    onDestroy() {
        cc.director.getCollisionManager().enabled = false;
    },

    getMissions(cb) {

        if (this.missions != null && this.missions.length > 0) {
            cb(this.missions);
        } else {
            this.missionsCB.push(cb);
        }
    },

    invokeMissionCB() {
        var self = this;
        if (this.missionsCB.length > 0) {
            this.missionsCB.forEach(function (cb) {
                if (cb != null) {
                    cb(self.missions);
                }
            });
        }
    },

    setNodeActive(nodePath, active) {
        cc.find("Canvas/" + nodePath).active = active;
    },


    openMainView: function () {
        this.setNodeActive("levelView", false);
        this.setNodeActive("mainView", true);
    },

    openLevelView: function (bid, mid) {
        this.setNodeActive("levelView", true);
        this.setNodeActive("mainView", false);
        cc.find("Canvas/levelView").getComponent("LevelView").init(bid, mid);
    },

    onQuitBtnClick: function () {
        // console.log("用户中途退出");
    },

    //互推按钮时间
    popClick(event,type){
        SDK().switchGameAsync(type);
    },
    // update (dt) {},
});

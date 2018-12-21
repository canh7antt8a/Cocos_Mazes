cc.Class({
    extends: cc.Component,

    properties: {
        noAdsView:{
            default: null,
            type: cc.Node,
        },
        title: {
            default: null,
            type: cc.Label,
        },
        starts: {
            default: null,
            type: cc.Node,
        },
        content: {
            default: null,
            type: cc.Node,
        },
        missionItem: {
            default: null,
            type: cc.Node,
        },
        missionSpriteAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        missions:{
            default:null,
        },
        gameApplication:{
            default:null,
            type:Object
        },
        watchADTip:{
            default:null,
            type:cc.Node,
        },
        unlock_bid:{
            default:0,
            type:cc.Integer,
        }, 
        unlock_mid:{
            default:0,
            type:cc.Integer,
        },
        unlock_ad:{
            default:0,
            type:cc.Integer,
        },
        watched_ad:{
            default:0,
            type:cc.Integer,
        },
        missionNodes:{
            default:{}
        },
        musicBtn:{
            default:null,
            type:cc.Sprite,
        },
        musicOff:{
            default:null,
            type:cc.SpriteFrame,
        },
        musicOn:{
            default:null,
            type:cc.SpriteFrame,
        },
    }, 

    onLoad: function () {

        this.gameApplication = cc.find("GameApplication").getComponent("GameApplication");
        this.init();
        cc.director.preloadScene("game", function () {
        });
    },

    start () {

    },

    showNoAds(){
        this.noAdsView.active = true;
    },

    hideNoAds(){
        this.noAdsView.active = false;
    },

    onEnable(){
        this.checkMusic();
    },


    checkMusic(event,isDis){
        if(isDis == "turn"){
            if(gameApplication.soundManager.isOpen){
                gameApplication.soundManager.setIsOpen(false);
            }else{
                gameApplication.soundManager.setIsOpen(true);
            }
        }
        if(gameApplication.soundManager.isOpen){
            this.musicBtn.spriteFrame = this.musicOn;
        }else{
            this.musicBtn.spriteFrame = this.musicOff;
        }
    },


    init(){
        if(this.missions == null || Object.keys(this.missions).length <= 0){
            this.gameApplication.getMissions(function(results){
                this.missions = results;
                this.initContents();
            }.bind(this));
        }else{
            this.initContents();
        }

        var self = this;
        SDK().getScore("all",function(score){
            self.starts.getComponent(cc.Label).string = score.toString();
        }.bind(this));
        
    },

    initContents(){
        this.hideAllItem();
        var idx = 0;
        this.missions.forEach(function(mission){
            this.initMissionItem(mission,idx);
            idx++;
        }.bind(this));    
    },

    initMissionItem(mission,idx){
        var cannonNode = cc.instantiate(this.missionItem);

        cannonNode.parent = this.content;
        cannonNode.active = true;
        cannonNode.tag = idx;

        var bgPath = (idx%6) + 1;

        var starObj = cannonNode.getChildByName("star");
        var lockObj = cannonNode.getChildByName("lock");
        //set bg
        // cannonNode.getChildByName("desc").getComponent(cc.Sprite).spriteFrame = this.missionSpriteAtlas.getSpriteFrame("level_bg_"+bgPath);

        //set title
        cannonNode.getChildByName("title").getComponent(cc.Label).string = mission['title'];
        cannonNode.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.missionSpriteAtlas.getSpriteFrame("mission_"+bgPath);

        // cannonNode.getChildByName("bg").color = cc.hexToColor(mission['color']);
        // cc.find("desc/val",cannonNode).getComponent(cc.Label).string = mission['desc'];

        var stars = mission['stars'];
        var bid = mission['bid'];
        var mid = mission['mid'];
        var unlock_ad = mission['unlock_ad'];

        this.missionNodes[bid+"_"+mid] = cannonNode;

        SDK().getScore(bid+"_"+mid,function(score){
            cc.find("unlock/count",cannonNode).getComponent(cc.Label).string = score + "/"+stars;
            cc.find("lock/count",cannonNode).getComponent(cc.Label).string = score + "/"+stars;
        })

        if(unlock_ad <= 0){
            cc.find("unlock",cannonNode).active = true;
            cc.find("lock",cannonNode).active = false;
        }else{
            cc.find("unlock",cannonNode).active = false;
            cc.find("lock",cannonNode).active = true;
            var isUnlock = false;
            SDK().getScore("unlock_"+bid+"_"+mid,function(test){
                if(test >= unlock_ad){
                    isUnlock = true;
                }

                cc.find("lock/tip",cannonNode).getComponent(cc.Label).string = "watch "+unlock_ad+" videos\n to unlock this new world";
                cc.find("lock/icon_play/val",cannonNode).getComponent(cc.Label).string = test+"/"+unlock_ad;

                cc.find("unlock",cannonNode).active = isUnlock;
                cc.find("lock",cannonNode).active = !isUnlock;
            }.bind(this));
        }

        //预加载关卡
        var path = "conf/level_list/level_" + bid + '_' + mid;
        this.gameApplication.getConf(path,null)

    },

    onWatchVideoBtnClicked(){
        // cc.log("onWatchVideoBtnClicked");
        var self = this;
        SDK().showVideoAd(function(isCompleted){
            if(isCompleted){
                //进入关卡
                var bid = self.unlock_bid;
                var mid = self.unlock_mid;
                var unlock_ad= self.unlock_ad;

                self.watched_ad++;

                //更新node
                var cannonNode = this.missionNodes[bid+"_"+mid];
                cc.find("lock/icon_play/val",cannonNode).getComponent(cc.Label).string = self.watched_ad+"/"+unlock_ad;

                if(self.watched_ad >= unlock_ad){
                    self.showLevelPanel(bid,mid);    
                    cc.find("unlock",cannonNode).active = true;
                    cc.find("lock",cannonNode).active = false;
                }else{
                    cc.find("unlock",cannonNode).active = false;
                    cc.find("lock",cannonNode).active = true;
                }


                //记录这一关看广告次数
                var param = {};
                param["unlock_"+bid+"_"+mid] = self.watched_ad;
                SDK().setScore(param,null);


            }else{
                cc.log("播放视频广告失败")
                this.showNoAds();
            }

        }.bind(this));
    },

    // onCloseWatchVideoTipClicked(){
    //     this.watchADTip.active = false;
    // }, 

    onMissionItemClicked(event){
        var self = this;
        var target = event.target;
        var targetBtn = target.getComponent(cc.Button);

        targetBtn.interactable = false;
        // target.getComponent(cc.Button).interactable = false;


        var tag = parseInt(target.tag);
        var mission = this.missions[tag];
        // cc.log(mission)
        if(mission == null){
            return;
        }

        var bid = mission['bid'];
        var mid = mission['mid'];
        var unlock_ad = mission['unlock_ad'];
        

        if(unlock_ad <= 0){
            this.showLevelPanel(bid,mid);
            targetBtn.interactable = true;
        }else{
            var isUnlock = false;
            SDK().getScore("unlock_"+bid+"_"+mid,function(test){
                if(test >= unlock_ad){
                    isUnlock = true;
                }

                if(isUnlock){
                    self.showLevelPanel(bid,mid);
                    targetBtn.interactable = true;
                }else{
                    self.unlock_bid = bid;
                    self.unlock_mid = mid;
                    self.unlock_ad = unlock_ad;
                    self.watched_ad = test;

                    self.onWatchVideoBtnClicked();
                    targetBtn.interactable = true;

                }
                
            }.bind(this));


        }

        
    },

    hideAllItem(){
        // cc.log("this.content.childrenCount:"+this.content.childrenCount)
        if(this.content.childrenCount > 0){
            //如果有child，destroy
            // cc.log("如果有child，destroy");
            this.content.children.forEach(function(n){
                n.active = false;
                n.destroy();
            });
        }
    },

    showLevelPanel(bid,mid){
        this.gameApplication.openLevelView(bid,mid);
        this.gameApplication.soundManager.playSound("btn_click");
    },

    onBackBtnClicked(){
        this.gameApplication.backToWelcome();
        this.gameApplication.soundManager.playSound("btn_click");
    },


    // update (dt) {},
});

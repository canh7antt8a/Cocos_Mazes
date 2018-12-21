(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/UI/Game/Tower.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'fffd1g1zLBJ9Zn7NHAXbn3T', 'Tower', __filename);
// Script/UI/Game/Tower.js

"use strict";

var HexCell = require("./HexCell");

cc.Class({
    extends: cc.Component,

    properties: {
        bubble: {
            default: null,
            type: cc.Node
        },
        bubbleAxialCoordinate: {
            default: cc.v2(0, 0),
            visible: false
        },
        _axialCoordinate: {
            default: cc.v2(0, 0),
            visible: false
        },
        axialCoordinate: {
            get: function get() {
                return this._axialCoordinate;
            },
            set: function set(val) {
                this._axialCoordinate = cc.v2(val.x, val.y);
                this.bubbleAxialCoordinate = cc.v2(val.x, val.y);
            }
        },
        isShooting: false,
        direction: {
            default: -1,
            type: cc.Integer,
            visible: false
        },
        f: {
            default: 0,
            type: cc.Integer,
            visible: false
        },
        s: {
            default: 0,
            type: cc.Integer,
            visible: false
        },
        delay: {
            default: 0,
            type: cc.Integer,
            visible: false
        },
        size: {
            default: cc.size(0, 0),
            type: cc.Size,
            visible: false
        },
        scaleX: {
            default: 1,
            type: cc.Integer,
            visible: false
        },
        scaleY: {
            default: 1,
            type: cc.Integer,
            visible: false
        }

    },

    onEnable: function onEnable() {
        this.schedule(this.check, 0.1);
    },
    onDisable: function onDisable() {
        this.unschedule(this.check);
    },
    init: function init(config) {
        this.direction = config.direction;
        this.f = config.f;
        this.s = config.s;
        this.delay = config.delay;
        this.isShooting = false;
        this.bubble.active = false;
        this.node.setContentSize(this.size);
        // cc.log("this.scaleX,this.scaleY:",this.scaleX,this.scaleY)
        this.bubble.setScale(this.scaleX, this.scaleY);
    },
    setScaleXY: function setScaleXY(x, y) {
        this.size = cc.size(34 * x, 51 * y);
        this.scaleX = x;
        this.scaleY = y;
    },
    check: function check() {
        if (gameView.myRole != null) {
            var rPosition = gameView.myRole.node.getPosition();
            var bPosition = this.getUIPosition(this.bubble, gameView.myRole.node.parent);
            if (this.bubble.active && cc.pDistance(rPosition, bPosition) <= 20) {
                this.unschedule(this.check);

                var levelDetail = {};
                levelDetail.level = mid + "0" + (lid > 99 ? lid : lid > 9 ? "0" + lid : "00" + lid);
                levelDetail.reason = "被飞镖撞死";
                gameApplication.DataAnalytics.levelResult(false, levelDetail);

                gameView.die();
            }
        }
    },
    getUIPosition: function getUIPosition(myNode, targetNode) {
        var naturePos = myNode.parent.convertToWorldSpaceAR(myNode.getPosition());
        var targetPos = targetNode.convertToNodeSpaceAR(naturePos);
        return targetPos;
    },


    onLoad: function onLoad() {},

    start: function start() {}
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=Tower.js.map
        
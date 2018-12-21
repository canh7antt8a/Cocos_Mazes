var HexCell = require("./HexCell");

cc.Class({
    extends: cc.Component,

    properties: {
        emeny: {
            default: null,
            type: cc.Node,
        },
        _axialCoordinate: {
            default: cc.v2(0, 0),
            visible: false,
        },
        axialCoordinate: {
            get() {
                return this._axialCoordinate;
            },
            set(val) {
                this._axialCoordinate = cc.v2(val.x, val.y);
            },
        },
    },


    onEnable() {
        this.schedule(this.check, 0.1);
    },
    onDisable() {
        this.unschedule(this.check);
    },

    onLoad: function () {
    },

    check() {
        if (cc.pDistance(gameView.myRole.node.getPosition(), this.node.getPosition()) <= 40) {
            this.unschedule(this.check);

            var levelDetail = {};
            levelDetail.level = mid + "0" + (lid > 99 ? lid : (lid > 9 ? "0" + lid : "00" + lid));
            levelDetail.reason = "被怪兽撞死"
            gameApplication.DataAnalytics.levelResult(false, levelDetail);

            gameView.die();
        }
    },

    start() {

    },
    /**
    * 移动
    */
    moveTo() {

    }

});

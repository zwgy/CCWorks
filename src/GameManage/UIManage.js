/**
 * Created by jorbeen on 2017/8/29.
 */
(function(){

//获取最大zorder
    function getMaxZ(){
        var z=[0];
        for(var k in GM.UIMage.UIBase.openingFrame){
            if(GV.UI[k] && GV.UI[k].ui && GV.UI[k].ui.getZOrder()){
                z.push(GV.UI[k].ui.getZOrder());
            }
        }
        var maxz = Math.max.apply(null,z);
        if(maxz>49) maxz=49;
        return maxz;
    }

    function checkIfOnTop(){
        var z=0,frameid;
        for(var k in GM.UIMage.UIBase.openingFrame){
            if(GM.UIMage.UIBase.openingFrame[k] > z){
                z = GM.UIMage.UIBase.openingFrame[k];
                frameid = k;
            }
        }
        if(frameid && GV.UI[frameid]){
            GV.UI[frameid].isOnTop = true;
            GV.UI[frameid].onTop && GV.UI[frameid].onTop();

            for(var k in GM.UIMage.UIBase.openingFrame){
                if(frameid != k){
                    if(GV.UI[k])GV.UI[k].isOnTop = false;
                }
            }
        }
    }

    GM.UIMage.closeAllFrame = function(isRemoveInterest){
        for(var k in GM.UIMage.UIBase.openingFrame){
            if(GV.UI[k].remove){
                GV.UI[k].remove();
            }
        }
        if(isRemoveInterest){
            GM.UIMage.closeAllInterestUI();
        }
    };
    //删除所有单例模式的UI
    GM.UIMage.closeAllInterestUI = function(){
        for(var obj in GV.UI){
            if(GV.UI[obj]&&GV.UI[obj]['_instance']){
                GV.UI[obj]['_instance'] = null
            }
        }
    };


//是否有打开的界面
    GM.UIMage.IsHaveOpenUI = function(){
        for(var k in GM.UIMage.openingFrame){
            if(GV.UI[k] && GV.UI[k].isOpen){
                return true;
            }
        }
        return false;
    }
    GM.UIMage.BindUIByID = function (ID,value) {
        Object.defineProperty(GV.UI, ID, {
            value: value,
            writable: false
        });
    }
    GM.UIMage.UIBase = cc.Class.extend({
        ctor: function(json,id,type,flid){
            this._json = json;
            this._id = id;
            this._type = type;
            this._flid = flid;
            GM.UIMage.UIBase.openingFrame = GM.UIMage.UIBase.openingFrame || {};
        },
        changeJson : function(json){
            this._json = json;
            return this;
        },
        //外接数据
        extData : function(d){
            if(d!=null){
                this._extData = d;
                return this;
            }else{
                return 	this._extData;
            }
        },
        show : function(callback){
            GM.UIMage.UIBase.openingFrame[this._id] = 1;
            var me = this;
            if(!me.isOpen){
                me.isOpen = true;
                me.ui = GN.ccsUI(this._json,this._id,this._type,this._flid);
                GN.GetRunScene().addChild(this.ui);
                callback && callback.call(me);
            }

            me.ui._onExit = function(){
                delete GM.UIMage.UIBase.openingFrame[me._id];
                me.isOpen = false;
            };

            me.goToTop();
            checkIfOnTop();
        },
        remove : function(){
            //删除
            var me = this;
            delete GM.UIMage.UIBase.openingFrame[me._id];
            this.isOpen = false;

            GN.Log('remove='+me._id);
            me.ui && me.ui.removeFromParent();

            me.onclose && me.onclose();
            me.close && me.close();

            checkIfOnTop();
        },
        goToTop : function(){
            //置于顶端
            var maxZ = getMaxZ();
            this._oldZOrder = this.ui.getZOrder();

            this.ui.setZOrder(maxZ+1);

            //单点触摸
            if(this._type==BC.CUIType.FL){
                this.ui.touch(BC.CUIType.FL,null,this);
            }

            GM.UIMage.UIBase.openingFrame[this._id] = maxZ+1;
        }
    });
})();

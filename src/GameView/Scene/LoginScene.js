
var LoginScene = cc.Scene.extend({

    onEnter:function()
    {
        this._super();
        GV.UI["Login"].show();
    }
});
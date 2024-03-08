(function()
{
    return function()
    {
        if (!this._is_form)
            return;
        
        var obj = null;
        
        this.on_create = function()
        {
            this.set_name("progressload_desc");
            this.set_titletext("New Form");
            if (Form == this.constructor)
            {
                this._setFormPosition(920,300);
            }
            
            // Object(Dataset, ExcelExportObject) Initialize

            
            // UI Components Initialize
            obj = new Static("Static00","20","15","120","30",null,null,null,null,null,null,this);
            obj.set_taborder("0");
            obj.set_text("TEXT(\"grid.progressload\",\"분할 조회 - ProgressLoad\")");
            obj.set_cssclass("sta_WF_compTitle02");
            obj.set_fittocontents("width");
            this.addChild(obj.name, obj);

            obj = new Static("Static01","20","Static00:2",null,"120","20",null,null,null,null,null,this);
            obj.set_taborder("1");
            obj.set_cssclass("sta_WF_txt15px");
            obj.set_wordWrap("english");
            obj.set_fittocontents("height");
            obj.getSetter("messageid").set("grid.progressload.desc");
            obj.set_text("TEXT(\"grid.progressload.desc\")");
            this.addChild(obj.name, obj);
            // Layout Functions
            //-- Default Layout : this
            obj = new Layout("default","",920,300,this,function(p){});
            obj.set_mobileorientation("landscape");
            this.addLayout(obj.name, obj);
            
            // BindItem Information

            
            // TriggerItem Information

        };
        
        this.loadPreloadList = function()
        {

        };
        
        // User Script
        this.registerScript("progressload_desc.xfdl", function() {

        this.progressload_desc_onload = function(obj,e)
        {
        	this.gfnFormOnLoad();
        };

        });
        
        // Regist UI Components Event
        this.on_initEvent = function()
        {
            this.addEventHandler("onload",this.progressload_desc_onload,this);
        };
        this.loadIncludeScript("progressload_desc.xfdl");
        this.loadPreloadList();
        
        // Remove Reference
        obj = null;
    };
}
)();

(function()
{
    return function()
    {
        if (!this._is_form)
            return;
        
        var obj = null;
        
        this.on_create = function()
        {
            this.set_name("form");
            if (Form == this.constructor)
            {
                this._setFormPosition(920,140);
            }
            
            // Object(Dataset, ExcelExportObject) Initialize

            
            // UI Components Initialize
            obj = new Static("Static00_00","20","47",null,"70","20",null,null,null,null,null,this);
            obj.set_taborder("0");
            obj.set_text("TEXT(\"grid.copypaste.desc\")");
            obj.set_cssclass("sta_WF_txt15px");
            obj.set_wordWrap("english");
            obj.set_fittocontents("height");
            obj.getSetter("messageid").set("grid.copypaste.desc");
            obj.set_usedecorate("true");
            this.addChild(obj.name, obj);

            obj = new Static("Static04","20","15","340","30",null,null,null,null,null,null,this);
            obj.set_taborder("1");
            obj.set_text("TEXT(\"grid.copypaste.title\",\"그리드 데이터 복사 & 붙여넣기\")");
            obj.set_cssclass("sta_WF_compTitle02");
            obj.getSetter("messageid").set("grid.copypaste.title");
            obj.set_fittocontents("width");
            this.addChild(obj.name, obj);
            // Layout Functions
            //-- Default Layout : this
            obj = new Layout("default","",920,140,this,function(p){});
            this.addLayout(obj.name, obj);
            
            // BindItem Information

            
            // TriggerItem Information

        };
        
        this.loadPreloadList = function()
        {

        };
        
        // User Script
        this.registerScript("copypaste_desc.xfdl", function() {

        this.form_onload = function(obj,e)
        {
        	this.gfnFormOnLoad();
        };

        });
        
        // Regist UI Components Event
        this.on_initEvent = function()
        {
            this.addEventHandler("onload",this.form_onload,this);
        };
        this.loadIncludeScript("copypaste_desc.xfdl");
        this.loadPreloadList();
        
        // Remove Reference
        obj = null;
    };
}
)();

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
                this._setFormPosition(440,250);
            }
            
            // Object(Dataset, ExcelExportObject) Initialize

            
            // UI Components Initialize
            obj = new Static("Static00","20","19","150","30",null,null,null,null,null,null,this);
            obj.set_taborder("1");
            obj.set_text("TEXT(\"external.pdfviewer\",\"PDF Viewer\")");
            obj.set_cssclass("sta_WF_compTitle02");
            obj.getSetter("messageid").set("external.pdfviewer");
            obj.set_fittocontents("width");
            this.addChild(obj.name, obj);

            obj = new Static("Static01","20","Static00:2",null,"140","20",null,null,null,null,null,this);
            obj.set_taborder("0");
            obj.set_text("TEXT(\"external.pdfviewer.desc\",\"PDF.js or pdf.js is a JavaScript library that renders Portable Document Format (PDF) files using the web standards-compliance HTML5 Canvas.(URL: <l v=\'https://mozilla.github.io/pdf.js/\'>https://mozilla.github.io/pdf.js/</l>)\r\n\r\nThe WebBrowser component of the Nexacro Platform makes it easy to link.\")");
            obj.set_cssclass("sta_WF_txt15px");
            obj.set_wordWrap("english");
            obj.set_fittocontents("height");
            obj.getSetter("messageid").set("external.pdfviewer.desc");
            obj.set_usedecorate("true");
            this.addChild(obj.name, obj);
            // Layout Functions
            //-- Default Layout : this
            obj = new Layout("default","",440,250,this,function(p){});
            this.addLayout(obj.name, obj);
            
            // BindItem Information

            
            // TriggerItem Information

        };
        
        this.loadPreloadList = function()
        {

        };
        
        // User Script
        this.registerScript("pdfviewer_desc.xfdl", function() {

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
        this.loadIncludeScript("pdfviewer_desc.xfdl");
        this.loadPreloadList();
        
        // Remove Reference
        obj = null;
    };
}
)();

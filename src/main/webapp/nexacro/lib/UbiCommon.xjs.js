//XJS=UbiCommon.xjs
(function()
{
    return function(path)
    {
        var obj;
    
        // User Script
        this.registerScript(path, function() {
        /************************************************************************************
        * Argument 정보를 설정
        ************************************************************************************/
        this.gfn_setUbiArgument = function (ubiviewerObj, ubiArgument, ubiUseTrace) {
        	for (let i = 0; i < ubiArgument.length; i++) {
        		let data = ubiArgument[i];
        		ubiviewerObj.setArgument(data[0], data[1]);
        		if (ubiUseTrace) {
        			trace("Argument(" + (i + 1) + ") Info : [" + data[0] + "][" + data[1] + "]");
        		}
        	}
        };

        /************************************************************************************
        * Service URL을 사용한 리포트 데이타 설정
        ************************************************************************************/
        this.gfn_setUbiService = function (ubiviewerObj, ubiSvcUrl, ubiUseTrace) {
        	for (let i = 0; i < ubiSvcUrl.length; i++) {
        		let data = ubiSvcUrl[i];
        		if (data.length > 7) {
        			ubiviewerObj.addTransaction2(data[7], data[0], data[1], data[2], data[3], data[4], data[5], data[6]);
        			if (ubiUseTrace) {
        				trace("SVC URL(" + (i + 1) + ") Info : [" + data[0] + "][" + data[1] + "][" + data[2] + "][" + data[3] + "][" + data[4] + "][" + data[5] + "][" + data[6] + "][" + data[7] + "]");
        			}
        		}
        		else {
        			ubiviewerObj.addTransaction(data[6], data[0], data[1], data[2], data[3], data[4], data[5]);
        			if (ubiUseTrace) {
        				trace("SVC URL(" + (i + 1) + ") Info : [" + data[0] + "][" + data[1] + "][" + data[2] + "][" + data[3] + "][" + data[4] + "][" + data[5] + "][" + data[6] + "]");
        			}
        		}
        	}
        };

        /************************************************************************************
        * Local Dataset을 사용한 리포트 데이타 설정
        ************************************************************************************/
        this.gfn_setUbiDataset = function (ubiviewerObj, ubiLocalDs, ubiUseTrace) {
        	for (let i = 0; i < ubiLocalDs.length; i++) {
        		let data = ubiLocalDs[i];
        		ubiviewerObj.setDataset(data[0], data[1]);
        		if (ubiUseTrace) {
        			trace("Dataset(" + (i + 1) + ") Info : [" + data[0] + "][" + data[1].saveXML() + "]");
        		}
        	}
        };

        /************************************************************************************
        * 자동 리포트 데이타 설정
        ************************************************************************************/
        this.gfn_setUbiRuntime = function (ubiviewerObj, ubiGridObj, ubiUseTrace) {
        	if (ubiUseTrace) {
        		trace("Grid Info : [" + ubiGridObj.id + "]");
        	}

        	let formatRowCount = ubiGridObj.getFormatRowCount();
        	let formatColCount = ubiGridObj.getFormatColCount();

        	let widthArray = new Array;
        	let heightArray = new Array;

        	let headBgColor = "243.247.247";	// 헤더 배경색
        	let summBgColor = "238.250.253";	// 합계 배경색
        	let i = 0;
        	let j = 0;
        	let k = 0;

        	// Grid의 Row의 높이를 도출
        	let subidx = 0;
        	let bandtype = "";
        	let prebandtype = "";
        	let bodyStartRow = 0;
        	let summStartRow = 0;

        	for (i = 0; i < formatRowCount; i++) {

        		bandtype = ubiGridObj.getFormatRowProperty(i, "band");
        		if (bandtype == prebandtype) {
        			subidx++;
        		} else {
        			subidx = 0;
        		}

        		// Summary(summarytype=top)로 인해 높이 추출 방법 변경 : 19/03/06
        		//heightArray[i] = ubiGridObj.getRealRowSize(i, subidx, false);
        		if (bandtype == "head") {
        			heightArray[i] = ubiGridObj.getRealRowSize(-1, subidx, true);
        		} else if (bandtype == "summ") {
        			heightArray[i] = ubiGridObj.getRealRowSize(-2, subidx, true);
        		} else {
        			heightArray[i] = ubiGridObj.getRealRowSize(0, subidx, true);
        		}

        		prebandtype = bandtype;
        	}

        	// Grid의 Column 넓이 도출
        	for (i = 0; i < formatColCount; i++) {
        		widthArray[i] = ubiGridObj.getRealColSize(i);
        	}

        	let cellcount = 0;
        	let rowcount = 0;
        	// ------------------------------------------------------------
        	// 디자인정보를 담고있는 Dataset 생성
        	// ------------------------------------------------------------
        	let designDataset = ubiviewerObj.getDesignDataset(this);

        	prebandtype = "";
        	let bandRow = 0;
        	let nRow = 0;
        	let rowidx = 0;
        	let colidx = 0;
        	let colspan = 0;
        	let rowspan = 0;
        	let colwidth = 0;
        	let colheight = 0;
        	let startIdx = 0;
        	let endIdx = 0;
        	let bgcolor = "";

        	// 전체 높이와 넒이를 담은 Row 생성
        	nRow = designDataset.addRow();
        	designDataset.setColumn(nRow, "type", "widths");
        	designDataset.setColumn(nRow, "text", widthArray);
        	// summarytype 추가 : 19/03/06
        	designDataset.setColumn(nRow, "summarytype", ubiGridObj.summarytype);

        	nRow = designDataset.addRow();
        	designDataset.setColumn(nRow, "type", "heights");
        	designDataset.setColumn(nRow, "text", heightArray);

        	for (i = 0; i < formatRowCount; i++) {
        		bandtype = ubiGridObj.getFormatRowProperty(i, "band");
        		if (bandtype != prebandtype) {
        			if (bandtype == "head") {
        				bandRow = -1;
        				bgcolor = headBgColor;
        			} else if (bandtype == "body") {
        				bandRow = 0;
        				bgcolor = "";
        			} else if (bandtype == "summ") {
        				bandRow = -2;
        				bgcolor = summBgColor;
        			}

        			cellcount = ubiGridObj.getCellCount(bandtype);
        			let headrowMax = 0;
        			headrowMax = ubiGridObj.getCellProperty(bandtype, (cellcount - 1), "row");

        			if (bandtype == "body" && cellcount > 15) {
        				ubiviewerObj.jrffile = "horizontal_a3.jrf";
        				//trace("cellcount > " + cellcount);
        			}
        			if (bandtype == "body" && cellcount < 11) {
        				ubiviewerObj.jrffile = "vertical.jrf";
        				//trace("cellcount > " + cellcount);
        			}

        			for (j = 0; j < cellcount; j++) {
        				rowidx = ubiGridObj.getCellProperty(bandtype, j, "row");
        				colidx = ubiGridObj.getCellProperty(bandtype, j, "col");
        				rowspan = ubiGridObj.getCellProperty(bandtype, j, "rowspan");
        				colspan = ubiGridObj.getCellProperty(bandtype, j, "colspan");

        				nRow = designDataset.addRow();
        				designDataset.setColumn(nRow, "type", bandtype);
        				designDataset.setColumn(nRow, "row", rowidx);
        				designDataset.setColumn(nRow, "col", colidx);
        				designDataset.setColumn(nRow, "rowspan", rowspan);
        				designDataset.setColumn(nRow, "colspan", colspan);
        				designDataset.setColumn(nRow, "align", ubiGridObj.getCellProperty(bandtype, j, "textAlign"));
        				//trace("align > " + ubiGridObj.getCellProperty(bandtype, j, "textAlign"));

        				if (bandtype == "head") {
        					designDataset.setColumn(nRow, "fontexpr", "'나눔고딕,2,10'");
        					designDataset.setColumn(nRow, "foregroundexpr", "'3,44,108'");

        					designDataset.setColumn(nRow, "leftbordercolorexpr", "'224,225,225'");
        					designDataset.setColumn(nRow, "rightbordercolorexpr", "'224,225,225'");

        					if (rowidx > 0) {
        						designDataset.setColumn(nRow, "topbordercolorexpr", "'224,225,225'");
        					} else {
        						designDataset.setColumn(nRow, "topbordercolorexpr", "'17,51,103'");
        					}
        					designDataset.setColumn(nRow, "bottombordercolorexpr", "'17,51,103'");
        				} else if (bandtype == "summ") {
        					designDataset.setColumn(nRow, "fontexpr", "'나눔고딕,2,10'");
        					designDataset.setColumn(nRow, "foregroundexpr", "'17,51,103'");

        					designDataset.setColumn(nRow, "leftbordercolorexpr", "'238,250,253'");
        					designDataset.setColumn(nRow, "rightbordercolorexpr", "'238,250,253'");
        					designDataset.setColumn(nRow, "topbordercolorexpr", "'161,217,233'");
        					designDataset.setColumn(nRow, "bottombordercolorexpr", "'161,217,233'");
        				} else {
        					designDataset.setColumn(nRow, "leftbordercolorexpr", "'245,245,245'");
        					designDataset.setColumn(nRow, "rightbordercolorexpr", "'245,245,245'");
        					designDataset.setColumn(nRow, "topbordercolorexpr", "'245,245,245'");
        					designDataset.setColumn(nRow, "bottombordercolorexpr", "'245,245,245'");
        				}

        				if (bandRow != 0) {
        					designDataset.setColumn(nRow, "text", ubiGridObj.getCellText(bandRow, j));
        				}
        				if (headrowMax > 1 && rowidx == 0 && rowspan < 2) {
        					designDataset.setColumn(nRow, "bgcolor", "230.237.245");
        				} else {
        					designDataset.setColumn(nRow, "bgcolor", bgcolor);
        				}
        				designDataset.setColumn(nRow, "leftmargin", "3");
        				designDataset.setColumn(nRow, "rightmargin", "3");

        				// suppress 속성 추가 : 19/03/06
        				if (bandtype == "body") {
        					if (ubiGridObj.getCellProperty(bandtype, j, "suppress") == 1) {
        						designDataset.setColumn(nRow, "                                                                                                                                                                                                                                                                                                                                             ", "true");
        					}
        				}
        			}
        		}
        		prebandtype = bandtype;
        	}
        	this.addChild(designDataset.name, designDataset);

        	// ------------------------------------------------------------
        	// 그리드의 텍스트를 Dataset으로 생성
        	// ------------------------------------------------------------
        	cellcount = ubiGridObj.getCellCount("Body");
        	rowcount = ubiGridObj.rowcount;

        	let gridDataset = new Dataset("dsGrid", this);
        	this.addChild(gridDataset.name, gridDataset);

        	// column 생성
        	for (i = 0; i < cellcount; i++) {
        		gridDataset.addColumn("column" + i, "string");
        	}

        	// 그리드 데이터 입력
        	for (j = 0; j < rowcount; j++) {
        		gridDataset.addRow();
        		for (k = 0; k < cellcount; k++) {
        			gridDataset.setColumn(j, k, ubiGridObj.getCellText(j, k));
        		}
        	}
        	// ------------------------------------------------------------

        	// dataset SSV 전송에 필요한 정보 생성
        	ubiviewerObj.setRuntimeData(designDataset, gridDataset);

        	if (ubiUseTrace) {
        		trace("DesignDataset Info : [" + designDataset.saveXML() + "]");
        		trace("GridDataset Info : [" + gridDataset.saveXML() + "]");
        	}

        	// 동적으로 생성된 Dataset 제거
        	let objDelete;
        	objDelete = this.removeChild(designDataset.name);
        	if (objDelete)	objDelete.destroy();
        	objDelete = this.removeChild(gridDataset.name);
        	if (objDelete)	objDelete.destroy();
        };

        /************************************************************************************
        * 조회된 전체 페이수에 따라 전용뷰어 인쇄 아이콘을 활성화하고 PDF, HTML 인쇄는 비활성화 처리
        ************************************************************************************/
        this.gfn_setActivePluginViewer = function (ubiviewerObj, page) {
        	try {
        		if (page <= ubiviewerObj.getTotalPage()) {
        			ubiviewerObj.setEnableToolbar("PRINT_UBI", true);
        			ubiviewerObj.setEnableToolbar("PRINT_PDF", false);
        			ubiviewerObj.setEnableToolbar("PRINT_HTML", false);
        			ubiviewerObj.setPluginProgress("true");
        		} else {
        			ubiviewerObj.setEnableToolbar("PRINT_PDF", true);
        			ubiviewerObj.setEnableToolbar("PRINT_HTML", true);
        			ubiviewerObj.setEnableToolbar("PRINT_UBI", false);
        			ubiviewerObj.setPluginProgress("false");
        		}
        	}
        	catch (e) { }
        };

        /************************************************************************************
        * 랜덤 Key 생성 함수(유틸)
        ************************************************************************************/
        this.gfn_getRandomKey = function () {
        	let key = "";
        	let nowdate = new Date();
        	let year = nowdate.getFullYear();
        	let month = nowdate.getMonth() + 1;
        	let day = nowdate.getDate();
        	let hour = nowdate.getHours();
        	let min = nowdate.getMinutes();
        	let sec = nowdate.getSeconds();
        	let milsec = nowdate.getMilliseconds();

        	if (("" + month).length == 1) { month = "0" + month; }
        	if (("" + day).length == 1) { day = "0" + day; }
        	if (("" + hour).length == 1) { hour = "0" + hour; }
        	if (("" + min).length == 1) { min = "0" + min; }
        	if (("" + sec).length == 1) { sec = "0" + sec; }

        	key = ('' + year + month + day + hour + min + sec + milsec) + '_' + ((Math.random() * (1 << 30)).toString(16).replace('.', ''));

        	return key;
        };
        });
    
        this.loadIncludeScript(path);
        
        obj = null;
    };
}
)();

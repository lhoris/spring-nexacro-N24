//XJS=IntersectionObserver.xjs
(function()
{
    return function(path)
    {
        var obj;
    
        // User Script
        this.registerScript(path, function() {
        /**
        * @description	: lazyloading 초기화
        * @param obj	: 컴포넌트
        * @param objDs	: 컴포넌트에 바인딩할 데이터셋
        * @return		: 없음
        */
        let arrLazyLoadCompList = [];	// lazyloading 을 적용할 컴포넌트를 담는 배열
        this.gfnInitLazyLoad = function (obj, objDs)
        {
        	this.gfnGetLazyLoadObject(obj);

        	// lazyloading 적용
        	let options = { threshold : 0.8 };
        	let pThis = this;
        	let cnt = 0;

        	const io = new IntersectionObserver( function (entries, observer) {
        			entries.forEach(function (entry) {
        					if (entry.isIntersecting) {
        						var tagetObj = arrLazyLoadCompList[cnt];

        						observer.unobserve(entry.target);
        						observeLastItem(observer, tagetObj);
        						cnt++;
        					}
        				});
        		},options);

        	let objNum = arrLazyLoadCompList.length;
        	let nFindDataRow = 0;	// 순서대로 데이터셋의 데이터를 가져오기 위해서
        	let oComp;	// 동적 컴포넌트
        	let sCompId;	// 동적 컴포넌트 id

        	const observeLastItem = function (io, item)
        	{
        		if (nFindDataRow > objDs.rowcount-1) {
        			nFindDataRow = 0;
        		}

        		// Object 정보
        		let objId = item;
          		let objParent = item.parent;
        		let sTargetColumnId = objDs.getColumnInfo(0).id;
        		let sData = objDs.getColumn(nFindDataRow, sTargetColumnId);

         		// Div 컴포넌트일때 position 속성을 제외한 속성 설정
        		if (item instanceof Div) {
        			item.url = sData;

        			// 동적으로 컴포넌트 생성
        			sCompId = "Div_LazyLoad"+cnt;
        			oComp = new Div();
        			initCompPosition(oComp, sCompId); // 컴포넌트 position 속성 설정

        		// ImageViewer 컴포넌트일때 position 속성을 제외한 속성 설정
        		} else if (item instanceof ImageViewer) {
        			item.image = sData;

        			// 동적으로 컴포넌트 생성 및 속성 설정
        			sCompId = "ImageViewer_LazyLoad"+cnt;
        			oComp = new ImageViewer();
        			oComp.enable = item.enable;
        			oComp.text = item.text;
        			oComp.tooltiptext = item.tooltiptext;
        			oComp.tooltiptype = item.tooltiptype;
        			oComp.visible = item.visible;
        			oComp.imagealign = item.imagealign;
        			oComp.stretch = item.stretch;
        			initCompPosition(oComp, sCompId); // 컴포넌트 position 속성 설정
        		}

        		// 컴포넌트 position 속성 초기화
        		function initCompPosition(comp, compId){
        			let oComp = comp;
        			let sCompId = compId;

        //			var nCompLeft = objId.getOffsetLeft();
        			let nCompLeft = objId.left;
        			let nCompTop = (objId.id) + ":20";
        // 			var nCompWidth = objId.getOffsetWidth();
        // 			var nCompHeight = objId.getOffsetHeight();
        			let nCompWidth = objId.width;
        			let nCompHeight = objId.height;
        			let nCompRight = objId.right;
        			let nCompBottom = objId.bottom;

        			oComp.init(sCompId, nCompLeft, nCompTop, nCompWidth, nCompHeight, nCompRight, nCompBottom);
        			objParent.addChild(oComp.id, oComp);
        			oComp.show();
        			objParent.resetScroll();
        			pThis.resetScroll();

        			arrLazyLoadCompList.push(oComp);
        			io.observe(document.getElementById(nexacroDomId(oComp)));
        		}

        		nFindDataRow++;
        	};

        	function nexacroDomId(objID)
        	{
        		let generateID = "";
        		let prtID = objID;
        		let i = 0;
        		let objApp = nexacro.getApplication();
        		let mainFrm = objApp.mainframe;

        		while(prtID != mainFrm){
        			if(prtID.toString() == "[object Form]") generateID = "form." + generateID;
        			else generateID = prtID.name + ((generateID != "")?".":"") + generateID;
        			i++;
        			prtID = prtID.parent;
        		}
        		return "mainframe." + generateID;
        	};

        	arrLazyLoadCompList.forEach((element, idx) => {
        			io.observe(document.getElementById(nexacroDomId(element)));
        		});
        }
        /**
        * @description	: lazyloading 적용대상 구하기
        * @param obj	: 컴포넌트
        * @return		: 없음
        */
        this.gfnGetLazyLoadObject = function (obj)
        {
        	for (let i=0;i<obj.components.length;i++) {

        		let strLazyload = obj.components[i].lazyload;
        		let bLazyload;

        		if (strLazyload) {
        			bLazyload = JSON.parse(obj.components[i].lazyload);
        		} else {
        			bLazyload = false;
        		}

        		try {
        			if (bLazyload) {
        				arrLazyLoadCompList.push(obj.components[i]);
        			}
        		} catch(e) {
        		}

        		if (obj.components[i].form) {
        			this.gfnGetLazyLoadObject(obj.components[i].form);
        		}
        	}
        };
        });
    
        this.loadIncludeScript(path);
        
        obj = null;
    };
}
)();

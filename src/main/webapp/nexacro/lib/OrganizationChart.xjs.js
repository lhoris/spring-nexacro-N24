//XJS=OrganizationChart.xjs
(function()
{
    return function(path)
    {
        var obj;
    
        // User Script
        this.registerScript(path, function() {
        /**
        * @description 	      : 조직도 초기화 설정 함수
        * @param objGraphics  : 조직도를 설정할 Graphics Component
        * @param objConfig    : 초기화 설정 값
        * @return             : 없음
        */
        this.gfninitOrganization = function (objGraphics, objConfig) {
            //노드리스트 데이터셋 생성
            let dsNodes = new Dataset;
            dsNodes.addColumn("id", "string");
            dsNodes.addColumn("up_id", "string");
            dsNodes.addColumn("level", "string");
            dsNodes.addColumn("left", "int");
            dsNodes.addColumn("top", "int");
            dsNodes.addColumn("width", "int");
            dsNodes.addColumn("height", "int");
            dsNodes.addColumn("childcount", "int");

            //설정정보에 노드리스트 정보 추가
            objConfig.nodesDs = dsNodes;

            //Graphics 컴포넌트에 config 정보 추가
            objGraphics.config = objConfig;
        };

        /**
        * @description 	      : 조직도 그리기 함수
        * @param objGraphics  : 조직도를 설정할 Graphics Component
        * @return             : 없음
        */
        this.gfnDrawOrganization = function (objGraphics) {
            let i, nFRow, nRowCount, nChildCount, nLevel,
        		nLeft, nTop, nWidth, nHeight,
        		sId, sUp_Id, objProperties, objBoard, objPath;

            //설정정보 가져오기
            let objConfig = objGraphics.config;

            //노드리스트 데이터셋 가져오기
            let dsNodes = objConfig.nodesDs;

            //그리기 시작 위치 좌표값 초기화
            objConfig.point.x = 0;
            objConfig.point.y = 0;

            //노드리스트 데이터셋 초기화
            dsNodes.clearData();

            //Graphics 오브젝트 초기화
            objGraphics.clear();

            //원본데이터셋을 기준으로 노드데이터셋 생성함수 호출
            this.gfnMakeNodesData(objGraphics, "0");

            //그룹 만들기
            objProperties = { "x": 0, "y": 0 };

            //GraphicsGroup 생성함수 호출
            objBoard = this.gfnSetOrgChartGraphicProperties("GraphicsGroup", objProperties);
            objGraphics.addChild("board", objBoard);

            //노드갯수 가져오기
            nRowCount = dsNodes.rowcount;

            //노드데이터를 읽어 Graphics 오브젝트로 표현
            for (i = 0; i < nRowCount; i++) {
                //노드 데이터 가져오기
                sId = dsNodes.getColumn(i, "id");
                sUp_Id = dsNodes.getColumn(i, "up_id");
                nLevel = dsNodes.getColumn(i, "level");
                nLeft = nexacro.toNumber(dsNodes.getColumn(i, "left"));
                nTop = nexacro.toNumber(dsNodes.getColumn(i, "top"));
                nWidth = nexacro.toNumber(dsNodes.getColumn(i, "width"));
                nHeight = nexacro.toNumber(dsNodes.getColumn(i, "height"));
                nChildCount = nexacro.toNumber(dsNodes.getColumn(i, "childcount"));

                //노드 그리기 함수 호출
                objPath = this.gfnDrawNode(objGraphics, sId, nLeft, nTop, nWidth, nHeight);
                objBoard.addChild("node_" + sId, objPath);

                //자식노드가 있을 경우
                if (nChildCount != 0) {
                    //하단라인 생성 함수 호출
                    objPath = this.gfnDrawBottomLine(objGraphics, nLeft, nTop, nWidth, nHeight);
                    objBoard.addChild("bottomLine_" + sId, objPath);

                    //중간라인 생성 함수 호출
                    objPath = this.gfnDrawMiddleLine(objGraphics, sId, nLeft, nTop, nWidth, nHeight);
                    objBoard.addChild("middleLine_" + sId, objPath);
                }

                //root노드가 아닐경우 상단라인 생성함수 호출
                if (nLevel != 0) {
                    objPath = this.gfnDrawTopLine(objGraphics, nLeft, nTop, nWidth, nHeight);
                    objBoard.addChild("topLine_" + sId, objPath);
                }
            }

            //Graphics 컴포넌트 다시그리기
            objGraphics.redraw();
        };

        /**
        * @description 	      	: 원본데이터셋을 기준으로 노드데이터셋 생성함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param pvORG_NUM  	: 현재 노드 ID
        * @return             	: 현재 노드 정보(시작X좌표, 종료X좌표, 자식갯수)
        */
        this.gfnMakeNodesData = function (objGraphics, pvORG_NUM) {
            let i, nRow;
        	let nFindIdx = 0;
        	let nCount;
        	let nChildCount = 0;
        	let sORG_NUM, sLEVEL, sCOLLAPSE;
        	let objParam = {};
        	let objChildParam;

            //설정정보 가져오기
            let objConfig = objGraphics.config;

            //원본데이터셋 가져오기
            let dsTarget = objConfig.targetDs;

            //현재 노드를 그릴 위치 값
            let nPointX = objConfig.point.x;
            let nPointY = objConfig.point.y;

            //노드간 여백 정보 가져오기
            let nMarginX = objConfig.margin.x;
            let nMarginY = objConfig.margin.y;

            //현재 노드의 RowIndex 찾기
            nRow = dsTarget.findRow("ORG_NUM", pvORG_NUM);

            //Collapse 여부
            sCOLLAPSE = dsTarget.getColumn(nRow, "COLLAPSE");

            //callapse 일 경우 하위 노드 생성 안함
            if (sCOLLAPSE == 1) {
                nCount = 0;
            } else {
                //하위노드의 갯수
                nCount = dsTarget.getCaseCount("UPER_ORG_NUM=='" + pvORG_NUM + "'");
            }

            for (i = 0; i < nCount; i++) {
                //현재 노드를 그릴 위치 값
                nPointX = objConfig.point.x;
                nPointY = objConfig.point.y;

                //첫번째 노드일 경우 시작 X좌표 설정
                //상위노드에서 Center를 찾기 위함
                if (i == 0) {
                    objParam.startX = nPointX;
                    objParam.startY = nPointY;
                }

                //현재 노드의 자식노드 RowIndex 찾기
                nRow = dsTarget.findRow("UPER_ORG_NUM", pvORG_NUM, nFindIdx);

                //다음 For loop시 현재 찾은 Rowindex 다음부터 찾기 위함
                nFindIdx = nRow + 1;

                //자식노드의 ID값 가져오기
                sORG_NUM = dsTarget.getColumn(nRow, "ORG_NUM");

                //재귀함수 호출
                objChildParam = this.gfnMakeNodesData(objGraphics, sORG_NUM);

                //자식노드의 하위노드 갯수 확인
                nChildCount = objChildParam.childcount;

                //자식노드의 level값 가져오기
                sLEVEL = dsTarget.getColumn(nRow, "LEVEL");

                //자식노드의 하위노드가 없을 경우
                if (nChildCount == 0) {
                    //세로정렬 방향일 경우
                    if (objConfig.direction == "vertical") {
                        //이전 노드의 bottom 값
                        nTop = nPointY;

                        //(노드hidth + topMargin + bottomMargin) * level
                        nLeft = (objConfig.nodeWidth + (nMarginX * 2)) * sLEVEL;
                    }
                    //가로정렬 방향일 경우
                    else {
                        //(노드height + topMargin + bottomMargin) * level
                        nTop = (objConfig.nodeHeight + (nMarginY * 2)) * sLEVEL;

                        //이전 노드의 right값
                        nLeft = nPointX;
                    }

                    //노드width + leftMargin + rightMargin
                    nWidth = objConfig.nodeWidth + (nMarginX * 2);

                    //노드height + topMargin + bottomMargin
                    nHeight = (objConfig.nodeHeight + (nMarginY * 2));

                    //노드데이터 생성 함수 호출
                    //return : 생성된 노드의 right, bottom 값(Object형)
                    objConfig.point = this.gfnAddNode(objGraphics, sORG_NUM, pvORG_NUM, sLEVEL, nChildCount, nLeft, nTop, nWidth, nHeight);
                } else {
                    //세로정렬 방향일 경우
                    if (objConfig.direction == "vertical") {
                        //첫번째 하위노드의 Top 값
                        nTop = objChildParam.startY;

                        //(노드width + leftMargin + rightMargin) * level
                        nLeft = (objConfig.nodeWidth + (nMarginX * 2)) * sLEVEL;

                        //노드width + leftMargin + rightMargin
                        nWidth = (objConfig.nodeWidth + (nMarginX * 2));

                        //마지막 하위노드의 bottom - 첫번째 하위노드의 Top값
                        nHeight = objChildParam.endY - objChildParam.startY;
                    }
                    //가로정렬 방향일 경우
                    else {
                        //(노드height + topMargin + bottomMargin) * level
                        nTop = (objConfig.nodeHeight + (nMarginY * 2)) * sLEVEL;

                        //첫번째 하위노드의 Left 값
                        nLeft = objChildParam.startX;

                        //마지막 하위노드의 right - 첫번째 하위노드의 Left값
                        nWidth = objChildParam.endX - objChildParam.startX;

                        //노드height + topMargin + bottomMargin
                        nHeight = (objConfig.nodeHeight + (nMarginY * 2));
                    }

                    //노드데이터 생성 함수 호출
                    //return : 생성된 노드의 right, bottom 값 array
                    this.gfnAddNode(objGraphics, sORG_NUM, pvORG_NUM, sLEVEL, nChildCount, nLeft, nTop, nWidth, nHeight);
                }

                //마지막 노드일 경우 종료 x 좌표값
                //상위노드에서 Center를 찾기 위함
                if (i == nCount - 1) {
                    objParam.endX = objConfig.point.x;
                    objParam.endY = objConfig.point.y;
                }
            }

            //자식노드의 갯수 설정
            objParam.childcount = nCount;

            //리턴값 설정
            //return - objParam.startX     : 시작 X좌표
            //       - objParam.endX       : 종료 X좌표
            //       - objParam.childcount : 자식노드 갯수
            return objParam;
        };

        /**
        * @description 	      		: 노드데이터 추가 함수
        * @param objGraphics  		: 조직도를 설정할 Graphics Component
        * @param pvORG_NUM  		: 노드 ID
        * @param pvUPER_ORG_NUM  	: 부모 노드 ID
        * @param pvLEVEL  			: 노드 Level
        * @param pvChildCount  		: 자식갯수
        * @param pvLeft  			: 노드를 그릴 영역의 Left 값
        * @param pvTop  			: 노드를 그릴 영역의 Top 값
        * @param pvWidth  			: 노드를 그릴 영역의 Width 값
        * @param pvHeight  			: 노드를 그릴 영역의 Height 값
        * @return             		: 현재 노드 정보(종료X좌표, 종료Y좌표)
        */
        this.gfnAddNode = function (objGraphics, pvORG_NUM, pvUPER_ORG_NUM, pvLEVEL, pvChildCount, pvLeft, pvTop, pvWidth, pvHeight) {
            let nRow;
        	let arrPos = new Array();
        	let objConfig = objGraphics.config;
        	let dsNodes = objConfig.nodesDs;

            //현재 노드의 Rigth/Bottom 값 만들기
            let nX = nexacro.toNumber(pvLeft) + nexacro.toNumber(pvWidth);
        	let nY = nexacro.toNumber(pvTop) + nexacro.toNumber(pvHeight);
        	let objPoint = { "x": nX, "y": nY };

            //노드데이터 생성
            nRow = dsNodes.addRow();
            dsNodes.setColumn(nRow, "id", pvORG_NUM);
            dsNodes.setColumn(nRow, "up_id", pvUPER_ORG_NUM);
            dsNodes.setColumn(nRow, "level", pvLEVEL);
            dsNodes.setColumn(nRow, "childcount", pvChildCount);
            dsNodes.setColumn(nRow, "left", pvLeft);
            dsNodes.setColumn(nRow, "top", pvTop);
            dsNodes.setColumn(nRow, "width", pvWidth);
            dsNodes.setColumn(nRow, "height", pvHeight);

            //현재 노드의 Rigth/Bottom 값 반환
            //다음 노드를 만드는 기준값을 반환하기 위함
            return objPoint;
        };

        /**
        * @description 	      	: 노드 그리기 함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param pvId  			: 노드 ID
        * @param pvLeft  		: 노드를 그릴 영역의 Left 값
        * @param pvTop  		: 노드를 그릴 영역의 Top 값
        * @param pvWidth  		: 노드를 그릴 영역의 Width 값
        * @param pvHeight  		: 노드를 그릴 영역의 Height 값
        * @return             	: 노드 오브젝트
        */
        this.gfnDrawNode = function (objGraphics, pvId, pvLeft, pvTop, pvWidth, pvHeight) {
            let nRow, nFRow,
        		nLeft, nTop, nWidth, nHeight,
        		objNode, objPath;

            //설정정보 가져오기
            let objConfig = objGraphics.config;

            //노드리스트 데이터셋 가져오기
            let dsNodes = objConfig.nodesDs;

            //원본데이터섯 가져오기
            let dsTarget = objConfig.targetDs;

            //노드간 여백 정보 가져오기
            let nMarginX = objConfig.margin.x;
            let nMarginY = objConfig.margin.y;

            //노드크기 정보 가져오기
            let nNodeLeft;
            let nNodeTop;
            let nNodeWidth = objConfig.nodeWidth;
            let nNodeHeight = objConfig.nodeHeight;

            //접기/펼치기 이미지 정보
            let sImgExpand = "URL('imagerc::btn_pvGrd_TreeExpand.png')";
            let sImgCollapse = "URL('imagerc::btn_pvGrd_TreeCollapse.png')";

            //현재 노드의 원본 데이터  RowIndex 찾기
            nFRow = dsTarget.findRow("ORG_NUM", pvId);

            //조직도 데이터 가져오기
            let sORG_NM = dsTarget.getColumn(nFRow, "ORG_NM");
            let sEMP_NM = dsTarget.getColumn(nFRow, "EMP_NM");
            let sJOB_NM = dsTarget.getColumn(nFRow, "JOB_NM");
            let sCOLLAPSE = dsTarget.getColumn(nFRow, "COLLAPSE");
            let sIMG_URL = dsTarget.getColumn(nFRow, "IMG_URL");

            //현재 노드의 노드 데이터 RowIndex 찾기
            nFRow = dsNodes.findRow("id", pvId);

            //현재 노드의 자식 갯수 가져오기
            let sChildCount = dsNodes.getColumn(nFRow, "childcount");

            //노드 위치 및 사이즈 설정
            if (objConfig.direction == "vertical") {
                nNodeLeft = pvLeft + nMarginX;
                nNodeTop = pvTop + (pvHeight / 2) - (nNodeHeight / 2);
            } else {
                nNodeLeft = nexacro.toNumber(pvLeft) + (pvWidth / 2) - (nNodeWidth / 2);
                nNodeTop = nexacro.toNumber(pvTop) + nexacro.toNumber(nMarginY);
            }

            //노드 그룹 오브젝트 만들기
            objProperties = {
                "x": nNodeLeft, "y": nNodeTop
            };
            objNode = this.gfnSetOrgChartGraphicProperties("GraphicsGroup", objProperties);

            //노드 배경 오브젝트 만들기
            objProperties = {
                "x": 0, "y": 0,
                "width": nNodeWidth, "height": nNodeHeight,
                "fillstyle": "#8547FE",
                "strokepen": "1px solid #8547FE"
            };
            objPath = this.gfnSetOrgChartGraphicProperties("GraphicsRect", objProperties);
            objNode.addChild("bg", objPath);

            //노드 타이틀 오브젝트 만들기
            objProperties = {
                "x": nNodeWidth / 2, "y": 5, "width": nNodeWidth,
                "font": 'bold 10px/normal "Arial","Malgun Gothic","Gulim',
                "color": "#ffffff",
                "textAlign": "center",
                "verticalAlign": "top",
                "text": sORG_NM + "\n\n" + sEMP_NM
            };
            objPath = this.gfnSetOrgChartGraphicProperties("GraphicsText", objProperties);
            objNode.addChild("title", objPath);

            //자식노드가 있거나 COLLAPSE 일 경우
            if (sChildCount != 0 || sCOLLAPSE == 1) {
                //접기/펼치기 이미지 사이즈
                nWidth = 9;
                nHeight = 9;

                //중앙-하단에 버튼 위치 설정
                nLeft = nNodeWidth / 2 - nWidth / 2;
                nTop = nNodeHeight - nHeight;

                //접기/펼치기 버튼 오브젝트 만들기
                objConfig = {
                    "x": nLeft, "y": nTop,
                    "width": nWidth, "height": nHeight,
                    "image": null
                };

                //접기/펼치기 상태에 맞는 이미지 설정
                if (sCOLLAPSE == 1) objConfig.image = sImgExpand;
                else objConfig.image = sImgCollapse;

                objPath = this.gfnSetOrgChartGraphicProperties("GraphicsImage", objConfig);
                objNode.addChild("btnExpand", objPath);
            }

            //노드 오브젝트 반환
            return objNode;
        };

        /**
        * @description 	      	: 하단라인 생성 함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param pvLeft			: 노드를 그릴 영역의 Left 값
        * @param pvTop 			: 노드를 그릴 영역의 Top 값
        * @param pvWidth		: 노드를 그릴 영역의 Width 값
        * @param pvHeight		: 노드를 그릴 영역의 Height 값
        * @return             	: 생성된 오브젝트
        */
        this.gfnDrawBottomLine = function (objGraphics, pvLeft, pvTop, pvWidth, pvHeight) {
            let nX1, nX2, nY1, nY2, objPath;
        	let objConfig = objGraphics.config;

            if (objConfig.direction == "vertical") {
                nX1 = pvLeft + pvWidth;
                nX2 = nX1 - objConfig.margin.x;
                nY1 = pvTop + (pvHeight / 2);
                nY2 = pvTop + (pvHeight / 2);
            } else {
                nX1 = pvLeft + (pvWidth / 2);
                nX2 = pvLeft + (pvWidth / 2);
                nY1 = pvTop + pvHeight;
                nY2 = nY1 - objConfig.margin.y;
            }

            //하단 라인 오브젝트 만들기
            let objProperties = {
                "x1": nX1, "y1": nY1,
                "x2": nX2, "y2": nY2,
                "strokepen": "1px solid #8547FE"
            };
            objPath = this.gfnSetOrgChartGraphicProperties("GraphicsLine", objProperties);

            return objPath;
        };

        /**
        * @description 	      	: 중간라인 생성 함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param pvLeft			: 노드를 그릴 영역의 Left 값
        * @param pvTop 			: 노드를 그릴 영역의 Top 값
        * @param pvWidth		: 노드를 그릴 영역의 Width 값
        * @param pvHeight		: 노드를 그릴 영역의 Height 값
        * @return             	: 생성된 오브젝트
        */
        this.gfnDrawMiddleLine = function (objGraphics, pvId, pvLeft, pvTop, pvWidth, pvHeight) {
            let nFRow;
        	let objConfig = objGraphics.config;
        	let dsNodes = objConfig.nodesDs;
        	let nX1, nX2, nY1, nY2;

            //자식노드리스트 확인을 위해 필터
            dsNodes.filter("up_id=='" + pvId + "'");

            //마지막 자식노드의 RowIndex 찾기
            nFRow = dsNodes.rowcount - 1;

            //Middle라인 좌표 구하기
            if (objConfig.direction == "vertical") {
                nX2 = nX1 = pvLeft + pvWidth;

                nY1 = dsNodes.getColumn(0, "top") + (dsNodes.getColumn(0, "height") / 2);
                nY2 = dsNodes.getColumn(nFRow, "top") + dsNodes.getColumn(nFRow, "height");
                nY2 = nY2 - (dsNodes.getColumn(nFRow, "height") / 2);
            } else {
                //시작 X좌표 : 첫번째 자식 노드의 left + Width/2
                //(첫번째 자식노드의 center 좌표값에서 라인을 그리기 위함)
                nX1 = dsNodes.getColumn(0, "left") + (dsNodes.getColumn(0, "width") / 2);

                //종료 X좌표 : 마지막자식노드의 left + width - width/2
                //(마지막 자식노드의 center 좌표값까지 라인을 그리기 위함)
                nX2 = dsNodes.getColumn(nFRow, "left") + dsNodes.getColumn(nFRow, "width");
                nX2 = nX2 - (dsNodes.getColumn(nFRow, "width") / 2);

                //현재노드의 bottom값으로 Y좌표 설정
                nY1 = pvTop + pvHeight;
                nY2 = nY1;
            }

            //필터 해제
            dsNodes.filter("");

            //중단 라인 오브젝트 만들기
            let objProperties = {
                "x1": nX1, "y1": nY1,
                "x2": nX2, "y2": nY2,
                "strokepen": "1px solid #8547FE"
            };
            let objPath = this.gfnSetOrgChartGraphicProperties("GraphicsLine", objProperties);

            return objPath;
        };

        /**
        * @description 	      	: 상단라인 생성 함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param pvLeft			: 노드를 그릴 영역의 Left 값
        * @param pvTop 			: 노드를 그릴 영역의 Top 값
        * @param pvWidth		: 노드를 그릴 영역의 Width 값
        * @param pvHeight		: 노드를 그릴 영역의 Height 값
        * @return             	: 생성된 오브젝트
        */
        this.gfnDrawTopLine = function (objGraphics, pvLeft, pvTop, pvWidth, pvHeight) {
            let nX1, nX2, nY1, nY2, objPath;
        	let objConfig = objGraphics.config;

            if (objConfig.direction == "vertical") {
                nX1 = pvLeft;
                nX2 = nX1 + objConfig.margin.x;
                nY1 = pvTop + (pvHeight / 2);
                nY2 = pvTop + (pvHeight / 2);
            } else {
                nX1 = pvLeft + (pvWidth / 2);
                nX2 = pvLeft + (pvWidth / 2);
                nY1 = pvTop;
                nY2 = nY1 + objConfig.margin.y;
            }

            //상단 라인 오브젝트 만들기
            let objProperties = {
                "x1": nX1, "y1": nY1,
                "x2": nX2, "y2": nY2,
                "strokepen": "1px solid #8547FE"
            };
            objPath = this.gfnSetOrgChartGraphicProperties("GraphicsLine", objProperties);

            return objPath;
        };

        /**
        * @description 	      	: Graphics 하위 오브젝트 생성 및 속성 설정 함수
        * @param sCompId  		: 오브젝트 타입명
        * @param objProps  		: 설정할 속성정보
        * @return             	: 생성된 오브젝트
        */
        this.gfnSetOrgChartGraphicProperties = function (sCompId, objProps) {
            //Graphics 하위 오브젝트 생성
            let objComp = new nexacro[sCompId];
        	let objFunc, sProp;

            //설정정보를 오브젝트의 속성으로 설정
            for (sProp in objProps) {
                //속성 설정함수 가져오기
                objFunc = objComp["set_" + sProp];

                //속성 설정함수 실행
                objFunc.call(objComp, objProps[sProp]);
            }

            //생성된 Graphics 하위 오브젝트 리턴
            return objComp;
        };

        /**
        * @description 	      	: 줌처리 함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param nZoom			: 줌 배율 설정값(줌인 1.1, 줌아웃 0.9)
        * @param nX 			: 줌 처리할 중심 X 좌표
        * @param nY				: 줌 처리할 중심 Y 좌표
        * @return             	: 없음
        */
        this.gfnZoomOrganization = function (objGraphics, nZoom, nX, nY) {
            //설정정보 가져오기
            let objConfig = objGraphics.config;

            //조직도 그룹 오브젝트 가져오기
            let objPath = objGraphics.getObjectByID("board");

            //조직도 그룹의 위치값 가져오기
            let objRect = objPath.getBoundRect();

            //중심 좌표값이 없을 경우 조직도 그룹의 중심 좌표로 설정
            if (!nX) nX = objRect.left + (objRect.width / 2);
            if (!nY) nY = objRect.top + (objRect.height / 2);

            //Zoom In시 ZoomLevel값 증가
            if (nZoom == 1.1) objConfig.zoomlevel++;

            //Zoom In시 ZoomLevel값 감소
            if (nZoom == 0.9) objConfig.zoomlevel--;

            //Zoom 처리
            objPath.scale(nZoom, nZoom, nX, nY);

            //Graphics 컴포넌트 다시그리기
            objGraphics.redraw();
        };

        /**
        * @description 	      	: 하위노드 접기/펼치기 함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param objPath		: 선택된 노드의 접기/펼치기버튼 오브젝트
        * @return             	: 없음
        */
        this.gfnShowChildNode = function (objGraphics, objPath) {
            let objConfig, objNode, objRect, objBoard, dsTarget,
        		sOrgNum, sCOLLAPSE, arrId,
        		nRow, nX1, nX2, nMoveX, nY1, nY2, nMoveY,
        		nZoom, nZoomLevel;

            //설정정보 가져오기
            objConfig = objGraphics.config;

            //원본 데이터셋 가져오기
            dsTarget = objConfig.targetDs;

            //노드 그룹 오브젝트 가져오기
            objNode = objPath.parent;

            //노드 ID가져오기
            sNodeId = objNode.id;

            //노드 ID를 array로 구분하기
            arrId = sNodeId.split("_");

            //노드 ID에서 ORG_NUM값을 추출하기
            sOrgNum = arrId[1];

            //노드 ID에 해당하는 원본 데이터 Row찾기
            nRow = dsTarget.findRow("ORG_NUM", sOrgNum);

            //COLLAPSE 여부 값 가져오기
            sCOLLAPSE = dsTarget.getColumn(nRow, "COLLAPSE");

            //COLLAPSE 일 경우 EXPAND로 변경
            if (sCOLLAPSE == 1) {
                dsTarget.setColumn(nRow, "COLLAPSE", 0);
            }
            //EXPAND 일 경우 COLLAPSE로 변경
            else {
                dsTarget.setColumn(nRow, "COLLAPSE", 1);
            }

            //선택된 노드의 변경 전 위치값 가져오기
            objRect = objNode.getObjectByID("bg").getBoundRect();
            nX1 = objRect.left;
            nY1 = objRect.top;

            //조직도 그리기 함수 호출
            this.gfnDrawOrganization(objGraphics);

            //그룹 오브젝트 다시 가져오기
            objBoard = objGraphics.getObjectByID("board");

            //설정정보 중 ZoomLevel값 가져오기
            nZoomLevel = objConfig.zoomlevel;

            //확대된 상태일 경우
            if (nZoomLevel > 0) nZoom = 1 * Math.pow(1.1, nZoomLevel);

            //축소된 상태일 경우
            else nZoom = 1 * Math.pow(0.9, -nZoomLevel);

            //기존 Zoom상태로 적용
            objBoard.scale(nZoom, nZoom);

            //선택된 노드 다시 가져오기
            objNode = objGraphics.getObjectByID(sNodeId)

            //선택된 노드의 변경 후 위치값 가져오기
            objRect = objNode.getObjectByID("bg").getBoundRect();
            nX2 = objRect.left;
            nY2 = objRect.top;

            //변경된 위치값의 차이 구하기
            nMoveX = nX1 - nX2;
            nMoveY = nY1 - nY2;

            //변경전 위치와 동일한 위치에 보이도록
            //조직도 그룹 오브젝트의 위치 보정
            objBoard.x = nMoveX;
            objBoard.y = nMoveY;

            //Graphics 컴포넌트 다시그리기
            objGraphics.redraw();
        };

        /**
        * @description 	      	: 조직도 위치 변경함수
        * @param objGraphics  	: 조직도를 설정할 Graphics Component
        * @param nX1			: Drag 시작 X 좌표
        * @param nX2			: 현재 X 좌표
        * @param nY1			: Drag 시작 Y 좌표
        * @param nY2			: 현재 Y 좌표
        * @return             	: 없음
        */
        this.gfnMoveOrganizationChart = function (objGraphics, nX1, nX2, nY1, nY2) {
            //조직도 그룹 오브젝트 가져오기
            let objBoard = objGraphics.getObjectByID("board");

            //이동될 위치 좌표값 계산
            let nMoveX = objBoard.orgX + (nX2 - nX1);
            let nMoveY = objBoard.orgY + (nY2 - nY1);

            //위치 이동
            objBoard.x = nMoveX;
            objBoard.y = nMoveY;

            //Graphics 컴포넌트 다시그리기
            objGraphics.redraw();
        };
        });
    
        this.loadIncludeScript(path);
        
        obj = null;
    };
}
)();

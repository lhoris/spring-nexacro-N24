### Nexacro N v24 RESTful API 사용 예제
**Author:** lhoris23@gmail.com(이성훈)

이 가이드는 Nexacro N v24에서 RESTful API를 사용하는 방법을 설명합니다. 이 예제는 특정 URL로 요청을 보내고 응답을 받아오는 방법을 보여줍니다.

### 1. 폼 구성 요소
- **Static01**: 페이지 제목
- **Button00**: 요청을 보내는 버튼
- **Static02, Static03, Static04, Static05**: 레이블들 (URL, Method, Parameter, Response)
- **Edit00**: 요청할 URL을 입력하는 필드
- **Radio00**: HTTP 메서드를 선택하는 라디오 버튼
- **TextArea00**: 요청 파라미터를 입력하는 텍스트 영역
- **TextArea01**: 응답을 표시하는 텍스트 영역

### 2. 폼 로드 시 이벤트 핸들러
폼이 로드될 때 `form_onload` 함수가 호출됩니다. 공통라이브러리에 정의한 Global Function `gfnFormOnLoad`(넥사크로 폼 로드 시점에 초기화 기능 선언) 함수를 호출하게 됩니다.

```javascript
this.form_onload = function(obj:nexacro.Form, e:nexacro.LoadEventInfo) {
    this.gfnFormOnLoad();
};
```

### 3. 버튼 클릭 시 요청 보내기
버튼을 클릭하면 `Button00_onclick` 함수가 호출되어 요청을 보냅니다.

```javascript
this.Button00_onclick = function(obj:nexacro.Button, e:nexacro.ClickEventInfo) {
    let url = this.Edit00.value;
    let settings = {
        "method": this.Radio00.value,
        "param": this.TextArea00.value,
        "callback": function(code, response) {
            this.TextArea01.value = response;
        }
    };
    this.sendRequest(url, settings);
};
```

### 4. RESTful API 요청 보내기
`sendRequest` 함수는 실제로 RESTful API 요청을 보내는 함수입니다.  
넥사크로의 `transaction` 함수도 내부적으로 `XMLHttpRequest`를 사용합니다. 

```javascript
this.sendRequest = function(url, settings) {
    let createCORSRequest = function(method, url) {
        let xhr = new XMLHttpRequest();
        
        if (xhr) {
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null;
        }
        return xhr;
    };

    const pForm = this;
    let method = settings["method"] ? settings["method"] : "GET";
    let xhr = createCORSRequest(method, url);
    let sParam = JSON.stringify(settings["param"]);
    let callback = settings["callback"];

    try {
        xhr.timeout = nexacro.getEnvironment().httptimeout * 1000; // time in milliseconds
        xhr.ontimeout = function(e) {
            if (typeof callback == "function") {
                callback.call(pForm, -1, "Request Timeout");
            } else if (typeof callback == "string") {
                pForm[callback].call(pForm, -1, "Request Timeout");
            }
        };
    } catch (e) {}

    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let response = this.responseText;

            if (typeof callback == "function") {
                callback.call(pForm, 0, response);
            } else if (typeof callback == "string") {
                pForm[callback].call(pForm, 0, response);
            }
        }
    };

    xhr.send(sParam);
};
```

### 5. 예제 사용 방법

1. **URL 입력**:
    - `Edit00` 필드에 요청할 URL을 입력합니다. 예: `https://services.odata.org/v4/TripPinServiceRW/People`

2. **HTTP 메서드 선택**:
    - `Radio00`에서 원하는 HTTP 메서드(GET, POST, OPTIONS, PUT, DELETE, HEAD)를 선택합니다.

3. **요청 파라미터 입력**:
    - `TextArea00`에 요청 파라미터를 JSON 형식으로 입력합니다.
   ```json
   {
       "UserName": "lewisblack",
       "FirstName": "Lewis",
       "LastName": "Black",
       "Emails": ["lewisblack@example.com"],
       "AddressInfo": [
           {
               "Address": "187 Suffolk Ln.",
               "City": {
                   "CountryRegion": "United States",
                   "Name": "Boise",
                   "Region": "ID"
               }
           }
       ],
       "Gender": "Male",
       "Concurrency": 635519729375200400
   }
   ```

4. **요청 보내기**:
    - `Button00`을 클릭하여 요청을 보냅니다. 응답 결과는 `TextArea01`에 표시됩니다.

이 예제는 Nexacro N v24에서 RESTful API를 사용하는 방법을 직관적으로 보여줍니다. 각 구성 요소의 역할을 이해하고 필요한 부분을 수정하여 다양한 RESTful API 호출에 활용할 수 있습니다.

### 6. 응용
Nexacro N v24 환경에서 RESTful API를 보다 쉽게 호출하기 위해 `gfn_TransactionREST` 공통 함수를 작성해봅니다.

#### `gfn_TransactionREST` 공통 함수 선언
```javascript
nexacro.Form.prototype.gfn_TransactionREST = function(method, url, headers, data, callback, asyncFlag = true) {
    var xhr = new XMLHttpRequest();

    xhr.open(method, url, asyncFlag);
    xhr.setRequestHeader("Content-Type", "application/json");

    // 추가 헤더 설정
    if (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                // 성공 시 처리 로직
                var response = JSON.parse(xhr.responseText);
                callback(null, response);
            } else {
                // 실패 시 처리 로직
                callback(xhr.status, xhr.responseText);
            }
        }
    };

    // 데이터 전송
    xhr.send(data ? JSON.stringify(data) : null);
};
```

#### `gfn_TransactionREST` 공통 함수 파라미터 설명
- `method` (string): HTTP 메서드 (GET, POST, PUT, DELETE 등)
- `url` (string): 요청할 URL
- `headers` (object): 요청 헤더를 포함하는 객체 (예: `{ "Authorization": "Bearer token" }`)
- `data` (object): 요청 본문에 포함될 데이터 객체 (예: `{ "key": "value" }`)
- `callback` (function): 요청 완료 시 호출될 콜백 함수 (`function(error, response)`)
- `asyncFlag` (boolean, 선택): 비동기 여부 (기본값: `true`)

#### `gfn_TransactionREST` 공통 함수 호출
JSONPlaceholder API를 사용하여 POST 방식으로 RESTful API를 호출해봅니다.

```javascript
// 사용 예제 (POST 방식)
var headers = {
   "Content-Type": "application/json"
};
var data = {
   title: 'foo',
   body: 'bar',
   userId: 1
};

this.gfn_TransactionREST("POST", "https://jsonplaceholder.typicode.com/posts", headers, data, function(error, response) {
   if (error) {
      console.error("Request failed with status", error);
   } else {
      console.log("Request succeeded with response", response);
   }
});
```

#### `gfn_TransactionREST` 공통 함수 호출예시 내부 로직

1. **XMLHttpRequest 객체 생성 및 설정**:
   - `XMLHttpRequest` 객체를 생성하고, `open` 메서드를 사용하여 HTTP 메서드와 URL을 설정합니다.
   - `setRequestHeader` 메서드를 사용하여 `Content-Type`을 `application/json`으로 설정합니다.

2. **추가 헤더 설정**:
   - 전달된 헤더 객체를 순회하며 각 헤더를 요청에 설정합니다.

3. **onreadystatechange 이벤트 핸들러**:
   - 요청의 상태가 변경될 때마다 호출됩니다.
   - `readyState`가 4이면 요청이 완료된 것이며, `status` 코드를 확인하여 성공 여부를 판별합니다.
   - 성공 시 응답 텍스트를 JSON으로 파싱하여 콜백 함수에 전달하고, 실패 시 상태 코드와 응답 텍스트를 콜백 함수에 전달합니다.

4. **데이터 전송**:
   - JSON 데이터를 문자열로 변환하여 `send` 메서드를 사용하여 전송합니다.
   - GET 요청의 경우 `data`를 `null`로 설정하여 전송합니다.

### 참고 문헌

- [GitHub Repository: lhoris/spring-nexacro-N24](https://github.com/lhoris/spring-nexacro-N24)
- [넥사크로N 데모 사이트](https://demo.tobesoft.com/)
- [PlayNexacro RESTful API 사용법](https://www.playnexacro.com/#show:learn:4523)
- [PlayNexacro 기술 팁](https://www.playnexacro.com/#show:techtip:201)
- [Nexacro Developer Guide](http://demo.nexacro.com/developer_guide/N/index.html?sa=sample_nexacro_domparser_01&ma=176eafd4e40da4e8)
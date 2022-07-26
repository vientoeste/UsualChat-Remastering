**<span style="font-size:250%">Development Document</span>**

파일 구조 등의 개선을 위해 새로운 repo에서 작업
-----------------------
# 개선 사항
## 추가할 기능
- 테스트 코드
- 채팅 시간
- 다크 테마
- 대화 내역 내보내기
- 메일 서비스 이용
- 프로필 사진 || 아이콘 설정
- electron 사용
## 현존 문제점
- 파일 구조 수정 중 종속성으로 인한 오류
- 이미지 외 파일 업로드 동작 안 함
- 웹소켓 숙련도 이슈
- HTML 내 JS 파일 분리 필요
- 모듈화 필요
- controller <-> middleware 구분 필요
- pm2 도입 필요
-----------------------
# commit 별 수정 사항
## c9b55b1, 2696263, 776e684
- 폴더 구조 수정
- '/' - GET 라우터 추가
## 1d5f88a
- 기존 기능 모두 추가(socket.io 제외)
- ~~typescript 사용 시, socket.io 관련 문제가 있어 ws 패키지로 대체 예정~~
- remove -> deleteOne, deleteMany로 대체
## 48c663c
- 코드 일부 개선(alert로 에러 출력, 에러 관련 오류 개선)
- 임시 favicon 추가

## 6a752a7
- 에러 관련 오류 수정(에러 세분화 예정)
- chat, room 분리
- 친구 관련 기능이 작동하지 않던 오류 해결
## 2313c0b
- /room/:id DELETE 관련 문제 해결
    * /room/:id DELETE 요청 처리 후, `return res.redirect('/');`를 통해 메인 화면으로 리디렉션을 제공하려고 했으나 /room/:id에 GET 요청을 자동으로 보냄
    * 해당 현상을 위해 임시로 /room/:id GET 라우터에 `findById({_id: roomID})`의 결과가 null일 시 리디렉션 제공
    * 잘못된 /room/:id 접근 시 글자 수가 다르면 `Cast to ObjectId failed for value ~~` 오류가 출력되기 때문에 해당 오류가 null 체크 라인에서 검출될 수 없음, 글자 수가 같으면 '/' 경로로 리다이렉트
    * DELETE 요청 후 메인으로 리다이렉트 시 '/' 경로에 GET요청 선전송 후 DELETE 요청을 전송하는 현상 확인 -> req.method='GET'으로 해결 실패 -> res.redirect(303, '/')으로 해결
- 기타 사항들 수정(indent 등)
## 259ac0d, 3579a48
- socket.io를 통한 실시간 채팅 기능 복구
- socket.io는 웹소켓 프로토콜을 준수하는(TCP 전이중 통신) 라이브러리가 아니므로, 웹소켓 서버 구현을 위해서는 ws, uwebsocket.js 등의 라이브러리 도입이 필요함
## 14971f9
- document.querySelector.addEventListener 사용 시 querySelector에 해당하는 클래스나 ID가 없을 경우 undefined를 반환하기 때문에 addEventListener에 에러가 발생하여 해당 line보다 아래에 있는 스크립트가 실행되지 않는 현상 해결
    * ?. 문법 사용 시 해당하는 객체가 undefined, null이지 않을 경우 뒤에 붙는 메소드를 실행함. undefined, null일 경우 실행하지 않음
- socket.io 사용 코드의 통일성 부여
## 
- /dm 라우터 사용 시 BSON / type casting 오류가 있어 분리
- tailwindCSS 사용을 위한 초기 설정
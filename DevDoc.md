**<span style="font-size:250%">Development Document</span>**

파일 구조 등의 개선을 위해 새로운 repo에서 작업
-----------------------
# 개선 사항
## 추가할 기능
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
## 1d5f88a, 
- 기존 기능 모두 추가(socket.io 제외)
- ~~typescript 사용 시, socket.io 관련 문제가 있어 ws 패키지로 대체 예정~~
- remove -> deleteOne, deleteMany로 대체
##
- 코드 일부 개선(alert로 에러 출력, 에러 관련 오류 개선)
- 임시 favicon 추가
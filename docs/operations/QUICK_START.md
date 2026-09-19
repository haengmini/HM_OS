# HM OS 바로 사용하기

## 1. Tailscale 확인

사용할 Windows PC/노트북에서 Tailscale에 `ihyeongmin00@gmail.com` 계정으로 로그인한다.
이미 로그인되어 있다면 별도 설치 작업은 없다.

## 2. HM OS 열기

브라우저에서 아래 주소를 연다.

**https://hm-os-server.taila8b4a0.ts.net**

최초 한 번 원하는 HM OS PIN을 입력하고 같은 PIN을 한 번 더 입력한다. PIN은 서버에
Argon2id 해시로만 저장되며 평문은 저장되지 않는다.

## 3. 앱으로 설치

### Microsoft Edge

주소창 오른쪽 **앱 사용 가능** 아이콘 → **설치**.

### Google Chrome

주소창 오른쪽 설치 아이콘 또는 메뉴 → **전송, 저장, 공유** → **페이지를 앱으로 설치**.

이후 Windows 시작 메뉴와 작업 표시줄에서 HM OS를 일반 앱처럼 실행한다.

## 화면 구성

- **오피스:** 실제 서버·Agent OS·Wiki·프로젝트 상태
- **터미널:** 현재 Linux 서버의 실제 bash PTY
- **파일:** `/opt/data` 파일 탐색·읽기·편집·업로드·다운로드

## 자동 운영

- PM2가 API와 userspace Tailscale daemon의 crash를 자동 복구한다.
- Hermes 스케줄러의 `hm-os-runtime-watchdog`이 1분마다 PM2·API·Tailscale·Serve를
  확인하고 필요한 경우 자동 복구한다.
- 정상 시에는 알림이 없고, 복구 실패 시에만 이 대화로 오류가 전달된다.

## 접속되지 않을 때

1. PC의 Tailscale 연결 상태를 확인한다.
2. 브라우저에서 주소를 새로고침한다.
3. 계속 실패하면 Hermes에게 `HM OS 상태 확인해`라고 요청한다.

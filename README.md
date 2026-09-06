# Google 타이머 (Google Timer)

Google 검색의 타이머 위젯을 본떠 만든 원형 다이얼 카운트다운 타이머입니다.
React + Vite로 만들었고, PWA(오프라인/설치 가능)로 동작하며 GitHub Pages에 배포됩니다.

## 주요 기능

- 원형 다이얼을 드래그하거나 시/분/초 입력창에 직접 입력해 시간 설정
- 시작 / 일시정지 / 다시 시작 / 재설정 / 취소
- 남은 시간에 따라 줄어드는 원형 진행 표시
- 타이머 종료 시 알람음(웹 오디오로 생성, 외부 파일 불필요) 및 알림
- 타이머가 실행 중일 때 브라우저 탭 제목에 남은 시간 표시
- PWA: 홈 화면에 설치 가능, 오프라인에서도 동작
- 백그라운드 탭에서 알림 권한이 허용된 경우 시스템 알림 표시
- 실행 중 화면 꺼짐 방지(Wake Lock, 지원 브라우저에 한함)

## 개발

```bash
npm install
npm run dev
```

## 빌드 / 미리보기

```bash
npm run build
npm run preview
```

## 배포

`main` 브랜치에 푸시되면 `.github/workflows/deploy.yml` 워크플로우가 자동으로
빌드 후 GitHub Pages에 배포합니다. 저장소의 **Settings → Pages → Build and
deployment → Source**를 **GitHub Actions**로 설정해야 합니다(최초 1회).

배포 URL: `https://<github-user>.github.io/google-timer/`

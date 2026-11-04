# Study 33 — 아이패드용 오프라인 PWA

## 설치 및 배포
1. 이 폴더의 파일 구조를 그대로 유지하여 정적 웹 호스팅(예: GitHub Pages 또는 Netlify)에 업로드합니다.
2. 배포된 **HTTPS 주소**를 아이패드 Safari에서 엽니다.
3. Safari 공유 메뉴 → **홈 화면에 추가** → 추가를 누릅니다.
4. 홈 화면의 **Study 33** 아이콘으로 실행합니다. 최초 온라인 접속 후 앱 자산이 캐시되면 오프라인 실행을 지원합니다.

### GitHub Pages 예시
1. GitHub에서 새 공개 저장소를 생성합니다.
2. `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `icons/`를 저장소 최상위에 업로드합니다.
3. Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.
4. 배포된 `https://사용자명.github.io/저장소명/` 주소를 Safari에서 엽니다.

### 주의사항
- 파일 앱에서 `index.html`을 직접 여는 방식은 서비스 워커 설치 및 오프라인 PWA 동작을 보장하지 않습니다. HTTPS 배포를 권장합니다.
- 체크리스트와 메모는 기기 브라우저의 localStorage에 자동 저장됩니다. 브라우저 데이터 삭제, 비공개 브라우징, 기기 교체 시 사라질 수 있으므로 **목표 → 백업 파일 내보내기**를 이용하십시오.
- 오프라인 실행을 위해서는 온라인에서 앱을 최소 한 번 완전히 로드해야 합니다.
- 시험 범위를 알게 되면 '목표' 탭에 기입하고, 데일리 목표를 직접 수정하십시오.
- 일정은 2026년 11월 4일~12월 6일로 고정되어 있습니다.

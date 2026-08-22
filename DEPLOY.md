# 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 개발 서버(`115.68.192.132`)에 배포합니다.

- 별도 빌드 없이 이 레포의 파일을 그대로 `/data/hunter/www/homepage`에 복사합니다.
- 도커 재시작 없음 (nginx가 그 경로를 정적 파일로 서빙).
- 보통 1분 이내에 반영됩니다.

수동으로 다시 배포하려면: GitHub → Actions 탭 → `Deploy to Dev` → `Run workflow`.

배포 파이프라인 전체 구조, 필요한 secrets, 트러블슈팅은 [`hunterkorea/default-infra`](https://github.com/hunterkorea/default-infra)의 `DEV_DEPLOY.md`를 참고하세요.

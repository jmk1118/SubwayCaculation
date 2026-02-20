# Search Console Checklist

## 1) 사전 준비
- 실제 배포 도메인 확인 (예: `https://subwaycaculation.vercel.app`)
- 로컬/배포 환경변수 설정
  - `VITE_SITE_URL`: 사이트 기본 URL
  - `VITE_SEARCH_CONSOLE_VERIFICATION`: Search Console 메타태그 인증 토큰

예시:
```bash
VITE_SITE_URL=https://subwaycaculation.vercel.app
VITE_SEARCH_CONSOLE_VERIFICATION=google-site-verification-token
```

Vercel 사용 시:
1. Project Settings -> Environment Variables
2. `VITE_SEARCH_CONSOLE_VERIFICATION` 추가
3. Production/Preview 모두 저장
4. 재배포

## 2) SEO 파일 생성/배포
1. `npm run build` 실행
2. 배포 후 아래 URL 확인
- `/robots.txt`
- `/sitemap.xml`
- `<head>`에 `google-site-verification` 메타태그가 삽입되었는지 확인
- `<head>`에 `canonical`, `og:url`, `application/ld+json`이 삽입되었는지 확인

## 3) Search Console 등록
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가
- 권장: 도메인 속성 (DNS)
- 대안: URL 접두어 속성

## 4) 소유권 확인
- DNS TXT 또는 HTML 파일/메타태그 방식으로 인증
- 메타태그 인증을 쓰는 경우:
  1. Search Console이 제공한 `content` 값만 복사
  2. `VITE_SEARCH_CONSOLE_VERIFICATION`에 설정
  3. 빌드 후 재배포
- 인증 완료 후 속성 접근 가능 상태 확인

## 5) 사이트맵 제출
1. 좌측 메뉴 `Sitemaps`
2. `sitemap.xml` 제출
3. 제출 상태가 `성공`인지 확인

## 6) 인덱싱 점검
- URL 검사에서 `/` 검사 후 색인 요청
- Coverage/Pages 리포트에서 제외 사유 확인

## 7) 운영 체크
- 주 1회
  - 색인된 페이지 수
  - 크롤링 오류
  - 검색 성능(노출/클릭/CTR)

# blog Git 운영 전략

작성일: 2026-11-14 (한국 시간)\
대상: Pawn's Woodworking Studio / `devKobe24/pawns-woodworking`\
문서 상태: 현재 로컬 저장소를 확인해 작성한 운영 제안

## 1. 기본 방향

**`main` + 작업별 단기 브랜치 + Pull Request(PR) + Squash merge 방식으로 운영합니다.**

1인 운영 블로그를 기준으로, 글 발행과 사이트 개발에 같은 절차를 사용합니다. `main`에는 공개해도 되는 상태만 병합하고, 변경 내용을 PR에서 확인한 뒤 배포합니다. 별도의 상시 `develop`이나 `release` 브랜치는 두지 않습니다. 독립적으로 발행할 글이나 기능을 따로 병합할 수 있어야 하기 때문입니다.

GitHub flow의 브랜치·PR 절차를 바탕으로 하되, 브랜치 접두사와 커밋 형식, 병합 방식은 이 프로젝트의 운영 규칙으로 정합니다.[1]

## 2. 현재 확인한 프로젝트 상태

| 항목 | 확인 결과 |
|---|---|
| 작업 상위 폴더 | `/Users/minseong/Desktop/blog` — Git 저장소가 아님 |
| 실제 Git 저장소 | `/Users/minseong/Desktop/blog/site` |
| 원격 저장소 | `https://github.com/devKobe24/pawns-woodworking.git` |
| 현재 브랜치 | `main`, 로컬 `origin/main` 추적 |
| 로컬 참조 기준 최신 커밋 | `887bf4b` — `Set blog title, description and site URL` |
| 작업 디렉터리 | 확인 시 변경 사항 없음 |
| 사이트 | Astro 기반 정적 블로그, Markdown/MDX 사용 |
| 글 경로 | `site/src/content/blog/` |
| 이미지 경로 | `site/src/assets/`, `site/public/` |
| 패키지 관리 | npm, `package-lock.json` 추적 중 |
| Node 요구 조건 | `package.json`의 `engines.node`: `>=22.23.4` |
| 현재 스크립트 | `dev`, `build`, `preview`, `astro` |
| GitHub Actions | 로컬 추적 파일에서 워크플로 없음 |
| 운영 주소 설정 | `astro.config.mjs`에 `https://pawns-woodworking.pages.dev` 설정 |
| 보고서 위치 | `blog/report/` — 현재 사이트 저장소 범위 밖 |

원격 참조는 로컬에 저장된 정보를 확인했습니다. GitHub의 최신 상태, 저장소 공개 여부, 보호 규칙, Cloudflare 연결·배포 상태는 확인하지 않았습니다. 운영 주소 설정만으로 배포 완료를 판단하지 않습니다.

이 문서 작성에서는 Git 설정, 브랜치, 소스 코드, 원격 저장소, 배포 설정을 변경하지 않았습니다.

## 3. 저장소 범위와 문서 위치

현재 Git 루트인 `blog/site`를 유지합니다. 상위 `blog` 폴더에서 새로 `git init`을 실행해 저장소를 중첩시키지 않습니다.

| 위치 | 운영 원칙 |
|---|---|
| `blog/site/` | 사이트 코드·글·배포용 이미지를 Git으로 관리 |
| `blog/site/docs/` | 앞으로 Git에 함께 남길 운영 문서의 권장 위치 |
| `blog/report/` | 사용자가 요청한 보고서 보관 위치. 현재 사이트 Git에 포함되지 않음 |
| `blog/pawns-woodworking/` | 현재 사이트 저장소 범위 밖. 사이트 소스와 혼동하지 않음 |

이 전략 문서를 팀원이나 다른 컴퓨터에서도 Git으로 확인해야 할 때는 별도 작업으로 `site/docs/git-strategy.md`에 복사해 커밋합니다. 문서 저장만으로 GitHub에 백업되지는 않습니다.

## 4. 브랜치 규칙

### 4.1 브랜치 역할

| 브랜치 | 용도 | 예시 | 병합 대상 |
|---|---|---|---|
| `main` | 공개 가능한 기준 코드 | `main` | 해당 없음 |
| `feat/<주제>` | 새 기능 | `feat/tag-pages` | `main` |
| `fix/<주제>` | 오류 수정 | `fix/mobile-header` | `main` |
| `content/<주제>` | 글 작성·내용 수정·발행 | `content/first-woodworking-project` | `main` |
| `style/<주제>` | 레이아웃·색상·글꼴 수정 | `style/home-layout` | `main` |
| `docs/<주제>` | README·운영 문서 수정 | `docs/git-strategy` | `main` |
| `chore/<주제>` | 의존성·도구·설정 정비 | `chore/update-dependencies` | `main` |
| `hotfix/<주제>` | 공개 사이트의 긴급 장애 수정 | `hotfix/broken-post-route` | `main` |

- 브랜치 이름은 영문 소문자·숫자·하이픈과 위 접두사를 사용합니다.
- 한 브랜치에는 하나의 발행 또는 수정 목적만 담습니다.
- 글 한 편에 필요한 이미지와 해당 글은 같은 PR에 포함합니다.
- 기능 작업은 가능하면 1~3일 안에 병합할 크기로 나눕니다. 집필 중인 글은 완료할 때까지 유지해도 됩니다.
- 모든 작업 브랜치는 최신 `main`에서 시작합니다. 다른 작업 브랜치에서 새 작업을 분기하지 않습니다.
- 병합된 작업 브랜치는 정리합니다. 기록 보존에는 PR·커밋·태그를 사용합니다.

### 4.2 작업 흐름

| 단계 | 실행 내용 | 완료 조건 |
|---|---|---|
| 준비 | 깨끗한 작업 상태에서 `main` 갱신 | 최신 원격 변경 반영 |
| 작업 | 목적별 브랜치에서 글·코드 수정 | 변경 범위가 하나의 목적에 해당 |
| 확인 | 변경 검토와 빌드 | 빌드 성공, 공개할 내용 확인 |
| PR | `main` 대상으로 PR 작성 | 변경 목적·확인 결과 기록 |
| 미리보기 | 연결된 경우 Cloudflare Preview 확인 | 글·이미지·모바일 화면 확인 |
| 병합 | Squash merge | PR 하나가 `main` 커밋 하나가 됨 |
| 배포 | `main`의 성공한 배포 확인 | 배포 SHA와 실제 페이지 확인 |
| 정리 | 원격 작업 브랜치 삭제, 로컬 갱신 | 다음 작업은 새 브랜치에서 시작 |

## 5. 커밋 규칙

형식은 다음처럼 통일합니다. 과거 커밋을 이 규칙에 맞추려고 다시 작성하지는 않습니다.

```text
type(scope): 변경 내용을 설명하는 문장
```

| type | 사용 상황 | 예시 |
|---|---|---|
| `feat` | 방문자 기능 추가 | `feat(tags): 태그별 글 목록 추가` |
| `fix` | 동작 오류 수정 | `fix(rss): 글 링크 경로 수정` |
| `content` | 글 발행·수정 | `content(blog): 첫 목공 작업기 발행` |
| `style` | 화면 표현 수정 | `style(header): 모바일 메뉴 간격 조정` |
| `docs` | 개발·운영 문서 수정 | `docs(workflow): 배포 절차 정리` |
| `refactor` | 동작을 유지하는 구조 개선 | `refactor(blog): 글 조회 로직 공통화` |
| `chore` | 의존성·설정 관리 | `chore(deps): Astro 의존성 갱신` |
| `ci` | 자동 검사·배포 설정 | `ci(build): PR 빌드 검사 추가` |
| `test` | 검증 코드 추가·수정 | `test(content): 초안 제외 동작 검증` |
| `revert` | 기존 변경 취소 | `revert(blog): 잘못 발행한 글 되돌리기` |

`scope`는 `blog`, `header`, `rss`처럼 짧게 쓰고 필요 없으면 생략합니다. 설명은 한국어로 작성해도 됩니다.

커밋은 의미 있는 단위로 나누고, 글 발행과 무관한 의존성 갱신을 섞지 않습니다. `git add .`를 습관적으로 사용하기보다 대상 파일을 지정하거나 `git add -p`로 변경을 선택합니다. 커밋 전에 `git diff --staged`로 실제 포함 파일을 확인합니다.

## 6. PR과 병합 규칙

### 6.1 PR 작성

- 대상 브랜치는 항상 `main`입니다.
- 미완성 작업은 Draft PR로 올립니다. Draft PR은 작업 상태 표시이며, 콘텐츠 비공개를 보장하지 않습니다.
- PR 제목은 최종 Squash 커밋 메시지로 사용할 수 있도록 커밋 규칙을 따릅니다.
- 글 발행과 UI 변경을 독립적으로 되돌릴 수 있다면 PR도 나눕니다.
- 사소한 오탈자도 같은 절차를 사용하되 설명은 짧게 작성합니다.

PR 본문 예시:

```markdown
## 변경 목적
첫 목공 작업기를 발행합니다.

## 변경 내용
- 작업 과정과 완성 사진 추가
- 글 제목·설명·게시일 입력

## 확인 결과
- [ ] npm ci / npm run build 성공
- [ ] 변경 파일과 이미지 공개 범위 확인
- [ ] 글 목록·상세·RSS 확인
- [ ] 화면 변경 시 모바일·PC 확인
- [ ] Preview 사용 시 최신 커밋의 배포 확인
```

체크 항목은 실제 수행한 경우에만 완료로 표시합니다.

### 6.2 병합 방식

기본 방식은 **Squash and merge**입니다. 작업 중간의 작은 커밋은 PR에서 확인하고, `main`에는 PR 단위의 변경 기록을 남깁니다. 장애 시 되돌릴 커밋을 고르기 쉽습니다.

GitHub 저장소 설정에서는 Squash merge를 허용하고, 운영을 단순화하려면 일반 merge commit과 rebase merge를 비활성화합니다. 병합 후 원격 브랜치 자동 삭제를 활성화하는 것을 권장합니다. 이 문서는 설정안이며 실제 적용은 별도입니다.

### 6.3 `main` 보호 설정안

| 설정 | 권장값 | 적용 이유 |
|---|---|---|
| PR을 통한 변경 | 필수 | 공개 전 변경 내역 확인 |
| 필수 상태 검사 | CI 구축 후 `build` 등 실제 검사 지정 | 실패한 변경 차단 |
| 승인 리뷰 수 | 1인 운영은 필수 승인 없음 | 혼자 작성한 PR을 타인의 승인 없이 병합 가능하게 운영 |
| 대화 해결 | 필수 | 남은 검토 의견 확인 |
| Force push | 금지 | 공개 이력 보존 |
| `main` 삭제 | 금지 | 기준 브랜치 보존 |
| 관리자 우회 | 가능하면 제한 | 동일 절차 적용 |

먼저 CI를 실행해 성공한 검사 이름을 확인한 다음 필수 검사로 지정합니다. 존재하지 않는 검사부터 등록하면 PR이 대기 상태로 막힐 수 있습니다. 협업자가 생기면 필수 승인 1명과 새 커밋 이후 재검토를 추가합니다.

보호 브랜치 기능의 사용 가능 범위는 저장소 공개 여부와 GitHub 요금제에 따라 다릅니다. 현재 계정에서 적용 가능한지 확인하고, 사용할 수 없다면 우선 같은 규칙을 수동으로 지킵니다.[2]

## 7. 글 발행과 초안 관리

### 7.1 현재 코드에서 주의할 점

현재 `src/content.config.ts`의 필드는 `title`, `description`, `pubDate`, 선택 항목 `updatedDate`·`heroImage`입니다. `draft` 필드와 초안 제외 로직은 없습니다.

글 목록, 상세 경로 생성, RSS가 모두 전체 `getCollection('blog')` 결과를 사용합니다. 따라서 **`draft: true`를 적거나 미래 `pubDate`를 설정하는 것만으로 비공개·예약 발행이 되지 않습니다.** 현재는 `main`에 들어간 글을 다음 성공한 빌드에서 공개할 수 있는 글로 취급합니다.

### 7.2 당장 사용할 발행 규칙

1. `content/<글-주제>` 브랜치에서 글과 이미지를 작성합니다.
2. 로컬에서 내용·사진·링크를 확인합니다.
3. 공개 준비가 된 경우에만 `main`에 병합합니다.
4. 게시 후 내용 수정은 새로운 `content/` 브랜치에서 처리합니다.
5. 기존 글의 본문을 실질적으로 수정하면 `updatedDate`를 기록합니다.
6. 글 파일 경로를 바꾸면 `post.id`와 URL도 바뀔 수 있으므로 기존 URL의 리다이렉트 필요 여부를 확인합니다.

### 7.3 초안을 안전하게 다루기

원격 브랜치는 저장소가 공개라면 누구나 읽을 수 있습니다. Cloudflare Preview도 기본적으로 공개 접근이 가능하므로 미리보기 주소를 비밀 저장 공간으로 취급하지 않습니다. 미공개 내용이 필요하면 접근 정책을 적용하고 확인해야 합니다.[3]

초안 기능은 별도 `feat/draft-filter` 작업에서 구현합니다.

- 콘텐츠 스키마에 `draft`를 추가합니다.
- 운영 빌드에서 초안이 목록·상세 경로·RSS·검색 등 모든 노출 경로에서 제외되도록 처리합니다.
- 생성된 사이트맵과 이미지 등 정적 자산의 공개 여부도 확인합니다.
- 초안 제외는 웹사이트 출력 제어입니다. GitHub 저장소에 올린 원문을 숨기지는 못합니다.
- 예약 발행까지 필요하면 날짜 필터와 예약 재빌드를 함께 설계합니다. 정적 사이트는 시간이 지났다는 이유만으로 자동 재빌드되지 않습니다.

## 8. 검증과 배포 전략

### 8.1 현재 바로 실행할 검증

모든 명령은 실제 Git 저장소에서 실행합니다.

```bash
cd /Users/minseong/Desktop/blog/site
npm ci
npm run build
git diff --check
```

Node는 `engines.node` 조건을 만족해야 합니다. 로컬·CI·Cloudflare에서 동일한 지원 버전을 선택하고 `.nvmrc` 또는 `.node-version`과 호스팅 설정에 명시하는 것을 후속 작업으로 권장합니다.

현재 `lint`, `test`, 독립적인 타입 검사 스크립트는 없습니다. 빌드 성공을 이 검사가 모두 끝났다는 의미로 기록하지 않습니다. 일반 글 수정은 빌드와 화면 확인으로 검증하고, 초안 필터·라우팅 같은 동작을 추가할 때 해당 동작의 자동 검증을 추가합니다.

### 8.2 후속 CI 구성안

GitHub Actions 워크플로는 저장소 기준 `.github/workflows/ci.yml`에 둡니다. 로컬 전체 경로는 `blog/site/.github/workflows/ci.yml`입니다.

| 항목 | 구성안 |
|---|---|
| 실행 시점 | `main` 대상 PR, `main` push |
| 권한 | 기본 `contents: read` |
| 실행 경로 | 체크아웃한 저장소 루트. 추가 `site/` 경로를 붙이지 않음 |
| Node | 프로젝트가 선택한 동일 버전 |
| 설치 | `npm ci` |
| 필수 검사 | `npm run build`, 변경 공백 오류 검사 |
| 필수 상태 이름 | 예: `build` — 실제 실행 후 보호 규칙에 등록 |
| 중복 실행 | 같은 PR의 이전 실행은 새 변경이 오면 취소하도록 구성 |

PR의 최신 커밋에 대한 검사 성공을 확인합니다. CI 구축 전에는 로컬 검사 결과를 PR에 기록합니다.

### 8.3 Cloudflare Pages 배포 설정안

기존 로드맵에 맞춰 GitHub 연동형 Cloudflare Pages를 배포 수단으로 제안합니다. GitHub Actions는 검증을 맡고, 같은 커밋을 별도의 Actions 배포로 중복 배포하지 않습니다.

| 항목 | 설정안 |
|---|---|
| 연결 저장소 | `devKobe24/pawns-woodworking` |
| 운영 브랜치 | `main` |
| 빌드 루트 | 저장소 루트(`/`). 로컬 폴더명 `site`를 입력하지 않음 |
| 빌드 명령 | `npm run build` |
| 출력 경로 | `dist` |
| Node 환경 | 프로젝트가 선택한 동일 버전 |
| 작업 브랜치 | 필요한 브랜치의 Preview 배포 활성화 |

Pages Git 연동에서는 설정된 브랜치에 대한 push가 배포를 일으킵니다. Preview를 확인한 뒤 PR을 병합하고, `main` 커밋의 운영 배포 성공을 별도로 확인합니다.[4]

`main`의 GitHub Actions와 Cloudflare 빌드는 병렬로 진행될 수 있습니다. `main`의 사후 CI가 운영 배포를 차단한다고 가정하지 않습니다. **병합 전 PR의 필수 검사를 통과시키는 것**이 기본 차단 장치입니다.

배포 후에는 홈·변경 글·이미지·RSS와 모바일 화면을 확인합니다. `main`에 병합됐더라도 배포가 실패했다면 공개 완료로 기록하지 않습니다.

## 9. Git 추적 파일과 제외 파일

| Git에 포함 | Git에서 제외 |
|---|---|
| 소스·글·배포에 필요한 최적화 이미지 | `node_modules/`, `dist/`, `.astro/` |
| `package.json`, `package-lock.json` | 실제 값이 담긴 `.env*` |
| Astro·TypeScript 설정 | 개인 IDE 상태·로그·macOS 메타데이터 |
| CI 워크플로·공유 개발 설정 | API 토큰·인증서 개인키 |
| 값이 없는 `.env.example` | 원본 영상·대용량 사진 아카이브 |

현재 `.gitignore`는 `.env`, `.env.production`만 개별 제외하고 있어 `.env.local` 같은 파일은 추가 보호가 필요합니다. 후속 설정 작업에서 아래 규칙을 검토합니다.

```gitignore
# Local environment files
.env*
!.env.example

# Cloudflare local state and secrets
.wrangler/
.dev.vars*

# Private working materials, only if these folders are used
.ref/
.report/
```

숨김 폴더 전체를 제외하는 `.*/` 패턴은 사용하지 않습니다. `.github/` 같은 자동화 설정까지 빠질 수 있습니다. 이미 추적 중인 파일은 ignore 규칙 추가만으로 추적이 해제되지 않습니다.

사진은 웹용으로 크기와 용량을 줄인 버전을 커밋합니다. API 토큰이 커밋되었다면 파일 삭제만 하지 말고 해당 토큰을 폐기·재발급한 뒤 이력 정리 필요 여부를 판단합니다.

## 10. 실제 작업 명령 예시

### 10.1 새 작업 시작

아래 명령은 `git status`에서 진행 중인 변경이 없는 것을 확인한 후 실행합니다. 변경이 남아 있으면 현재 작업 브랜치에서 정리하고 시작합니다.

```bash
cd /Users/minseong/Desktop/blog/site
git status
git switch main
git pull --ff-only origin main
git switch -c content/first-woodworking-project
```

`--ff-only`가 실패하면 로컬 `main`과 원격 이력을 확인하고 해결합니다. 자동으로 강제 덮어쓰지 않습니다.

### 10.2 글 작성 후 커밋·push

아래 파일명은 새로 작성할 글의 예시입니다. 이미지가 있으면 실제 파일 경로도 함께 stage합니다.

```bash
git diff
git add src/content/blog/first-woodworking-project.md
git diff --staged
npm ci
npm run build
git diff --cached --check
git commit -m "content(blog): 첫 목공 작업기 발행"
git push -u origin content/first-woodworking-project
```

이후 GitHub에서 base를 `main`으로 지정해 PR을 만듭니다. 검증과 미리보기를 확인하고 Squash merge합니다.

### 10.3 작업 중 `main` 변경 반영

작업 브랜치에서 작업 상태를 정리한 다음 실행합니다.

```bash
git fetch origin
git merge origin/main
```

기본 동기화는 merge를 사용해 이미 push한 작업 브랜치의 이력을 다시 쓰지 않습니다. 충돌을 해결하면 해결 파일을 stage하고 merge를 완료한 뒤 빌드·화면 확인을 다시 수행합니다. 해당 merge를 취소하려면 진행 중에 `git merge --abort`를 사용합니다.

### 10.4 병합 후 정리

GitHub에서 PR 병합과 운영 배포를 확인하고, 원격 작업 브랜치를 삭제합니다. 이후 로컬을 갱신합니다.

```bash
git switch main
git pull --ff-only origin main
git fetch --prune
```

Squash merge는 작업 브랜치의 원래 커밋을 그대로 `main`에 합치지 않아 `git branch -d`가 미병합으로 판단할 수 있습니다. PR이 병합됐고 필요한 변경이 `main`에 있는지 확인한 뒤에만 로컬 브랜치를 삭제합니다.

```bash
# 위 조건을 확인한 경우에만 실행
git branch -D content/first-woodworking-project
```

새 작업에는 이전 브랜치를 재사용하지 않습니다. `git fetch --prune`은 사라진 원격 추적 참조를 정리하며 로컬 브랜치 자체를 삭제하지는 않습니다.

## 11. 긴급 수정과 되돌리기

### 11.1 긴급 수정

최신 `main`에서 `hotfix/<문제>`를 만들고 수정·빌드·PR·Squash merge 순서를 따릅니다. 긴급하더라도 빌드 확인과 변경 검토는 수행합니다. 미완성 기능 브랜치에 긴급 수정을 섞지 않습니다.

### 11.2 Git 이력으로 되돌리기

공유된 `main`을 `reset --hard`와 force push로 되돌리지 않습니다. 문제 PR의 Squash 커밋을 `revert`하는 새 PR을 만듭니다.

```bash
git switch main
git pull --ff-only origin main
git switch -c fix/revert-broken-change
git log --oneline -10
# 실제 대상 SHA로 바꿔 실행: git revert <문제_Squash_커밋_SHA>
```

대상 커밋을 선택해 revert한 후 빌드하고 PR로 병합합니다. 후속 커밋이 해당 변경에 의존한다면 단순 revert가 깨뜨리는 부분까지 확인합니다.

호스팅에서 이전 정상 배포로 긴급 복구했다면 Git의 문제 변경도 revert 또는 수정해 `main`과 운영 상태를 맞춥니다. 그렇지 않으면 다음 배포에서 문제가 재현될 수 있습니다.

### 11.3 태그

일상적인 글 발행마다 태그를 만들지는 않습니다. 첫 정식 공개나 큰 사이트 개편처럼 다시 찾을 기준점에만 `v0.1.0`, `v1.0.0` 같은 주석 태그를 사용합니다.

```bash
# 실제 운영 배포의 SHA를 확인한 후 그 커밋에 태그
# git tag -a v0.1.0 <정상_배포_SHA> -m "첫 공개 버전"
# git push origin v0.1.0
```

태그를 기존 이름으로 덮어쓰지 않습니다. 실제 배포 기록에는 태그 여부와 함께 커밋 SHA를 남깁니다.

## 12. 도입 순서

아래 항목은 이 문서를 따른 후속 작업 목록이며, 문서 작성 중 적용한 설정은 아닙니다.

- [ ] 현재 저장소의 공개 여부와 GitHub 보호 기능 사용 가능 여부 확인
- [ ] `main` + 작업 브랜치 + PR + Squash merge 규칙 채택
- [ ] 로컬·CI·Cloudflare Node 버전 통일
- [ ] `.env*` 등 제외 규칙 보완 및 추적 파일 확인
- [ ] PR 빌드용 GitHub Actions 구성
- [ ] 실제 검사 이름 확인 후 `main` 보호 규칙 적용
- [ ] Cloudflare Git 연동·운영 브랜치·빌드 루트 확인
- [ ] Preview 접근 범위 확인
- [ ] 다음 글을 `content/` 브랜치에서 작성해 발행 절차 수행
- [ ] 초안·예약 발행이 필요해지면 별도 기능으로 구현
- [ ] 이 문서도 Git으로 공유할 경우 `site/docs/`에 별도 반영

## 13. 참고 자료와 확인 범위

공식 문서 확인일: 2026-11-14. 서비스 동작과 기능 사용 범위는 아래 자료로 확인했으며, 구체적인 브랜치 이름·커밋 규칙·도입 순서는 본 프로젝트에 대한 제안입니다.

1. [GitHub Docs — GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
2. [GitHub Docs — About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
3. [Cloudflare Pages — Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
4. [Cloudflare Pages — GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)

로컬 확인 자료: `site/package.json`, `site/.gitignore`, `site/astro.config.mjs`, `site/src/content.config.ts`, 글 목록·상세·RSS 코드, Git 상태·브랜치·remote·로그, 기존 `report/free-blog-roadmap.md`.

export interface ReleaseItem {
  icon: string
  title: string
  body: string
}

export interface Release {
  /** Bump this to show the announcement again after the next release. */
  id: string
  items: readonly ReleaseItem[]
}

export const LATEST_RELEASE: Release = {
  id: '2026-11-20',
  items: [
    { icon: '⭐', title: '관심 종목', body: '별을 눌러 저장하고, 검색창 옆 별로 관심 종목만 모아 보세요.' },
    { icon: '🧮', title: '균등 배정 계산기', body: '종목 상세에서 필요 증거금, 예상 배정 주식수, 예상 손익을 계산해 보세요.' },
    { icon: '📈', title: '상장 후 주가', body: '시초가, 상장일 종가, 최근가와 공모가 대비 수익률을 보여드려요.' },
    { icon: '🔗', title: '링크 공유', body: '필터와 열어 둔 종목이 주소에 남아요. 그대로 공유할 수 있어요.' },
    { icon: '📱', title: '홈 화면에 추가', body: '앱처럼 설치해 쓰고, 오프라인에서도 마지막 데이터를 볼 수 있어요.' },
  ],
}

export function shouldShowRelease(seenId: string | null, release: Release): boolean {
  return seenId !== release.id
}

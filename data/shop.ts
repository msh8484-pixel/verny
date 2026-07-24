// 네이버 스마트스토어 연결 — 단일 소스.
// 구매 버튼은 전부 여기서 URL을 가져온다. 상품 URL만 바꾸면 사이트 전체 반영.
//
// 상품 2개: 낱개 양말(색상 옵션 포함) / 선물세트.
// 각 상품 페이지 URL을 네이버 스토어에서 복사해 아래 socks·giftSet에 넣으면
// 색상/세트 버튼이 해당 상품으로 바로 딥링크된다.
// (URL 미입력 시 스토어 홈으로 안전하게 연결)

export const STORE_URL = "https://smartstore.naver.com/coworkers";

// 세트·낱개를 구분하지 않고, 둘 다 보이는 스토어 홈으로 모든 구매 링크를 통일한다.
// (개별 상품 딥링크를 다시 쓰고 싶으면 buy 값만 해당 상품 URL로 바꾸면 됨)
export const SHOP = {
  store: STORE_URL,
  buy: STORE_URL,      // 대표 구매 링크 — 세트·낱개 모두 보이는 페이지
  socks: STORE_URL,    // (구분 없이 동일 페이지)
  giftSet: STORE_URL,  // (구분 없이 동일 페이지)
};

// 외부 링크 공통 속성 (새 탭 + 보안)
export const EXT = { target: "_blank" as const, rel: "noopener noreferrer" };

// VERNY 주문 웹훅 — 구글 시트 기록 + 메일 2곳 동시 발송
// 사용법: 주문 시트를 소유한 구글 계정으로 시트 열기 → 확장 프로그램 → Apps Script
//        → 기존 doPost 전체를 이 코드로 교체 → 저장
//        → 배포 → "배포 관리" → 연필(수정) → 버전: "새 버전" → 배포
// ⚠️ "새 배포"를 만들면 URL이 바뀌어 사이트 연결이 끊깁니다. 반드시 "배포 관리 → 수정 → 새 버전"으로.
//
// 기존 PDF(실행서) 버전과의 차이:
//  1) 사이트가 보내는 JSON 형식을 정상 파싱 (기존 e.parameter만 읽던 버그 수정 — 빈 행 방지)
//  2) 주문이 오면 아래 두 메일로 동시에 알림 발송
//  3) 시트 뒤쪽에 합계·입금자·주문번호·접수시각 열 추가 (앞 11열 택배 발주양식은 그대로 유지)

var NOTIFY_EMAILS = ['verny260701@gmail.com', 'heegeun84@gmail.com'];

function doPost(e) {
  try {
    // JSON(현재 사이트) / 폼 인코딩(구버전) 둘 다 지원
    var p = {};
    if (e && e.postData && e.postData.contents) {
      try { p = JSON.parse(e.postData.contents); } catch (err) { p = (e && e.parameter) || {}; }
    } else {
      p = (e && e.parameter) || {};
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheets()[0];
    if (sh.getLastRow() === 0) {
      sh.appendRow(['택배사','송장번호','발송인','발송인연락처','수취인명','수취인 연락처','주소','우편번호',
        '배송메세지','상품명','수량','합계','입금자','주문번호','접수시각']);
    }

    sh.appendRow([
      '', '',                                        // 택배사·송장번호(발송 시 기입)
      p.ordererName || p.senderName || '',
      p.ordererPhone || p.senderTel || '',
      p.recipient || p.rcpName || '',
      p.recipientPhone || p.rcpTel || '',
      p.address || p.addr || '',
      p.zip || '',
      p.message || p.msg || '',
      p.items || p.product || '',
      p.qty || '',
      p.total || '',
      p.receipt || '',
      p.ordNo || '',
      p.at || new Date(),
    ]);

    var subject = '[VERNY 주문] ' + (p.ordererName || p.senderName || '이름없음')
      + (p.total ? ' · ' + p.total : '');
    var body = p.detail || JSON.stringify(p, null, 2);
    NOTIFY_EMAILS.forEach(function (addr) {
      try { MailApp.sendEmail(addr, subject, body); } catch (err) {}
    });

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('err:' + err);
  }
}

/* =========================================================
   NHẬN RSVP VÀO GOOGLE SHEET
   =========================================================
   File này KHÔNG chạy cùng website — chỉ là bản gốc để copy.

   Cách dùng:
   1. Mở Google Sheet → Tiện ích mở rộng → Apps Script
   2. Xoá sạch nội dung file "Mã.gs", dán toàn bộ file này vào
   3. Ctrl + S để lưu
   4. Triển khai → Tuỳ chọn triển khai mới → loại "Ứng dụng web"
      · Thực thi với: Tôi
      · Ai có quyền truy cập: Bất kỳ ai        ← bắt buộc, không phải "Bất kỳ ai có Tài khoản Google"
   5. Copy URL kết thúc bằng /exec, dán vào config.form.endpoint trong script.js

   Lưu ý: mỗi lần sửa file này phải Triển khai lại (Quản lý các bản triển khai →
   biểu tượng bút chì → Phiên bản: Phiên bản mới → Triển khai), nếu không thì
   URL cũ vẫn chạy code cũ.
   ========================================================= */

// Đổi thành email bạn muốn nhận thông báo. Để "" nếu chỉ cần lưu vào sheet.
var EMAIL_NHAN_THONG_BAO = "vukhanhly0112@gmail.com";

function doPost(e) {
  // Hai khách bấm gửi cùng lúc có thể ghi đè lên nhau — khoá lại cho chắc
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var keys = Object.keys(data);

    // Lần gửi đầu tiên: tạo dòng tiêu đề cho bảng
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(keys);
      sheet.getRange(1, 1, 1, keys.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(
      keys.map(function (key) {
        return data[key];
      })
    );

    if (EMAIL_NHAN_THONG_BAO) {
      MailApp.sendEmail(
        EMAIL_NHAN_THONG_BAO,
        "[Tốt nghiệp] " + data["Họ tên"] + " - " + data["Tham dự"],
        keys
          .map(function (key) {
            return key + ": " + data[key];
          })
          .join("\n")
      );
    }

    return ContentService.createTextOutput("ok");
  } catch (error) {
    return ContentService.createTextOutput("error: " + error.message);
  } finally {
    lock.releaseLock();
  }
}

// Mở URL /exec bằng trình duyệt sẽ thấy dòng này → biết là đã deploy đúng
function doGet() {
  return ContentService.createTextOutput("RSVP endpoint dang hoat dong.");
}

// Bấm Chạy hàm này một lần để tự kiểm tra mà không cần mở website
function testThuMotDong() {
  doPost({
    postData: {
      contents: JSON.stringify({
        "Họ tên": "Nguyễn Văn Test",
        "Số điện thoại": "0912345678",
        "Tham dự": "Có, mình sẽ tham dự",
        "Lời nhắn": "Chúc mừng nhé!",
        "Gửi lúc": new Date().toLocaleString("vi-VN"),
      }),
    },
  });
}

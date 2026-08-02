# Graduation Invitation Website

Website thiệp mời tốt nghiệp dạng tĩnh (nền kem ivory + vàng đồng), phù hợp deploy bằng GitHub Pages, Netlify hoặc Vercel.

## Vì sao dùng HTML/CSS/JavaScript?

- Không cần backend hoặc build tool.
- Mở trực tiếp được bằng trình duyệt.
- Deploy miễn phí rất dễ trên GitHub Pages.
- Phù hợp cho thiệp mời cá nhân, form xác nhận và gallery ảnh.

## Có gì trong trang

| Phần | Mô tả |
| --- | --- |
| Preloader | Vạch vàng + đếm phần trăm, kéo màn hình lên khi tải xong |
| Thiệp mời (gate) | Phong bì 3D, con dấu sáp vỡ đôi, nắp lật, thiệp trượt ra, pháo giấy kim tuyến |
| Hero | Chữ tách từng ký tự bay lên, chữ script hiện dần theo kiểu vuốt, ảnh nền parallax |
| Thẻ buổi lễ | Kiểu thiệp cưới cổ điển: ngày lớn ở giữa, hai gạch ngang chạy qua "Tháng"/"Năm" |
| Nhạc nền | `music.mp3` phát khi khách mở thiệp, có nút loa cố định để bật/tắt |
| Đếm ngược | Ngày/giờ/phút/giây tới buổi lễ, số đổi có hiệu ứng mờ-nét |
| Thông tin | 3 thẻ nghiêng 3D theo chuột, có vệt sáng đi theo con trỏ |
| RSVP | Form xác nhận có kiểm tra dữ liệu, gửi online hoặc mở email |
| Gallery | Lưới ảnh không đều, lightbox có chuyển ảnh bằng phím/vuốt |
| Địa điểm | Bản đồ Google Maps nhúng ở cuối trang, kèm nút mở chỉ đường |
| Xuyên suốt | Con trỏ tuỳ chỉnh, nút nam châm, cuộn quán tính, lớp bụi vàng, hạt nhiễu (grain), aurora nền |

## Cách chỉnh thông tin

- Nội dung hiển thị: sửa trực tiếp trong `index.html`.
- Ngày giờ buổi lễ: sửa `config.ceremony` trong `script.js` (dùng cho cả đếm ngược lẫn file lịch `.ics`).
  Nhớ sửa cả phần chữ hiển thị trong `index.html` cho khớp.
- Địa chỉ trên nút "Chỉ đường": lấy từ `config.ceremony.mapQuery` (không có thì mới dùng `address`).
- Bản đồ nhúng ở mục "Địa điểm" (cuối trang): thay `src` của `iframe` trong `.map-card` bằng link Google Maps → Chia sẻ → Nhúng bản đồ.
- Email nhận xác nhận: sửa `contactEmail` trong `script.js`.
- Nhạc nền: thay file `music.mp3` ở cùng thư mục. Tinh chỉnh trong `config.music` (`script.js`):
  `enabled` (bật/tắt hẳn), `autoplay` (tự phát khi mở thiệp), `volume` (0–1).
- Nhận xác nhận RSVP: cấu hình `config.form` trong `script.js` — xem mục "Nhận RSVP về đâu" bên dưới.
- Ảnh nền/gallery: thay các link ảnh `images.unsplash.com` trong `index.html` và `styles.css` bằng ảnh của bạn.
- Bộ chữ: khai báo ở đầu `styles.css` (nhớ sửa cả link Google Fonts trong `index.html`).
  - `--display` Playfair Display: tiêu đề lớn, con số ngày/đếm ngược.
  - `--serif` Lora: thân bài. `--sans` Be Vietnam Pro: nhãn nhỏ, nút. `--script` Great Vibes: chữ viết tay.
  - Cả bốn đều có bảng dấu tiếng Việt vẽ riêng — đổi sang font khác thì kiểm tra chữ "ế", "ộ", "ữ" trước.
  - Playfair không có nét 300, nét mảnh nhất là 400.
- Màu sắc: sửa các biến ở đầu `styles.css`.
  - `--paper*`: các sắc nền kem.
  - `--gold-ink*`: vàng dùng làm **chữ trên nền sáng** — cố tình đậm để đủ tương phản.
    Đẩy sáng hơn nữa là chữ sẽ chìm vào nền.
  - `--gold`, `--gold-bright`: vàng trang trí và vàng dùng **trên các khối tối**.
  - `--dark`, `--dark-2`: khối tối làm điểm nhấn (RSVP, footer, icon thẻ thông tin).
- Bật/tắt hiệu ứng: sửa `config.effects` trong `script.js` — `preloader`, `smoothScroll`,
  `customCursor`, `ambient`, `magnetic`, `tilt`, `clickSpark`, `confetti`.
- Xem nhanh trang chính không cần mở thiệp: thêm `?preview=1` sau đường dẫn, ví dụ `index.html?preview=1`.

## Nhận RSVP về đâu

Trang là web tĩnh nên không tự gửi mail được — phải nhờ một dịch vụ trung gian nhận `POST`
rồi forward về cho bạn. Chọn **một** trong các cách dưới, sửa `config.form` trong `script.js`.
Chưa cấu hình gì thì trang tự mở app email của khách (khách phải bấm Gửi thêm lần nữa —
dễ rơi rụng, chỉ nên dùng tạm).

| Cách | Miễn phí | Nhận ở đâu | Cần gì |
| --- | --- | --- | --- |
| **Web3Forms** *(mặc định, dễ nhất)* | 250 lượt/tháng | Mail báo về ngay | Một access key, không cần tạo tài khoản |
| **Google Sheet** *(Apps Script)* | Không giới hạn | Bảng tính, tự cộng dồn thành danh sách khách | Dán ~10 dòng script, deploy 1 lần |
| **Formspree** | 50 lượt/tháng | Mail + bảng quản lý trên web | Tạo tài khoản |
| **Getform** | 50 lượt/tháng | Mail + bảng quản lý trên web | Tạo tài khoản |

### Cách 1 — Web3Forms

1. Vào <https://web3forms.com>, nhập email `vukhanhly0112@gmail.com`, bấm lấy access key.
2. Mở mail, copy access key.
3. Trong `script.js`:

```js
form: {
  provider: "web3forms",
  accessKey: "dán-access-key-vào-đây",
  endpoint: "",
},
```

### Cách 2 — Google Sheet (khuyên dùng nếu muốn danh sách khách)

1. Tạo Google Sheet mới → menu `Tiện ích mở rộng` → `Apps Script`.
2. Xoá sạch `Mã.gs`, dán toàn bộ nội dung file **`google-apps-script.gs`** trong thư mục này vào, `Ctrl + S`.
3. `Triển khai` → `Tuỳ chọn triển khai mới` → bấm bánh răng cạnh "Chọn loại" → **Ứng dụng web**,
   `Thực thi với: Tôi`, `Ai có quyền truy cập: **Bất kỳ ai**` (không phải "Bất kỳ ai có Tài khoản Google")
   → `Triển khai` → cấp quyền → copy URL kết thúc bằng `/exec`.
4. Trong `script.js`:

```js
form: {
  provider: "sheets",
  accessKey: "",
  endpoint: "https://script.google.com/macros/s/..../exec",
},
```

Lưu ý:

- Apps Script không trả header CORS nên trang gửi ở chế độ `no-cors` — dữ liệu vẫn
  sang tới nơi nhưng trình duyệt không đọc được phản hồi, tức là trang **không biết được**
  nếu script lỗi. Gửi thử một lượt sau khi deploy để chắc chắn dòng đã vào sheet.
- Mỗi lần sửa file `.gs` phải **triển khai lại** (`Quản lý các bản triển khai` → bút chì →
  `Phiên bản: Phiên bản mới`), nếu không URL cũ vẫn chạy code cũ.

### Cách 3 — Formspree / Getform

Tạo form trên <https://formspree.io> hoặc <https://getform.io>, copy URL endpoint rồi:

```js
form: {
  provider: "formspree", // hoặc "getform"
  accessKey: "",
  endpoint: "https://formspree.io/f/xxxxxxx",
},
```

Form có sẵn một ô ẩn `botcheck` làm bẫy spam: người thật không thấy, bot điền vào là
Web3Forms loại luôn.

## Hiệu năng & khả năng tiếp cận

- Con trỏ tuỳ chỉnh, cuộn quán tính, hiệu ứng nam châm và nghiêng 3D tự tắt trên thiết bị cảm ứng.
- Toàn bộ chuyển động tắt khi hệ điều hành bật "giảm chuyển động" (`prefers-reduced-motion`).
- Lớp bụi vàng vẽ ở 30fps bằng sprite dựng sẵn, không dùng `shadowBlur` cho từng hạt.
- Tránh `backdrop-filter` và `filter: blur()` trên các lớp lớn đang chuyển động.
- Các animation nền chỉ đổi `opacity`/`translate`. Tránh animate `scale` hay `mask-image`
  trên phần tử lớn vì trình duyệt phải raster lại cả lớp ở mỗi khung hình.
- Chữ đã được kiểm tra tương phản theo chuẩn WCAG AA.
- Bố cục điện thoại (≤620px) được nén lại riêng: thẻ thông tin nằm ngang, đếm ngược giữ 1 hàng,
  gallery xếp lưới 2 cột, chú thích ảnh luôn hiện vì màn cảm ứng không có hover.
- Liên hệ ở footer đi kèm icon và nhãn thay vì in nguyên đường link; Facebook nhúng thẳng vào icon.
- Trình duyệt chặn phát tiếng trước khi người dùng thao tác, nên nhạc chỉ bắt đầu từ cú bấm
  "Mở thiệp mời" (hoặc thao tác đầu tiên khi vào bằng `?preview=1`), rồi tăng âm dần thay vì bật đột ngột.
- Nhạc tự dừng khi khách chuyển sang tab khác và phát tiếp khi quay lại.

## Chạy thử

Mở file `index.html` trực tiếp trong trình duyệt, hoặc chạy server tĩnh:

```powershell
python -m http.server 8080
```

Sau đó vào:

```text
http://localhost:8080
```

## Deploy GitHub Pages

1. Tạo repository mới trên GitHub.
2. Upload `index.html`, `styles.css`, `script.js`, `music.mp3`, `README.md`.
3. Vào `Settings` -> `Pages`.
4. Chọn `Deploy from a branch`, branch `main`, folder `/root`.
5. GitHub sẽ tạo link dạng `https://username.github.io/repository-name/`.

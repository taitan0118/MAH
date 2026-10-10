# MAH - Missing App Home

App quản lý nhà trọ, chung cư mini, ký túc xá, homestay. Miễn phí, dữ liệu lưu trên máy, dùng được khi không có mạng.

## Chạy thử / cài nhanh (PWA, cần https hoặc localhost)
- `cd app && python3 -m http.server 8080` rồi mở http://localhost:8080
- Android Chrome: menu > Cài đặt ứng dụng. iPhone: Safari > Chia sẻ > Thêm vào MH chính. Mac Safari: Thêm vào Dock. Windows/Chrome/Edge: biểu tượng cài trên thanh địa chỉ.
- Đưa `app/` lên Netlify Drop / Cloudflare Pages / GitHub Pages để có https.

## Nhắc tiền
- SMS: mở sẵn tin nhắn, dùng được khi offline (cần SIM).
- Zalo: app chép sẵn tin nhắn rồi mở Zalo, cần mạng.

## Bộ cài (GitHub Actions)
1. Kho riêng `MAH` (mã nguồn), kho công khai `MAH-tai-ve` (chỉ chứa bản tải).
2. Secret `TAI_VE_TOKEN` (token fine-grained, Contents: Read and write, chỉ kho `MAH-tai-ve`).
3. Actions > Build MAH > Run workflow. Ra: MAH-Windows.exe, MAH-Mac-arm64/x64.dmg, MAH-Android.apk (debug), MAH-iOS-unsigned.ipa (cần sideload, nên dùng PWA cho iPhone).

## Sửa mã
Sửa trong `src/` rồi chạy `sh build.sh` (ghi ra `app/index.html`). Đổi code thì tăng `mah-vN` trong `app/sw.js`.

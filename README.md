# perekrestok-automation

1. Cài node.js
2. Config spreadsheet ở dòng 82-84 trong file index.js nếu cần
- spreadsheets id có thể tìm thấy ở đường link đến googlesheets document nơi mọi người đặt hàng, ví dụ https://docs.google.com/spreadsheets/d/1zq-9FEE1ctuqR1zRGHDZeUxPOvr2jhfsTnUtgpUvqqU/edit#gid=0 thì id là 1zq-9FEE1ctuqR1zRGHDZeUxPOvr2jhfsTnUtgpUvqqU
- range để nguyên nếu đúng format cột/hàng như link trên (yêu cầu: cột 2 tên hàng, cột 4 số lượng, cột 5 link đến mặt hàng)
3. Mở command line trong folder mới tải về (folder chứa file index.js) (shift + chuột phải -> open cmd/powershell here
-> chạy lệnh "node install" để cài đặt thư viện
-> chạy lệnh node index.js" để chạy script
Lần đầu chạy có thể phải authorize theo hướng dẫn, sau đấy chạy lại "node index.js"
4. Kiểm tra lại số lượng mặt hàng:
- nếu đúng ấn enter
- nếu sai gõ 1 chuỗi bất kì rồi ấn enter, chương trình sẽ dừng chạy, khi đó kiểm tra lại cài đặt spreadsheet ở bước 2
5. Chương trình sẽ lần lượt đặt theo danh sách
Chú ý: trong toàn bộ quá trình đặt, không được tắt cửa sổ cmd
6. Sau khi toàn bộ mặt hàng đã trong giỏ hàng, kiểm tra lại qua cửa sổ web và thêm địa chỉ giao hàng

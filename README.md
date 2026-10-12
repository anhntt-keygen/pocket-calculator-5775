# Pocket Calculator - Ứng dụng Máy tính cầm tay bỏ túi Chuyên nghiệp

Ứng dụng máy tính cầm tay bỏ túi trực quan, chính xác cao và tối ưu trải nghiệm người dùng trên cả máy tính lẫn thiết bị di động.

## 🎯 1. Kịch bản Nghiệp vụ Đã triển khai
*   **[SC-01] Thực hiện phép tính cơ bản:** Hỗ trợ cộng, trừ, nhân, chia với cơ chế xử lý số thập phân chính xác tuyệt đối (tránh lỗi `0.1 + 0.2 = 0.30000000000000004` của JavaScript).
*   **[SC-02] Xử lý ngoại lệ & Edge Cases:** Chặn nhập nhiều dấu chấm thập phân, hiển thị thông báo lỗi rõ ràng khi chia cho 0 (`Error: Division by zero`), tự động co dãn kích thước chữ khi số quá dài tránh tràn màn hình.
*   **[SC-03] Tính năng nâng cao & Bộ nhớ:** Hỗ trợ các phím đổi dấu (`+/-`), tính phần trăm (`%`), xóa ký tự cuối (`DEL`), xóa toàn bộ (`AC`), và lưu giữ lịch sử 10 phép tính gần nhất vào `localStorage`.
*   **[SC-04] Responsive UI & Hỗ trợ phím cứng:** Giao diện Neumorphism hiện đại mô phỏng máy tính vật lý thật, tự co dãn trên mobile. Cho phép người dùng gõ trực tiếp từ bàn phím máy tính.

## 🛠️ 2. Hướng dẫn Cài đặt & Chạy ứng dụng

### Bước 1: Khởi tạo và Cài đặt các gói phụ thuộc (Dependencies)
Cần cài đặt Node.js trên máy tính của bạn, sau đó chạy các lệnh sau:
```bash
npm install
```

### Bước 2: Khởi chạy Server Phát triển (Development Server)
Khởi chạy ứng dụng cục bộ ngay lập tức:
```bash
npm start
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

### Bước 3: Chạy Kiểm thử Tự động (Playwright Testing)
Bộ kiểm thử tự động toàn diện được tích hợp sẵn để kiểm tra độ tin cậy của ứng dụng:
```bash
npm test
```

## 📂 3. Cấu trúc Thư mục Dự án
```text
pocket-calculator/
├── package.json
├── server.js
├── README.md
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── tests/
    └── calculator.spec.js
```
```

---
# KSL Admin System - Simple, Your Voice

## 🌟 Giới thiệu
**KSL Admin** là hệ quản trị cho nền tảng học tập Ngôn ngữ Ký hiệu (KSL). Hệ thống được xây dựng nhằm tối ưu hóa quy trình quản lý nội dung số, giúp người quản trị dễ dàng cập nhật dữ liệu học tập và theo dõi tương tác của người dùng.

## 🚀 Tính năng chính
- **📊 Dashboard**: Thống kê thông minh về dữ liệu học tập và tăng trưởng người dùng.
- **📚 Quản lý Cơ sở dữ liệu học tập**:
  - **Chủ đề (Topic)**: Phân loại nội dung theo cấp độ và danh mục trực quan.
  - **Từ vựng (Word)**: Quản lý từ vựng đa phương tiện (Video, GIF, Image). Tích hợp chế độ xem trước (Preview) và tính điểm kinh nghiệm (EXP).
  - **Ngân hàng câu hỏi (Question)**: 
    - Đa dạng loại câu hỏi: Trắc nghiệm, Tự luận, Nhận diện ký hiệu.
    - Tích hợp Media vào cả câu hỏi và từng đáp án.
    - Cấu hình độ khó (Dễ/Trung bình/Khó), điểm số và thời gian làm bài.
  - **Kỳ thi (Exam)**: Thiết lập cấu trúc bài thi, thời gian bắt đầu và kết thúc thuận tiện.
- **👥 Quản trị Người dùng**: Quản lý danh sách, phân quyền và lịch sử hoạt động của thành viên.
- **💬 Quản lý Feedback**: Hệ thống tiếp nhận và xử lý phản hồi giúp cải thiện trải nghiệm người dùng.
- **🛠️ Công cụ hỗ trợ**:
  - Tích hợp tải ảnh trực tiếp lên **ImgBB**.
  - Hệ thống lọc (Filter) và tìm kiếm (Search) tối ưu cho dữ liệu lớn.
  - Giao diện thân thiện, responsive hoàn toàn.

## ⚙️ Cơ chế hoạt động
- **Xác thực (Authentication)**: 
  - Sử dụng Token-base (JWT) lưu trữ tại `localStorage`.
  - Hệ thống kiểm soát quyền hạn nghiêm ngặt: Chỉ các tài khoản có `role: admin` mới được phép truy cập Dashboard.
  - Tự động điều hướng và bảo vệ các tuyến đường (Protected Routes).
- **Giao diện & Chuyển cảnh**:
  - Tích hợp **SplashScreen** khi khởi chạy ứng dụng tạo cảm giác chuyên nghiệp.
  - Sử dụng Layout Split với **Sidebar** cố định giúp điều hướng nhanh chóng giữa các phân hệ.

## 🛠️ Công nghệ sử dụng
- **Cốt lõi**: [React 19](https://react.dev/) (Modern Component Architecture)
- **Công cụ build**: [Vite](https://vitejs.dev/) - Tối ưu tốc độ phát triển.
- **Điều hướng**: [React Router Dom v7](https://reactrouter.com/) (Data APIs ready).
- **Xử lý API**: [Axios](https://axios-http.com/) với hệ thống Interceptor quản lý token tự động.
- **Giao diện**: 
  - [Lucide React](https://lucide.dev/) cho hệ thống icon đồng bộ.
  - Hệ thống **Custom UI Library**: Tự xây dựng DataTable, Modals, SplashScreen chuyên sâu.
- **Media**: Tích hợp YouTube Embed và HTML5 Video/Image preview.

## 📥 Cài đặt và Khởi chạy

### Yêu cầu
- Node.js >= 18.x
- npm

### Các bước thực hiện
1. **Clone project:**
   ```bash
   git clone https://github.com/TuanKiet1774/KSL_Admin.git
   cd KSL_Admin
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env` tại thư mục gốc và cấu hình API:
   ```env
   VITE_API_URL=your_api_url_here
   VITE_IMGBB_API_KEY=your_key_here
   ```

4. **Chạy ứng dụng (Development):**
   ```bash
   npm run dev
   ```

## 📂 Cấu trúc dự án
- `src/components`: Chứa hơn 15+ UI Components tùy chỉnh (DataTable, Modals, Forms...).
- `src/pages`: Toàn bộ logic giao diện của các phân hệ quản trị.
- `src/services`: Đóng gói các lớp dịch vụ gọi API (User, Word, Topic, Question...).
- `src/config`: Quản lý cấu hình Axios và biến môi trường.
- `src/utils`: Các hàm xử lý ảnh (upload), xử lý media (YouTube) và định dạng dữ liệu.

## 🔗 Tham khảo kiến thức
- **Từ điển ngôn ngữ ký hiệu**: [tudienngonngukyhieu.com](https://tudienngonngukyhieu.com/)
- **Em và Em**: [YouTube @ememem33](https://www.youtube.com/@ememem33)

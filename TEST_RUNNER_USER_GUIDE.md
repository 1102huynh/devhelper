# Run Test Tab - User Guide

## Tổng quan
Tab "Run Test" trong công cụ Jacoco Runner cho phép bạn chạy các test suite từ Maven project. Bạn có thể chọn một hoặc nhiều test suite để chạy cùng lúc.

## Tính năng chính

### 1. Chọn Project
- Chọn project từ dropdown list
- Danh sách hiển thị tất cả các project đã load từ tab "Projects"
- Khi chọn project, hệ thống tự động scan và load các test suite có sẵn

### 2. Danh sách Test Suites
Sau khi chọn project, hệ thống sẽ hiển thị:
- **Tên test suite**: Tên file test (không có .java)
- **Type badge**: 
  - 🟢 `junit` - JUnit test classes
  - 🟣 `cucumber` - Cucumber feature files
- **Class name**: Đầy đủ package và class name

#### Các loại test được detect:
- JUnit: Files kết thúc với `Test.java`, `Tests.java`, `IT.java`
- Cucumber: Files `.feature` trong thư mục features

### 3. Chọn Test Suites
Có nhiều cách để chọn:

#### Click vào từng suite
- Click vào bất kỳ test suite nào để toggle selection
- Suite được chọn sẽ có:
  - ✓ Checkbox màu xanh
  - Background màu xanh nhạt
  - Border màu xanh

#### Nút "All"
- Click "All" để chọn tất cả test suites
- Nhanh chóng khi muốn chạy full test

#### Nút "Clear"
- Click "Clear" để bỏ chọn tất cả
- Reset về trạng thái không chọn gì

### 4. Selection Counter
Badge hiển thị số lượng:
```
3/10
```
- 3: Số suite đã chọn
- 10: Tổng số suite có sẵn

### 5. Custom Command (Optional)
- Input field cho phép nhập lệnh tùy chỉnh
- Mặc định: `mvn test`
- Click vào badge để chọn nhanh:
  - `mvn test`
  - `mvn clean test`
  - `npm test`

**Lưu ý**: Nếu có test suite được chọn, custom command sẽ bị override.

### 6. Chạy Tests

#### Khi có test suite được chọn:
Hệ thống tự động build Maven command:
```bash
mvn test -Dtest=TestClass1,TestClass2,TestClass3
```

#### Khi không chọn suite nào:
Sử dụng command từ "Custom Command" field

#### Quá trình thực thi:
1. Click "Start Execution"
2. Button chuyển sang trạng thái "Running Tests..."
3. Terminal bên phải hiển thị log real-time
4. Badge "Live" màu xanh xuất hiện (với icon quay)
5. Log update mỗi giây
6. Khi hoàn thành, notification hiện "Test execution finished"

## Giao diện Terminal

### Header
- 🔴 🟡 🟢 Mac-style window controls
- Terminal prompt: `test-runner@{projectName}:~`
- Badge "Live" khi đang chạy test
- Icon Copy: Copy toàn bộ log
- Icon Trash: Clear log

### Content Area
- Background đen (#1e1e1e)
- Font mono-space
- Auto-scroll khi có log mới
- Scrollbar custom (thin style)
- Hiển thị icon terminal khi chưa có log

### Actions
- **Copy**: Copy log vào clipboard
- **Clear**: Xóa log hiện tại
- Notification confirm khi thực hiện action

## Workflow thực tế

### Ví dụ 1: Chạy một test cụ thể
```
1. Select project: "my-backend-project"
2. Tìm suite: "UserServiceTest"
3. Click vào "UserServiceTest" để chọn
4. Click "Start Execution"
→ Chạy: mvn test -Dtest=UserServiceTest
```

### Ví dụ 2: Chạy tất cả Integration Tests
```
1. Select project: "my-backend-project"
2. Click "All" để chọn tất cả
3. Click "Start Execution"
→ Chạy: mvn test -Dtest=UserIT,OrderIT,PaymentIT,...
```

### Ví dụ 3: Chạy nhiều suite cụ thể
```
1. Select project: "my-backend-project"
2. Click chọn: "UserServiceTest"
3. Click chọn: "OrderServiceTest"
4. Click chọn: "PaymentServiceTest"
5. Click "Start Execution"
→ Chạy: mvn test -Dtest=UserServiceTest,OrderServiceTest,PaymentServiceTest
```

### Ví dụ 4: Chạy custom command
```
1. Select project: "my-backend-project"
2. KHÔNG chọn suite nào (Clear nếu có)
3. Nhập command: "mvn clean test -Dmaven.test.failure.ignore=true"
4. Click "Start Execution"
→ Chạy: mvn clean test -Dmaven.test.failure.ignore=true
```

## Tips & Tricks

### 1. Nhanh chóng select/deselect
- Double-click suite name = toggle selection
- Shift + Click (planned) = range selection

### 2. Filter test suites (planned)
- Search box sẽ được thêm để lọc suite theo tên

### 3. Save favorite combinations (planned)
- Lưu các tổ hợp test suite thường dùng

### 4. Test history (planned)
- Xem lại các lần chạy test trước đó

## Troubleshooting

### Không thấy test suite
**Nguyên nhân:**
- Project không có test
- Cấu trúc thư mục không đúng Maven standard

**Giải pháp:**
- Kiểm tra thư mục `src/test/java` tồn tại
- Kiểm tra file test có đúng naming convention

### Test không chạy
**Nguyên nhân:**
- Maven không cài đặt
- Project chưa compile

**Giải pháp:**
- Build project trước: Tab Projects → Click "Build Maven"
- Kiểm tra Maven PATH

### Log không hiển thị
**Nguyên nhân:**
- Backend chưa khởi động
- Network issue

**Giải pháp:**
- Kiểm tra backend running tại localhost:8080
- Refresh trang và thử lại

## Keyboard Shortcuts (planned)

- `Ctrl + A`: Select all suites
- `Ctrl + D`: Clear all selections
- `Ctrl + Enter`: Start execution
- `Ctrl + C`: Copy log
- `Ctrl + L`: Clear log

## API Endpoints

Backend sử dụng các endpoints:

```
GET  /api/test/suites?projectPath={path}
POST /api/test/run
GET  /api/test/log?projectPath={path}
GET  /api/test/status?projectPath={path}
```

## Giới hạn hiện tại

- Chỉ support Maven project
- Timeout: 30 phút
- Không có pause/stop test đang chạy
- Không save test results vào database

## Kế hoạch phát triển

- [ ] Support Gradle projects
- [ ] Support npm/Jest tests  
- [ ] Stop running test
- [ ] Test result visualization (graphs, charts)
- [ ] Save test history
- [ ] Export test reports
- [ ] Email notification khi test xong
- [ ] Parallel test execution
- [ ] Test coverage integration with Jacoco


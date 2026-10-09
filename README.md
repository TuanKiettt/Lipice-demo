# Lipice Scroll Demo

Ứng dụng React, TypeScript và Vite cho quy trình tạo thiệp mời.

## Chạy dự án

```bash
npm install
npm run dev
```

## Redux Toolkit trong dự án

Redux Toolkit (RTK) là cách được khuyến nghị để quản lý Redux hiện đại. Store được cấu hình tại [src/store/index.ts](./src/store/index.ts), còn các hook có kiểu TypeScript ở [src/store/hooks.ts](./src/store/hooks.ts). `Provider` cung cấp store cho toàn bộ ứng dụng trong [src/main.tsx](./src/main.tsx). State được chia theo tính năng:

- [src/store/workflowSlice.ts](./src/store/workflowSlice.ts): bước hiện tại và ảnh đã xác nhận, dùng giữa `App`, `StepCapture` và `StepFormCard`.
- [src/store/authSlice.ts](./src/store/authSlice.ts): trạng thái xác thực, tab đăng nhập/đăng ký, trạng thái gửi form và thông báo lỗi/thành công của hai form.
- [src/store/captureSlice.ts](./src/store/captureSlice.ts): màn hình chụp hiện tại, nguồn ảnh, trạng thái mở camera/upload và lỗi capture.

Component đọc state bằng selector và cập nhật bằng action:

```tsx
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setStep } from "./store/workflowSlice";

const dispatch = useAppDispatch();
const step = useAppSelector((state) => state.workflow.step);

dispatch(setStep(3));
```

`useSupabaseSession` đồng bộ trạng thái đăng nhập vào Redux nhưng không đưa đối tượng session/token vào store. Countdown, `MediaStream`, ảnh chưa xác nhận và giá trị/validation của input vẫn do component hoặc React Hook Form quản lý: đó là dữ liệu tạm thời, gắn với một màn hình, không cần chia sẻ toàn ứng dụng.

## Luồng tạo thiệp bằng AI

Sau khi `StepCapture` tải ảnh lên Storage, URL được lưu vào workflow state. Nút **TẠO THIỆP NGAY** trong `StepFormCard` dispatch `generateInvitation`: thunk gọi `private/create_service` với `service: "hub"`, `realtime: true` và dữ liệu prompt; sau đó đăng ký Realtime trên bảng `public.service` và gọi `private/read_service` một lần để không bỏ lỡ kết quả đến sớm. Khi worker AI cập nhật bản ghi bằng `private/update_service`, ứng dụng lấy URL media từ `response`, rồi chuyển sang `StepResult`. `StepResult` phát video khi URL là MP4/WebM/OGG/MOV, nếu không thì hiển thị như ảnh; video có thể được tải xuống bằng nút **Tải video**. Tải qua trình duyệt cần server media cho phép CORS.

Backend cần trả về `id` từ `create_service`, cho phép Realtime đọc các thay đổi của service, và worker phải ghi trạng thái/kết quả ảnh vào `service.response` qua `update_service`. Client hiện chờ tối đa 200 giây; lỗi endpoint, Realtime, trạng thái service hoặc thiếu URL kết quả sẽ được hiển thị trên màn hình thay vì chuyển sang trang kết quả giả.

Khi debug luồng AI, mở DevTools → Console và lọc theo `[AI invitation]`. Log ghi giai đoạn lỗi, endpoint/status HTTP hoặc trạng thái Realtime và service ID; không ghi access token hay dữ liệu ảnh.

## Redux Toolkit và state React thông thường

| | `useState` / props | Redux Toolkit |
| --- | --- | --- |
| Phạm vi | Một component; chia sẻ qua props và component cha | Store dùng chung cho nhiều nhánh component |
| Cập nhật | Gọi setter trực tiếp | `dispatch(action)`; reducer mô tả thay đổi state |
| Boilerplate | Ít, hợp với state cục bộ | RTK tự tạo action/reducer bằng `createSlice`, cấu hình store an toàn hơn Redux cũ |
| Theo dõi | Dễ theo dõi tại component sở hữu state | Redux DevTools cho phép quan sát state và action tập trung |
| Nên dùng khi | State giao diện nhỏ, cục bộ, ít nơi cần đến | State dùng chung giữa nhiều component hoặc cần luồng cập nhật tập trung |

Trong dự án này, Redux tập trung state quy trình, xác thực và capture được nhiều phần giao diện sử dụng; component không cần truyền các giá trị đó lòng vòng qua props. State chỉ phục vụ một component vẫn để cục bộ để tránh phức tạp hóa không cần thiết.

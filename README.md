
# React 19 Base Project

## Sơ đồ cấu trúc thư mục dự án

```
my-react-app-project-2025/
├── public/                          # Các tệp tĩnh (favicon, index.html, manifest.json)
│
├── src/                             # Mã nguồn chính
│   ├── assets/                      # Ảnh, font, icons, CSS, SCSS...
│   │
│   ├── components/                  # Các component dùng chung
│   │   ├── ui/                      # Component UI (Button, Modal, Input...)
│   │   └── layout/                  # Layout (Navbar, Sidebar, Footer...)
│   │
│   ├── hooks/                       # Custom hooks (useAuth, useTheme...)
│   │
│   ├── utils/                       # Hàm tiện ích (formatDate, debounce...)
│   │
│   ├── pages/                       # Các trang (Home, About, Dashboard...)
│   │   ├── Home/                    # Trang Home
│   │   ├── About/                   # Trang About
│   │   └── Dashboard/               # Trang Dashboard
│   │
│   ├── store/                       # Quản lý state (Redux, Zustand...)
│   │   ├── slices/                  # Các Redux Slice (authSlice, userSlice...)
│   │   └── index.ts                 # Combine reducers
│   │
│   ├── routes/                      # Cấu hình Router
│   │   ├── privateRoutes.ts         # Route yêu cầu đăng nhập
│   │   ├── publicRoutes.ts          # Route không yêu cầu đăng nhập
│   │   └── index.tsx                # App Router chính
│   │
│   ├── services/                    # Gọi API (Axios, Fetch...)
│   │   ├── authService.ts           # Service xác thực
│   │   └── userService.ts           # Service người dùng
│   │
│   ├── config/                      # Cấu hình chung
│   │   ├── axios.ts                 # Cấu hình Axios
│   │   ├── env.ts                   # Load biến môi trường
│   │   └── theme.ts                 # Dark/Light Theme config
│   │
│   ├── types/                       # Định nghĩa TypeScript types
│   │   ├── user.ts                  # Kiểu dữ liệu User
│   │   └── auth.ts                  # Kiểu dữ liệu Auth
│   │
│   ├── App.tsx                      # Component gốc của ứng dụng
│   └── main.tsx                     # Entry point để render App
│
├── .env                             # Biến môi trường
├── tsconfig.json                    # Cấu hình TypeScript
├── tailwind.config.js               # Cấu hình Tailwind CSS
├── vite.config.ts                   # Cấu hình Vite
├── package.json                     # Danh sách dependencies
└── README.md                        # Tài liệu dự án
```

## Các thư viện sử dụng trong dự án

- **React 19**: Thư viện xây dựng UI
- **TypeScript**: Ngôn ngữ lập trình kiểu tĩnh
- **Vite**: Công cụ build siêu nhanh cho frontend
- **Tailwind CSS**: Framework CSS tiện dụng
- **react-router-dom**: Routing cho SPA
- **@reduxjs/toolkit, react-redux**: Quản lý state với Redux
- **axios**: Gọi API
- **i18next, react-i18next**: Đa ngôn ngữ
- **Jest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event**: Unit test & UI test
- **Husky, lint-staged**: Kiểm tra code trước khi commit
- **Prettier**: Định dạng code tự động
- **ESLint, eslint-config-prettier, eslint-plugin-react, eslint-plugin-import**: Kiểm tra chuẩn code
- **Yarn**: Trình quản lý package

## Hướng dẫn sử dụng

```sh
yarn install
yarn dev
```

## Lint & Format

```sh
yarn lint
yarn format
```

## Test

```sh
yarn test
```

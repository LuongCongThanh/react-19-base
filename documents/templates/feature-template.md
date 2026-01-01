# 📋 Feature Template

Template checklist và cấu trúc cho feature mới.

## 📋 Checklist

- [ ] Tạo cấu trúc thư mục
- [ ] Tạo types
- [ ] Tạo API files
- [ ] Tạo query keys
- [ ] Tạo hooks
- [ ] Tạo validators
- [ ] Tạo components
- [ ] Tạo pages
- [ ] Tạo routes
- [ ] Viết tests
- [ ] Code đã được lint
- [ ] Type check pass

---

## Cấu trúc Feature

```
features/<feature-name>/
├── api/
│   └── <action>.api.ts
├── pages/
│   └── <Name>Page.tsx
├── components/
│   └── <Name>.tsx
├── hooks/
│   └── use<Name>.ts
├── stores/
│   └── <name>.store.ts
├── types/
│   └── <name>.types.ts
├── validators/
│   └── <name>.schema.ts
├── utils/
│   └── <name>.utils.ts
├── constants/
│   └── <name>-query-keys.constants.ts
└── <feature>.routes.tsx
```

---

## Quick Start

1. Tạo cấu trúc thư mục
2. Copy templates từ [Code Examples](code-examples.md)
3. Customize theo nhu cầu
4. Viết tests
5. Review code

---

**Xem chi tiết**: [Creating a Feature](../guides/creating-feature.md)

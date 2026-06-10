// PostCSS chạy Tailwind và Autoprefixer khi build CSS
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // tự thêm vendor prefix cho các CSS property cũ
  },
};

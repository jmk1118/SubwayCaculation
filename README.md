# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Subway Data Rules

### 1호선 분기 구조

`public/data/line1.json`은 아래 분기 구간을 포함합니다.

- 경원선: `연천 -> ... -> 청량리`
- 경인선: `구로 -> ... -> 인천`
- 경부선: `구로 -> ... -> 병점 -> ... -> 천안`
- 장항선: `천안 -> ... -> 신창`
- 서동탄 지선: `병점 <-> 서동탄`

### 노드 포맷

각 역 노드는 아래 형태를 따릅니다.

- `id`: `역명_호선번호` (예: `가산디지털단지_1`)
- `name`: 역명
- `line`: 호선명 (예: `1호선`)
- `neighbors`: 인접 역 ID + 환승 역 ID

### 환승 규칙

- 같은 역명이 다른 노선에 존재하면 환승 노드로 연결합니다.
- 환승 연결은 양방향이어야 합니다.
- 예: `가산디지털단지_1 <-> 가산디지털단지_7`, `수원_1 <-> 수원_분당`

### 무결성 규칙

- `neighbors`에 있는 모든 ID는 실제 존재해야 합니다.
- 선로 연결과 환승 연결 모두 양방향이어야 합니다.

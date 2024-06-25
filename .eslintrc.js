module.exports = {
  env: {
    // node.js에서 console과 같은 전역변수 사용 여부
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'linebreak-style': ['off', 'unix'], // "off"와 "unix"를 함께 사용하여 모든 줄 바꿈 스타일 무시
  },
  ignorePatterns: ['node_modules/', 'src/productImages/', '.env'],
};

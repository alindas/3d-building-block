module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    'plugin:react/jsx-runtime'
  ],
  "overrides": [
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "no-unused-vars": "off",
    "no-inner-declarations": "off", // 不在条件分支内声明函数
    "prefer-const": "off", // const 建议
    "no-irregular-whitespace": "off", // 不规则空白
    "@typescript-eslint/no-unused-vars": ["off"],
    "@typescript-eslint/no-empty-function": ['off'],
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/no-non-null-assertion": ['off'],
    "@typescript-eslint/ban-ts-comment": ['off'], // @ts-ignore 注释
    "react/prop-types": "off"
  },
  "settings": {
    react: {
      version: 'detect'
    }
  }
}

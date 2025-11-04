import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    globalIgnores(['dist', 'node_modules', 'coverage', 'build']),
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        plugins: {
            'unused-imports': unusedImports,
        },
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
            prettier,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            // TypeScript 规则
            '@typescript-eslint/no-unused-vars': [
                'error', // 改为错误级别，确保检测到未使用变量
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    args: 'after-used',
                    vars: 'all',
                    caughtErrors: 'none',
                },
            ],
            // 更精确的未使用表达式检测，允许常见的短路与可选链写法
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true,
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-function': 'warn',

            // 未使用导入和变量检测
            'unused-imports/no-unused-imports': 'error',
            // 与 TS 的 no-unused-vars 协调，降低重复报错为警告
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],

            // 变量和函数声明检测
            // 使用TypeScript时关闭no-undef，由TS类型系统负责未定义检测
            'no-undef': 'off',
            'no-use-before-define': 'off', // 关闭JS版本
            '@typescript-eslint/no-use-before-define': [
                'error',
                {
                    functions: false,
                    classes: true,
                    variables: true,
                },
            ],

            // React 规则
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

            // 通用规则
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-duplicate-imports': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    // 测试文件特殊配置
    {
        files: [
            '**/*.test.{ts,tsx,js,jsx}',
            '**/test/**/*.{ts,tsx,js,jsx}',
            '**/tests/**/*.{ts,tsx,js,jsx}',
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                global: 'writable',
            },
        },
    },
])

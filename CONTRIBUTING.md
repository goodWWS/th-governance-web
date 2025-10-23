# 贡献指南

感谢您对本项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复或新功能

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### 本地开发设置

1. **Fork 并克隆项目**

```bash
git clone https://github.com/your-username/high-quality-react-app.git
cd high-quality-react-app
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run dev
```

4. **运行测试**

```bash
npm run test
```

## 开发流程

### 分支管理

- `main` - 主分支，包含稳定的生产代码
- `develop` - 开发分支，包含最新的开发代码
- `feature/*` - 功能分支，用于开发新功能
- `bugfix/*` - 修复分支，用于修复 Bug
- `hotfix/*` - 热修复分支，用于紧急修复

### 提交流程

1. **创建分支**

```bash
# 功能开发
git checkout -b feature/your-feature-name

# Bug 修复
git checkout -b bugfix/your-bug-fix

# 热修复
git checkout -b hotfix/your-hotfix
```

2. **开发和测试**

- 编写代码
- 添加或更新测试
- 确保所有测试通过
- 遵循代码规范

3. **提交代码**

```bash
git add .
git commit -m "feat: add new feature"
```

4. **推送分支**

```bash
git push origin feature/your-feature-name
```

5. **创建 Pull Request**

- 在 GitHub 上创建 Pull Request
- 填写详细的描述
- 等待代码审查

## 代码规范

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响代码运行）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(auth): add user login functionality
fix(api): resolve timeout issue in user service
docs: update installation guide
style: format code with prettier
refactor(utils): simplify date formatting function
```

### 代码风格

项目使用以下工具确保代码质量：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查

在提交前，请确保：

```bash
# 检查代码质量
npm run lint

# 自动修复可修复的问题
npm run lint:fix

# 格式化代码
npm run format

# 类型检查
npm run type-check
```

### TypeScript 规范

1. **使用严格的类型定义**

```typescript
// ✅ 好的做法
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

// ❌ 避免使用 any
const user: any = getUserData()
```

2. **为组件定义 Props 接口**

```typescript
// ✅ 好的做法
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  onClick: () => void
  children: React.ReactNode
}

const Button: FC<ButtonProps> = ({ variant, size = 'medium', onClick, children }) => {
  // 组件实现
}
```

3. **使用路径别名**

```typescript
// ✅ 使用路径别名
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

// ❌ 避免相对路径
import { Button } from '../../../components/Button'
```

### React 组件规范

1. **使用函数组件和 Hooks**

```typescript
// ✅ 推荐的函数组件写法
import React, { useState, useEffect } from 'react'
import type { FC } from 'react'

interface Props {
  initialCount?: number
}

const Counter: FC<Props> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    document.title = `Count: ${count}`
  }, [count])

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

export default Counter
```

2. **组件文件结构**

```
components/
├── Button/
│   ├── index.ts          # 导出文件
│   ├── Button.tsx        # 主组件
│   ├── Button.test.tsx   # 测试文件
│   └── Button.stories.tsx # Storybook 故事
```

## 测试指南

### 单元测试

使用 Jest 和 React Testing Library：

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 集成测试

测试组件之间的交互：

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserProfile } from './UserProfile'

describe('UserProfile Integration', () => {
  it('loads and displays user data', async () => {
    render(<UserProfile userId="123" />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
```

## 文档规范

### 组件文档

每个组件都应该包含详细的文档：

```typescript
/**
 * Button 组件
 * 
 * @description 通用按钮组件，支持多种样式和尺寸
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="large" onClick={handleClick}>
 *   点击我
 * </Button>
 * ```
 */
interface ButtonProps {
  /** 按钮样式变体 */
  variant: 'primary' | 'secondary' | 'danger'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 点击事件处理函数 */
  onClick: () => void
  /** 按钮内容 */
  children: React.ReactNode
}
```

### API 文档

使用 JSDoc 注释：

```typescript
/**
 * 获取用户信息
 * 
 * @param userId - 用户 ID
 * @returns Promise<User> 用户信息
 * 
 * @throws {ApiError} 当用户不存在时抛出错误
 * 
 * @example
 * ```typescript
 * const user = await getUserById('123')
 * console.log(user.name)
 * ```
 */
export async function getUserById(userId: string): Promise<User> {
  // 实现
}
```

## Pull Request 指南

### PR 标题

使用清晰、描述性的标题：

```
feat(auth): implement OAuth2 login flow
fix(ui): resolve button alignment issue in mobile view
docs: update API documentation for user endpoints
```

### PR 描述模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他

## 变更描述
简要描述本次变更的内容和原因。

## 测试
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 手动测试已完成

## 截图（如适用）
如果有 UI 变更，请提供截图。

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加必要的测试
- [ ] 文档已更新
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告
```

## 发布流程

### 版本号规范

遵循 [Semantic Versioning](https://semver.org/)：

- `MAJOR.MINOR.PATCH`
- `1.0.0` - 主版本号（不兼容的 API 修改）
- `1.1.0` - 次版本号（向下兼容的功能性新增）
- `1.1.1` - 修订号（向下兼容的问题修正）

### 发布步骤

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 Git 标签
4. 发布到 npm（如适用）

## 社区准则

### 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境。请遵循以下准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 获取帮助

如果您需要帮助，可以通过以下方式：

- 创建 Issue 描述问题
- 在 Discussions 中提问
- 查看现有文档和 FAQ

## 许可证

通过贡献代码，您同意您的贡献将在与项目相同的许可证下授权。

---

再次感谢您的贡献！🎉
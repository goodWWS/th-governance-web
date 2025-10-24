import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './router'

/**
 * 应用程序根组件
 * 配置 Ant Design 中文语言包和路由系统
 */
const App: React.FC = () => {
    return (
        <ConfigProvider locale={zhCN}>
            <RouterProvider router={router} />
        </ConfigProvider>
    )
}

export default App

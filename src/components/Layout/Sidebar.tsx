import { DashboardOutlined, DatabaseOutlined, SettingOutlined, BgColorsOutlined } from '@ant-design/icons'
import { Layout, Menu, MenuProps } from 'antd'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const { Sider } = Layout

interface SidebarProps {
    collapsed: boolean
}

type MenuItem = Required<MenuProps>['items'][number]

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const navigate = useNavigate()
    const location = useLocation()

    // 菜单项配置
    const menuItems: MenuItem[] = [
        {
            key: 'data-governance',
            icon: <DatabaseOutlined />,
            label: '数据治理',
            children: [
                {
                    key: '/dashboard',
                    icon: <DashboardOutlined />,
                    label: '仪表盘',
                },
                {
                    key: '/database-connection',
                    icon: <DatabaseOutlined />,
                    label: '数据库连接',
                },
                {
                    key: '/data-governance',
                    icon: <SettingOutlined />,
                    label: '数据治理',
                },
            ],
        },
        {
            key: '/style-demo',
            icon: <BgColorsOutlined />,
            label: '样式演示',
        },
    ]

    // 获取当前选中的菜单项
    const getSelectedKeys = () => {
        return [location.pathname]
    }

    // 获取当前展开的菜单项
    const getOpenKeys = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean)
        if (pathSegments.length > 0) {
            return ['data-governance']
        }
        return []
    }

    const [openKeys, setOpenKeys] = useState<string[]>(getOpenKeys())

    // 处理菜单点击事件
    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        navigate(key)
    }

    // 处理子菜单展开/收起
    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys)
    }

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={256}
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                background: '#fff',
                borderRight: '1px solid #f0f0f0',
            }}
        >
            <div
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: collapsed ? 14 : 18,
                    fontWeight: 'bold',
                    color: '#1890ff',
                }}
            >
                {collapsed ? '医疗' : '医疗数据治理质控系统'}
            </div>
            <Menu
                mode='inline'
                selectedKeys={getSelectedKeys()}
                openKeys={openKeys}
                onOpenChange={handleOpenChange}
                onClick={handleMenuClick}
                items={menuItems}
                style={{
                    borderRight: 0,
                    height: 'calc(100vh - 64px)',
                }}
            />
        </Sider>
    )
}

export default Sidebar

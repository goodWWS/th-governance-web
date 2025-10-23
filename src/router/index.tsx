import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import DatabaseConnection from '../pages/DatabaseConnection';
import DataGovernance from '../pages/DataGovernance';

/**
 * 路由配置
 * 使用 React Router v6 的 createBrowserRouter 创建路由
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'database-connection',
        element: <DatabaseConnection />,
      },
      {
        path: 'data-governance',
        element: <DataGovernance />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
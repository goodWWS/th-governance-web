import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import DatabaseConnection from '../pages/DatabaseConnection';
import DataGovernance from '../pages/DataGovernance';
import { StyleDemo } from '../components/StyleDemo';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
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
      {
        path: 'style-demo',
        element: <StyleDemo />,
      },
    ],
  },
]);

export default router

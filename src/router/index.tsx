import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../components/Layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import DatabaseConnection from '../pages/DatabaseConnection'
import DataGovernance from '../pages/DataGovernance'
import ExecutionDetail from '../pages/DataGovernance/ExecutionDetail'
import { ExecutionHistory } from '../pages/DataGovernance/ExecutionHistory'
import WorkflowConfig from '../pages/DataGovernance/WorkflowConfig'
import WorkflowDetail from '../pages/DataGovernance/WorkflowDetail'
import DataQualityControl from '../pages/DataQualityControl'
import BasicMedicalLogicQualityControl from '../pages/DataQualityControl/BasicMedicalLogicQualityControl'
import CompletenessQualityControl from '../pages/DataQualityControl/CompletenessQualityControl'
import ComprehensiveQualityControl from '../pages/DataQualityControl/ComprehensiveQualityControl'
import CoreDataQualityControl from '../pages/DataQualityControl/CoreDataQualityControl'
import TextQualityControl from '../pages/DataQualityControl/TextQualityControl'
import SystemSettings from '../pages/SystemSettings'
import UserSettings from '../pages/SystemSettings/UserSettings'
import RoleSettings from '../pages/SystemSettings/RoleSettings'
import PermissionSettings from '../pages/SystemSettings/PermissionSettings'

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
                path: 'data-governance/workflow-config',
                element: <WorkflowConfig />,
            },
            {
                path: 'data-governance/execution-history',
                element: <ExecutionHistory />,
            },
            {
                path: 'data-governance/execution/:id',
                element: <ExecutionDetail />,
            },
            {
                path: 'data-governance/workflow/:taskId',
                element: <WorkflowDetail />,
            },
            {
                path: 'data-quality-control',
                element: <DataQualityControl />,
            },
            {
                path: 'data-quality-control/text',
                element: <TextQualityControl />,
            },
            {
                path: 'data-quality-control/comprehensive',
                element: <ComprehensiveQualityControl />,
            },
            {
                path: 'data-quality-control/completeness',
                element: <CompletenessQualityControl />,
            },
            {
                path: 'data-quality-control/basic-medical-logic',
                element: <BasicMedicalLogicQualityControl />,
            },
            {
                path: 'data-quality-control/core-data',
                element: <CoreDataQualityControl />,
            },
            {
                path: 'system-settings',
                element: <SystemSettings />,
                children: [
                    {
                        index: true,
                        element: <UserSettings />,
                    },
                    {
                        path: 'users',
                        element: <UserSettings />,
                    },
                    {
                        path: 'roles',
                        element: <RoleSettings />,
                    },
                    {
                        path: 'permissions',
                        element: <PermissionSettings />,
                    },
                ],
            },
            // {
            //     path: 'style-demo',
            //     element: <StyleDemo />,
            // },
        ],
    },
])

export default router

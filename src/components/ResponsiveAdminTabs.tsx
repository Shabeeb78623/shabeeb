
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '../types/user';

interface ResponsiveAdminTabsProps {
  hasPermission: (permission: string) => boolean;
  isMasterAdmin: boolean;
  currentUser: User | null;
  children: React.ReactNode;
}

const ResponsiveAdminTabs: React.FC<ResponsiveAdminTabsProps> = ({ 
  hasPermission, 
  isMasterAdmin, 
  currentUser, 
  children 
}) => {
  return (
    <Tabs defaultValue="approvals" className="space-y-4">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-flow-col auto-cols-fr min-w-max gap-1 p-1">
          {hasPermission('canApproveUsers') && (
            <TabsTrigger value="approvals" className="text-xs px-2 py-1 whitespace-nowrap">
              User Approvals
            </TabsTrigger>
          )}
          {hasPermission('canViewUsers') && (
            <TabsTrigger value="users" className="text-xs px-2 py-1 whitespace-nowrap">
              Users Data
            </TabsTrigger>
          )}
          {hasPermission('canViewUsers') && (
            <TabsTrigger value="overview" className="text-xs px-2 py-1 whitespace-nowrap">
              Users Overview
            </TabsTrigger>
          )}
          {hasPermission('canManagePayments') && (
            <TabsTrigger value="payments" className="text-xs px-2 py-1 whitespace-nowrap">
              Payment Mgmt
            </TabsTrigger>
          )}
          {hasPermission('canManagePayments') && (
            <TabsTrigger value="payment-submissions" className="text-xs px-2 py-1 whitespace-nowrap">
              Payment Subs
            </TabsTrigger>
          )}
          {hasPermission('canManageBenefits') && (
            <TabsTrigger value="benefits" className="text-xs px-2 py-1 whitespace-nowrap">
              Benefits
            </TabsTrigger>
          )}
          {hasPermission('canSendNotifications') && (
            <TabsTrigger value="notifications" className="text-xs px-2 py-1 whitespace-nowrap">
              Notifications
            </TabsTrigger>
          )}
          {(isMasterAdmin || currentUser?.role === 'admin') && (
            <TabsTrigger value="import" className="text-xs px-2 py-1 whitespace-nowrap">
              Import Users
            </TabsTrigger>
          )}
          {isMasterAdmin && (
            <TabsTrigger value="admin-assignment" className="text-xs px-2 py-1 whitespace-nowrap">
              Admin Assign
            </TabsTrigger>
          )}
          {isMasterAdmin && (
            <TabsTrigger value="questions" className="text-xs px-2 py-1 whitespace-nowrap">
              Reg Questions
            </TabsTrigger>
          )}
          {isMasterAdmin && (
            <TabsTrigger value="new-year" className="text-xs px-2 py-1 whitespace-nowrap">
              New Year
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};

export default ResponsiveAdminTabs;

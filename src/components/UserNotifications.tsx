
import React, { useState } from 'react';
import { User } from '../types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UserNotificationsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const UserNotifications: React.FC<UserNotificationsProps> = ({ user, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = user.notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.fromAdmin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markAsRead = (notificationId: string) => {
    const updatedUser = {
      ...user,
      notifications: user.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    };
    onUpdateUser(updatedUser);
  };

  const markAllAsRead = () => {
    const updatedUser = {
      ...user,
      notifications: user.notifications.map(notification => ({ ...notification, read: true }))
    };
    onUpdateUser(updatedUser);
  };

  const unreadCount = user.notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Messages & Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              Mark All Read
            </Button>
          )}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 ${!notification.read ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{notification.title}</h4>
                    {!notification.read && <Badge variant="destructive" className="text-xs">New</Badge>}
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>From: {notification.fromAdmin}</span>
                    <span>{new Date(notification.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{notification.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">{notification.message}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>From: {notification.fromAdmin}</span>
                          <span>{new Date(notification.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
          
          {filteredNotifications.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No messages match your search.' : 'No messages yet.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserNotifications;


import React, { useState } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

interface NotificationManagerProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  currentAdminName: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ 
  users, 
  onUpdateUser, 
  currentAdminName 
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetMandalam, setTargetMandalam] = useState('all');
  const [targetStatus, setTargetStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  const getTargetUsers = () => {
    let targetUsers = users;

    if (targetMandalam !== 'all') {
      targetUsers = targetUsers.filter(user => user.mandalam === targetMandalam);
    }

    if (targetStatus !== 'all') {
      targetUsers = targetUsers.filter(user => user.status === targetStatus);
    }

    if (selectedUsers.length > 0) {
      targetUsers = targetUsers.filter(user => selectedUsers.includes(user.id));
    }

    return targetUsers;
  };

  const sendNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message.",
        variant: "destructive"
      });
      return;
    }

    const targetUsers = getTargetUsers();
    const notification = {
      id: Date.now().toString(),
      title: title.trim(),
      message: message.trim(),
      date: new Date().toISOString(),
      isRead: false,
      sentBy: currentAdminName
    };

    targetUsers.forEach(user => {
      const updatedUser = {
        ...user,
        notifications: [...(user.notifications || []), notification]
      };
      onUpdateUser(updatedUser);
    });

    toast({
      title: "Notification Sent",
      description: `Notification sent to ${targetUsers.length} users.`,
    });

    // Reset form
    setTitle('');
    setMessage('');
    setTargetMandalam('all');
    setTargetStatus('all');
    setSelectedUsers([]);
  };

  const targetUsers = getTargetUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <Select value={targetMandalam} onValueChange={setTargetMandalam}>
              <SelectTrigger>
                <SelectValue placeholder="Target Mandalam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mandalams</SelectItem>
                <SelectItem value="BALUSHERI">BALUSHERI</SelectItem>
                <SelectItem value="KUNNAMANGALAM">KUNNAMANGALAM</SelectItem>
                <SelectItem value="KODUVALLI">KODUVALLI</SelectItem>
                <SelectItem value="NADAPURAM">NADAPURAM</SelectItem>
                <SelectItem value="KOYLANDI">KOYLANDI</SelectItem>
                <SelectItem value="VADAKARA">VADAKARA</SelectItem>
                <SelectItem value="BEPUR">BEPUR</SelectItem>
                <SelectItem value="KUTTIYADI">KUTTIYADI</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetStatus} onValueChange={setTargetStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Target Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Textarea
          placeholder="Notification message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium mb-2">Target: {targetUsers.length} users</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {targetUsers.slice(0, 10).map(user => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                />
                <span className="text-sm">{user.fullName} ({user.mandalam})</span>
              </div>
            ))}
            {targetUsers.length > 10 && (
              <p className="text-sm text-gray-500">... and {targetUsers.length - 10} more users</p>
            )}
          </div>
        </div>

        <Button onClick={sendNotification} className="w-full">
          Send Notification
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;

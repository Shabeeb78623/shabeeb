
import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare, Users, Eye } from 'lucide-react';

interface MessageTemplate {
  id: string;
  template_name: string;
  subject: string;
  message_content: string;
  variables: string[];
}

interface EnhancedMessageManagerProps {
  users: User[];
  currentUser: User;
}

const EnhancedMessageManager: React.FC<EnhancedMessageManagerProps> = ({ users, currentUser }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      template_name: 'Payment Reminder',
      subject: 'Payment Reminder - {{year}} Membership',
      message_content: 'Dear {{name}},\n\nThis is a reminder that your {{year}} membership payment is pending. Please complete your payment at your earliest convenience.\n\nRegards,\n{{mandalam}} Committee',
      variables: ['name', 'year', 'mandalam']
    },
    {
      id: '2',
      template_name: 'Welcome Message',
      subject: 'Welcome to {{year}} Membership',
      message_content: 'Dear {{name}},\n\nWelcome to our community! Your registration number is {{regNo}}. We look forward to your participation.\n\nBest regards,\n{{mandalam}} Committee',
      variables: ['name', 'year', 'regNo', 'mandalam']
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToUnpaid, setSendToUnpaid] = useState(false);
  const [mandalamFilter, setMandalamFilter] = useState('all');
  const [previewMessage, setPreviewMessage] = useState('');
  const { toast } = useToast();

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setMessageContent(template.message_content);
  };

  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by mandalam if user is mandalam admin
    if (currentUser.role === 'mandalam_admin' && currentUser.mandalamAccess) {
      filtered = filtered.filter(user => user.mandalam === currentUser.mandalamAccess);
    }

    // Apply additional filters
    if (mandalamFilter !== 'all') {
      filtered = filtered.filter(user => user.mandalam === mandalamFilter);
    }

    if (sendToUnpaid) {
      filtered = filtered.filter(user => !user.paymentStatus && user.status === 'approved');
    }

    return filtered;
  };

  const replaceVariables = (content: string, user: User) => {
    return content
      .replace(/\{\{name\}\}/g, user.fullName)
      .replace(/\{\{mandalam\}\}/g, user.mandalam)
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
      .replace(/\{\{regNo\}\}/g, user.regNo)
      .replace(/\{\{phone\}\}/g, user.mobileNo);
  };

  const handlePreview = () => {
    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length > 0) {
      const sampleUser = filteredUsers[0];
      const preview = replaceVariables(messageContent, sampleUser);
      setPreviewMessage(preview);
    }
  };

  const handleSendMessage = () => {
    const filteredUsers = getFilteredUsers();
    
    if (filteredUsers.length === 0) {
      toast({
        title: "No Recipients",
        description: "No users match the selected criteria.",
        variant: "destructive"
      });
      return;
    }

    if (!subject.trim() || !messageContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide both subject and message content.",
        variant: "destructive"
      });
      return;
    }

    // Simulate sending messages by adding notifications to users
    filteredUsers.forEach(user => {
      const personalizedMessage = replaceVariables(messageContent, user);
      const personalizedSubject = replaceVariables(subject, user);
      
      // Add notification to user
      const notification = {
        id: Date.now().toString() + Math.random(),
        title: personalizedSubject,
        message: personalizedMessage,
        date: new Date().toISOString(),
        read: false,
        fromAdmin: currentUser.fullName,
      };

      if (!user.notifications) {
        user.notifications = [];
      }
      user.notifications.push(notification);
    });

    toast({
      title: "Messages Sent",
      description: `Message sent to ${filteredUsers.length} recipients.`,
    });

    // Reset form
    setMessageContent('');
    setSubject('');
    setSelectedUsers([]);
    setSendToUnpaid(false);
    setSelectedTemplate(null);
  };

  const filteredUsers = getFilteredUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enhanced Message Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message Template</label>
            <Select onValueChange={(templateId) => {
              const template = templates.find(t => t.id === templateId);
              if (template) handleTemplateSelect(template);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Filter Recipients</label>
            <Select value={mandalamFilter} onValueChange={setMandalamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Mandalam" />
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
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unpaid-only"
              checked={sendToUnpaid}
              onCheckedChange={(checked) => setSendToUnpaid(checked === true)}
            />
            <label htmlFor="unpaid-only" className="text-sm">
              Send only to users who haven't paid
            </label>
          </div>
          <div className="text-sm text-gray-600">
            {sendToUnpaid ? `${filteredUsers.filter(u => !u.paymentStatus).length} unpaid users` : `${filteredUsers.length} total users`}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Subject</label>
          <Input
            placeholder="Message subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Message Content</label>
          <Textarea
            placeholder="Enter your message content. Use {{name}}, {{mandalam}}, {{year}}, {{regNo}}, {{phone}} for variables."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Available variables: {`{{name}}, {{mandalam}}, {{year}}, {{regNo}}, {{phone}}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">Recipients: {filteredUsers.length}</span>
            {sendToUnpaid && (
              <span className="text-sm text-orange-600">
                (Unpaid: {filteredUsers.filter(u => !u.paymentStatus).length})
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handlePreview} className="w-full sm:w-auto">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Message Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium">Subject:</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{subject}</p>
                  </div>
                  <div>
                    <label className="font-medium">Message:</label>
                    <p className="text-sm bg-gray-50 p-2 rounded whitespace-pre-wrap">{previewMessage}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    This preview shows how the message will look for the first recipient.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleSendMessage} 
              disabled={!messageContent || !subject || filteredUsers.length === 0}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMessageManager;

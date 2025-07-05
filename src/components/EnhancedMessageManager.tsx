
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
import { supabase } from '@/integrations/supabase/client';

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
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToUnpaid, setSendToUnpaid] = useState(false);
  const [sendToPending, setSendToPending] = useState(false);
  const [mandalamFilter, setMandalamFilter] = useState('all');
  const [previewMessage, setPreviewMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*');

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedTemplates: MessageTemplate[] = (data || []).map(template => ({
        id: template.id,
        template_name: template.template_name,
        subject: template.subject,
        message_content: template.message_content,
        variables: Array.isArray(template.variables) ? template.variables as string[] : []
      }));
      
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Fallback to default templates if Supabase fails
      setTemplates([
        {
          id: '1',
          template_name: 'Payment Reminder',
          subject: 'Payment Reminder - {{name}}',
          message_content: 'Dear {{name}},\n\nThis is a reminder that your payment for {{year}} registration is still pending.\n\nReg No: {{regNo}}\nMandalam: {{mandalam}}\n\nPlease complete your payment at your earliest convenience.\n\nThank you.',
          variables: ['name', 'year', 'regNo', 'mandalam']
        },
        {
          id: '2',
          template_name: 'Approval Notification',
          subject: 'Registration Approved - {{name}}',
          message_content: 'Dear {{name}},\n\nCongratulations! Your registration has been approved.\n\nReg No: {{regNo}}\nMandalam: {{mandalam}}\n\nWelcome to our community!\n\nBest regards.',
          variables: ['name', 'regNo', 'mandalam']
        }
      ]);
    }
  };

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

    // Filter by payment status
    if (sendToUnpaid) {
      filtered = filtered.filter(user => !user.paymentStatus);
    }

    // Filter by approval status  
    if (sendToPending) {
      filtered = filtered.filter(user => user.status === 'pending');
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

    // Simulate sending messages
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
    setSendToPending(false);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pending-only"
              checked={sendToPending}
              onCheckedChange={(checked) => setSendToPending(checked === true)}
            />
            <label htmlFor="pending-only" className="text-sm">
              Send only to pending approval users
            </label>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">Recipients: {filteredUsers.length}</span>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handlePreview}>
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
            <Button onClick={handleSendMessage} disabled={!messageContent || !subject}>
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

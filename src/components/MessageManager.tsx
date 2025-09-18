
import React, { useState } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare, Users, Eye, History, Search } from 'lucide-react';

interface MessageHistory {
  id: string;
  subject: string;
  content: string;
  recipients: number;
  sentDate: string;
  sentBy: string;
  criteria: string;
}

interface MessageManagerProps {
  users: User[];
  currentUser: User;
}

const MessageManager: React.FC<MessageManagerProps> = ({ users, currentUser }) => {
  const [messageContent, setMessageContent] = useState('');
  const [subject, setSubject] = useState('');
  const [sendToUnpaid, setSendToUnpaid] = useState(false);
  const [mandalamFilter, setMandalamFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([]);
  const { toast } = useToast();

  const getFilteredUsers = () => {
    let filtered = users.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNo.includes(searchTerm) ||
      user.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by mandalam if user is mandalam admin
    if (currentUser?.role === 'mandalam_admin' && currentUser.mandalamAccess) {
      filtered = filtered.filter(user => user.mandalam === currentUser.mandalamAccess);
    }

    // Apply additional filters
    if (mandalamFilter !== 'all') {
      filtered = filtered.filter(user => user.mandalam === mandalamFilter);
    }

    if (sendToUnpaid) {
      filtered = filtered.filter(user => !user.paymentStatus);
    }

    return filtered;
  };

  const replaceVariables = (content: string, user: User) => {
    return content
      .replace(/\{\{name\}\}/g, user.fullName)
      .replace(/\{\{mandalam\}\}/g, user.mandalam)
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
      .replace(/\{\{regNo\}\}/g, user.regNo)
      .replace(/\{\{phone\}\}/g, user.mobileNo)
      .replace(/\{\{emirate\}\}/g, user.emirate);
  };

  const handlePreview = () => {
    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length > 0) {
      const sampleUser = filteredUsers[0];
      const preview = replaceVariables(messageContent, sampleUser);
      const previewSubject = replaceVariables(subject, sampleUser);
      setPreviewMessage(`Subject: ${previewSubject}\n\n${preview}`);
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

    // Create message history entry
    const historyEntry: MessageHistory = {
      id: Date.now().toString(),
      subject: subject,
      content: messageContent,
      recipients: filteredUsers.length,
      sentDate: new Date().toISOString(),
      sentBy: currentUser.fullName,
      criteria: `${sendToUnpaid ? 'Unpaid only' : 'All'}, ${mandalamFilter !== 'all' ? mandalamFilter : 'All Mandalams'}`
    };

    setMessageHistory(prev => [historyEntry, ...prev]);

    // Send messages to users
    filteredUsers.forEach(user => {
      const personalizedMessage = replaceVariables(messageContent, user);
      const personalizedSubject = replaceVariables(subject, user);
      
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
    setSendToUnpaid(false);
    setSearchTerm('');
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={mandalamFilter} onValueChange={setMandalamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Mandalam" />
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

          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input
              placeholder="Message subject (use {{name}}, {{mandalam}}, {{year}}, {{regNo}}, {{phone}}, {{emirate}})"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message Content</label>
            <Textarea
              placeholder="Enter your message content. Use {{name}}, {{mandalam}}, {{year}}, {{regNo}}, {{phone}}, {{emirate}} for variables."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {`{{name}}, {{mandalam}}, {{year}}, {{regNo}}, {{phone}}, {{emirate}}`}
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
                    <p className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap">{previewMessage}</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Sent By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messageHistory.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">{message.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{message.recipients} users</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{message.criteria}</TableCell>
                    <TableCell>{message.sentBy}</TableCell>
                    <TableCell>{new Date(message.sentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Message Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="font-medium">Subject:</label>
                              <p className="text-sm bg-gray-50 p-2 rounded">{message.subject}</p>
                            </div>
                            <div>
                              <label className="font-medium">Content:</label>
                              <p className="text-sm bg-gray-50 p-2 rounded whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium">Recipients:</label>
                                <p>{message.recipients} users</p>
                              </div>
                              <div>
                                <label className="font-medium">Sent By:</label>
                                <p>{message.sentBy}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {messageHistory.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No messages sent yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageManager;

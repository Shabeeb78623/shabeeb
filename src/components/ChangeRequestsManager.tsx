import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChangeRequest {
  id: string;
  user_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: {
    full_name: string;
    phone_number: string;
  };
}

const ChangeRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChangeRequests();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('change-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'change_requests'
        },
        () => {
          loadChangeRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadChangeRequests = async () => {
    try {
      const { data: requestsData, error } = await supabase
        .from('change_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user details for each request
      const requestsWithUsers = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, phone_number')
            .eq('id', request.user_id)
            .single();

          return {
            ...request,
            user: userData || { full_name: 'Unknown', phone_number: 'N/A' }
          };
        })
      );

      setRequests(requestsWithUsers as ChangeRequest[]);
    } catch (error) {
      console.error('Error loading change requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load change requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: ChangeRequest) => {
    try {
      // Update the change request status
      const { error: requestError } = await supabase
        .from('change_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // Apply the change to the profile
      const updateData: any = {};
      updateData[request.field_name] = request.new_value;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', request.user_id);

      if (profileError) throw profileError;

      toast({
        title: 'Request Approved',
        description: 'The change has been applied to the user profile'
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request Rejected',
        description: 'The change request has been rejected'
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive'
      });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Change Requests ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{request.user?.phone_number}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{request.field_name}</TableCell>
                    <TableCell className="text-red-600">{request.old_value}</TableCell>
                    <TableCell className="text-green-600">{request.new_value}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviewed Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewedRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviewed requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Old → New</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.user?.full_name}</TableCell>
                    <TableCell>{request.field_name}</TableCell>
                    <TableCell>
                      <span className="text-red-600">{request.old_value}</span>
                      {' → '}
                      <span className="text-green-600">{request.new_value}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangeRequestsManager;

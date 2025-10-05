import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SetupMasterAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createMasterAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-master-admin', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Master Admin Created",
        description: `Email: admin@example.com, Password: admin123`,
      });
    } catch (error) {
      console.error('Error creating master admin:', error);
      toast({
        title: "Error",
        description: "Failed to create master admin. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Setup Master Admin
        </CardTitle>
        <CardDescription>
          Create the master administrator account for the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm"><strong>Email:</strong> admin@example.com</p>
          <p className="text-sm"><strong>Password:</strong> admin123</p>
          <p className="text-xs text-muted-foreground mt-2">
            This will create a master admin account that can access all features and manage the entire system.
          </p>
        </div>
        
        <Button 
          onClick={createMasterAdmin} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Master Admin Account
        </Button>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar, RefreshCw } from 'lucide-react';

interface RenewalNotificationProps {
  currentYear: number;
  nextYear: number;
  onRenew: () => void;
}

const RenewalNotification: React.FC<RenewalNotificationProps> = ({ 
  currentYear, 
  nextYear, 
  onRenew 
}) => {
  const { toast } = useToast();

  const handleRenew = () => {
    onRenew();
    toast({
      title: "Renewal Successful",
      description: `You have successfully renewed your membership for ${nextYear}.`,
    });
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Calendar className="h-5 w-5" />
          Membership Renewal Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700">
          Registration for {nextYear} is now open. Please renew your membership to continue accessing benefits.
        </p>
        <div className="bg-orange-100 p-3 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Renewal Fee: AED 50</strong> (Discounted rate for existing members)
          </p>
        </div>
        <Button onClick={handleRenew} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Renew Membership for {nextYear}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RenewalNotification;
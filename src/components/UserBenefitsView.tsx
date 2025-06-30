
import React from 'react';
import { User, BenefitUsage } from '../types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Heart, DollarSign, Calendar } from 'lucide-react';

interface UserBenefitsViewProps {
  user: User;
}

const benefitTypeLabels = {
  hospital: 'Hospital',
  death: 'Death',
  gulf_returnee: 'Gulf Returnee',
  cancer: 'Cancer',
};

const UserBenefitsView: React.FC<UserBenefitsViewProps> = ({ user }) => {
  const totalBenefitsUsed = user.benefitsUsed?.length || 0;
  const totalAmountReceived = user.benefitsUsed?.reduce((sum, benefit) => sum + benefit.amountPaid, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          My Benefits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Benefits Used</p>
                <p className="text-2xl font-bold text-blue-700">{totalBenefitsUsed}</p>
              </div>
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-700">AED {totalAmountReceived}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {totalBenefitsUsed > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benefit Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.benefitsUsed?.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {benefitTypeLabels[benefit.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      AED {benefit.amountPaid}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(benefit.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate">{benefit.remarks}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No benefits used yet</p>
            <p className="text-sm">Benefits you use will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserBenefitsView;

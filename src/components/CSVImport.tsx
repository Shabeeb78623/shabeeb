import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { User } from '../types/user';
import { supabase } from '@/integrations/supabase/client';

interface CSVImportProps {
  onImportComplete: (users: User[]) => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);

    return rows.map(row => {
      const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  const processCSVFile = async (file: File): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);

          const users: User[] = data.map((row: any, index: number) => {
            const mobileNo = row['mobile no'] || row['phone'] || row['mobile'] || '';
            const emiratesId = row['emirates id'] || row['emiratesid'] || row['id'] || '';
            const fullName = row['full name'] || row['name'] || '';
            
            return {
              id: `imported_${Date.now()}_${index}`,
              regNo: `${new Date().getFullYear()}${String(index + 1).padStart(4, '0')}`,
              fullName,
              mobileNo,
              whatsApp: row['whatsapp'] || mobileNo,
              nominee: row['nominee'] || '',
              relation: (row['relation'] as any) || 'Father',
              emirate: row['emirate'] || '',
              mandalam: (row['mandalam'] as any) || 'BALUSHERI',
              email: row['email'] || '',
              addressUAE: row['address uae'] || row['uae address'] || '',
              addressIndia: row['address india'] || row['india address'] || '',
              kmccMember: row['kmcc member'] === 'yes' || row['kmcc member'] === 'true' || row['kmcc'] === 'yes',
              kmccMembershipNumber: row['kmcc membership number'] || row['kmcc number'] || '',
              pratheekshaMember: row['pratheeksha member'] === 'yes' || row['pratheeksha member'] === 'true' || row['pratheeksha'] === 'yes',
              pratheekshaMembershipNumber: row['pratheeksha membership number'] || row['pratheeksha number'] || '',
              recommendedBy: row['recommended by'] || row['recommended'] || '',
              photo: '',
              emiratesId,
              isImported: true,
              status: 'approved' as const,
              role: 'user' as const,
              registrationDate: new Date().toISOString(),
              registrationYear: new Date().getFullYear(),
              paymentStatus: false,
              benefitsUsed: [],
              notifications: [{
                id: Date.now().toString() + index,
                title: 'Account Created via Import',
                message: `Welcome ${fullName}! Your account has been created. Username: ${mobileNo}, Password: ${emiratesId}. Please login and update your credentials.`,
                date: new Date().toISOString(),
                isRead: false,
                sentBy: 'System Import'
              }],
            };
          });

          resolve(users);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const parsedUsers = await processCSVFile(file);
      setProgress(25);

      // Create auth accounts and profiles for each user
      for (let i = 0; i < parsedUsers.length; i++) {
        const user = parsedUsers[i];
        
        try {
          // Create auth user
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: user.email || `${user.mobileNo}@imported.local`,
            password: user.emiratesId || `temp${Date.now()}`,
            options: {
              data: {
                full_name: user.fullName
              }
            }
          });

          if (signUpError) throw signUpError;

          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user!.id,
              full_name: user.fullName,
              phone_number: user.mobileNo,
              email: user.email || `${user.mobileNo}@imported.local`,
              emirate: user.emirate,
              mandalam: user.mandalam,
              emirates_id: user.emiratesId,
              status: 'approved',
              registration_year: new Date().getFullYear()
            });

          if (profileError) throw profileError;

          // Create user role
          await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user!.id,
              role: 'user'
            });

          setProgress(25 + (i + 1) / parsedUsers.length * 75);
        } catch (error) {
          console.error(`Error importing user ${user.fullName}:`, error);
        }
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${parsedUsers.length} users.`,
      });
      
      setFile(null);
      setProgress(0);
      onImportComplete(parsedUsers);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import users. Please check your CSV format.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Import - Auto Account Creation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose CSV File
            </label>
            {file && (
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {file.name}
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">
              Creating accounts... {progress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? 'Creating Accounts...' : 'Import & Create Accounts'}
        </Button>

        <div className="text-xs text-gray-500 space-y-2">
          <p><strong>CSV Format Expected:</strong></p>
          <p>• Columns: Full Name, Mobile No, Emirates ID, Email, Emirate, Mandalam, etc.</p>
          <p><strong>Auto Account Creation:</strong></p>
          <p>• Username: Phone Number</p>
          <p>• Password: Emirates ID</p>
          <p>• Status: Auto-approved</p>
          <p>• Users assigned to their respective mandalam</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVImport;
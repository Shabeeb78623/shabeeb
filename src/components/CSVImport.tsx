
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, Download } from 'lucide-react';
import { User } from '../types/user';

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
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const mapColumnToField = (columnName: string): string => {
    const normalizedColumn = columnName.toLowerCase().trim().replace(/['"]/g, '');
    
    const columnMappings: { [key: string]: string } = {
      'full name': 'fullName',
      'name': 'fullName',
      'fullname': 'fullName',
      'mobile number': 'mobileNo',
      'mobile': 'mobileNo',
      'phone': 'mobileNo',
      'phone number': 'mobileNo',
      'mobile no': 'mobileNo',
      'whatsapp': 'whatsApp',
      'whatsapp number': 'whatsApp',
      'whats app': 'whatsApp',
      'email': 'email',
      'email address': 'email',
      'emirates id': 'emiratesId',
      'emiratesid': 'emiratesId',
      'emirates': 'emiratesId',
      'id': 'emiratesId',
      'emirate': 'emirate',
      'mandalam': 'mandalam',
      'nominee': 'nominee',
      'nominee name': 'nominee',
      'relation': 'relation',
      'relationship': 'relation',
      'address uae': 'addressUAE',
      'uae address': 'addressUAE',
      'address in uae': 'addressUAE',
      'dubai address': 'addressUAE',
      'address india': 'addressIndia',
      'india address': 'addressIndia',
      'address in india': 'addressIndia',
      'kmcc member': 'kmccMember',
      'kmcc membership': 'kmccMember',
      'kmcc': 'kmccMember',
      'kmcc membership number': 'kmccMembershipNumber',
      'kmcc number': 'kmccMembershipNumber',
      'pratheeksha member': 'pratheekshaMember',
      'pratheeksha membership': 'pratheekshaMember',
      'pratheeksha': 'pratheekshaMember',
      'pratheeksha membership number': 'pratheekshaMembershipNumber',
      'pratheeksha number': 'pratheekshaMembershipNumber',
      'recommended by': 'recommendedBy',
      'recommended': 'recommendedBy',
      'referrer': 'recommendedBy'
    };

    return columnMappings[normalizedColumn] || normalizedColumn;
  };

  const processCSVFile = async (file: File): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const lines = csvText.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
          }

          const headers = parseCSVLine(lines[0]);
          const mappedHeaders = headers.map(header => mapColumnToField(header));

          const users: User[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === 0 || values.every(val => !val.trim())) continue;

            const rowData: any = {};
            mappedHeaders.forEach((header, index) => {
              if (values[index]) {
                rowData[header] = values[index].replace(/['"]/g, '').trim();
              }
            });

            const mobileNo = rowData.mobileNo || rowData.mobile || rowData.phone || '';
            const emiratesId = rowData.emiratesId || '';

            if (!mobileNo || !emiratesId) {
              console.warn(`Skipping row ${i + 1}: Missing phone number or Emirates ID`);
              continue;
            }

            const user: User = {
              id: `csv_imported_${Date.now()}_${i}`,
              regNo: rowData.regNo || `REG${Date.now()}${i}`,
              fullName: rowData.fullName || rowData.name || '',
              mobileNo: mobileNo,
              whatsApp: rowData.whatsApp || mobileNo,
              nominee: rowData.nominee || '',
              relation: (rowData.relation as any) || 'Father',
              emirate: rowData.emirate || '',
              mandalam: (rowData.mandalam as any) || 'BALUSHERI',
              email: rowData.email || '',
              addressUAE: rowData.addressUAE || rowData.address || '',
              addressIndia: rowData.addressIndia || rowData.address || '',
              kmccMember: rowData.kmccMember === 'true' || rowData.kmccMember === 'Yes' || rowData.kmccMember === '1' || rowData.kmccMember === true,
              kmccMembershipNumber: rowData.kmccMembershipNumber || '',
              pratheekshaMember: rowData.pratheekshaMember === 'true' || rowData.pratheekshaMember === 'Yes' || rowData.pratheekshaMember === '1' || rowData.pratheekshaMember === true,
              pratheekshaMembershipNumber: rowData.pratheekshaMembershipNumber || '',
              recommendedBy: rowData.recommendedBy || '',
              photo: '',
              emiratesId: emiratesId,
              status: 'approved' as const,
              role: 'user' as const,
              username: mobileNo, // Phone number as username
              password: emiratesId, // Emirates ID as password
              registrationDate: new Date().toISOString(),
              registrationYear: new Date().getFullYear(),
              paymentStatus: false,
              benefitsUsed: [],
              notifications: [{
                id: Date.now().toString() + Math.random(),
                title: 'Account Created via CSV Import',
                message: `Welcome ${rowData.fullName || 'User'}! Your account has been created automatically. Username: ${mobileNo}, Password: ${emiratesId}. You can change these in your profile settings.`,
                date: new Date().toISOString(),
                read: false,
                fromAdmin: 'CSV Import System'
              }],
            };

            users.push(user);
          }

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
        description: "Please select a CSV file to import.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      const users = await processCSVFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      onImportComplete(users);

      toast({
        title: "CSV Import Successful",
        description: `Successfully imported ${users.length} users. Username: Phone Number, Password: Emirates ID (changeable by users)`,
      });

      setFile(null);
      setProgress(0);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to process the CSV file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Full Name', 'Phone Number', 'Email', 'Emirates ID', 'Emirate', 'Mandalam', 'Address UAE', 'Address India', 'Nominee', 'Relation', 'WhatsApp', 'KMCC Member', 'KMCC Membership Number', 'Pratheeksha Member', 'Pratheeksha Membership Number', 'Recommended By'],
      ['John Doe', '971501234567', 'john@example.com', '784123456789012', 'Dubai', 'BALUSHERI', 'Dubai Address', 'India Address', 'Jane Doe', 'Wife', '971501234567', 'Yes', 'KMCC123', 'No', '', 'Admin']
    ];

    const csvContent = sampleData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Import - Automatic Account Creation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadSampleCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>

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
              Processing CSV and creating accounts... {progress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? 'Creating Accounts...' : 'Import CSV & Create Accounts'}
        </Button>

        <div className="text-xs text-gray-500 space-y-2">
          <p><strong>Automatic Account Creation:</strong></p>
          <p>• Username: Phone Number from CSV</p>
          <p>• Password: Emirates ID from CSV</p>
          <p>• Users can change their login credentials later</p>
          <p>• All imported users are auto-approved</p>
          <p>• Users receive welcome notification with login details</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVImport;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { User } from '../types/user';

interface ExcelImportProps {
  onImportComplete: (users: User[]) => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const processExcelFile = async (file: File): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const users: User[] = jsonData.map((row: any, index: number) => ({
            id: `imported_${Date.now()}_${index}`,
            regNo: row['Registration Number'] || `REG${Date.now()}${index}`,
            fullName: row['Full Name'] || row['Name'] || '',
            mobileNo: row['Mobile Number'] || row['Mobile'] || row['Phone'] || '',
            whatsApp: row['WhatsApp'] || row['Mobile Number'] || row['Mobile'] || row['Phone'] || '',
            nominee: row['Nominee'] || '',
            relation: row['Relation'] || 'Father',
            emirate: row['Emirate'] || '',
            mandalam: row['Mandalam'] || 'BALUSHERI',
            email: row['Email'] || '',
            addressUAE: row['Address UAE'] || row['UAE Address'] || '',
            addressIndia: row['Address India'] || row['India Address'] || '',
            kmccMember: Boolean(row['KMCC Member']),
            kmccMembershipNumber: row['KMCC Membership Number'] || '',
            pratheekshaMember: Boolean(row['Pratheeksha Member']),
            pratheekshaMembershipNumber: row['Pratheeksha Membership Number'] || '',
            recommendedBy: row['Recommended By'] || '',
            photo: row['Photo'] || '',
            emiratesId: row['Emirates ID'] || '',
            status: 'approved' as const,
            role: 'user' as const,
            registrationDate: new Date().toISOString(),
            registrationYear: new Date().getFullYear(),
            paymentStatus: false,
            benefitsUsed: [],
            notifications: [],
          }));

          resolve(users);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const users = await processExcelFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      onImportComplete(users);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${users.length} users. All users are auto-approved.`,
      });

      setFile(null);
      setProgress(0);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to process the Excel file. Please check the format and try again.",
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
          <FileSpreadsheet className="h-5 w-5" />
          Excel Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose Excel File
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
              Processing... {progress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? 'Importing...' : 'Import Users'}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Supported columns:</strong></p>
          <p>Full Name, Mobile Number, WhatsApp, Email, Emirates ID, Emirate, Mandalam, Nominee, Relation, Address UAE, Address India, KMCC Member, Pratheeksha Member, Recommended By</p>
          <p><strong>Note:</strong> All imported users will be automatically approved.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelImport;

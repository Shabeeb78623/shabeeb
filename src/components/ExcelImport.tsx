
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

  const mapColumnToField = (columnName: string): string => {
    const normalizedColumn = columnName.toLowerCase().trim();
    
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

          const users: User[] = jsonData.map((row: any, index: number) => {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
              const mappedField = mapColumnToField(key);
              normalizedRow[mappedField] = row[key];
            });

            const mobileNo = normalizedRow.mobileNo || normalizedRow.mobile || normalizedRow.phone || '';
            const emiratesId = normalizedRow.emiratesId || '';

            return {
              id: `imported_${Date.now()}_${index}`,
              regNo: normalizedRow.regNo || `REG${Date.now()}${index}`,
              fullName: normalizedRow.fullName || normalizedRow.name || '',
              mobileNo: mobileNo,
              whatsApp: normalizedRow.whatsApp || mobileNo,
              nominee: normalizedRow.nominee || '',
              relation: normalizedRow.relation || 'Father',
              emirate: normalizedRow.emirate || '',
              mandalam: normalizedRow.mandalam || 'BALUSHERI',
              email: '', // Leave email empty so users must add it after import
              addressUAE: normalizedRow.addressUAE || normalizedRow.address || '',
              addressIndia: normalizedRow.addressIndia || normalizedRow.address || '',
              kmccMember: normalizedRow.kmccMember === true || normalizedRow.kmccMember === 'true' || normalizedRow.kmccMember === 'Yes' || normalizedRow.kmccMember === '1',
              kmccMembershipNumber: normalizedRow.kmccMembershipNumber || '',
              pratheekshaMember: normalizedRow.pratheekshaMember === true || normalizedRow.pratheekshaMember === 'true' || normalizedRow.pratheekshaMember === 'Yes' || normalizedRow.pratheekshaMember === '1',
              pratheekshaMembershipNumber: normalizedRow.pratheekshaMembershipNumber || '',
              recommendedBy: normalizedRow.recommendedBy || '',
              photo: '',
              emiratesId: emiratesId,
              status: 'approved' as const,
              role: 'user' as const,
              registrationDate: new Date().toISOString(),
              registrationYear: new Date().getFullYear(),
              paymentStatus: false,
              benefitsUsed: [],
              notifications: [{
                id: Date.now().toString(),
                title: 'Account Created!',
                message: `Welcome ${normalizedRow.fullName || 'User'}! Your account has been created. Please complete your profile by adding your email address.`,
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
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const users = await processExcelFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      onImportComplete(users);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${users.length} users with automatic account creation. Username: Phone Number, Password: Emirates ID`,
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
          Excel Import - Auto Account Creation
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
          <p><strong>Automatic Account Creation:</strong></p>
          <p>• Username: Phone Number from Excel</p>
          <p>• Password: Emirates ID from Excel</p>
          <p>• All users are auto-approved</p>
          <p>• Users get welcome notification with login details</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelImport;

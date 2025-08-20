import React, { useRef } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import MembershipCard from './MembershipCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MembershipCardDownloadProps {
  user: User;
}

const MembershipCardDownload: React.FC<MembershipCardDownloadProps> = ({ user }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadPDF = async () => {
    if (!cardRef.current) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your membership card...",
      });

      // Create canvas from the card element
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit the card nicely on A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 40; // 20mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Center the image on the page
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      // Download with user's name as filename
      const fileName = `${user.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Membership_Card.pdf`;
      pdf.save(fileName);

      toast({
        title: "Success",
        description: "Your membership card has been downloaded successfully!",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden card for PDF generation */}
      <div ref={cardRef} className="fixed -top-[9999px] left-0 pointer-events-none">
        <div style={{ width: '400px', padding: '20px' }}>
          <MembershipCard user={user} />
        </div>
      </div>

      {/* Visible card preview */}
      <div className="max-w-md mx-auto">
        <MembershipCard user={user} isPreview />
      </div>

      {/* Download button */}
      <div className="text-center">
        <Button onClick={downloadPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Membership Card
        </Button>
      </div>
    </div>
  );
};

export default MembershipCardDownload;
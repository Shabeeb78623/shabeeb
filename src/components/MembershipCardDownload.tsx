import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { User } from '../types/user';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MembershipCardDownloadProps {
  user: User;
}

const MembershipCardDownload: React.FC<MembershipCardDownloadProps> = ({ user }) => {
  const downloadPDF = async () => {
    const cardElement = document.createElement('div');
    cardElement.className = 'w-96 h-64 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg';
    cardElement.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold">KMMAE</h2>
          <p class="text-sm opacity-90">Membership Card</p>
        </div>
        <div class="flex-1 space-y-2">
          <div>
            <p class="text-sm opacity-75">Member Name</p>
            <p class="font-semibold">${user.fullName}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm opacity-75">Reg. No.</p>
              <p class="font-semibold">${user.regNo}</p>
            </div>
            <div>
              <p class="text-sm opacity-75">Emirates</p>
              <p class="font-semibold">${user.emirate}</p>
            </div>
          </div>
          <div>
            <p class="text-sm opacity-75">Mobile</p>
            <p class="font-semibold">${user.mobileNo}</p>
          </div>
        </div>
        <div class="text-center text-xs opacity-75">
          Valid for Year ${user.registrationYear}
        </div>
      </div>
    `;
    
    document.body.appendChild(cardElement);
    
    try {
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2
      });
      
      const pdf = new jsPDF('landscape', 'mm', [96, 64]);
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 96, 64);
      pdf.save(`${user.fullName.replace(/\s+/g, '_')}_membership_card.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      document.body.removeChild(cardElement);
    }
  };

  return (
    <Button onClick={downloadPDF} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Download Card
    </Button>
  );
};

export default MembershipCardDownload;
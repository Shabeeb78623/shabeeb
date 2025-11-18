import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { User } from '../types/user';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface MembershipCardDownloadProps {
  user: User;
}

const MembershipCardDownload: React.FC<MembershipCardDownloadProps> = ({ user }) => {
  const downloadPDF = async () => {
    const cardElement = document.createElement('div');
    cardElement.style.width = '100%';
    cardElement.style.maxWidth = '384px';
    cardElement.style.height = 'auto';
    cardElement.style.aspectRatio = '3/2';
    cardElement.style.background = 'linear-gradient(135deg, #2563eb, #60a5fa)';
    cardElement.style.color = '#ffffff';
    cardElement.style.padding = '24px';
    cardElement.style.borderRadius = '8px';
    cardElement.style.position = 'relative';
    cardElement.style.fontFamily = 'Arial, sans-serif';
    
    // Generate QR code with user data
    const qrData = JSON.stringify({
      id: user.id,
      name: user.fullName,
      regNo: user.regNo,
      year: user.registrationYear
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 80 });
    
    cardElement.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
        <div style="text-align: center; margin-bottom: 12px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0;">KMCC Pratheeksha</h2>
          <p style="font-size: 12px; opacity: 0.9; margin: 4px 0;">Membership Card</p>
        </div>
        
        <div style="display: flex; gap: 16px; flex: 1; align-items: center;">
          <div style="flex-shrink: 0;">
            ${user.photo ? 
              `<img src="${user.photo}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff;" />` :
              `<div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px;">No Photo</div>`
            }
          </div>
          
          <div style="flex: 1; min-width: 0;">
            <div style="margin-bottom: 6px;">
              <p style="font-size: 10px; opacity: 0.75; margin: 0;">Member Name</p>
              <p style="font-weight: 600; margin: 2px 0; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.fullName}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
              <div>
                <p style="font-size: 9px; opacity: 0.75; margin: 0;">Reg. No.</p>
                <p style="font-weight: 500; font-size: 11px; margin: 2px 0;">${user.regNo}</p>
              </div>
              <div>
                <p style="font-size: 9px; opacity: 0.75; margin: 0;">Emirates</p>
                <p style="font-weight: 500; font-size: 11px; margin: 2px 0;">${user.emirate}</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <p style="font-size: 9px; opacity: 0.75; margin: 0;">Mobile</p>
                <p style="font-weight: 500; font-size: 11px; margin: 2px 0;">${user.mobileNo}</p>
              </div>
              <div>
                <p style="font-size: 9px; opacity: 0.75; margin: 0;">Mandalam</p>
                <p style="font-weight: 500; font-size: 11px; margin: 2px 0;">${user.mandalam}</p>
              </div>
            </div>
          </div>
          
          <div style="flex-shrink: 0; margin-left: auto;">
            <img src="${qrCodeDataUrl}" style="width: 70px; height: 70px; background: white; padding: 4px; border-radius: 4px;" />
          </div>
        </div>
        
        <div style="text-align: center; font-size: 9px; opacity: 0.75; margin-top: 8px;">
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
    <Button onClick={downloadPDF} variant="outline" size="sm" className="w-full sm:w-auto">
      <Download className="h-4 w-4 mr-2" />
      Download Card
    </Button>
  );
};

export default MembershipCardDownload;
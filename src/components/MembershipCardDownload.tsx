import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Settings } from 'lucide-react';
import { User } from '../types/user';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface MembershipCardDownloadProps {
  user: User;
}

interface CardTemplate {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  photoX: number;
  photoY: number;
  photoSize: number;
  nameX: number;
  nameY: number;
  qrX: number;
  qrY: number;
  qrSize: number;
}

const MembershipCardDownload: React.FC<MembershipCardDownloadProps> = ({ user }) => {
  const [template, setTemplate] = useState<CardTemplate>({
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
    accentColor: '#60a5fa',
    photoX: 20,
    photoY: 40,
    photoSize: 64,
    nameX: 100,
    nameY: 50,
    qrX: 300,
    qrY: 150,
    qrSize: 80
  });

  const downloadPDF = async () => {
    const cardElement = document.createElement('div');
    cardElement.style.width = '384px';
    cardElement.style.height = '256px';
    cardElement.style.background = `linear-gradient(135deg, ${template.backgroundColor}, ${template.accentColor})`;
    cardElement.style.color = template.textColor;
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
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: template.qrSize });
    
    cardElement.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; padding: 24px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <h2 style="font-size: 20px; font-weight: bold; margin: 0;">KMCC Pratheeksha</h2>
          <p style="font-size: 14px; opacity: 0.9; margin: 4px 0;">Membership Card</p>
        </div>
        
        <div style="position: absolute; left: ${template.photoX}px; top: ${template.photoY}px;">
          ${user.photo ? 
            `<img src="${user.photo}" style="width: ${template.photoSize}px; height: ${template.photoSize}px; border-radius: 50%; object-fit: cover; border: 2px solid ${template.textColor};" />` :
            `<div style="width: ${template.photoSize}px; height: ${template.photoSize}px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid ${template.textColor}; display: flex; align-items: center; justify-content: center; font-size: 10px;">No Photo</div>`
          }
        </div>
        
        <div style="position: absolute; left: ${template.nameX}px; top: ${template.nameY}px; max-width: 180px;">
          <div style="margin-bottom: 8px;">
            <p style="font-size: 12px; opacity: 0.75; margin: 0;">Member Name</p>
            <p style="font-weight: 600; margin: 4px 0; font-size: 14px;">${user.fullName}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div>
              <p style="font-size: 10px; opacity: 0.75; margin: 0;">Reg. No.</p>
              <p style="font-weight: 500; font-size: 12px; margin: 2px 0;">${user.regNo}</p>
            </div>
            <div>
              <p style="font-size: 10px; opacity: 0.75; margin: 0;">Emirates</p>
              <p style="font-weight: 500; font-size: 12px; margin: 2px 0;">${user.emirate}</p>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <p style="font-size: 10px; opacity: 0.75; margin: 0;">Mobile</p>
              <p style="font-weight: 500; font-size: 12px; margin: 2px 0;">${user.mobileNo}</p>
            </div>
            <div>
              <p style="font-size: 10px; opacity: 0.75; margin: 0;">Mandalam</p>
              <p style="font-weight: 500; font-size: 12px; margin: 2px 0;">${user.mandalam}</p>
            </div>
          </div>
        </div>
        
        <div style="position: absolute; right: ${384 - template.qrX}px; bottom: ${256 - template.qrY}px;">
          <img src="${qrCodeDataUrl}" style="width: ${template.qrSize}px; height: ${template.qrSize}px; background: white; padding: 4px; border-radius: 4px;" />
        </div>
        
        <div style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); text-align: center; font-size: 10px; opacity: 0.75;">
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
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Customize Card
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize Membership Card</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={template.backgroundColor}
                  onChange={(e) => setTemplate({ ...template, backgroundColor: e.target.value })}
                />
              </div>
              <div>
                <Label>Text Color</Label>
                <Input
                  type="color"
                  value={template.textColor}
                  onChange={(e) => setTemplate({ ...template, textColor: e.target.value })}
                />
              </div>
              <div>
                <Label>Accent Color</Label>
                <Input
                  type="color"
                  value={template.accentColor}
                  onChange={(e) => setTemplate({ ...template, accentColor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Photo X</Label>
                  <Input
                    type="number"
                    value={template.photoX}
                    onChange={(e) => setTemplate({ ...template, photoX: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Photo Y</Label>
                  <Input
                    type="number"
                    value={template.photoY}
                    onChange={(e) => setTemplate({ ...template, photoY: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Photo Size</Label>
                  <Input
                    type="number"
                    value={template.photoSize}
                    onChange={(e) => setTemplate({ ...template, photoSize: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Name X</Label>
                  <Input
                    type="number"
                    value={template.nameX}
                    onChange={(e) => setTemplate({ ...template, nameX: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Name Y</Label>
                  <Input
                    type="number"
                    value={template.nameY}
                    onChange={(e) => setTemplate({ ...template, nameY: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>QR X</Label>
                  <Input
                    type="number"
                    value={template.qrX}
                    onChange={(e) => setTemplate({ ...template, qrX: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>QR Y</Label>
                  <Input
                    type="number"
                    value={template.qrY}
                    onChange={(e) => setTemplate({ ...template, qrY: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>QR Size</Label>
                  <Input
                    type="number"
                    value={template.qrSize}
                    onChange={(e) => setTemplate({ ...template, qrSize: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button onClick={downloadPDF} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Download Card
      </Button>
    </div>
  );
};

export default MembershipCardDownload;
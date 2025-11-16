import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { User } from '../types/user';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

interface MembershipCardDownloadProps {
  user: User;
}

interface CardTemplate {
  template_url: string;
  field_positions: {
    photo: { x: number; y: number; size: number };
    name: { x: number; y: number };
    regNo: { x: number; y: number };
    emirate: { x: number; y: number };
    mobile: { x: number; y: number };
    mandalam: { x: number; y: number };
    qr: { x: number; y: number; size: number };
  };
}

const MembershipCardDownload: React.FC<MembershipCardDownloadProps> = ({ user }) => {
  const [template, setTemplate] = useState<CardTemplate | null>(null);

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('card_templates')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTemplate(data as unknown as CardTemplate);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };


  const downloadPDF = async () => {
    if (!template) {
      alert('No template configured. Please ask admin to set up a card template.');
      return;
    }

    const cardElement = document.createElement('div');
    cardElement.style.width = '384px';
    cardElement.style.height = '256px';
    cardElement.style.position = 'relative';
    cardElement.style.backgroundImage = `url(${template.template_url})`;
    cardElement.style.backgroundSize = 'cover';
    
    // Generate QR code
    const qrData = JSON.stringify({
      id: user.id,
      name: user.fullName,
      regNo: user.regNo,
      year: user.registrationYear
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: template.field_positions.qr.size });
    
    const pos = template.field_positions;
    
    cardElement.innerHTML = `
      ${user.photo ? 
        `<img src="${user.photo}" style="position: absolute; left: ${pos.photo.x}px; top: ${pos.photo.y}px; width: ${pos.photo.size}px; height: ${pos.photo.size}px; border-radius: 50%; object-fit: cover;" />` :
        ''
      }
      <div style="position: absolute; left: ${pos.name.x}px; top: ${pos.name.y}px; font-weight: 600; font-size: 14px;">${user.fullName}</div>
      <div style="position: absolute; left: ${pos.regNo.x}px; top: ${pos.regNo.y}px; font-size: 12px;">Reg: ${user.regNo}</div>
      <div style="position: absolute; left: ${pos.emirate.x}px; top: ${pos.emirate.y}px; font-size: 12px;">${user.emirate}</div>
      <div style="position: absolute; left: ${pos.mobile.x}px; top: ${pos.mobile.y}px; font-size: 12px;">${user.mobileNo}</div>
      <div style="position: absolute; left: ${pos.mandalam.x}px; top: ${pos.mandalam.y}px; font-size: 12px;">${user.mandalam}</div>
      <img src="${qrCodeDataUrl}" style="position: absolute; left: ${pos.qr.x}px; top: ${pos.qr.y}px; width: ${pos.qr.size}px; height: ${pos.qr.size}px;" />
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
    <Button onClick={downloadPDF} variant="outline" size="sm" disabled={!template}>
      <Download className="h-4 w-4 mr-2" />
      Download Card
    </Button>
  );
};

export default MembershipCardDownload;
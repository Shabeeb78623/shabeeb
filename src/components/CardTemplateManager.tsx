import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CardTemplate {
  id: string;
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

const CardTemplateManager: React.FC = () => {
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templatePreview, setTemplatePreview] = useState<string>('');
  const [positions, setPositions] = useState({
    photo: { x: 20, y: 40, size: 64 },
    name: { x: 100, y: 50 },
    regNo: { x: 100, y: 80 },
    emirate: { x: 100, y: 110 },
    mobile: { x: 250, y: 80 },
    mandalam: { x: 250, y: 110 },
    qr: { x: 300, y: 150, size: 80 }
  });
  const { toast } = useToast();

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
        setTemplatePreview(data.template_url);
        setPositions(data.field_positions as any);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplatePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let templateUrl = template?.template_url || '';

      // Upload new template if file was selected
      if (templateFile) {
        const fileExt = templateFile.name.split('.').pop();
        const fileName = `card-template-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, templateFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        templateUrl = publicUrl;
      }

      // Deactivate all existing templates
      await supabase
        .from('card_templates')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert or update template
      const { error } = await supabase
        .from('card_templates')
        .insert({
          template_url: templateUrl,
          field_positions: positions,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Card template saved successfully'
      });

      loadTemplate();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Card Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Upload Template Image (384x256 px)</Label>
          <div className="mt-2 flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>

        {templatePreview && (
          <div className="border rounded-lg p-4">
            <Label className="mb-2 block">Template Preview</Label>
            <img src={templatePreview} alt="Template" className="w-full max-w-md" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Photo Position</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>X</Label>
                <Input
                  type="number"
                  value={positions.photo.x}
                  onChange={(e) => setPositions({...positions, photo: {...positions.photo, x: parseInt(e.target.value)}})}
                />
              </div>
              <div>
                <Label>Y</Label>
                <Input
                  type="number"
                  value={positions.photo.y}
                  onChange={(e) => setPositions({...positions, photo: {...positions.photo, y: parseInt(e.target.value)}})}
                />
              </div>
              <div>
                <Label>Size</Label>
                <Input
                  type="number"
                  value={positions.photo.size}
                  onChange={(e) => setPositions({...positions, photo: {...positions.photo, size: parseInt(e.target.value)}})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Name Position</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>X</Label>
                <Input
                  type="number"
                  value={positions.name.x}
                  onChange={(e) => setPositions({...positions, name: {...positions.name, x: parseInt(e.target.value)}})}
                />
              </div>
              <div>
                <Label>Y</Label>
                <Input
                  type="number"
                  value={positions.name.y}
                  onChange={(e) => setPositions({...positions, name: {...positions.name, y: parseInt(e.target.value)}})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Reg. No Position</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>X</Label>
                <Input
                  type="number"
                  value={positions.regNo.x}
                  onChange={(e) => setPositions({...positions, regNo: {...positions.regNo, x: parseInt(e.target.value)}})}
                />
              </div>
              <div>
                <Label>Y</Label>
                <Input
                  type="number"
                  value={positions.regNo.y}
                  onChange={(e) => setPositions({...positions, regNo: {...positions.regNo, y: parseInt(e.target.value)}})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">QR Code Position</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>X</Label>
                <Input
                  type="number"
                  value={positions.qr.x}
                  onChange={(e) => setPositions({...positions, qr: {...positions.qr, x: parseInt(e.target.value)}})}
                />
              </div>
              <div>
                <Label>Y</Label>
                <Input
                  type="number"
                  value={positions.qr.y}
                  onChange={(e) => setPositions({...positions, qr: {...positions.qr, y: parseInt(e.target.value)}})}
                />
              </div>
              <div>
                <Label>Size</Label>
                <Input
                  type="number"
                  value={positions.qr.size}
                  onChange={(e) => setPositions({...positions, qr: {...positions.qr, size: parseInt(e.target.value)}})}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardTemplateManager;

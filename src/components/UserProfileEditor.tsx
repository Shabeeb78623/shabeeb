
import React, { useState } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';

interface UserProfileEditorProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ user, onUpdateUser }) => {
  const [editedUser, setEditedUser] = useState<User>(user);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const emirates = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 
    'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
  ];

  const mandalams = [
    'BALUSHERI', 'KUNNAMANGALAM', 'KODUVALLI', 'NADAPURAM',
    'KOYLANDI', 'VADAKARA', 'BEPUR', 'KUTTIYADI'
  ];

  const relations = ['Father', 'Mother', 'Son', 'Daughter', 'Wife', 'Husband'];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditedUser({ ...editedUser, photo: result });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (!editedUser.fullName.trim()) {
        toast({
          title: "Validation Error",
          description: "Full name is required.",
          variant: "destructive"
        });
        return;
      }

      if (!editedUser.email.trim()) {
        toast({
          title: "Validation Error", 
          description: "Email is required.",
          variant: "destructive"
        });
        return;
      }

      if (!editedUser.mobileNo.trim()) {
        toast({
          title: "Validation Error",
          description: "Mobile number is required.",
          variant: "destructive"
        });
        return;
      }

      if (!editedUser.emiratesId.trim() || !/^\d{15}$/.test(editedUser.emiratesId)) {
        toast({
          title: "Validation Error",
          description: "Emirates ID must be exactly 15 digits.",
          variant: "destructive"
        });
        return;
      }

      onUpdateUser(editedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof User, value: any) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Edit Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Upload */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
            {editedUser.photo ? (
              <img 
                src={editedUser.photo} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
              disabled={uploading}
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {uploading ? 'Uploading...' : 'Choose Photo'}
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name *</label>
            <Input
              placeholder="Enter your full name"
              value={editedUser.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email *</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={editedUser.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Mobile Number *</label>
            <Input
              placeholder="Enter your mobile number"
              value={editedUser.mobileNo}
              onChange={(e) => updateField('mobileNo', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">WhatsApp Number</label>
            <Input
              placeholder="Enter your WhatsApp number"
              value={editedUser.whatsApp}
              onChange={(e) => updateField('whatsApp', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Emirates ID *</label>
            <Input
              placeholder="Enter 15-digit Emirates ID"
              value={editedUser.emiratesId}
              onChange={(e) => updateField('emiratesId', e.target.value)}
              maxLength={15}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Emirate</label>
            <Select 
              value={editedUser.emirate} 
              onValueChange={(value) => updateField('emirate', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Emirate" />
              </SelectTrigger>
              <SelectContent>
                {emirates.map(emirate => (
                  <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Mandalam</label>
            <Select 
              value={editedUser.mandalam} 
              onValueChange={(value: any) => updateField('mandalam', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Mandalam" />
              </SelectTrigger>
              <SelectContent>
                {mandalams.map(mandalam => (
                  <SelectItem key={mandalam} value={mandalam}>{mandalam}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Nominee</label>
            <Input
              placeholder="Enter nominee name"
              value={editedUser.nominee}
              onChange={(e) => updateField('nominee', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Relation to Nominee</label>
            <Select 
              value={editedUser.relation} 
              onValueChange={(value: any) => updateField('relation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Relation" />
              </SelectTrigger>
              <SelectContent>
                {relations.map(relation => (
                  <SelectItem key={relation} value={relation}>{relation}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Recommended By</label>
            <Input
              placeholder="Who recommended you?"
              value={editedUser.recommendedBy}
              onChange={(e) => updateField('recommendedBy', e.target.value)}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Address in UAE</label>
            <Textarea
              placeholder="Enter your UAE address"
              value={editedUser.addressUAE}
              onChange={(e) => updateField('addressUAE', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Address in India</label>
            <Textarea
              placeholder="Enter your India address"
              value={editedUser.addressIndia}
              onChange={(e) => updateField('addressIndia', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Membership Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">KMCC Membership Number</label>
            <Input
              placeholder="Enter KMCC membership number"
              value={editedUser.kmccMembershipNumber || ''}
              onChange={(e) => updateField('kmccMembershipNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Pratheeksha Membership Number</label>
            <Input
              placeholder="Enter Pratheeksha membership number"
              value={editedUser.pratheekshaMembershipNumber || ''}
              onChange={(e) => updateField('pratheekshaMembershipNumber', e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full" 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfileEditor;

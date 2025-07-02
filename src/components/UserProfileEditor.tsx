import React, { useState } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface UserProfileEditorProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ user, onUpdateUser }) => {
  const [editedUser, setEditedUser] = useState<User>(user);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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

  const handleSave = () => {
    onUpdateUser(editedUser);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Full Name"
            value={editedUser.fullName}
            onChange={(e) => setEditedUser({...editedUser, fullName: e.target.value})}
          />
          <Input
            placeholder="Mobile No"
            value={editedUser.mobileNo}
            onChange={(e) => setEditedUser({...editedUser, mobileNo: e.target.value})}
          />
          <Input
            placeholder="WhatsApp"
            value={editedUser.whatsApp}
            onChange={(e) => setEditedUser({...editedUser, whatsApp: e.target.value})}
          />
          <Input
            placeholder="Email"
            value={editedUser.email}
            onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
          />
          <Input
            placeholder="Emirates ID"
            value={editedUser.emiratesId}
            onChange={(e) => setEditedUser({...editedUser, emiratesId: e.target.value})}
          />
          <Input
            placeholder="Emirate"
            value={editedUser.emirate}
            onChange={(e) => setEditedUser({...editedUser, emirate: e.target.value})}
          />
          <Input
            placeholder="Nominee"
            value={editedUser.nominee}
            onChange={(e) => setEditedUser({...editedUser, nominee: e.target.value})}
          />
          <Select 
            value={editedUser.relation} 
            onValueChange={(value: any) => setEditedUser({...editedUser, relation: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Father">Father</SelectItem>
              <SelectItem value="Mother">Mother</SelectItem>
              <SelectItem value="Son">Son</SelectItem>
              <SelectItem value="Daughter">Daughter</SelectItem>
              <SelectItem value="Wife">Wife</SelectItem>
              <SelectItem value="Husband">Husband</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Recommended By"
            value={editedUser.recommendedBy}
            onChange={(e) => setEditedUser({...editedUser, recommendedBy: e.target.value})}
          />
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Address in UAE"
            value={editedUser.addressUAE}
            onChange={(e) => setEditedUser({...editedUser, addressUAE: e.target.value})}
            rows={3}
          />
          <Textarea
            placeholder="Address in India"
            value={editedUser.addressIndia}
            onChange={(e) => setEditedUser({...editedUser, addressIndia: e.target.value})}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">KMCC Membership Number</label>
            <Input
              placeholder="KMCC Membership Number"
              value={editedUser.kmccMembershipNumber || ''}
              onChange={(e) => setEditedUser({...editedUser, kmccMembershipNumber: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pratheeksha Membership Number</label>
            <Input
              placeholder="Pratheeksha Membership Number"
              value={editedUser.pratheekshaMembershipNumber || ''}
              onChange={(e) => setEditedUser({...editedUser, pratheekshaMembershipNumber: e.target.value})}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfileEditor;
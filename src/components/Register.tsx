
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const emirates = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
];

const mandalams = [
  'BALUSHERI',
  'KUNNAMANGALAM',
  'KODUVALLI',
  'NADAPURAM',
  'KOYLANDI',
  'VADAKARA',
  'BEPUR',
  'KUTTIYADI'
];

const relations = [
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Wife',
  'Husband'
];

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNo: '',
    whatsApp: '',
    nominee: '',
    relation: '',
    emirate: '',
    mandalam: '',
    email: '',
    addressUAE: '',
    addressIndia: '',
    kmccMember: false,
    kmccMembershipNumber: '',
    pratheekshaMember: false,
    pratheekshaMembershipNumber: '',
    recommendedBy: '',
    photo: '',
    emiratesId: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, photo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{15}$/.test(formData.emiratesId)) {
      toast({
        title: "Invalid Emirates ID",
        description: "Emirates ID must be exactly 15 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData);
      if (success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created and is pending approval.",
        });
        onSwitchToLogin();
      } else {
        toast({
          title: "Registration Failed",
          description: "User with this email, phone number, or Emirates ID already exists.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Create Account
          </CardTitle>
          <p className="text-gray-600">Register for system access</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Full Name *"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                type="tel"
                placeholder="Mobile Number *"
                value={formData.mobileNo}
                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                required
              />
              <Input
                type="tel"
                placeholder="WhatsApp Number *"
                value={formData.whatsApp}
                onChange={(e) => setFormData({ ...formData, whatsApp: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Nominee *"
                value={formData.nominee}
                onChange={(e) => setFormData({ ...formData, nominee: e.target.value })}
                required
              />
              <Select onValueChange={(value) => setFormData({ ...formData, relation: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Relation *" />
                </SelectTrigger>
                <SelectContent>
                  {relations.map((relation) => (
                    <SelectItem key={relation} value={relation}>
                      {relation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setFormData({ ...formData, emirate: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Emirate *" />
                </SelectTrigger>
                <SelectContent>
                  {emirates.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>
                      {emirate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setFormData({ ...formData, mandalam: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Mandalam *" />
                </SelectTrigger>
                <SelectContent>
                  {mandalams.map((mandalam) => (
                    <SelectItem key={mandalam} value={mandalam}>
                      {mandalam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <Textarea
              placeholder="Address UAE *"
              value={formData.addressUAE}
              onChange={(e) => setFormData({ ...formData, addressUAE: e.target.value })}
              required
            />
            
            <Textarea
              placeholder="Address India *"
              value={formData.addressIndia}
              onChange={(e) => setFormData({ ...formData, addressIndia: e.target.value })}
              required
            />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kmcc"
                  checked={formData.kmccMember}
                  onCheckedChange={(checked) => setFormData({ ...formData, kmccMember: checked as boolean })}
                />
                <Label htmlFor="kmcc">KMCC Member</Label>
              </div>
              {formData.kmccMember && (
                <Input
                  type="text"
                  placeholder="KMCC Membership Number"
                  value={formData.kmccMembershipNumber}
                  onChange={(e) => setFormData({ ...formData, kmccMembershipNumber: e.target.value })}
                />
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pratheeksha"
                  checked={formData.pratheekshaMember}
                  onCheckedChange={(checked) => setFormData({ ...formData, pratheekshaMember: checked as boolean })}
                />
                <Label htmlFor="pratheeksha">Pratheeksha Member</Label>
              </div>
              {formData.pratheekshaMember && (
                <Input
                  type="text"
                  placeholder="Pratheeksha Membership Number"
                  value={formData.pratheekshaMembershipNumber}
                  onChange={(e) => setFormData({ ...formData, pratheekshaMembershipNumber: e.target.value })}
                />
              )}
            </div>

            <Input
              type="text"
              placeholder="Recommended By"
              value={formData.recommendedBy}
              onChange={(e) => setFormData({ ...formData, recommendedBy: e.target.value })}
            />

            <Input
              type="text"
              placeholder="Emirates ID (15 digits) *"
              value={formData.emiratesId}
              onChange={(e) => setFormData({ ...formData, emiratesId: e.target.value })}
              maxLength={15}
              required
            />

            <div>
              <Label htmlFor="photo">Upload Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

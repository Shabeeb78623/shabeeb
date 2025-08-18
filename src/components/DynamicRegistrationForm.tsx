import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Camera } from 'lucide-react';
import DependentDropdown from './DependentDropdown';

interface RegistrationQuestion {
  id: string;
  question_key: string;
  question_text: string;
  field_type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'dependent_select' | 'checkbox' | 'file' | 'password';
  options?: string[];
  dependent_options?: Array<{
    parent_value: string;
    children: Array<{ value: string; label: string }>;
  }>;
  required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  parent_question_id?: string;
  parent_value?: string;
  min_length?: number;
  max_length?: number;
  validation_pattern?: string;
}

interface DynamicRegistrationFormProps {
  onSwitchToLogin: () => void;
}

const DynamicRegistrationForm: React.FC<DynamicRegistrationFormProps> = ({ onSwitchToLogin }) => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const { register } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRegistrationQuestions();
  }, []);

  const loadRegistrationQuestions = () => {
    try {
      const storedQuestions = localStorage.getItem('registrationQuestions');
      if (storedQuestions) {
        const questionData = JSON.parse(storedQuestions);
        setQuestions(questionData.sort((a: RegistrationQuestion, b: RegistrationQuestion) => a.order_index - b.order_index));
      } else {
        // Initialize with comprehensive default questions
        const defaultQuestions: RegistrationQuestion[] = [
          {
            id: '1',
            question_key: 'fullName',
            question_text: 'Full Name',
            field_type: 'text',
            required: true,
            order_index: 1,
            placeholder: 'Enter your full name',
            min_length: 2
          },
          {
            id: '2',
            question_key: 'mobileNo',
            question_text: 'Mobile Number',
            field_type: 'tel',
            required: true,
            order_index: 2,
            placeholder: 'Enter your mobile number'
          },
          {
            id: '3',
            question_key: 'whatsApp',
            question_text: 'WhatsApp Number',
            field_type: 'tel',
            required: true,
            order_index: 3,
            placeholder: 'Enter your WhatsApp number'
          },
          {
            id: '4',
            question_key: 'email',
            question_text: 'Email Address',
            field_type: 'email',
            required: true,
            order_index: 4,
            placeholder: 'Enter your email address'
          },
          {
            id: '5',
            question_key: 'emirate',
            question_text: 'Select Emirate',
            field_type: 'select',
            options: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
            required: true,
            order_index: 5
          },
          {
            id: '6',
            question_key: 'mandalam',
            question_text: 'Select Mandalam',
            field_type: 'dependent_select',
            dependent_options: [
              {
                parent_value: 'Dubai',
                children: [
                  { value: 'BALUSHERI', label: 'BALUSHERI' },
                  { value: 'KUNNAMANGALAM', label: 'KUNNAMANGALAM' },
                  { value: 'KODUVALLI', label: 'KODUVALLI' }
                ]
              },
              {
                parent_value: 'Abu Dhabi',
                children: [
                  { value: 'NADAPURAM', label: 'NADAPURAM' },
                  { value: 'KOYLANDI', label: 'KOYLANDI' }
                ]
              },
              {
                parent_value: 'Sharjah',
                children: [
                  { value: 'VADAKARA', label: 'VADAKARA' },
                  { value: 'BEPUR', label: 'BEPUR' },
                  { value: 'KUTTIYADI', label: 'KUTTIYADI' }
                ]
              }
            ],
            parent_question_id: '5',
            required: true,
            order_index: 6
          },
          {
            id: '7',
            question_key: 'nominee',
            question_text: 'Nominee',
            field_type: 'text',
            required: true,
            order_index: 7,
            placeholder: 'Enter nominee name'
          },
          {
            id: '8',
            question_key: 'relation',
            question_text: 'Relation',
            field_type: 'select',
            options: ['Father', 'Mother', 'Son', 'Daughter', 'Wife', 'Husband'],
            required: true,
            order_index: 8
          },
          {
            id: '9',
            question_key: 'addressUAE',
            question_text: 'Address UAE',
            field_type: 'textarea',
            required: true,
            order_index: 9,
            placeholder: 'Enter your UAE address'
          },
          {
            id: '10',
            question_key: 'addressIndia',
            question_text: 'Address India',
            field_type: 'textarea',
            required: true,
            order_index: 10,
            placeholder: 'Enter your India address'
          },
          {
            id: '11',
            question_key: 'kmccMember',
            question_text: 'KMCC Member',
            field_type: 'checkbox',
            required: false,
            order_index: 11
          },
          {
            id: '12',
            question_key: 'pratheekshaMember',
            question_text: 'Pratheeksha Member',
            field_type: 'checkbox',
            required: false,
            order_index: 12
          },
          {
            id: '13',
            question_key: 'recommendedBy',
            question_text: 'Recommended By',
            field_type: 'text',
            required: false,
            order_index: 13,
            placeholder: 'Enter who recommended you'
          },
          {
            id: '14',
            question_key: 'emiratesId',
            question_text: 'Emirates ID',
            field_type: 'text',
            required: true,
            order_index: 14,
            placeholder: 'Enter your 15-digit Emirates ID',
            validation_pattern: '^\\d{15}$',
            max_length: 15
          },
          {
            id: '15',
            question_key: 'photo',
            question_text: 'Profile Photo',
            field_type: 'file',
            required: false,
            order_index: 15
          },
          {
            id: '16',
            question_key: 'password',
            question_text: 'Password',
            field_type: 'password',
            required: true,
            order_index: 16,
            placeholder: 'Enter your password',
            min_length: 6
          },
          {
            id: '17',
            question_key: 'confirmPassword',
            question_text: 'Confirm Password',
            field_type: 'password',
            required: true,
            order_index: 17,
            placeholder: 'Confirm your password'
          }
        ];
        localStorage.setItem('registrationQuestions', JSON.stringify(defaultQuestions));
        setQuestions(defaultQuestions);
      }
    } catch (error) {
      console.error('Error loading registration questions:', error);
      toast({
        title: "Error",
        description: "Failed to load registration form. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (questionKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target?.result as string;
        handleInputChange('photo', photoData);
        setPhotoPreview(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    for (const question of questions) {
      const value = formData[question.question_key];
      
      // Check required fields
      if (question.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        toast({
          title: "Validation Error",
          description: `${question.question_text} is required.`,
          variant: "destructive"
        });
        return false;
      }

      // Check minimum length
      if (value && question.min_length && typeof value === 'string' && value.length < question.min_length) {
        toast({
          title: "Validation Error",
          description: `${question.question_text} must be at least ${question.min_length} characters.`,
          variant: "destructive"
        });
        return false;
      }

      // Check maximum length
      if (value && question.max_length && typeof value === 'string' && value.length > question.max_length) {
        toast({
          title: "Validation Error",
          description: `${question.question_text} must not exceed ${question.max_length} characters.`,
          variant: "destructive"
        });
        return false;
      }

      // Check validation pattern
      if (value && question.validation_pattern && typeof value === 'string') {
        const regex = new RegExp(question.validation_pattern);
        if (!regex.test(value)) {
          toast({
            title: "Validation Error",
            description: `${question.question_text} format is invalid.`,
            variant: "destructive"
          });
          return false;
        }
      }
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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

  const renderField = (question: RegistrationQuestion) => {
    const value = formData[question.question_key] || '';

    // Check if question should be shown based on parent conditions
    if (question.parent_question_id && question.parent_value) {
      const parentValue = formData[questions.find(q => q.id === question.parent_question_id)?.question_key || ''];
      if (parentValue !== question.parent_value) {
        return null; // Don't render if parent condition not met
      }
    }

    switch (question.field_type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.question_key}>
              {question.question_text} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={question.question_key}
              type={question.field_type}
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => handleInputChange(question.question_key, e.target.value)}
              required={question.required}
              maxLength={question.max_length}
            />
            {question.help_text && (
              <p className="text-sm text-muted-foreground">{question.help_text}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.question_key}>
              {question.question_text} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={question.question_key}
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => handleInputChange(question.question_key, e.target.value)}
              required={question.required}
              maxLength={question.max_length}
            />
            {question.help_text && (
              <p className="text-sm text-muted-foreground">{question.help_text}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <Label>
              {question.question_text} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleInputChange(question.question_key, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={question.placeholder || `Select ${question.question_text}`} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {question.help_text && (
              <p className="text-sm text-muted-foreground">{question.help_text}</p>
            )}
          </div>
        );

      case 'dependent_select':
        if (!question.parent_question_id || !question.dependent_options) return null;
        
        const parentQuestion = questions.find(q => q.id === question.parent_question_id);
        const parentValue = parentQuestion ? formData[parentQuestion.question_key] : '';
        
        const dependentOptions = question.dependent_options.map(opt => ({
          value: opt.parent_value,
          label: opt.parent_value,
          children: opt.children
        }));

        return (
          <div key={question.id}>
            <DependentDropdown
              label={`${question.question_text} ${question.required ? '*' : ''}`}
              parentValue={parentValue}
              value={value}
              onValueChange={(newValue) => handleInputChange(question.question_key, newValue)}
              options={dependentOptions}
              placeholder={question.placeholder}
              disabled={!parentValue}
            />
            {question.help_text && (
              <p className="text-sm text-muted-foreground mt-1">{question.help_text}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.id} className="flex items-center space-x-2">
            <Checkbox
              id={question.question_key}
              checked={!!value}
              onCheckedChange={(checked) => handleInputChange(question.question_key, checked)}
            />
            <Label htmlFor={question.question_key}>{question.question_text}</Label>
            {question.help_text && (
              <p className="text-sm text-muted-foreground ml-2">({question.help_text})</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.question_key}>
              {question.question_text} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id={question.question_key}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required={question.required}
              />
              <label
                htmlFor={question.question_key}
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Choose Photo
              </label>
              {photoPreview && (
                <div className="flex items-center gap-2">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <span className="text-sm text-green-600">Photo uploaded</span>
                </div>
              )}
            </div>
            {question.help_text && (
              <p className="text-sm text-muted-foreground">{question.help_text}</p>
            )}
          </div>
        );

      case 'password':
        const showPassword = showPasswords[question.question_key] || false;
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.question_key}>
              {question.question_text} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={question.question_key}
                type={showPassword ? "text" : "password"}
                placeholder={question.placeholder}
                value={value}
                onChange={(e) => handleInputChange(question.question_key, e.target.value)}
                required={question.required}
                minLength={question.min_length}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPasswords(prev => ({
                  ...prev,
                  [question.question_key]: !showPassword
                }))}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {question.help_text && (
              <p className="text-sm text-muted-foreground">{question.help_text}</p>
            )}
          </div>
        );

      default:
        return null;
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
              {questions.map(question => renderField(question))}
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

export default DynamicRegistrationForm;
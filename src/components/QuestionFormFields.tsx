
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FieldType = 'text' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'dependent_select';

interface RegistrationQuestion {
  id: string;
  question_key: string;
  question_text: string;
  field_type: FieldType;
  options?: string[];
  required: boolean;
  order_index: number;
  conditional_parent?: string;
  conditional_value?: string;
  placeholder?: string;
  help_text?: string;
  dependent_options?: { [key: string]: string[] };
}

interface QuestionFormFieldsProps {
  questionForm: {
    question_key: string;
    question_text: string;
    field_type: FieldType;
    options: string[];
    required: boolean;
    conditional_parent: string;
    conditional_value: string;
    placeholder: string;
    help_text: string;
    dependent_options?: { [key: string]: string[] };
  };
  setQuestionForm: (form: any) => void;
  questions: RegistrationQuestion[];
}

const QuestionFormFields: React.FC<QuestionFormFieldsProps> = ({ 
  questionForm, 
  setQuestionForm, 
  questions 
}) => {
  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'phone', label: 'Phone Input' },
    { value: 'textarea', label: 'Long Text (Textarea)' },
    { value: 'select', label: 'Dropdown Selection' },
    { value: 'dependent_select', label: 'Dependent Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

  const handleDependentOptionsChange = (parentOption: string, childOptions: string) => {
    const current = questionForm.dependent_options || {};
    const updated = {
      ...current,
      [parentOption]: childOptions.split('\n').filter(Boolean)
    };
    setQuestionForm({ ...questionForm, dependent_options: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question_key">Question Key *</Label>
            <Input
              id="question_key"
              placeholder="e.g., full_name, emirate, area"
              value={questionForm.question_key}
              onChange={(e) => setQuestionForm({ ...questionForm, question_key: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">
              Unique identifier for this field (use lowercase with underscores)
            </p>
          </div>

          <div>
            <Label htmlFor="question_text">Question Text *</Label>
            <Input
              id="question_text"
              placeholder="What should users see as the label?"
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="placeholder">Placeholder Text</Label>
            <Input
              id="placeholder"
              placeholder="Hint text that appears in empty fields"
              value={questionForm.placeholder}
              onChange={(e) => setQuestionForm({ ...questionForm, placeholder: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="help_text">Help Text</Label>
            <Input
              id="help_text"
              placeholder="Additional instructions for users"
              value={questionForm.help_text}
              onChange={(e) => setQuestionForm({ ...questionForm, help_text: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Field Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="field_type">Field Type *</Label>
            <Select
              value={questionForm.field_type}
              onValueChange={(value: FieldType) => setQuestionForm({ ...questionForm, field_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {questionForm.field_type === 'select' && (
            <div>
              <Label htmlFor="options">Dropdown Options *</Label>
              <Textarea
                id="options"
                placeholder="Enter each option on a new line:&#10;Abu Dhabi&#10;Dubai&#10;Sharjah"
                value={questionForm.options.join('\n')}
                onChange={(e) => setQuestionForm({ 
                  ...questionForm, 
                  options: e.target.value.split('\n').filter(Boolean) 
                })}
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter one option per line. Users will see these as dropdown choices.
              </p>
            </div>
          )}

          {questionForm.field_type === 'dependent_select' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="parent_options">Parent Options *</Label>
                <Textarea
                  id="parent_options"
                  placeholder="Enter parent options (one per line):&#10;Abu Dhabi&#10;Dubai&#10;Sharjah"
                  value={questionForm.options.join('\n')}
                  onChange={(e) => setQuestionForm({ 
                    ...questionForm, 
                    options: e.target.value.split('\n').filter(Boolean) 
                  })}
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  These are the main options users will select first.
                </p>
              </div>

              <div>
                <Label>Dependent Options</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Configure what options appear when each parent option is selected:
                </p>
                {questionForm.options.map((parentOption) => (
                  <div key={parentOption} className="border rounded-lg p-3 mb-3">
                    <Label className="font-medium text-sm">
                      When "{parentOption}" is selected, show:
                    </Label>
                    <Textarea
                      placeholder={`Options for ${parentOption} (one per line):&#10;Option 1&#10;Option 2`}
                      value={(questionForm.dependent_options?.[parentOption] || []).join('\n')}
                      onChange={(e) => handleDependentOptionsChange(parentOption, e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={questionForm.required}
              onCheckedChange={(checked) => setQuestionForm({ ...questionForm, required: checked })}
            />
            <Label htmlFor="required">Required Field</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conditional Logic (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Show this field only when another field has a specific value.
          </p>
          
          <div>
            <Label htmlFor="conditional_parent">Show only if this field...</Label>
            <Select
              value={questionForm.conditional_parent}
              onValueChange={(value) => setQuestionForm({ ...questionForm, conditional_parent: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a field (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No condition</SelectItem>
                {questions.filter(q => q.field_type === 'select' || q.field_type === 'dependent_select').map(q => (
                  <SelectItem key={q.id} value={q.question_key}>
                    {q.question_text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {questionForm.conditional_parent && questionForm.conditional_parent !== 'none' && (
            <div>
              <Label htmlFor="conditional_value">...equals this value</Label>
              <Input
                id="conditional_value"
                placeholder="Enter the exact value that triggers this field"
                value={questionForm.conditional_value}
                onChange={(e) => setQuestionForm({ ...questionForm, conditional_value: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionFormFields;

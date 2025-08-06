
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

type FieldType = 'text' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'dependent_select';

interface QuestionEditorProps {
  questionForm: {
    question_key: string;
    question_text: string;
    field_type: FieldType;
    options: string[];
    required: boolean;
    placeholder: string;
    help_text: string;
    dependent_options?: { [key: string]: string[] };
  };
  setQuestionForm: (form: any) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ questionForm, setQuestionForm }) => {
  const [parentOptions, setParentOptions] = useState<string[]>(questionForm.options || []);
  const [dependentConfig, setDependentConfig] = useState<{ [key: string]: string[] }>(
    questionForm.dependent_options || {}
  );

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'phone', label: 'Phone Input' },
    { value: 'textarea', label: 'Long Text (Textarea)' },
    { value: 'select', label: 'Dropdown Selection' },
    { value: 'dependent_select', label: 'Dependent Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

  const addParentOption = () => {
    const newOption = `Option ${parentOptions.length + 1}`;
    const updatedOptions = [...parentOptions, newOption];
    setParentOptions(updatedOptions);
    setQuestionForm({ 
      ...questionForm, 
      options: updatedOptions 
    });
  };

  const removeParentOption = (index: number) => {
    const optionToRemove = parentOptions[index];
    const updatedOptions = parentOptions.filter((_, i) => i !== index);
    setParentOptions(updatedOptions);
    
    // Remove dependent options for this parent
    const updatedDependentConfig = { ...dependentConfig };
    delete updatedDependentConfig[optionToRemove];
    setDependentConfig(updatedDependentConfig);
    
    setQuestionForm({ 
      ...questionForm, 
      options: updatedOptions,
      dependent_options: updatedDependentConfig
    });
  };

  const updateParentOption = (index: number, value: string) => {
    const oldValue = parentOptions[index];
    const updatedOptions = [...parentOptions];
    updatedOptions[index] = value;
    setParentOptions(updatedOptions);
    
    // Update dependent config key
    const updatedDependentConfig = { ...dependentConfig };
    if (updatedDependentConfig[oldValue]) {
      updatedDependentConfig[value] = updatedDependentConfig[oldValue];
      delete updatedDependentConfig[oldValue];
    }
    setDependentConfig(updatedDependentConfig);
    
    setQuestionForm({ 
      ...questionForm, 
      options: updatedOptions,
      dependent_options: updatedDependentConfig
    });
  };

  const addDependentOption = (parentKey: string) => {
    const currentOptions = dependentConfig[parentKey] || [];
    const updatedOptions = [...currentOptions, `Sub-option ${currentOptions.length + 1}`];
    const updatedConfig = { 
      ...dependentConfig, 
      [parentKey]: updatedOptions 
    };
    setDependentConfig(updatedConfig);
    setQuestionForm({ 
      ...questionForm, 
      dependent_options: updatedConfig
    });
  };

  const removeDependentOption = (parentKey: string, index: number) => {
    const currentOptions = dependentConfig[parentKey] || [];
    const updatedOptions = currentOptions.filter((_, i) => i !== index);
    const updatedConfig = { 
      ...dependentConfig, 
      [parentKey]: updatedOptions 
    };
    setDependentConfig(updatedConfig);
    setQuestionForm({ 
      ...questionForm, 
      dependent_options: updatedConfig
    });
  };

  const updateDependentOption = (parentKey: string, index: number, value: string) => {
    const currentOptions = dependentConfig[parentKey] || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = value;
    const updatedConfig = { 
      ...dependentConfig, 
      [parentKey]: updatedOptions 
    };
    setDependentConfig(updatedConfig);
    setQuestionForm({ 
      ...questionForm, 
      dependent_options: updatedConfig
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="question_key">Question Key *</Label>
          <Input
            id="question_key"
            placeholder="e.g., full_name, emirate, area"
            value={questionForm.question_key}
            onChange={(e) => setQuestionForm({ ...questionForm, question_key: e.target.value })}
          />
        </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="placeholder">Placeholder Text</Label>
          <Input
            id="placeholder"
            placeholder="Hint text"
            value={questionForm.placeholder}
            onChange={(e) => setQuestionForm({ ...questionForm, placeholder: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="help_text">Help Text</Label>
          <Input
            id="help_text"
            placeholder="Additional instructions"
            value={questionForm.help_text}
            onChange={(e) => setQuestionForm({ ...questionForm, help_text: e.target.value })}
          />
        </div>
      </div>

      {questionForm.field_type === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dropdown Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {parentOptions.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateParentOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeParentOption(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addParentOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </CardContent>
        </Card>
      )}

      {questionForm.field_type === 'dependent_select' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Parent Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {parentOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateParentOption(index, e.target.value)}
                    placeholder={`Parent Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeParentOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addParentOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Parent Option
              </Button>
            </CardContent>
          </Card>

          {parentOptions.map((parentOption) => (
            <Card key={parentOption}>
              <CardHeader>
                <CardTitle className="text-sm">Options for "{parentOption}"</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(dependentConfig[parentOption] || []).map((subOption, subIndex) => (
                  <div key={subIndex} className="flex gap-2">
                    <Input
                      value={subOption}
                      onChange={(e) => updateDependentOption(parentOption, subIndex, e.target.value)}
                      placeholder={`Sub-option ${subIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDependentOption(parentOption, subIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addDependentOption(parentOption)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-option
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;

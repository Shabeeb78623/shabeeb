import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type FieldType = 'text' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'dependent_select';

export interface RegistrationQuestion {
  id: string;
  question_key: string;
  question_text: string;
  field_type: FieldType;
  options?: string[];
  dependent_options?: { [key: string]: string[] };
  required: boolean;
  placeholder?: string;
  help_text?: string;
  order: number;
  conditional_logic?: {
    show_if_field?: string;
    show_if_value?: string;
  };
}

const FixedRegistrationQuestionsManager: React.FC = () => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<RegistrationQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<Partial<RegistrationQuestion>>({
    question_key: '',
    question_text: '',
    field_type: 'text',
    options: [],
    dependent_options: {},
    required: true,
    placeholder: '',
    help_text: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    const saved = localStorage.getItem('registrationQuestions');
    if (saved) {
      try {
        setQuestions(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading questions:', error);
        initializeDefaultQuestions();
      }
    } else {
      initializeDefaultQuestions();
    }
  };

  const initializeDefaultQuestions = () => {
    const defaultQuestions: RegistrationQuestion[] = [
      {
        id: '1',
        question_key: 'fullName',
        question_text: 'Full Name',
        field_type: 'text',
        required: true,
        order: 1
      },
      {
        id: '2',
        question_key: 'mobileNo',
        question_text: 'Mobile Number',
        field_type: 'phone',
        required: true,
        order: 2
      },
      {
        id: '3',
        question_key: 'email',
        question_text: 'Email Address',
        field_type: 'email',
        required: true,
        order: 3
      },
      {
        id: '4',
        question_key: 'emirate',
        question_text: 'Emirate',
        field_type: 'select',
        options: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
        required: true,
        order: 4
      },
      {
        id: '5',
        question_key: 'mandalam',
        question_text: 'Mandalam',
        field_type: 'dependent_select',
        dependent_options: {
          'Abu Dhabi': ['BALUSHERI', 'KUTTIPPURAM', 'TIRUR'],
          'Dubai': ['BALUSHERI', 'KUTTIPPURAM', 'TIRUR'],
          'Sharjah': ['BALUSHERI', 'KUTTIPPURAM'],
          'Ajman': ['BALUSHERI', 'TIRUR'],
          'Umm Al Quwain': ['BALUSHERI'],
          'Ras Al Khaimah': ['KUTTIPPURAM', 'TIRUR'],
          'Fujairah': ['BALUSHERI', 'KUTTIPPURAM']
        },
        required: true,
        order: 5,
        conditional_logic: {
          show_if_field: 'emirate',
          show_if_value: 'any'
        }
      }
    ];
    
    setQuestions(defaultQuestions);
    saveQuestions(defaultQuestions);
  };

  const saveQuestions = (questionsToSave: RegistrationQuestion[]) => {
    const sortedQuestions = questionsToSave
      .map((q, index) => ({ ...q, order: index + 1 }))
      .sort((a, b) => a.order - b.order);
    
    localStorage.setItem('registrationQuestions', JSON.stringify(sortedQuestions));
    setQuestions(sortedQuestions);
  };

  const resetForm = () => {
    setQuestionForm({
      question_key: '',
      question_text: '',
      field_type: 'text',
      options: [],
      dependent_options: {},
      required: true,
      placeholder: '',
      help_text: ''
    });
  };

  const handleAddQuestion = () => {
    if (!questionForm.question_key || !questionForm.question_text) {
      toast({
        title: "Error",
        description: "Please fill in the required fields (Key and Text).",
        variant: "destructive"
      });
      return;
    }

    if (questions.some(q => q.question_key === questionForm.question_key)) {
      toast({
        title: "Error",
        description: "A question with this key already exists.",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: RegistrationQuestion = {
      ...questionForm as RegistrationQuestion,
      id: Date.now().toString(),
      order: questions.length + 1
    };

    const updatedQuestions = [...questions, newQuestion];
    saveQuestions(updatedQuestions);
    resetForm();
    setShowAddDialog(false);

    toast({
      title: "Success",
      description: "Question added successfully.",
    });
  };

  const handleEditQuestion = (question: RegistrationQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({ ...question });
    setShowEditDialog(true);
  };

  const handleUpdateQuestion = () => {
    if (!questionForm.question_key || !questionForm.question_text) {
      toast({
        title: "Error",
        description: "Please fill in the required fields (Key and Text).",
        variant: "destructive"
      });
      return;
    }

    if (editingQuestion && questions.some(q => 
      q.question_key === questionForm.question_key && q.id !== editingQuestion.id
    )) {
      toast({
        title: "Error",
        description: "A question with this key already exists.",
        variant: "destructive"
      });
      return;
    }

    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion?.id 
        ? { ...questionForm as RegistrationQuestion, id: editingQuestion.id }
        : q
    );

    saveQuestions(updatedQuestions);
    resetForm();
    setEditingQuestion(null);
    setShowEditDialog(false);

    toast({
      title: "Success",
      description: "Question updated successfully.",
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    saveQuestions(updatedQuestions);

    toast({
      title: "Success",
      description: "Question deleted successfully.",
    });
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[currentIndex], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[currentIndex]];

    saveQuestions(updatedQuestions);
  };

  const addDependentOption = (parentValue: string) => {
    const options = questionForm.dependent_options || {};
    if (!options[parentValue]) {
      options[parentValue] = [''];
    } else {
      options[parentValue].push('');
    }
    setQuestionForm({ ...questionForm, dependent_options: options });
  };

  const updateDependentOption = (parentValue: string, index: number, value: string) => {
    const options = { ...(questionForm.dependent_options || {}) };
    if (options[parentValue]) {
      options[parentValue][index] = value;
      setQuestionForm({ ...questionForm, dependent_options: options });
    }
  };

  const removeDependentOption = (parentValue: string, index: number) => {
    const options = { ...(questionForm.dependent_options || {}) };
    if (options[parentValue]) {
      options[parentValue].splice(index, 1);
      if (options[parentValue].length === 0) {
        delete options[parentValue];
      }
      setQuestionForm({ ...questionForm, dependent_options: options });
    }
  };

  const renderFormFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question_key">Question Key (for data storage)</Label>
            <Input
              id="question_key"
              value={questionForm.question_key || ''}
              onChange={(e) => setQuestionForm({ ...questionForm, question_key: e.target.value })}
              placeholder="e.g., fullName, email, address"
            />
          </div>
          
          <div>
            <Label htmlFor="question_text">Question Text (displayed to user)</Label>
            <Input
              id="question_text"
              value={questionForm.question_text || ''}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              placeholder="e.g., What is your full name?"
            />
          </div>
          
          <div>
            <Label htmlFor="placeholder">Placeholder Text</Label>
            <Input
              id="placeholder"
              value={questionForm.placeholder || ''}
              onChange={(e) => setQuestionForm({ ...questionForm, placeholder: e.target.value })}
              placeholder="e.g., Enter your full name"
            />
          </div>
          
          <div>
            <Label htmlFor="help_text">Help Text</Label>
            <Textarea
              id="help_text"
              value={questionForm.help_text || ''}
              onChange={(e) => setQuestionForm({ ...questionForm, help_text: e.target.value })}
              placeholder="Additional help or instructions for the user"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Field Configuration</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="field_type">Field Type</Label>
            <Select
              value={questionForm.field_type || 'text'}
              onValueChange={(value: FieldType) => setQuestionForm({ ...questionForm, field_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Input</SelectItem>
                <SelectItem value="email">Email Input</SelectItem>
                <SelectItem value="phone">Phone Input</SelectItem>
                <SelectItem value="textarea">Text Area</SelectItem>
                <SelectItem value="select">Dropdown Select</SelectItem>
                <SelectItem value="dependent_select">Dependent Dropdown</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {questionForm.field_type === 'select' && (
            <div>
              <Label>Dropdown Options</Label>
              <Textarea
                value={(questionForm.options || []).join('\n')}
                onChange={(e) => setQuestionForm({ 
                  ...questionForm, 
                  options: e.target.value.split('\n').filter(o => o.trim()) 
                })}
                placeholder="Enter each option on a new line"
                rows={5}
              />
            </div>
          )}

          {questionForm.field_type === 'dependent_select' && (
            <div>
              <Label>Dependent Options Configuration</Label>
              <p className="text-sm text-gray-600 mb-4">
                Configure options that depend on another field's value
              </p>
              
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addDependentOption('New Parent Value')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parent Option
                </Button>
                
                {Object.entries(questionForm.dependent_options || {}).map(([parentValue, childOptions]) => (
                  <div key={parentValue} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Label>Parent Value:</Label>
                      <Input
                        value={parentValue}
                        onChange={(e) => {
                          const newOptions = { ...questionForm.dependent_options };
                          delete newOptions[parentValue];
                          newOptions[e.target.value] = childOptions;
                          setQuestionForm({ ...questionForm, dependent_options: newOptions });
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newOptions = { ...questionForm.dependent_options };
                          delete newOptions[parentValue];
                          setQuestionForm({ ...questionForm, dependent_options: newOptions });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Child Options:</Label>
                      {childOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateDependentOption(parentValue, index, e.target.value)}
                            placeholder="Child option value"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDependentOption(parentValue, index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addDependentOption(parentValue)}
                      >
                        Add Child Option
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={questionForm.required || false}
              onCheckedChange={(checked) => setQuestionForm({ ...questionForm, required: checked })}
            />
            <Label>Required Field</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Registration Questions Manager
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              {renderFormFields()}
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddQuestion} className="flex-1">
                  Add Question
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No questions configured. Add your first question to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{index + 1}</span>
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveQuestion(question.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveQuestion(question.id, 'down')}
                          disabled={index === questions.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {question.question_key}
                    </code>
                  </TableCell>
                  <TableCell>{question.question_text}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.field_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={question.required ? "default" : "secondary"}>
                      {question.required ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            {renderFormFields()}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleUpdateQuestion} className="flex-1">
                Update Question
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingQuestion(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FixedRegistrationQuestionsManager;
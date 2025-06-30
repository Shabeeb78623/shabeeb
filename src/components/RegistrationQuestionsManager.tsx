
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationQuestion {
  id: string;
  question_key: string;
  question_text: string;
  field_type: 'text' | 'select' | 'checkbox' | 'textarea';
  options?: string[];
  required: boolean;
  order_index: number;
}

const RegistrationQuestionsManager: React.FC = () => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<RegistrationQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question_key: '',
    question_text: '',
    field_type: 'text' as const,
    options: [] as string[],
    required: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('registration_questions')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registration questions",
        variant: "destructive"
      });
    }
  };

  const handleAddQuestion = async () => {
    if (!questionForm.question_key || !questionForm.question_text) {
      toast({
        title: "Invalid Input",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('registration_questions')
        .insert([{
          ...questionForm,
          order_index: questions.length + 1,
          options: questionForm.field_type === 'select' ? questionForm.options : null
        }]);

      if (error) throw error;

      await fetchQuestions();
      setQuestionForm({
        question_key: '',
        question_text: '',
        field_type: 'text',
        options: [],
        required: true,
      });

      toast({
        title: "Question Added",
        description: "Registration question has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('registration_questions')
        .update({
          question_text: editingQuestion.question_text,
          field_type: editingQuestion.field_type,
          options: editingQuestion.field_type === 'select' ? editingQuestion.options : null,
          required: editingQuestion.required,
        })
        .eq('id', editingQuestion.id);

      if (error) throw error;

      await fetchQuestions();
      setEditingQuestion(null);

      toast({
        title: "Question Updated",
        description: "Registration question has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('registration_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchQuestions();

      toast({
        title: "Question Deleted",
        description: "Registration question has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Registration Questions Manager
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Question Key (e.g., full_name)"
                  value={questionForm.question_key}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_key: e.target.value })}
                />
                <Input
                  placeholder="Question Text"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                />
                <Select
                  value={questionForm.field_type}
                  onValueChange={(value: any) => setQuestionForm({ ...questionForm, field_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>

                {questionForm.field_type === 'select' && (
                  <Textarea
                    placeholder="Options (one per line)"
                    value={questionForm.options.join('\n')}
                    onChange={(e) => setQuestionForm({ 
                      ...questionForm, 
                      options: e.target.value.split('\n').filter(Boolean) 
                    })}
                  />
                )}

                <Button onClick={handleAddQuestion} disabled={loading} className="w-full">
                  Add Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {question.order_index}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{question.question_key}</TableCell>
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
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Question</DialogTitle>
                        </DialogHeader>
                        {editingQuestion && (
                          <div className="space-y-4">
                            <Input
                              value={editingQuestion.question_text}
                              onChange={(e) => setEditingQuestion({ 
                                ...editingQuestion, 
                                question_text: e.target.value 
                              })}
                            />
                            <Select
                              value={editingQuestion.field_type}
                              onValueChange={(value: any) => setEditingQuestion({ 
                                ...editingQuestion, 
                                field_type: value 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button onClick={handleUpdateQuestion} className="w-full">
                              Update Question
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RegistrationQuestionsManager;

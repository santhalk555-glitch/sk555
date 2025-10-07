import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, Languages, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CSVRow {
  id?: string;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: string;
  question_hindi?: string;
  option_1_hindi?: string;
  option_2_hindi?: string;
  option_3_hindi?: string;
  option_4_hindi?: string;
  [key: string]: string | undefined;
}

const QuestionTranslationManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; total: number } | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: CSVRow = {} as CSVRow;
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      return row;
    });
  };

  const translateTexts = async (texts: string[]): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('translate-to-hindi', {
        body: { texts }
      });

      if (error) throw error;
      if (!data || !data.translations) throw new Error('No translations returned');

      return data.translations;
    } catch (error: any) {
      console.error('Translation error:', error);
      
      if (error.message?.includes('429') || error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }
      if (error.message?.includes('402') || error.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable workspace.');
      }
      
      throw new Error(`Translation failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setResults(null);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive'
      });
    }
  };

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      setProgress(10);

      let successCount = 0;
      let failedCount = 0;

      // Process in batches of 10
      const batchSize = 10;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        try {
          // Collect all texts to translate from this batch
          const textsToTranslate: string[] = [];
          batch.forEach(row => {
            textsToTranslate.push(
              row.question,
              row.option_1,
              row.option_2,
              row.option_3,
              row.option_4
            );
          });

          // Translate all texts in one call
          const translations = await translateTexts(textsToTranslate);

          // Update database with translations
          for (let j = 0; j < batch.length; j++) {
            const row = batch[j];
            const baseIndex = j * 5;

            const hindiData = {
              question_hindi: translations[baseIndex],
              option_1_hindi: translations[baseIndex + 1],
              option_2_hindi: translations[baseIndex + 2],
              option_3_hindi: translations[baseIndex + 3],
              option_4_hindi: translations[baseIndex + 4]
            };

            if (row.id) {
              // Update existing question
              const { error } = await supabase
                .from('quiz_questions')
                .update(hindiData)
                .eq('id', row.id);

              if (error) {
                console.error('Error updating question:', error);
                failedCount++;
              } else {
                successCount++;
              }
            } else {
              failedCount++;
            }
          }

          setProgress(10 + ((i + batch.length) / rows.length) * 90);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          console.error('Batch processing error:', error);
          failedCount += batch.length;
          
          if (error.message?.includes('Rate limit')) {
            toast({
              title: 'Rate Limited',
              description: 'Pausing for 5 seconds...',
              variant: 'default'
            });
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      setResults({
        success: successCount,
        failed: failedCount,
        total: rows.length
      });

      toast({
        title: 'Processing Complete!',
        description: `Successfully translated ${successCount} out of ${rows.length} questions.`,
      });

    } catch (error: any) {
      console.error('File processing error:', error);
      toast({
        title: 'Processing Failed',
        description: error.message || 'An error occurred while processing the file',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = `id,question,option_1,option_2,option_3,option_4,correct_answer,subject_id,topic_id,exam_simple_id
abc-123,What is 2+2?,2,3,4,5,3,subject-id,topic-id,exam-id`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="w-6 h-6 text-primary" />
            <CardTitle>Question Translation Manager</CardTitle>
          </div>
          <CardDescription>
            Upload a CSV file with questions to automatically translate them to Hindi using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              How it works:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Upload a CSV file with your questions (must include an 'id' column for existing questions)</li>
              <li>The system will automatically translate English text to Hindi using AI</li>
              <li>Hindi translations will be added as new columns in the database</li>
              <li>Original English columns remain unchanged</li>
              <li>Questions will display both languages in the quiz interface</li>
            </ol>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Need a template?</h4>
              <p className="text-sm text-muted-foreground">Download a CSV template to get started</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={processing}
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="cursor-pointer" disabled={processing} asChild>
                  <span>Choose CSV File</span>
                </Button>
              </label>
              {file && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>

            {file && !processing && (
              <Button 
                onClick={processFile} 
                className="w-full bg-gradient-primary"
                size="lg"
              >
                <Languages className="w-4 h-4 mr-2" />
                Translate and Update Questions
              </Button>
            )}

            {processing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Processing... {Math.round(progress)}%
                </p>
              </div>
            )}

            {results && (
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Processing Results
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{results.success}</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{results.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>All Gemini models are currently free to use (until Oct 13, 2025)</li>
                  <li>Large files will be processed in batches to avoid rate limits</li>
                  <li>Ensure your CSV has an 'id' column matching existing question IDs in the database</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionTranslationManager;

export interface CompetitiveExam {
  simple_id: string;
  name: string;
  main_category: string;
  sub_category: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_user_id: string;
  course_name: string;
  competitive_exams: CompetitiveExam[];
  created_at: string;
  updated_at: string;
}

// Type guard to check if competitive_exams is properly formatted
export function isCompetitiveExamArray(data: any): data is CompetitiveExam[] {
  if (!Array.isArray(data)) return false;
  return data.every(exam => 
    exam && 
    typeof exam === 'object' && 
    'simple_id' in exam && 
    'name' in exam && 
    'main_category' in exam && 
    'sub_category' in exam
  );
}

// Helper function to convert raw competitive_exams data
export function parseCompetitiveExams(data: any): CompetitiveExam[] {
  if (isCompetitiveExamArray(data)) {
    return data;
  }
  return [];
}
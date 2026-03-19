export interface MCQQuestion {
  id: string;
  type: "mcq";
  text: string;
  text_ar?: string;
  options: string[];
  options_ar?: string[];
  correct_index: number;
  explanation?: string;
}

export interface TrueFalseQuestion {
  id: string;
  type: "true_false";
  text: string;
  text_ar?: string;
  correct_answer: boolean;
  explanation?: string;
}

export interface FillBlankQuestion {
  id: string;
  type: "fill_blank";
  text: string; // Use {{BLANK}} as placeholder
  text_ar?: string;
  correct_answers: string[];
  case_sensitive: boolean;
  explanation?: string;
}

export type QuizQuestion = MCQQuestion | TrueFalseQuestion | FillBlankQuestion;

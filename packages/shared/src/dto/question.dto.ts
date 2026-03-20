import { QuestionType } from '../enums/question-type.enum';

export interface ICreateQuestionDto {
  text: string;
  type: QuestionType;
  options?: string[];
}

export interface IUpdateQuestionDto {
  text?: string;
  options?: string[];
}

export interface IQuestionResponseDto {
  id: number;
  text: string;
  type: QuestionType;
  options: string[] | null;
  hasResponses: boolean;
  createdAt: string;
  updatedAt: string;
}

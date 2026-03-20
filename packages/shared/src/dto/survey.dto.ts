import { SurveyStatus } from '../enums/survey-status.enum';
import { ISurveyFlow } from '../types/survey-flow.type';

export interface ICreateSurveyDto {
  title: string;
  description?: string;
}

export interface IUpdateSurveyDto {
  title?: string;
  description?: string;
}

export interface ISurveyResponseDto {
  id: number;
  title: string;
  description: string | null;
  status: SurveyStatus;
  flow: ISurveyFlow | null;
  questionCount: number;
  respondentCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

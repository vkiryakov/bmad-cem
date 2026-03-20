import { RespondentStatus } from '../enums/respondent-status.enum';

export interface IAddRespondentDto {
  email: string;
}

export interface IAddRespondentBulkDto {
  emails: string[];
}

export interface ISubmitAnswerDto {
  questionId: number;
  answer: string | number | string[] | Record<string, string>;
}

export interface IRespondentResponseDto {
  id: number;
  email: string;
  token: string;
  link: string;
  status: RespondentStatus;
  createdAt: string;
}

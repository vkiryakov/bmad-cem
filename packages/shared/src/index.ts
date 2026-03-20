// @bmad-cem/shared — barrel export
// Only interfaces, types, enums, and pure functions
// No classes, decorators, or framework dependencies

// Enums
export { ErrorCode } from './enums/error-code.enum';
export { SurveyStatus } from './enums/survey-status.enum';
export { QuestionType } from './enums/question-type.enum';
export { RespondentStatus } from './enums/respondent-status.enum';

// Types
export type { IApiResponse, IApiError } from './types/api-response.type';
export type {
  ISurveyFlow,
  IFlowNode,
  IFlowEdge,
  IFlowNodeData,
  IFlowNodeOutput,
} from './types/survey-flow.type';

// DTOs
export type {
  ICreateSurveyDto,
  IUpdateSurveyDto,
  ISurveyResponseDto,
} from './dto/survey.dto';
export type {
  ICreateQuestionDto,
  IUpdateQuestionDto,
  IQuestionResponseDto,
} from './dto/question.dto';
export type {
  IAddRespondentDto,
  IAddRespondentBulkDto,
  ISubmitAnswerDto,
  IRespondentResponseDto,
} from './dto/respondent.dto';
export type {
  IAnalyticsResponseDto,
  INpsBreakdown,
  IHeatmapResponseDto,
  IHeatmapNode,
  IHeatmapEdge,
} from './dto/analytics.dto';
export type {
  IPaginationMeta,
  IPaginatedResponse,
} from './dto/pagination.dto';

// Validation
export {
  FlowValidationErrorType,
  validateFlow,
  findDeadEndNodes,
  findCycles,
  findDisconnectedStart,
  findUnreachableNodes,
} from './validation/flow-validator';
export type {
  IFlowValidationResult,
  IFlowValidationError,
} from './validation/flow-validator';

import { QuestionType } from '../enums/question-type.enum';

export interface IFlowNodeOutput {
  id: string;
  label: string;
}

export interface IFlowNodeData {
  questionId?: number;
  questionType?: QuestionType;
  label: string;
  outputs: IFlowNodeOutput[];
}

export interface IFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: IFlowNodeData;
}

export interface IFlowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
}

export interface ISurveyFlow {
  nodes: IFlowNode[];
  edges: IFlowEdge[];
}

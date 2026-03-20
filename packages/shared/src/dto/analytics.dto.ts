export interface INpsBreakdown {
  detractors: number;
  passives: number;
  promoters: number;
  detractorPercent: number;
  passivePercent: number;
  promoterPercent: number;
}

export interface IAnalyticsResponseDto {
  totalRespondents: number;
  completedRespondents: number;
  completionRate: number;
  averageNps: number | null;
  npsBreakdown: INpsBreakdown | null;
}

export interface IHeatmapNode {
  nodeId: string;
  respondentCount: number;
}

export interface IHeatmapEdge {
  edgeId: string;
  traversalCount: number;
  dropOffCount: number;
}

export interface IHeatmapResponseDto {
  nodes: IHeatmapNode[];
  edges: IHeatmapEdge[];
}

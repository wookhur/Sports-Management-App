export interface CommentView {
  id: string;
  body: string;
  authorName: string;
  authorRole: "ATHLETE" | "COACH";
  createdAt: string;
}

export interface RecordView {
  id: string;
  sport: string;
  metricKey: string;
  metricName: string;
  distanceM: number | null;
  durationMs: number | null;
  value: number | null;
  unit: string | null;
  notes: string | null;
  shared: boolean;
  createdAt: string;
  ownerName?: string;
  comments: CommentView[];
}

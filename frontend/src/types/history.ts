export interface HistoryItem {
  id: string;
  user_id: string;
  user_role: string;
  athlete_id: string | null;
  athlete_name: string | null;
  video_name: string;
  video_path: string;
  upload_timestamp: string;
  analysis_timestamp: string;
  sport_type: string | null;
  movement_type: string | null;
  risk_level: string;
  injury_probability: number;
  ai_prediction: string;
  confidence_score: number;
  report_pdf_path: string | null;
  processed_video_path: string | null;
  skeleton_overlay_video_path: string | null;
  keypoints_json_path: string | null;
  recommendation_summary: string | null;
  created_at: string;
  uploader_name: string | null;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface TrendPoint {
  date: string;
  injury_probability: number;
  athlete_name: string | null;
  analysis_id: string;
}

export interface DashboardStats {
  total_analyses: number;
  weekly_upload_count: number;
  risk_distribution: Record<string, number>;
  highest_risk: HistoryItem | null;
  recent_uploads: HistoryItem[];
  improvement_trend: TrendPoint[];
}

export interface ChatMessage {
  id: string;
  analysis_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

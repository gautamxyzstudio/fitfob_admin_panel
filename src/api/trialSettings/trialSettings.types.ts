export interface TrialSettings {
  isTrialEnabled: boolean;
  dailyTrialLimit: number;
}

export interface TrialSettingsResponse {
  data?: TrialSettings;
  isTrialEnabled?: boolean;
  dailyTrialLimit?: number;
  message?: string;
  status?: number | string;
}

export interface UpdateTrialSettingsPayload {
  isTrialEnabled: boolean;
  dailyTrialLimit: number;
}

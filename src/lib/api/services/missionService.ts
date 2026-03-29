import apiInstance, { apiPost, apiPut, apiGet } from '../apiConfig';

export interface CreateOrUpdateMissionDto {
  title: string;
  description?: string;
  reward_type_ids?: string;
  is_enabled?: boolean;
  is_display?: boolean;
  start_time?: number;
  end_time?: number;
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  is_enabled: boolean;
  is_display: boolean;
  start_time?: number;
  end_time?: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class MissionService {
  async createMission(data: CreateOrUpdateMissionDto): Promise<Mission> {
    const response = await apiPost<ApiResponse<Mission>>('/missions', data);
    return response.data;
  }

  async updateMission(missionId: string, data: CreateOrUpdateMissionDto): Promise<Mission> {
    const response = await apiPut<ApiResponse<Mission>>(`/missions/${missionId}`, data);
    return response.data;
  }

  async deleteMission(missionId: string): Promise<void> {
    await apiInstance.delete(`/missions/${missionId}`);
  }

  async getMission(missionId: string): Promise<Mission> {
    const response = await apiGet<ApiResponse<Mission>>(`/missions/${missionId}`);
    return response.data;
  }

  async getUserMissions(): Promise<Mission[]> {
    const response = await apiGet<ApiResponse<Mission[]>>('/missions/user');
    return response.data;
  }

  async getMissionBySlug(slug: string): Promise<any> {
    const response = await apiGet<ApiResponse<any>>(`/public/mission/${slug}`);
    return response.data;
  }

  async getUserMissionBySlug(slug: string): Promise<any> {
    const response = await apiGet<ApiResponse<any>>(`/missions/user/${slug}`);
    return response.data;
  }
}

export const missionService = new MissionService();
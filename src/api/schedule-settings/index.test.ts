import {
  getScheduleSettings,
  getScheduleSettingById,
  createScheduleSetting,
  updateScheduleSetting,
  deleteScheduleSetting,
  getActiveScheduleSettings
} from './index';

// Mock the api instance
jest.mock('@/api/lib/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

import api from '@/api/lib/axios';
const mockApi = api as jest.Mocked<typeof api>;

describe('Schedule Settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockScheduleSetting = {
    id: 1,
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '17:00',
    max_concurrent_spiritual: 5,
    max_concurrent_light_bath: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  describe('getScheduleSettings', () => {
    it('should return schedule settings on success', async () => {
      const mockResponse = { data: [mockScheduleSetting] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getScheduleSettings();

      expect(mockApi.get).toHaveBeenCalledWith('/schedule-settings');
      expect(result).toEqual({
        success: true,
        value: [mockScheduleSetting]
      });
    });

    it('should return error on failure', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getScheduleSettings();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('getScheduleSettingById', () => {
    it('should return schedule setting on success', async () => {
      const mockResponse = { data: mockScheduleSetting };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getScheduleSettingById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/schedule-settings/1');
      expect(result).toEqual({
        success: true,
        value: mockScheduleSetting
      });
    });

    it('should return error when not found', async () => {
      const mockError = { status: 404 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getScheduleSettingById('999');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('getActiveScheduleSettings', () => {
    it('should return active schedule settings on success', async () => {
      const mockResponse = { data: [mockScheduleSetting, { ...mockScheduleSetting, id: 2, is_active: false }] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getActiveScheduleSettings();

      expect(mockApi.get).toHaveBeenCalledWith('/schedule-settings');
      expect(result).toEqual({
        success: true,
        value: [mockScheduleSetting] // Only active settings
      });
    });

    it('should return error on failure', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getActiveScheduleSettings();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('createScheduleSetting', () => {
    it('should create schedule setting on success', async () => {
      const settingData = {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        max_concurrent_spiritual: 5,
        max_concurrent_light_bath: 3,
        is_active: true
      };
      const mockResponse = { data: mockScheduleSetting };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await createScheduleSetting(settingData);

      expect(mockApi.post).toHaveBeenCalledWith('/schedule-settings', settingData);
      expect(result).toEqual({
        success: true,
        value: mockScheduleSetting
      });
    });

    it('should return error on validation failure', async () => {
      const settingData = {
        day_of_week: 8, // Invalid day (0-6 valid)
        start_time: '25:00', // Invalid time
        end_time: '17:00',
        max_concurrent_spiritual: -1, // Invalid negative number
        max_concurrent_light_bath: 3,
        is_active: true
      };
      const mockError = { status: 400 };
      mockApi.post.mockRejectedValue(mockError);

      const result = await createScheduleSetting(settingData);

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('updateScheduleSetting', () => {
    it('should update schedule setting on success', async () => {
      const updateData = { max_concurrent_spiritual: 8 };
      const mockResponse = { data: { ...mockScheduleSetting, max_concurrent_spiritual: 8 } };
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await updateScheduleSetting('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/schedule-settings/1', updateData);
      expect(result).toEqual({
        success: true,
        value: { ...mockScheduleSetting, max_concurrent_spiritual: 8 }
      });
    });

    it('should return error when not found', async () => {
      const updateData = { max_concurrent_spiritual: 8 };
      const mockError = { status: 404 };
      mockApi.patch.mockRejectedValue(mockError);

      const result = await updateScheduleSetting('999', updateData);

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });

    it('should handle deactivating schedule setting', async () => {
      const updateData = { is_active: false };
      const mockResponse = { 
        data: { 
          ...mockScheduleSetting, 
          is_active: false 
        } 
      };
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await updateScheduleSetting('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/schedule-settings/1', updateData);
      expect(result).toEqual({
        success: true,
        value: {
          ...mockScheduleSetting,
          is_active: false
        }
      });
    });
  });

  describe('deleteScheduleSetting', () => {
    it('should delete schedule setting on success', async () => {
      mockApi.delete.mockResolvedValue({});

      const result = await deleteScheduleSetting('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/schedule-settings/1');
      expect(result).toEqual({
        success: true
      });
    });

    it('should return error when not found', async () => {
      const mockError = { status: 404 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deleteScheduleSetting('999');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });

    it('should return error on server error', async () => {
      const mockError = { status: 500 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deleteScheduleSetting('1');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });
});

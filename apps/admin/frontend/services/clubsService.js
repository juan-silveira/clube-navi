import api from './api';

const SUPER_ADMIN_API = '/api/super-admin';

class ClubsService {
  /**
   * List all clubs with pagination and filters
   */
  async listClubs(params = {}) {
    console.log('🔍 [ClubsService] Chamando:', `${SUPER_ADMIN_API}/clubs`, { params });
    const { data } = await api.get(`${SUPER_ADMIN_API}/clubs`, { params });
    console.log('🔍 [ClubsService] Resposta raw:', data);
    return data;
  }

  /**
   * Get club by ID
   */
  async getClubById(id) {
    const { data } = await api.get(`${SUPER_ADMIN_API}/clubs/${id}`);
    return data;
  }

  /**
   * Create new club
   */
  async createClub(clubData) {
    const { data } = await api.post(`${SUPER_ADMIN_API}/clubs`, clubData);
    return data;
  }

  /**
   * Update club
   */
  async updateClub(id, clubData) {
    const { data } = await api.put(`${SUPER_ADMIN_API}/clubs/${id}`, clubData);
    return data;
  }

  /**
   * Toggle club active/inactive status
   */
  async toggleClubStatus(id) {
    const { data } = await api.patch(`${SUPER_ADMIN_API}/clubs/${id}/toggle-status`);
    return data;
  }

  /**
   * Get club statistics
   */
  async getClubStats(id) {
    const { data } = await api.get(`${SUPER_ADMIN_API}/clubs/${id}/stats`);
    return data;
  }

  /**
   * Update club branding
   */
  async updateClubBranding(id, brandingData) {
    const { data } = await api.put(`${SUPER_ADMIN_API}/clubs/${id}/branding`, brandingData);
    return data;
  }

  /**
   * Get dashboard stats (aggregated from all clubs)
   */
  async getDashboardStats() {
    const { data } = await api.get(`${SUPER_ADMIN_API}/clubs/dashboard/stats`);
    return data;
  }

  /**
   * Sync stats for a specific club
   */
  async syncClubStats(clubId) {
    const { data } = await api.post(`${SUPER_ADMIN_API}/clubs/${clubId}/sync-stats`);
    return data;
  }

  /**
   * Sync stats for all clubs
   */
  async syncAllClubsStats() {
    const { data } = await api.post(`${SUPER_ADMIN_API}/clubs/sync-stats/all`);
    return data;
  }

  /**
   * Get sync status for a club
   */
  async getSyncStatus(clubId) {
    const { data } = await api.get(`${SUPER_ADMIN_API}/clubs/${clubId}/sync-stats/status`);
    return data;
  }

  /**
   * Upload branding asset to S3
   */
  async uploadBrandingAsset(clubId, file, assetType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);

    const { data } = await api.post(
      `${SUPER_ADMIN_API}/clubs/${clubId}/branding/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }
}

export default new ClubsService();

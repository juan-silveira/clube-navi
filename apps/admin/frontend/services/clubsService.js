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

  /**
   * Create club complete with database, branding, and admin
   * This is a complete wizard-based creation with all steps
   */
  async createClubComplete(wizardData) {
    const formData = new FormData();

    // Step 1: Company Info
    formData.append('companyName', wizardData.companyName);
    formData.append('companyDocument', wizardData.companyDocument);
    formData.append('contactName', wizardData.contactName);
    formData.append('contactEmail', wizardData.contactEmail);
    formData.append('contactPhone', wizardData.contactPhone);
    formData.append('plan', wizardData.plan);

    // Step 2: Branding
    formData.append('appName', wizardData.appName);
    formData.append('appDescription', wizardData.appDescription);
    formData.append('primaryColor', wizardData.primaryColor);
    formData.append('secondaryColor', wizardData.secondaryColor);
    formData.append('accentColor', wizardData.accentColor);
    formData.append('backgroundColor', wizardData.backgroundColor);
    formData.append('textColor', wizardData.textColor);

    // Branding files
    if (wizardData.logoFile) {
      formData.append('logoFile', wizardData.logoFile);
    }
    if (wizardData.iconFile) {
      formData.append('iconFile', wizardData.iconFile);
    }
    if (wizardData.splashFile) {
      formData.append('splashFile', wizardData.splashFile);
    }

    // Step 3: Technical
    formData.append('slug', wizardData.slug);
    formData.append('subdomain', wizardData.subdomain);
    if (wizardData.customDomain) {
      formData.append('customDomain', wizardData.customDomain);
    }
    formData.append('bundleId', wizardData.bundleId);

    // Step 4: Admin
    formData.append('adminName', wizardData.adminName);
    formData.append('adminEmail', wizardData.adminEmail);
    formData.append('adminCpf', wizardData.adminCpf);
    formData.append('adminPhone', wizardData.adminPhone);
    formData.append('adminPassword', wizardData.adminPassword);

    const { data } = await api.post(
      `${SUPER_ADMIN_API}/clubs/complete`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for database creation
        timeout: 60000 // 60 seconds
      }
    );

    return data;
  }
}

export default new ClubsService();

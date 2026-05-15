import { authService } from "../../shared/services/authService";
import { mockApiClient } from "../../shared/services/mockApiClient";

export const settingsService = {
  getAdminProfile(userId) {
    return authService.getProfile(userId);
  },

  updateAdminProfile(userId, payload) {
    return authService.updateProfile(userId, payload);
  },

  changeAdminPassword(userId, payload) {
    return authService.changePassword(userId, payload);
  },

  resetDemoData() {
    return Promise.resolve(mockApiClient.reset());
  },
};

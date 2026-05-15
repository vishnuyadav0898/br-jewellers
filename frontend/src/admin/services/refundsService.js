import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

const enrichRequest = (db, request) => {
  const user = db.users.find((entry) => entry.id === request.userId);

  return {
    ...request,
    customerName: user?.name || request.userId,
    customerEmail: user?.email || "Unknown",
  };
};

export const refundsService = {
  async getRequests(filter = "all") {
    return mockApiClient.query((db) => {
      const requests =
        Array.isArray(db.refundRequests) && db.refundRequests.length
          ? db.refundRequests
          : initialData.refundRequests || [];

      return requests
        .filter((request) => (filter === "pending" ? request.status === "Pending" : true))
        .map((request) => enrichRequest(db, request))
        .sort((left, right) => new Date(right.requestedAt) - new Date(left.requestedAt));
    });
  },

  async resolveRequest(requestId, status, adminNote = "") {
    return mockApiClient.mutate((db) => {
      const request = db.refundRequests.find((entry) => entry.id === requestId);
      if (!request) throw new Error("Return request not found.");

      request.status = status;
      request.adminNote = adminNote;
      request.resolvedAt = new Date().toISOString();
      return db;
    });
  },
};

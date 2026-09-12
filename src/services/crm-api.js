import apiClient from "@/lib/api-client";
import {
  getStoredCrmCustomers,
  saveCrmCustomer,
  deleteCrmCustomer,
  getStoredLeads,
  saveLead,
  deleteLead,
  getStoredContacts,
  saveContact,
  deleteContact,
  getStoredDeals,
  saveDeal,
  deleteDeal,
  getStoredCrmActivities,
  addCrmActivity as saveLocalActivity,
} from "@/lib/crm-storage";

/**
 * CRM API Service connecting frontend components with Central ERP Backend API.
 * Maps directly to /api/v1/crm/* routes described in api_document.md.
 */
export const crmApi = {
  // ==========================================
  // CUSTOMERS & VENDORS (/api/v1/crm/customers)
  // ==========================================

  /**
   * Fetches list of customers and vendors with optional filtering.
   * @param {Object} params - { type, status, search, page, limit }
   */
  async getCustomers(params = {}) {
    try {
      const response = await apiClient.get("/crm/customers", { params });
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        console.warn("[CRM API] Backend unreachable, using local storage fallback for customers.");
        let list = getStoredCrmCustomers();
        if (params.type && params.type !== "All") {
          list = list.filter((item) => item.type?.toLowerCase() === params.type?.toLowerCase());
        }
        if (params.status && params.status !== "All") {
          list = list.filter((item) => item.status?.toLowerCase() === params.status?.toLowerCase());
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (item) =>
              item.name?.toLowerCase().includes(s) ||
              item.company?.toLowerCase().includes(s) ||
              item.email?.toLowerCase().includes(s) ||
              item.gst?.toLowerCase().includes(s)
          );
        }
        return list;
      }
      throw error;
    }
  },

  /**
   * Fetches single customer/vendor by ID.
   */
  async getCustomerById(id) {
    try {
      const response = await apiClient.get(`/crm/customers/${id}`);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        return getStoredCrmCustomers().find((c) => c.id === id) || null;
      }
      throw error;
    }
  },

  /**
   * Creates a new customer or vendor record.
   */
  async createCustomer(payload) {
    try {
      const response = await apiClient.post("/crm/customers", payload);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        const localRecord = {
          id: `cust-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
          ...payload,
        };
        saveCrmCustomer(localRecord);
        return localRecord;
      }
      throw error;
    }
  },

  /**
   * Updates an existing customer or vendor record.
   */
  async updateCustomer(id, payload) {
    try {
      const response = await apiClient.put(`/crm/customers/${id}`, payload);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        const localRecord = { id, ...payload };
        saveCrmCustomer(localRecord);
        return localRecord;
      }
      throw error;
    }
  },

  /**
   * Soft-deletes a customer or vendor.
   */
  async deleteCustomer(id) {
    try {
      const response = await apiClient.delete(`/crm/customers/${id}`);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        deleteCrmCustomer(id);
        return { success: true, id };
      }
      throw error;
    }
  },

  // ==========================================
  // LEADS (/api/v1/crm/leads)
  // ==========================================

  /**
   * Fetches list of leads with optional stage and search filters.
   */
  async getLeads(params = {}) {
    try {
      const response = await apiClient.get("/crm/leads", { params });
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        console.warn("[CRM API] Backend unreachable, using local storage fallback for leads.");
        let list = getStoredLeads();
        if (params.stage && params.stage !== "All") {
          list = list.filter((l) => l.stage?.toLowerCase() === params.stage?.toLowerCase());
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (l) =>
              l.name?.toLowerCase().includes(s) ||
              l.company?.toLowerCase().includes(s) ||
              l.email?.toLowerCase().includes(s)
          );
        }
        return list;
      }
      throw error;
    }
  },

  /**
   * Creates a new lead.
   */
  async createLead(payload) {
    try {
      const response = await apiClient.post("/crm/leads", payload);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        const localRecord = {
          id: `lead-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
          ...payload,
        };
        saveLead(localRecord);
        return localRecord;
      }
      throw error;
    }
  },

  /**
   * Updates lead details or pipeline stage.
   */
  async updateLead(id, payload) {
    try {
      const response = await apiClient.put(`/crm/leads/${id}`, payload);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        const localRecord = { id, ...payload };
        saveLead(localRecord);
        return localRecord;
      }
      throw error;
    }
  },

  /**
   * Deletes a lead.
   */
  async deleteLead(id) {
    try {
      const response = await apiClient.delete(`/crm/leads/${id}`);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        deleteLead(id);
        return { success: true, id };
      }
      throw error;
    }
  },

  // ==========================================
  // DEALS (/api/v1/crm/deals)
  // ==========================================

  /**
   * Fetches list of deals in the pipeline.
   */
  async getDeals(params = {}) {
    try {
      const response = await apiClient.get("/crm/deals", { params });
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        console.warn("[CRM API] Backend unreachable, using local storage fallback for deals.");
        let list = getStoredDeals();
        if (params.stage && params.stage !== "All") {
          list = list.filter((d) => d.stage?.toLowerCase() === params.stage?.toLowerCase());
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (d) =>
              d.title?.toLowerCase().includes(s) ||
              d.company?.toLowerCase().includes(s) ||
              d.customer?.toLowerCase().includes(s)
          );
        }
        return list;
      }
      throw error;
    }
  },

  /**
   * Creates a new deal.
   */
  async createDeal(payload) {
    try {
      const response = await apiClient.post("/crm/deals", payload);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        const localRecord = {
          id: `deal-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
          ...payload,
        };
        saveDeal(localRecord);
        return localRecord;
      }
      throw error;
    }
  },

  /**
   * Updates deal status, value, or stage.
   */
  async updateDeal(id, payload) {
    try {
      const response = await apiClient.put(`/crm/deals/${id}`, payload);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        const localRecord = { id, ...payload };
        saveDeal(localRecord);
        return localRecord;
      }
      throw error;
    }
  },

  /**
   * Deletes a deal.
   */
  async deleteDeal(id) {
    try {
      const response = await apiClient.delete(`/crm/deals/${id}`);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        deleteDeal(id);
        return { success: true, id };
      }
      throw error;
    }
  },

  // ==========================================
  // CONTACTS (/api/v1/crm/contacts or local)
  // ==========================================
  async getContacts() {
    return getStoredContacts();
  },

  async createContact(payload) {
    const localRecord = {
      id: `cnt-${Date.now()}`,
      ...payload,
    };
    saveContact(localRecord);
    return localRecord;
  },

  async updateContact(id, payload) {
    const localRecord = { id, ...payload };
    saveContact(localRecord);
    return localRecord;
  },

  async deleteContact(id) {
    deleteContact(id);
    return { success: true, id };
  },

  // ==========================================
  // ACTIVITIES (/api/v1/crm/activities)
  // ==========================================

  /**
   * Fetches timeline activities for an entity (Customer, Vendor, Lead, Deal).
   */
  async getActivities(entityId) {
    try {
      const response = await apiClient.get("/crm/activities", {
        params: { entityId },
      });
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        return getStoredCrmActivities(entityId);
      }
      throw error;
    }
  },

  /**
   * Logs a new interaction/activity on an entity.
   */
  async logActivity(payload) {
    try {
      const response = await apiClient.post("/crm/activities", payload);
      return response.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        saveLocalActivity(payload);
        return {
          id: `act-${Date.now()}`,
          timestamp: "Just now",
          ...payload,
        };
      }
      throw error;
    }
  },
};

export default crmApi;

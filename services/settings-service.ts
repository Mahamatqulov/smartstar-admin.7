import { apiRequest } from "@/utils/api";

// Define types for settings
export interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  timezone: string;
  dateFormat: string;
  featuredProjects: number;
  projectsPerPage: number;
  maintenanceMode: boolean;
}

export interface EmailSettings {
  provider: string;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  encryption: string;
  welcomeTemplate: string;
  approvalTemplate: string;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordExpiry: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
  allowedIps: string;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface ApiSettings {
  enableApi: boolean;
  rateLimit: number;
  webhookUrl: string;
  webhookEvents: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  created: string;
  key?: string;
}

export interface Settings {
  general: GeneralSettings;
  email: EmailSettings;
  security: SecuritySettings;
  api: ApiSettings;
  apiKeys: ApiKey[];
}

// Default settings
export const defaultSettings: Settings = {
  general: {
    siteName: "SmartStar",
    siteUrl: "",
    siteDescription: "Admin panel for managing SmartStar projects and users",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    featuredProjects: 5,
    projectsPerPage: 10,
    maintenanceMode: false,
  },
  email: {
    provider: "smtp",
    fromName: "SmartStar Admin",
    fromEmail: "admin@example.com",
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    encryption: "tls",
    welcomeTemplate: "Welcome to our platform! Your account has been created.",
    approvalTemplate: "Your project has been approved and is now live.",
  },
  security: {
    twoFactorAuth: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    allowedIps: "",
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  api: {
    enableApi: true,
    rateLimit: 100,
    webhookUrl: "",
    webhookEvents: [],
  },
  apiKeys: [
    {
      id: "1",
      name: "Production API Key",
      created: "2023-01-15",
    },
    {
      id: "2",
      name: "Development API Key",
      created: "2023-02-22",
    },
  ],
};

export const SettingsService = {
  // Get all settings
  async getSettings(): Promise<Settings> {
    try {
      const settings = await apiRequest<Settings>("/settings");
      return settings;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      // Return default settings if API fails
      return { ...defaultSettings };
    }
  },

  // Update general settings
  async updateGeneralSettings(
    settings: GeneralSettings
  ): Promise<GeneralSettings> {
    try {
      const updatedSettings = await apiRequest<GeneralSettings>(
        "/settings/general",
        {
          method: "PUT",
          body: settings,
        }
      );
      return updatedSettings;
    } catch (error) {
      console.error("Failed to update general settings:", error);
      throw error;
    }
  },

  // Update email settings
  async updateEmailSettings(settings: EmailSettings): Promise<EmailSettings> {
    try {
      const updatedSettings = await apiRequest<EmailSettings>(
        "/settings/email",
        {
          method: "PUT",
          body: settings,
        }
      );
      return updatedSettings;
    } catch (error) {
      console.error("Failed to update email settings:", error);
      throw error;
    }
  },

  // Update security settings
  async updateSecuritySettings(
    settings: SecuritySettings
  ): Promise<SecuritySettings> {
    try {
      const updatedSettings = await apiRequest<SecuritySettings>(
        "/settings/security",
        {
          method: "PUT",
          body: settings,
        }
      );
      return updatedSettings;
    } catch (error) {
      console.error("Failed to update security settings:", error);
      throw error;
    }
  },

  // Update API settings
  async updateApiSettings(settings: ApiSettings): Promise<ApiSettings> {
    try {
      const updatedSettings = await apiRequest<ApiSettings>("/settings/api", {
        method: "PUT",
        body: settings,
      });
      return updatedSettings;
    } catch (error) {
      console.error("Failed to update API settings:", error);
      throw error;
    }
  },

  // Generate new API key
  async generateApiKey(name: string): Promise<ApiKey> {
    try {
      const newKey = await apiRequest<ApiKey>("/settings/api/keys", {
        method: "POST",
        body: { name },
      });
      return newKey;
    } catch (error) {
      console.error("Failed to generate API key:", error);
      throw error;
    }
  },

  // Revoke API key
  async revokeApiKey(id: string): Promise<void> {
    try {
      await apiRequest<void>(`/settings/api/keys/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      throw error;
    }
  },

  // Mock implementation for preview mode
  mock: {
    getSettings(): Promise<Settings> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...defaultSettings });
        }, 500);
      });
    },

    updateGeneralSettings(settings: GeneralSettings): Promise<GeneralSettings> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...settings });
        }, 500);
      });
    },

    updateEmailSettings(settings: EmailSettings): Promise<EmailSettings> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...settings });
        }, 500);
      });
    },

    updateSecuritySettings(
      settings: SecuritySettings
    ): Promise<SecuritySettings> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...settings });
        }, 500);
      });
    },

    updateApiSettings(settings: ApiSettings): Promise<ApiSettings> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...settings });
        }, 500);
      });
    },

    generateApiKey(name: string): Promise<ApiKey> {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newKey: ApiKey = {
            id: `key-${Date.now()}`,
            name,
            created: new Date().toISOString().split("T")[0],
            key: `sk_test_${Math.random().toString(36).substring(2, 15)}`,
          };
          resolve(newKey);
        }, 500);
      });
    },

    revokeApiKey(id: string): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
  },
};

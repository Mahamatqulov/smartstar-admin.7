"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Save, Upload, Plus, Copy, Check, Eye, EyeOff } from "lucide-react";
import {
  SettingsService,
  defaultSettings,
  type ApiKey,
} from "@/services/settings-service";
import { useNotification } from "@/contexts/notification-context";

// Determine if we're in preview mode
const isPreviewMode =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("vercel.app") ||
    process.env.NODE_ENV === "development");

// Use the appropriate service
const settingsService = isPreviewMode ? SettingsService.mock : SettingsService;

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { showNotification } = useNotification();

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        showNotification("error", "Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [showNotification]);

  // Handle form submission for general settings
  const handleGeneralSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateGeneralSettings(settings.general);
      showNotification("success", "General settings updated successfully!");
    } catch (error) {
      console.error("Failed to update general settings:", error);
      showNotification(
        "error",
        "Failed to update general settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission for email settings
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateEmailSettings(settings.email);
      showNotification("success", "Email settings updated successfully!");
    } catch (error) {
      console.error("Failed to update email settings:", error);
      showNotification(
        "error",
        "Failed to update email settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission for security settings
  const handleSecuritySubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSecuritySettings(settings.security);
      showNotification("success", "Security settings updated successfully!");
    } catch (error) {
      console.error("Failed to update security settings:", error);
      showNotification(
        "error",
        "Failed to update security settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission for API settings
  const handleApiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateApiSettings(settings.api);
      showNotification("success", "API settings updated successfully!");
    } catch (error) {
      console.error("Failed to update API settings:", error);
      showNotification(
        "error",
        "Failed to update API settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle generating a new API key
  const handleGenerateApiKey = async (e: FormEvent) => {
    e.preventDefault();
    if (!newApiKeyName.trim()) {
      showNotification("error", "Please enter a name for the API key.");
      return;
    }

    try {
      const key = await settingsService.generateApiKey(newApiKeyName);
      setNewApiKey(key);
      setSettings((prev) => ({
        ...prev,
        apiKeys: [...prev.apiKeys, key],
      }));
      showNotification("success", "API key generated successfully!");
    } catch (error) {
      console.error("Failed to generate API key:", error);
      showNotification(
        "error",
        "Failed to generate API key. Please try again."
      );
    }
  };

  // Handle revoking an API key
  const handleRevokeApiKey = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await settingsService.revokeApiKey(id);
      setSettings((prev) => ({
        ...prev,
        apiKeys: prev.apiKeys.filter((key) => key.id !== id),
      }));
      showNotification("success", "API key revoked successfully!");
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      showNotification("error", "Failed to revoke API key. Please try again.");
    }
  };

  // Handle copying API key to clipboard
  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showNotification("success", "API key copied to clipboard!");
  };

  // Handle input change for general settings
  const handleGeneralChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  // Handle input change for email settings
  const handleEmailChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        [name]: value,
      },
    }));
  };

  // Handle input change for security settings
  const handleSecurityChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  // Handle input change for API settings
  const handleApiChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "webhookEvents") {
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(
        (option) => option.value
      );

      setSettings((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          webhookEvents: selectedOptions,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          [name]: type === "checkbox" ? checked : value,
        },
      }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow h-[600px] overflow-x-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("general")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "general"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "email"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "api"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              API
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <form onSubmit={handleGeneralSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.general.siteName}
                    onChange={handleGeneralChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site URL
                  </label>
                  <input
                    type="url"
                    name="siteUrl"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com"
                    value={settings.general.siteUrl}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Description
                </label>
                <textarea
                  name="siteDescription"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  value={settings.general.siteDescription}
                  onChange={handleGeneralChange}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.general.timezone}
                    onChange={handleGeneralChange}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="CST">Central Standard Time (CST)</option>
                    <option value="MST">Mountain Standard Time (MST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Format
                  </label>
                  <select
                    name="dateFormat"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.general.dateFormat}
                    onChange={handleGeneralChange}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Logo
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="flex items-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    No file selected
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="flex items-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Favicon
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    No file selected
                  </span>
                </div>
              </div>

              <hr className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Featured Projects
                  </label>
                  <input
                    type="number"
                    name="featuredProjects"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.general.featuredProjects}
                    onChange={handleGeneralChange}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projects Per Page
                  </label>
                  <input
                    type="number"
                    name="projectsPerPage"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.general.projectsPerPage}
                    onChange={handleGeneralChange}
                    min="10"
                    max="100"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    className="mr-2"
                    checked={settings.general.maintenanceMode}
                    onChange={handleGeneralChange}
                  />
                  <label
                    htmlFor="maintenanceMode"
                    className="text-sm text-gray-700"
                  >
                    Maintenance Mode
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "email" && (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Provider
                </label>
                <select
                  name="provider"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={settings.email.provider}
                  onChange={handleEmailChange}
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">Amazon SES</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    name="fromName"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.email.fromName}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    name="fromEmail"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.email.fromEmail}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
              </div>

              <hr className="my-6" />
              <h3 className="text-lg font-medium mb-4">SMTP Settings</h3>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    name="smtpHost"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.email.smtpHost}
                    onChange={handleEmailChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    name="smtpPort"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.email.smtpPort}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    name="smtpUsername"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={settings.email.smtpUsername}
                    onChange={handleEmailChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="smtpPassword"
                      className="w-full border rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={settings.email.smtpPassword}
                      onChange={handleEmailChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encryption
                </label>
                <select
                  name="encryption"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={settings.email.encryption}
                  onChange={handleEmailChange}
                >
                  <option value="none">None</option>
                  <option value="ssl">SSL</option>
                  <option value="tls">TLS</option>
                </select>
              </div>

              <hr className="my-6" />
              <h3 className="text-lg font-medium mb-4">Email Templates</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Email Template
                </label>
                <textarea
                  name="welcomeTemplate"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  value={settings.email.welcomeTemplate}
                  onChange={handleEmailChange}
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Approval Template
                </label>
                <textarea
                  name="approvalTemplate"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  value={settings.email.approvalTemplate}
                  onChange={handleEmailChange}
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Email Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleSecuritySubmit}>
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    name="twoFactorAuth"
                    className="mr-2"
                    checked={settings.security.twoFactorAuth}
                    onChange={handleSecurityChange}
                  />
                  <label
                    htmlFor="twoFactorAuth"
                    className="text-sm text-gray-700"
                  >
                    Two-Factor Authentication
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  name="passwordExpiry"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={settings.security.passwordExpiry}
                  onChange={handleSecurityChange}
                  min="0"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={settings.security.maxLoginAttempts}
                  onChange={handleSecurityChange}
                  min="1"
                  max="10"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={settings.security.sessionTimeout}
                  onChange={handleSecurityChange}
                  min="5"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed IP Addresses (one per line)
                </label>
                <textarea
                  name="allowedIps"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Leave blank to allow all IPs"
                  value={settings.security.allowedIps}
                  onChange={handleSecurityChange}
                ></textarea>
              </div>

              <hr className="my-6" />
              <h3 className="text-lg font-medium mb-4">Password Policy</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  name="minPasswordLength"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={settings.security.minPasswordLength}
                  onChange={handleSecurityChange}
                  min="6"
                  max="20"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireUppercase"
                    name="requireUppercase"
                    className="mr-2"
                    checked={settings.security.requireUppercase}
                    onChange={handleSecurityChange}
                  />
                  <label
                    htmlFor="requireUppercase"
                    className="text-sm text-gray-700"
                  >
                    Require Uppercase
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireNumbers"
                    name="requireNumbers"
                    className="mr-2"
                    checked={settings.security.requireNumbers}
                    onChange={handleSecurityChange}
                  />
                  <label
                    htmlFor="requireNumbers"
                    className="text-sm text-gray-700"
                  >
                    Require Numbers
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    name="requireSpecialChars"
                    className="mr-2"
                    checked={settings.security.requireSpecialChars}
                    onChange={handleSecurityChange}
                  />
                  <label
                    htmlFor="requireSpecialChars"
                    className="text-sm text-gray-700"
                  >
                    Require Special Characters
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "api" && (
            <form onSubmit={handleApiSubmit}>
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableApi"
                    name="enableApi"
                    className="mr-2"
                    checked={settings.api.enableApi}
                    onChange={handleApiChange}
                  />
                  <label htmlFor="enableApi" className="text-sm text-gray-700">
                    Enable API
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (requests per minute)
                </label>
                <input
                  type="number"
                  name="rateLimit"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={settings.api.rateLimit}
                  onChange={handleApiChange}
                  min="10"
                  max="1000"
                />
              </div>

              <hr className="my-6" />
              <h3 className="text-lg font-medium mb-4">API Keys</h3>

              <div className="bg-gray-50 border rounded-md p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-700 mb-2">
                  <div>Key Name</div>
                  <div>Created</div>
                  <div>Actions</div>
                </div>
                <hr className="my-2" />
                {settings.apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="grid grid-cols-3 gap-4 text-sm py-2"
                  >
                    <div>{key.name}</div>
                    <div>{key.created}</div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleRevokeApiKey(key.id)}
                        className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(true)}
                  className="flex items-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New API Key
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="text"
                  name="webhookUrl"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/webhook"
                  value={settings.api.webhookUrl}
                  onChange={handleApiChange}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Events
                </label>
                <select
                  multiple
                  name="webhookEvents"
                  className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  size={5}
                  value={settings.api.webhookEvents}
                  onChange={handleApiChange}
                >
                  <option value="project.created">Project Created</option>
                  <option value="project.updated">Project Updated</option>
                  <option value="project.funded">Project Funded</option>
                  <option value="pledge.created">Pledge Created</option>
                  <option value="user.registered">User Registered</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl (or Cmd) to select multiple events
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save API Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Generate New API Key</h3>
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setNewApiKey(null);
                  setNewApiKeyName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            {newApiKey ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Your API key has been generated. Please copy it now as you
                    won't be able to see it again.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md flex items-center justify-between">
                    <code className="text-sm break-all">{newApiKey.key}</code>
                    <button
                      onClick={() => handleCopyApiKey(newApiKey.key!)}
                      className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setNewApiKey(null);
                      setNewApiKeyName("");
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 mr-2 inline" />
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateApiKey}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key Name
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. Production API Key"
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setNewApiKeyName("");
                    }}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

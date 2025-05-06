"use client";

import type React from "react";

import { useState, useEffect, useCallback, useRef, RefObject } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Eye,
  ChevronRight,
} from "lucide-react";
import { apiService, type Project } from "@/services/api-service";
import { useNotification } from "@/contexts/notification-context";
import StatsCards from "./stats-cards";
import Link from "next/link";

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentStat, setCurrentStat] = useState<DashboardStat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    value: "",
    change: "",
    trend: "up" as "up" | "down",
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();

  // Handle click outside to close dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowEditModal(false);
        setShowDeleteModal(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardStats = await apiService.getDashboardStats();

      // Transform API data to component format
      const transformedStats: DashboardStat[] = [
        {
          title: "Total Projects",
          value: dashboardStats.totalProjects,
          change: dashboardStats.projectsGrowth,
          trend: dashboardStats.projectsGrowth.startsWith("+") ? "up" : "down",
        },
        {
          title: "Total Funding",
          value: dashboardStats.totalFunding,
          change: dashboardStats.fundingGrowth,
          trend: dashboardStats.fundingGrowth.startsWith("+") ? "up" : "down",
        },
        {
          title: "Total Pledges",
          value: dashboardStats.totalPledges,
          change: dashboardStats.pledgesGrowth,
          trend: dashboardStats.pledgesGrowth.startsWith("+") ? "up" : "down",
        },
        {
          title: "Active Projects",
          value: dashboardStats.activeProjects,
          change: dashboardStats.activeProjectsGrowth,
          trend: dashboardStats.activeProjectsGrowth.startsWith("+")
            ? "up"
            : "down",
        },
      ];

      setStats(transformedStats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      showNotification("error", "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchRecentProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      const projects = await apiService.getProjects({
        limit: "5",
        sort: "createdAt:desc",
      });
      setRecentProjects(projects);
    } catch (error) {
      console.error("Failed to fetch recent projects:", error);
      showNotification("error", "Failed to load recent projects");
    } finally {
      setProjectsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchStats();
    fetchRecentProjects();
  }, [fetchStats, fetchRecentProjects]);

  const handleMenuToggle = (statTitle: string) => {
    setShowMenu((prev) => (prev === statTitle ? null : statTitle));
  };

  const handleEditClick = (stat: DashboardStat) => {
    // Prevent event propagation to avoid immediate modal closing
    event?.stopPropagation();

    setCurrentStat(stat);
    setEditFormData({
      title: stat.title,
      value: stat.value,
      change: stat.change,
      trend: stat.trend,
    });
    setShowEditModal(true);
    setShowMenu(null);
  };

  const handleDeleteClick = (stat: DashboardStat) => {
    // Prevent event propagation to avoid immediate modal closing
    event?.stopPropagation();

    setCurrentStat(stat);
    setShowDeleteModal(true);
    setShowMenu(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentStat) return;

    try {
      setIsSubmitting(true);

      // In a real app, this would call an API endpoint
      // await apiService.updateDashboardStat(currentStat.id, editFormData)

      // For demo, we'll update the local state
      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.title === currentStat.title ? { ...editFormData } : stat
        )
      );

      showNotification("success", `${editFormData.title} has been updated`);
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to update stat:", error);
      showNotification("error", "Failed to update dashboard statistic");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentStat) return;

    try {
      setIsSubmitting(true);

      // In a real app, this would call an API endpoint
      // await apiService.deleteDashboardStat(currentStat.id)

      // For demo, we'll update the local state
      setStats((prevStats) =>
        prevStats.filter((stat) => stat.title !== currentStat.title)
      );

      showNotification("success", `${currentStat.title} has been deleted`);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete stat:", error);
      showNotification("error", "Failed to delete dashboard statistic");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modal backdrop click handler
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowEditModal(false);
      setShowDeleteModal(false);
    }
  };

  // Get category color for badge
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Art Books": "bg-blue-100 text-blue-800",
      Publishing: "bg-green-100 text-green-800",
      Games: "bg-purple-100 text-purple-800",
      Design: "bg-yellow-100 text-yellow-800",
      Film: "bg-red-100 text-red-800",
      Art: "bg-blue-100 text-blue-800",
      Comics: "bg-indigo-100 text-indigo-800",
      Music: "bg-pink-100 text-pink-800",
      Technology: "bg-cyan-100 text-cyan-800",
      Food: "bg-orange-100 text-orange-800",
    };

    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Pending":
        return "text-yellow-600";
      case "Ended":
        return "text-gray-600";
      case "Suspended":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your platform's performance</p>
      </div> */}

      <StatsCards
        stats={stats}
        loading={loading}
        onMenuToggle={handleMenuToggle}
        showMenu={showMenu}
        menuRef={menuRef as RefObject<HTMLDivElement>}
      >
        {(stat: DashboardStat) => (
          <div
            className="relative"
            ref={showMenu === stat.title ? menuRef : undefined}
          >
            <button
              onClick={() => handleMenuToggle(stat.title)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMenu === stat.title && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(stat);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Statistic
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(stat);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Statistic
                </button>
              </div>
            )}
          </div>
        )}
      </StatsCards>

      {/* Recent Projects Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
          <Link
            href="#"
            onClick={() =>
              document.dispatchEvent(
                new CustomEvent("sidebarNavigate", { detail: "projects" })
              )
            }
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all projects
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {projectsLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-3">
                          by {project.creator}
                        </span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(
                            project.category
                          )}`}
                        >
                          {project.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {project.funding}
                        </div>
                        <div
                          className={`text-xs ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </div>
                      </div>
                      <Link
                        href="#"
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        aria-label={`View ${project.name}`}
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {project.progress}% funded
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No recent projects found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Statistic
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="value"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Value
                  </label>
                  <input
                    type="text"
                    id="value"
                    name="value"
                    value={editFormData.value}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="change"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Change
                  </label>
                  <input
                    type="text"
                    id="change"
                    name="change"
                    value={editFormData.change}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="trend"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Trend
                  </label>
                  <select
                    id="trend"
                    name="trend"
                    value={editFormData.trend}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleModalBackdropClick}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{currentStat?.title}</span>?
                This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

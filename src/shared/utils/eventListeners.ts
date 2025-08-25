/**
 * 🎯 EVENT LISTENERS - HEADER FUNCTIONALITY
 * ==========================================
 *
 * Implementación de listeners para los eventos custom del header admin.
 * Proporciona funcionalidad demo y estructura para implementaciones reales.
 *
 * Created: 2025-01-18 - Header functionality implementation
 */

"use client";

// 🎯 Types for event data
interface SearchEventDetail {
  source: string;
  user: string;
  currentPath: string;
}

interface NotificationsEventDetail {
  action: string;
  user: string;
  timestamp: string;
}

interface ProfileEventDetail {
  action: string;
  user: {
    email: string;
    name: string;
    role: string;
  };
}

interface AuditEventDetail {
  event: {
    id: string;
    action: string;
    resourceType: string;
    userId: string;
    timestamp: string;
    changes?: Array<{
      field: string;
      oldValue: string;
      newValue: string;
    }>;
    riskLevel?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  source: string;
}

// 🔍 Search Event Listener
export const setupSearchListener = () => {
  const handleSearch = (e: CustomEvent<SearchEventDetail>) => {
    const { user, currentPath } = e.detail;

    console.log("🔍 Search triggered:", e.detail);

    // 🎯 Create and show search modal
    const searchModal = createSearchModal(user, currentPath);
    document.body.appendChild(searchModal);

    // 🎯 Focus on search input
    const searchInput = searchModal.querySelector("input") as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  window.addEventListener("admin-search", handleSearch as EventListener);
  return () =>
    window.removeEventListener("admin-search", handleSearch as EventListener);
};

// 🔔 Notifications Event Listener
export const setupNotificationsListener = () => {
  const handleNotifications = (e: CustomEvent<NotificationsEventDetail>) => {
    const { user, timestamp } = e.detail;

    console.log("🔔 Notifications triggered:", e.detail);

    // 🎯 Toggle notifications panel
    const existingPanel = document.getElementById("notifications-panel");

    if (existingPanel) {
      // Close if already open
      existingPanel.remove();
    } else {
      // Create and show notifications panel
      const notificationsPanel = createNotificationsPanel(user, timestamp);
      document.body.appendChild(notificationsPanel);
    }
  };

  window.addEventListener(
    "admin-notifications",
    handleNotifications as EventListener
  );
  return () =>
    window.removeEventListener(
      "admin-notifications",
      handleNotifications as EventListener
    );
};

// 👤 Profile Menu Event Listener
export const setupProfileListener = () => {
  const handleProfile = (e: CustomEvent<ProfileEventDetail>) => {
    const { user } = e.detail;

    console.log("👤 Profile menu triggered:", e.detail);

    // 🎯 Toggle profile dropdown
    const existingDropdown = document.getElementById("profile-dropdown");

    if (existingDropdown) {
      // Close if already open
      existingDropdown.remove();
    } else {
      // Create and show profile dropdown
      const profileDropdown = createProfileDropdown(user);
      document.body.appendChild(profileDropdown);
    }
  };

  window.addEventListener("admin-profile-menu", handleProfile as EventListener);
  return () =>
    window.removeEventListener(
      "admin-profile-menu",
      handleProfile as EventListener
    );
};

// 📋 Audit Event Modal Listener
export const setupAuditEventListener = () => {
  const handleAuditEvent = (e: CustomEvent<AuditEventDetail>) => {
    const { event, source } = e.detail;

    console.log("📋 Audit event modal triggered:", e.detail);

    // 🎯 Create and show audit event modal
    const auditModal = createAuditEventModal(event, source);
    document.body.appendChild(auditModal);
  };

  window.addEventListener(
    "open-audit-event-modal",
    handleAuditEvent as EventListener
  );
  return () =>
    window.removeEventListener(
      "open-audit-event-modal",
      handleAuditEvent as EventListener
    );
};

// 🔍 Create Search Modal
const createSearchModal = (user: string, currentPath: string): HTMLElement => {
  const modal = document.createElement("div");
  modal.id = "search-modal";
  modal.className =
    "fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50";

  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <h3 class="font-semibold text-slate-900 dark:text-slate-100">Search Dashboard</h3>
        </div>
        <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" onclick="this.closest('#search-modal').remove()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Search Input -->
      <div class="p-4">
        <div class="relative">
          <svg class="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search users, files, settings..." 
            class="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onkeydown="if(event.key==='Enter') handleSearch(this.value)"
          >
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="p-4 border-t border-slate-100 dark:border-slate-700">
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Quick Actions</p>
        <div class="grid grid-cols-2 gap-2">
          <button class="flex items-center gap-2 p-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <span class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">👥</span>
            <span class="text-sm">Search Users</span>
          </button>
          <button class="flex items-center gap-2 p-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <span class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 text-sm">📁</span>
            <span class="text-sm">Search Files</span>
          </button>
          <button class="flex items-center gap-2 p-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <span class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm">⚙️</span>
            <span class="text-sm">Settings</span>
          </button>
          <button class="flex items-center gap-2 p-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <span class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 text-sm">📊</span>
            <span class="text-sm">Analytics</span>
          </button>
        </div>
      </div>
      
      <!-- User Info -->
      <div class="px-4 pb-4">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          🔍 Searching as: <span class="font-medium">${user}</span> • Path: <span class="font-medium">${currentPath}</span>
        </p>
      </div>
    </div>
  `;

  // Close on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Add global search function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).handleSearch = (query: string) => {
    console.log(`🔍 Search query: "${query}"`);
    alert(
      `🔍 Search Results for: "${query}"\n\n✅ This would show real search results!\n\n🚀 Implementation ideas:\n- Full-text search across users\n- File search with filters\n- Settings search\n- Command palette functionality`
    );
    modal.remove();
  };

  return modal;
};

// 🔔 Create Notifications Panel
const createNotificationsPanel = (
  user: string,
  timestamp: string
): HTMLElement => {
  const panel = document.createElement("div");
  panel.id = "notifications-panel";
  panel.className =
    "fixed top-16 right-4 z-40 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700";

  const mockNotifications = [
    {
      id: 1,
      type: "user",
      title: "New User Registration",
      message: "john@example.com just registered",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      type: "system",
      title: "System Update",
      message: "Security patch applied successfully",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      type: "file",
      title: "File Upload",
      message: "5 new files uploaded to gallery",
      time: "3h ago",
      unread: false,
    },
    {
      id: 4,
      type: "audit",
      title: "Audit Event",
      message: "User permissions modified",
      time: "5h ago",
      unread: false,
    },
  ];

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  panel.innerHTML = `
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM9 7v0a3 3 0 013 3v4a3 3 0 01-3 3v0M9 7V5a2 2 0 012-2h4a2 2 0 012 2v2M9 7h6"/>
        </svg>
        <h3 class="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
        ${
          unreadCount > 0
            ? `<span class="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full">${unreadCount} new</span>`
            : ""
        }
      </div>
      <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" onclick="this.closest('#notifications-panel').remove()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <!-- Notifications List -->
    <div class="max-h-96 overflow-y-auto">
      ${mockNotifications
        .map(
          (notification) => `
        <div class="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
          notification.unread ? "bg-blue-50 dark:bg-blue-950/20" : ""
        }">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center ${getNotificationIconBg(
              notification.type
            )}">
              ${getNotificationIcon(notification.type)}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="font-medium text-slate-900 dark:text-slate-100 text-sm">${
                  notification.title
                }</h4>
                ${
                  notification.unread
                    ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>'
                    : ""
                }
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${
                notification.message
              }</p>
              <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">${
                notification.time
              }</p>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    
    <!-- Footer -->
    <div class="p-3 border-t border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-between">
        <button class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200" onclick="markAllAsRead()">
          Mark all as read
        </button>
        <button class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
          View all notifications
        </button>
      </div>
    </div>
    
    <!-- User Info -->
    <div class="px-4 pb-2">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        🔔 Notifications for: <span class="font-medium">${user}</span> • Updated: <span class="font-medium">${new Date(
    timestamp
  ).toLocaleTimeString()}</span>
      </p>
    </div>
  `;

  // Add global mark all as read function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).markAllAsRead = () => {
    console.log("🔔 Marking all notifications as read");
    // Update UI
    const unreadIndicators = panel.querySelectorAll(
      ".bg-blue-50, .bg-blue-950\\/20, .bg-blue-500"
    );
    unreadIndicators.forEach((el) => {
      if (el.classList.contains("bg-blue-500")) {
        (el as HTMLElement).style.display = "none";
      } else {
        el.classList.remove("bg-blue-50", "bg-blue-950/20");
      }
    });

    // Update badge
    const badge = panel.querySelector(".bg-red-100, .bg-red-900");
    if (badge) {
      badge.remove();
    }

    alert("✅ All notifications marked as read!");

    // Trigger refresh event for badge
    window.dispatchEvent(new CustomEvent("refresh-notifications"));
  };

  return panel;
};

// 👤 Create Profile Dropdown
const createProfileDropdown = (user: {
  email: string;
  name: string;
  role: string;
}): HTMLElement => {
  const dropdown = document.createElement("div");
  dropdown.id = "profile-dropdown";
  dropdown.className =
    "fixed top-16 right-4 z-40 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700";

  const profileActions = [
    {
      icon: "👤",
      label: "View Profile",
      action: () => alert("🚀 Navigate to /admin/profile"),
    },
    {
      icon: "⚙️",
      label: "Account Settings",
      action: () => alert("🚀 Navigate to /admin/settings/account"),
    },
    {
      icon: "🔒",
      label: "Change Password",
      action: () => alert("🚀 Open change password modal"),
    },
    {
      icon: "🎨",
      label: "Appearance",
      action: () => alert("🚀 Open theme settings"),
    },
    {
      icon: "📊",
      label: "Activity Log",
      action: () => alert("🚀 Navigate to /admin/activity"),
    },
    {
      icon: "🚪",
      label: "Logout",
      action: () =>
        confirm("Are you sure you want to logout?") &&
        alert("🚀 Logout action"),
    },
  ];

  dropdown.innerHTML = `
    <!-- User Info Header -->
    <div class="p-4 border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 class="font-semibold text-slate-900 dark:text-slate-100">${
            user.name
          }</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">${
            user.email
          }</p>
          <p class="text-xs text-slate-500 dark:text-slate-500 capitalize">Role: ${user.role.replace(
            "_",
            " "
          )}</p>
        </div>
      </div>
    </div>
    
    <!-- Profile Actions -->
    <div class="py-2">
      ${profileActions
        .map(
          (action, index) => `
        <button 
          class="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onclick="handleProfileAction(${index})"
        >
          <span class="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm">
            ${action.icon}
          </span>
          <span class="text-sm font-medium">${action.label}</span>
        </button>
      `
        )
        .join("")}
    </div>
    
    <!-- Footer -->
    <div class="p-3 border-t border-slate-200 dark:border-slate-700">
      <p class="text-xs text-slate-500 dark:text-slate-400 text-center">
        Profile Menu • Click outside to close
      </p>
    </div>
  `;

  // Close on background click
  const handleOutsideClick = (e: Event) => {
    if (!dropdown.contains(e.target as Node)) {
      dropdown.remove();
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 100);

  // Add profile action handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).handleProfileAction = (index: number) => {
    const action = profileActions[index];
    console.log(`👤 Profile action: ${action.label}`);
    action.action();
    dropdown.remove();
  };

  return dropdown;
};

// 📋 Create Audit Event Modal
interface AuditEvent {
  id: string;
  action: string;
  resourceType: string;
  userId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  changes?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
  riskLevel?: 'low' | 'medium' | 'high';
  ipAddress?: string;
  userAgent?: string;
}

const createAuditEventModal = (event: AuditEvent, source: string): HTMLElement => {
  const modal = document.createElement("div");
  modal.id = "audit-event-modal";
  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50";

  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="font-semibold text-slate-900 dark:text-slate-100">Audit Event Details</h3>
        </div>
        <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" onclick="this.closest('#audit-event-modal').remove()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Event Details -->
      <div class="p-6 space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event ID</label>
            <p class="text-sm text-slate-900 dark:text-slate-100 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">${
              event.id
            }</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Action</label>
            <p class="text-sm text-slate-900 dark:text-slate-100 font-semibold">${
              event.action
            }</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resource Type</label>
            <p class="text-sm text-slate-900 dark:text-slate-100">${
              event.resourceType
            }</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User ID</label>
            <p class="text-sm text-slate-900 dark:text-slate-100 font-mono">${
              event.userId
            }</p>
          </div>
        </div>
        
        <!-- Timestamp -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Timestamp</label>
          <p class="text-sm text-slate-900 dark:text-slate-100">${new Date(
            event.timestamp
          ).toLocaleString()}</p>
        </div>
        
        <!-- Changes -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Changes Made</label>
          <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            ${
              event.changes && event.changes.length > 0
                ? event.changes
                    .map(
                      (change: {
                        field: string;
                        oldValue: string;
                        newValue: string;
                      }) => `
              <div class="mb-2 last:mb-0">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${
                  change.field
                }:</span>
                <span class="text-sm text-red-600 dark:text-red-400 line-through ml-2">${
                  change.oldValue || "null"
                }</span>
                <span class="text-sm text-slate-500 dark:text-slate-400 mx-1">→</span>
                <span class="text-sm text-green-600 dark:text-green-400">${
                  change.newValue
                }</span>
              </div>
            `
                    )
                    .join("")
                : '<p class="text-sm text-slate-500 dark:text-slate-400">No changes recorded</p>'
            }
          </div>
        </div>
        
        <!-- Metadata -->
        <div class="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Event Metadata</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-blue-700 dark:text-blue-300">Source:</span>
              <span class="text-blue-900 dark:text-blue-100 ml-1 font-medium">${source}</span>
            </div>
            <div>
              <span class="text-blue-700 dark:text-blue-300">Risk Level:</span>
              <span class="text-blue-900 dark:text-blue-100 ml-1 font-medium">${
                event.riskLevel || "Low"
              }</span>
            </div>
            <div>
              <span class="text-blue-700 dark:text-blue-300">IP Address:</span>
              <span class="text-blue-900 dark:text-blue-100 ml-1 font-mono">${
                event.ipAddress || "192.168.1.1"
              }</span>
            </div>
            <div>
              <span class="text-blue-700 dark:text-blue-300">User Agent:</span>
              <span class="text-blue-900 dark:text-blue-100 ml-1 truncate">${
                event.userAgent || "Browser/1.0"
              }</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Audit Event from ${source} • Click outside to close
        </p>
        <div class="flex gap-2">
          <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onclick="alert('🚀 Export event data')">
            Export
          </button>
          <button class="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onclick="this.closest('#audit-event-modal').remove()">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  // Close on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  return modal;
};

// 🎨 Helper functions for notification icons
const getNotificationIcon = (type: string): string => {
  const icons = {
    user: "👤",
    system: "⚙️",
    file: "📁",
    audit: "📋",
    security: "🔒",
    update: "🔄",
  };
  return icons[type as keyof typeof icons] || "📢";
};

const getNotificationIconBg = (type: string): string => {
  const backgrounds = {
    user: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    system: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    file: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    audit:
      "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    security: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    update:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
  };
  return (
    backgrounds[type as keyof typeof backgrounds] ||
    "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
  );
};

// 🎯 Setup All Listeners
export const setupAllEventListeners = () => {
  const cleanupFunctions = [
    setupSearchListener(),
    setupNotificationsListener(),
    setupProfileListener(),
    setupAuditEventListener(),
  ];

  console.log("✅ All header functionality event listeners setup complete!");
  console.log("🎯 Click header buttons to see working functionality:");
  console.log("   🔍 Search button → Opens search modal with quick actions");
  console.log("   🔔 Notifications button → Shows notifications panel");
  console.log("   👤 Profile button → Opens profile dropdown menu");
  console.log("   📋 Audit events → Shows detailed event modals");

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
    // Clean up any existing modals/panels
    document.getElementById("search-modal")?.remove();
    document.getElementById("notifications-panel")?.remove();
    document.getElementById("profile-dropdown")?.remove();
    document.getElementById("audit-event-modal")?.remove();
    console.log("🧹 Event listeners and UI elements cleaned up");
  };
};

// 🚀 Individual setup functions are already exported above with their definitions

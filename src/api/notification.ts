import { request } from '@/utils/request';

export interface NotificationItem {
  id: number;
  userId: number;
  type: string; // 'order' | 'health' | 'emergency'
  title: string;
  content: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListRes {
  items: NotificationItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * 获取当前用户的通知列表（分页）
 */
export function getNotifications(data?: { page?: number; limit?: number }) {
  return request({
    url: '/api/notifications',
    method: 'GET',
    data,
  });
}

/**
 * 获取当前用户的未读通知数量
 */
export function getUnreadCount() {
  return request({
    url: '/api/notifications/unread-count',
    method: 'GET',
  });
}

/**
 * 将某条通知标记为已读
 */
export function markAsRead(id: number) {
  return request({
    url: `/api/notifications/${id}/read`,
    method: 'PUT',
  });
}

/**
 * 将所有未读通知标记为已读
 */
export function markAllAsRead() {
  return request({
    url: '/api/notifications/read-all',
    method: 'PUT',
  });
}

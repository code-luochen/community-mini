import { request } from '@/utils/request'

export const fetchAnnouncements = () => {
  return request({
    url: '/api/announcement',
    method: 'GET'
  })
}

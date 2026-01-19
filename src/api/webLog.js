import request from '@/utils/request'

export function fetchLogList(params) {
  return request({
    url: '/webLog/list',
    method: 'get',
    params: params
  })
}

export function getLogById(id) {
  return request({
    url: '/webLog/' + id,
    method: 'get'
  })
}

import { request } from '@/utils/request';

export function getHomePageData() {
    return request({
        url: '/home/graph',
        method: 'get',
    })
}


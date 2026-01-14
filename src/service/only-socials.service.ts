import { ApiResponse } from "@/types/modules/only-socials";
import { AxiosResponse } from 'axios';

const axios = require('axios');
const token = process.env.ONLY_SOCIALS;
const workspaceId = process.env.ONLY_SOCIALS_WORKSPACE;

export const onlySocialsService = () => {
    return {
        listOfPosts: (page = 1) => {
            return axios.get(`https://app.onlysocial.io/os/api/${workspaceId}/posts?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then((response: AxiosResponse<ApiResponse>) => {
                return response.data; // This returns ApiResponse
            }).catch((error: any) => {
                throw new Error(error);
            });
        }
    }
}
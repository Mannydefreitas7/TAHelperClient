import axios from "axios"

class TenantService {

    async fetch() {
        const url = `${import.meta.env.VITE_BASE_URL}/user/tenants`
        const { data } = await axios.get(url)
        if (data) {
            return data
        }
    }

    async getInvitedUsers() {
        const url = `${import.meta.env.VITE_BASE_URL}/user/invited-users`
        const { data } = await axios.get(url)
        if (data) {
            return data
        }
    }

}
const tenantService = new TenantService()
export default tenantService;
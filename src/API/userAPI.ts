import { IUser } from "@/models/User";

const userAPI = {
    createUser: async (user: IUser) => {
        const response = await fetch('/api/user', {
            method: 'POST',
            body: JSON.stringify(user)
        })
        return response.json();
    }
}

export default userAPI;
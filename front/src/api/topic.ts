import {Api} from "@/api/axios.ts";

const getTopics = async() => {
    return await Api.get("/api/clients/topics");
}

export {getTopics};

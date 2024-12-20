import {Api} from "@/api/axios.ts";

const postClient = async(registrationStatus:string, name:string, topic:string, contactNumber:string, gender:string, birth:string) => {
    console.log(birth)
    return Api.post("/api/clients", {
        registrationStatus,
        name,
        topic,
        contactNumber,
        gender,
        birth,
    })
}

const updateClient = async(id:string, registrationStatus:string, name:string, topic:string, contactNumber:string, gender:string, birth:string) => {
    return Api.put(`/api/clients/update/${id}`, {
        registrationStatus,
        name,
        topic,
        contactNumber,
        gender,
        birth,
    })
}

const getClients = async() => {
    return Api.get("/api/clients/assigned-clients")
}

const postAnalysis = async(clientId:string, minuteOfCounseling: string, audioFile:Blob) => {
    const numericValue = Number(minuteOfCounseling) || 0;
    if (numericValue === 0) {
        alert("상담 시간을 입력해주세요.");
        return;
    }
    const formData = new FormData();
    formData.append("file", audioFile);
    return Api.post(`/api/sessions/${clientId}/${numericValue}/analyze-recording`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    } )
}

const getDashboardData = async(id:string) => {
    return Api.get(`/api/sessions/dashboard/${id}`)
}

const getClient = async(id:string) => {
    return Api.get(`/api/clients/${id}`)
}

const getDominantEmotionByClient = async (clientId: string) => {
    return Api.get(`/api/sessions/dominant-by-client/${clientId}`);
};

export {postClient, getClients, postAnalysis, getDashboardData, getClient, updateClient, getDominantEmotionByClient}

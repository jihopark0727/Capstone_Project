import axios from "axios";

const login = async(email: string, password: string) => {
    return await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
    })
}

const signup = async (email: string, name: string, phoneNumber: string, password: string, confirmPassword: string) => {
    return await axios.post('http://localhost:8080/api/auth/signUp', {
        email, name, password, confirmPassword, phoneNumber
    })
};

export {login, signup};

import { HTTP } from "koishi";
import { Config } from "./config";

export async function nailong(img: any, http: HTTP, cfg: Config) {
    const apiUrl = "http://192.168.0.90:9656/predict";
    const imageFile = img
        .then(base64String => {
            console.log(base64String);
        })
        .catch(error => {
            console.error(error);
        });
    const response = await http.post(apiUrl, {
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            img: img
        }
    });

    return response;
}
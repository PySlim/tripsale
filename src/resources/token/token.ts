import jwt from 'jsonwebtoken';

import {getEnvVar} from "../../utils/environment/captureVariables/get.var.env";
import {userInterfaceData} from "../../app/user/model/user.object.model";


export function generateToken(user: userInterfaceData) {
    const payload:any = {
        id: user.id,
        email: user.email,
    };
    const secret = getEnvVar('SECRET_PASS');
    const options = { expiresIn: '1h' };
    return jwt.sign(payload, secret, options);
}

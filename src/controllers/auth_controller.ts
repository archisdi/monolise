import { HttpError } from 'tymon';

import Validator from '../middlewares/request_validator';
import BaseController from './base/base_controller';
import { IContext } from '../typings/common';
import { LoginHandlerInput, LoginHandlerOutput } from 'src/typings/methods/auth';
import RepoService from '../utils/factory/repository';
import { UserModel } from '../models/user_model';

export default class AuthController extends BaseController {
    public async login(data: LoginHandlerInput, context: IContext): Promise<LoginHandlerOutput> {
        const {
            body: { username, password }
        } = data;

        const userRepo = RepoService.getSql(UserModel);
        const user = await userRepo.findOne({ username });

        if (!user) {
            throw HttpError.UnauthorizedError('credential not match', 'CREDENTIAL_NOT_MATCH');
        }

        const jwtToken = user.signJwtToken(password);

        /** save and cache */
        await Promise.all([user.save(), user.cache()]);

        return {
            token: jwtToken,
            refresh_token: user.refresh_token,
            expires_in: Number(process.env.JWT_LIFETIME)
        };
        // Wrap in try/catch block if transaction is needed
    }

    public setRoutes(): void {
        this.addRoute('post', '/login', this.login, Validator('login'));
    }
}

import { DBContext, RedisContext } from 'tymon';
import { Application } from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';

import AuthController from './controllers/auth_controller';
import ProfileController from './controllers/profile_controller';

import ExceptionHandler from './middlewares/exception';
import NotFoundHandler from './middlewares/not_found';
import PostController from './controllers/post_controller';

class App {
    private app: Application;
    private port: number = 3000;

    public constructor(port: number) {
        this.app = express();
        this.port = port;

        this.setupPlugins();
        this.setupModules();
        this.setupControllers();
        this.setupExceptionHandlers();
    }

    private setupControllers(): void {
        this.app.use('/auth', new AuthController().getRoutes());
        this.app.use('/profile', new ProfileController().getRoutes());
        this.app.use('/post', new PostController().getRoutes());
    }

    private setupModules(): void {
        DBContext.initialize({
            connection_string: String(process.env.DB_CONNECTION_STRING),
            models_path: '/database/models'
        });
        RedisContext.initialize({
            connection_string: String(process.env.REDIS_CONNECTION_STRING)
        });
    }

    private setupPlugins(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(helmet());
        this.app.use(cors());
    }

    private setupExceptionHandlers(): void {
        this.app.use(NotFoundHandler);
        this.app.use(ExceptionHandler);
    }

    public start(): void {
        this.app.listen(this.port, (): void => {
            console.info('server started on port: ' + this.port);
        });
    }
}

export default App;

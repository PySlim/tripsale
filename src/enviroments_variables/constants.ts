export class ConstantsModule {
    static readonly PROTOCOL:string = 'http://'
    static readonly SERVER_HOST: string = '18.118.215.117';
    static readonly PORT: number = 5500;
    static readonly LIMIT_PAGINATION: string='50';
}

export class ConstantsResponse {
    static readonly OK: number = 200;
    static readonly CREATED: number = 201;
    static readonly NO_CONTENT: number = 204;
    static readonly BAD_REQUEST: number = 400;
    static readonly UNAUTHORIZED: number = 401;
    static readonly FORBIDDEN: number = 403;
    static readonly NOT_FOUND: number = 404;
    static readonly UNPROCESSABLE_ENTITY: number= 422;
    static readonly INTERNAL_SERVER_ERROR: number = 500;
    static readonly BAD_GATEWAY: number = 502;
}

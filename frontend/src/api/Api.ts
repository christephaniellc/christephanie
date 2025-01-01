import { FamilyUnitDto, GuestDto } from '@/types/api';
import { getConfig } from '@/browser-config';

export type ApiResponse<T> = {
  data: T | undefined;
  error: ApiError | undefined;
};

export type ApiError = {
  status: number;
  error: string;
  description: string;
  meta?: Map<string, string>;
};


export default class Api {

  // eslint-disable-next-line no-unused-vars
  constructor(private readonly navigate: (path: string) => void) {

  }

  getJwt = (): string | null => {
    return window.localStorage.getItem('jwt');
  };

  getMe = (): Promise<ApiResponse<GuestDto>> => {
    return this.get('/GuestDtos/me', (response: GuestDto) => {
      if (response === undefined) {
        return response;
      }
      return response;
    });
  };

  findUser = (invitationCode: string, firstName: string): Promise<ApiResponse<string>> => {
    return this.getPublic(`/user/find?invitationCode=${invitationCode}&firstName=${firstName}`)
      // .then((response: string) => {
      //   console.log(response);
      //   return response;
      // })
      // .catch((reason: string) => {
      //   console.log(reason);
      //   return Error(reason);
        // console.log(`mocking response for provided params: ${invitationCode} and ${firstName}`);
        // return Promise.resolve('6f2e238d-6792-453f-82d1-1cde35414d5b');
      // });
  };

  getFamilyUnit = (): Promise<ApiResponse<FamilyUnitDto>> => {
    console.log('getting family unit');
    return this.get('/familyunit')
  };

  getGuestDto = (id: number): Promise<ApiResponse<GuestDto>> => this.get(`/GuestDtos/${id}`);
  postGuestDto = (GuestDto: GuestDto): Promise<ApiResponse<GuestDto>> => this.post(`/GuestDtos`, GuestDto);
  patchGuestDto = (GuestDto: GuestDto): Promise<ApiResponse<GuestDto>> => this.patch(`/GuestDtos/${GuestDto.guestId}`, GuestDto);
  deleteGuestDto = (id: number): Promise<ApiResponse<GuestDto>> => this.delete(`/GuestDtos/${id}/change-password`);

  private handleResponse = <T>(response: Response): Promise<ApiResponse<T>> => {
    console.log(response.status);
    switch (response.status) {
      case 200:
        return Promise.resolve(response.json());

      case 400:
        return this.handleRecoverableError(response);

      case 401:
        return this.handleUnRecoverableError(response, () => {
          console.log('api auth check fail, logging out');
          console.error('received unauth\'d');
          // TODO solve what to do if unauthed
          // if auth0 enabled, just redirect back to login page
          // const redirectUri = this.history.location.pathname;
          // this.navigate(AppPaths.login(redirectUri));
        });

      case 403:
        return this.handleUnRecoverableError(response, () => {
          console.log('user not found in db, redirect to /403');
          // this.navigate(AppPaths.userNotFound());
        });

      case 404:
        return Promise.resolve(response.json());

      case 422:
        return this.handleRecoverableError(response);


      case 409: // TODO/TO NOTE http conflict, the error thrown if your api is accidentally concurrently trying to make a user with the same keys and they clash in sql.
        // if this happens to you, make your app only load the user once, when the app loads and don't allow it to call whatever endpoint you have to create a user in parallel.
        window.location.reload();
        return this.handleUnRecoverableError(response, () => window.location.reload()); // refreshing the page works for this error as it typically occurs during first page load when user creates account.

      case 500:
      default:
        if (response.headers.has('Content-Length')
          && parseInt(response.headers.get('Content-Length')) === 0) {

          return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => this.navigate('/500'));
          // TODO return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => this.navigate(AppPaths.internalError()));

        } else {
          return this.handleUnRecoverableError(response, (error: ApiError) => {
            // TODO this.navigate(AppPaths.internalError({error: error}));
            this.navigate('/500?error=' + encodeURIComponent(error.error) + '&description=' + encodeURIComponent(error.description));
          });
        }
    }
  };

  // from here below, i haven't really put too much thought, the handle* functions are mostly sane.
  // the last functions are for dealing with creating error objects when error is not present.
  private handleRecoverableError = (response: Response): Promise<unknown> => {
    return response
      .json()
      .then((apiResponseJson) => {
        console.error('recoverable error: ' + JSON.stringify(apiResponseJson.error as ApiError));
        // TODO NotificationService.error(apiResponseJson.error as ApiError);
        return Promise.reject(apiResponseJson.error);

      });
  };

  // eslint-disable-next-line no-unused-vars
  private handleUnRecoverableError = (response: Response, errorAction: (error: ApiError) => void): Promise<unknown> => {
    return response
      .json()
      .then((response) => {
        const error: ApiError = response.error;
        console.error('unrecoverable error: ' + JSON.stringify(error));
        // TODO NotificationService.error(error);
        // ok, so if we do encounter an unrecoverable error, call the errorAction()
        if (errorAction) {
          errorAction(error);
        }
        return Promise.reject(error);
      });
  };

  private handleUnRecoverableErrorWithoutErrorMessage = (response: Response, errorAction?: () => void): Promise<unknown> => {
    return response
      .json()
      .then((_: unknown) => {
        const errorMessage = 'Received error with no message. Please report problem to admin.';
        //NotificationService.error(errorMessage);
        console.error('unrecoverable error without message, why did api return no error');
        // ok, so if we do encounter an unrecoverable error, call the errorAction()
        if (errorAction) {
          errorAction();
        }
        return Promise.reject(this.buildErrorFromEmptyResponse(errorMessage, response));
      });
  };

  // handle empty errors
  // do as you please
  private buildErrorFromEmptyResponse = (message: string, response: Response): ApiError => this.buildError(this.buildErrorType(response), message, response.status);

  private buildError = (error: string, description: string, status: number): ApiError => {
    return {
      status: status,
      error: error,
      description: description,
    };
  };

  private buildErrorType = (response: Response): string => {
    if (response.status === 500) {
      return 'InternalServerError';
    }
    console.log('Unhandled error status: ' + response.status);
    return 'InternalServerError';
  };

  //  only used for catching exceptions
  private handleRejected = <T>(rejectedReason: unknown): Promise<T> => {
    console.log('rejected unrecoverable promise, redirect to /500');
    console.error('handle rejected api call');
    // NotificationService.error(rejectedReason);
    //this.navigate(AppPaths.internalError({msg: rejectedReason}));
    // this.navigate(`${routes[Pages.NotFound].path}?reason=${encodeURIComponent(rejectedReason)}`);
    const response = this.buildError('UnknownError', rejectedReason as string, 500);

    return Promise.reject(response);
  };

  private buildConfig = (method: string, data = null, requiresAuth: boolean): RequestInit => {
    if (data != null) {
      return {
        method: method,
        body: JSON.stringify(data),
        headers: this.buildHeaders(requiresAuth),
      } as RequestInit;
    }
    return {
      method: method,
      headers: this.buildHeaders(requiresAuth),
    } as RequestInit;
  };

  private buildMutipartFormConfig = (method: string, data = {}) => {
    const formData = new FormData();

    for (const name in data) {
      formData.append(name, data[name]);
    }

    return {
      method: method,
      body: formData,
      headers: {
        'Authorization': 'Bearer ' + this.getJwt(),
      },
    };
  };

  private buildHeaders = (requiresAuth: boolean, hasBody: boolean = false): HeadersInit => {
    const headers: HeadersInit = {};

    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (requiresAuth) {
      const token = this.getJwt();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  };


  // eslint-disable-next-line no-unused-vars
  private compositeResponseHandler = <T>(promise: Promise<Response>, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return promise
      .then((response: Response) => {
        console.log(response, callback);
        if (callback) {
          return this.handleResponse<T>(response)
            .then(callback);
        }
        return this.handleResponse<T>(response);
      })
      .catch((reason) => {
        console.log(reason);
        return this.handleRejected<T>(reason);
      });
  };

  // eslint-disable-next-line no-unused-vars
  get = <T>(path: string, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('GET', null, true)), callback);
  };

  // eslint-disable-next-line no-unused-vars
  getPublic = <T>(path: string, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('GET', null, false)), callback);
  };

  // eslint-disable-next-line no-unused-vars
  post = <T>(path: string, data?: unknown, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('POST', data, true)), callback);
  };

  // eslint-disable-next-line no-unused-vars
  patch = <T>(path: string, data?: unknown, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('PATCH', data, true)), callback);
  };

  // eslint-disable-next-line no-unused-vars
  put = <T>(path: string, data?: unknown, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('PUT', data, true)), callback);
  };

  // eslint-disable-next-line no-unused-vars
  delete = <T>(path: string, data?: unknown, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('DELETE', data, true)), callback);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any,no-unused-vars
  postForm = <T>(path: string, data?: any, callback?: (response: T) => T): Promise<ApiResponse<T>> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildMutipartFormConfig('POST', data)), callback);
  };

}

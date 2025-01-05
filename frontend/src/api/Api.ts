import { FamilyUnitDto, GuestDto } from '@/types/api';
import { getConfig } from '@/auth_config';

export type ApiError = {
  status: number;
  error: string;
  description: string;
  meta?: Map<string, string>;
};

export default class Api {

  // eslint-disable-next-line no-unused-vars
  constructor() {
  }

  getJwt = (): string | null => {
    return window.localStorage.getItem('jwt');
  };

  getMe = (): Promise<GuestDto> => {
    return this.get('/GuestDtos/me');
  };

  findUser = (queryKey: string): Promise<string> => {
    return this.getPublic(`/user/find?${queryKey}`);
  };

  getFamilyUnit = (): Promise<FamilyUnitDto> => {
    return this.get('/familyunit');
  };

  updateFamilyUnit = (familyUnit: FamilyUnitDto): Promise<FamilyUnitDto> => {
    return this.post(`/familyunit`, familyUnit);
  };

  getGuestDto = (id: number): Promise<GuestDto> => this.get(`/GuestDtos/${id}`);
  postGuestDto = (GuestDto: GuestDto): Promise<GuestDto> => this.post(`/GuestDtos`, GuestDto);
  patchGuestDto = (GuestDto: GuestDto): Promise<GuestDto> => this.patch(`/GuestDtos/${GuestDto.guestId}`, GuestDto);
  deleteGuestDto = (id: number): Promise<GuestDto> => this.delete(`/GuestDtos/${id}/change-password`);

  private handleResponse = <T>(response: Response): Promise<T> => {
    switch (response.status) {
      case 200:
        return Promise.resolve(response.json());

      case 400:
        return this.handleRecoverableError(response);

      case 401:
        return this.handleUnRecoverableError(response, () => {
          // TODO solve what to do if unauthed
          // if auth0 enabled, just redirect back to login page
          // const redirectUri = this.history.location.pathname;
          // this.history.replace(AppPaths.login(redirectUri));
        });

      case 403:
        return this.handleUnRecoverableError(response, () => {
          console.log('user not found in db, redirect to /403');
          // this.history.replace(AppPaths.userNotFound());
        });

      case 404:
        return Promise.resolve(response.json());

      case 422:
        return this.handleRecoverableError(response);


      case 409: // TODO/TO NOTE http conflict, the error thrown if your api is accidentally concurrently trying to make a user with the same keys and they clash in sql.
        // if this happens to you, make your app only load the user once, when the app loads and don't allow it to call whatever endpoint you have to create a user in parallel.
        // window.location.reload();
        return this.handleUnRecoverableError(response, () => console.log('409')); // refreshing the page works for this error as it typically occurs during first page load when user creates account.

      case 500:
      default:

        if (response.headers.has('Content-Length')
          && parseInt(response.headers.get('Content-Length')) === 0) {

          return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => {});
          // TODO return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => this.history.replace(AppPaths.internalError()));

        } else {
          return this.handleUnRecoverableError(response, (_error: ApiError) => {
          });
        }
    }
  };

  // from here below, i haven't really put too much thought, the handle* functions are mostly sane.
  // the last functions are for dealing with creating error objects when error is not present.
  private handleRecoverableError = <T>(response: Response): Promise<T> => {
    return response
      .json()
      .then((apiResponseJson: T) => {
        // TODO NotificationService.error(apiResponseJson.error as ApiError);
        return {
          data: undefined,
          error: apiResponseJson.error,
        };
      });
  };

  private handleUnRecoverableError = <T>(response: Response, errorAction: (_error: ApiError) => void): Promise<T> => {
    return response
      .json()
      .then((response: T) => {
        const error: ApiError = response.error;
        // TODO NotificationService.error(error);
        // ok, so if we do encounter an unrecoverable error, call the errorAction()
        if (errorAction) {
          errorAction(error);
        }
        return {
          data: undefined,
          error: error,
        } as T;
      });
  };

  private handleUnRecoverableErrorWithoutErrorMessage = <T>(response: Response, errorAction?: () => void): Promise<T> => {
    return response
      .json()
      .then(() => {
        const errorMessage = 'Received error with no message. Please report problem to admin.';
        //NotificationService.error(errorMessage);
        // ok, so if we do encounter an unrecoverable error, call the errorAction()
        if (errorAction) {
          errorAction();
        }
        return Promise.resolve({
          data: undefined,
          error: this.buildErrorFromEmptyResponse(errorMessage, response),
        });
      });
  };

  // handle empty errors
  // do as you please
  private buildErrorFromEmptyResponse = (message: string, response: Response): ApiError => this.buildError(this.buildErrorType(response), message, response.status, response.url);

  private buildErrorType = (response: Response): string => {
    if (response.status === 500) {
      return 'InternalServerError';
    }
    console.log('Unhandled error status: ' + response.status);
    return 'InternalServerError';
  };


  private buildError = (error: string, description: string, status: number, _path: string): ApiError => {
    return {
      status: status,
      error: error,
      description: description,
    };
  };

  //  only used for catching exceptions
  private handleRejected = <T>(_rejectedReason: string): Promise<T> => {
    console.log('rejected unrecoverable promise, redirect to /500');
    const response = {
      data: _rejectedReason,
      error: this.buildError('UnknownError', 'Encountered unhandled error in app. Please notify admin if continues.', 500, ''),
    };
    return Promise.resolve(response);
  };

  private buildConfig = (method: string, data: object | null, requiresAuth: boolean) => {
    if (data != null) {
      return {
        method: method,
        body: JSON.stringify(data),
        headers: this.buildHeaders(requiresAuth),
      };
    }
    return {
      method: method,
      headers: this.buildHeaders(requiresAuth),
    };
  };

  private buildMutipartFormConfig = (method: string, data: any = {}) => {
    const formData = new FormData();

    for (let name in data) {
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

  private buildHeaders = (requiresAuth: boolean): any => {
    if (requiresAuth) {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getJwt(),
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  private compositeResponseHandler = <T>(promise: Promise<Response>, callback?: (_response: T) => T): Promise<T> => {
    return promise
      .then((response: Response) => {
        if (callback) {
          return this.handleResponse<T>(response)
            .then(callback);
        }
        return this.handleResponse<T>(response);
      })
      .catch((reason: string) => {
        return this.handleRejected<T>(reason);
      });
  };

  get = <T>(path: string, callback?: (_response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('GET', null, true)), callback);
  };

  getPublic = <T>(path: string, callback?: (_response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('GET', null, false)), callback);
  };

  post = <T>(path: string, data?: any, callback?: (_response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('POST', data, true)), callback);
  };

  patch = <T>(path: string, data?: any, callback?: (_response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('PATCH', data, true)), callback);
  };

  put = <T>(path: string, data?: any, callback?: (_response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('PUT', data, true)), callback);
  };

  delete = <T>(path: string, data?: any, callback?: (_response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('DELETE', data, true)), callback);
  };

  postForm = <T>(path: string, data?: any, callback?: (_response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildMutipartFormConfig('POST', data)), callback);
  };

}

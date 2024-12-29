import { FamilyUnitDto, GuestDto } from '@/types/types';
import { History } from 'history';
import { getConfig } from '/config';

export type ApiError = {
  status: number,
  error: string,
  description: string,
  meta?: Map<string, string>
}

export default class Api {

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly history: History) {
  }

  getJwt = (): string | null => window.localStorage.getItem("anonJwt");

  getMe = (): Promise<GuestDto> => {
    return this.get('/GuestDtos/me', (response: GuestDto) => {
      if (response === undefined) {
        return response;
      }
      return response;
    })
  };

  getFamily = (invitationCode: string, firstName: string): Promise<FamilyUnitDto> => this.get(`/familyunit?invitationCode=${invitationCode}&firstName=${firstName}`);
  getGuestDto = (id: number): Promise<GuestDto> => this.get(`/GuestDtos/${id}`);
  postGuestDto = (GuestDto: GuestDto): Promise<GuestDto> => this.post(`/GuestDtos`, GuestDto);
  patchGuestDto = (GuestDto: GuestDto): Promise<GuestDto> => this.patch(`/GuestDtos/${GuestDto.guestId}`, GuestDto);
  deleteGuestDto = (id: number): Promise<GuestDto> => this.delete(`/GuestDtos/${id}/change-password`);

  private handleResponse = <T>(response: Response): Promise<T> => {
    console.log(response.status)
    switch (response.status) {
      case 200:
        return Promise.resolve(response.json());

      case 400:
        return this.handleRecoverableError(response);

      case 401:
        return this.handleUnRecoverableError(response, () => {
          console.log("api auth check fail, logging out");
          alert("received unauth'd");
          // TODO solve what to do if unauthed
          // if auth0 enabled, just redirect back to login page
          // const redirectUri = this.history.location.pathname;
          // this.history.replace(AppPaths.login(redirectUri));
        });

      case 403:
        return this.handleUnRecoverableError(response, () => {
          console.log("user not found in db, redirect to /403");
          // this.history.replace(AppPaths.userNotFound());
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
        if (response.headers.has("Content-Length")
          && parseInt(response.headers.get("Content-Length")!!) === 0) {

          return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => this.history.replace("/500"));
          // TODO return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => this.history.replace(AppPaths.internalError()));

        } else {
          return this.handleUnRecoverableError(response, (error: ApiError) => {
            // TODO this.history.replace(AppPaths.internalError({error: error}));
            this.history.replace("/500?error=" + encodeURIComponent(error.error) + "&description=" + encodeURIComponent(error.description));
          });
        }
    }
  };

  // from here below, i haven't really put too much thought, the handle* functions are mostly sane.
  // the last functions are for dealing with creating error objects when error is not present.
  private handleRecoverableError = (response: Response): Promise<any> => {
    return response
      .json()
      .then((apiResponseJson) => {
        alert("recoverable error: " + JSON.stringify(apiResponseJson.error as ApiError));
        // TODO NotificationService.error(apiResponseJson.error as ApiError);
          return Promise.reject(apiResponseJson.error);

      });
  };

  private handleUnRecoverableError = (response: Response, errorAction: (error: ApiError) => void): Promise<any> => {
    return response
      .json()
      .then((response) => {
        const error: ApiError = response.error!!;
        alert("unrecoverable error: " + JSON.stringify(error));
        // TODO NotificationService.error(error);
        // ok, so if we do encounter an unrecoverable error, call the errorAction()
        if (errorAction) {
          errorAction(error);
        }
        return Promise.reject(error);
      });
  };

  private handleUnRecoverableErrorWithoutErrorMessage = (response: Response, errorAction?: () => void): Promise<any> => {
    return response
      .json()
      .then((_: any) => {
        const errorMessage = 'Received error with no message. Please report problem to admin.';
        //NotificationService.error(errorMessage);
        alert("unrecoverable error without message, why did api return no error");
        // ok, so if we do encounter an unrecoverable error, call the errorAction()
        if (errorAction) {
          errorAction();
        }
        return Promise.reject(this.buildErrorFromEmptyResponse(errorMessage, response));
      });
  };

  // handle empty errors
  // do as you please
  private buildErrorFromEmptyResponse = (message: string, response: Response): ApiError => this.buildError(this.buildErrorType(response), message, response.status, response.url);

  private buildError = (error: string, description: string, status: number, path: string): ApiError => {
    return {
      status: status,
      error: error,
      description: description,
    }
  };

  private buildErrorType = (response: Response): string => {
    if (response.status === 500) {
      return 'InternalServerError';
    }
    console.log("Unhandled error status: " + response.status);
    return 'InternalServerError';
  };

  //  only used for catching exceptions
  private handleRejected = <T>(rejectedReason: string): Promise<T> => {
    console.log("rejected unrecoverable promise, redirect to /500");
    alert("handle rejected api call");
    // NotificationService.error(rejectedReason);
    //this.history.replace(AppPaths.internalError({msg: rejectedReason}));
    this.history.replace("/500?description=" + encodeURIComponent(rejectedReason));
    const response = this.buildError('UnknownError', 'Encountered unhandled error in app. Please notify admin if continues.', 500, '')

    return Promise.reject(response);
  };

  private buildConfig = (method: string, data: any = null, requiresAuth: boolean) => {
    if (data != null) {
      return {
        method: method,
        body: JSON.stringify(data),
        headers: this.buildHeaders(requiresAuth)
      }
    }
    return {
      method: method,
      headers: this.buildHeaders(requiresAuth)
    }
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
        'Authorization': 'Bearer ' + this.getJwt()
      }
    };
  };

  private buildHeaders = (requiresAuth: boolean): any => {
    if (requiresAuth) {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getJwt()
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  };

  private compositeResponseHandler = <T>(promise: Promise<Response>, callback?: (response: T) => T): Promise<T> => {
    return promise
      .then((response: Response) => {
        console.log(response, callback);
        if (callback) {
          return this.handleResponse<T>(response)
            .then(callback)
        }
        return this.handleResponse<T>(response)
      })
      .catch((reason: string) => {
        console.log(reason);
        return this.handleRejected<T>(reason)
      });
  };

  get = <T>(path: string, callback?: (response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('GET', null, false)), callback);
  };

  getPublic = <T>(path: string, callback?: (response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('GET', null, false)), callback);
  };

  post = <T>(path: string, data?: any, callback?: (response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('POST', data, true)), callback);
  };

  patch = <T>(path: string, data?: any, callback?: (response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('PATCH', data, true)), callback);
  };

  put = <T>(path: string, data?: any, callback?: (response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('PUT', data, true)), callback);
  };

  delete = <T>(path: string, data?: any, callback?: (response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildConfig('DELETE', data, true)), callback);
  };

  postForm = <T>(path: string, data?: any, callback?: (response: T) => T): Promise<T> => {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, this.buildMutipartFormConfig('POST', data)), callback);
  };

}

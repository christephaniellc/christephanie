import { AddressDto, ClientInfoDto, FamilyUnitDto, FamilyUnitViewModel, FindUserResponse, GuestDto, GuestViewModel, NotificationPreferenceEnum, PatchFamilyUnitRequest, PatchGuestRequest, PatchUserRequest } from '@/types/api';
import { getConfig } from '@/auth_config';

export type ApiError = {
  status: number;
  error: string;
  description: string;
  meta?: Map<string, string>;
};

export default class Api {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly getAccessTokenSilently: () => Promise<string | null>) {
  }

  getJwt = async () => {
    return await this.getAccessTokenSilently();
  };

  async getMe(): Promise<GuestDto> {
    return this.get('/user/me');
  }

  async findUserId(queryKey: string): Promise<FindUserResponse> {
    return this.getPublic(`/user/find?${queryKey}`);
  }

  async getFamilyUnit(): Promise<FamilyUnitDto> {
    return this.get('/familyunit');
  }
  
  async getAllFamilies(): Promise<FamilyUnitViewModel[]> {
    return this.get('/admin/familyunit/all');
  }

  async patchFamilyUnit(familyUnit: PatchFamilyUnitRequest): Promise<FamilyUnitViewModel> {
    return this.patch(`/familyunit`, familyUnit);
  }

  getGuestDto(id: number): Promise<GuestDto> {
    return this.get(`/guest/${id}`);
  }

  postGuestDto(GuestDto: GuestDto): Promise<GuestDto> {
    return this.post(`/GuestDtos`, GuestDto);
  }

  patchGuestDto(patchGuestRequest: PatchGuestRequest): Promise<GuestViewModel> {
    return this.patch(`/guest`, patchGuestRequest);
  }

  patchUser(clientInfo: ClientInfoDto): Promise<unknown> {
    try {
      const patchUserRequest: PatchUserRequest = {
        clientInfo: clientInfo
      };
      return this.patch(`/user`, patchUserRequest).catch(err => {
        // Don't let this break the app if it fails
        console.error('Failed to patch user with client info:', err);
        return Promise.resolve(false);
      });
    } catch (err) {
      console.error('Error preparing client info patch:', err);
      return Promise.resolve(false);
    }
  }

  getMaskedValue(guestId: string, maskedValueType: NotificationPreferenceEnum): Promise<{ value: string, verified: boolean }> {
    return this.get(`/guest/maskedvalues?guestId=${encodeURIComponent(guestId)}&maskedValueType=${encodeURIComponent(maskedValueType)}`);
}

  deleteGuestDto(id: number): Promise<GuestDto> {
    return this.delete(`/guest/${id}/change-password`);
  }

  validateAddress(address: AddressDto): Promise<AddressDto> {
    return this.post(`/validate/address`, address);
  }
  
  validatePhone(phoneNumber: string, code?: string, action?: string): Promise<{ success: boolean }> {
    return this.post(`/validate/phone`, { phoneNumber, code, action });
  }

  validateEmail(email: string, token?: string, action?: string): Promise<{ success: boolean }> {
    return this.post(`/validate/email`, { email, token, action });
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    switch (response.status) {
      case 200:
        return Promise.resolve(response.json());

      case 400:
        return this.handleRecoverableError(response);

      case 401:
        return this.handleUnRecoverableError(response);

      case 403:
        return this.handleUnRecoverableError(response);

      case 404:
        return this.handleRecoverableError(response);

      case 422:
        return this.handleRecoverableError(response);


      case 409: // TODO/TO NOTE http conflict, the error thrown if your api is accidentally concurrently trying to make a user with the same keys and they clash in sql.
        // if this happens to you, make your app only load the user once, when the app loads and don't allow it to call whatever endpoint you have to create a user in parallel.
        // window.location.reload();
        return this.handleUnRecoverableError(response); // refreshing the page works for this error as it typically occurs during first page load when user creates account.

      case 500:
      default:

        if (response.headers.has('Content-Length')
          && parseInt((response.headers.get('Content-Length') || '0')) === 0) {

          return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => {
          });
          // TODO return this.handleUnRecoverableErrorWithoutErrorMessage(response, () => this.history.replace(AppPaths.internalError()));

        } else {
          return this.handleUnRecoverableError(response)
        }
    }
  }

  // from here below, i haven't really put too much thought, the handle* functions are mostly sane.
  // the last functions are for dealing with creating error objects when error is not present.
  private async handleRecoverableError(response: Response): Promise<any> {
    return response.json().then((error: ApiError) => {
      return Promise.reject(error);
    });
  }

  private async handleUnRecoverableError<T>(
    response: Response,
  ): Promise<T> {
    return Promise.reject(response);
  }

  private async handleUnRecoverableErrorWithoutErrorMessage<T>(
    response: Response,
    errorAction?: () => void
  ): Promise<T> {
    return response
      .json()
      .then(() => {
        const errorMessage = 'Received error with no message. Please report problem to admin.';
        //NotificationService.error(errorMessage);
        // ok, so if we do encounter an unrecoverable error, call the errorAction()
        if (errorAction) {
          errorAction();
        }
        return Promise.reject(errorMessage);
      });
  };

  // handle empty errors
  // do as you please
  private buildErrorFromEmptyResponse = (message: string, response: Response): ApiError => this.buildError(this.buildErrorType(response), message, response.status, response.url);

  private buildErrorType = (response: Response): string => {
    if (response.status === 500) {
      return 'InternalServerError';
    }
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
  private async handleRejected<T>(reason: any): Promise<T> {
    return Promise.reject(reason);
  }

  private async buildConfig(
    method: string,
    data: object | null,
    requiresAuth: boolean
  ): Promise<RequestInit> {
    const headers = await this.buildHeaders(requiresAuth);
    const config: RequestInit = { 
      method, 
      headers
    };
    if (data != null) config.body = JSON.stringify(data);
    return config;
  }

  private async buildMutipartFormConfig(method: string, data: any = {}): Promise<RequestInit> {
    const formData = new FormData();
    for (const name in data) {
      formData.append(name, data[name]);
    }
    const token = await this.getAccessTokenSilently();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return { 
      method, 
      body: formData, 
      headers
    };
  }

  private async buildHeaders(requiresAuth: boolean): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': window.location.origin
    };
    
    if (requiresAuth) {
      try {
        const token = await this.getAccessTokenSilently();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.warn('No token available for authenticated request');
          // Handle the missing token gracefully - the caller will retry
        }
      } catch (error) {
        console.error('Error getting access token:', error);
        
        // Don't add token but don't block the request - 
        // let the server respond with 401/403 so we can retry with refresh
      }
    }
    
    return headers;
  }

  private async compositeResponseHandler<T>(
  promise: Promise<Response>,
  callback?: (_response: Awaited<T>) => Awaited<T>,
  retryCount: number = 0
): Promise<Awaited<T>> {
  try {
    const response = await promise;
    
    // Handle 401 Unauthorized or 403 Forbidden errors specifically
    if ((response.status === 401 || response.status === 403) && retryCount < 3) {
      console.log(`Received ${response.status} error (attempt ${retryCount + 1}), attempting to refresh token...`);
      
      try {
        // First attempt to get a fresh token by forcing a refresh
        const token = await this.getAccessTokenSilently();
        
        if (!token) {
          console.warn('Failed to refresh token, but continuing with retry...');
        }
        
        // Wait a moment before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        
        // Rebuild the request with the new token
        const method = response.type as string || 'GET'; // Default to GET if type is not available
        const config = await this.buildConfig(method, null, true);
        
        // Make a fresh request with the new token
        const retry = await fetch(response.url, config);
        
        // Continue with the retry chain
        return this.compositeResponseHandler(Promise.resolve(retry), callback, retryCount + 1);
      } catch (refreshError) {
        console.error('Token refresh or request retry failed:', refreshError);
        // Continue with normal error handling if retry fails
      }
    }
    
    let result = await this.handleResponse<Awaited<T>>(response);
    if (callback) {
      result = callback(result);
    }
    return result;
  } catch (reason) {
    return this.handleRejected<Awaited<T>>(reason);
  }
}
  async get<T>(path: string, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    const requestConfig = await this.buildConfig('GET', null, true);
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, requestConfig), callback);
  }

  async getPublic<T>(path: string, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    const requestConfig = await this.buildConfig('GET', null, false);
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, requestConfig), callback);
  }

  async post<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    const requestConfig = await this.buildConfig('POST', data, true);
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, requestConfig), callback);
  }

  async patch<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    const requestConfig = await this.buildConfig('PATCH', data, true);
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, requestConfig), callback);
  }

  async put<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    const requestConfig = await this.buildConfig('PUT', data, true);
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, requestConfig), callback);
  }

  async delete<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    const requestConfig = await this.buildConfig('DELETE', data, true);
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, requestConfig), callback);
  }

  async postForm<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    const requestConfig = await this.buildMutipartFormConfig('POST', data);
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, requestConfig), callback);
  }
}
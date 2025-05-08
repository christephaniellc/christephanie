import { AddressDto, AdminPatchGuestRequest, ClientInfoDto, ContributionDto, FamilyUnitDto, FamilyUnitViewModel, FindUserResponse, GuestDto, GuestViewModel, InvitationDesignDto, NotificationPreferenceEnum, OrientationEnum, PatchFamilyUnitRequest, PatchGuestRequest, PatchUserRequest, StatsViewModel, VerifyEmailResponse } from '@/types/api';
import { SavedPhotoConfiguration } from '@/pages/PrintedRsvp/types/types';
import { getConfig } from '@/auth_config';

export type ApiError = {
  status: number;
  error: string;
  description: string;
  meta?: Map<string, string>;
};

export default class Api {
  // Cache the token and its expiry time
  private tokenCache: { token: string | null; expiresAt: number } = { 
    token: null, 
    expiresAt: 0 
  };
  
   
  constructor(private readonly getAccessTokenSilently: () => Promise<string | null>) {
  }
  
  // Public method to clear token cache
  clearTokenCache() {
    console.debug('Clearing token cache');
    this.tokenCache = { token: null, expiresAt: 0 };
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
  
  async getStats(): Promise<StatsViewModel> {
    return this.get('/stats');
  }
  
  async getMyContributions(): Promise<ContributionDto[]> {
    return this.get('/payments/contributions?filter=current');
  }
  
  async createPaymentIntent(amount: number, currency: string, giftCategory: string, giftNotes: string = '', guestEmail: string = '', isAnonymous: boolean = false): Promise<{ clientSecret: string; paymentIntentId: string; amount: number; currency: string; error?: any }> {
    try {
      // First, get the current user info to fill in any missing data
      const currentUser = await this.getMe();
      
      // Prepare metadata with all required fields
      const metadata = {
        giftCategory,
        giftNotes: giftNotes || '',
        isAnonymous: isAnonymous || false,
        // Use provided email or fall back to user email value if available
        guestEmail: guestEmail || (currentUser.email ? currentUser.email.value : ''),
        // Make sure we include the guest ID and name which are required
        guestId: currentUser.guestId || '',
        guestName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
      };
      
      // console.log('Creating payment intent with data:', {
      //   amount,
      //   currency,
      //   giftMetaData: metadata
      // });
      
      const response = await this.post<{ 
        clientSecret: string; 
        paymentIntentId: string; 
        amount: number; 
        currency: string; 
        error?: any 
      }>('/payments/intent', {
        amount,
        currency,
        giftMetaData: metadata
      });
            
      if (response && 'error' in response && response.error) {
        console.error('Server returned error in payment intent creation:', response.error);
      }
      
      return response;
    } catch (error) {
      console.error('Error in createPaymentIntent:', error);
      throw error;
    }
  }

  async adminGetAllFamilies(): Promise<FamilyUnitDto[]> {
    return this.get('/admin/familyunit');
  }
  
  async adminCreateFamily(family: FamilyUnitDto): Promise<FamilyUnitDto> {
    return this.put('/admin/familyunit', family);
  }
  
  async adminUpdateFamily(family: FamilyUnitDto): Promise<FamilyUnitDto> {
    try {
      const result = await this.post('/admin/familyunit', family);
      return result;
    } catch (error) {
      console.error('API: Error updating family:', error);
      throw error;
    }
  }
  
  async adminPatchGuest(guest: AdminPatchGuestRequest): Promise<GuestDto> {
    return this.patch(`/admin/familyunit`, guest);
  }
  
  async adminGetFamilyByInvitationCode(invitationCode: string): Promise<FamilyUnitDto> {
    //console.log('API: Getting family by invitation code:', invitationCode);
    try {
      const result = await this.get(`/admin/familyunit/invitationCode?invitationCode=${encodeURIComponent(invitationCode)}`);
      //console.log('API: Get family successful');
      return result;
    } catch (error) {
      console.error('API: Error getting family:', error);
      throw error;
    }
  }
  
  async testAdminAccess(): Promise<boolean> {
    try {
      // Try to fetch admin data
      await this.get('/admin/familyunit');
      console.debug('Admin access granted');
      return true;
    } catch (error) {
      console.error('Admin access denied:', error);
      return false;
    }
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

  verifyEmail(token?: string): Promise<{ response: VerifyEmailResponse }> {
    // Use the public endpoint that doesn't require authentication
    return this.getPublic(`/verify/email?token=${token}` );
  }
  
  // Invitation design configuration endpoints
  saveInvitationDesign(config: SavedPhotoConfiguration): Promise<InvitationDesignDto> {
    // Convert from SavedPhotoConfiguration to InvitationDesignDto
    const photoGridItems = config.photoGrid.map(item => ({
      id: item.id.toString(),
      photoSrc: item.photoSrc,
      rowPosition: item.position[0],
      columnPosition: item.position[1],
      isLocked: item.isLocked,
      objectFit: item.objectFit || 'cover',
      objectPosition: item.objectPosition || 'center'
    }));
    
    const invitationDesign: InvitationDesignDto = {
      guestId: null, // Will be set from the token on the server side
      designId: config.id, // May be null for new designs
      name: config.name,
      orientation: config.orientation === 'vertical' ? OrientationEnum.Portrait : OrientationEnum.Landscape,
      photoGridItems: photoGridItems
    };
    
    return this.post('/admin/configuration/invitation', invitationDesign);
  }
  
  getInvitationDesigns(): Promise<InvitationDesignDto[]> {
    return this.get('/admin/configuration/invitation');
  }
  
  getInvitationDesign(designId: string): Promise<InvitationDesignDto> {
    return this.get(`/admin/configuration/invitation/${designId}`);
  }
  
  deleteInvitationDesign(designId: string): Promise<void> {
    return this.delete(`/admin/configuration/invitation?designId=${encodeURIComponent(designId)}`);
  }
  
  async sendEmailNotification(campaignType: string = 'RsvpNotify', guestId?: string): Promise<any> {
    try {
      console.log(`Sending ${campaignType} notification for guestId:`, guestId || 'ALL');
      let queryParams = '';
      
      // Build query params
      if (guestId || campaignType) {
        const params = [];
        if (guestId) params.push(`guestId=${encodeURIComponent(guestId)}`);
        if (campaignType) params.push(`campaignType=${encodeURIComponent(campaignType)}`);
        queryParams = `?${params.join('&')}`;
      }
      
      return await this.post(`/notify/email${queryParams}`, {});
    } catch (error) {
      console.error(`Error in sendEmailNotification (${emailType}):`, error);
      throw error;
    }
  }
  
  async sendRsvpNotification(guestId?: string): Promise<any> {
    return this.sendEmailNotification('RsvpNotify', guestId);
  }
  
  async getEmailNotifications(): Promise<any> {
    try {
      console.log('Fetching email notification history');
      return await this.get('/notify/email');
    } catch (error) {
      console.error('Error in getEmailNotifications:', error);
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    switch (response.status) {
      case 200:
        return Promise.resolve(response.json());

      case 400:
        return this.handleRecoverableError(response);

      case 401:
        // Clear token cache on authentication error
        this.clearTokenCache();
        return this.handleUnRecoverableError(response);

      case 403:
        // Also clear token cache on authorization error
        this.clearTokenCache();
        console.log('403 Forbidden error, cleared token cache');
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
    const config: RequestInit = { method, headers };
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
    return { method, body: formData, headers };
  }

  // Helper to decode JWT and get expiration time
  private decodeJwt(token: string): { exp?: number } {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return {};
    }
  }

  private async buildHeaders(requiresAuth: boolean): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    if (requiresAuth) {
      // Current time in seconds
      const now = Math.floor(Date.now() / 1000);
      
      // Check if we have a valid cached token (with 30 seconds buffer)
      if (this.tokenCache.token && this.tokenCache.expiresAt > now + 30) {
        console.log('Using cached token, expires in:', this.tokenCache.expiresAt - now, 'seconds');
        headers['Authorization'] = `Bearer ${this.tokenCache.token}`;
        return headers;
      }
      
      // Get a fresh token
      try {
        console.log('Getting fresh access token');
        const token = await this.getAccessTokenSilently();
        if (token) {
          // Cache the token with its expiry
          const decodedToken = this.decodeJwt(token);
          this.tokenCache = { 
            token: token, 
            expiresAt: decodedToken.exp || (now + 3600) // Default 1hr if can't decode
          };
          
          // Add authorization header
          headers['Authorization'] = `Bearer ${token}`;
          
          // Log token expiry for debugging (not the token itself)
          if (decodedToken.exp) {
            const expiryDate = new Date(decodedToken.exp * 1000).toISOString();
            //console.log(`Using token with expiry: ${expiryDate}`);
          } else {
            console.log('Token expiry time not found, using default 1hr');
          }
        } else {
          console.error('getAccessTokenSilently returned null token');
        }
      } catch (error) {
        console.error('Failed to get auth token for request:', error);
      }
    } else {
      console.log('Auth not required for this request');
    }
    
    return headers;
  }

  private async compositeResponseHandler<T>(
    promise: Promise<Response>,
    callback?: (_response: Awaited<T>) => Awaited<T>
  ): Promise<Awaited<T>> {
    try {
      // Add request tracking
      const requestStartTime = Date.now();
      const requestId = Math.random().toString(36).substring(2, 10);
      
      try {
        //console.log(`API ${requestId} - Starting request (${new Date().toISOString()})`);
        
        // Add timeout to detect hanging requests
        const timeoutPromise = new Promise<Response>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`API request timeout after 15000ms (${requestId})`));
          }, 15000);
        });
        
        const response = await Promise.race([promise, timeoutPromise]);
        
        // More detailed response logging
        // console.log(`API ${requestId} - ${response.status} ${response.url} (${Date.now() - requestStartTime}ms)`, {
        //   status: response.status,
        //   statusText: response.statusText,
        //   headers: [...response.headers.entries()].reduce((obj, [key, val]) => ({...obj, [key]: val}), {}),
        // });
        
        let result = await this.handleResponse<Awaited<T>>(response);
        if (callback) {
          result = callback(result);
        }
        return result;
      } catch (error) {
        // Enhanced error logging
        if (error instanceof Response) {
          console.error(`API ${requestId} - Error ${error.status} ${error.url} (${Date.now() - requestStartTime}ms)`, {
            status: error.status,
            statusText: error.statusText,
            headers: [...error.headers.entries()].reduce((obj, [key, val]) => ({...obj, [key]: val}), {}),
          });
          
          // Try to get error body for more details
          try {
            const errorText = await error.text();
            console.error(`API ${requestId} - Error body:`, errorText);
          } catch (e) {
            console.error(`API ${requestId} - Could not read error body:`, e);
          }
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          // Network error - likely CORS or connectivity issue
          console.error(`API ${requestId} - Network Error (${Date.now() - requestStartTime}ms): ${error.message}`, {
            error,
            online: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
            type: 'network_error'
          });
        } else {
          console.error(`API ${requestId} - Error (${Date.now() - requestStartTime}ms):`, error);
        }
        throw error;
      }
    } catch (reason) {
      return this.handleRejected<Awaited<T>>(reason);
    }
  }
  async get<T>(path: string, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, await this.buildConfig('GET', null, true)), callback);
  }

  async getPublic<T>(path: string, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, await this.buildConfig('GET', null, false)), callback);
  }

  async post<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    //console.log('POST request to:', path, 'with data:', data);
    try {
      const result = await this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, await this.buildConfig('POST', data, true)), callback);
      //console.log('POST request successful:', path);
      return result;
    } catch (error) {
      console.error('POST request failed:', path, error);
      throw error;
    }
  }

  async patch<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, await this.buildConfig('PATCH', data, true)), callback);
  }

  async put<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, await this.buildConfig('PUT', data, true)), callback);
  }

  async delete<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, await this.buildConfig('DELETE', data, true)), callback);
  }

  async postForm<T>(path: string, data?: any, callback?: (_response: Awaited<T>) => Awaited<T>): Promise<Awaited<T>> {
    return this.compositeResponseHandler(fetch(getConfig().webserviceUrl + path, await this.buildMutipartFormConfig('POST', data)), callback);
  }
}
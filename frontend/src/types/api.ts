/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface APIGatewayCustomAuthorizerPolicy {
  Version?: string | null;
  Statement?: IAMPolicyStatement[] | null;
}

export interface APIGatewayCustomAuthorizerResponse {
  principalId?: string | null;
  policyDocument?: APIGatewayCustomAuthorizerPolicy;
  context?: Record<string, any>;
  usageIdentifierKey?: string | null;
}

export interface APIGatewayProxyResponse {
  /** @format int32 */
  statusCode?: number;
  headers?: Record<string, string | null>;
  multiValueHeaders?: Record<string, string[] | null>;
  body?: string | null;
  isBase64Encoded?: boolean;
}

export interface AddressDto {
  streetAddress?: string | null;
  streetAddressAbbreviation?: string | null;
  secondaryAddress?: string | null;
  city?: string | null;
  cityAbbreviation?: string | null;
  state?: string | null;
  postalCode?: string | null;
  province?: string | null;
  zipCode?: string | null;
  zipPlus4?: string | null;
  urbanization?: string | null;
  country?: string | null;
  countryISOCode?: string | null;
  uspsVerified?: boolean;
}

export interface AdminPatchGuestRequest {
  invitationCode: string | null;
  guestId: string | null;
  firstName?: string | null;
  additionalFirstNames?: string[] | null;
  lastName?: string | null;
  tier?: string | null;
  email?: string | null;
  phone?: string | null;
  invitationResponse?: InvitationResponseEnum;
  rehearsalDinner?: RsvpEnum;
  fourthOfJuly?: RsvpEnum;
  wedding?: RsvpEnum;
}

export enum AgeGroupEnum {
  Baby = 'Baby',
  Under13 = 'Under13',
  Under21 = 'Under21',
  Adult = 'Adult',
}

export interface BrowserInfoDto {
  name?: string | null;
  version?: string | null;
  userAgent?: string | null;
}

export interface ClientInfoDto {
  /** @format date-time */
  dateRecorded?: string;
  ipAddress?: string | null;
  os?: string | null;
  browser?: BrowserInfoDto;
  screen?: ScreenInfoDto;
  language?: string | null;
  timeZone?: string | null;
  device?: DeviceInfoDto;
  connection?: ConnectionInfoDto;
  geolocation?: GeolocationInfoDto;
  referrer?: string | null;
  storageSupport?: StorageSupportInfoDto;
}

export interface ConnectionInfoDto {
  effectiveType?: string | null;
  /** @format double */
  downlink?: number | null;
}

export interface DeleteResponse {
  success?: boolean;
}

export interface DeviceInfoDto {
  type?: string | null;
  touchSupport?: boolean | null;
  hardwareConcurrency?: string | null;
  deviceMemory?: string | null;
}

export interface FamilyUnitDto {
  invitationCode?: string | null;
  unitName?: string | null;
  tier?: string | null;
  guests?: GuestDto[] | null;
  mailingAddress?: AddressDto;
  additionalAddresses?: AddressDto[] | null;
  invitationResponseNotes?: string | null;
  /** @format int32 */
  potentialHeadCount?: number;
  /** @format date-time */
  familyUnitLastLogin?: string | null;
}

export interface FamilyUnitViewModel {
  invitationCode?: string | null;
  unitName?: string | null;
  guests?: GuestViewModel[] | null;
  mailingAddress?: AddressDto;
  additionalAddresses?: AddressDto[] | null;
  invitationResponseNotes?: string | null;
  /** @format date-time */
  familyUnitLastLogin?: string | null;
}

export interface FindUserResponse {
  guestId?: string | null;
  auth0Id?: string | null;
}

// Email notification types matching backend EmailTypeEnum
export enum EmailType {
  RsvpNotify = 'RsvpNotify',
  RsvpReminder = 'RsvpReminder',
  ManorDetails = 'ManorDetails',
  FourthDetails = 'FourthDetails',
  WeddingDetails = 'WeddingDetails',
  ThankYou = 'ThankYou'
}

// Campaign types matching backend CampaignTypeEnum
export enum CampaignType {
  RsvpNotify = 'RsvpNotify',
  RsvpReminder = 'RsvpReminder',
  ManorDetails = 'ManorDetails',
  FourthDetails = 'FourthDetails',
  WeddingDetails = 'WeddingDetails',
  ThankYou = 'ThankYou'
}

// Email notification log record
export interface GuestEmailLogDto {
  guestEmailLogId: string;
  guestId: string;
  campaignType: CampaignType;
  campaignId?: string;
  timestamp: string;
  deliveryStatus: string;
  emailAddress: string;
  verified: boolean;
  metadata?: { [key: string]: string };
  // Additional fields that may be present in API responses
  emailType?: string;
  type?: string;
  dateCreated?: string;
  date?: string;
  sentAt?: string;
  status?: string;
  to?: string;
}

export enum FoodPreferenceEnum {
  Unknown = 'Unknown',
  Omnivore = 'Omnivore',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  BYOB = 'BYOB',
}

export interface GeolocationInfoDto {
  /** @format double */
  latitude?: number | null;
  /** @format double */
  longitude?: number | null;
}

export interface GuestDto {
  invitationCode?: string | null;
  guestId?: string | null;
  /** @format int32 */
  guestNumber?: number | null;
  auth0Id?: string | null;
  firstName?: string | null;
  additionalFirstNames?: string[] | null;
  lastName?: string | null;
  roles: RoleEnum[] | null;
  email?: VerifiedDto;
  phone?: VerifiedDto;
  rsvp?: RsvpDto;
  preferences?: PreferencesDto;
  clientInfos?: ClientInfoDto[] | null;
  ageGroup?: AgeGroupEnum;
  /** @format date-time */
  lastActivity?: string | null;
}

export interface GuestViewModel {
  invitationCode?: string | null;
  guestId?: string | null;
  /** @format int32 */
  guestNumber?: number | null;
  auth0Id?: string | null;
  firstName?: string | null;
  additionalFirstNames?: string[] | null;
  lastName?: string | null;
  roles: RoleEnum[] | null;
  allowBetaScreenRecordings?: boolean | null;
  email?: MaskedVerifiedModel;
  phone?: MaskedVerifiedModel;
  rsvp?: RsvpDto;
  preferences?: PreferencesDto;
  clientInfos?: ClientInfoDto[] | null;
  ageGroup?: AgeGroupEnum;
  /** @format date-time */
  lastActivity?: string | null;
}

export enum HttpStatusCode {
  Continue = 'Continue',
  SwitchingProtocols = 'SwitchingProtocols',
  Processing = 'Processing',
  EarlyHints = 'EarlyHints',
  OK = 'OK',
  Created = 'Created',
  Accepted = 'Accepted',
  NonAuthoritativeInformation = 'NonAuthoritativeInformation',
  NoContent = 'NoContent',
  ResetContent = 'ResetContent',
  PartialContent = 'PartialContent',
  MultiStatus = 'MultiStatus',
  AlreadyReported = 'AlreadyReported',
  IMUsed = 'IMUsed',
  MultipleChoices = 'MultipleChoices',
  MovedPermanently = 'MovedPermanently',
  Found = 'Found',
  SeeOther = 'SeeOther',
  NotModified = 'NotModified',
  UseProxy = 'UseProxy',
  Unused = 'Unused',
  TemporaryRedirect = 'TemporaryRedirect',
  PermanentRedirect = 'PermanentRedirect',
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  PaymentRequired = 'PaymentRequired',
  Forbidden = 'Forbidden',
  NotFound = 'NotFound',
  MethodNotAllowed = 'MethodNotAllowed',
  NotAcceptable = 'NotAcceptable',
  ProxyAuthenticationRequired = 'ProxyAuthenticationRequired',
  RequestTimeout = 'RequestTimeout',
  Conflict = 'Conflict',
  Gone = 'Gone',
  LengthRequired = 'LengthRequired',
  PreconditionFailed = 'PreconditionFailed',
  RequestEntityTooLarge = 'RequestEntityTooLarge',
  RequestUriTooLong = 'RequestUriTooLong',
  UnsupportedMediaType = 'UnsupportedMediaType',
  RequestedRangeNotSatisfiable = 'RequestedRangeNotSatisfiable',
  ExpectationFailed = 'ExpectationFailed',
  MisdirectedRequest = 'MisdirectedRequest',
  UnprocessableEntity = 'UnprocessableEntity',
  Locked = 'Locked',
  FailedDependency = 'FailedDependency',
  UpgradeRequired = 'UpgradeRequired',
  PreconditionRequired = 'PreconditionRequired',
  TooManyRequests = 'TooManyRequests',
  RequestHeaderFieldsTooLarge = 'RequestHeaderFieldsTooLarge',
  UnavailableForLegalReasons = 'UnavailableForLegalReasons',
  InternalServerError = 'InternalServerError',
  NotImplemented = 'NotImplemented',
  BadGateway = 'BadGateway',
  ServiceUnavailable = 'ServiceUnavailable',
  GatewayTimeout = 'GatewayTimeout',
  HttpVersionNotSupported = 'HttpVersionNotSupported',
  VariantAlsoNegotiates = 'VariantAlsoNegotiates',
  InsufficientStorage = 'InsufficientStorage',
  LoopDetected = 'LoopDetected',
  NotExtended = 'NotExtended',
  NetworkAuthenticationRequired = 'NetworkAuthenticationRequired',
}

export interface IAMPolicyStatement {
  Effect?: string | null;
  /** @uniqueItems true */
  Action?: string[] | null;
  /** @uniqueItems true */
  Resource?: string[] | null;
  Condition?: Record<string, Record<string, any>>;
}

export interface InvitationDesignDto {
  guestId: string | null;
  designId?: string | null;
  name?: string | null;
  dateCreated?: LastUpdateAuditDto;
  dateUpdated?: LastUpdateAuditDto;
  orientation?: OrientationEnum;
  /** @format int32 */
  separatorWidth?: number | null;
  separatorColor?: string | null;
  photoGridItems?: PhotoGridItemDto[] | null;
}

export enum InvitationResponseEnum {
  Pending = 'Pending',
  Interested = 'Interested',
  Declined = 'Declined',
}

export interface LastUpdateAuditDto {
  /** @format date-time */
  lastUpdate?: string;
  username: string | null;
}

export interface MaskedVerifiedModel {
  maskedValue?: string | null;
  verified?: boolean;
}

export enum NotificationPreferenceEnum {
  Email = 'Email',
  Text = 'Text',
}

export enum OrientationEnum {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
}

export interface PatchFamilyUnitRequest {
  mailingAddress?: AddressDto;
  invitationResponseNotes?: string | null;
}

export interface PatchGuestRequest {
  guestId: string | null;
  ageGroup?: AgeGroupEnum;
  auth0Id?: string | null;
  email?: string | null;
  phone?: string | null;
  invitationResponse?: InvitationResponseEnum;
  rehearsalDinner?: RsvpEnum;
  fourthOfJuly?: RsvpEnum;
  wedding?: RsvpEnum;
  rsvpNotes?: string | null;
  notificationPreference?: NotificationPreferenceEnum[] | null;
  sleepPreference?: SleepPreferenceEnum;
  foodPreference?: FoodPreferenceEnum;
  foodAllergies?: string[] | null;
  allowBetaScreenRecordings?: boolean | null;
}

export interface PatchUserRequest {
  clientInfo?: ClientInfoDto;
}

export interface PaymentError {
  type?: string | null;
  message?: string | null;
  code?: string | null;
  decline_code?: string | null;
}

export enum GiftCategoryEnum {
  Honeymoon = 'honeymoon',
  Remodel = 'remodel',
  Home = 'home',
  Dogs = 'dogs',
  Drinks = 'drinks',
  Custom = 'custom'
}

export interface GiftMetaData {
  guestId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  isAnonymous?: boolean;
  giftCategory?: string | null;
  giftNotes?: string | null;
}

export interface ContributionDto {
  paymentIntentId: string;
  guestId: string;
  amount: number;
  currency: string;
  giftCategory: string;
  giftNotes: string;
  guestName: string;
  isAnonymous: boolean;
  status: string;
  timestamp: string;
}

export interface StripePaymentIntentRequestDto {
  amount: number;
  currency: string;
  giftMetaData: GiftMetaData;
}

export interface PhotoGridItemDto {
  /** @format uuid */
  id?: string;
  photoSrc?: string | null;
  /** @format int32 */
  rowPosition?: number;
  /** @format int32 */
  columnPosition?: number;
  isLocked?: boolean;
  objectFit?: string | null;
  objectPosition?: string | null;
}

export interface PreferencesDto {
  notificationPreference?: NotificationPreferenceEnum[] | null;
  allowBetaScreenRecordings?: boolean | null;
  sleepPreference?: SleepPreferenceEnum;
  foodPreference?: FoodPreferenceEnum;
  foodAllergies?: string[] | null;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

export enum RoleEnum {
  Guest = 'Guest',
  Party = 'Party',
  FourthOfJuly = 'FourthOfJuly',
  Rehearsal = 'Rehearsal',
  Staff = 'Staff',
  Manor = 'Manor',
  Camper = 'Camper',
  BetaTester = 'BetaTester',
  Admin = 'Admin',
}

export interface RsvpDto {
  invitationResponse?: InvitationResponseEnum;
  invitationResponseAudit?: LastUpdateAuditDto;
  rehearsalDinner?: RsvpEnum;
  fourthOfJuly?: RsvpEnum;
  wedding?: RsvpEnum;
  rsvpAudit?: LastUpdateAuditDto;
  rsvpNotes?: string | null;
}

export enum RsvpEnum {
  Pending = 'Pending',
  Attending = 'Attending',
  Declined = 'Declined',
}

export interface ScreenInfoDto {
  /** @format int32 */
  width?: number | null;
  /** @format int32 */
  height?: number | null;
  /** @format int32 */
  colorDepth?: number | null;
}

export enum SleepPreferenceEnum {
  Unknown = 'Unknown',
  Manor = 'Manor',
  Camping = 'Camping',
  Hotel = 'Hotel',
  Other = 'Other',
}

export interface StatsViewModel {
  /** @format int32 */
  totalGuests?: number;
  /** @format int32 */
  totalRespondedSurveyGuests?: number;
  /** @format int32 */
  totalRespondedRsvpGuests?: number;
  /** @format int32 */
  attendingWeddingGuests?: number;
  /** @format int32 */
  attending4thGuests?: number;
  /** @format int32 */
  interestedGuests?: number;
  /** @format int32 */
  declinedGuests?: number;
  /** @format int32 */
  pendingWeddingGuests?: number;
  /** @format int32 */
  pending4thGuests?: number;
  /** @format int32 */
  declined4thGuests?: number;
  /** @format int32 */
  babyGuests?: number;
  /** @format int32 */
  under13Guests?: number;
  /** @format int32 */
  under21Guests?: number;
  /** @format int32 */
  adultGuests?: number;
  /** @format int32 */
  omnivoreGuests?: number;
  /** @format int32 */
  vegetarianGuests?: number;
  /** @format int32 */
  veganGuests?: number;
  allergiesCount?: Record<string, number>;
  /** @format int32 */
  manorGuests?: number;
  /** @format int32 */
  campingGuests?: number;
  /** @format int32 */
  hotelGuests?: number;
  /** @format int32 */
  otherAccommodationGuests?: number;
  /** @format int32 */
  unknownAccommodationGuests?: number;
  /** @format int32 */
  interestedFamilies?: number;
  /** @format int32 */
  attendingWeddingFamilies?: number;
  /** @format int32 */
  attending4thFamilies?: number;
  /** @format int32 */
  declinedFamilies?: number;
  /** @format int32 */
  pendingFamilies?: number;
  /** @format int32 */
  totalFamilies?: number;
  /** @format int32 */
  totalClientInfos?: number;
  deviceTypesCount?: Record<string, number>;
  browsers?: Record<string, number>;
  operatingSystems?: Record<string, number>;
  screenSizes?: Record<string, number>;
  languages?: Record<string, number>;
  connectionTypes?: Record<string, number>;
  deviceIds?: string[] | null;
}

export interface StorageSupportInfoDto {
  cookiesEnabled?: boolean | null;
  localStorageEnabled?: boolean | null;
}

export interface StripePaymentIntentResponseDto {
  clientSecret?: string | null;
  paymentIntentId?: string | null;
  /** @format int64 */
  amount?: number | null;
  currency?: string | null;
  error?: PaymentError;
}

export enum TwilioOtpStatusEnum {
  Pending = 'Pending',
  Approved = 'Approved',
  Canceled = 'Canceled',
  MaxAttemptsReached = 'Max_Attempts_Reached',
  Deleted = 'Deleted',
  Failed = 'Failed',
  Expired = 'Expired',
}

export interface ValidatePhoneResponse {
  verifiedStatus?: TwilioOtpStatusEnum;
  notificationServiceStatusCode?: HttpStatusCode;
  phoneVerifyState: VerifiedDto;
}

export interface VerifiedDto {
  value?: string | null;
  verified?: boolean;
  verificationCode?: string | null;
  /** @format date-time */
  verificationCodeExpiration?: string | null;
}

export interface VerifyEmailResponse {
  emailVerifyState: VerifiedDto;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Christephanie API
 * @version v1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags AdminConfiguration
     * @name AdminConfigurationInvitationCreate
     * @request POST:/api/admin/configuration/invitation
     * @secure
     */
    adminConfigurationInvitationCreate: (data: InvitationDesignDto, params: RequestParams = {}) =>
      this.request<InvitationDesignDto, ProblemDetails | void>({
        path: `/api/admin/configuration/invitation`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminConfiguration
     * @name AdminConfigurationInvitationList
     * @request GET:/api/admin/configuration/invitation
     * @secure
     */
    adminConfigurationInvitationList: (params: RequestParams = {}) =>
      this.request<InvitationDesignDto[], ProblemDetails | void>({
        path: `/api/admin/configuration/invitation`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminConfiguration
     * @name AdminConfigurationInvitationDelete
     * @request DELETE:/api/admin/configuration/invitation
     * @secure
     */
    adminConfigurationInvitationDelete: (
      query?: {
        designId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeleteResponse, ProblemDetails | void>({
        path: `/api/admin/configuration/invitation`,
        method: 'DELETE',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminConfiguration
     * @name AdminConfigurationInvitationDetail
     * @request GET:/api/admin/configuration/invitation/{designId}
     * @secure
     */
    adminConfigurationInvitationDetail: (designId: string, params: RequestParams = {}) =>
      this.request<InvitationDesignDto, ProblemDetails | void>({
        path: `/api/admin/configuration/invitation/${designId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFamilyUnit
     * @name AdminFamilyunitCreateUpdate
     * @request PUT:/api/admin/familyunit/create
     * @secure
     */
    adminFamilyunitCreateUpdate: (data: FamilyUnitDto[], params: RequestParams = {}) =>
      this.request<FamilyUnitDto[], ProblemDetails | void>({
        path: `/api/admin/familyunit/create`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFamilyUnit
     * @name AdminFamilyunitInvitationCodeList
     * @request GET:/api/admin/familyunit/invitationCode
     * @secure
     */
    adminFamilyunitInvitationCodeList: (
      query?: {
        invitationCode?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<FamilyUnitDto, ProblemDetails | void>({
        path: `/api/admin/familyunit/invitationCode`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFamilyUnit
     * @name AdminFamilyunitList
     * @request GET:/api/admin/familyunit
     * @secure
     */
    adminFamilyunitList: (params: RequestParams = {}) =>
      this.request<FamilyUnitDto[], ProblemDetails | void>({
        path: `/api/admin/familyunit`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFamilyUnit
     * @name AdminFamilyunitCreate
     * @request POST:/api/admin/familyunit
     * @secure
     */
    adminFamilyunitCreate: (data: FamilyUnitDto, params: RequestParams = {}) =>
      this.request<FamilyUnitDto, ProblemDetails | void>({
        path: `/api/admin/familyunit`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFamilyUnit
     * @name AdminFamilyunitPartialUpdate
     * @request PATCH:/api/admin/familyunit
     * @secure
     */
    adminFamilyunitPartialUpdate: (data: AdminPatchGuestRequest, params: RequestParams = {}) =>
      this.request<GuestDto, ProblemDetails | void>({
        path: `/api/admin/familyunit`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags AdminFamilyUnit
     * @name AdminFamilyunitDelete
     * @request DELETE:/api/admin/familyunit
     * @secure
     */
    adminFamilyunitDelete: (
      query?: {
        invitationCode?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeleteResponse, ProblemDetails | void>({
        path: `/api/admin/familyunit`,
        method: 'DELETE',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthorizeList
     * @request GET:/api/authorize
     * @secure
     */
    authorizeList: (
      query?: {
        invitationCode?: string;
        firstName?: string;
        arn?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<APIGatewayCustomAuthorizerResponse, ProblemDetails | void>({
        path: `/api/authorize`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags FamilyUnit
     * @name FamilyunitList
     * @request GET:/api/familyunit
     * @secure
     */
    familyunitList: (params: RequestParams = {}) =>
      this.request<FamilyUnitViewModel, ProblemDetails | void>({
        path: `/api/familyunit`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags FamilyUnit
     * @name FamilyunitCreate
     * @request POST:/api/familyunit
     * @secure
     */
    familyunitCreate: (data: FamilyUnitDto, params: RequestParams = {}) =>
      this.request<FamilyUnitViewModel, ProblemDetails | void>({
        path: `/api/familyunit`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags FamilyUnit
     * @name FamilyunitPartialUpdate
     * @request PATCH:/api/familyunit
     * @secure
     */
    familyunitPartialUpdate: (data: PatchFamilyUnitRequest, params: RequestParams = {}) =>
      this.request<FamilyUnitViewModel, ProblemDetails | void>({
        path: `/api/familyunit`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Guest
     * @name GuestList
     * @request GET:/api/guest
     * @secure
     */
    guestList: (
      query?: {
        guestId?: string;
        maskedValueType?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<string, ProblemDetails | void>({
        path: `/api/guest`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Guest
     * @name GuestPartialUpdate
     * @request PATCH:/api/guest
     * @secure
     */
    guestPartialUpdate: (data: PatchGuestRequest, params: RequestParams = {}) =>
      this.request<GuestViewModel, ProblemDetails | void>({
        path: `/api/guest`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags HelloWorld
     * @name HelloworldList
     * @request GET:/api/helloworld
     * @secure
     */
    helloworldList: (params: RequestParams = {}) =>
      this.request<APIGatewayProxyResponse, void>({
        path: `/api/helloworld`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags HelloWorld
     * @name AddressValidateCreate
     * @request POST:/api/address-validate
     * @secure
     */
    addressValidateCreate: (data: AddressDto, params: RequestParams = {}) =>
      this.request<AddressDto, ProblemDetails | void>({
        path: `/api/address-validate`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags HelloWorld
     * @name DebugdbList
     * @request GET:/api/debugdb
     * @secure
     */
    debugdbList: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/debugdb`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payment
     * @name PaymentsIntentCreate
     * @request POST:/api/payments/intent
     * @secure
     */
    paymentsIntentCreate: (data: StripePaymentIntentRequestDto, params: RequestParams = {}) =>
      this.request<StripePaymentIntentResponseDto, ProblemDetails | void>({
        path: `/api/payments/intent`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payment
     * @name PaymentsIntentList
     * @request GET:/api/payments/intent
     * @secure
     */
    paymentsIntentList: (params: RequestParams = {}) =>
      this.request<StripePaymentIntentResponseDto, ProblemDetails | void>({
        path: `/api/payments/intent`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Stats
     * @name StatsList
     * @request GET:/api/stats
     * @secure
     */
    statsList: (params: RequestParams = {}) =>
      this.request<StatsViewModel, ProblemDetails | void>({
        path: `/api/stats`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserFindList
     * @request GET:/api/user/find
     * @secure
     */
    userFindList: (
      query?: {
        invitationCode?: string;
        firstName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<FindUserResponse, ProblemDetails | void>({
        path: `/api/user/find`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserMeList
     * @request GET:/api/user/me
     * @secure
     */
    userMeList: (params: RequestParams = {}) =>
      this.request<GuestDto, ProblemDetails | void>({
        path: `/api/user/me`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserPartialUpdate
     * @request PATCH:/api/user
     * @secure
     */
    userPartialUpdate: (data: PatchUserRequest, params: RequestParams = {}) =>
      this.request<boolean | null, ProblemDetails | void>({
        path: `/api/user`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Validate
     * @name ValidateAddressCreate
     * @request POST:/api/validate/address
     * @secure
     */
    validateAddressCreate: (data: AddressDto, params: RequestParams = {}) =>
      this.request<AddressDto, ProblemDetails | void>({
        path: `/api/validate/address`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Validate
     * @name ValidatePhoneRegisterCreate
     * @request POST:/api/validate/phone/register
     * @secure
     */
    validatePhoneRegisterCreate: (
      query?: {
        phoneNumber?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ValidatePhoneResponse, ProblemDetails | void>({
        path: `/api/validate/phone/register`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Validate
     * @name ValidatePhoneValidatePartialUpdate
     * @request PATCH:/api/validate/phone/validate
     * @secure
     */
    validatePhoneValidatePartialUpdate: (
      query?: {
        code?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ValidatePhoneResponse, ProblemDetails | void>({
        path: `/api/validate/phone/validate`,
        method: 'PATCH',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Validate
     * @name ValidatePhoneResendCreate
     * @request POST:/api/validate/phone/resend
     * @secure
     */
    validatePhoneResendCreate: (params: RequestParams = {}) =>
      this.request<ValidatePhoneResponse, ProblemDetails | void>({
        path: `/api/validate/phone/resend`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Verify
     * @name VerifyEmailCreate
     * @request POST:/api/verify/email
     * @secure
     */
    verifyEmailCreate: (
      query?: {
        token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<VerifyEmailResponse, ProblemDetails | void>({
        path: `/api/verify/email`,
        method: 'POST',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}

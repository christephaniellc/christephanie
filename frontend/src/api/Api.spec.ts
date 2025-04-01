import Api from './Api';
import { FamilyUnitViewModel, RoleEnum, AgeGroupEnum } from '@/types/api';

// Mock fetch
declare const global: { fetch: jest.Mock };
const globalAny = global as any;
globalAny.fetch = jest.fn();

describe('Api.wip', () => {
  let api: Api;
  const mockGetAccessTokenSilently = jest.fn().mockResolvedValue('mock-token');
  
  beforeEach(() => {
    api = new Api(mockGetAccessTokenSilently);
    (globalAny.fetch as jest.Mock).mockClear();
  });

  describe('getAllFamilies', () => {
    it('should call fetch with the correct URL and return data', async () => {
      // Mock response data
      const mockFamilies: FamilyUnitViewModel[] = [
        {
          invitationCode: 'FAM123',
          unitName: 'Test Family',
          guests: [
            { 
              firstName: 'John', 
              lastName: 'Doe',
              roles: [RoleEnum.Guest],
              ageGroup: AgeGroupEnum.Adult
            }
          ]
        }
      ];
      
      // Setup fetch mock to return success
      (globalAny.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockFamilies)
      });
      
      // Call the method
      const result = await api.adminGetAllFamilies();
      
      // Verify fetch was called correctly
      expect(globalAny.fetch).toHaveBeenCalledTimes(1);
      expect(globalAny.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/familyunit'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      
      // Verify response
      expect(result).toEqual(mockFamilies);
    });

    it('should handle errors', async () => {
      // Setup fetch mock to return error
      (globalAny.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        json: jest.fn().mockResolvedValueOnce({
          error: 'Internal Server Error',
          description: 'Something went wrong'
        })
      });
      
      // Call the method and expect it to reject
      await expect(api.adminGetAllFamilies()).rejects.toMatchObject({
        status: 500
      });
    });
  });
});
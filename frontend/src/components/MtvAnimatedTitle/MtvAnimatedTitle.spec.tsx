import { render, screen } from '@testing-library/react';
import MtvAnimatedTitle from './MtvAnimatedTitle';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Mock the StephsActualFavoriteTypography component
jest.mock('@/components/AttendanceButton/AttendanceButton', () => ({
  StephsActualFavoriteTypography: ({ children, ...props }) => (
    <div data-testid="stephs-typography" {...props}>
      {children}
    </div>
  ),
}));

// Mock useBoxShadow hook
jest.mock('@/hooks/useBoxShadow', () => ({
  useBoxShadow: jest.fn(() => ({
    boxShadow: '5px 5px 10px rgba(0,0,0,0.5)',
  })),
}));

// Mock TvSnow component
jest.mock('./TvSnow', () => ({
  __esModule: true,
  default: () => <div data-testid="tv-snow" />
}));

// Mock useApiContext
jest.mock('@/context/ApiContext', () => ({
  useApiContext: jest.fn(() => ({
    findUserIdQuery: { isFetching: false },
    getMeQuery: { isFetching: false },
    validateAddressMutation: { isPending: false },
    getFamilyUnitQuery: { isFetching: false },
    patchFamilyMutation: { isPending: false },
    patchFamilyGuestMutation: { isPending: false },
  })),
}));

// Mock saveTheDateStepsState values
const mockSaveTheDateStepsState = {
  attendance: {
    label: 'Interested'
  }
};

// Mock for stdTabIndex
const mockTabIndex = 0;

// Override useRecoilValue to return our mock data
jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilValue: jest.fn().mockImplementation((atom) => {
    if (atom.key === 'saveTheDateStepsState') {
      return mockSaveTheDateStepsState;
    } 
    if (atom.key === 'stdTabIndex') {
      return mockTabIndex;
    }
    return {};
  }),
  RecoilRoot: ({ children }) => children,
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      dark: '#303f9f',
    },
    secondary: {
      main: '#E9950C',
    },
  },
});

describe('MtvAnimatedTitle Component [wip]', () => {
  it('renders the title with typography component [wip]', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <MtvAnimatedTitle />
        </RecoilRoot>
      </ThemeProvider>
    );

    // Check that the typography component is rendered
    const typography = screen.getByTestId('stephs-typography');
    expect(typography).toBeInTheDocument();
  });
});
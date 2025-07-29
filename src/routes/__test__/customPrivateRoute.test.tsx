import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import CustomPrivateRoute from '../customPrivateRoute';

// Mock Navigate to test redirect
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    Navigate: ({ to }: any) => <div>Redirected to {to}</div>,
    Outlet: () => <div>Outlet rendered</div>,
  };
});

describe('CustomPrivateRoute', () => {
  it('renders children when check is true', () => {
    const { getByText } = render(
      <MemoryRouter>
        <CustomPrivateRoute check={true} redirectPath="/login">
          <div>Private Content</div>
        </CustomPrivateRoute>
      </MemoryRouter>,
    );
    expect(getByText('Private Content')).toBeInTheDocument();
  });

  it('renders Outlet when check is true and no children', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<CustomPrivateRoute check={true} redirectPath="/login" />}>
            <Route path="/" element={<div>Outlet rendered</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(getByText('Outlet rendered')).toBeInTheDocument();
  });

  it('redirects when check is false', () => {
    const { getByText } = render(
      <MemoryRouter>
        <CustomPrivateRoute check={false} redirectPath="/login">
          <div>Private Content</div>
        </CustomPrivateRoute>
      </MemoryRouter>,
    );
    expect(getByText('Redirected to /login')).toBeInTheDocument();
  });
});

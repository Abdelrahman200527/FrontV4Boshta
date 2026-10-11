import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthMiddleware from '../../src/middlewares/auth.middleware';
import GuestMiddleware from '../../src/middlewares/guest.middleware';
import * as cookies from '../../src/utils/cookies';
import * as getUserModule from '../../src/utils/getUser';

describe('AuthMiddleware & GuestMiddleware Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthMiddleware', () => {
    it('redirects unauthenticated users to /login when token or user is missing', () => {
      vi.spyOn(cookies, 'getCookie').mockReturnValue(null);
      vi.spyOn(getUserModule, 'default').mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/student']}>
          <Routes>
            <Route
              path="/student"
              element={
                <AuthMiddleware allowedRoles={['student']}>
                  <div>Protected Student Content</div>
                </AuthMiddleware>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Student Content')).not.toBeInTheDocument();
    });

    it('renders protected content when role matches allowedRoles', () => {
      vi.spyOn(cookies, 'getCookie').mockReturnValue('valid_token_123');
      vi.spyOn(getUserModule, 'default').mockReturnValue({ id: 1, role: 'student' });

      render(
        <MemoryRouter initialEntries={['/student']}>
          <Routes>
            <Route
              path="/student"
              element={
                <AuthMiddleware allowedRoles={['student']}>
                  <div>Protected Student Content</div>
                </AuthMiddleware>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Student Content')).toBeInTheDocument();
    });

    it('redirects user to their own role dashboard if attempting to access another role route', () => {
      vi.spyOn(cookies, 'getCookie').mockReturnValue('valid_token_123');
      vi.spyOn(getUserModule, 'default').mockReturnValue({ id: 5, role: 'teacher' });

      render(
        <MemoryRouter initialEntries={['/super-admin']}>
          <Routes>
            <Route
              path="/super-admin"
              element={
                <AuthMiddleware allowedRoles={['super_admin']}>
                  <div>Super Admin Panel</div>
                </AuthMiddleware>
              }
            />
            <Route path="/teacher" element={<div>Teacher Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Super Admin Panel')).not.toBeInTheDocument();
    });
  });

  describe('GuestMiddleware', () => {
    it('renders guest child components when user is not logged in', () => {
      vi.spyOn(cookies, 'getCookie').mockReturnValue(null);
      vi.spyOn(getUserModule, 'default').mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestMiddleware>
                  <div>Public Login Form</div>
                </GuestMiddleware>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Login Form')).toBeInTheDocument();
    });

    it('redirects logged-in student away from guest page to /student', () => {
      vi.spyOn(cookies, 'getCookie').mockReturnValue('valid_token_123');
      vi.spyOn(getUserModule, 'default').mockReturnValue({ id: 1, role: 'student' });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestMiddleware>
                  <div>Public Login Form</div>
                </GuestMiddleware>
              }
            />
            <Route path="/student" element={<div>Student Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Student Home')).toBeInTheDocument();
    });

    it('regression: redirects logged-in super_admin away from guest page to /super-admin', () => {
      vi.spyOn(cookies, 'getCookie').mockReturnValue('valid_admin_token');
      vi.spyOn(getUserModule, 'default').mockReturnValue({ id: 99, role: 'super_admin' });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestMiddleware>
                  <div>Public Login Form</div>
                </GuestMiddleware>
              }
            />
            <Route path="/super-admin" element={<div>Super Admin Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Super Admin Home')).toBeInTheDocument();
    });
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { CartProvider } from './components/CartContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import AgencyDetail from './pages/AgencyDetail';
import CartPage from './pages/CartPage';
import OrderTracking from './pages/OrderTracking';
import OrdersList from './pages/OrdersList';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/agency/:id" element={<AgencyDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order/:id" element={<OrderTracking />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/search" element={<Home />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

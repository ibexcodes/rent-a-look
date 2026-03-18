/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ProfilePage from './ProfilePage';
import LoginPage from './LoginPage';
import CollectionPage from './CollectionPage';
import ServicesPage from './ServicesPage';
import AdminDashboard from './AdminDashboard';
import ItemDetailsPage from './ItemDetailsPage';
import { FirebaseProvider } from './FirebaseContext';
import { CartProvider } from './CartContext';
import { Cart } from './components/Cart';
import { LaunchBar } from './components/LaunchBar';

export default function App() {
  return (
    <FirebaseProvider>
      <CartProvider>
        <Router>
          <Cart />
          <LaunchBar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/admin" element={<AdminDashboard onBack={() => window.history.back()} />} />
          </Routes>
        </Router>
      </CartProvider>
    </FirebaseProvider>
  );
}

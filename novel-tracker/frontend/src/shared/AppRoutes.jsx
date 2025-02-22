import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import AuthLayout from "../layout/AuthLayout";
import NotFound from "./NotFound";
import Loader from "./Loader";
import MainLayout from "../layout/MainLayout";

const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const Profile = lazy(() => import("../pages/auth/Profile"));

const Home = lazy(() => import("./Home"));
const Dashboard = lazy(() => import("./Dashboard"));

const BookList = lazy(() => import("../pages/books/BookList"));
const AddEditBook = lazy(() => import("../pages/books/AddEditBook"));
const ViewBook = lazy(() => import("../pages/books/ViewBook"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />

          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthRoutes />} />

          {/* Main Routes */}
          <Route
            path="/*"
            element={
              <MainLayout>
                <Suspense fallback={<Loader />}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/books" element={<BookList />} />
                    <Route path="/books/:bookId" element={<ViewBook />} />
                    <Route path="/books/add" element={<AddEditBook />} />
                    <Route
                      path="/books/edit/:bookId"
                      element={<AddEditBook />}
                    />
                  </Routes>
                </Suspense>
              </MainLayout>
            }
          />

          <Route
            path="/auth/reset-password/:token"
            element={<ResetPassword />}
          />
          {/* 404 Route - This should be the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const AuthRoutes = () => {
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Add more auth-related routes here */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthLayout>
  );
};

export default AppRoutes;

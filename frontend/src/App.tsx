import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ViewerProvider } from './contexts/ViewerContext';
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PdfViewer } from './components/ui/PdfViewer';
import { SearchDialog } from './components/ui/SearchDialog';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { VideoViewer } from './pages/VideoViewer';
import { TestSeriesPage } from './pages/TestSeriesPage';
import { TestSeriesDetail } from './pages/TestSeriesDetail';
import { TestInterface } from './pages/TestInterface';
import { TestResult } from './pages/TestResult';
import { Solutions } from './pages/Solutions';
import { Notes } from './pages/Notes';
import { CurrentAffairs } from './pages/CurrentAffairs';
import { PreviousPapers } from './pages/PreviousPapers';
import { SyllabusPage } from './pages/SyllabusPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { Profile } from './pages/Profile';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminCourseForm } from './pages/admin/AdminCourseForm';
import { AdminTestSeries } from './pages/admin/AdminTestSeries';
import { AdminTestBuilder } from './pages/admin/AdminTestBuilder';
import { AdminNotes } from './pages/admin/AdminNotes';
import { AdminCurrentAffairs } from './pages/admin/AdminCurrentAffairs';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSyllabus } from './pages/admin/AdminSyllabus';
import { AdminPreviousPapers } from './pages/admin/AdminPreviousPapers';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminStudentDetail } from './pages/admin/AdminStudentDetail';
import { AdminSettings } from './pages/admin/AdminSettings';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ViewerProvider>
          <Routes>
            <Route element={<StudentLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/test-series" element={<TestSeriesPage />} />
              <Route path="/test-series/:seriesId" element={<TestSeriesDetail />} />
              <Route path="/test/:testId/result" element={<TestResult />} />
              <Route path="/test/:testId/solutions" element={<Solutions />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/current-affairs" element={<CurrentAffairs />} />
              <Route path="/previous-papers" element={<PreviousPapers />} />
              <Route path="/syllabus" element={<SyllabusPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/learn/:courseId/:lessonId" element={<VideoViewer />} />
            <Route path="/test/:testId" element={<TestInterface />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/new" element={<AdminCourseForm />} />
              <Route path="test-series" element={<AdminTestSeries />} />
              <Route path="test-series/new-test" element={<AdminTestBuilder />} />
              <Route path="notes" element={<AdminNotes />} />
              <Route path="current-affairs" element={<AdminCurrentAffairs />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="syllabus" element={<AdminSyllabus />} />
              <Route path="previous-papers" element={<AdminPreviousPapers />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:studentId" element={<AdminStudentDetail />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <PdfViewer />
          <SearchDialog />
        </ViewerProvider>
      </AuthProvider>
    </BrowserRouter>);

}
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ViewerProvider } from './contexts/ViewerContext';
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PdfViewer } from './components/ui/PdfViewer';
import { SearchDialog } from './components/ui/SearchDialog';

import { About } from './pages/About';
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
import { CurrentAffairsTest } from './pages/CurrentAffairsTest';
import { PreviousPapers } from './pages/PreviousPapers';
import { PreviousPaperTest } from './pages/PreviousPaperTest';
import { SyllabusPage } from './pages/SyllabusPage';
import { NoticesPage } from './pages/NoticesPage';
import { NoticeDetail } from './pages/NoticeDetail';
import { Profile } from './pages/Profile';
import { NotificationsPage } from './pages/NotificationsPage';
import { Miscellaneous } from './pages/Miscellaneous';
import { SavedQuestions } from './pages/SavedQuestions';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminCourseForm } from './pages/admin/AdminCourseForm';
import { AdminTestSeries } from './pages/admin/AdminTestSeries';
import { AdminTestSeriesForm } from './pages/admin/AdminTestSeriesForm';
import { AdminTestSeriesDetail } from './pages/admin/AdminTestSeriesDetail';
import { AdminQuestionReports } from './pages/admin/AdminQuestionReports';
import { AdminTestBuilder } from './pages/admin/AdminTestBuilder';
import { AdminNotes } from './pages/admin/AdminNotes';
import { AdminNotesForm } from './pages/admin/AdminNotesForm';
import { AdminCurrentAffairs } from './pages/admin/AdminCurrentAffairs';
import { AdminCurrentAffairsForm } from './pages/admin/AdminCurrentAffairsForm';
import { AdminNotices } from './pages/admin/AdminNotices';
import { AdminNoticeForm } from './pages/admin/AdminNoticeForm';
import { AdminSyllabus } from './pages/admin/AdminSyllabus';
import { AdminSyllabusForm } from './pages/admin/AdminSyllabusForm';
import { AdminPreviousPapers } from './pages/admin/AdminPreviousPapers';
import { AdminPreviousPaperForm } from './pages/admin/AdminPreviousPaperForm';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminStudentDetail } from './pages/admin/AdminStudentDetail';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminBanners } from './pages/admin/AdminBanners';

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
              <Route path="/test-series/:seriesId/tests/:testId/result" element={<TestResult />} />
              <Route path="/test-series/:seriesId/tests/:testId/solutions" element={<Solutions />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/notes/:collectionName" element={<Notes />} />
              <Route path="/current-affairs" element={<CurrentAffairs />} />
              <Route path="/current-affairs/:entryId/solutions" element={<Solutions source="current-affairs" />} />
              <Route path="/current-affairs/:entryId/test" element={<CurrentAffairsTest />} />
              <Route path="/previous-papers" element={<PreviousPapers />} />
              <Route path="/previous-papers/:paperId/solutions" element={<Solutions source="previous-paper" />} />
              <Route path="/previous-papers/:paperId/test" element={<PreviousPaperTest />} />
              <Route path="/syllabus" element={<SyllabusPage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/notices/:noticeId" element={<NoticeDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/saved-questions" element={<SavedQuestions />} />
              <Route path="/miscellaneous" element={<Miscellaneous />} />
              <Route path="/about" element={<About />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/learn/:courseId/:lessonId" element={<VideoViewer />} />
            <Route path="/test-series/:seriesId/tests/:testId" element={<TestInterface />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/new" element={<AdminCourseForm />} />
              <Route path="courses/:courseId/edit" element={<AdminCourseForm />} />
              <Route path="test-series" element={<AdminTestSeries />} />
              <Route path="test-series/new" element={<AdminTestSeriesForm />} />
              <Route path="test-series/:seriesId/edit" element={<AdminTestSeriesForm />} />
              <Route path="test-series/:seriesId" element={<AdminTestSeriesDetail />} />
              <Route path="test-series/:seriesId/tests/new" element={<AdminTestBuilder />} />
              <Route path="test-series/:seriesId/tests/:testId/edit" element={<AdminTestBuilder />} />
              <Route path="question-reports" element={<AdminQuestionReports />} />
              <Route path="notes" element={<AdminNotes />} />
              <Route path="notes/new" element={<AdminNotesForm />} />
              <Route path="notes/:noteId/edit" element={<AdminNotesForm />} />
              <Route path="current-affairs" element={<AdminCurrentAffairs />} />
              <Route path="current-affairs/new" element={<AdminCurrentAffairsForm />} />
              <Route path="current-affairs/:entryId/edit" element={<AdminCurrentAffairsForm />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="notices/new" element={<AdminNoticeForm />} />
              <Route path="notices/:noticeId/edit" element={<AdminNoticeForm />} />
              <Route path="syllabus" element={<AdminSyllabus />} />
              <Route path="syllabus/new" element={<AdminSyllabusForm />} />
              <Route path="syllabus/:syllabusId/edit" element={<AdminSyllabusForm />} />
              <Route path="previous-papers" element={<AdminPreviousPapers />} />
              <Route path="previous-papers/new" element={<AdminPreviousPaperForm />} />
              <Route path="previous-papers/:paperId/edit" element={<AdminPreviousPaperForm />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:studentId" element={<AdminStudentDetail />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="banners" element={<AdminBanners />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <PdfViewer />
          <SearchDialog />
        </ViewerProvider>
      </AuthProvider>
    </BrowserRouter>);

}

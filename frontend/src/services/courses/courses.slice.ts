import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AdminCourse, CoursePayload, LecturePayload, courseSchema, coursesApiService } from './courses.api';

interface CoursesState { items: AdminCourse[]; current: AdminCourse | null; publicItems: AdminCourse[]; publicCurrent: AdminCourse | null; loading: boolean; saving: boolean; error: string | null }
const initialState: CoursesState = { items: [], current: null, publicItems: [], publicCurrent: null, loading: false, saving: false, error: null };
const message = (error: unknown) => axios.isAxiosError(error)
  ? error.response?.data?.message || 'Course request failed.'
  : error instanceof Error ? error.message : 'Course request failed.';

export const fetchAdminCourses = createAsyncThunk<AdminCourse[], string | undefined, { rejectValue: string }>('courses/listAdmin', async (search = '', api) => {
  try { return (await coursesApiService.listAdmin(search)).data.data.courses; } catch (error) { return api.rejectWithValue(message(error)); }
});
export const fetchPublicCourses = createAsyncThunk<AdminCourse[], { search?: string; exam?: string; category?: string; access?: string } | undefined, { rejectValue: string }>('courses/listPublic', async (params, api) => { try { return (await coursesApiService.listPublic(params)).data.data.courses; } catch (error) { return api.rejectWithValue(message(error)); } });
export const fetchPublicCourse = createAsyncThunk<AdminCourse, string, { rejectValue: string }>('courses/getPublic', async (id, api) => { try { return (await coursesApiService.getPublic(id)).data.data.course; } catch (error) { return api.rejectWithValue(message(error)); } });
export const fetchCourse = createAsyncThunk<AdminCourse, string, { rejectValue: string }>('courses/get', async (id, api) => {
  try { return (await coursesApiService.get(id)).data.data.course; } catch (error) { return api.rejectWithValue(message(error)); }
});
export const createCourse = createAsyncThunk<AdminCourse, CoursePayload, { rejectValue: string }>('courses/create', async (payload, api) => {
  try { await courseSchema.validate(payload, { abortEarly: false }); return (await coursesApiService.create(payload)).data.data.course; }
  catch (error) { return api.rejectWithValue(message(error)); }
});
export const updateCourse = createAsyncThunk<AdminCourse, { id: string; payload: CoursePayload }, { rejectValue: string }>('courses/update', async ({ id, payload }, api) => {
  try { await courseSchema.validate(payload, { abortEarly: false }); return (await coursesApiService.update(id, payload)).data.data.course; }
  catch (error) { return api.rejectWithValue(message(error)); }
});
export const deleteCourse = createAsyncThunk<string, string, { rejectValue: string }>('courses/delete', async (id, api) => {
  try { await coursesApiService.remove(id); return id; } catch (error) { return api.rejectWithValue(message(error)); }
});
export const addCourseLecture = createAsyncThunk<AdminCourse, { courseId: string; lecture: LecturePayload }, { rejectValue: string }>('courses/addLecture', async ({ courseId, lecture }, api) => {
  try { return (await coursesApiService.addLecture(courseId, lecture)).data.data.course; }
  catch (error) { return api.rejectWithValue(message(error)); }
});
export const deleteCourseLecture = createAsyncThunk<AdminCourse, { courseId: string; lectureId: string }, { rejectValue: string }>('courses/deleteLecture', async ({ courseId, lectureId }, api) => {
  try { return (await coursesApiService.removeLecture(courseId, lectureId)).data.data.course; }
  catch (error) { return api.rejectWithValue(message(error)); }
});

const slice = createSlice({
  name: 'courses', initialState,
  reducers: { clearCourseError: (state) => { state.error = null; }, clearCurrentCourse: (state) => { state.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCourses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminCourses.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchAdminCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Unable to load courses.'; })
      .addCase(fetchCourse.pending, (state) => { state.loading = true; state.error = null; state.current = null; })
      .addCase(fetchCourse.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchCourse.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Unable to load course.'; });
    builder.addCase(fetchPublicCourses.pending, (state) => { state.loading = true; state.error = null; }).addCase(fetchPublicCourses.fulfilled, (state, action) => { state.loading = false; state.publicItems = action.payload; }).addCase(fetchPublicCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Unable to load courses.'; });
    builder.addCase(fetchPublicCourse.pending, (state) => { state.loading = true; state.error = null; state.publicCurrent = null; }).addCase(fetchPublicCourse.fulfilled, (state, action) => { state.loading = false; state.publicCurrent = action.payload; }).addCase(fetchPublicCourse.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Unable to load course.'; });
    [createCourse, updateCourse, addCourseLecture, deleteCourseLecture].forEach((thunk) => {
      builder.addCase(thunk.pending, (state) => { state.saving = true; state.error = null; });
      builder.addCase(thunk.fulfilled, (state, action) => {
        state.saving = false; state.current = action.payload;
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index >= 0) state.items[index] = action.payload; else state.items.unshift(action.payload);
      });
      builder.addCase(thunk.rejected, (state, action) => { state.saving = false; state.error = action.payload || 'Unable to save course.'; });
    });
    builder.addCase(deleteCourse.pending, (state) => { state.saving = true; state.error = null; });
    builder.addCase(deleteCourse.fulfilled, (state, action) => { state.saving = false; state.items = state.items.filter((item) => item._id !== action.payload); });
    builder.addCase(deleteCourse.rejected, (state, action) => { state.saving = false; state.error = action.payload || 'Unable to delete course.'; });
  },
});
export const { clearCourseError, clearCurrentCourse } = slice.actions;
export default slice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { bookmarksApiService, bookmarkKey } from './bookmarks.api';
import type { BookmarkReference, SavedQuestion } from './bookmarks.api';
import type { RootState } from '../../store';

const message = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.message || 'Saved question request failed.' : error instanceof Error ? error.message : 'Saved question request failed.';
type State = { items: SavedQuestion[]; ownerId: string; status: 'idle' | 'loading' | 'ready' | 'failed'; pending: Record<string, boolean>; error: string | null };
const initialState: State = { items: [], ownerId: '', status: 'idle', pending: {}, error: null };
export const fetchBookmarks = createAsyncThunk<SavedQuestion[], string, { state: RootState; rejectValue: string }>('bookmarks/list', async (_, api) => { try { return (await bookmarksApiService.list()).data.data.bookmarks; } catch (error) { return api.rejectWithValue(message(error)); } }, { condition: (ownerId, { getState }) => { const state = getState().bookmarks; return state.ownerId !== ownerId || state.status !== 'loading'; } });
export const saveQuestion = createAsyncThunk<SavedQuestion, BookmarkReference, { rejectValue: string }>('bookmarks/save', async (ref, api) => { try { return (await bookmarksApiService.save(ref)).data.data.bookmark; } catch (error) { return api.rejectWithValue(message(error)); } });
export const removeSavedQuestion = createAsyncThunk<string, SavedQuestion, { rejectValue: string }>('bookmarks/remove', async (item, api) => { try { await bookmarksApiService.remove(item._id); return item._id; } catch (error) { return api.rejectWithValue(message(error)); } });
const slice = createSlice({ name: 'bookmarks', initialState, reducers: {}, extraReducers: (builder) => {
  builder.addCase(fetchBookmarks.pending, (state, action) => { if (state.ownerId !== action.meta.arg) { state.items = []; state.pending = {}; } state.ownerId = action.meta.arg; state.status = 'loading'; state.error = null; });
  builder.addCase(fetchBookmarks.fulfilled, (state, action) => { if (state.ownerId !== action.meta.arg) return; state.status = 'ready'; state.items = action.payload; });
  builder.addCase(fetchBookmarks.rejected, (state, action) => { if (state.ownerId !== action.meta.arg) return; state.status = 'failed'; state.error = action.payload || 'Unable to load saved questions.'; });
  builder.addCase(saveQuestion.pending, (state, action) => { state.pending[bookmarkKey(action.meta.arg)] = true; state.error = null; });
  builder.addCase(saveQuestion.fulfilled, (state, action) => { delete state.pending[bookmarkKey(action.meta.arg)]; if (action.payload.user !== state.ownerId) return; if (!state.items.some((item) => item._id === action.payload._id)) state.items.unshift(action.payload); });
  builder.addCase(saveQuestion.rejected, (state, action) => { delete state.pending[bookmarkKey(action.meta.arg)]; state.error = action.payload || 'Unable to save question.'; });
  builder.addCase(removeSavedQuestion.pending, (state, action) => { state.pending[bookmarkKey(action.meta.arg)] = true; state.error = null; });
  builder.addCase(removeSavedQuestion.fulfilled, (state, action) => { delete state.pending[bookmarkKey(action.meta.arg)]; state.items = state.items.filter((item) => item._id !== action.payload); });
  builder.addCase(removeSavedQuestion.rejected, (state, action) => { delete state.pending[bookmarkKey(action.meta.arg)]; state.error = action.payload || 'Unable to remove saved question.'; });
  builder.addCase('auth/logout/fulfilled', () => initialState);
} });
export default slice.reducer;

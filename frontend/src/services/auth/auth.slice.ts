import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../../types';
import { authApiService, changePasswordSchema, loginSchema, registerSchema, ChangePasswordPayload, LoginPayload, RegisterPayload } from './auth.api';

type AuthState = { user: User | null; loading: boolean; error: string | null };
const initialState: AuthState = { user: null, loading: false, error: null };
const mapUser = (user: Omit<User, 'avatar'>): User => ({ ...user, avatar: '' });
const errorMessage = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.message || 'Request failed.' : error instanceof Error ? error.message : 'Request failed.';

export const login = createAsyncThunk<User, LoginPayload, { rejectValue: string }>('auth/login', async (data, { rejectWithValue }) => {
  try { await loginSchema.validate(data, { abortEarly: false }); return mapUser((await authApiService.login(data)).data.data.user); }
  catch (error) { return rejectWithValue(errorMessage(error)); }
});
export const register = createAsyncThunk<User, RegisterPayload, { rejectValue: string }>('auth/register', async (data, { rejectWithValue }) => {
  try { await registerSchema.validate(data, { abortEarly: false }); return mapUser((await authApiService.register(data)).data.data.user); }
  catch (error) { return rejectWithValue(errorMessage(error)); }
});
export const logout = createAsyncThunk('auth/logout', async () => { await authApiService.logout(); });
export const restoreSession = createAsyncThunk<User, void, { rejectValue: string }>('auth/me', async (_, { rejectWithValue }) => {
  try { let response; try { response = await authApiService.me(); } catch (error) { if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error; response = await authApiService.refresh(); } return mapUser(response.data.data.user); }
  catch (error) { return rejectWithValue(errorMessage(error)); }
});
export const changePassword = createAsyncThunk<string, ChangePasswordPayload, { rejectValue: string }>('auth/changePassword', async (data, { rejectWithValue }) => { try { await changePasswordSchema.validate(data, { abortEarly: false }); await authApiService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }); return 'Password updated successfully.'; } catch (error) { return rejectWithValue(errorMessage(error)); } });

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => builder
    .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
    .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Login failed.'; })
    .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
    .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Registration failed.'; })
    .addCase(logout.fulfilled, (state) => { state.user = null; })
    .addCase(restoreSession.pending, (state) => { state.loading = true; })
    .addCase(restoreSession.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
    .addCase(restoreSession.rejected, (state) => { state.loading = false; state.user = null; })
    .addCase(changePassword.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(changePassword.fulfilled, (state) => { state.loading = false; })
    .addCase(changePassword.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Unable to update password.'; }),
});
export const { clearError } = slice.actions;
export default slice.reducer;

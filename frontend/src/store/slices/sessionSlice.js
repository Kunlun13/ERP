import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchSessions = createAsyncThunk('session/fetchAll', async () => {
  const { data } = await api.get('/sessions');
  return data.data;
});

export const createSession = createAsyncThunk('session/create', async (payload) => {
  const { data } = await api.post('/sessions', payload);
  return data.data;
});

const storedSessionId = localStorage.getItem('activeSessionId');
const storedSessionName = localStorage.getItem('activeSessionName');

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    sessions: [],
    activeSessionId: storedSessionId || null,
    activeSessionName: storedSessionName || null,
    loading: false,
  },
  reducers: {
    setActiveSession: (state, action) => {
      state.activeSessionId = action.payload.id;
      state.activeSessionName = action.payload.name;
      localStorage.setItem('activeSessionId', action.payload.id);
      localStorage.setItem('activeSessionName', action.payload.name);
    },
    clearActiveSession: (state) => {
      state.activeSessionId = null;
      state.activeSessionName = null;
      localStorage.removeItem('activeSessionId');
      localStorage.removeItem('activeSessionName');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => { state.loading = true; })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
      });
  },
});

export const { setActiveSession, clearActiveSession } = sessionSlice.actions;
export default sessionSlice.reducer;

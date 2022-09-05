import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { convertTitle, getStorageItem } from 'utils/helper';
import { Service, Web3Storage } from 'web3.storage';
import config from 'utils/config';

const client = new Web3Storage({ token: config.REACT_APP_WEB3_STORAGE_API_TOKEN } as Service);


const initialState = {
  Initialized: false,
  Blogs: [] as IBlog[],
  Users: {} as { [key: string]: IUser; }
} as IDatabase;

export const createBlog = createAsyncThunk('createBlog', async (blog: IBlog, {rejectWithValue}) => {
  try {
    const title = "blog_" + convertTitle(blog.Title);
    let blob = new File([JSON.stringify(blog, null, 2)], title, {type: "application/json"})
    const rootCid = await client.put([blob], {
      name: title,
      maxRetries: 3,
      wrapWithDirectory: false
    });

    blog.CID = rootCid;
    return blog;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const createUser = createAsyncThunk('createUser', async (user: IUser, {rejectWithValue}) => {
  try {
    const title = "user_" + convertTitle(user.Wallet);
    let blob = new File([JSON.stringify(user, null, 2)], title, {type: "application/json"})
    const rootCid = await client.put([blob], {
      name: title,
      maxRetries: 3,
      wrapWithDirectory: false
    });

    user.CID = rootCid;
    return user;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const uploadImage = createAsyncThunk('uploadImage', async (file: File, {rejectWithValue}) => {
  try {
    const rootCid = await client.put([file], {
      name: "image_" + (new Date()).getTime().toString(),
      maxRetries: 3,
      wrapWithDirectory: false
    });
    return rootCid;
  } catch (err: any) {
    return rejectWithValue(err.response.data);
  }
});

export const dbSlice = createSlice({
  name: 'dbSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    resetFromLocalStorage: (state: IDatabase, action: PayloadAction<number>) => {
      // dispose individual action

      const blogs = state.Blogs;
      const users = state.Users;
      const lastSyncNumber = getStorageItem(config.LAST_SYNC_NUMBER, 0) || 0;
      const startNumber = state.Initialized ? action.payload : 0;
      for (let i = startNumber; i < lastSyncNumber; i++)
      {
        const data = getStorageItem(config.LAST_SYNC_RECORD + i, {}) || {};
        console.log(data.Date);
        data.Date = new Date(data.Date);
        switch (data.Type) {
          case "ADD_BLOG":
            blogs.push(data);
            break;

          case "ADD_USER":
            users[data.Wallet] = data;
            break;

          default:
            break;
        }
      }

      blogs.sort((a, b) => (a.Date || new Date()) < (b.Date || new Date()) ? 1 : -1);
      state.Blogs = blogs;
      state.Users = users;
      state.Initialized = true;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(createBlog.fulfilled, (state: any, action: PayloadAction<any>) => {
    });
  },
});

export const {resetFromLocalStorage} = dbSlice.actions;

export default dbSlice.reducer;
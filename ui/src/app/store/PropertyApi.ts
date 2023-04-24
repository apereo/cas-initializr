import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Property } from '../data/Property';
import { API_PATH } from '../App.constant';

//const baseUrl = `${API_PATH}properties`;
const baseUrl = `/properties.json`

// Define a service using a base URL and expected endpoints
export const propertyApi = createApi({
    reducerPath: 'propertyApi',
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
        getProperties: builder.query<Property[], string>({
            query: (version) => ``,
        }),
    }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPropertiesQuery } = propertyApi
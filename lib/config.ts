import dotenv from 'dotenv';
dotenv.config();
export const appwriteconfig={
        endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
        news_letter_collection_id:process.env.NEXT_PUBLIC_NEWS_LETTERCOLLECTION_ID!
};
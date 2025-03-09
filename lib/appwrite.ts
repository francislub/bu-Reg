import { Client, Account, Databases } from 'appwrite';
import {appwriteconfig} from '@/lib/config'
export const client = new Client()
    .setEndpoint(appwriteconfig.endpointUrl)
    .setProject(appwriteconfig.projectId) 
export const databases = new Databases(client);
export const account = new Account(client);
export { ID } from 'appwrite';

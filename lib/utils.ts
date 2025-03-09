import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {databases, ID} from '@/lib/appwrite'
import { appwriteconfig } from "./config"
import { Query } from "appwrite"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const CreateEmail = async (email: string) => {
        try {
          const existing = await databases.listDocuments(
            appwriteconfig.databaseId,
            appwriteconfig.news_letter_collection_id,
            [Query.equal('Email', [email])]
          );
      
          if (!existing.documents.length) {
            await databases.createDocument(
              appwriteconfig.databaseId,
              appwriteconfig.news_letter_collection_id,
              ID.unique(),
              { "Email": email }
            );
            return { success: true, message: 'Email successfully added.' };
          } else {
            return { success: false, message: 'Email already exists.' };
          }
        } catch (error) {
          console.error('Error creating email:', error);
          return { success: false, message: 'An error occurred while adding the email.' };
        }
      };

      export const DeleteDocument = async(id:string)=>{
        try {
                const document = databases.deleteDocument(
                        appwriteconfig.databaseId,
                        appwriteconfig.news_letter_collection_id,
                        id
                      );
                  return document;
                } catch (error) {
                        console.error('Error deleting document:', error);
                        return { success: false, message: 'An error occurred while deleting the document.' };
                        }
                
      }
      
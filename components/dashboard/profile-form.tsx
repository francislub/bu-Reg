"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string(),
  gender: z.string(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  bio: z.string().optional(),
});

export function ProfileForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Masitulah",
      lastName: "Nakafeero",
      email: "masitulah.nakafeero@example.com",
      phone: "+256 123 456 789",
      dateOfBirth: "1998-05-15",
      gender: "female",
      address: "123 Main St",
      city: "Kampala",
      country: "Uganda",
      bio: "Computer Science student at Bugema University",
    },
  });
  
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log(values);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Tabs defaultValue="personal">
      <TabsList className="mb-6">
        <TabsTrigger value="personal">Personal Information</TabsTrigger>
        <TabsTrigger value="academic">Academic Information</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
              <Image 
                src="/placeholder.svg?height=160&width=160" 
                alt="Profile" 
                width={160} 
                height={160}
                className="object-cover"
              />
            </div>
            <Button variant="outline" size="sm" className="mb-2">
              Upload Photo
            </Button>
            <p className="text-xs text-gray-500">
              JPG, GIF or PNG. Max size 2MB
            </p>
          </div>
          
          <div className="md:w-2/3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell us about yourself"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="academic">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Program Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Program:</span>
                  <span className="font-medium">BACHELOR OF BUSINESS COMPUTING</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium">Computer Science</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Admission Year:</span>
                  <span className="font-medium">2021</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expected Graduation:</span>
                  <span className="font-medium">2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Semester:</span>
                  <span className="font-medium">Semester 2 (2023-2024)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Academic Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Credits Completed:</span>
                  <span className="font-medium">72</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Credits Required:</span>
                  <span className="font-medium">120</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CGPA:</span>
                  <span className="font-medium">3.7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic Standing:</span>
                  <span className="font-medium text-green-600">Good Standing</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Current Courses</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap">CSC301</td>
                    <td className="px-4 py-2 whitespace-nowrap">Database Systems</td>
                    <td className="px-4 py-2 whitespace-nowrap">4</td>
                    <td className="px-4 py-2 whitespace-nowrap">Prof. Michael Brown</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Enrolled</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap">BUS202</td>
                    <td className="px-4 py-2 whitespace-nowrap">Business Communication</td>
                    <td className="px-4 py-2 whitespace-nowrap">3</td>
                    <td className="px-4 py-2 whitespace-nowrap">Dr. Sarah Williams</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Enrolled</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap">CSC305</td>
                    <td className="px-4 py-2 whitespace-nowrap">Software Engineering</td>
                    <td className="px-4 py-2 whitespace-nowrap">4</td>
                    <td className="px-4 py-2 whitespace-nowrap">Dr. Robert Johnson</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Enrolled</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Required Documents</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  <div>
                    <p className="font-medium">National ID</p>
                    <p className="text-sm text-gray-500">Identity verification document</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Uploaded</span>
                  <Button variant="ghost" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  <div>
                    <p className="font-medium">High School Transcript</p>
                    <p className="text-sm text-gray-500">Academic records from high school</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Uploaded</span>
                  <Button variant="ghost" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  <div>
                    <p className="font-medium">Birth Certificate</p>
                    <p className="text-sm text-gray-500">Proof of date of birth</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                  <div>
                    <p className="font-medium">Passport Photo</p>
                    <p className="text-sm text-gray-500">Recent passport-sized photograph</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Uploaded</span>
                  <Button variant="ghost" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Upload New Document
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

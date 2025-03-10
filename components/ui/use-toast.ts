import { toast } from "sonner"

export const useToast = () => {
  return {
    toast: ({
      title,
      description,
      variant = "default",
    }: {
      title: string
      description?: string
      variant?: "default" | "destructive"
    }) => {
      if (variant === "destructive") {
        toast.error(title, { description })
      } else {
        toast.success(title, { description })
      }
    },
  }
}
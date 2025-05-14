
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  documentation: z.string().min(1, "Documentation is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskDocumentationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (documentation: string) => void;
  initialTitle?: string;
}

export function TaskDocumentationForm({
  open,
  onOpenChange,
  onSave,
  initialTitle = "",
}: TaskDocumentationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialTitle,
      documentation: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // In a real app, this might involve uploading files or saving documentation
    setTimeout(() => {
      onSave(data.documentation);
      
      toast({
        title: "Documentation Added",
        description: "Task documentation has been added successfully.",
      });
      
      setIsSubmitting(false);
      form.reset();
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Task Documentation</DialogTitle>
          <DialogDescription>
            Provide detailed documentation for this task. This will help the employee understand what needs to be done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="documentation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documentation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed steps, resources, and expectations for this task..."
                      className="h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <FileText className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Documentation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Department, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  experience: z.string().min(1, "Experience is required"),
  skills: z.string().min(1, "Skills are required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PromoteToTeamLeaderDialog({
  open,
  onOpenChange,
  user
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}) {
  const { toast } = useToast();
  const { updateUser } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experience: "",
      skills: user.skills?.join(", ") || "",
      description: user.description || "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Update the user role to TeamLeader
    const updatedUser: User = {
      ...user,
      role: "TeamLeader",
      skills: data.skills.split(",").map(skill => skill.trim()),
      description: data.description,
      experience: parseInt(data.experience),
    };
    
    // This would typically be an API call in a real application
    setTimeout(() => {
      updateUser(updatedUser);
      
      toast({
        title: "Employee Promoted",
        description: `${user.name} has been promoted to Team Leader successfully.`,
      });
      
      setIsSubmitting(false);
      form.reset();
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Promote to Team Leader</DialogTitle>
          <DialogDescription>
            Promote {user.name} to a team leader position. They'll receive an email notification about their promotion.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (years)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Leadership, Communication, Project Management" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about the team leader"
                      className="resize-none"
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
                {isSubmitting ? "Promoting..." : "Promote to Team Leader"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

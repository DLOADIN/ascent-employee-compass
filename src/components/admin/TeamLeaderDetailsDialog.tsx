
import { User } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function TeamLeaderDetailsDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Leader Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about this team leader.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {user.name.split(' ').map(name => name[0]).join('')}
            </div>
          </div>
          
          <h3 className="text-center text-xl font-semibold">{user.name}</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium">Department</div>
            <div className="text-sm">{user.department}</div>
            
            <div className="text-sm font-medium">Email</div>
            <div className="text-sm">{user.email}</div>
            
            <div className="text-sm font-medium">Phone</div>
            <div className="text-sm">{user.phoneNumber || 'Not provided'}</div>
            
            <div className="text-sm font-medium">Skill Level</div>
            <div className="text-sm">
              <Badge variant={
                user.skillLevel === 'Advanced' ? 'default' :
                user.skillLevel === 'Intermediate' ? 'secondary' : 'outline'
              }>
                {user.skillLevel || 'Not specified'}
              </Badge>
            </div>
            
            <div className="text-sm font-medium">Experience</div>
            <div className="text-sm">{user.experience ? `${user.experience} years` : 'Not specified'}</div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill.name}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No skills listed</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {user.description || 'No description available'}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

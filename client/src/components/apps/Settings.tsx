import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </div>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Blur Effects</Label>
              <div className="text-sm text-muted-foreground">
                Enable window blur effects
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">System</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Show system notifications
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <div className="text-sm text-muted-foreground">
                Enable system animations
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
      
      <Button className="w-full">Save Changes</Button>
    </div>
  )
}

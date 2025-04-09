
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { NavLinks } from "@/components/layout/NavLinks"

export function Navbar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Menu className="md:hidden mr-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the application using the links below.
              </SheetDescription>
            </SheetHeader>
            <NavLinks />
          </SheetContent>
        </Sheet>
        <NavLinks />
      </div>
    </div>
  )
}

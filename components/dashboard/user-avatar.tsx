import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { avatarSrc, initials } from "@/lib/avatar"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  user?: { first_name?: string; last_name?: string; avatar_url?: string | null } | null
  // A local preview (object URL) shown instead of the saved avatar.
  src?: string
  className?: string
  fallbackClassName?: string
}

// The user's avatar (T-207), or their initials while it loads, fails or isn't set.
export function UserAvatar({ user, src, className, fallbackClassName }: UserAvatarProps) {
  const image = src ?? avatarSrc(user?.avatar_url)

  return (
    <Avatar className={cn("size-9 cursor-default", className)}>
      {image ? <AvatarImage src={image} alt="" className="object-cover" /> : null}
      <AvatarFallback className={cn("bg-secondary text-[13px] font-bold text-secondary-foreground", fallbackClassName)}>
        {initials(user?.first_name, user?.last_name)}
      </AvatarFallback>
    </Avatar>
  )
}

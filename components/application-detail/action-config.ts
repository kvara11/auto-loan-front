import { Check, CornerUpLeft, Send, X } from "lucide-react"

import { type ApplicationAction } from "@/components/applications/applications-types"

type ActionConfig = {
  label: string
  icon: typeof Check
  variant: "default" | "outline" | "destructive"
  title: string
  description: string
  // Return and reject need a comment (the backend rejects an empty one with 424).
  commentLabel?: string
}

export const ACTIONS: Record<ApplicationAction, ActionConfig> = {
  submit: {
    label: "რისკებში გაგზავნა",
    icon: Send,
    variant: "default",
    title: "განაცხადის გაგზავნა რისკებში",
    description: "გაგზავნის შემდეგ განაცხადს რისკების განყოფილება განიხილავს.",
  },
  return: {
    label: "დაბრუნება",
    icon: CornerUpLeft,
    variant: "outline",
    title: "განაცხადის დაბრუნება ოფიცერთან",
    description: "ოფიცერი დაინახავს თქვენს შენიშვნას და გამოსწორების შემდეგ ხელახლა გამოგზავნის.",
    commentLabel: "რა უნდა გამოსწორდეს",
  },
  reject: {
    label: "უარყოფა",
    icon: X,
    variant: "destructive",
    title: "განაცხადის უარყოფა",
    description: "უარყოფილი განაცხადი აღარ განიხილება.",
    commentLabel: "უარის მიზეზი",
  },
  approve: {
    label: "დამტკიცება",
    icon: Check,
    variant: "default",
    title: "განაცხადის დამტკიცება",
    description: "დაადასტურეთ, რომ განაცხადი მტკიცდება მოთხოვნილი პირობებით.",
  },
}

// Button order in the header: the positive action last (rightmost).
export const ACTION_ORDER: ApplicationAction[] = ["return", "reject", "approve", "submit"]
